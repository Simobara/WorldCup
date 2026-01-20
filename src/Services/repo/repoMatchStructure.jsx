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
// 🔁 Logica comune: dai valori locali (a,b,pronNorm,editedFlag) → ris & pron coerenti
function computeRisAndPronFromState({
  existingRis,
  existingPron,
  a,
  b,
  pronNorm,
  editedFlag,
}) {
  let ris = existingRis ?? null;
  let pron = existingPron ?? null;

  const sa = String(a ?? "").trim();
  const sb = String(b ?? "").trim();
  const hasGoals = sa !== "" && sb !== "";

  if (hasGoals) {
    // ✅ risultato pronosticato → comanda anche il segno
    ris = `${sa}-${sb}`;

    const na = Number(sa);
    const nb = Number(sb);

    if (Number.isFinite(na) && Number.isFinite(nb)) {
      if (na > nb) pron = "1";
      else if (na < nb) pron = "2";
      else pron = "X";
    }
  } else if (editedFlag) {
    // 🧹 reset completo (Del / rotellina)
    ris = null;
    pron = null;
  } else if (pronNorm === "1" || pronNorm === "X" || pronNorm === "2") {
    // ✏️ solo segno 1/X/2 (nessun risultato)
    pron = pronNorm;
    // ris resta ciò che era (o null) a seconda di existingRis
  }

  return { ris, pron };
}

/**
 * Legge la tabella wc_matches_structure da Supabase e
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
    .from("wc_matches_structure")
    .select("*")
    .order("group_letter", { ascending: true })
    .order("match_index", { ascending: true });

  if (error) {
    console.error("Errore caricando wc_matches_structure:", error);
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
 * Salva i risultati inseriti dall'ADMIN in wc_matches_structure.seed_ris
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

  // console.log("[saveAdminSeedsToDb] called", {
  //   userEmail,
  //   keysTouched: letters,
  // });

  // 1️⃣ leggo i seed attuali dal DB
  const { data: existingRows, error: readError } = await supabase
    .from("wc_matches_structure")
    .select("group_letter, match_index, seed_ris, seed_pron")
    .in("group_letter", letters)
    .order("group_letter", { ascending: true })
    .order("match_index", { ascending: true });

  if (readError) {
    // console.error(
    //   "[saveAdminSeedsToDb] errore leggendo seed esistenti:",
    //   readError,
    // );
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

      const editedFlag = Array.isArray(plusRisEdited)
        ? !!plusRisEdited[idx]
        : !!(plusRisEdited[idx] ?? plusRisEdited[String(idx)] ?? false);

      const pronRaw = Array.isArray(plusPron)
        ? plusPron[idx]
        : (plusPron[idx] ?? plusPron[String(idx)] ?? "");
      const pronNorm = String(pronRaw ?? "")
        .trim()
        .toUpperCase();

      const existingSeedRis =
        currentSeeds?.[letter]?.[idx]?.seed_ris != null
          ? String(currentSeeds[letter][idx].seed_ris).trim()
          : null;

      const existingSeedPron =
        currentSeeds?.[letter]?.[idx]?.seed_pron != null
          ? String(currentSeeds[letter][idx].seed_pron).trim().toUpperCase()
          : null;

      // 🔥 qui applichiamo la regola:
      // - se c'è risultato pronosticato (a/b) → decide anche il segno
      // - se non c'è risultato ma c'è 1/X/2 → salva solo il segno
      // - se reset (editedFlag true, nessun gol) → azzera entrambi
      const { ris: seed_ris, pron: seed_pron } = computeRisAndPronFromState({
        existingRis: existingSeedRis,
        existingPron: existingSeedPron,
        a,
        b,
        pronNorm,
        editedFlag,
      });

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
    // console.warn("[saveAdminSeedsToDb] payload empty, nothing to upsert");
    // return;
  }

  // console.log(
  //   "[saveAdminSeedsToDb] payload sample",
  //   payload.filter((r) => r.group_letter === "B").slice(0, 6),
  // );

  try {
    const { data, error } = await supabase
      .from("wc_matches_structure")
      .upsert(payload, {
        onConflict: "group_letter,match_index",
      });

    // console.log("[saveAdminSeedsToDb] upsert result", { data, error });

    if (error) {
      console.error("saveAdminSeedsToDb ERROR:", error);
    }
  } catch (err) {
    console.error("saveAdminSeedsToDb EXCEPTION:", err);
  }
}

/**
 * Pronostici UTENTE NORMALE
 * Tabella: wc_matches_structure_userpron
 *
 * Regola:
 * - se l'utente mette un risultato (a-b) → calcolo anche il segno 1/X/2
 * - se mette solo 1/X/2 → salvo solo il segno
 * - se reset (editedFlag, senza gol) → azzero tutti i campi
 *
 * 🔴 ATTENZIONE:
 *  - qui assumo colonne: ris_user, pron_user, user_email
 *    se i nomi sono diversi, cambia SOLO qui.
 */
export async function saveUserPronosticsToDb({
  userEmail,
  matches,
  keysTouched,
}) {
  if (!userEmail || !matches) return;

  const letters = keysTouched?.size
    ? Array.from(keysTouched)
    : Object.keys(matches ?? {});

  if (!letters.length) return;

  // 1️⃣ leggo pronostici esistenti dell'utente
  const { data: existingRows, error: readError } = await supabase
    .from("wc_matches_structure_userpron")
    .select("user_email, group_letter, match_index, user_ris, user_pron")
    .eq("user_email", userEmail)
    .in("group_letter", letters)
    .order("group_letter", { ascending: true })
    .order("match_index", { ascending: true });

  if (readError) {
    console.error(
      "[saveUserPronosticsToDb] errore leggendo pronostici utente:",
      readError,
    );
    return;
  }

  const current = {};
  for (const row of existingRows ?? []) {
    const letter = row.group_letter;
    const idx = row.match_index;
    if (!current[letter]) current[letter] = {};
    current[letter][idx] = {
      user_ris: row.user_ris,
      user_pron: row.user_pron,
    };
  }

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

      const editedFlag = Array.isArray(plusRisEdited)
        ? !!plusRisEdited[idx]
        : !!(plusRisEdited[idx] ?? plusRisEdited[String(idx)] ?? false);

      const pronRaw = Array.isArray(plusPron)
        ? plusPron[idx]
        : (plusPron[idx] ?? plusPron[String(idx)] ?? "");
      const pronNorm = String(pronRaw ?? "")
        .trim()
        .toUpperCase();

      const existingRis =
        current?.[letter]?.[idx]?.user_ris != null
          ? String(current[letter][idx].user_ris).trim()
          : null;

      const existingPron =
        current?.[letter]?.[idx]?.user_pron != null
          ? String(current[letter][idx].user_pron).trim().toUpperCase()
          : null;

      const { ris, pron } = computeRisAndPronFromState({
        existingRis,
        existingPron,
        a,
        b,
        pronNorm,
        editedFlag,
      });

      payload.push({
        user_email: userEmail,
        group_letter: letter,
        match_index: idx,
        user_ris: ris,
        user_pron: pron,
      });
    }
  }

  if (!payload.length) {
    console.warn("[saveUserPronosticsToDb] payload empty, nothing to upsert");
    return;
  }

  try {
    const { data, error } = await supabase
      .from("wc_matches_structure_userpron")
      .upsert(payload, {
        onConflict: "user_email,group_letter,match_index",
      });

    console.log("[saveUserPronosticsToDb] upsert result", { data, error });

    if (error) {
      console.error("saveUserPronosticsToDb ERROR:", error);
    }
  } catch (err) {
    console.error("saveUserPronosticsToDb EXCEPTION:", err);
  }
}
