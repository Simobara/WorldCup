import { groupNotes, REMOTEorLOCAL } from "../../START/app/note";
import { supabase } from "../supabase/supabaseClient";

const LOCAL_STORAGE_KEY = "notes_base_local";
const ADMIN_EMAIL = "simobara@hotmail.it";

// safe clone (fallback se structuredClone non esiste)
function clone(x) {
  if (typeof structuredClone === "function") return structuredClone(x);
  return JSON.parse(JSON.stringify(x ?? null));
}

/**
 * Rimuove i commenti (items e notes.text) mantenendo la struttura
 */
function stripComments(base) {
  const out = clone(base ?? {});

  for (const g of Object.keys(out)) {
    const group = out[g];
    if (!group) continue;

    for (const dayKey of ["day1", "day2", "day3"]) {
      if (group[dayKey]) group[dayKey].items = "";
    }

    if (group.notes) group.notes.text = "";
  }

  return out;
}

export function createNotesRepo(source = REMOTEorLOCAL, opts = {}) {
  // ✅ REMOTEorLOCAL deve essere "remote" o "local"
  const isRemote = source === REMOTEorLOCAL;

  const userId = opts.userId;
  const userEmail = opts.userEmail;

  const isAdmin = (userEmail || "").toLowerCase() === ADMIN_EMAIL.toLowerCase();

  return {
    source,

    async load() {
      // ---------- LOCAL ----------
      if (!isRemote) {
        try {
          const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
          const parsed = saved ? JSON.parse(saved) : null;
          return { ...(groupNotes ?? {}), ...(parsed ?? {}) };
        } catch {
          return groupNotes ?? {};
        }
      }

      // ---------- REMOTE ----------
      // non loggato → admin vede base completa, altri base pulita
      if (!userId) {
        return isAdmin ? (groupNotes ?? {}) : stripComments(groupNotes);
      }

      // 1) Leggi DB user
      let { data, error } = await supabase
        .from("notes_base")
        .select("key, data")
        .eq("user_id", userId);

      if (error) {
        console.error("LOAD ERROR:", error);
        return isAdmin ? (groupNotes ?? {}) : stripComments(groupNotes);
      }

      // 2) ADMIN: prima volta assoluta → seed DB con il LOCALE COMPLETO
      if (isAdmin && (!data || data.length === 0)) {
        const payload = Object.keys(groupNotes ?? {}).map((k) => ({
          user_id: userId,
          key: k,
          data: groupNotes?.[k] ?? null,
        }));

        const { error: seedAdminErr } = await supabase
          .from("notes_base")
          .upsert(payload, { onConflict: "user_id,key" });

        if (seedAdminErr) {
          console.warn("ADMIN SEED WARN:", seedAdminErr);
          // fallback: almeno vedi il locale completo
          return groupNotes ?? {};
        }

        // rilegge dopo seed
        const res2 = await supabase
          .from("notes_base")
          .select("key, data")
          .eq("user_id", userId);

        if (res2.error) {
          console.error("LOAD AFTER ADMIN SEED ERROR:", res2.error);
          return groupNotes ?? {};
        }

        data = res2.data;
      }

      // 3) NON-ADMIN: seed "pulito" (se vuoi continuare a usare la RPC)
      //    Nota: se la tua RPC copia commenti, non è un problema perché sotto li nascondiamo.
      // 3) NON-ADMIN: se è la prima volta → seed nel DB con BASE PULITA (senza commenti)
      if (!isAdmin && (!data || data.length === 0)) {
        const cleanBase = stripComments(groupNotes);

        const payload = Object.keys(cleanBase ?? {}).map((k) => ({
          user_id: userId,
          key: k,
          data: cleanBase?.[k] ?? null,
        }));

        const { error: seedCleanErr } = await supabase
          .from("notes_base")
          .upsert(payload, { onConflict: "user_id,key" });

        if (seedCleanErr) {
          console.warn("NON-ADMIN SEED CLEAN WARN:", seedCleanErr);
        }

        const res3 = await supabase
          .from("notes_base")
          .select("key, data")
          .eq("user_id", userId);

        if (!res3.error) data = res3.data;
      }

      // 4) out dal DB
      const out = {};
      for (const row of data ?? []) out[row.key] = row.data;

      // 5) base:
      // - admin: base vuota (perché ormai DB è la source of truth dopo la 1a volta)
      // - non-admin: base pulita (struttura + commenti vuoti)
      const base = isAdmin ? {} : stripComments(groupNotes);

      // 6) merge (DB vince)
      const merged = { ...clone(base), ...out };

      // 7) NON-ADMIN: nascondi i commenti seed se uguali al file principale
      if (!isAdmin) {
        for (const g of Object.keys(merged ?? {})) {
          const mG = merged[g];
          const refG = groupNotes?.[g];
          if (!mG || !refG) continue;

          for (const dayKey of ["day1", "day2", "day3"]) {
            const mItem = mG?.[dayKey]?.items ?? "";
            const refItem = refG?.[dayKey]?.items ?? "";
            if (refItem && mItem === refItem) {
              mG[dayKey] = mG[dayKey] ?? {};
              mG[dayKey].items = "";
            }
          }

          const mText = mG?.notes?.text ?? "";
          const refText = refG?.notes?.text ?? "";
          if (refText && mText === refText) {
            mG.notes = mG.notes ?? {};
            mG.notes.text = "";
          }
        }
      }
      // ✅ NON-ADMIN: mostra items/text SOLO se l’utente ha scritto (__edited === true)
      if (!isAdmin) {
        for (const g of Object.keys(merged ?? {})) {
          const mG = merged[g];
          if (!mG) continue;

          if (mG.__edited !== true) {
            for (const dayKey of ["day1", "day2", "day3"]) {
              if (mG[dayKey]) mG[dayKey].items = "";
            }
            if (mG.notes) mG.notes.text = "";
          }
        }
      }

      return merged;
    },

    async save({ notes, keysTouched }) {
      if (!keysTouched?.size) return;

      // ✅ NON-ADMIN: marca i gruppi modificati dall’utente
      if (!isAdmin && notes) {
        for (const k of keysTouched) {
          notes[k] = notes[k] ?? {};
          notes[k].__edited = true;
        }
      }

      // ---------- LOCAL ----------
      if (!isRemote) {
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

      // ---------- REMOTE ----------
      if (!userId) return;

      const payload = Array.from(keysTouched).map((k) => ({
        user_id: userId,
        key: k,
        data: notes?.[k] ?? null,
      }));

      const { error } = await supabase
        .from("notes_base")
        .upsert(payload, { onConflict: "user_id,key" });

      if (error) console.error("SAVE ERROR:", error);
    },
  };
}
