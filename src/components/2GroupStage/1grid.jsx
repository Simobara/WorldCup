import Quadrato from "../3tableComp/1quad";

export default function GridPage() {
  const groups = "ABCDEFGHIJKL".split("");

  const GROUP_WIDTH_MOBILE = "w-40";
  const GROUP_HEIGHT_MOBILE = "h-40";
  const GROUP_WIDTH_DESKTOP = "md:w-[22rem]";
  const GROUP_HEIGHT_DESKTOP = "md:h-[18rem]";

  const gridCols = "50px 60px 60px 34px 34px 34px 40px";

  return (
    <div className="min-h-screen px-4 pt-16 overflow-x-auto">
      <div className="flex justify-center items-start min-w-max">
        <div className="grid grid-cols-4 gap-4 w-max">
          {groups.map((letter, i) => (
            <div
              key={i}
              className={`
                ${GROUP_WIDTH_MOBILE} ${GROUP_HEIGHT_MOBILE}
                ${GROUP_WIDTH_DESKTOP} ${GROUP_HEIGHT_DESKTOP}
                bg-red-900 border border-black flex flex-col
                rounded-tl-[48px] rounded-bl-[48px]
                overflow-hidden
              `}
            >
              {/* CONTENUTO (lettera a sinistra + griglia a destra) */}
              <div className="flex-1 flex items-stretch">
                {/* LETTERA (rimane rossa perché non ha bg) */}
                <div className="w-8 md:w-10 flex items-center justify-center">
                  <span className="text-white font-extrabold text-xl md:text-3xl leading-none">
                    {letter}
                  </span>
                </div>

                {/* GRIGLIA (sfondo slate fisso) */}
                <div className="flex-1 flex justify-end bg-slate-400">
                  <div
                    className="grid w-max h-full bg-slate-400"
                    style={{
                      gridTemplateRows: "1rem repeat(4, 1fr)",
                      gridTemplateColumns: gridCols,
                    }}
                  >
                    {/* HEADER */}
                    <Header7 letter={letter} />

                    {/* 4 RIGHE DATI */}
                    {Array.from({ length: 4 }).map((_, row) => (
                      <Row7
                        key={row}
                        QuadratoEl={
                          <Quadrato
                            teamName={`Team ${row + 1}`}
                            flag={null}
                            phase="round32"
                            advanced={false}
                            isPronTeam={false}
                            label={null}
                          />
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ✅ Header tutto slate-400 (nessun "buco" di colore) */
function Header7({ letter }) {
  const headers = [`SQUADRA`, "", "PUNTI", "1", "X", "2", "GOL"];

  return (
    <>
      {headers.map((t, idx) => {
        if (idx === 0) {
          return (
            <div
              key="group"
              className="
                col-span-2
                bg-slate-900
                border border-black/40
                flex items-center justify-center
                text-[9px] font-extrabold text-white leading-none
              "
            >
              {t}
            </div>
          );
        }

        if (idx === 1) return null;

        return (
          <div
            key={`h-${idx}`}
            className="
              bg-slate-900
              border border-black/40
              flex items-center justify-center
              text-[9px] font-bold text-white leading-none
            "
          >
            {t}
          </div>
        );
      })}
    </>
  );
}
/* ✅ Row tutto slate-400 */
function Row7({ QuadratoEl }) {
  return (
    <>
      <div className="bg-slate-400 border border-black/30" />

      <div className="bg-slate-400 border border-black/30 flex items-center justify-center">
        <div className="scale-[0.55] md:scale-[0.9]">{QuadratoEl}</div>
      </div>

      <div className="bg-slate-400 border border-black/30" />
      <div className="bg-slate-400 border border-black/30" />
      <div className="bg-slate-400 border border-black/30" />
      <div className="bg-slate-400 border border-black/30" />
      <div className="bg-slate-400 border border-black/30" />
    </>
  );
}
