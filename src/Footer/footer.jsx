// -----------------------------------------------------------------------------
// 📄 File: Footer.jsx
// Scopo: visualizzare un footer fisso in fondo alla pagina.
//
// 🔹 Funzionalità principali (riassunto):
// 1) Mostra un’area nera a fondo pagina, sempre visibile (position: fixed).
// 2) Contiene un testo bianco allineato a sinistra.
// 3) Include padding e larghezza estesa per coprire l’intera pagina.
// 4) (Facoltativo) Può mostrare l’anno corrente tramite `currentYear`.
//
// -----------------------------------------------------------------------------

/**
 * Componente React `Footer`
 *
 * Mostra un footer fisso in fondo alla finestra con sfondo nero e testo bianco.
 * Larghezza estesa (200rem) per coprire layout orizzontali ampi, come tabelle o viste multiple.
 *
 * @component
 * @example
 * Uso base:
 * <Footer />
 *
 * @returns {JSX.Element} Footer statico posizionato in basso alla pagina.
 */
const Footer = () => {
  return (
    <footer
      className="
        fixed bottom-0 z-[-100]
        h-full w-[200rem]
        bg-black text-white text-start text-xl
        mt-[-8rem] p-8
      "
    >
      {/* &copy; {currentYear} All Rights Reserved */}
    </footer>
  );
};

export default Footer;
