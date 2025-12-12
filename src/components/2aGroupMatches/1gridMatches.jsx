import { flagsMond } from "../../START/app/main";
import Quadrato from "../3tableComp/1quad";

function toCode3(team) {
  const s = String(team?.id ?? team?.name ?? "")
    .trim()
    .toUpperCase();
  if (!s) return "";
  return s.replace(/\s+/g, "").slice(0, 3);
}

export default function GridMatchesPage() {
  const groups = "ABCDEFGHIJKL".split("");

  const GROUP_WIDTH_MOBILE = "w-40";
  const GROUP_HEIGHT_MOBILE = "h-40";
  const GROUP_WIDTH_DESKTOP = "md:w-[22rem]";
  const GROUP_HEIGHT_DESKTOP = "md:h-[18rem]";

  // 7 colonne:     G    CIT  SQ1  F1   RIS  F2  SQ2
  const gridCols = "70px 60px 30px 45px 40px 45px 30px";

  return (
    <div className="min-h-screen px-4 pt-16 overflow-x-auto">
      <div className="flex justify-center items-start min-w-max">
        <div className="grid grid-cols-4 gap-4 w-max">
          {groups.map((letter) => {
            const teams = (flagsMond ?? []).filter((t) => t.group === letter);

            // ogni riga = 2 squadre (match)
            const rowsCount = 6;

            return (
              <div
                key={letter}
                className={`
                  ${GROUP_WIDTH_MOBILE} ${GROUP_HEIGHT_MOBILE}
                  ${GROUP_WIDTH_DESKTOP} ${GROUP_HEIGHT_DESKTOP}
                  bg-red-900 border border-slate-900 flex flex-col
                  rounded-tl-[48px] rounded-bl-[48px]
                  overflow-hidden
                `}
              >
                <div className="flex-1 flex items-stretch">
                  {/* LETTERA */}
                  <div className="w-8 md:w-10 flex items-center justify-center">
                    <span className="text-white font-extrabold text-xl md:text-3xl">
                      {letter}
                    </span>
                  </div>

                  {/* GRIGLIA */}
                  <div className="flex-1 flex justify-end bg-slate-400">
                    <div
                      className="grid w-max h-full bg-slate-400"
                      style={{
                        gridTemplateRows: `1rem repeat(${rowsCount}, 45px)`,
                        gridTemplateColumns: gridCols,
                      }}
                    >
                      <Header7 />

                      {Array.from({ length: rowsCount }).map((_, row) => {
                        const team1 = teams[row * 2];
                        const team2 = teams[row * 2 + 1];

                        const redBottom = row === 1 || row === 3;

                        return (
                          <Row7
                            key={`${letter}-${row}`}
                            bottomBorder={redBottom}
                            day=""
                            city=""
                            team1={toCode3(team1)}
                            team2={toCode3(team2)}
                            result=""
                            flag1={
                              team1 ? (
                                <Quadrato
                                  teamName={team1.name}
                                  flag={team1.flag}
                                  phase="round32"
                                  advanced={false}
                                  isPronTeam={false}
                                  label={null}
                                />
                              ) : (
                                <Quadrato
                                  teamName=""
                                  flag={null}
                                  phase="round32"
                                  advanced={false}
                                  isPronTeam={false}
                                  label={null}
                                />
                              )
                            }
                            flag2={
                              team2 ? (
                                <Quadrato
                                  teamName={team2.name}
                                  flag={team2.flag}
                                  phase="round32"
                                  advanced={false}
                                  isPronTeam={false}
                                  label={null}
                                />
                              ) : (
                                <Quadrato
                                  teamName=""
                                  flag={null}
                                  phase="round32"
                                  advanced={false}
                                  isPronTeam={false}
                                  label={null}
                                />
                              )
                            }
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Header7() {
  const headers = ["DATA", "CITTÀ", "SQUADRA 1", "", "RIS", "", "SQUADRA 2"];

  return (
    <>
      {headers.map((t, idx) => {
        if (t === "") return null;

        const isSquadra = t === "SQUADRA 1" || t === "SQUADRA 2";

        return (
          <div
            key={`h-${idx}`}
            className={`bg-slate-900 border border-slate-900 flex items-center justify-center text-[9px] font-extrabold text-white`}
            style={{ gridColumn: `span ${isSquadra ? 2 : 1}` }}
          >
            {t}
          </div>
        );
      })}
    </>
  );
}

function Row7({
  day,
  city,
  team1,
  team2,
  flag1,
  flag2,
  result,
  bottomBorder = false,
}) {
  const bottom = bottomBorder ? "border-b-4 border-b-slate-900" : "border-b";
  const common = `border-t border-l border-r ${bottom}`;

  return (
    <>
      {/* DATA */}
      <div
        className={`${common} border-slate-400 bg-slate-400 text-black flex items-center justify-center`}
      >
        <span className="text-[10px] font-bold">{day || "\u00A0"}</span>
      </div>

      {/* CITTÀ */}
      <div
        className={`${common} border-slate-400 bg-slate-400 text-black flex items-center justify-center`}
      >
        <span className="text-[10px] font-bold">{city || "\u00A0"}</span>
      </div>

      {/* SQUADRA 1 */}
      <div
        className={`${common} border-slate-900 bg-slate-900 text-slate-400 flex items-center justify-center`}
      >
        <span className="text-[10px] font-bold">{team1 || "\u00A0"}</span>
      </div>

      {/* FLAG 1 */}
      <div
        className={`${common} border-slate-900 bg-slate-900 flex items-center justify-center`}
      >
        <div className="scale-[0.55] md:scale-[0.65] origin-center">
          {flag1 ?? <span>&nbsp;</span>}
        </div>
      </div>

      {/* RIS */}
      <div
        className={`${common} border-slate-400 bg-slate-400 text-black flex items-center justify-center`}
      >
        <span className="text-[10px] font-extrabold">{result || "\u00A0"}</span>
      </div>

      {/* FLAG 2 */}
      <div
        className={`${common} border-slate-900 bg-slate-900 flex items-center justify-center`}
      >
        <div className="scale-[0.55] md:scale-[0.65] origin-center">
          {flag2 ?? <span>&nbsp;</span>}
        </div>
      </div>

      {/* SQUADRA 2 */}
      <div
        className={`${common} border-slate-900 bg-slate-900 text-slate-400 flex items-center justify-center`}
      >
        <span className="text-[10px] font-bold">{team2 || "\u00A0"}</span>
      </div>
    </>
  );
}
