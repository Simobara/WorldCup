// src/components/BloccoQuadRett.jsx
import Quadrato from "./1quad";
import RettDat from "./2rettDat";
import RettRis from "./3rettRis";

const BlokQuadRett = ({
  firstSquareLabel = "E1",
  secondSquareLabel = "3ABCDF",
  rettLeftLabel = "A",
  rettRightLabel = "B",
  className = "",
}) => {
  return (
    <div className={`relative ${className}`}>
      {/* QUADRATI SOPRA (z più alto) */}
      <div className="flex gap-0 relative z-10">
        <Quadrato label={firstSquareLabel} />
        <Quadrato label={secondSquareLabel} />
      </div>

      {/* RETTANGOLI SOTTO, ASSOLUTI rispetto ai quadrati */}
      <div className="absolute left-1/2 -translate-x-1/2 -mt-20 z-0 flex flex-col items-center">
        <RettDat leftLabel={rettLeftLabel} rightLabel={rettRightLabel} />
        <div className="-mt-16">
          <RettRis />
        </div>
      </div>
    </div>
  );
};

export default BlokQuadRett;
