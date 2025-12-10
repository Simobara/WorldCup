// createDate.js
export const createDateLabels = () => {
  const start = new Date(2026, 5, 11); // 11 giugno 2026
  const end = new Date(2026, 6, 19); // 19 luglio 2026

  const dayLettersEN = ["S", "M", "T", "W", "T", "F", "S"];
  const monthShortIT = [
    "GEN",
    "FEB",
    "MAR",
    "APR",
    "MAG",
    "GIU",
    "LUG",
    "AGO",
    "SET",
    "OTT",
    "NOV",
    "DIC",
  ];

  const labels = [];

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dayIndex = d.getDay();
    const isWeekend = dayIndex === 0 || dayIndex === 6; // domenica o sabato
    const monthKey = monthShortIT[d.getMonth()]; // es: "GIU"
    const dayNum = d.getDate(); // es: 11
    const key = `${monthKey}/${dayNum.toString().padStart(2, "0")}`; // "GIU/11"

    labels.push({
      top: dayLettersEN[dayIndex],
      bottom: dayNum.toString(),
      isWeekend,
      key, // 👈 chiave compatibile con groupMatches26
    });
  }

  return labels;
};
