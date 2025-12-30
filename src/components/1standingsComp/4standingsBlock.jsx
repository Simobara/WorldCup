import { citiesOsp } from "../../START/app/CitiesOsp";
import { createDateLabels } from "./1createDate";
import { getMergedHighlights } from "./2highlightedGroup";
import ContainerCitta from "./5containerCitta";
import RettangoloVerticale from "./6rettVert";
import RettGroup from "./7rettGroup";
import Grid from "./8grid";
const StandingsBlock = () => {
  const titleLabels = createDateLabels();
  const mergedHighlights = getMergedHighlights();

  return (
    <section
      aria-labelledby="wc-standings-title"
      className="md:top-[12rem] top-[7.5rem] md:left-0 -left-2 relative"
    >
      {/* 🔹 SEO HEADING (visibile o no, ma indicizzabile) */}
      <h2 id="wc-standings-title" className="sr-only">
        World Cup Match Schedule and Standings
      </h2>

      {/* ✅ LOGO */}
      <div className="absolute md:-left-4 -left-16 -top-28 md:-top-28 w-52 md:w-72 flex justify-center z-50">
        <div className="relative">
          {/* LOGO MOBILE */}
          <img
            src="/assts/LogoStandingsMobile.png"
            alt="World Cup standings mobile logo"
            className="block md:hidden h-24 w-auto object-contain z-10"
            loading="eager"
          />

          {/* LOGO DESKTOP */}
          <img
            src="/assts/LogoStandings.png"
            alt="World Cup standings logo"
            className="hidden md:block h-28 w-auto object-contain z-10"
            loading="eager"
          />
        </div>
      </div>

      {/* ✅ COLONNA CITTÀ OSPITANTI */}
      <div
        className="absolute -top-4 md:-top-0 md:left-14 left-6 flex flex-col lg:w-30 w-14"
        role="list"
        aria-label="Host cities"
      >
        {citiesOsp.map((city, i) => (
          <ContainerCitta
            key={i}
            color={city.color}
            label={city.name}
            abbr={city.abbr}
          />
        ))}
      </div>

      {/* ✅ REGIONI */}
      <RettangoloVerticale
        top="md:top-[0rem] -top-[1rem]"
        height="md:h-[12rem] h-[10rem]"
        color="bg-sky-400"
        label="Western Region"
      />
      <RettangoloVerticale
        top="md:top-[12rem] top-[9rem]"
        height="md:h-[18rem] h-[15rem]"
        color="bg-green-300"
        label="Central Region"
      />
      <RettangoloVerticale
        top="md:top-[30rem] top-[24rem]"
        height="md:h-[18rem] h-[15rem]"
        color="bg-rose-300"
        label="Eastern Region"
      />

      {/* ✅ GRIGLIA PARTITE */}
      <div className="absolute md:left-[15rem] left-[5rem] -top-28 w-[calc(100vw-5rem)] md:w-[calc(100vw-15rem)] overflow-x-auto overflow-y-visible" role="region" aria-label="World Cup match schedule grid" >
        <div className="relative inline-block min-w-max pt-8">
          {/* HEADER GRUPPI */}
          <div className="absolute top-0 left-0 flex z-50" aria-hidden="true">
            <RettGroup color="bg-white"       colsSpan={17}label="Group Stage Matches" />
            <RettGroup color="bg-orange-400"  colsSpan={6} label="Round of 32" />
            <RettGroup color="bg-sky-300"     colsSpan={4} label="Round of 16" />
            <RettGroup color="bg-gray-800"    colsSpan={1} label="" />
            <RettGroup color="bg-orange-400"  colsSpan={3} label="Quarter Finals" />
            <RettGroup color="bg-gray-800"    colsSpan={2} label="" />
            <RettGroup color="bg-sky-300"     colsSpan={2} label="Semi Finals" />
            <RettGroup color="bg-gray-800"    colsSpan={2} label="" />
            <RettGroup color="bg-yellow-400"  colsSpan={2} label="Finals" />
          </div>
          {/* GRIGLIA DATE */}
          <Grid rows={1} cols={39} cellHeightClass="md:h-20 h-16" columnLabels={titleLabels} />
          {/* GRIGLIA SQUADRE */}
          <Grid rows={citiesOsp.length} cols={39} cellHeightClass="md:h-12 h-10" highlightedCells={mergedHighlights} />
        </div>
      </div>
    </section>
  );
};

export default StandingsBlock;
