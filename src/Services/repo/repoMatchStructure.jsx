// src/Services/repo/repoMatchStructure.js

import { supabase } from "../supabase/supabaseClient";

// Trasforma una riga del DB nella forma "flat" che la UI capisce
function mapRowToFlatMatch(row) {
  return {
    day: row.day ?? "",
    city: row.city ?? "",
    team1: row.team1 ?? "",
    team2: row.team2 ?? "",
    // usiamo i seed del DB come ris/pron base (compatibili con il tuo codice)
    ris: row.seed_ris ?? "",
    pron: row.seed_pron ?? "",
    // results ufficiale per ora lo lasciamo vuoto (lo gestirai in un'altra tabella eventualmente)
    results: "",
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
