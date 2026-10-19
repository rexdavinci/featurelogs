import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { PgDialect } from "drizzle-orm/pg-core";
import {
  createPasswordResetService,
  hashResetToken,
  RESET_TTL_MS,
  RESET_COOLDOWN_MS,
} from "../lib/auth/password-reset.ts";
import {
  hashPassword,
  verifyPassword,
  validatePasswordConfirmation,
} from "../lib/auth/password.ts";
import { createEmailAdapter } from "../lib/email/server.ts";

const senderConfig = {
  provider: "resend",
  apiKey: "test-key",
  from: "FeatureLogs <hello@example.com>",
  implemented: true,
};

test("confirmation is required on the server and password hashes remain compatible", () => {
  for (const confirmation of [undefined, "", "different"])
    assert.throws(
      () => validatePasswordConfirmation("correct-password", confirmation),
      /match/,
    );
  assert.throws(
    () => validatePasswordConfirmation("short", "short"),
    /6 characters/,
  );
  assert.throws(
    () => validatePasswordConfirmation("a".repeat(1025), "a".repeat(1025)),
    /too long/,
  );
  validatePasswordConfirmation("correct-password", "correct-password");
  const stored = hashPassword("correct-password");
  assert.equal(verifyPassword("correct-password", stored), true);
  assert.equal(verifyPassword("wrong-password", stored), false);
});

test("Resend adapter validates configuration and normalizes delivery results/errors", async () => {
  assert.throws(
    () => createEmailAdapter({ ...senderConfig, apiKey: undefined }),
    /RESEND_API_KEY/,
  );
  assert.throws(
    () => createEmailAdapter({ ...senderConfig, from: undefined }),
    /EMAIL_FROM/,
  );
  assert.throws(
    () => createEmailAdapter({ ...senderConfig, provider: "smtp" }),
    /not implemented/,
  );
  const originalFetch = globalThis.fetch;
  try {
    const adapter = createEmailAdapter(senderConfig);
    globalThis.fetch = async (_url, request) => {
      assert.deepEqual(JSON.parse(request.body), {
        from: senderConfig.from,
        to: "person@example.com",
        subject: "Reset",
        text: "Example message",
      });
      return Response.json({ id: "email-123" });
    };
    assert.deepEqual(
      await adapter.send({
        to: "person@example.com",
        subject: "Reset",
        text: "Example message",
      }),
      { id: "email-123" },
    );
    globalThis.fetch = async () =>
      Response.json(
        { name: "validation_error", message: "private provider detail" },
        { status: 422 },
      );
    await assert.rejects(
      adapter.send({
        to: "person@example.com",
        subject: "Reset",
        text: "Example message",
      }),
      /Email delivery failed/,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("password reset SQL works against isolated Postgres, without real accounts or emails", async (t) => {
  const pg = new PGlite();
  const dialect = new PgDialect();
  const database = () => ({
    execute: async (statement) => {
      const query = dialect.sqlToQuery(statement);
      return pg.query(query.sql, query.params);
    },
  });
  await pg.exec(
    await readFile(
      new URL(
        "../drizzle/20261018175027_small_micromax/migration.sql",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  await pg.exec(
    await readFile(
      new URL(
        "../drizzle/20261019171039_mighty_silver_fox/migration.sql",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  let clock = Date.parse("2026-10-19T12:00:00.000Z");
  let messages = [];
  let failDelivery = false;
  const service = createPasswordResetService({
    database,
    siteUrl: "https://featurelogs.example",
    now: () => clock,
    email: () => ({
      send: async (message) => {
        if (failDelivery) throw new Error("private mail error");
        messages.push(message);
        return { id: "email-id" };
      },
    }),
  });
  const tokenFrom = (message) => {
    const url = new URL(message.text.match(/https:\/\/\S+/)[0]);
    assert.equal(url.origin, "https://featurelogs.example");
    assert.equal(url.pathname, "/reset-password");
    assert.equal(url.search, "");
    return new URLSearchParams(url.hash.slice(1)).get("token");
  };
  async function fixture() {
    await pg.exec("TRUNCATE auth_password_resets, auth_sessions, auth_users");
    messages = [];
    failDelivery = false;
    await pg.query("INSERT INTO auth_users VALUES ($1,$2,$2,$3,$4,$4)", [
      "user-1",
      "person@example.com",
      hashPassword("old-password"),
      new Date(clock).toISOString(),
    ]);
    await pg.query(
      "INSERT INTO auth_sessions VALUES ('s1','user-1','session-1','2099-01-01','2026-01-01'), ('s2','other-user','session-2','2099-01-01','2026-01-01')",
    );
  }
  try {
    await t.test(
      "request normalizes email, stores only a hash and suppresses rapid duplicate sends",
      async () => {
        await fixture();
        await service.requestPasswordReset(" Person@Example.com ");
        assert.equal(messages.length, 1);
        assert.equal(messages[0].to, "person@example.com");
        const token = tokenFrom(messages[0]);
        const {
          rows: [row],
        } = await pg.query("SELECT * FROM auth_password_resets");
        assert.equal(row.token_hash, hashResetToken(token));
        assert.notEqual(row.token_hash, token);
        assert.equal(Date.parse(row.expires_at) - clock, RESET_TTL_MS);
        await Promise.all([
          service.requestPasswordReset("person@example.com"),
          service.requestPasswordReset("person@example.com"),
        ]);
        assert.equal(messages.length, 1);
      },
    );
    await t.test(
      "unknown addresses return normally without sending or exposing account existence",
      async () => {
        await fixture();
        assert.equal(
          await service.requestPasswordReset("unknown@example.com"),
          undefined,
        );
        assert.equal(messages.length, 0);
        assert.equal(
          (await pg.query("SELECT user_id FROM auth_password_resets")).rows[0]
            .user_id,
          null,
        );
        await assert.rejects(
          service.requestPasswordReset("invalid-email"),
          /valid email/,
        );
      },
    );
    await t.test(
      "single use changes the password and revokes only the user's sessions",
      async () => {
        await fixture();
        await service.requestPasswordReset("person@example.com");
        const token = tokenFrom(messages[0]);
        const results = await Promise.allSettled([
          service.resetPassword(token, "new-password"),
          service.resetPassword(token, "other-password"),
        ]);
        assert.equal(
          results.filter((result) => result.status === "fulfilled").length,
          1,
        );
        const stored = (await pg.query("SELECT password_hash FROM auth_users"))
          .rows[0].password_hash;
        assert.equal(verifyPassword("old-password", stored), false);
        assert.equal(verifyPassword("new-password", stored), true);
        assert.deepEqual(
          (await pg.query("SELECT id FROM auth_sessions")).rows,
          [{ id: "s2" }],
        );
        await assert.rejects(
          service.resetPassword(token, "another-password"),
          /invalid or has expired/,
        );
      },
    );
    await t.test(
      "expired, malformed and replaced links cannot change a password",
      async () => {
        await fixture();
        await service.requestPasswordReset("person@example.com");
        const oldToken = tokenFrom(messages[0]);
        clock += RESET_COOLDOWN_MS + 1;
        await service.requestPasswordReset("person@example.com");
        await assert.rejects(
          service.resetPassword(oldToken, "new-password"),
          /invalid or has expired/,
        );
        const token = tokenFrom(messages[1]);
        await assert.rejects(
          service.resetPassword("malformed", "new-password"),
          /invalid or has expired/,
        );
        await assert.rejects(
          service.resetPassword(token, "short"),
          /6 characters/,
        );
        clock += RESET_TTL_MS;
        await assert.rejects(
          service.resetPassword(token, "new-password"),
          /invalid or has expired/,
        );
        assert.equal(
          verifyPassword(
            "old-password",
            (await pg.query("SELECT password_hash FROM auth_users")).rows[0]
              .password_hash,
          ),
          true,
        );
      },
    );
    await t.test(
      "email failure invalidates the undelivered link and permits immediate retry",
      async () => {
        await fixture();
        failDelivery = true;
        await assert.rejects(
          service.requestPasswordReset("person@example.com"),
          /email delivery failed/,
        );
        assert.equal(
          (await pg.query("SELECT * FROM auth_password_resets")).rows.length,
          0,
        );
        failDelivery = false;
        await service.requestPasswordReset("person@example.com");
        assert.equal(messages.length, 1);
      },
    );
  } finally {
    await pg.close();
  }
});
