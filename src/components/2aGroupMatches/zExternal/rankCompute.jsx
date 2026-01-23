import { buildNameResolver } from "../../2aGroupMatches/zExternal/buildNameResolver";

/**
 * Ritorna la classifica ordinata di un gruppo (array di team objects di flagsMond),
 * usando ESATTAMENTE la stessa logica che usi in GridRankPage.
 *
 * ⚠️ In questo file devi SOLO “re-exportare” le funzioni che già esistono
 * nel tuo codice di GridRank (se già le hai in altri file).
 *
 * Per ora metto wrapper vuoti così non crasha.
 * Nel prossimo step li colleghiamo alle funzioni reali.
 */

export function getSortedTeamsForGroup({
  flagsMond,
  groupLetter,
  matchesData,
  maxMatches = null,
  useBonus = true,
}) {
  const resolveName = buildNameResolver(flagsMond);

  // ⛔️ TODO prossimo step: collegare qui le funzioni REALI di GridRank
  // per ora: fallback super-safe = ordine originale del gruppo
  const teams = (flagsMond ?? []).filter((t) => t.group === groupLetter);
  return teams;
}
