import test from "node:test";
import assert from "node:assert/strict";
import { parseEnv } from "../lib/config/env.ts";

test("configuration defaults to offline drafts and preserves existing database/auth defaults", () => {
  const config = parseEnv({});
  assert.equal(config.ai.provider, "mock");
  assert.equal(config.database.provider, "firestore");
  assert.equal(config.auth.provider, "neon");
  assert.equal(config.email.provider, "none");
  assert.equal(config.email.implemented, false);
});
test("explicit AI selection uses only the matching credentials and a provider-specific model", () => {
  const keys = {
    OPENAI_API_KEY: "openai-test",
    OPENROUTER_API_KEY: "router-test",
    GEMINI_API_KEY: "gemini-test",
  };
  for (const [provider, key, model] of [
    ["openai", "openai-test", "gpt-4.1-mini"],
    ["openrouter", "router-test", "openai/gpt-4.1-mini"],
    ["gemini", "gemini-test", "gemini-2.5-flash"],
  ]) {
    assert.deepEqual(parseEnv({ ...keys, AI_PROVIDER: provider }).ai, {
      provider,
      apiKey: key,
      model,
    });
  }
  assert.equal(
    parseEnv({ AI_PROVIDER: "openrouter", OPENAI_API_KEY: "wrong-provider" }).ai
      .apiKey,
    undefined,
  );
});
test("legacy OpenRouter key and model remain supported only without explicit selection", () => {
  assert.equal(
    parseEnv({ OPENAI_API_KEY: "legacy", OPENAI_MODEL: "legacy-model" }).ai
      .apiKey,
    "legacy",
  );
  assert.equal(
    parseEnv({ OPENAI_API_KEY: "legacy", OPENAI_MODEL: "legacy-model" }).ai
      .model,
    "legacy-model",
  );
  assert.equal(
    parseEnv({ AI_PROVIDER: "openai", OPENAI_MODEL: "legacy-model" }).ai.model,
    "gpt-4.1-mini",
  );
  assert.equal(parseEnv({ AI_MODEL: "custom" }).ai.model, "custom");
});
test("configuration normalizes selections and Firebase aliases without exposing invalid values", () => {
  const config = parseEnv({
    DB_PROVIDER: " NEON ",
    AUTH_PROVIDER: " Firebase ",
    EMAIL_PROVIDER: " Resend ",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: "legacy-project",
    FIREBASE_SERVICE_KEY: "first\\nsecond",
    SITE_URL: "example.com/",
  });
  assert.equal(config.database.provider, "neon");
  assert.equal(config.auth.provider, "firebase");
  assert.equal(config.email.provider, "resend");
  assert.equal(config.firebase.projectId, "legacy-project");
  assert.equal(config.firebase.privateKey, "first\nsecond");
  assert.equal(config.site.url, "https://example.com");
  for (const name of [
    "AI_PROVIDER",
    "DB_PROVIDER",
    "AUTH_PROVIDER",
    "EMAIL_PROVIDER",
  ])
    assert.throws(
      () => parseEnv({ [name]: "secret-invalid-value" }),
      (error) => !error.message.includes("secret-invalid-value"),
    );
  assert.throws(() =>
    parseEnv({ SITE_URL: "https://user:secret@example.com" }),
  );
  assert.throws(() => parseEnv({ SITE_URL: "ftp://example.com" }));
});
test("configuration is immutable, including nested settings", () => {
  const config = parseEnv({});
  assert.throws(() => {
    config.ai.provider = "openai";
  }, TypeError);
  assert.throws(() => {
    config.database = {};
  }, TypeError);
});
