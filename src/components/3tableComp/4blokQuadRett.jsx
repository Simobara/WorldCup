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
  phase = "round32",
  rettLeftLabel = "A",
  rettRightLabel = "B",
  rettTimeLabel = "",
  rettColor = "bg-gray-800",
  className = " ",
  results = null,
}) => {
  return (
    <div className={`relative z-[10] ${className} shadow-xl shadow-black/40`}>
      {/* QUADRATI SOPRA */}
      <div className="flex gap-0 relative z-10 ">
        <Quadrato
          label={firstSquareLabel}
          teamName={firstTeamName}
          flag={firstTeamFlag}
          advanced={firstAdvanced}
          phase={phase}
        />
        <Quadrato
          label={secondSquareLabel}
          teamName={secondTeamName}
          flag={secondTeamFlag}
          advanced={secondAdvanced}
          phase={phase}
        />
      </div>

      {/* RETTANGOLO DATA/CITTÀ */}
      <div className="absolute left-1/2 -translate-x-1/2 -mt-20 z-0 flex flex-col items-center">
        <RettDat
          leftLabel={rettLeftLabel}
          rightLabel={rettRightLabel}
          timeLabel={rettTimeLabel}
          color={rettColor}
        />
      </div>

      {/* RISULTATI */}
      <div className="absolute left-1/2 -translate-x-1/2 -mt-12 md:-mt-16 z-20 md:z-0 flex flex-col items-center">
        <RettRis results={results} />
      </div>
    </div>
  );
};

export default BlokQuadRett;
