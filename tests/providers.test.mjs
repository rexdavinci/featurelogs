import test from "node:test";
import assert from "node:assert/strict";

// Isolated process: no actual .env.local is loaded or network requests are sent.
process.env.DB_PROVIDER = "neon";
process.env.AUTH_PROVIDER = "neon";
delete process.env.FIREBASE_SERVICE_KEY;
delete process.env.FIREBASE_PROJECT_ID;
delete process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const { env } = await import("../.env.ts");
const { createAiAdapter } = await import("../lib/ai/provider.ts");

test("environment snapshot is cached until the process restarts", async () => {
  process.env.DB_PROVIDER = "firestore";
  assert.equal((await import("../.env.ts")).env, env);
  assert.equal(env.database.provider, "neon");
});
test("all configured AI providers can be constructed and missing credentials fail clearly", async () => {
  for (const provider of ["openai", "openrouter", "gemini"]) {
    await assert.rejects(
      createAiAdapter({ provider, model: "test", apiKey: undefined }),
      (error) => error.code === "configuration",
    );
    const adapter = await createAiAdapter({
      provider,
      model: "test",
      apiKey: "test-key-not-sent",
    });
    assert.equal(typeof adapter.generate, "function");
  }
  assert.equal(
    typeof (
      await createAiAdapter({ provider: "mock", model: "local-template" })
    ).generate,
    "function",
  );
});
test("Neon database and auth load without importing Firebase or requiring its credentials", async () => {
  const { getServerDatabaseAdapter } = await import("../lib/db/server.ts");
  const { getAuthAdapter, supportsPasswordAuth } = await import(
    "../lib/auth/server.ts"
  );
  assert.equal(typeof (await getServerDatabaseAdapter()).saveLog, "function");
  assert.equal((await getAuthAdapter()).supportsPasswordAuth, true);
  assert.equal(supportsPasswordAuth, true);
});

test("provider SDK responses normalize into identical kits and token metadata", async () => {
  const { createAiService } = await import("../lib/ai/service.ts");
  const { DEFAULT_STYLE_TEMPLATES } = await import(
    "../utils/style-templates.ts"
  );
  const kit = {
    changelog: "Product update",
    twitterMessages: ["First post", "Second post"],
    linkedin: "LinkedIn draft",
    helpFaq: "FAQ draft",
    emailNewsletter: "Email draft",
  };
  const originalFetch = globalThis.fetch;
  try {
    for (const provider of ["openai", "openrouter", "gemini"]) {
      let calls = 0;
      globalThis.fetch = async () => {
        calls++;
        const body =
          provider === "gemini"
            ? {
                candidates: [
                  {
                    content: {
                      role: "model",
                      parts: [{ text: JSON.stringify(kit) }],
                    },
                    finishReason: "STOP",
                  },
                ],
                usageMetadata: {
                  promptTokenCount: 21,
                  candidatesTokenCount: 34,
                  totalTokenCount: 55,
                },
              }
            : {
                id: "test-completion",
                object: "chat.completion",
                created: 1,
                model: "test",
                choices: [
                  {
                    index: 0,
                    finish_reason: "stop",
                    message: {
                      role: "assistant",
                      content: JSON.stringify(kit),
                    },
                  },
                ],
                usage: {
                  prompt_tokens: 21,
                  completion_tokens: 34,
                  total_tokens: 55,
                },
              };
        return new Response(JSON.stringify(body), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      };
      const adapter = await createAiAdapter({
        provider,
        apiKey: "offline-test-key",
        model: "test",
      });
      const result = await createAiService(adapter).generateContent({
        projectName: "Sample",
        rawInput: "Update",
        templates: DEFAULT_STYLE_TEMPLATES,
      });
      assert.equal(calls, 1);
      assert.deepEqual(result, {
        data: kit,
        provider,
        model: "test",
        usage: { inputTokens: 21, outputTokens: 34 },
      });
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});
