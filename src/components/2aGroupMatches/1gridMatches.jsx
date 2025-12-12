import { flagsMond } from "../../START/app/main";
import Quadrato from "../3tableComp/1quad";

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

                        return (
                          <Row7
                            key={row}
                            day=""
                            city=""
                            team1={team1?.name ?? ""}
                            team2={team2?.name ?? ""}
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
  const headers = ["DATA", "CITTÀ", "SQ1", "", "RIS", "", "SQ2"];

  return (
    <>
      {headers.map((t, idx) => (
        <div
          key={idx}
          className="bg-slate-900 border border-black/40
                     flex items-center justify-center
                     text-[9px] font-extrabold text-white"
        >
          {t}
        </div>
      ))}
    </>
  );
}

function Row7({ day, city, team1, team2, flag1, flag2, result }) {
  return (
    <>
      {/* GIORNO */}
      <CellText value={day} />

      {/* CITTÀ */}
      <CellText value={city} />

      {/* SQUADRA SX */}
      <CellText value={team1} />

      {/* FLAG SX */}
      <CellFlag>{flag1}</CellFlag>

      {/* RIS */}
      <CellText value={result} bold />

      {/* FLAG DX */}
      <CellFlag>{flag2}</CellFlag>

      {/* SQUADRA DX */}
      <CellText value={team2} />
    </>
  );
}

function CellText({ value, bold = false }) {
  return (
    <div className="bg-slate-400 border border-black/30 flex items-center justify-center">
      <span className={`text-[10px] ${bold ? "font-extrabold" : "font-bold"}`}>
        {value || "\u00A0"}
      </span>
    </div>
  );
}
function CellFlag({ children }) {
  return (
    <div className="bg-gray-500 border border-black/30 flex items-center justify-center">
      <div className="scale-[0.55] md:scale-[0.65]">
        {children ?? <span>&nbsp;</span>}
      </div>
    </div>
  );
}
