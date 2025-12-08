import { createContext, useContext, useEffect, useState } from "react";
import { calendario, giornataNum } from "../../START/app/SerieAMatches";

/* 📌 GiornataNContext
 * Tiene traccia del numero di giornata selezionata (giornataN).
 * - Valore iniziale: da localStorage, altrimenti giornataNum.
 * - Ogni cambio viene salvato su localStorage.
 * Usato come riferimento "globale" per sapere quale giornata è attiva.
 * ----------------------------------------------------------- */
export const GiornataNContext = createContext();
export const GiornataNProvider = ({ children }) => {
  const [giornataN, setGiornataN] = useState(() => {
    const storedGiornata = localStorage.getItem("giornataN");
    return storedGiornata ? JSON.parse(storedGiornata) : giornataNum;
  });
  useEffect(() => {
    localStorage.setItem("giornataN", JSON.stringify(giornataN));
    console.log("global.jsx => DatiNelloStorage => giornataN", giornataN);
  }, [giornataN]);
  return <GiornataNContext.Provider value={{ giornataN, setGiornataN }}>{children}</GiornataNContext.Provider>;
};

/* 📌 CompleteDataContext
 * Contiene l’intero calendario (tutte le giornate).
 * - Stato iniziale: clone profondo di `calendario`.
 * - Utile per lavorare su uno snapshot modificabile senza toccare l’originale.
 * Struttura attesa: Record<`giornata_${number}`, { dates: string[]; matches: Match[] }>
 * ----------------------------------------------------------- */
export const CompleteDataContext = createContext();
export const CompleteDataProvider = ({ children }) => {
  const [completeClouSelected, setCompleteClouSelected] = useState(() => JSON.parse(JSON.stringify(calendario)));
  return <CompleteDataContext.Provider value={{ completeClouSelected, setCompleteClouSelected }}>{children}</CompleteDataContext.Provider>;
};

/* 📌 GiornataClouContext
 * Mantiene i dati della giornata attualmente visualizzata ("clou").
 * - Oggetto con { dates, matches } relativo alla giornata selezionata.
 * - Viene impostato/aggiornato dai componenti superiori (es. TableProxInc/CalGiorn).
 * Nota: se in futuro vuoi caricare la 38ª da remoto, riattiva l'useEffect commentato sotto.
 * ----------------------------------------------------------- */
export const GiornataClouContext = createContext();
export const GiornataClouProvider = ({ children }) => {
  const { giornataN } = useContext(GiornataNContext); // ora esiste
  const safeG = calendario?.[`giornata_${giornataN}`] ?? { dates: [], matches: [] };
  const [giornataClouSelected, setGiornataClouSelected] = useState(safeG);

  useEffect(() => {
    const next = calendario?.[`giornata_${giornataN}`] ?? { dates: [], matches: [] };
    setGiornataClouSelected(next);
  }, [giornataN]);

  return <GiornataClouContext.Provider value={{ giornataClouSelected, setGiornataClouSelected }}>{children}</GiornataClouContext.Provider>;
};
