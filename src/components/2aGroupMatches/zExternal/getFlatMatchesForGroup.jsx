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

        // ✔️ questi tre sono i valori importanti del seed
        pron: String(m.pron ?? "")
          .trim()
          .toUpperCase(),
        ris: String(m.ris ?? "").trim(),
        results: String(m.results ?? "").trim(), // 👈 UFFICIALE (va in Supabase)

        // puoi aggiungere altro se serve
      });
    }
  }

  return out;
}
