// -----------------------------------------------------------------------------
// 📄 File: App.jsx
// Scopo: bootstrap dell’app — monta i provider globali e il layout base (Header, Body, Footer).
//
// 🔹 Funzionalità principali (riassunto):
// 1) Wrappa l’app con i context globali: GiornataNProvider e GiornataClouProvider.
// 2) Renderizza lo scheletro UI: Header (top), Body (contenuti), Footer (bottom).
// 3) (Stub) Supporto autenticazione semplice con stato locale `isAuthenticated`.
//
// 📌 Contiene:
// - Stato locale `isAuthenticated` (attualmente non usato perché la LoginPage è commentata).
// - Struttura layout responsiva con altezza full-screen e overflow controllato su XL.
// - Import centralizzati di stili globali (`App.css`) e componenti principali.
//
// Nota:
// - La LoginPage è mantenuta commentata per futura (ri)attivazione.
// - I provider di giornata assicurano che Header/Body/Footer vedano lo stesso stato condiviso.
// -----------------------------------------------------------------------------

import Quadrato from "../components/quad";
import RettDat from "../components/rettDat";
import RettRis from "../components/rettRis";

// import { useState } from "react";
// import { GiornataNProvider } from "../Ap/Global/global.jsx";
// import Body from "../Body/Body.jsx";
// import Footer from "../Footer/footer.jsx";
// import Header from "../Header/header.jsx";
// import "./App.css";
// import { GiornataClouProvider } from "./Global/global.jsx";

const App = () => {
  return (
    <>
      <div className="h-screen w-screen bg-blue-600 relative">
        {/* Contenitore colonne al 90% dell’altezza */}
        <div className="h-[90%] w-full flex">
          {/* ✅ PRIMA COLONNA */}
          <div className="flex-1 h-full bg-red flex items-start justify-center pt-12">
            <div className="grid grid-cols-2 relative">
              {/* ✅ Rettangoli SOTTO */}
              <div className="-mt-8 ml-12 relative z-0">
                <RettDat />
                <RettRis />
              </div>

              {/* ✅ Quadrati SOPRA */}
              <div className="relative z-10 -ml-14 flex">
                <Quadrato />
                <Quadrato />
              </div>

              <div className="mt-8 relative z-10">
                <Quadrato />
              </div>

              <div className="mt-8 relative z-10">
                <Quadrato />
              </div>
            </div>
          </div>

          {/* Altre 6 colonne colorate */}
          <div className="flex-1 h-full bg-orange-500"></div>
          <div className="flex-1 h-full bg-yellow-500"></div>
          <div className="flex-1 h-full bg-green-500"></div>
          <div className="flex-1 h-full bg-blue-500"></div>
          <div className="flex-1 h-full bg-indigo-500"></div>
          <div className="flex-1 h-full bg-purple-500"></div>
        </div>
      </div>
    </>
  );
};

export default App;
