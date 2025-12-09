import ContainerCitta from "./containerCitta";
import Grid from "./grid";
import RettGroup from "./rettGroup";
import RettangoloVerticale from "./rettVert";

// 👇 genera le 39 etichette dal 11/06/2026 al 19/07/2026
const createDateLabels = () => {
  const start = new Date(2026, 5, 11); // 5 = giugno
  const end = new Date(2026, 6, 19); // 6 = luglio

  // 0=Sun ... 6=Sat
  const dayLetters = ["D", "L", "M", "M", "G", "V", "S"]; // versione italiana: Dom, Lun, Mar, Mer, Gio, Ven, Sab

  const labels = [];

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    labels.push({
      top: dayLetters[d.getDay()], // lettera del giorno (G, V, S, ecc.)
      bottom: d.getDate().toString(), // numero del giorno (11, 12, 13, ...)
    });
  }

  return labels;
};

const StandingsBlock = () => {
  const titleLabels = createDateLabels();

  return (
    <div className=" top-[12rem] left-0 relative">
      {/* ✅ LOGO SOPRA LA PRIMA CITTÀ */}

      <div className="absolute -left-4 -top-28 w-72 flex justify-center z-50">
        <img
          src="/assts/LogoStandings.png"
          alt="Logo standings"
          className="h-28 w-auto object-contain"
        />
      </div>

      {/* ✅ COLONNA 16 CITTÀ */}
      <div className="absolute left-14 flex flex-col">
        {[
          // 🔵 SKY – PRIME 4
          { name: "Vancouver", color: "bg-sky-300" },
          { name: "Seattle", color: "bg-sky-300" },
          { name: "San Francisco", color: "bg-sky-300" },
          { name: "Los Angeles", color: "bg-sky-300" },

          // 🟢 GREEN – SUCCESSIVE 6
          { name: "Guadalajara", color: "bg-green-500" },
          { name: "Mexico City", color: "bg-green-500" },
          { name: "Monterey", color: "bg-green-500" },
          { name: "Houston", color: "bg-green-500" },
          { name: "Dallas", color: "bg-green-500" },
          { name: "Kansas City", color: "bg-green-500" },

          // 🌸 ROSE – ULTIME 6
          { name: "Atlanta", color: "bg-rose-300" },
          { name: "Miami", color: "bg-rose-300" },
          { name: "Toronto", color: "bg-rose-300" },
          { name: "Boston", color: "bg-rose-300" },
          { name: "Philadelphia", color: "bg-rose-300" },
          { name: "New Jersey", color: "bg-rose-300" },
        ].map((city, i) => (
          <ContainerCitta key={i} color={city.color} label={city.name} />
        ))}
      </div>

      {/* ✅ GRIGLIA A DESTRA */}
      <div className="absolute left-[15rem] -top-16">
        <div className="absolute -top-8 left-0 flex">
          <RettGroup
            color="bg-white"
            colsSpan={17}
            label="GROUP STAGE MATCHES"
          />
          <RettGroup color="bg-orange-300" colsSpan={6} label="ROUND OF 32" />
          <RettGroup color="bg-sky-300" colsSpan={4} label="ROUND OF 16" />
          <RettGroup color="bg-gray-800" colsSpan={1} label="" />
          <RettGroup color="bg-orange-300" colsSpan={3} label="QUARTER" />
          <RettGroup color="bg-gray-800" colsSpan={2} label="" />
          <RettGroup color="bg-sky-300" colsSpan={2} label="SEMIFIN" />
          <RettGroup color="bg-gray-800" colsSpan={2} label="" />
          <RettGroup color="bg-orange-300" colsSpan={2} label="FINALS" />
        </div>

        {/* PRIMA GRIGLIA: 39 colonne, titoli con pattern + date */}
        <Grid
          rows={1}
          cols={39}
          cellHeightClass="h-16"
          patternOverride={[
            [17, "bg-white", false, false],
            [6, "bg-orange-300", false, false],
            [4, "bg-sky-300", false, false],
            [1, "bg-gray-800", false, false],
            [3, "bg-orange-300", false, false],
            [2, "bg-gray-800", false, false],
            [2, "bg-sky-300", false, false],
            [2, "bg-gray-800", false, false],
            [2, "bg-orange-300", false, false],
          ]}
          columnLabels={titleLabels}
        />

        {/* SECONDA GRIGLIA: 16 righe squadre */}
        <Grid rows={16} cellHeightClass="h-12" cols={39} />
      </div>

      {/* ✅ RETTANGOLI VERTICALI CON TESTO */}
      <RettangoloVerticale
        top="top-[0rem]"
        height="h-[12rem]"
        color="bg-blue-300"
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
    </div>
  );
};
export default StandingsBlock;
