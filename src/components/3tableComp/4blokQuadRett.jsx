// src/components/BloccoQuadRett.jsx
import Quadrato from "./1quad";
import RettDat from "./2rettDat";
import RettRis from "./3rettRis";

const BlokQuadRett = ({
  firstSquareLabel = " ",
  secondSquareLabel = " ",
  rettLeftLabel = "A",
  rettRightLabel = "B",
  rettColor = "bg-gray-200",
  className = " ",
}) => {
  return (
    <div className={`relative z-[10] ${className}`}>
      {/* QUADRATI SOPRA */}
      <div className="flex gap-0 relative z-10 ">
        <Quadrato label={firstSquareLabel} />
        <Quadrato label={secondSquareLabel} />
      </div>

      {/* RETTANGOLO PINK → SEMPRE SOTTO I QUADRATI */}
      <div className="absolute left-1/2 -translate-x-1/2 -mt-20 z-0 flex flex-col items-center">
        <RettDat
          leftLabel={rettLeftLabel}
          rightLabel={rettRightLabel}
          color={rettColor}
        />
      </div>

      {/* RETTRIS (NUMERI) */}
      {/* 
        - su mobile: z-20 → sopra i quadrati (così i numeri si vedono)
        - da md in su: z-0 → torna tutto sotto i quadrati (layout “normale”)
      */}
      <div className="absolute left-1/2 -translate-x-1/2 -mt-14 md:-mt-16 z-20 md:z-0 flex flex-col items-center">
        <RettRis />
      </div>
    </div>
  );
};

export default BlokQuadRett;
