import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const location = useLocation();

  const containerRef = useRef(null);
  const btnRefs = useRef([]);

  const [phase, setPhase] = useState("idle"); // idle | expand | snap
  const [activePath, setActivePath] = useState(location.pathname);

  const [slider, setSlider] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  });

  // sync (back/forward o link esterni)
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

  // allinea slider quando siamo fermi
  useLayoutEffect(() => {
    if (phase !== "idle") return;

    const idx = routes.findIndex((r) => r.path === activePath);
    const data = readBtn(idx);
    if (!data) return;

    setSlider(data);
  }, [activePath, phase]);

  // resize safety
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

    // evidenzia subito (non aspetta location)
    setActivePath(path);

    const u = unionBox(from, to);

    // start: quadrato iniziale
    setSlider(from);
    setPhase("expand");

    requestAnimationFrame(() => {
      // 1) rettangolo che unisce
      setSlider(u);

      // 2) snap elastico verso target (quadrato finale)
      setTimeout(() => {
        setPhase("snap");
        setSlider(to);
      }, EXPAND_MS);

      // 3) naviga DURANTE snap (meno attesa percepita)
      setTimeout(
        () => {
          navigate(path);
        },
        EXPAND_MS + Math.max(0, SNAP_MS - NAV_OFFSET)
      );

      // 4) fine
      setTimeout(() => {
        setPhase("idle");
      }, EXPAND_MS + SNAP_MS);
    });
  };

  return (
    <div
      ref={containerRef}
      className="
        absolute top-[54%] right-0 -translate-y-1/2
        md:top-0 md:right-auto md:left-1/2 md:-translate-x-1/2 md:translate-y-0
        w-auto md:w-[100%] md:max-w-[420px]
        bg-slate-900  border-gray-400 shadow-lg

        border-l-4 border-t-none border-b-4 border-white-800
        rounded-tl-xl rounded-bl-xl
        rounded-tr-none rounded-br-none

        md:border-t-0
        md:rounded-tl-none md:rounded-tr-none
        md:rounded-bl-xl md:rounded-br-xl

        md:px-4 px-0  md:py-0 py-0 
        flex flex-col md:flex-row items-center justify-center md:gap-2 gap-2
        z-[999]
        outline-none focus:outline-none focus-visible:outline-none active:outline-none
        
      "
    >
      {/* SLIDER UNICO (più piccolo in mobile) */}
      <div
        className="absolute bg-red-900 rounded-md pointer-events-none h-8 md:h-12"
        style={{
          left: slider.left,
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

      {/* BOTTONI (più piccoli in mobile) */}
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
    </div>
  );
}
