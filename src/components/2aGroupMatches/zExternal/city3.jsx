export function city3(city) {
  const s = String(city ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^\p{L}]/gu, "");
  if (!s) return "";
  return s.slice(0, 3);
}
