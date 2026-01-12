// src/Admin/SeedMatchStructure.jsx  (adatta il percorso se diverso)

import { useEffect, useState } from "react";

// ⬇️ Seed hardcoded (la struttura che hai incollato tu)

// ⬇️ Funzione che appiattisce le giornate in un array di match

// ⬇️ Client Supabase (usa lo stesso che usi in App.jsx)
import { getFlatMatchesForGroup } from "../../../components/2aGroupMatches/zExternal/getFlatMatchesForGroup";
import { supabase } from "../../../Services/supabase/supabaseClient";
import { groupMatches } from "../1GroupMatches";

function SeedMatchStructure() {
  const [status, setStatus] = useState("In attesa di avviare il seed...");
  const [loading, setLoading] = useState(false);

  const handleSeed = async () => {
    try {
      setLoading(true);
      setStatus("Avvio seed struttura...");
      console.log(
        "🔄 [SeedMatchStructure] Avvio seed struttura Mondiale → Supabase..."
      );

      // 1️⃣ Costruisco un array con TUTTE le partite (da seed hardcoded)
      const payload = [];
      const groups = "ABCDEFGHIJKL".split("");

      for (const letter of groups) {
        const groupKey = `group_${letter}`;
        const matchesFlat = getFlatMatchesForGroup(groupMatches?.[groupKey]);

        if (!matchesFlat || !Array.isArray(matchesFlat)) {
          console.warn(
            "⚠️ [SeedMatchStructure] Nessun match trovato per",
            groupKey
          );
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
        "ℹ️ [SeedMatchStructure] Payload costruito, partite totali:",
        payload.length
      );

      if (payload.length === 0) {
        setStatus("Nessuna partita trovata nel seed (payload vuoto).");
        console.warn(
          "⚠️ [SeedMatchStructure] Payload vuoto, nessun seed eseguito."
        );
        return;
      }

      setStatus(
        `Trovate ${payload.length} partite dal seed, invio a Supabase...`
      );
      console.log("📤 [SeedMatchStructure] Invio a Supabase...");

      // 2️⃣ Upsert su wc_match_structure (per non creare duplicati)
      const { data, error } = await supabase
        .from("wc_match_structure")
        .upsert(payload, {
          onConflict: "group_letter,match_index",
        })
        .select("group_letter, match_index");

      if (error) {
        console.error("❌ [SeedMatchStructure] Errore Supabase:", error);
        setStatus(`Errore Supabase: ${error.message}`);
        return;
      }

      console.log(
        `✅ [SeedMatchStructure] Seed completato: ${data?.length ?? 0} righe inserite/aggiornate in wc_match_structure.`
      );

      setStatus(
        `✅ Seed completato: ${data?.length ?? 0} righe inserite/aggiornate in wc_match_structure.`
      );
    } catch (err) {
      console.error("❌ [SeedMatchStructure] Errore inatteso:", err);
      setStatus(`Errore inatteso: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ⬇️ Parte in automatico quando carichi la pagina /admin/seed-structure
  useEffect(() => {
    void handleSeed();
  }, []);

  return (
    <div className="p-4 max-w-lg mx-auto text-slate-100">
      <h1 className="text-xl font-bold mb-2">
        Seed struttura Mondiale → Supabase
      </h1>
      <p className="text-sm mb-4">
        Questa pagina legge il seed hardcoded (<code>groupMatches</code>) e
        popola la tabella <code>wc_match_structure</code> in Supabase.
        L’operazione parte automaticamente quando apri questa pagina. Puoi
        riaprirla ogni volta che aggiorni la struttura: il seed usa un{" "}
        <code>upsert</code> su <code>(group_letter, match_index)</code>, quindi
        aggiorna senza creare duplicati.
      </p>

      <p className="text-sm mt-2">
        <strong>Stato:</strong>{" "}
        <span className="font-mono">
          {loading ? "Lavoro in corso..." : status}
        </span>
      </p>
    </div>
  );
}

export default SeedMatchStructure;
