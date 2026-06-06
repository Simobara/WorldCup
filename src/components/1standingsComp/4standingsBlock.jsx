import { citiesOsp } from "../../START/app/CitiesOsp";
import { CssHighlights } from "../../START/styles/0CssGsTs";
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
  className="
    relative
    top-[7.5rem]
    -left-2

    md:top-[12rem]
    md:left-0
  "
>
      <h2 id="wc-standings-title" className="sr-only">
        World Cup Match Schedule and Standings
      </h2>

      {/* LOGO */}
     <div
  className="
    absolute
    -left-16
    -top-28
    w-52

    md:-left-4
    md:-top-28
    md:w-72

    flex justify-center z-50
  "
>
        <div className="relative">
          <img
            src="/assts/LogoStandingsMobile.png"
            alt="World Cup standings mobile logo"
            className="block md:hidden h-[clamp(5rem,16vw,6rem)] w-auto object-contain"
            loading="eager"
          />

          <img
            src="/assts/LogoStandings.png"
            alt="World Cup standings logo"
            className="hidden md:block h-28 w-auto object-contain"
            loading="eager"
          />
        </div>
      </div>

      {/* COLONNA CITTÀ */}
      <div
  className="
    absolute
    -top-4
    left-6
    flex flex-col
    w-14

    md:top-0
    md:left-14
    md:w-30
  "
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

      {/* REGIONI */}
      <RettangoloVerticale
  top="md:top-[0rem] top-[2rem]"
  height="md:h-[12rem] h-[10rem]"
  color="bg-sky-400"
  label="Western Region"
/>

     <RettangoloVerticale
  top="md:top-[12rem] top-[12rem]"
  height="md:h-[18rem] h-[15rem]"
  color="bg-green-300"
  label="Central Region"
/>

     <RettangoloVerticale
  top="md:top-[30rem] top-[27rem]"
  height="md:h-[18rem] h-[15rem]"
  color="bg-rose-300"
  label="Eastern Region"
/>

      {/* GRIGLIA PARTITE */}
     <div
  className="
    absolute
    -top-28
    left-[clamp(4.5rem,18vw,5.5rem)]
    w-[calc(100vw-clamp(4.5rem,18vw,5.5rem))]

    md:left-[15rem]
    md:w-[calc(100vw-15rem)]

    overflow-x-auto
    overflow-y-visible
  "
>
        <div className="relative inline-block min-w-max pt-8">
          <div className="absolute top-0 left-0 flex z-50" aria-hidden="true">
            <RettGroup color={CssHighlights.GroupStage} colsSpan={17} label="Group Stage Matches" />
            <RettGroup color={CssHighlights.Round32} colsSpan={6} label="Round of 32" />
            <RettGroup color={CssHighlights.Round16} colsSpan={4} label="Round of 16" />
            <RettGroup color={CssHighlights.GroupSep} colsSpan={1} label="" />
            <RettGroup color={CssHighlights.Quarter} colsSpan={3} label="Quarter Finals" />
            <RettGroup color={CssHighlights.GroupSep} colsSpan={2} label="" />
            <RettGroup color={CssHighlights.Semi} colsSpan={2} label="Semi Finals" />
            <RettGroup color={CssHighlights.GroupSep} colsSpan={2} label="" />
            <RettGroup color={CssHighlights.Final} colsSpan={2} label="Finals" />
          </div>

         <Grid
  rows={1}
  cols={39}
  cellHeightClass="md:h-20 h-16"
  columnLabels={titleLabels}
/>

         <Grid
  rows={citiesOsp.length}
  cols={39}
  cellHeightClass="md:h-12 h-10"
  highlightedCells={mergedHighlights}
/>
        </div>
      </div>
    </section>
  );
};

export default StandingsBlock;
