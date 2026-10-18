import test from "node:test";
import assert from "node:assert/strict";
import { splitThread } from "../utils/twitter.ts";

test("preserves every generated message, including more than four posts", () => {
  const messages = Array.from(
    { length: 6 },
    (_, i) => `Post ${i + 1}\n\nWith a paragraph.`,
  );
  assert.deepEqual(splitThread(messages.join("\n\n---\n\n")), messages);
});
test("handles empty input and Windows delimiters", () => {
  assert.deepEqual(splitThread("  "), []);
  assert.deepEqual(splitThread("first\r\n\r\n---\r\n\r\nsecond"), [
    "first",
    "second",
  ]);
});
test("keeps short posts and explicitly delimited posts intact", () => {
  assert.deepEqual(splitThread("Hello\n\nworld!"), ["Hello\n\nworld!"]);
  assert.deepEqual(splitThread("a".repeat(300) + "\n---\nsecond"), [
    "a".repeat(300),
    "second",
  ]);
});
test("splits legacy text without losing words or truncating the thread", () => {
  const input = Array.from({ length: 700 }, (_, i) => `word${i}`).join(" ");
  const posts = splitThread(input);
  assert.ok(posts.length > 4);
  assert.ok(posts.every((post) => Array.from(post).length <= 280));
  assert.equal(posts.join(" "), input);
});
test("handles long tokens and unicode without broken surrogate pairs", () => {
  const input = "🚀".repeat(600);
  const posts = splitThread(input);
  assert.equal(posts.join(""), input);
  assert.ok(posts.every((post) => Array.from(post).length <= 280));
});
