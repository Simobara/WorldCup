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
    <div className="top-[12rem] left-0 relative">
      {/* ✅ LOGO */}
      <div className="absolute md:-left-4 -left-16 -top-32 md:-top-28 w-52 md:w-72 flex justify-center z-50">
        {/* ✅ LOGO MOBILE (PIÙ GRANDE) */}
        <img
          src="/assts/LogoStandingsMobile.png"
          alt="Logo standings mobile"
          className="block md:hidden h-32 w-auto object-contain"
        />

        {/* ✅ LOGO DESKTOP */}
        <img
          src="/assts/LogoStandings.png"
          alt="Logo standings"
          className="hidden md:block h-28 w-auto object-contain"
        />
      </div>

      {/* ✅ COLONNA 16 CITTÀ */}
      <div className="absolute md:left-14 left-6 flex flex-col lg:w-30 w-14">
        {citiesOsp.map((city, i) => (
          <ContainerCitta key={i} color={city.color} label={city.name} />
        ))}
      </div>

      {/* ✅ RETTANGOLI VERTICALI CON TESTO */}
      <RettangoloVerticale
        top="top-[0rem]"
        height="md:h-[12rem] h-[11rem]"
        color="bg-sky-400"
        label="WESTERN REGION"
      />
      <RettangoloVerticale
        top="md:top-[12rem] top-[11rem]"
        height="md:h-[18rem] h-[16.5rem]"
        color="bg-green-300"
        label="CENTRAL REGION"
      />
      <RettangoloVerticale
        top="md:top-[30rem] top-[27.5rem]"
        height="md:h-[18rem] h-[16.5rem]"
        color="bg-rose-300"
        label="EASTERN REGION"
      />

      {/* ------------------------------------------------------------------ */}
      {/* ✅ GRIGLIA A DESTRA */}
      <div className="absolute md:left-[15rem] left-[5rem] -top-28 w-[calc(100vw-5rem)] md:w-[calc(100vw-15rem)] overflow-x-auto overflow-y-visible">
        {/* Contenuto reale della griglia: più largo del contenitore → scroll orizzontale */}
        <div className="relative inline-block min-w-max pt-8">
          {/* 🔹 BARRA COLORATA SOPRA LA GRIGLIA */}
          <div className="absolute top-0 left-0 flex z-50">
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

          {/* 🔹 PRIMA GRIGLIA: 39 colonne, titoli con pattern + date */}
          <Grid
            rows={1}
            cols={39}
            cellHeightClass="h-20"
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

          {/* 🔹 SECONDA GRIGLIA: 16 righe squadre / città */}
          <Grid
            rows={citiesOsp.length}
            cols={39}
            cellHeightClass="md:h-12 h-11"
            highlightedCells={mergedHighlights}
          />
        </div>
      </div>
    </div>
  );
};

export default StandingsBlock;
