// scripts/seedWcMatchStructure.mjs

import { createClient } from "@supabase/supabase-js";

// ⬇️ Adatta questi percorsi alle estensioni REALI dei tuoi file
import { groupMatches } from "../src/1GroupMatches.js";
import { getFlatMatchesForGroup } from "../src/components/2aGroupMatches/zExternal/getFlatMatchesForGroup.js";

// 🔑 QUI leggiamo le env (metti i valori nel tuo .env, o exporta variabili shell)
const supabaseUrl =
  process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ [seedWcMatchStructure] SUPABASE URL/KEY mancanti nelle env");
  process.exit(1);
}

const supabase = createClient (supabaseUrl, supabaseKey);

async function runSeed() {
  try {
    console.log("🔄 [seedWcMatchStructure] Avvio seed struttura Mondiale → Supabase...");

    const payload = [];
    const groups = "ABCDEFGHIJKL".split("");

    for (const letter of groups) {
      const groupKey = `group_${letter}`;
      const matchesFlat = getFlatMatchesForGroup(groupMatches?.[groupKey]);

      if (!matchesFlat || !Array.isArray(matchesFlat)) {
        console.warn("⚠️ [seedWcMatchStructure] Nessun match trovato per", groupKey);
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

    console.log(
      "ℹ️ [seedWcMatchStructure] Payload costruito, partite totali:",
      payload.length
    );

    if (payload.length === 0) {
      console.log(
        "⚠️ [seedWcMatchStructure] Nessuna partita trovata nel seed (payload vuoto)."
      );
      process.exit(0);
    }

    console.log("📤 [seedWcMatchStructure] Invio a Supabase...");

    const { data, error } = await supabase
      .from("wc_matches_structure")
      .upsert(payload, {
        onConflict: "group_letter,match_index",
      })
      .select("group_letter, match_index");

    if (error) {
      console.error("❌ [seedWcMatchStructure] Errore Supabase:", error);
      process.exit(1);
    }

    console.log(
      `✅ [seedWcMatchStructure] Seed completato: ${
        data?.length ?? 0
      } righe inserite/aggiornate in wc_matches_structure.`
    );
    process.exit(0);
  } catch (err) {
    console.error("❌ [seedWcMatchStructure] Errore inatteso:", err);
    process.exit(1);
  }
}

runSeed();
