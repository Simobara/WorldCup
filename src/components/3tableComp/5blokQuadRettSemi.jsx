import Quadrato from "./1quad";
import RettRis from "./3rettRis";
import RettDatSemif from "./6rettDatSemif";

const BlokQuadRettSemi = ({
  topSquareLabel = "",
  bottomSquareLabel = "",
  topTeamName = "",
  bottomTeamName = "",
  topTeamFlag = null,
  bottomTeamFlag = null,

  topAdvanced = false,
  bottomAdvanced = false,

  topIsPron = false,
  bottomIsPron = false,

  phase = "semi",

  rettTopLabel = "",
  rettBottomLabel = "",
  rettTimeLabel = "",
  rettColor = "bg-gray-800",

  className = "",
  results = null,
}) => {
  return (
    <div className={`relative z-[10] ${className} shadow-2xl shadow-black/40`}>
      {/* 🔲 QUADRATI – SOPRA / SOTTO */}
      <div className="flex flex-col items-center gap-0 relative z-10">
        <Quadrato
          label={topSquareLabel}
          teamName={topTeamName}
          flag={topTeamFlag}
          advanced={topAdvanced}
          isPronTeamTable={topIsPron}
          phase={phase}
        />

        <Quadrato
          label={bottomSquareLabel}
          teamName={bottomTeamName}
          flag={bottomTeamFlag}
          advanced={bottomAdvanced}
          isPronTeamTable={bottomIsPron}
          phase={phase}
        />
      </div>

      {/* 📅 RETTANGOLO DATA / CITTÀ – CENTRATO */}
      <div className="absolute left-1/2 -translate-x-1/2 top-48 -translate-y-[70%] z-0 flex flex-col items-center">
        <RettDatSemif
          leftLabel={rettTopLabel}
          rightLabel={rettBottomLabel}
          timeLabel={rettTimeLabel}
          color={rettColor}
        />
      </div>

      {/* 🏁 RISULTATI */}
      <div className="absolute left-1/2 -translate-x-1/2 top-0 md:-top-[4px] z-[999] flex flex-col items-center">
        <RettRis results={results} />
      </div>
    </div>
  );
};

export default BlokQuadRettSemi;
