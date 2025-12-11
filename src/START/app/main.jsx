// === IMPORT BANDIERE (metti i path corretti ai tuoi asset) ===
// =======================
//        GRUPPO A
// =======================
import FlagKorea from '/gironi/A/Kor.png';
import FlagMexico from '/gironi/A/Mex.png';
import FlagSudafrica from '/gironi/A/SAf.png';

// =======================
//        GRUPPO B
// =======================
import FlagCanada from '/gironi/B/Can.png';
import FlagItalia from '/gironi/B/Ita.png';
import FlagQatar from '/gironi/B/Qtr.png';
import FlagSvizzera from '/gironi/B/Swi.png';

// =======================
//        GRUPPO C
// =======================
import FlagBrasile from '/gironi/C/Bra.png';
import FlagHaiti from '/gironi/C/Hai.png';
import FlagMorocco from '/gironi/C/Mor.png';
import FlagScozia from '/gironi/C/Sco.png';

// =======================
//        GRUPPO D
// =======================
import FlagAustralia from '/gironi/D/Aus.png';
import FlagParaguay from '/gironi/D/Par.png';
import FlagUsa from '/gironi/D/Usa.png';

// =======================
//        GRUPPO E
// =======================
import FlagCostaAvorio from '/gironi/E/CAv.png';
import FlagCuracao from '/gironi/E/Cur.png';
import FlagEcuador from '/gironi/E/Ecu.png';
import FlagGermania from '/gironi/E/Ger.png';

// =======================
//        GRUPPO F
// =======================
import FlagJapan from '/gironi/F/Jap.png';
import FlagOlanda from '/gironi/F/Ndl.png';
import FlagTurchia from '/gironi/F/Tur.png';

// =======================
//        GRUPPO G
// =======================
import FlagBelgio from '/gironi/G/Bel.png';
import FlagEgitto from '/gironi/G/Egt.png';
import FlagIran from '/gironi/G/Irn.png';
import FlagNuovaZelanda from '/gironi/G/NZl.png';

// =======================
//        GRUPPO H
// =======================
import FlagCapoVerde from '/gironi/H/CVr.png';
import FlagArabiaSaudita from '/gironi/H/SAr.png';
import FlagSpagna from '/gironi/H/Spa.png';
import FlagUruguay from '/gironi/H/Uru.png';

// =======================
//        GRUPPO I
// =======================
import FlagFrancia from '/gironi/I/Fra.png';
import FlagNorvegia from '/gironi/I/Nor.png';
import FlagSenegal from '/gironi/I/Sen.png';

// =======================
//        GRUPPO J
// =======================
import FlagAlgeria from '/gironi/J/Alg.png';
import FlagArgentina from '/gironi/J/Arg.png';
import FlagAustria from '/gironi/J/Aut.png';
import FlagJordania from '/gironi/J/Jor.png';

// =======================
//        GRUPPO K
// =======================
import FlagColombia from '/gironi/K/Col.png';
import FlagPortogallo from '/gironi/K/Por.png';
import FlagUzbekistan from '/gironi/K/Uzb.png';

// =======================
//        GRUPPO L
// =======================
import FlagCroazia from '/gironi/L/Cro.png';
import FlagGhana from '/gironi/L/Gha.png';
import FlagInghilterra from '/gironi/L/Ing.png';
import FlagPanama from '/gironi/L/Pan.png';


// ===================================================================
//  MAPPA SQUADRE MONDIALI 2026
//  - Ordine Gruppo A: 1) Mexico 2) Sudafrica 3) Corea del Sud
//  - Squadre Playoff / FIFA NON incluse (come richiesto)
// ===================================================================

export const squadreMond26 = {
  A: [
    { id: 'MEX', name: 'Mexico', group: 'A', flag: FlagMexico },
    { id: 'SAF', name: 'Sudafrica', group: 'A', flag: FlagSudafrica },
    { id: 'KOR', name: 'Korea', group: 'A', flag: FlagKorea },
  ],

  B: [
    { id: 'CAN', name: 'Canada', group: 'B', flag: FlagCanada },
    { id: 'ITA', name: 'Italia', group: 'B', flag: FlagItalia },
    { id: 'QTR', name: 'Qatar', group: 'B', flag: FlagQatar },
    { id: 'SWI', name: 'Svizzera', group: 'B', flag: FlagSvizzera },
  ],

  C: [
    { id: 'BRA', name: 'Brasile', group: 'C', flag: FlagBrasile },
    { id: 'HAI', name: 'Haiti', group: 'C', flag: FlagHaiti },
    { id: 'MOR', name: 'Marocco', group: 'C', flag: FlagMorocco },
    { id: 'SCO', name: 'Scozia', group: 'C', flag: FlagScozia },
  ],

  D: [
    { id: 'AUS', name: 'Australia', group: 'D', flag: FlagAustralia },
    { id: 'PAR', name: 'Paraguay', group: 'D', flag: FlagParaguay },
    { id: 'USA', name: 'StatiUniti', group: 'D', flag: FlagUsa },
  ],

  E: [
    { id: 'CAV', name: "CostaAvorio", group: 'E', flag: FlagCostaAvorio },
    { id: 'CUR', name: 'Curaçao', group: 'E', flag: FlagCuracao },
    { id: 'ECU', name: 'Ecuador', group: 'E', flag: FlagEcuador },
    { id: 'GER', name: 'Germania', group: 'E', flag: FlagGermania },
  ],

  F: [
    { id: 'JAP', name: 'Giappone', group: 'F', flag: FlagJapan },
    { id: 'NDL', name: 'Netherland', group: 'F', flag: FlagOlanda },
    { id: 'TUR', name: 'Turchia', group: 'F', flag: FlagTurchia },
  ],

  G: [
    { id: 'BEL', name: 'Belgio', group: 'G', flag: FlagBelgio },
    { id: 'EGT', name: 'Egitto', group: 'G', flag: FlagEgitto },
    { id: 'IRN', name: 'Iran', group: 'G', flag: FlagIran },
    { id: 'NZL', name: 'Nuova Zelanda', group: 'G', flag: FlagNuovaZelanda },
  ],

  H: [
    { id: 'SAR', name: 'Arabia Saudita', group: 'H', flag: FlagArabiaSaudita },
    { id: 'CVR', name: 'Capo Verde', group: 'H', flag: FlagCapoVerde },
    { id: 'SPA', name: 'Spagna', group: 'H', flag: FlagSpagna },
    { id: 'URU', name: 'Uruguay', group: 'H', flag: FlagUruguay },
  ],

  I: [
    { id: 'FRA', name: 'Francia', group: 'I', flag: FlagFrancia },
    { id: 'NOR', name: 'Norvegia', group: 'I', flag: FlagNorvegia },
    { id: 'SEN', name: 'Senegal', group: 'I', flag: FlagSenegal },
  ],

  J: [
    { id: 'ALG', name: 'Algeria', group: 'J', flag: FlagAlgeria },
    { id: 'ARG', name: 'Argentina', group: 'J', flag: FlagArgentina },
    { id: 'AUT', name: 'Austria', group: 'J', flag: FlagAustria },
    { id: 'JOR', name: 'Giordania', group: 'J', flag: FlagJordania },
  ],

  K: [
    { id: 'COL', name: 'Colombia', group: 'K', flag: FlagColombia },
    { id: 'POR', name: 'Portogallo', group: 'K', flag: FlagPortogallo },
    { id: 'UZB', name: 'Uzbekistan', group: 'K', flag: FlagUzbekistan },
  ],

  L: [
    { id: 'CRO', name: 'Croazia', group: 'L', flag: FlagCroazia },
    { id: 'GHA', name: 'Ghana', group: 'L', flag: FlagGhana },
    { id: 'ING', name: 'Inghilterra', group: 'L', flag: FlagInghilterra },
    { id: 'PAN', name: 'Panama', group: 'L', flag: FlagPanama },
  ],
};

// Opzionale: array piatto di tutte le squadre (se ti serve per map, dropdown, ecc.)
export const squadreMond = Object.values(squadreMond26).flat();

// -------------------------------------------------------------------------------------- -------------------------------------------
// export const SqEndGruppo1 =  6; //taglio prima linea
// export const SqEndGruppo2 = 12; //taglio seconda linea
// export const ItalInChampio = 4;
// export const ItalInEurLeag = 2;
// export const TotaleGiornate=38;
// export const EyeSymbol = '👁️'
// export const PinSymbol = '📍'
// export const ChjSymbol = '☑️'
// export const ChkSymbol = '✅'
// export const DelSymbol = '🔄'
// -------------------------------------------------------------------------------------- -------------------------------------------