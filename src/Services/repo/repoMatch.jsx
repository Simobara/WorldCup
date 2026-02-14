import {
  ADMIN_EMAIL,
  DATA_SOURCE,
  LOCAL_STORAGE_KEY,
} from "../../START/app/0main";
import { groupMatches } from "../../START/app/1GroupMatches";
import { supabase } from "../supabase/supabaseClient";

// helper email
function normEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

// clone safe
function clone(x) {
  if (typeof structuredClone === "function") return structuredClone(x);
  return JSON.parse(JSON.stringify(x ?? null));
}

// carica tutti i pronostici/scores dell'utente
export async function loadUserMatches(userEmail) {
  const emailNorm = normEmail(userEmail);
  if (!emailNorm) return {};

  // ⛔️ l'ADMIN usa un'altra tabella, qui niente
  if (emailNorm === normEmail(ADMIN_EMAIL)) {
    return {};
  }

  const { data, error } = await supabase
    .from("wc_matches_structure_userpron")
    .select("match_index, user_pron, user_ris")
    .eq("user_email", emailNorm);

  if (error) {
    console.error("LOAD wc_matches_structure_userpron ERROR:", error);
    return {};
  }

  const out = {};
  (data || []).forEach((row) => {
    let ris = "";
    const raw = (row.user_ris ?? "").toString().trim();

    if (!raw) {
      ris = "";
    } else if (raw.startsWith("{")) {
      try {
        const parsed = JSON.parse(raw);
        const a = String(parsed?.a ?? "").trim();
        const b = String(parsed?.b ?? "").trim();
        ris = a !== "" && b !== "" ? `${a}-${b}` : "";
      } catch {
        ris = "";
      }
    } else {
      ris = raw;
    }

    out[row.match_index] = {
      pron: row.user_pron || "",
      ris,
    };
  });

  return out;
}

// ✅ SALVA / AGGIORNA UN SINGOLO MATCH DELL'UTENTE
export async function saveUserMatch({
  userId,
  userEmail,
  match_index,
  team1,
  team2,
  group_letter,
  user_pron,
  user_ris, // può arrivare come "2-1" oppure {a,b}
}) {
  const emailNorm = normEmail(userEmail);

  if (!userId || !emailNorm) {
    console.warn("saveUserMatch: manca userId o userEmail");
    return;
  }

  // ⛔️ l'ADMIN NON deve salvare in wc_matches_structure_userpron
  if (emailNorm === normEmail(ADMIN_EMAIL)) {
    return;
  }

  // 🔄 normalizza user_ris nel formato "a-b" oppure null
  let normalizedUserRis = null;

  if (typeof user_ris === "string") {
    const trimmed = user_ris.trim();

    if (!trimmed) {
      normalizedUserRis = null;
    } else if (trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed);
        const a = String(parsed?.a ?? "").trim();
        const b = String(parsed?.b ?? "").trim();
        normalizedUserRis = a !== "" && b !== "" ? `${a}-${b}` : null;
      } catch {
        normalizedUserRis = null;
      }
    } else {
      normalizedUserRis = trimmed;
    }
  } else if (user_ris && typeof user_ris === "object") {
    const a = String(user_ris.a ?? "").trim();
    const b = String(user_ris.b ?? "").trim();
    normalizedUserRis = a !== "" && b !== "" ? `${a}-${b}` : null;
  }

  const payload = {
    user_id: userId,
    user_email: emailNorm, // ✅ SEMPRE normalizzata
    match_index,
    team1,
    team2,
    group_letter,
    user_pron,
    user_ris: normalizedUserRis,
  };

  const { error } = await supabase
    .from("wc_matches_structure_userpron")
    .upsert(payload, {
      onConflict: "user_email,group_letter,match_index",
    });

  if (error) {
    console.error("SAVE wc_matches_structure_userpron ERROR:", error);
  }
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
      String(m?.pron ?? "").trim(),
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

  const emailNorm = normEmail(userEmail);
  const isAdmin = emailNorm && emailNorm === normEmail(ADMIN_EMAIL);

  // ✅ cacheKey usa email normalizzata (evita doppioni per maiuscole)
  const cacheKey = emailNorm
    ? `${emailNorm}:${isAdmin ? "admin" : "user"}`
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
      if (!emailNorm) {
        return isAdmin ? fileBaseAdmin : fileBaseNonAdmin;
      }

      // ===== REMOTE =====
      if (!userId) {
        return isAdmin ? fileBaseAdmin : fileBaseNonAdmin;
      }

      // cache in memoria (per utente)
      if (!forceRefresh && cacheKey) {
        const cached = MEMORY_CACHE_BY_USER.get(cacheKey);
        if (cached) return cached;
      }

      // base di partenza (dal file)
      const base = isAdmin ? fileBaseAdmin : fileBaseNonAdmin;
      const merged = clone(base);

      // ⛔️ ADMIN: NON deve leggere i pronostici da wc_matches_structure_userpron
      if (isAdmin) {
        if (cacheKey) MEMORY_CACHE_BY_USER.set(cacheKey, merged);
        return merged;
      }

      // 1) leggi tutte le righe dei pronostici per questo utente (email normalizzata)
      const { data, error } = await supabase
        .from("wc_matches_structure_userpron")
        .select("group_letter, match_index, user_pron, user_ris")
        .eq("user_email", emailNorm)
        .order("group_letter", { ascending: true })
        .order("match_index", { ascending: true });

      if (error) {
        console.error(
          "MATCHES LOAD wc_matches_structure_userpron ERROR:",
          error,
        );
        return merged;
      }

      // 2) DB → merge su struttura base
      for (const row of data ?? []) {
        const letter = row.group_letter;
        if (!letter) continue;

        const idx = Number(row.match_index);
        if (!Number.isFinite(idx) || idx < 0) continue;

        const obj = merged[letter] || {
          plusRis: [],
          plusPron: [],
          plusRisEdited: [],
          __edited: false,
        };

        if (!Array.isArray(obj.plusRis)) obj.plusRis = [];
        if (!Array.isArray(obj.plusPron)) obj.plusPron = [];
        if (!Array.isArray(obj.plusRisEdited)) obj.plusRisEdited = [];

        while (obj.plusRis.length <= idx) obj.plusRis.push({ a: "", b: "" });
        while (obj.plusPron.length <= idx) obj.plusPron.push("");
        while (obj.plusRisEdited.length <= idx) obj.plusRisEdited.push(false);

        let a = "";
        let b = "";
        const rawRis = String(row.user_ris ?? "").trim();

        if (rawRis && rawRis.includes("-")) {
          const [sa, sb] = rawRis.split("-");
          a = String(sa ?? "").trim();
          b = String(sb ?? "").trim();
        }

        const pron = String(row.user_pron ?? "")
          .trim()
          .toUpperCase();

        if (a !== "" || b !== "") {
          obj.plusRis[idx] = { a, b };
          obj.plusRisEdited[idx] = true;
          obj.__edited = true;
        }

        if (pron) {
          obj.plusPron[idx] = pron;
          obj.__edited = true;
        }

        merged[letter] = obj;
      }

      if (cacheKey) MEMORY_CACHE_BY_USER.set(cacheKey, merged);
      return merged;
    },

    // ---------- SAVE ----------
    async save({ matches, keysTouched }) {
      if (!keysTouched?.size) return;

      // ⛔️ ADMIN: NON deve salvare i pronostici in wc_matches_structure_userpron
      if (isAdmin) return;

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
            localStorage.getItem(LOCAL_STORAGE_KEY) || "{}",
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
      if (!userId || !emailNorm) return;

      // aggiorna cache in memoria
      try {
        if (cacheKey) {
          const prev = MEMORY_CACHE_BY_USER.get(cacheKey) || {};
          const next = { ...prev };
          for (const k of keysTouched) next[k] = matches?.[k] ?? null;
          MEMORY_CACHE_BY_USER.set(cacheKey, next);
        }
      } catch {
        // ignore
      }

      // ✅ salva SEMPRE pron (1/X/2) anche senza ris
      const rows = [];

      for (const letter of keysTouched) {
        const obj = matches?.[letter];
        if (!obj) continue;

        const plusPron = Array.isArray(obj.plusPron) ? obj.plusPron : [];
        const plusRis = Array.isArray(obj.plusRis) ? obj.plusRis : [];

        const maxLen = Math.max(plusPron.length, plusRis.length);

        for (let idx = 0; idx < maxLen; idx++) {
          const p = String(plusPron[idx] ?? "")
            .trim()
            .toUpperCase();
          const a = String(plusRis[idx]?.a ?? "").trim();
          const b = String(plusRis[idx]?.b ?? "").trim();
          const ris = a !== "" && b !== "" ? `${a}-${b}` : null;

          // se vuoi evitare righe “vuote” nel DB, puoi saltarle:
          // if (!p && !ris) continue;

          rows.push({
            user_id: userId,
            user_email: emailNorm,
            group_letter: letter,
            match_index: idx,
            user_pron: p || null,
            user_ris: ris,
          });
        }
      }

      if (rows.length) {
        const { error } = await supabase
          .from("wc_matches_structure_userpron")
          .upsert(rows, { onConflict: "user_email,group_letter,match_index" });

        if (error) {
          console.error(
            "SAVE wc_matches_structure_userpron (bulk) ERROR:",
            error,
          );
        }
      }
    },
  };
}
