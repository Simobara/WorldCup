export function toCode3(team) {
  const s = String(team?.id ?? team?.name ?? "")
    .trim()
    .toUpperCase();

  if (!s) return "";

  return s.replace(/\s+/g, "").slice(0, 3);
}
