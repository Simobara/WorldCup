import { groupNotes } from "../../START/app/note";
import { supabase } from "../supabase/supabaseClient";
import { REMOTEorLOCAL } from "../../START/app/note";

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
      if (group[dayKey]) group[dayKey].items = ""; // vuoto per utenti
    }

    if (group.notes) group.notes.text = ""; // vuoto per utenti
  }

  return out;
}

export function createNotesRepo(source = REMOTEorLOCAL, opts = {}) {
  const isRemote = source === REMOTEorLOCAL;
  const userId = opts.userId;
  const userEmail = opts.userEmail;

  const isAdmin = userEmail === ADMIN_EMAIL;

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
      if (!userId) {
        return isAdmin ? (groupNotes ?? {}) : stripComments(groupNotes);
      }

      // seed (una volta per user)
      const { error: seedErr } = await supabase.rpc("seed_notes_from_global");
      if (seedErr) console.warn("SEED WARN:", seedErr);

      // carica SOLO le note dell’utente
      const { data, error } = await supabase
        .from("notes_base")
        .select("key, data")
        .eq("user_id", userId);

      if (error) {
        console.error("LOAD ERROR:", error);
        return isAdmin ? (groupNotes ?? {}) : stripComments(groupNotes);
      }

      const out = {};
      for (const row of data ?? []) out[row.key] = row.data;

      const base = isAdmin ? groupNotes : stripComments(groupNotes);

      // merge profondo minimo + regola admin:
      // se DB ha stringhe vuote, tieni quelle del file
      const merged = clone(base ?? {});

      for (const k of Object.keys(out)) {
        const dbG = out[k] ?? {};
        const baseG = base?.[k] ?? {};

        // merge top level
        merged[k] = { ...clone(baseG), ...clone(dbG) };

        // merge day1/day2/day3
        for (const dayKey of ["day1", "day2", "day3"]) {
          const bDay = baseG?.[dayKey] ?? {};
          const dDay = dbG?.[dayKey] ?? {};
          merged[k][dayKey] = { ...clone(bDay), ...clone(dDay) };
        }

        // merge notes
        const bNotes = baseG?.notes ?? {};
        const dNotes = dbG?.notes ?? {};
        merged[k].notes = { ...clone(bNotes), ...clone(dNotes) };

        // admin: se DB vuoto, ripristina dal file
        if (isAdmin) {
          for (const dayKey of ["day1", "day2", "day3"]) {
            const b = baseG?.[dayKey]?.items;
            const d = dbG?.[dayKey]?.items;
            if (d === "" && typeof b === "string" && b.length) {
              merged[k][dayKey].items = b;
            }
          }

          const bText = baseG?.notes?.text;
          const dText = dbG?.notes?.text;
          if (dText === "" && typeof bText === "string" && bText.length) {
            merged[k].notes.text = bText;
          }
        }
      }
// ✅ REGOLA: i non-admin NON devono vedere i commenti "seed" (uguali al file principale)
// ma devono vedere i loro commenti se diversi (quindi salvati da loro).
if (!isAdmin) {
  for (const g of Object.keys(merged ?? {})) {
    const mG = merged[g];
    const refG = groupNotes?.[g]; // commenti originali "admin"

    if (!mG || !refG) continue;

    for (const dayKey of ["day1", "day2", "day3"]) {
      const mItem = mG?.[dayKey]?.items ?? "";
      const refItem = refG?.[dayKey]?.items ?? "";

      // se coincide col commento originale -> nascondilo
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

      return merged;
    },

    async save({ notes, keysTouched }) {
      if (!keysTouched?.size) return;

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
