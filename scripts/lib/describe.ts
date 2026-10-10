const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&quot;": '"',
  "&#39;": "'",
  "&#x27;": "'",
  "&lt;": "<",
  "&gt;": ">",
};

// Turns a scraped meta description into one clean sentence: decodes common
// entities, drops emoji, collapses whitespace, keeps the first sentence.
export function summarize(raw: string): string {
  const text = raw
    .replace(
      /&(amp|quot|lt|gt|#39|#x27);/g,
      (entity) => ENTITIES[entity] ?? entity,
    )
    .replace(/\p{Extended_Pictographic}|\u200d|\ufe0f/gu, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return "";
  const sentence = text.match(/^.+?[.!?](?=\s|$)/)?.[0] ?? text;
  const capitalized = sentence.charAt(0).toUpperCase() + sentence.slice(1);
  return /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`;
}
