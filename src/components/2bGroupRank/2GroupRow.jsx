export default function GroupRow({ QuadratoEl }) {
  return (
    <>
      {/* SQUADRA */}
      <div className="bg-slate-400 border border-black/30 flex items-center justify-center">
        <div className="scale-[0.55] md:scale-[0.9]">
          {QuadratoEl}
        </div>
      </div>

      {/* PUNTI / 1 / X / 2 / GOL */}
      <div className="bg-slate-400 border border-black/30" />
      <div className="bg-slate-400 border border-black/30" />
      <div className="bg-slate-400 border border-black/30" />
      <div className="bg-slate-400 border border-black/30" />
      <div className="bg-slate-400 border border-black/30" />
    </>
  );
}
