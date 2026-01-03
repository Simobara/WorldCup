export function splitDayDesk(day) {
  const s = String(day ?? "")
    .replaceAll("/", " ")
    .trim();
  if (!s) return { label: "", num: "" };

  const parts = s.split(/\s+/);
  const label = parts[0] ?? "";
  const num = parts.slice(1).join(" ");

  return { label, num };
}
