// === IMPORT BANDIERE (metti i path corretti ai tuoi asset) ===
// =======================
//        GRUPPO A
// =======================
import FlagKorea from '/gironi/A/Kor.png';
import FlagMexico from '/gironi/A/Mex.png';
import PlayA from '/gironi/A/PlayA.png';
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
import PlayD from '/gironi/D/PlayD.png';
import FlagUsa from '/gironi/D/Usa.png';

// =======================
//        GRUPPO E
// =======================
import FlagCAvorio from '/gironi/E/CAv.png';
import FlagCuracao from '/gironi/E/Cur.png';
import FlagEcuador from '/gironi/E/Ecu.png';
import FlagGermania from '/gironi/E/Ger.png';

// =======================
//        GRUPPO F
// =======================
import FlagJapan from '/gironi/F/Jap.png';
import FlagOlanda from '/gironi/F/Ndl.png';
import PlayF from '/gironi/F/PlayF.png';
import FlagTunisia from '/gironi/F/Tun.png';

// =======================
//        GRUPPO G
// =======================
import FlagBelgio from '/gironi/G/Bel.png';
import FlagEgitto from '/gironi/G/Egt.png';
import FlagIran from '/gironi/G/Irn.png';
import FlagNZelanda from '/gironi/G/NZl.png';

// =======================
//        GRUPPO H
// =======================
import FlagCpVerde from '/gironi/H/CpV.png';
import FlagSArabia from '/gironi/H/SAr.png';
import FlagSpagna from '/gironi/H/Spa.png';
import FlagUruguay from '/gironi/H/Uru.png';

// =======================
//        GRUPPO I
// =======================
import FlagFrancia from '/gironi/I/Fra.png';
import FlagNorvegia from '/gironi/I/Nor.png';
import PlayI from '/gironi/I/PlayI.png';
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
import PlayK from '/gironi/K/PlayK.png';
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

export const flagsMond26 = {
  A: [
    { id: 'MEX', name: 'Mexico',    group: 'A', flag: FlagMexico },
    { id: 'SAF', name: 'Sudafrica', group: 'A', flag: FlagSudafrica },
    { id: 'KOR', name: 'Korea',     group: 'A', flag: FlagKorea },
    { id: 'IRL', name: 'IRL',       group: 'A', flag: PlayA },
  ],

  B: [
    { id: 'CAN', name: 'Canada',    group: 'B', flag: FlagCanada },
    { id: 'ITA', name: 'Italia',    group: 'B', flag: FlagItalia },
    { id: 'QTR', name: 'Qatar',     group: 'B', flag: FlagQatar },
    { id: 'SWI', name: 'Svizzera',  group: 'B', flag: FlagSvizzera },
  ],

  C: [
    { id: 'BRA', name: 'Brasile',   group: 'C', flag: FlagBrasile },
    { id: 'HAI', name: 'Haiti',     group: 'C', flag: FlagHaiti },
    { id: 'MOR', name: 'Marocco',   group: 'C', flag: FlagMorocco },
    { id: 'SCO', name: 'Scozia',    group: 'C', flag: FlagScozia },
  ],

  D: [
    { id: 'USA', name: 'StatiUniti',group: 'D', flag: FlagUsa },
    { id: 'PAR', name: 'Paraguay',  group: 'D', flag: FlagParaguay },
    { id: 'AUS', name: 'Australia', group: 'D', flag: FlagAustralia },
    { id: 'TUR', name: 'TUR',       group: 'D', flag: PlayD },
  ],

  E: [
    { id: 'GER', name: 'Germania',  group: 'E', flag: FlagGermania },
    { id: 'CUR', name: 'Curacao',   group: 'E', flag: FlagCuracao },
    { id: 'CAV', name: "CAvorio",   group: 'E', flag: FlagCAvorio },
    { id: 'ECU', name: 'Ecuador',   group: 'E', flag: FlagEcuador },
  ],

  F: [
    { id: 'NDL', name: 'Netherland',group: 'F', flag: FlagOlanda },
    { id: 'TUN', name: 'Tunisia',   group: 'F', flag: FlagTunisia },
    { id: 'JAP', name: 'Japan',     group: 'F', flag: FlagJapan },
    { id: 'ALB', name: 'ALB',       group: 'F', flag: PlayF },
  ],

  G: [
    { id: 'BEL', name: 'Belgio',    group: 'G', flag: FlagBelgio },
    { id: 'EGT', name: 'Egitto',    group: 'G', flag: FlagEgitto },
    { id: 'IRN', name: 'Iran',      group: 'G', flag: FlagIran },
    { id: 'NZL', name: 'NZelanda',  group: 'G', flag: FlagNZelanda },
  ],

  H: [
    { id: 'SPA', name: 'Spagna',    group: 'H', flag: FlagSpagna },
    { id: 'SAR', name: 'SArabia',   group: 'H', flag: FlagSArabia },
    { id: 'CPV', name: 'CpVerde',   group: 'H', flag: FlagCpVerde },
    { id: 'URU', name: 'Uruguay',   group: 'H', flag: FlagUruguay },
  ],

  I: [
    { id: 'FRA',  name: 'Francia',  group: 'I', flag: FlagFrancia },
    { id: 'SEN',  name: 'Senegal',  group: 'I', flag: FlagSenegal },
    { id: 'NOR',  name: 'Norvegia', group: 'I', flag: FlagNorvegia },
    { id: 'BOL',  name: 'BOL',      group: 'I', flag: PlayI },
  ],

  J: [
    { id: 'ARG', name: 'Argentina', group: 'J', flag: FlagArgentina },
    { id: 'ALG', name: 'Algeria',   group: 'J', flag: FlagAlgeria },
    { id: 'AUT', name: 'Austria',   group: 'J', flag: FlagAustria },
    { id: 'JOR', name: 'Jordania',  group: 'J', flag: FlagJordania },
  ],

  K: [
    { id: 'POR', name: 'Portogallo',group: 'K', flag: FlagPortogallo },
    { id: 'COL', name: 'Colombia',  group: 'K', flag: FlagColombia },
    { id: 'UZB', name: 'Uzbekistan',group: 'K', flag: FlagUzbekistan },
    { id: 'JAM',name: 'JAM',      group: 'K', flag: PlayK },
  ],

  L: [
    { id: 'ING', name: 'Inghilterra',group: 'L', flag: FlagInghilterra },
    { id: 'CRO', name: 'Croazia',    group: 'L', flag: FlagCroazia },
    { id: 'GHA', name: 'Ghana',      group: 'L', flag: FlagGhana },
    { id: 'PAN', name: 'Panama',     group: 'L', flag: FlagPanama },
  ],
};

// Opzionale: array piatto di tutte le squadre (se ti serve per map, dropdown, ecc.)
export const flagsMond = Object.values(flagsMond26).flat();


export const LOCAL_STORAGE_KEY = "matches_base_local";
export const ADMIN_EMAIL = "simobara@hotmail.it";
// 🔁 INTERUTTORE UNICO DELL’APP
// cambia SOLO questa riga se Supabase non va
//👉 Quando Supabase non va: export const DATA_SOURCE = LOCAL;
const REMOTE = "remote";
const LOCAL = "local";
export const DATA_SOURCE = REMOTE; // oppure LOCAL 

// -------------------------------------------------------------------------------------- -------------------------------------------
// export const SqEndGruppo1 =  6; //taglio prima linea
// export const SqEndGruppo2 = 12; //taglio seconda linea
// export const ItalInChampio = 4;
// export const ItalInEurLeag = 2;
// export const TotaleGiornate=38;
// export const EyeSymbol = '👁️'
export const PinSymbol = '📍'
// export const ChjSymbol = '☑️'
// export const ChkSymbol = '✅'
// export const DelSymbol = '🔄'
// -------------------------------------------------------------------------------------- -------------------------------------------