// === IMPORT BANDIERE (metti i path corretti ai tuoi asset) ===
// =======================
//        GRUPPO A
// =======================
import FlagCoreaSud from '../../../public/gironi/A/Kor.png';
import FlagMessico from '../../../public/gironi/A/Mes.png';
import FlagSudafrica from '../../../public/gironi/A/SAf.png';

// =======================
//        GRUPPO B
// =======================
import FlagCanada from '../../../public/gironi/B/Can.png';
import FlagItalia from '../../../public/gironi/B/Ita.png';
import FlagQatar from '../../../public/gironi/B/Qtr.png';
import FlagSvizzera from '../../../public/gironi/B/Swi.png';

// =======================
//        GRUPPO C
// =======================
import FlagBrasile from '../../../public/gironi/C/Bra.png';
import FlagHaiti from '../../../public/gironi/C/Hai.png';
import FlagMorocco from '../../../public/gironi/C/Mor.png';
import FlagScozia from '../../../public/gironi/C/Sco.png';

// =======================
//        GRUPPO D
// =======================
import FlagAustralia from '../../../public/gironi/D/Aus.png';
import FlagParaguay from '../../../public/gironi/D/Par.png';
import FlagUsa from '../../../public/gironi/D/Usa.png';

// =======================
//        GRUPPO E
// =======================
import FlagCostaAvorio from '../../../public/gironi/E/CAv.png';
import FlagCuracao from '../../../public/gironi/E/Cur.png';
import FlagEcuador from '../../../public/gironi/E/Ecu.png';
import FlagGermania from '../../../public/gironi/E/Ger.png';

// =======================
//        GRUPPO F
// =======================
import FlagGiappone from '../../../public/gironi/F/Jap.png';
import FlagOlanda from '../../../public/gironi/F/Ndl.png';
import FlagTurchia from '../../../public/gironi/F/Tur.png';

// =======================
//        GRUPPO G
// =======================
import FlagBelgio from '../../../public/gironi/G/Bel.png';
import FlagEgitto from '../../../public/gironi/G/Egt.png';
import FlagIran from '../../../public/gironi/G/Irn.png';
import FlagNuovaZelanda from '../../../public/gironi/G/NZl.png';

// =======================
//        GRUPPO H
// =======================
import FlagCapoVerde from '../../../public/gironi/H/CVr.png';
import FlagArabiaSaudita from '../../../public/gironi/H/SAr.png';
import FlagSpagna from '../../../public/gironi/H/Spa.png';
import FlagUruguay from '../../../public/gironi/H/Uru.png';

// =======================
//        GRUPPO I
// =======================
import FlagFrancia from '../../../public/gironi/I/Fra.png';
import FlagNorvegia from '../../../public/gironi/I/Nor.png';
import FlagSenegal from '../../../public/gironi/I/Sen.png';

// =======================
//        GRUPPO J
// =======================
import FlagAlgeria from '../../../public/gironi/J/Alg.png';
import FlagArgentina from '../../../public/gironi/J/Arg.png';
import FlagAustria from '../../../public/gironi/J/Aus.png';
import FlagGiordania from '../../../public/gironi/J/Gio.png';

// =======================
//        GRUPPO K
// =======================
import FlagColombia from '../../../public/gironi/K/Col.png';
import FlagPortogallo from '../../../public/gironi/K/Por.png';
import FlagUzbekistan from '../../../public/gironi/K/Uzb.png';

// =======================
//        GRUPPO L
// =======================
import FlagCroazia from '../../../public/gironi/L/Cro.png';
import FlagGhana from '../../../public/gironi/L/Gha.png';
import FlagInghilterra from '../../../public/gironi/L/Ing.png';
import FlagPanama from '../../../public/gironi/L/Pan.png';


// ===================================================================
//  MAPPA SQUADRE MONDIALI 2026
//  - Ordine Gruppo A: 1) Messico 2) Sudafrica 3) Corea del Sud
//  - Squadre Playoff / FIFA NON incluse (come richiesto)
// ===================================================================

export const squadreMond26 = {
  A: [
    { id: 'MEX', name: 'Messico', group: 'A', flag: FlagMessico },
    { id: 'RSA', name: 'Sudafrica', group: 'A', flag: FlagSudafrica },
    { id: 'KOR', name: 'Corea del Sud', group: 'A', flag: FlagCoreaSud },
  ],

  B: [
    { id: 'CAN', name: 'Canada', group: 'B', flag: FlagCanada },
    { id: 'ITA', name: 'Italia', group: 'B', flag: FlagItalia },
    { id: 'QAT', name: 'Qatar', group: 'B', flag: FlagQatar },
    { id: 'SUI', name: 'Svizzera', group: 'B', flag: FlagSvizzera },
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
    { id: 'JPN', name: 'Giappone', group: 'F', flag: FlagGiappone },
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
    { id: 'ESP', name: 'Spagna', group: 'H', flag: FlagSpagna },
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
    { id: 'JOR', name: 'Giordania', group: 'J', flag: FlagGiordania },
  ],

  K: [
    { id: 'COL', name: 'Colombia', group: 'K', flag: FlagColombia },
    { id: 'POR', name: 'Portogallo', group: 'K', flag: FlagPortogallo },
    { id: 'UZB', name: 'Uzbekistan', group: 'K', flag: FlagUzbekistan },
  ],

  L: [
    { id: 'CRO', name: 'Croazia', group: 'L', flag: FlagCroazia },
    { id: 'GHA', name: 'Ghana', group: 'L', flag: FlagGhana },
    { id: 'ENG', name: 'Inghilterra', group: 'L', flag: FlagInghilterra },
    { id: 'PAN', name: 'Panama', group: 'L', flag: FlagPanama },
  ],
};

// Opzionale: array piatto di tutte le squadre (se ti serve per map, dropdown, ecc.)
export const squadreMond = Object.values(squadreMond26).flat();

// -------------------------------------------------------------------------------------- -------------------------------------------
export const SqEndGruppo1 =  6; //taglio prima linea
export const SqEndGruppo2 = 12; //taglio seconda linea
export const ItalInChampio = 4;
export const ItalInEurLeag = 2;
export const TotaleGiornate=38;
export const EyeSymbol = '👁️'
export const PinSymbol = '📍'
export const ChjSymbol = '☑️'
export const ChkSymbol = '✅'
export const DelSymbol = '🔄'
// -------------------------------------------------------------------------------------- -------------------------------------------