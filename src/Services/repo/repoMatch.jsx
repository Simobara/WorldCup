import {
  ADMIN_EMAIL,
  DATA_SOURCE,
  LOCAL_STORAGE_KEY,
} from "../../START/app/0main";
import { groupMatches } from "../../START/app/1GroupMatches";
import { supabase } from "../supabase/supabaseClient";

// clone safe
function clone(x) {
  if (typeof structuredClone === "function") return structuredClone(x);
  return JSON.parse(JSON.stringify(x ?? null));
}

// base “pulita” per non-admin (solo struttura)
function stripForNonAdmin(fileBase) {
  const out = {};
  for (const k of Object.keys(fileBase ?? {})) {
    out[k] = {
      plusRis: Array.from(
        {
          length: Object.values(fileBase[k] ?? {})
            .filter((v) => v?.matches)
            .reduce((acc, g) => acc + g.matches.length, 0),
        },
        () => ({ a: "", b: "" })
      ),
      __edited: false,
    };
  }
  return out;
}

// costruisce la base DAL FILE (admin)
function buildBaseFromFile(fileBase) {
  const out = {};
  for (const letter of Object.keys(fileBase ?? {})) {
    // quante partite ci sono nel gruppo?
    const matchesCount = Object.values(fileBase[letter] ?? {})
      .filter((v) => v?.matches)
      .reduce((acc, g) => acc + g.matches.length, 0);

    out[letter] = {
      plusRis: Array.from({ length: matchesCount }, () => ({ a: "", b: "" })),
      __edited: false,
    };
  }
  return out;
}

export function createMatchesRepo(source = DATA_SOURCE, opts = {}) {
  const isRemote = source === DATA_SOURCE;

  const userId = opts.userId;
  const userEmail = opts.userEmail;
  const isAdmin = (userEmail || "").toLowerCase() === ADMIN_EMAIL.toLowerCase();

  // base dal file
  const fileBaseAdmin = buildBaseFromFile(groupMatches);
  const fileBaseNonAdmin = stripForNonAdmin(groupMatches);

  return {
    source,

    // ---------- LOAD ----------
    async load() {
      // ===== LOCAL =====
      if (!isRemote) {
        try {
          const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
          const parsed = saved ? JSON.parse(saved) : {};
          return { ...(isAdmin ? fileBaseAdmin : fileBaseNonAdmin), ...parsed };
        } catch {
          return isAdmin ? fileBaseAdmin : fileBaseNonAdmin;
        }
      }

      // ===== REMOTE =====
      // non loggato
      if (!userId) {
        return isAdmin ? fileBaseAdmin : fileBaseNonAdmin;
      }

      // 1) leggi DB
      let { data, error } = await supabase
        .from("matches_pron")
        .select("key, data")
        .eq("user_id", userId);

      if (error) {
        console.error("MATCHES LOAD ERROR:", error);
        return isAdmin ? fileBaseAdmin : fileBaseNonAdmin;
      }

      // 2) ADMIN seed (prima volta)
      if (isAdmin && (!data || data.length === 0)) {
        const payload = Object.keys(fileBaseAdmin).map((k) => ({
          user_id: userId,
          key: k,
          data: fileBaseAdmin[k],
        }));

        const { error: seedErr } = await supabase
          .from("matches_pron")
          .upsert(payload, { onConflict: "user_id,key" });

        if (seedErr) {
          console.warn("ADMIN MATCHES SEED WARN:", seedErr);
          return fileBaseAdmin;
        }

        const res2 = await supabase
          .from("matches_pron")
          .select("key, data")
          .eq("user_id", userId);

        data = res2.data ?? [];
      }

      // 3) NON-ADMIN seed (prima volta)
      if (!isAdmin && (!data || data.length === 0)) {
        const payload = Object.keys(fileBaseNonAdmin).map((k) => ({
          user_id: userId,
          key: k,
          data: fileBaseNonAdmin[k],
        }));

        await supabase
          .from("matches_pron")
          .upsert(payload, { onConflict: "user_id,key" });

        const res3 = await supabase
          .from("matches_pron")
          .select("key, data")
          .eq("user_id", userId);

        data = res3.data ?? [];
      }

      // 4) DB → map
      const fromDb = {};
      for (const row of data ?? []) fromDb[row.key] = row.data;

      // 5) base
      const base = isAdmin ? fileBaseAdmin : fileBaseNonAdmin;
      const merged = clone(base);

      // 6) merge (DB vince)
      for (const k of Object.keys(fromDb)) {
        if (fromDb[k]) merged[k] = fromDb[k];
      }

      return merged;
    },

    // ---------- SAVE ----------
    async save({ matches, keysTouched }) {
      if (!keysTouched?.size) return;

      // marca edit (solo non-admin)
      if (!isAdmin && matches) {
        for (const k of keysTouched) {
          matches[k] = matches[k] ?? {};
          matches[k].__edited = true;
        }
      }

      // ===== LOCAL =====
      if (!isRemote) {
        try {
          const current = JSON.parse(
            localStorage.getItem(LOCAL_STORAGE_KEY) || "{}"
          );
          const next = { ...current };
          for (const k of keysTouched) next[k] = matches?.[k] ?? null;
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
        } catch (e) {
          console.error("MATCHES LOCAL SAVE ERROR:", e);
        }
        return;
      }

      // ===== REMOTE =====
      if (!userId) return;

      const payload = Array.from(keysTouched).map((k) => ({
        user_id: userId,
        key: k,
        data: matches?.[k] ?? null,
      }));

      const { error } = await supabase
        .from("matches_pron")
        .upsert(payload, { onConflict: "user_id,key" });

      if (error) console.error("MATCHES SAVE ERROR:", error);
    },
  };
}
