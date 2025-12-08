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

// import { useState } from "react";
// import { GiornataNProvider } from "../Ap/Global/global.jsx";
// import Body from "../Body/Body.jsx";
// import Footer from "../Footer/footer.jsx";
// import Header from "../Header/header.jsx";
// import "./App.css";
// import { GiornataClouProvider } from "./Global/global.jsx";

const App = () => {
  // STATE ---------------------------------------------------------------------
  // const [isAuthenticated, setIsAuthenticated] = useState(false);

  // HANDLERS ------------------------------------------------------------------
  // const handleLogin = () => {
  //   setIsAuthenticated(true);
  // };

  // RENDER --------------------------------------------------------------------
  return (
    <div className="h-screen xl:overflow-hidden">
      {/* {isAuthenticated ? ( */}
      <>
        pippo
        {/* <GiornataNProvider>
          <GiornataClouProvider>
            <Header />
            <Body />
            <Footer />
          </GiornataClouProvider>
        </GiornataNProvider> */}
      </>
      {/* ) : (
        <LoginPage onLogin={handleLogin} />
      )} */}
    </div>
  );
};

export default App;
