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

      // 🔹 abbreviazioni team1 / team2 (prime 3 lettere, maiuscole)
      const t1 = (match.team1 || "").slice(0, 3).toUpperCase();
      const t2 = (match.team2 || "").slice(0, 3).toUpperCase();

      const teamsShort = t1 && t2 ? `${t1} ${t2}` : t1 || t2 || null;
      const goto = match.goto || null;

      // 🔹 salviamo un oggetto con colore + sigle squadre
      highlighted[cellKey] = {
        color, // es. "bg-green-500"
        teams: teamsShort, // es. "MEX-SOU"
        goto,
      };
    });
  });

  return highlighted;
};
