// src/Services/repo/repoMatchStructure.jsx

import { ADMIN_EMAIL } from "../../START/app/0main";
import { groupMatches } from "../../START/app/1GroupMatches";
import { supabase } from "../supabase/supabaseClient";

// Trasforma una riga del DB nella forma "flat" che la UI capisce
function mapRowToFlatMatch(row) {
  return {
    day: row.day ?? "",
    city: row.city ?? "",
    team1: row.team1 ?? "",
    team2: row.team2 ?? "",
    // seed dal DB
    ris: row.seed_ris ?? "",
    pron: row.seed_pron ?? "",
    // results ufficiale (se esiste una colonna results_official / results)
    results: (row.results_official ?? row.results ?? "").trim(),
  };
}

/**
 * Legge la tabella wc_match_structure da Supabase e
 * restituisce un oggetto del tipo:
 *
 * {
 *   A: [ flatMatch1, flatMatch2, ... ],
 *   B: [ ... ],
 *   ...
 * }
 */
export async function loadMatchStructureFromDb() {
  const { data, error } = await supabase
    .from("wc_match_structure")
    .select("*")
    .order("group_letter", { ascending: true })
    .order("match_index", { ascending: true });

  if (error) {
    console.error("Errore caricando wc_match_structure:", error);
    throw error;
  }

  const byGroup = {};

  for (const row of data ?? []) {
    const letter = row.group_letter;
    if (!letter) continue;

    if (!byGroup[letter]) {
      byGroup[letter] = [];
    }

    byGroup[letter].push(mapRowToFlatMatch(row));
  }

  return byGroup;
}

/**
 * Salva i risultati inseriti dall'ADMIN in wc_match_structure.seed_ris
 * usando plusRis (a/b) per i gruppi/modifiche toccati.
 *
 * ✅ NON cancella più i seed non modificati
 *    (li legge prima dal DB e li mantiene)
 */
export async function saveAdminSeedsToDb({ userEmail, matches, keysTouched }) {
  if (
    !userEmail ||
    userEmail.toLowerCase() !== ADMIN_EMAIL.toLowerCase() ||
    !matches
  ) {
    return;
  }

  const letters = keysTouched?.size
    ? Array.from(keysTouched)
    : Object.keys(matches ?? {});

  if (!letters.length) return;

  console.log("[saveAdminSeedsToDb] called", {
    userEmail,
    keysTouched: letters,
  });

  // 1️⃣ leggo i seed_ris attuali dal DB
  const { data: existingRows, error: readError } = await supabase
    .from("wc_match_structure")
    .select("group_letter, match_index, seed_ris, seed_pron")
    .in("group_letter", letters)
    .order("group_letter", { ascending: true })
    .order("match_index", { ascending: true });

  if (readError) {
    console.error(
      "[saveAdminSeedsToDb] errore leggendo seed esistenti:",
      readError,
    );
    return;
  }

  const currentSeeds = {};
  for (const row of existingRows ?? []) {
    const letter = row.group_letter;
    const idx = row.match_index;
    if (!currentSeeds[letter]) currentSeeds[letter] = {};
    currentSeeds[letter][idx] = {
      seed_ris: row.seed_ris,
      seed_pron: row.seed_pron,
    };
  }
  // 2️⃣ costruisco il payload
  const payload = [];

  for (const letter of letters) {
    const groupData = matches[letter] || {};

    const groupKey = `group_${letter}`;
    const struct = groupMatches?.[groupKey] ?? null;
    if (!struct) continue;

    const matchesFlat = Object.values(struct)
      .filter((v) => v?.matches)
      .flatMap((g) => g.matches ?? []);

    const maxLen = matchesFlat.length;

    const plusRis = groupData.plusRis ?? {};
    const plusPron = groupData.plusPron ?? {};
    const plusRisEdited = groupData.plusRisEdited ?? {};

    for (let idx = 0; idx < maxLen; idx++) {
      const risObj = Array.isArray(plusRis)
        ? plusRis[idx]
        : (plusRis[idx] ?? plusRis[String(idx)] ?? {});

      const a = String(risObj?.a ?? "").trim();
      const b = String(risObj?.b ?? "").trim();

      // è stata toccata la riga (anche solo per cancellare)?
      const editedFlag = Array.isArray(plusRisEdited)
        ? !!plusRisEdited[idx]
        : !!(plusRisEdited[idx] ?? plusRisEdited[String(idx)] ?? false);

      // pronostico 1 / X / 2 per questo match (dal state UI)
      const pronRaw = Array.isArray(plusPron)
        ? plusPron[idx]
        : (plusPron[idx] ?? plusPron[String(idx)] ?? "");
      const pronNorm = String(pronRaw ?? "")
        .trim()
        .toUpperCase();

      // seed attuali letti dal DB (li teniamo se la riga non è stata toccata)
      const existingSeedRis =
        currentSeeds?.[letter]?.[idx]?.seed_ris != null
          ? String(currentSeeds[letter][idx].seed_ris).trim()
          : null;
      const existingSeedPron =
        currentSeeds?.[letter]?.[idx]?.seed_pron != null
          ? String(currentSeeds[letter][idx].seed_pron).trim().toUpperCase()
          : null;

      let seed_ris = existingSeedRis;
      let seed_pron = existingSeedPron;

      // ---- RISULTATO (seed_ris) ----
      if (a !== "" && b !== "") {
        // ✏️ admin ha scritto un nuovo risultato
        seed_ris = `${a}-${b}`;
      } else if (editedFlag) {
        // 🧹 admin ha usato la rotellina / reset → cancella dal DB
        seed_ris = null;
      }
      // else: non toccata → lascia existingSeedRis

      // ---- PRONOSTICO (seed_pron) ----
      if (pronNorm === "1" || pronNorm === "X" || pronNorm === "2") {
        // ✏️ admin ha impostato un nuovo segno 1/X/2
        seed_pron = pronNorm;
      } else if (editedFlag) {
        // 🧹 se la riga è stata resettata (Del / rotellina), azzero anche il segno
        seed_pron = null;
      }
      // else: non toccata e nessun nuovo segno → lascia existingSeedPron

      payload.push({
        user_email: userEmail,
        group_letter: letter,
        match_index: idx,
        seed_ris,
        seed_pron,
      });
    }
  }

  if (!payload.length) {
    console.warn("[saveAdminSeedsToDb] payload empty, nothing to upsert");
    return;
  }

  console.log(
    "[saveAdminSeedsToDb] payload sample",
    payload.filter((r) => r.group_letter === "B").slice(0, 6),
  );

  try {
    const { data, error } = await supabase
      .from("wc_match_structure")
      .upsert(payload, {
        onConflict: "group_letter,match_index",
      });

    console.log("[saveAdminSeedsToDb] upsert result", { data, error });

    if (error) {
      console.error("saveAdminSeedsToDb ERROR:", error);
    }
  } catch (err) {
    console.error("saveAdminSeedsToDb EXCEPTION:", err);
  }
}
