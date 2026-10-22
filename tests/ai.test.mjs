import test from "node:test";
import assert from "node:assert/strict";
import { createAiService } from "../lib/ai/service.ts";
import { normalizeKitResponse, normalizeUsage } from "../lib/ai/normalize.ts";
import { createMockAdapter } from "../lib/ai/adapters/mock.ts";
import { DEFAULT_STYLE_TEMPLATES } from "../utils/style-templates.ts";

const input = {
  projectName: "Test product",
  rawInput: "Added a new collection",
  templates: DEFAULT_STYLE_TEMPLATES,
};
const kit = {
  changelog: "  Update  ",
  twitterMessages: Array.from({ length: 6 }, (_, i) => ` Post ${i + 1} `),
  linkedin: "LinkedIn",
  helpFaq: "FAQ",
  emailNewsletter: "Email",
};
const expectedKit = {
  ...kit,
  changelog: "Update",
  twitterMessages: kit.twitterMessages.map((item) => item.trim()),
};

test("every provider produces the same normalized workflow envelope", async () => {
  for (const provider of ["openai", "openrouter", "gemini"]) {
    let request;
    const service = createAiService({
      async generate(value) {
        request = value;
        return {
          text: `\n\`\`\`json\n${JSON.stringify(kit)}\n\`\`\``,
          provider,
          model: "test-model",
          usage: { inputTokens: 12, outputTokens: 42 },
        };
      },
    });
    assert.deepEqual(await service.generateContent(input), {
      data: expectedKit,
      provider,
      model: "test-model",
      usage: { inputTokens: 12, outputTokens: 42 },
    });
    assert.equal(request.task, "kit");
    assert.equal(request.format, "json");
    assert.match(request.prompt, /Test product/);
  }
});
test("malformed, incomplete, and non-string kit fields are rejected instead of saved", () => {
  for (const payload of [
    null,
    [],
    {},
    { ...kit, changelog: {} },
    { ...kit, emailNewsletter: 42 },
    { ...kit, linkedin: " " },
    { ...kit, twitterMessages: [] },
    { ...kit, twitterMessages: ["valid", {}] },
    { ...kit, twitterMessages: [" "] },
  ]) {
    assert.throws(
      () => normalizeKitResponse(JSON.stringify(payload)),
      (error) => error.name === "AiError" && error.code === "invalid_response",
    );
  }
  assert.throws(() => normalizeKitResponse("not JSON"), {
    name: "AiError",
    code: "invalid_response",
  });
});
test("normalizes JSON wrapped in provider preambles or code fences", () => {
  const kit = {
    changelog: "Update",
    twitterMessages: ["One"],
    linkedin: "LinkedIn",
    helpFaq: "FAQ",
    emailNewsletter: "Email",
  };
  const payload = JSON.stringify(kit);
  assert.deepEqual(normalizeKitResponse(`Here is your kit:\n${payload}`), kit);
  assert.deepEqual(normalizeKitResponse("```json\n" + payload + "\n```"), kit);
  assert.deepEqual(
    normalizeKitResponse(payload.replace('"One"]', '"One",]')),
    kit,
  );
});
test("unknown token counts remain unknown and invalid counts are not fabricated", () => {
  assert.deepEqual(normalizeUsage(), { inputTokens: null, outputTokens: null });
  assert.deepEqual(normalizeUsage(NaN, -2), {
    inputTokens: null,
    outputTokens: null,
  });
  assert.deepEqual(normalizeUsage(12, 30), {
    inputTokens: 12,
    outputTokens: 30,
  });
});
test("provider failures use a safe typed error and do not become fake successful drafts", async () => {
  const service = createAiService({
    async generate() {
      throw new Error("secret-token-with-private-prompt");
    },
  });
  await assert.rejects(
    service.generateContent(input),
    (error) =>
      error.name === "AiError" &&
      error.code === "provider_error" &&
      !error.message.includes("secret"),
  );
});
test("monthly newsletters use the same envelope and reject empty provider output", async () => {
  const monthlyInput = {
    changelogEntries: ["First update"],
    templates: DEFAULT_STYLE_TEMPLATES,
  };
  const service = createAiService({
    async generate(request) {
      assert.equal(request.task, "monthly");
      assert.equal(request.format, "text");
      return {
        text: "  Monthly recap  ",
        provider: "openai",
        model: "test",
        usage: normalizeUsage(),
      };
    },
  });
  assert.equal(
    (await service.generateMonthlyNewsletter(monthlyInput)).data,
    "Monthly recap",
  );
  const empty = createAiService({
    async generate() {
      return {
        text: " ",
        provider: "openai",
        model: "test",
        usage: normalizeUsage(),
      };
    },
  });
  await assert.rejects(
    empty.generateMonthlyNewsletter(monthlyInput),
    (error) => error.code === "invalid_response",
  );
});
test("offline provider follows both production contracts without API credentials", async () => {
  const service = createAiService(createMockAdapter());
  const result = await service.generateContent(input);
  assert.equal(result.provider, "mock");
  assert.match(result.data.changelog, /new collection/);
  assert.equal(typeof result.data.emailNewsletter, "string");
  assert.equal(
    (
      await service.generateMonthlyNewsletter({
        changelogEntries: ["Course released"],
        templates: DEFAULT_STYLE_TEMPLATES,
      })
    ).provider,
    "mock",
  );
});

test("workflow envelope excludes provider-specific extras", async () => {
  const service = createAiService({
    async generate() {
      return {
        text: JSON.stringify(kit),
        provider: "openai",
        model: "test",
        usage: { inputTokens: null, outputTokens: null },
        rawSdkResponse: { private: true },
        requestId: "vendor-specific",
      };
    },
  });
  const result = await service.generateContent(input);
  assert.deepEqual(Object.keys(result).sort(), [
    "data",
    "model",
    "provider",
    "usage",
  ]);
});
