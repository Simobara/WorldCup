// src/components/1standingsComp/buildHighlightsForGroup.js

export const buildHighlightsForGroup = (
  group,
  labels,
  cities,
  color = "bg-gray-600"
) => {
  const highlighted = {};

  const giornate = Object.values(group); // giornata_1, giornata_2, giornata_3...

  giornate.forEach((giornata) => {
    const { dates, matches } = giornata;

    matches.forEach((match, matchIdx) => {
      let dateStr;

      if (dates.length === matches.length) {
        // caso classico: 2 date, 2 partite → allineate per indice
        dateStr = dates[matchIdx];
      } else if (dates.length === 1) {
        // una sola data per tutte le partite
        dateStr = dates[0];
      } else {
        // fallback
        dateStr = dates[matchIdx] || dates[0];
      }

      if (!dateStr) return;

      // colonna della griglia (data GIU/11, GIU/12, GIU/25, ecc.)
      const colIndex = labels.findIndex((l) => l.key === dateStr);
      if (colIndex === -1) return;

      // riga della griglia (città)
      const rowIndex = cities.findIndex((c) => c.name === match.city);
      if (rowIndex === -1) return;

      const cellKey = `${rowIndex}-${colIndex}`;

      // 🔹 LOGICA CHE TI SERVE:
      // Se team1/team2 sono vuoti ma esistono pos1/pos2 → usa pos1/pos2
      // Altrimenti usa team1/team2.
      const hasTeam =
        (match.team1 && match.team1.trim() !== "") ||
        (match.team2 && match.team2.trim() !== "");
      const hasPos =
        (match.pos1 && match.pos1.trim() !== "") ||
        (match.pos2 && match.pos2.trim() !== "");

      let raw1, raw2;
      let usePos = false;

      if (!hasTeam && hasPos) {
        // caso round32: team1/team2 vuoti, pos1/pos2 pieni
        raw1 = match.pos1 || "";
        raw2 = match.pos2 || "";
        usePos = true;
      } else {
        // caso classico gironi: team1/team2
        raw1 = match.team1 || "";
        raw2 = match.team2 || "";
      }

      // 🔹 Se usiamo pos → li lasciamo così ("2A", "2B")
      //     Se usiamo team → accorciamo e mettiamo maiuscolo ("MEX", "USA")
      const t1 = usePos ? raw1 : raw1.slice(0, 3).toUpperCase();
      const t2 = usePos ? raw2 : raw2.slice(0, 3).toUpperCase();

      const teamsShort = t1 && t2 ? `${t1} ${t2}` : t1 || t2 || null;
      const goto = match.goto || null;

      // 🔹 salviamo un oggetto con colore + sigle squadre
      highlighted[cellKey] = {
        color, // es. "bg-green-500"
        teams: teamsShort, // es. "2A 2B" oppure "MEX USA"
        goto,
      };
    });
  });

  return highlighted;
};
