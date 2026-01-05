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
    // calcolo quante partite ci sono nel gruppo (non-admin)
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
    // prendo tutte le partite del gruppo nello stesso ordine del file
    const matchesFlat = Object.values(fileBase[letter] ?? {})
      .filter((v) => v?.matches)
      .flatMap((g) => g.matches ?? []);

    const matchesCount = matchesFlat.length;

    // ✅ seed pron dal file (può essere "1" | "2" | "X" | "")
    const plusPronFromFile = matchesFlat.map((m) =>
      String(m?.pron ?? "").trim()
    );

    // ✅ seed ris dal file (es. "0-1") → {a:"0", b:"1"}
    // se ris è vuoto/spazio → {a:"", b:""}
    const plusRisFromFile = matchesFlat.map((m) => {
      const raw = String(m?.ris ?? "").trim(); // es: "0-1"
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
  const cacheKey = userId ? `${userId}:${isAdmin ? "admin" : "user"}` : null;

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
      // ✅ CACHE: se ho già dati in memoria per questo user, li ritorno subito

      const cached = cacheKey ? MEMORY_CACHE_BY_USER.get(cacheKey) : null;
      if (cached) return cached;

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

      // ✅ MIGRAZIONI SOFT (admin + non-admin)
      let didFix = false;
      const keysFixed = new Set();

      // ✅ FIX A: plusRisEdited deve esistere per TUTTI
      // - Se manca, la creo
      // - Se nel DB ci sono già numeri in plusRis, segno edited=true su quegli indici
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

      // ✅ FIX B: plusPron seed dal file SOLO admin (per retro-compatibilità)
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

      // ✅ se ho riparato, salvo subito su DB (remote)
      if (didFix && isRemote && userId && keysFixed.size) {
        const payload = Array.from(keysFixed).map((k) => ({
          user_id: userId,
          key: k,
          data: merged?.[k] ?? null,
        }));

        const { error: fixSaveErr } = await supabase
          .from("matches_pron")
          .upsert(payload, { onConflict: "user_id,key" });

        if (fixSaveErr) console.warn("MATCHES FIX SAVE WARN:", fixSaveErr);
      }
      MEMORY_CACHE_BY_USER.set(cacheKey, merged);

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
      // ✅ aggiorna cache locale subito (se possibile)
      try {
        const prev = cacheKey ? MEMORY_CACHE_BY_USER.get(cacheKey) || {} : {};
        const next = { ...prev };
        for (const k of keysTouched) next[k] = matches?.[k] ?? null;
        if (cacheKey) MEMORY_CACHE_BY_USER.set(cacheKey, next);
      } catch {}
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
