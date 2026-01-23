// src/Body/2bGroupRank/zExternal/rankUtils.js

// 1) risultato numerico tipo "2-1"
export const isScore = (s) => {
  const raw = String(s ?? "")
    .trim()
    .replace(/[–—−]/g, "-")
    .replace(/:/g, "-")
    .replace(/\s+/g, "");
  if (!raw.includes("-")) return false;
  const [a, b] = raw.split("-");
  return Number.isFinite(Number(a)) && Number.isFinite(Number(b));
};

// 2) pronostico 1/X/2
export const isSign = (s) => {
  const v = String(s ?? "").trim().toUpperCase();
  return v === "1" || v === "X" || v === "2";
};

// 3) match “coperto”: ufficiale OR ris OR 1X2
export const isCoveredMatch = (m) =>
  isScore(m?.results) || isScore(m?.ris) || isSign(m?.pron);

// 4) gruppo “completo”: 6 match e tutti coperti
export const isGroupComplete = (matchesData) => {
  const all = Object.values(matchesData).flatMap((g) => g?.matches ?? []);
  return all.length >= 6 && all.every(isCoveredMatch);
};
