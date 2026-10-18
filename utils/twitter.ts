/** Preserve generated post boundaries; split legacy unstructured text without dropping posts. */
export function splitThread(input: string): string[] {
  const normalized = input.replace(/\r\n?/g, "\n").trim();
  if (!normalized) return [];

  const blocks = normalized
    .split(/\n[\t ]*---+[\t ]*\n/)
    .map((block) => block.trim())
    .filter(Boolean);
  if (blocks.length > 1) return blocks;

  const numbered = normalized
    .split(/\n(?=(?:Tweet|Post)\s+\d+\s*[:.)])/i)
    .map((block) => block.trim())
    .filter(Boolean);
  if (numbered.length > 1) return numbered;
  if (Array.from(normalized).length <= 280) return [normalized];

  const posts: string[] = [];
  let current = "";
  for (const token of normalized.match(/\S+\s*/gu) ?? []) {
    if (Array.from(current + token.trimEnd()).length > 280 && current.trim()) {
      posts.push(current.trim());
      current = "";
    }
    const characters = Array.from(token);
    while (characters.length > 280) {
      posts.push(characters.splice(0, 280).join(""));
    }
    current += characters.join("");
  }
  if (current.trim()) posts.push(current.trim());
  return posts;
}
