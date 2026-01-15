import { useState } from "react";
import { useNavigate } from "react-router-dom"; // 👈 AGGIUNTO
import { getFlatMatchesForGroup } from "../../../components/2aGroupMatches/zExternal/getFlatMatchesForGroup";
import { supabase } from "../../../Services/supabase/supabaseClient";
import { groupMatches } from "../1GroupMatches";
import { groupFinal } from "../2GroupFinal";

export default function RunSeedPage() {
  const [status, setStatus] = useState("Nessuna operazione in corso.");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate(); // 👈 HOOK PER TORNARE INDIETRO

  // 🔵 SEED GIRONI A–L → wc_match_structure
  async function seedGroups() {
    try {
      setLoading(true);
      setStatus("Avvio seed GIRONI A–L...");

      const payload = [];
      const groups = "ABCDEFGHIJKL".split("");

      for (const letter of groups) {
        const groupKey = `group_${letter}`;
        const matchesFlat = getFlatMatchesForGroup(groupMatches?.[groupKey]);

        if (!matchesFlat || !Array.isArray(matchesFlat)) {
          console.warn("⚠️ Nessun match trovato per", groupKey);
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
        setStatus("⚠️ Nessuna partita trovata nei gironi (payload vuoto).");
        return;
      }

      const { error } = await supabase
        .from("wc_match_structure")
        .upsert(payload, {
          onConflict: "group_letter,match_index",
        });

      if (error) {
        console.error("❌ Errore seed GIRONI:", error);
        setStatus(`❌ Errore seed gironi: ${error.message}`);
        return;
      }

      setStatus(
        `✅ Seed GIRONI completato: ${payload.length} partite inserite/aggiornate in wc_match_structure.`
      );
    } catch (err) {
      console.error("❌ Errore inatteso seed GIRONI:", err);
      setStatus(`❌ Errore inatteso seed gironi: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  // 🟣 SEED FASE FINALE → wc_final_structure
  async function seedFinals() {
    try {
      setLoading(true);
      setStatus("Avvio seed FASE FINALE...");

      const rowsToInsert = [];

      for (const [phaseKey, phaseData] of Object.entries(groupFinal)) {
        const giornate = Object.values(phaseData);
        let matchIndex = 0;

        for (const giornata of giornate) {
          for (const match of giornata.matches) {
            rowsToInsert.push({
              phase_key: phaseKey,
              match_index: matchIndex,

              city: match.city ?? null,
              time: match.time ?? null,

              pos1: match.pos1 ?? null,
              pos2: match.pos2 ?? null,
              goto: match.goto ?? null,
              fg: match.fg ?? null,
              pronsq: match.pronsq ?? null,

              team1: match.team1 ?? null,
              team2: match.team2 ?? null,

              results_ris: match.results?.ris ?? null,
              results_ts: match.results?.TS ?? null,
              results_r: match.results?.R ?? null,
            });

            matchIndex += 1;
          }
        }
      }

      if (rowsToInsert.length === 0) {
        setStatus(
          "⚠️ Nessuna partita trovata nella fase finale (payload vuoto)."
        );
        return;
      }

      const { error } = await supabase
        .from("wc_final_structure")
        .upsert(rowsToInsert, {
          onConflict: "phase_key,match_index",
        });

      if (error) {
        console.error("❌ Errore seed FINALI:", error);
        setStatus(`❌ Errore seed finali: ${error.message}`);
        return;
      }

      setStatus(
        `✅ Seed FASE FINALE completato: ${rowsToInsert.length} partite inserite/aggiornate in wc_final_structure.`
      );
    } catch (err) {
      console.error("❌ Errore inatteso seed FINALI:", err);
      setStatus(`❌ Errore inatteso seed finali: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 max-w-lg mx-auto text-slate-100 mt-20">
      {/* 🔙 BOTTONE TORNA A SEED-STRUCTURE */}
      <button
        type="button"
        onClick={() => navigate("/admin/seed-structure")}
        className="mb-4 px-8 py-4 rounded-md bg-gray-700 hover:bg-slate-800 text-sm"
      >
        ← Torna a Seed Structure
      </button>

      <h1 className="text-xl font-bold mb-3">
        Seed strutture Mondiale → Supabase
      </h1>

      <p className="text-sm mb-4">
        Da qui puoi aggiornare i dati hardcoded nei seed (
        <code>groupMatches</code> e <code>groupFinal</code>) sulle tabelle{" "}
        <code>wc_match_structure</code> (gironi) e{" "}
        <code>wc_final_structure</code> (fase finale).
      </p>

      <p className="text-sm mb-4">
        Usa i bottoni sotto per lanciare il seed solo dei gironi o solo della
        fase finale.
      </p>

      <div className="flex flex-col gap-3 mb-4">
        <button
          type="button"
          onClick={seedGroups}
          className="px-4 py-2 rounded-md bg-sky-700 hover:bg-sky-600 disabled:opacity-50"
          disabled={loading}
        >
          🔵 Seed Gironi A–L
        </button>

        <button
          type="button"
          onClick={seedFinals}
          className="px-4 py-2 rounded-md bg-pink-700 hover:bg-pink-600 disabled:opacity-50"
          disabled={loading}
        >
          🟣 Seed Fase Finale
        </button>
      </div>

      <p className="text-sm whitespace-pre-line">
        <strong>Stato:</strong> {status}
      </p>
    </div>
  );
}
