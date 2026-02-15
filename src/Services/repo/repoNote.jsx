import { DATA_SOURCE } from "../../START/app/0main";
import { groupNotes } from "../../START/app/note";
import { supabase } from "../supabase/supabaseClient";

const LOCAL_STORAGE_KEY = "notes_base_local";
const ADMIN_EMAIL = "simobara@hotmail.it";

// ============ UTILITY ============

// safe clone (fallback se structuredClone non esiste)
function clone(x) {
  // eslint-disable-next-line no-undef
  if (typeof structuredClone === "function") return structuredClone(x);
  return JSON.parse(JSON.stringify(x ?? null));
}

/**
 * Rimuove il contenuto delle note (items / text) dai dati base,
 * mantenendo solo la struttura. Usato per utenti non loggati
 * / senza userId/email, così non vedono i commenti.
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

/**
 * Rimuove le proprietà "title" da day1/day2/day3/notes
 */
function removeTitles(obj) {
  if (!obj) return obj;

  const out = clone(obj);

  ["day1", "day2", "day3"].forEach((key) => {
    if (out[key]) delete out[key].title;
  });

  if (out.notes) delete out.notes.title;

  return out;
}

/**
 * Porta le chiavi day1/day2/day3 a DAY1/DAY2/DAY3
 */
function normalizeKeysToUppercase(obj) {
  if (!obj) return obj;

  const out = {};

  // ✅ supporta sia day1 che DAY1
  ["day1", "day2", "day3"].forEach((k) => {
    const upperK = k.toUpperCase();
    if (obj[upperK]) out[upperK] = obj[upperK];
    else if (obj[k]) out[upperK] = obj[k];
  });

  if (obj.notes) out.notes = obj.notes;

  return out;
}

/**
 * normalizza qualsiasi formato in stato React:
 *   { day1, day2, day3, notes }
 */
function normalizeNoteForState(raw) {
  // ✅ Se la colonna notes_user / notes_admin è TEXT con JSON dentro
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      raw = null;
    }
  }
  if (!raw) {
    return {
      day1: { items: "" },
      day2: { items: "" },
      day3: { items: "" },
      notes: { text: "" },
    };
  }

  const noTitles = removeTitles(raw);
  const upper = normalizeKeysToUppercase(noTitles); // DAY1, DAY2, DAY3, notes

  return {
    day1: upper.DAY1 || noTitles.day1 || { items: "" },
    day2: upper.DAY2 || noTitles.day2 || { items: "" },
    day3: upper.DAY3 || noTitles.day3 || { items: "" },
    notes: upper.notes || noTitles.notes || { text: "" },
  };
}

/**
 * prende lo stato React (day1/day2/day3/notes)
 * e lo porta nel formato DB (DAY1/DAY2/DAY3/notes)
 */
function normalizeNoteForDb(stateNote) {
  if (!stateNote) {
    return {
      DAY1: { items: "" },
      DAY2: { items: "" },
      DAY3: { items: "" },
      notes: { text: "" },
    };
  }

  return {
    DAY1: { items: stateNote.day1?.items ?? stateNote.DAY1?.items ?? "" },
    DAY2: { items: stateNote.day2?.items ?? stateNote.DAY2?.items ?? "" },
    DAY3: { items: stateNote.day3?.items ?? stateNote.DAY3?.items ?? "" },
    notes: { text: stateNote.notes?.text ?? "" },
  };
}

// ============ REPO ============

export function createNotesRepo(source = DATA_SOURCE, opts = {}) {
  const isRemote = source === DATA_SOURCE;

  const userId = opts.userId;
  const userEmail = opts.userEmail;

  const isAdmin = (userEmail || "").toLowerCase() === ADMIN_EMAIL.toLowerCase();

  // ========= ADMIN: LOAD =========
  // ========= ADMIN: LOAD =========
  async function loadAdminNotesFromStructure() {
    try {
      const { data, error } = await supabase
        .from("wc_matches_structure")
        .select("group_letter, match_index, notes_admin")
        .eq("user_email", ADMIN_EMAIL)
        .eq("match_index", 0); // 👈 SOLO MATCH 0

      if (error) {
        console.error("ADMIN LOAD FROM STRUCTURE ERROR:", error);
        return groupNotes ?? {};
      }

      // ✅ base hardcoded
      const merged = clone(groupNotes ?? {});

      // ✅ override dal DB
      for (const row of data ?? []) {
        const letter = row.group_letter;
        if (!letter) continue;
        if (!row.notes_admin) continue;

        // notes_admin può essere JSON o stringa JSON
        let raw = row.notes_admin;
        if (typeof raw === "string") {
          try {
            raw = JSON.parse(raw);
          } catch {
            raw = null;
          }
        }
        if (!raw) continue;

        merged[letter] = raw;
      }

      return merged;
    } catch (err) {
      console.error("ADMIN LOAD FROM STRUCTURE ERROR:", err);
      return groupNotes ?? {};
    }
  }

  // ========= ADMIN: SAVE =========
  async function saveAdminNotesToStructure({ notes, keysTouched }) {
    if (!keysTouched?.size) return;

    for (const groupLetter of keysTouched) {
      const payload = {
        notes_admin: notes?.[groupLetter] ?? null,
      };

      // 🔵 SALVA nella riga 0 (UPSERT: se non esiste la crea)
      const { error: err0 } = await supabase
        .from("wc_matches_structure")
        .upsert(
          {
            user_email: ADMIN_EMAIL,
            group_letter: groupLetter,
            match_index: 0,
            notes_admin: payload.notes_admin,
          },
          { onConflict: "user_email,group_letter,match_index" },
        );

      if (err0) {
        console.error(
          "ADMIN SAVE NOTES ERROR (index 0):",
          err0,
          "group_letter:",
          groupLetter,
        );
      }

      // 🔵 METTI "|" nelle righe 1..5
      for (let i = 1; i <= 5; i++) {
        const { error: errI } = await supabase
          .from("wc_matches_structure")
          .update({ notes_admin: "|" })
          .eq("user_email", ADMIN_EMAIL)
          .eq("group_letter", groupLetter)
          .eq("match_index", i);

        if (errI) {
          console.error(
            "ADMIN SAVE NOTES ERROR (index " + i + "):",
            errI,
            "group_letter:",
            groupLetter,
          );
        }
      }
    }
  }

  return {
    source,

    // ============ LOAD ============
    async load() {
      // ---------- LOCAL ----------
      if (!isRemote) {
        try {
          const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
          const parsed = saved ? JSON.parse(saved) : null;

          const base = { ...(groupNotes ?? {}), ...(parsed ?? {}) };

          const out = {};
          for (const g of Object.keys(base ?? {})) {
            out[g] = normalizeNoteForState(base[g]);
          }

          return out;
        } catch {
          const base = groupNotes ?? {};
          const out = {};
          for (const g of Object.keys(base ?? {})) {
            out[g] = normalizeNoteForState(base[g]);
          }
          return out;
        }
      }

      // ============ ADMIN PATH ============
      if (isAdmin) {
        const loaded = await loadAdminNotesFromStructure();

        const cleaned = {};
        for (const g of Object.keys(loaded ?? {})) {
          cleaned[g] = normalizeNoteForState(loaded[g]);
        }

        return cleaned;
      }

      // ============ NON-ADMIN PATH ============

      // utente senza email o userId → solo base stripComments
      if (!userEmail || !userId) {
        const base = stripComments(groupNotes);
        const out = {};
        for (const g of Object.keys(base ?? {})) {
          out[g] = normalizeNoteForState(base[g]);
        }
        return out;
      }

      // carica note utente da wc_matches_structure_userpron.notes_user
      // carica note utente da wc_matches_structure_userpron.notes_user
      const { data, error } = await supabase
        .from("wc_matches_structure_userpron")
        .select("group_letter, match_index, notes_user")
        .eq("user_email", userEmail)
        .eq("match_index", 0); // 👈 SOLO MATCH 0

      if (error) {
        console.error("LOAD USERPRON ERROR:", error);
        const base = stripComments(groupNotes);
        const out = {};
        for (const g of Object.keys(base ?? {})) {
          out[g] = normalizeNoteForState(base[g]);
        }
        return out;
      }

      // base: groupNotes senza commenti, normalizzati
      const base = stripComments(groupNotes);
      const merged = {};
      for (const g of Object.keys(base ?? {})) {
        merged[g] = normalizeNoteForState(base[g]);
      }

      // override con i dati utente
      for (const row of data ?? []) {
        merged[row.group_letter] = normalizeNoteForState(row.notes_user);
      }

      return merged;
    },

    // ============ SAVE ============
    async save({ notes, keysTouched }) {
      if (!keysTouched?.size) return;

      // ---------- LOCAL ----------
      if (!isRemote) {
        try {
          const current = JSON.parse(
            localStorage.getItem(LOCAL_STORAGE_KEY) || "{}",
          );
          const next = { ...current };
          for (const k of keysTouched) next[k] = notes?.[k] ?? null;
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
        } catch (e) {
          console.error("LOCAL SAVE ERROR:", e);
        }
        return;
      }

      // ============ ADMIN PATH ============
      if (isAdmin) {
        const notesToSave = {};
        for (const key of keysTouched) {
          notesToSave[key] = normalizeNoteForDb(notes[key]);
        }
        await saveAdminNotesToStructure({ notes: notesToSave, keysTouched });
        return;
      }

      // ============================
      //      NON-ADMIN PATH
      // ============================

      if (!userId || !userEmail) return;

      // aggiorna ogni gruppo toccato in wc_matches_structure_userpron
      for (const groupLetter of keysTouched) {
        const normalized = normalizeNoteForDb(notes[groupLetter]);

        // 🔵 SALVA le note dell’utente nella riga 0 (UPSERT: se non esiste la crea)
        const { error: err0 } = await supabase
          .from("wc_matches_structure_userpron")
          .upsert(
            {
              user_email: userEmail,
              group_letter: groupLetter,
              match_index: 0,
              notes_user: normalized,
            },
            { onConflict: "user_email,group_letter,match_index" },
          );

        if (err0) {
          console.error(
            "SAVE USERPRON ERROR (index 0):",
            err0,
            "group_letter:",
            groupLetter,
          );
        }

        // 🔵 METTI "|" nelle righe 1..5
        for (let i = 1; i <= 5; i++) {
          const { error: errI } = await supabase
            .from("wc_matches_structure_userpron")
            .update({ notes_user: "|" })
            .eq("user_email", userEmail)
            .eq("group_letter", groupLetter)
            .eq("match_index", i);

          if (errI) {
            console.error(
              "SAVE USERPRON ERROR (index " + i + "):",
              errI,
              "group_letter:",
              groupLetter,
            );
          }
        }
      }
    },
  };
}
