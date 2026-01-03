export function dayOnly(day) {
  const s = String(day ?? "").trim();
  if (!s) return "";
  // prende tutto dopo l’ultimo /
  const parts = s.split("/");
  return parts[parts.length - 1];
}
