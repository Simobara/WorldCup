/* -----------------------------------------------------------------------------
📄 File: TopInfo.jsx
Scopo: barra di navigazione principale con animazione slider
       e gestione login admin (Supabase).

🔹 Include:
- Navigazione tra le pagine (router)
- Indicatore attivo animato
- Pulsante login/logout admin
- Modale di login + signup (desktop)

Note:
- Sempre visibile sopra le pagine
- Layout responsive (mobile / desktop)
------------------------------------------------------------------------------*/
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../Services/supabase/supabaseClient";

const routes = [
  { path: "/standingsPage", icon: "🗓️" },
  { path: "/groupMatchesPage", icon: "⏱️" },
  { path: "/groupRankPage", icon: "📊" },
  { path: "/tablePage", icon: "📈" },
];

const EASE_ELASTIC = "cubic-bezier(0.34, 1.56, 0.64, 1)";
const EXPAND_MS = 200;
const SNAP_MS = 200;
const NAV_OFFSET = 10;

export default function TopInfo() {
  const location = useLocation();
  const navigate = useNavigate();

  const [phase, setPhase] = useState("idle"); // idle | expand | snap
  const [activePath, setActivePath] = useState(location.pathname);
  const [slider, setSlider] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  });

  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [openLogin, setOpenLogin] = useState(false);

  // ✅ NEW: per rilevare cambi login/logout
  const prevLoggedRef = useRef(null);

  // ✅ NEW: stato “email non confermata”
  const [pendingEmail, setPendingEmail] = useState(null); // string | null

  const isLogged = !!session?.user;

  const containerRef = useRef(null);
  const btnRefs = useRef([]);

  // ADMIN: visibile solo se loggato come simobara@hotmail.it
  const isAdmin =
    isLogged &&
    (session?.user?.email || "").trim().toLowerCase() === "simobara@hotmail.it";

  const logout = async () => {
    await supabase.auth.signOut();
    setOpenLogin(false);
  };

  const handleAuthButton = () => {
    if (isLogged) return logout(); // logout SEMPRE possibile
    setOpenLogin(true);
  };

  // ROTTE VISIBILI NELLO SLIDER NAV (SOLO UTENTE)
  const routes = [
    { path: "/standingsPage", icon: "🗓️" },
    { path: "/groupMatchesPage", icon: "⏱️" },
    { path: "/groupRankPage", icon: "📊" },
    { path: "/tablePage", icon: "📈" },
  ];

  // // Se admin → aggiungi anche il tab 🛠️ nello slider
  // const routes = isAdmin
  //   ? [...baseRoutes, { path: "/admin/seed-structure", icon: "🛠️" }]
  //   : baseRoutes;

  //---------------------------------------------------------
  // ✅ ogni volta che cambia login/logout → reset su standings
  // ✅ ogni volta che cambia login/logout → reset su standings
  useEffect(() => {
    // primo render: inizializza e basta
    if (prevLoggedRef.current === null) {
      prevLoggedRef.current = isLogged;
      return;
    }

    // se è cambiato (login → logout o logout → login)
    if (prevLoggedRef.current !== isLogged) {
      prevLoggedRef.current = isLogged;

      // forza la tab attiva
      setActivePath("/standingsPage");
      setPhase("idle");

      // ⬇️ reset immediato dello slider sulla prima icona
      const btn0 = btnRefs.current[0];
      const cont = containerRef.current;
      if (btn0 && cont) {
        const b = btn0.getBoundingClientRect();
        const c = cont.getBoundingClientRect();
        setSlider({
          left: b.left - c.left,
          top: b.top - c.top,
          width: b.width,
          height: b.height,
        });
      }

      // naviga alla pagina standings
      navigate("/standingsPage", { replace: true });
    }
  }, [isLogged, navigate]);

  useEffect(() => {
    let alive = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setSession(data.session);
      setAuthReady(true);
      if (data.session) {
        // setOpenLogin(false); // NON chiudere automaticamente
        setPendingEmail(null); // ✅ se sei loggato, resetta pending
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (!alive) return;
        setSession(newSession);
        setAuthReady(true);
        if (!newSession) setOpenLogin(false); // sessione persa → torna a 🔐
        if (newSession) {
          // setOpenLogin(false); // NON chiudere automaticamente
          setPendingEmail(null); // ✅ se arriva sessione valida, resetta pending
        }
      }
    );

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (phase === "idle") setActivePath(location.pathname);
  }, [location.pathname, phase]);

  const readBtn = (idx) => {
    const btn = btnRefs.current[idx];
    const cont = containerRef.current;
    if (!btn || !cont) return null;
    const b = btn.getBoundingClientRect();
    const c = cont.getBoundingClientRect();
    return {
      left: b.left - c.left,
      top: b.top - c.top,
      width: b.width,
      height: b.height,
    };
  };

  const unionBox = (a, b) => {
    const aRight = a.left + a.width;
    const aBottom = a.top + a.height;
    const bRight = b.left + b.width;
    const bBottom = b.top + b.height;
    const left = Math.min(a.left, b.left);
    const top = Math.min(a.top, b.top);
    const right = Math.max(aRight, bRight);
    const bottom = Math.max(aBottom, bBottom);
    return { left, top, width: right - left, height: bottom - top };
  };

  useLayoutEffect(() => {
    if (phase !== "idle") return;
    const idx = routes.findIndex((r) => r.path === activePath);
    const data = readBtn(idx);
    if (!data) return;
    setSlider(data);
  }, [activePath, phase]);

  useEffect(() => {
    const onResize = () => {
      if (phase !== "idle") return;
      const idx = routes.findIndex((r) => r.path === activePath);
      const data = readBtn(idx);
      if (!data) return;
      setSlider(data);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activePath, phase]);

  const handleClick = (path) => {
    if (phase !== "idle") return;
    if (path === activePath) return;

    const fromIdx = routes.findIndex((r) => r.path === activePath);
    const toIdx = routes.findIndex((r) => r.path === path);
    if (toIdx === -1) return;

    const from = readBtn(fromIdx);
    const to = readBtn(toIdx);
    if (!from || !to) return;

    setActivePath(path);
    const u = unionBox(from, to);
    setSlider(from);
    setPhase("expand");

    requestAnimationFrame(() => {
      setSlider(u);

      setTimeout(() => {
        setPhase("snap");
        setSlider(to);
      }, EXPAND_MS);

      setTimeout(
        () => {
          navigate(path);
        },
        EXPAND_MS + Math.max(0, SNAP_MS - NAV_OFFSET)
      );

      setTimeout(() => {
        setPhase("idle");
      }, EXPAND_MS + SNAP_MS);
    });
  };

  // ✅ NEW: icona auth con priorità "pending"
  const authIcon = isLogged
    ? "🔑"
    : pendingEmail
      ? "✉️"
      : authReady
        ? "🔐"
        : "⏳";

  return (
    <div
      ref={containerRef}
      className="
        absolute top-[54%] right-0 -translate-y-1/2
        md:top-0 md:right-auto md:left-1/2 md:-translate-x-1/2 md:translate-y-0
        w-auto md:w-[100%] md:max-w-[420px]
        bg-slate-900 border-gray-400 shadow-lg
        border-l-4 
        border-t-none 
        border-b-4 b
        border-white-800
        rounded-tl-xl rounded-bl-xl
        rounded-tr-none rounded-br-none
        md:border-t-0
        md:border-b-4
        md:rounded-tl-none 
        md:rounded-tr-none
        md:rounded-bl-xl md:rounded-br-xl
        md:px-4 px-0 md:py-0 py-0
        flex flex-col md:flex-row items-center justify-center md:gap-2 gap-2
        z-[999]
        outline-none focus:outline-none focus-visible:outline-none active:outline-none
      "
    >
      {/* RED BORDER EXACT OVERLAY */}
      <div
        className="
          absolute
          pointer-events-none
        
          md:w-[35%]
          left-[16.9rem]
          md:top-[2rem], top-0
        
          bottom-0
          
          
          border-gray-400
        
          rounded-tl-xl rounded-bl-xl
          rounded-tr-none rounded-br-none

          border-l-4
          

          md:border-t-0
          md:border-b-2, border-b-4
          md:rounded-tl-none
          md:rounded-tr-none
          md:rounded-bl-xl
          md:rounded-br-xl
        "
      />

      {/* SLIDER */}
      <div
        className="absolute bg-red-900 rounded-md pointer-events-none h-8 md:h-12"
        style={{
          left: slider.left - 4,
          top: slider.top,
          width: slider.width,
          height: slider.height,
          transitionProperty: "left, top, width, height",
          transitionDuration:
            phase === "expand"
              ? `${EXPAND_MS}ms`
              : phase === "snap"
                ? `${SNAP_MS}ms`
                : "0ms",
          transitionTimingFunction:
            phase === "snap" ? EASE_ELASTIC : "ease-out",
        }}
      />

      {/* NAV + ADMIN SLOT + LOGIN */}
      <div className="flex items-center gap-2">
        {/* NAV BUTTONS (slider) */}
        {routes.map((r, i) => (
          <button
            key={r.path}
            ref={(el) => (btnRefs.current[i] = el)}
            onClick={() => handleClick(r.path)}
            className={`
              relative z-10
              w-8 h-8 md:w-12 md:h-12
              flex items-center justify-center
              text-base md:text-2xl
              cursor-pointer select-none
              ${activePath === r.path ? "text-white" : "text-gray-900"}
            `}
            type="button"
          >
            {r.icon}
          </button>
        ))}

        {/* SLOT FISSO PER ADMIN (stessa larghezza SEMPRE) */}
        <div
          className="
            relative z-10
            w-8 h-8 md:w-12 md:h-12
            flex items-center justify-center
          "
        >
          {isAdmin && (
            <button
              type="button"
              onClick={() => navigate("/admin/seed-structure")}
              className="
                w-8 h-8 md:w-12 md:h-12
                flex items-center justify-center
                text-base md:text-2xl
                text-yellow-300
                hover:bg-white/10
                rounded-md
              "
              title="Admin"
            >
              🛠️
            </button>
          )}
        </div>

        {/* AUTH BUTTON (sempre l’ULTIMO) */}
        <button
          type="button"
          onClick={handleAuthButton}
          className={`
            relative z-10
            w-8 h-8 md:w-12 md:h-12
            flex items-center justify-center
            text-base md:text-2xl
            rounded-md
            transition-colors
            ${isLogged ? "text-white hover:bg-white/10" : "grayscale brightness-75 opacity-80"}
            disabled:opacity-60
          `}
          title={
            pendingEmail
              ? "Conferma email richiesta"
              : isLogged
                ? "Logout"
                : "Login"
          }
        >
          {authIcon}
        </button>
      </div>

      {/* ADMIN BUTTON: solo per simobara@hotmail.it */}
      {/* ADMIN BUTTON: solo per simobara@hotmail.it */}
      {/* {isAdmin && (
        <button
          type="button"
          onClick={() => navigate("/admin/seed-structure")}
          className="
      relative z-10
      w-8 h-8 md:w-12 md:h-12
      flex items-center justify-center
      text-base md:text-2xl
      text-yellow-300
      hover:bg-white/10
    "
          title=""
        >
          🛠️
        </button>
      )} */}

      {openLogin && !isLogged && (
        <LoginModal
          onClose={() => setOpenLogin(false)}
          pendingEmail={pendingEmail}
          setPendingEmail={setPendingEmail}
        />
      )}
    </div>
  );
}

function LoginModal({ onClose, pendingEmail, setPendingEmail }) {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState(pendingEmail ?? "");
  const PW_KEY_PREFIX = "wc26_pw:";
  const normEmail = (s) =>
    String(s || "")
      .trim()
      .toLowerCase();

  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const emailRef = useRef(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  useEffect(() => {
    const key = PW_KEY_PREFIX + normEmail(email);
    const savedPw = localStorage.getItem(key) || "";
    if (savedPw) setPassword(savedPw);
  }, [email]);

  const isPending = !!pendingEmail;

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setInfo("");
    setLoading(true);

    const { error } =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: "https://world-cup26.vercel.app/",
            },
          });

    setLoading(false);

    if (error) {
      // ✅ NEW: gestisci “email non confermata”
      const msg = (error.message || "").toLowerCase();
      if (msg.includes("email not confirmed")) {
        setPendingEmail(email);
        setErr("");
        setInfo(
          "✉️ Revisa la tua email per confermare. Poi torna qui e fai Login."
        );
        return;
      }

      setErr(error.message);
      return;
    }

    // signup ok: informa che deve controllare mail (se conferma attiva)
    if (mode === "signup") {
      setPendingEmail(email);
      setInfo("✉️ Controlla la tua email e conferma l’account. Poi fai Login.");
      return;
    }

    localStorage.setItem(PW_KEY_PREFIX + normEmail(email), password);
    onClose();
  };

  // ✅ NEW: reinvia email conferma
  const resend = async () => {
    setErr("");
    setInfo("");
    setLoading(true);
    try {
      // Supabase JS v2
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: "https://world-cup26.vercel.app/" },
      });

      if (error) {
        setErr(error.message);
      } else {
        setInfo("✉️ Email di conferma reinviata. Controlla inbox/spam.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-start bg-black/60 md:justify-center md:top-[10rem]">
      <div className="w-[320px] rounded-xl bg-slate-900 p-2 border border-white/10 md:mr-[0] mr-4 shadow-xl -ml-[12rem] md:ml-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="text-white font-semibold">User Login</div>

            {/* DESKTOP ONLY: Login / Sign up tabs */}
            <div className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`px-2 py-1 text-xs rounded-md ${
                  mode === "login"
                    ? "bg-white/15 text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`px-2 py-1 text-xs rounded-md ${
                  mode === "signup"
                    ? "bg-white/15 text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Sign up
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/70 hover:text-white"
            type="button"
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={submit}
          autoComplete="on"
          className="flex flex-col gap-2"
        >
          <input
            ref={emailRef}
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            inputMode="email"
            className="rounded-md bg-slate-800 border border-white/10 px-3 py-2 text-white text-sm"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPw ? "text" : "password"}
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              autoCapitalize="none"
              spellCheck={false}
              inputMode="text"
              className="w-full rounded-md bg-slate-800 border border-white/10 px-3 py-2 pr-10 text-white text-sm"
              placeholder="password"
              value={password}
              onChange={(e) => {
                const v = e.target.value;
                setPassword(v);
                const key = PW_KEY_PREFIX + normEmail(email);
                if (normEmail(email)) localStorage.setItem(key, v);
              }}
            />

            {/* 👁️ toggle show/hide password */}
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
            >
              {showPw ? "🗨" : "👁️‍🗨️"}
            </button>
          </div>

          {info && <div className="text-xs text-emerald-300 mt-1">{info}</div>}
          {err && <div className="text-xs text-red-300 mt-1">{err}</div>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-md bg-white/10 hover:bg-white/20 text-white py-2 text-sm disabled:opacity-60"
          >
            {loading
              ? mode === "login"
                ? "Logging in..."
                : "Creating account..."
              : mode === "login"
                ? "Login"
                : "Create account"}
          </button>

          {/* ✅ NEW: se pending, offri resend */}
          {isPending && (
            <button
              type="button"
              onClick={resend}
              disabled={loading}
              className="rounded-md bg-white/5 hover:bg-white/10 text-white/80 py-2 text-xs disabled:opacity-60"
            >
              Reinvia email di conferma
            </button>
          )}

          <div className="hidden md:block text-[11px] text-white/40 mt-1">
            {mode === "signup"
              ? "Crea un nuovo account con email e password."
              : "Accedi con email e password."}
          </div>
        </form>
      </div>
    </div>
  );
}
