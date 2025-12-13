// src/components/1standingsComp/buildHighlightsForGroup.js

export const buildHighlightsForGroup = (
  group,
  labels,
  cities,
  color = "bg-gray-200",
  isKnockout = false // ✅ false = gironi | true = round of 32 +
) => {
  const highlighted = {};
  const giornate = Object.values(group);

  giornate.forEach((giornata) => {
    const { dates, matches } = giornata;

    matches.forEach((match, matchIdx) => {
      let dateStr;

      if (dates.length === matches.length) {
        dateStr = dates[matchIdx];
      } else if (dates.length === 1) {
        dateStr = dates[0];
      } else {
        dateStr = dates[matchIdx] || dates[0];
      }

      if (!dateStr) return;

      const colIndex = labels.findIndex((l) => l.key === dateStr);
      if (colIndex === -1) return;

      const rowIndex = cities.findIndex((c) => c.name === match.city);
      if (rowIndex === -1) return;

      const cellKey = `${rowIndex}-${colIndex}`;

      // TEAM (sempre, se esistono)
      const team1 = match.team1 ? match.team1.slice(0, 3).toUpperCase() : null;

      const team2 = match.team2 ? match.team2.slice(0, 3).toUpperCase() : null;

      // POSIZIONI (SOLO knockout)
      let posString = null;
      if (isKnockout) {
        const p1 = match.pos1 || "";
        const p2 = match.pos2 || "";
        posString = p1 && p2 ? `${p1} ${p2}` : null;
      }

      highlighted[cellKey] = {
        color,
        teams: posString, // ⬅️ SOLO nei knockout
        team1,
        team2,
        time: match.time || null,
        goto: match.goto || null,
      };
    });
  });

  return highlighted;
};
