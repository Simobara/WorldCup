export default function GroupHeader() {
  const headers = ["SQUADRA", "", "PUNTI", "1", "X", "2", "GOL"];

  return (
    <>
      {headers.map((t, idx) => {
        if (idx === 0) {
          return (
            <div
              key="squadra"
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
