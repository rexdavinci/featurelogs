import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { sql } from "drizzle-orm";
import { createPasswordResetService } from "../lib/auth/password-reset.ts";
import { verifyPassword } from "../lib/auth/password.ts";
import { exportNeonAccount, deleteNeonAccount } from "../lib/account/neon.ts";

// Real PostgreSQL policies and transactions in an isolated database, never live accounts.
test("RLS, export, and deletion preserve tenant boundaries", async (t) => {
  const pg = new PGlite();
  const db = drizzle({ client: pg });
  const paths = (await readdir(new URL("../drizzle/", import.meta.url))).sort();
  for (const path of paths) {
    const source = await readFile(
      new URL(`../drizzle/${path}/migration.sql`, import.meta.url),
      "utf8",
    );
    await pg.exec(source);
  }
  const now = new Date().toISOString();
  const future = "2099-01-01T00:00:00.000Z";
  async function seed() {
    await pg.exec(
      "TRUNCATE auth_password_resets, auth_sessions, auth_users, projects, profiles, logs, style_templates, usage_events CASCADE",
    );
    for (const uid of ["alice", "bob"]) {
      await pg.query(
        "INSERT INTO auth_users VALUES ($1,$2,$2,'sensitive-password-hash',$3,$3)",
        [uid, `${uid}@example.com`, now],
      );
      await pg.query("INSERT INTO projects VALUES ($1,$2,$3,$3,$4,$4)", [
        `project-${uid}`,
        uid,
        `${uid}'s product`,
        now,
      ]);
      await pg.query(
        "INSERT INTO logs VALUES ($1,$2,$3,$4,'private notes','changelog','thread','linkedin','faq','newsletter',NULL,$5)",
        [`log-${uid}`, uid, `project-${uid}`, `${uid}'s product`, now],
      );
      await pg.query("INSERT INTO profiles VALUES ($1,$2,'[]',$3,$3)", [
        uid,
        `${uid}@example.com`,
        now,
      ]);
      await pg.query("INSERT INTO style_templates VALUES ($1,$2,'{}',$3)", [
        uid,
        `project-${uid}`,
        now,
      ]);
      await pg.query(
        "INSERT INTO usage_events VALUES ($1,$2,'save_log','{}',$3)",
        [`usage-${uid}`, uid, now],
      );
      await pg.query("INSERT INTO auth_sessions VALUES ($1,$2,$3,$4,$5)", [
        `session-${uid}`,
        uid,
        `sensitive-session-${uid}`,
        future,
        now,
      ]);
      await pg.query(
        "INSERT INTO auth_password_resets VALUES ($1,$2,$3,$4,$5)",
        [`${uid}@example.com`, uid, `sensitive-reset-${uid}`, future, now],
      );
    }
  }
  const asUser = (uid, work) =>
    db.transaction(async (tx) => {
      await tx.execute(sql`SET LOCAL ROLE featurelogs_app`);
      await tx.execute(sql`SELECT set_config('app.user_id', ${uid}, true)`);
      return work(tx);
    });
  try {
    await seed();
    await t.test(
      "all eight application tables enforce RLS, including forced owner policies",
      async () => {
        const { rows } = await pg.query(
          "SELECT relname, relrowsecurity, relforcerowsecurity FROM pg_class WHERE relname IN ('projects','logs','profiles','style_templates','usage_events','auth_users','auth_sessions','auth_password_resets')",
        );
        assert.equal(rows.length, 8);
        assert.equal(
          rows.every((row) => row.relrowsecurity && row.relforcerowsecurity),
          true,
        );
      },
    );
    await t.test(
      "queries missing WHERE still cannot read or delete another user's rows",
      async () => {
        for (const table of [
          "projects",
          "logs",
          "profiles",
          "style_templates",
          "usage_events",
        ]) {
          const result = await asUser("alice", (tx) =>
            tx.execute(sql.raw(`SELECT * FROM ${table}`)),
          );
          assert.equal(result.rows.length, 1);
          assert.equal(result.rows[0].user_id ?? result.rows[0].uid, "alice");
        }
        assert.equal(
          (
            await asUser("alice", (tx) =>
              tx.execute(
                sql`DELETE FROM projects WHERE user_id = 'bob' RETURNING id`,
              ),
            )
          ).rows.length,
          0,
        );
        assert.equal(
          (await asUser("", (tx) => tx.execute(sql`SELECT * FROM logs`))).rows
            .length,
          0,
        );
        assert.equal(
          (await asUser("bob", (tx) => tx.execute(sql`SELECT * FROM logs`)))
            .rows[0].user_id,
          "bob",
        );
      },
    );
    await t.test(
      "forged owner IDs and another user's project cannot be written",
      async () => {
        await assert.rejects(
          asUser("alice", (tx) =>
            tx.execute(
              sql`INSERT INTO projects VALUES ('forged','bob','name','name',${now},${now})`,
            ),
          ),
          (error) => error.cause?.code === "42501",
        );
        await assert.rejects(
          asUser("alice", (tx) =>
            tx.execute(
              sql`UPDATE projects SET user_id = 'bob' WHERE id = 'project-alice'`,
            ),
          ),
          (error) => error.cause?.code === "42501",
        );
        await assert.rejects(
          asUser("alice", (tx) =>
            tx.execute(
              sql`INSERT INTO style_templates VALUES ('alice','project-bob','{}',${now})`,
            ),
          ),
          (error) => error.cause?.code === "42501",
        );
        await assert.rejects(
          asUser("alice", (tx) =>
            tx.execute(
              sql`INSERT INTO logs VALUES ('forged','alice','project-bob','Bob','input','changelog','x','linkedin','faq','email',NULL,${now})`,
            ),
          ),
          (error) => error.cause?.code === "42501",
        );
      },
    );
    await t.test(
      "workspace role cannot read security hashes or truncate tables",
      async () => {
        await assert.rejects(
          asUser("alice", (tx) =>
            tx.execute(sql`SELECT password_hash FROM auth_users`),
          ),
          (error) => error.cause?.code === "42501",
        );
        await assert.rejects(
          asUser("alice", (tx) =>
            tx.execute(sql`SELECT token_hash FROM auth_sessions`),
          ),
          (error) => error.cause?.code === "42501",
        );
        await assert.rejects(
          asUser("alice", (tx) =>
            tx.execute(sql`SELECT token_hash FROM auth_password_resets`),
          ),
          (error) => error.cause?.code === "42501",
        );
        await assert.rejects(
          asUser("alice", (tx) => tx.execute(sql`TRUNCATE logs`)),
          (error) => error.cause?.code === "42501",
        );
        await assert.rejects(
          db.transaction(async (tx) => {
            await tx.execute(sql`SET LOCAL ROLE featurelogs_auth`);
            return tx.execute(sql`SELECT * FROM logs`);
          }),
          (error) => error.cause?.code === "42501",
        );
      },
    );
    await t.test(
      "public ranking exposes only its existing aggregate, not private drafts",
      async () => {
        const result = await asUser("", (tx) =>
          tx.execute(sql`SELECT * FROM public.featurelogs_public_ranking()`),
        );
        assert.equal(result.rows.length, 2);
        assert.deepEqual(Object.keys(result.rows[0]).sort(), [
          "count",
          "project_id",
          "project_name",
        ]);
      },
    );
    await t.test(
      "export contains every owned category, with no credentials or other users",
      async () => {
        const exported = await asUser("alice", (tx) =>
          exportNeonAccount(tx, "alice"),
        );
        assert.equal(exported.account.id, "alice");
        for (const key of [
          "profiles",
          "projects",
          "logs",
          "styleTemplates",
          "usageEvents",
          "sessions",
          "passwordResetRequests",
        ])
          assert.equal(exported[key].length, 1);
        const json = JSON.stringify(exported);
        assert.equal(json.includes("sensitive-"), false);
        assert.equal(json.includes("bob"), false);
        assert.equal(
          (await asUser("alice", (tx) => exportNeonAccount(tx, "bob"))).account,
          null,
        );
      },
    );
    await t.test("failed deletion rolls back every category", async () => {
      await assert.rejects(
        asUser("alice", async (tx) => {
          await deleteNeonAccount(tx, "alice");
          throw new Error("injected failure");
        }),
      );
      assert.equal(
        (await pg.query("SELECT * FROM auth_users WHERE id='alice'")).rows
          .length,
        1,
      );
      assert.equal(
        (await pg.query("SELECT * FROM logs WHERE user_id='alice'")).rows
          .length,
        1,
      );
      assert.equal(
        (await pg.query("SELECT * FROM auth_sessions WHERE user_id='alice'"))
          .rows.length,
        1,
      );
    });
    await t.test(
      "deletion removes all eight categories and leaves another user intact",
      async () => {
        await asUser("alice", (tx) => deleteNeonAccount(tx, "alice"));
        for (const table of [
          "projects",
          "logs",
          "profiles",
          "style_templates",
          "usage_events",
          "auth_users",
          "auth_sessions",
          "auth_password_resets",
        ]) {
          const { rows } = await pg.query(`SELECT * FROM ${table}`);
          assert.equal(rows.length, 1, table);
          assert.equal(
            rows[0].uid ??
              (table === "auth_users" ? rows[0].id : rows[0].user_id),
            "bob",
            table,
          );
        }
      },
    );
    await t.test(
      "pre-signup reset metadata with a null user ID is included and erased by email",
      async () => {
        await seed();
        await pg.query(
          "UPDATE auth_password_resets SET user_id = NULL WHERE email_normalized='alice@example.com'",
        );
        assert.equal(
          (await asUser("alice", (tx) => exportNeonAccount(tx, "alice")))
            .passwordResetRequests.length,
          1,
        );
        await asUser("alice", (tx) => deleteNeonAccount(tx, "alice"));
        assert.equal(
          (
            await pg.query(
              "SELECT * FROM auth_password_resets WHERE email_normalized='alice@example.com'",
            )
          ).rows.length,
          0,
        );
      },
    );
    await t.test(
      "password reset still works under the auth-only role with RLS enabled",
      async () => {
        await seed();
        await pg.query(
          "DELETE FROM auth_password_resets WHERE email_normalized='alice@example.com'",
        );
        let message;
        const service = createPasswordResetService({
          database: () => ({
            execute: (query) =>
              db.transaction(async (tx) => {
                await tx.execute(sql`SET LOCAL ROLE featurelogs_auth`);
                return tx.execute(query);
              }),
          }),
          email: () => ({
            send: async (value) => {
              message = value;
              return { id: "test" };
            },
          }),
          siteUrl: "https://featurelogs.example",
        });
        await service.requestPasswordReset("alice@example.com");
        const url = new URL(message.text.match(/https:\/\/\S+/)[0]);
        const token = new URLSearchParams(url.hash.slice(1)).get("token");
        await service.resetPassword(token, "new-test-password");
        const stored = (
          await pg.query(
            "SELECT password_hash FROM auth_users WHERE id='alice'",
          )
        ).rows[0].password_hash;
        assert.equal(verifyPassword("new-test-password", stored), true);
        assert.equal(
          (await pg.query("SELECT * FROM auth_sessions WHERE user_id='alice'"))
            .rows.length,
          0,
        );
        assert.equal(
          (await pg.query("SELECT * FROM auth_sessions WHERE user_id='bob'"))
            .rows.length,
          1,
        );
      },
    );
  } finally {
    await pg.close();
  }
});
