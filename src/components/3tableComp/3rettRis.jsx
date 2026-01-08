import { CssRettRis } from "../../START/styles/0CssGsTs";
const RettRis = ({ results }) => {
  if (!results) {
    return null;
  }

  const { ris, TS, R } = results;
  // helper per trasformare "4-6" => { home: "4", away: "6" }
  const parseScore = (val) => {
    if (!val || typeof val !== "string") {
      return { home: "", away: "" };
    }
    const [home, away] = val.split("-").map((s) => s.trim());
    return {
      home: home || "",
      away: away || "",
    };
  };

  const risScore = parseScore(ris); // risultato 90'
  const tsScore = parseScore(TS); // supplementari
  const rScore = parseScore(R); // rigori

  return (
    <div className="relative w-32 md:h-[4.7rem] h-[5.7rem] md:bg-transparent bg-transparent rounded-[16px] overflow-hidden">
      {/* Contenuto principale (parte alta) */}
      <div className="absolute top-0 left-0 w-full md:h-[40%] h-[40%] flex items-center justify-center">
        {/* se vuoi, ci metti testo extra oppure lasci vuoto */}
        <p className="text-white font-bold text-xs"></p>
      </div>

      {/* ✅ Area risultati: UNA SOLA RIGA */}
      <div className="absolute bottom-6 md:bottom-0 left-0 w-full h-[20%] text-black flex items-center justify-center">
        <div className="flex items-center justify-between w-full px-2">
          {/* BLOCCO SINISTRO → RIS + TS per TEAM1 */}
          <div className="flex items-center gap-1 text-black">
            {/* RIS team1 (grande) */}
            <span className={`text-lg font-bold ${CssRettRis.Ris}`}>
              {risScore.home || "-"}
            </span>
            {/* TS team1 (piccolo) */}
            <span className={`text-sm font-bold ${CssRettRis.Ts}`}>
              {tsScore.home || ""}
            </span>
          </div>

          {/* BLOCCO CENTRALE → RIGORI team1 - team2 */}
          <div className="flex items-center gap-1">
            <span className={`text-sm font-bold ${CssRettRis.Pen}`}>
              {rScore.home || ""}
            </span>
            <span className="text-sm font-bold">-</span>
            <span className={`text-sm font-bold ${CssRettRis.Pen}`}>
              {rScore.away || ""}
            </span>
          </div>

          {/* BLOCCO DESTRO → TS + RIS per TEAM2 */}
          <div className="flex items-center gap-1">
            {/* TS team2 (piccolo) */}
            <span className={`text-sm font-bold ${CssRettRis.Ts}`}>
              {tsScore.away || ""}
            </span>
            {/* RIS team2 (grande) */}
            <span className={`text-lg font-bold ${CssRettRis.Ris}`}>
              {risScore.away || "-"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RettRis;
