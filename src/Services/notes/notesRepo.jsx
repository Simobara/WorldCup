import { groupNotes } from "../../START/app/note";
import { supabase } from "../supabase/supabaseClient";

const LOCAL_STORAGE_KEY = "notes_base_local"; // se vuoi persistere anche in local

export function createNotesRepo(source = "remote") {
  const isRemote = source === "remote";

  return {
    source,

    async load() {
      if (!isRemote) {
        // LOCAL: base da JSX + (opzionale) override da localStorage
        try {
          const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
          const parsed = saved ? JSON.parse(saved) : null;
          return { ...(groupNotes ?? {}), ...(parsed ?? {}) };
        } catch {
          return groupNotes ?? {};
        }
      }

      // REMOTE: Supabase
      const { data, error } = await supabase
        .from("notes_base")
        .select("key, data");

      if (error) {
        console.error("LOAD ERROR:", error);
        // fallback: almeno non rompi la UI
        return groupNotes ?? {};
      }

      const out = {};
      for (const row of data ?? []) out[row.key] = row.data;

      // “DB vince” come fai già tu
      return { ...(groupNotes ?? {}), ...out };
    },

    async save({ notes, keysTouched }) {
      if (!keysTouched?.size) return;

      if (!isRemote) {
        // LOCAL: persisti solo i gruppi toccati, non tutto per forza
        try {
          const current = JSON.parse(
            localStorage.getItem(LOCAL_STORAGE_KEY) || "{}"
          );
          const next = { ...current };
          for (const k of keysTouched) next[k] = notes?.[k] ?? null;
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
        } catch (e) {
          console.error("LOCAL SAVE ERROR:", e);
        }
        return;
      }

      // REMOTE: upsert su Supabase
      const payload = Array.from(keysTouched).map((k) => ({
        key: k,
        data: notes?.[k] ?? null,
      }));

      const { error } = await supabase
        .from("notes_base")
        .upsert(payload, { onConflict: "key" });

      if (error) console.error("SAVE ERROR:", error);
    },
  };
}
