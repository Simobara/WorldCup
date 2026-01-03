export function getFlatMatchesForGroup(groupObj) {
  if (!groupObj) return [];
  const giornate = Object.values(groupObj);

  const out = [];
  for (const g of giornate) {
    const day = g?.dates?.[0] ?? "";
    for (const m of g?.matches ?? []) {
      out.push({
        day,
        city: m.city ?? "",
        team1: m.team1 ?? "",
        team2: m.team2 ?? "",
        pron: String(m.pron ?? "")
          .trim()
          .toUpperCase(), // "1" | "X" | "2" | ""
        results: String(m.results ?? "").trim(),
        ris: String(m.ris ?? "").trim(),
      });
    }
  }
  return out;
}