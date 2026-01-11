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
    const matchesCount = Object.values(fileBase[k] ?? {})
      .filter((v) => v?.matches)
      .reduce((acc, g) => acc + g.matches.length, 0);

    out[k] = {
      plusRis: Array.from({ length: matchesCount }, () => ({ a: "", b: "" })),
      plusPron: Array.from({ length: matchesCount }, () => ""),
      plusRisEdited: Array.from({ length: matchesCount }, () => false),
      __edited: false,
    };
  }
  return out;
}

// costruisce la base DAL FILE (admin) + seed pron/ris dal file
function buildBaseFromFile(fileBase) {
  const out = {};
  for (const letter of Object.keys(fileBase ?? {})) {
    const matchesFlat = Object.values(fileBase[letter] ?? {})
      .filter((v) => v?.matches)
      .flatMap((g) => g.matches ?? []);

    const matchesCount = matchesFlat.length;

    const plusPronFromFile = matchesFlat.map((m) =>
      String(m?.pron ?? "").trim()
    );

    const plusRisFromFile = matchesFlat.map((m) => {
      const raw = String(m?.ris ?? "").trim();
      const parts = raw.split("-").map((s) => s.trim());
      const a = parts?.[0] && /^\d+$/.test(parts[0]) ? parts[0] : "";
      const b = parts?.[1] && /^\d+$/.test(parts[1]) ? parts[1] : "";
      return { a, b };
    });

    out[letter] = {
      plusRis: plusRisFromFile,
      plusPron: plusPronFromFile,
      plusRisEdited: Array.from({ length: matchesCount }, () => false),
      __edited: false,
    };
  }
  return out;
}

let MEMORY_CACHE_BY_USER = new Map();

export function createMatchesRepo(source = DATA_SOURCE, opts = {}) {
  const isRemote = source === DATA_SOURCE;

  const userId = opts.userId;
  const userEmail = opts.userEmail;
  const isAdmin = (userEmail || "").toLowerCase() === ADMIN_EMAIL.toLowerCase();

  // usiamo l'email come chiave di cache (coerente con il vincolo DB)
  const cacheKey =
    userEmail && userEmail.length
      ? `${userEmail}:${isAdmin ? "admin" : "user"}`
      : null;

  const fileBaseAdmin = buildBaseFromFile(groupMatches);
  const fileBaseNonAdmin = stripForNonAdmin(groupMatches);

  return {
    source,

    // ---------- LOAD ----------
    async load({ forceRefresh = false } = {}) {
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

      // se non ho email → tratto come non loggato
      if (!userEmail) {
        return isAdmin ? fileBaseAdmin : fileBaseNonAdmin;
      }

      // ===== REMOTE =====
      if (!userId) {
        return isAdmin ? fileBaseAdmin : fileBaseNonAdmin;
      }

      if (!forceRefresh && cacheKey) {
        const cached = MEMORY_CACHE_BY_USER.get(cacheKey);
        if (cached) return cached;
      }

      // 1) leggi DB per email
      let { data, error } = await supabase
        .from("matches_pron")
        .select("key, data")
        .eq("user_email", userEmail);

      if (error) {
        console.error("MATCHES LOAD ERROR:", error);
        return isAdmin ? fileBaseAdmin : fileBaseNonAdmin;
      }

      // 2) ADMIN seed (prima volta)
      if (isAdmin && (!data || data.length === 0)) {
        const payload = Object.keys(fileBaseAdmin).map((k) => ({
          user_id: userId,
          user_email: userEmail,
          key: k,
          data: fileBaseAdmin[k],
        }));

        const { error: seedErr } = await supabase
          .from("matches_pron")
          .upsert(payload, { onConflict: "key,user_email" });

        if (seedErr) {
          console.warn("ADMIN MATCHES SEED WARN:", seedErr);
          return fileBaseAdmin;
        }

        const res2 = await supabase
          .from("matches_pron")
          .select("key, data")
          .eq("user_email", userEmail);

        data = res2.data ?? [];
      }

      // 3) NON-ADMIN seed (prima volta)
      if (!isAdmin && (!data || data.length === 0)) {
        const payload = Object.keys(fileBaseNonAdmin).map((k) => ({
          user_id: userId,
          user_email: userEmail,
          key: k,
          data: fileBaseNonAdmin[k],
        }));

        await supabase
          .from("matches_pron")
          .upsert(payload, { onConflict: "key,user_email" });

        const res3 = await supabase
          .from("matches_pron")
          .select("key, data")
          .eq("user_email", userEmail);

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

      // ✅ MIGRAZIONI SOFT (admin + non-admin)
      let didFix = false;
      const keysFixed = new Set();

      // FIX A: plusRisEdited
      for (const k of Object.keys(merged ?? {})) {
        const obj = merged[k] ?? {};

        if (!Array.isArray(obj.plusRisEdited)) {
          const count = Array.isArray(obj.plusRis) ? obj.plusRis.length : 0;
          obj.plusRisEdited = Array.from({ length: count }, () => false);

          for (let i = 0; i < count; i++) {
            const a = String(obj.plusRis?.[i]?.a ?? "").trim();
            const b = String(obj.plusRis?.[i]?.b ?? "").trim();
            if (a !== "" || b !== "") obj.plusRisEdited[i] = true;
          }

          merged[k] = obj;
          didFix = true;
          keysFixed.add(k);
        }
      }

      // FIX B: plusPron seed dal file per admin
      if (isAdmin) {
        for (const k of Object.keys(fileBaseAdmin)) {
          const obj = merged[k] ?? {};
          const seed = fileBaseAdmin[k] ?? {};

          if (!Array.isArray(obj.plusPron)) {
            obj.plusPron = Array.isArray(seed.plusPron) ? seed.plusPron : [];
            merged[k] = obj;
            didFix = true;
            keysFixed.add(k);
          }
        }
      }

      // salva eventuali fix
      if (didFix && isRemote && userId && userEmail && keysFixed.size) {
        const payload = Array.from(keysFixed).map((k) => ({
          user_id: userId,
          user_email: userEmail,
          key: k,
          data: merged?.[k] ?? null,
        }));

        const { error: fixSaveErr } = await supabase
          .from("matches_pron")
          .upsert(payload, { onConflict: "key,user_email" });

        if (fixSaveErr) console.warn("MATCHES FIX SAVE WARN:", fixSaveErr);
      }

      if (cacheKey) MEMORY_CACHE_BY_USER.set(cacheKey, merged);

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
      if (!userId || !userEmail) return;

      // aggiorna cache
      try {
        if (cacheKey) {
          const prev = MEMORY_CACHE_BY_USER.get(cacheKey) || {};
          const next = { ...prev };
          for (const k of keysTouched) next[k] = matches?.[k] ?? null;
          MEMORY_CACHE_BY_USER.set(cacheKey, next);
        }
      } catch {}

      const payload = Array.from(keysTouched).map((k) => ({
        user_id: userId,
        user_email: userEmail,
        key: k,
        data: matches?.[k] ?? null,
      }));

      const { error } = await supabase
        .from("matches_pron")
        .upsert(payload, { onConflict: "key,user_email" });

      if (error) console.error("MATCHES SAVE ERROR:", error);
    },
  };
}
