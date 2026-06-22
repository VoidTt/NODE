export function normalizeText(text) {
  return String(text)
    .toLowerCase()
    .replace(/\s+/g, "");
}

export function checkPalindrome(text) {
  const normalized = normalizeText(text);
  const reversed = normalized.split("").reverse().join("");
  return normalized === reversed;
}

export function reverseText(text) {
  return String(text).split("").reverse().join("");
}

export function getTextStats(text) {
  const raw = String(text);
  const words = raw.trim() ? raw.trim().split(/\s+/).length : 0;

  return {
    chars: raw.length,
    words,
    withoutSpaces: raw.replace(/\s+/g, "").length
  };
}