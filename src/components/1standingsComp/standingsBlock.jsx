import { citiesOsp } from "../../START/app/CitiesOsp";
import { getMergedHighlights } from "../1standingsComp/highlightedGroup";
import ContainerCitta from "./containerCitta";
import { createDateLabels } from "./createDate";
import Grid from "./grid";
import RettGroup from "./rettGroup";
import RettangoloVerticale from "./rettVert";

const StandingsBlock = () => {
  const titleLabels = createDateLabels();
  const mergedHighlights = getMergedHighlights();

  return (
    <div className=" top-[12rem] left-0 relative">
      {/* ✅ LOGO */}
      <div className="absolute -left-4 -top-28 w-72 flex justify-center z-50">
        <img
          src="/assts/LogoStandings.png"
          alt="Logo standings"
          className="h-28 w-auto object-contain"
        />
      </div>

      {/* ✅ COLONNA 16 CITTÀ */}
      <div className="absolute left-14 flex flex-col">
        {citiesOsp.map((city, i) => (
          <ContainerCitta key={i} color={city.color} label={city.name} />
        ))}
      </div>

      {/* ✅ RETTANGOLI VERTICALI CON TESTO */}
      <RettangoloVerticale
        top="top-[0rem]"
        height="h-[12rem]"
        color="bg-sky-400"
        label="WESTERN REGION"
      />
      <RettangoloVerticale
        top="top-[12rem]"
        height="h-[18rem]"
        color="bg-green-300"
        label="CENTRAL REGION"
      />
      <RettangoloVerticale
        top="top-[30rem]"
        height="h-[18rem]"
        color="bg-rose-300"
        label="EASTERN REGION"
      />

      {/* ------------------------------------------------------------------ */}
      {/* ✅ GRIGLIA A DESTRA */}
      <div className="absolute left-[15rem] -top-16">
        {/* PRIMA GRIGLIA: 39 colonne, titoli con pattern + date */}
        <Grid
          rows={1}
          cols={39}
          cellHeightClass="h-16"
          patternOverride={[
            [17, "bg-white", false, false],
            [6, "bg-orange-400", false, false],
            [4, "bg-sky-300", false, false],
            [1, "bg-gray-800", false, false],
            [3, "bg-orange-400", false, false],
            [2, "bg-gray-800", false, false],
            [2, "bg-sky-300", false, false],
            [2, "bg-gray-800", false, false],
            [2, "bg-yellow-400", false, false],
          ]}
          columnLabels={titleLabels}
        />

        <div className="absolute -top-8 left-0 flex">
          <RettGroup
            color="bg-white"
            colsSpan={17}
            label="GROUP STAGE MATCHES"
          />
          <RettGroup color="bg-orange-400" colsSpan={6} label="ROUND OF 32" />
          <RettGroup color="bg-sky-300" colsSpan={4} label="ROUND OF 16" />
          <RettGroup color="bg-gray-800" colsSpan={1} label="" />
          <RettGroup color="bg-orange-400" colsSpan={3} label="QUARTER" />
          <RettGroup color="bg-gray-800" colsSpan={2} label="" />
          <RettGroup color="bg-sky-300" colsSpan={2} label="SEMIFIN" />
          <RettGroup color="bg-gray-800" colsSpan={2} label="" />
          <RettGroup color="bg-yellow-400" colsSpan={2} label="FINALS" />
        </div>

        {/* SECONDA GRIGLIA: 16 righe squadre / città */}
        <Grid
          rows={citiesOsp.length}
          cols={39}
          cellHeightClass="h-12"
          highlightedCells={mergedHighlights}
        />
      </div>
    </div>
  );
};

export default StandingsBlock;
