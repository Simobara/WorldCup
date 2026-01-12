// scripts/seedWcMatchStructure.mjs

import { createClient } from "@supabase/supabase-js";
import { groupMatches } from "../src/START/app/1GroupMatches.jsx";

// 🔑 leggi le env come le hai già nel progetto
const supabaseUrl =
  process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ SUPABASE URL/KEY mancante nelle env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runSeed() {
  try {
    console.log("🚀 Avvio seed struttura…");

    const payload = [];
    const groups = "ABCDEFGHIJKL".split("");

    for (const letter of groups) {
      const groupKey = `group_${letter}`;
      const matchesFlat = getFlatMatchesForGroup(groupMatches?.[groupKey]);

      if (!matchesFlat || !Array.isArray(matchesFlat)) {
        console.warn("Nessun match trovato per", groupKey);
        continue;
      }

      matchesFlat.forEach((m, index) => {
        payload.push({
          group_letter: letter,
          match_index: index,
          day: m?.day ?? "",
          city: m?.city ?? "",
          team1: m?.team1 ?? "",
          team2: m?.team2 ?? "",
          seed_ris: m?.ris ?? null,
          seed_pron: m?.pron ?? null,
          results_official: (m?.results ?? "").trim() || null,
        });
      });
    }

    if (payload.length === 0) {
      console.log("Nessuna partita trovata nel seed (payload vuoto).");
      process.exit(0);
    }

    console.log(`Trovate ${payload.length} partite, invio a Supabase…`);

    const { data, error } = await supabase
      .from("wc_match_structure")
      .upsert(payload, {
        onConflict: "group_letter,match_index",
      })
      .select("group_letter, match_index");

    if (error) {
      console.error("❌ Errore Supabase:", error.message);
      process.exit(1);
    }

    console.log(
      `✅ Seed completato: ${data?.length ?? 0} righe inserite/aggiornate.`
    );
    process.exit(0);
  } catch (err) {
    console.error("❌ Errore inatteso:", err);
    process.exit(1);
  }
}

runSeed();
