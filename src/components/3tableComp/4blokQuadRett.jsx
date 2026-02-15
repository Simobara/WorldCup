// src/components/3tableComp/4blokQuadRett.jsx
import Quadrato from "./1quad";
import RettDat from "./2rettDat";
import RettRis from "./3rettRis";

const BlokQuadRett = ({
  firstSquareLabel = " ",
  secondSquareLabel = " ",
  firstTeamName = "",
  secondTeamName = "",
  firstTeamFlag = null,
  secondTeamFlag = null,

  // 🔹 nuove props logiche
  firstAdvanced = false,
  secondAdvanced = false,
  firstIsPron = false,
  secondIsPron = false,
  phase = "round32",

  rettLeftLabel = "A",
  rettRightLabel = "B",
  rettTimeLabel = "",
  rettColor = "bg-gray-800",
  className = " ",
  results = null,

  // ✅ click-to-advance (se presente)
  // (teamCode, which) => void   where which = "first" | "second"
  onPickTeam,
  showReset = false, // ✅ NEW
  onReset = null, // ✅ NEW
}) => {
  // ✅ valida SOLO per la fase finale (tabellone)
  const isFinalPhase = [
    "round32",
    "round16",
    "quarter",
    "semi",
    "final",
  ].includes(String(phase || "").trim());

  const norm3 = (s) =>
    String(s ?? "")
      .trim()
      .toUpperCase();

  const t1 = norm3(firstTeamName);
  const t2 = norm3(secondTeamName);

  // ✅ bordo giallo se c’è un valore ma NON è lungo 3
  const t1Invalid = isFinalPhase && t1 && t1.length !== 3;
  const t2Invalid = isFinalPhase && t2 && t2.length !== 3;

  // ✅ click SOLO se la coppia è completa (t1 e t2 presenti)
  const canClickPair =
    typeof onPickTeam === "function" && isFinalPhase && !!t1 && !!t2;

  const canClick1 = canClickPair;
  const canClick2 = canClickPair;

  // // ✅ click ABILITATO per ogni team presente (non serve la coppia completa)
  // const canClick1 =
  //   typeof onPickTeam === "function" && isFinalPhase && !!t1 && t1.length === 3;

  // const canClick2 =
  //   typeof onPickTeam === "function" && isFinalPhase && !!t2 && t2.length === 3;

  const handlePick = (code, which) => {
    if (!code) return;

    console.log("🟡 BlokQuadRett.handlePick", { code, which, phase });

    if (typeof onPickTeam !== "function") {
      console.warn("🔴 onPickTeam NON è una function", { onPickTeam });
      return;
    }

    onPickTeam(code, which);

    console.log("🟢 onPickTeam CHIAMATA", { code, which, phase });
  };

  const handleKeyDown = (e, code, which, enabled) => {
    if (!enabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handlePick(code, which);
    }
  };

  return (
    <div className={`relative z-[10] ${className} shadow-2xl shadow-black/40`}>
      {/* QUADRATI SOPRA */}
      <div className="flex gap-0 relative z-10">
        {/* ✅ WRAPPER per bordo giallo + click */}
        <div
          className={`${t1Invalid ? "ring-2 ring-yellow-400" : ""} ${
            canClick1 ? "cursor-pointer" : ""
          }`}
          role={canClick1 ? "button" : undefined}
          tabIndex={canClick1 ? 0 : -1}
          onClick={() => {
            console.log("🟦 CLICK QUADRATO 1", { canClick1, t1, phase });
            if (canClick1) handlePick(t1, "first");
          }}
          onKeyDown={(e) => handleKeyDown(e, t1, "first", canClick1)}
          aria-label={canClick1 ? `Pick ${t1}` : undefined}
        >
          <Quadrato
            label={firstSquareLabel}
            teamName={firstTeamName}
            flag={firstTeamFlag}
            advanced={firstAdvanced}
            isPronTeamTable={firstIsPron}
            phase={phase}
          />
        </div>

        {/* ✅ WRAPPER per bordo giallo + click */}
        <div
          className={`${t2Invalid ? "ring-2 ring-yellow-400" : ""} ${
            canClick2 ? "cursor-pointer" : ""
          }`}
          role={canClick2 ? "button" : undefined}
          tabIndex={canClick2 ? 0 : -1}
          onClick={() => {
            console.log("🟩 CLICK QUADRATO 2", { canClick2, t2, phase });
            if (canClick2) handlePick(t2, "second");
          }}
          onKeyDown={(e) => handleKeyDown(e, t2, "second", canClick2)}
          aria-label={canClick2 ? `Pick ${t2}` : undefined}
        >
          <Quadrato
            label={secondSquareLabel}
            teamName={secondTeamName}
            flag={secondTeamFlag}
            advanced={secondAdvanced}
            isPronTeamTable={secondIsPron}
            phase={phase}
          />
        </div>
      </div>

      {/* RETTANGOLO DATA/CITTÀ */}
      <div className="absolute left-1/2 -translate-x-1/2 -mt-20 z-0 flex flex-col items-center">
        <RettDat
          leftLabel={rettLeftLabel}
          rightLabel={rettRightLabel}
          timeLabel={rettTimeLabel}
          color={rettColor}
          showReset={showReset}
          onReset={onReset}
          disableHover={String(phase) === "round32"} // ✅ round32 NO hover
        />
      </div>

      {/* RISULTATI */}
      <div className="absolute left-1/2 -translate-x-1/2 top-0 md:-top-[10px] z-[999] flex flex-col items-center pointer-events-none">
        <RettRis results={results} />
      </div>
    </div>
  );
};

export default BlokQuadRett;
