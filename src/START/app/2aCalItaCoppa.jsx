// Coppa Italia 2025/26
const CoppaItaliaCalendario26 = {
   testeDiSerie: [
        { id: 1, pos: 'AOttavi1', 		name: 'Bologna'   },
        { id: 2, pos: 'AOttavi2', 		name: 'Lazio'     },
        { id: 3, pos: 'AOttavi3', 		name: 'Juve'      },
        { id: 4, pos: 'AOttavi4', 		name: 'Atalanta'  },
        
        { id: 5, pos: 'BOttavi1', 		name: 'Inter'     },
        { id: 6, pos: 'BOttavi2', 		name: 'Roma'      },
        { id: 7, pos: 'BOttavi3', 		name: 'Fiorentina'},
        { id: 8, pos: 'BOttavi4', 		name: 'Napoli'    },
    ],
  //------                                                                                                      ---  Turno 1
  turno_1: {
    dates: [
      'AGO/15',
      'AGO/16',
      'AGO/17',
      'AGO/18',
    ],
    matches: [
      // A
      { id: 1,  numero: 1,  pos: '5%',           day: '   ', time: '     ', team1: 'Parma',       team2: 'Pescara',    pron: ' ', ris: '2-0' },
      { id: 2,  numero: 2,  pos: '15%',          day: '   ', time: '     ', team1: 'Spezia',      team2: 'Sampdoria',  pron: ' ', ris: '1-1' },
      { id: 3,  numero: 3,  pos: '30%',          day: '   ', time: '     ', team1: 'Milan',       team2: 'Bari',       pron: ' ', ris: '2-0' },
      { id: 4,  numero: 4,  pos: '40%',          day: '   ', time: '     ', team1: 'Lecce',       team2: 'JuveStabia', pron: ' ', ris: '2-0' },

      { id: 5,  numero: 5,  pos: 'bottom-36%',   day: '   ', time: '     ', team1: 'Udinese',     team2: 'Carrarese',  pron: ' ', ris: '2-0' },
      { id: 6,  numero: 6,  pos: 'bottom-26%',   day: '   ', time: '     ', team1: 'Cremonese',   team2: 'Palermo',    pron: ' ', ris: '0-0' },
      { id: 7,  numero: 7,  pos: 'bottom-11%',   day: '   ', time: '     ', team1: 'Empoli',      team2: 'Reggiana',   pron: ' ', ris: '1-1' },
      { id: 8,  numero: 8,  pos: 'bottom-1%',    day: '   ', time: '     ', team1: 'Genoa',       team2: 'Vicenza',    pron: ' ', ris: '3-0' },
      
      // B
      { id: 9,  numero: 9,  pos: '5%',           day: '   ', time: '     ', team1: 'Verona',      team2: 'Cerignola',  pron: ' ', ris: '1-1' },
      { id:10,  numero: 10, pos: '15%',          day: '   ', time: '     ', team1: 'Venezia',     team2: 'Mantova',    pron: ' ', ris: '4-0' },
      { id:11,  numero: 11, pos: '30%',          day: '   ', time: '     ', team1: 'Torino',      team2: 'Modena',     pron: ' ', ris: '1-0' },
      { id:12,  numero: 12, pos: '40%',          day: '   ', time: '     ', team1: 'Cesena',      team2: 'Pisa',       pron: ' ', ris: '0-0' },

      { id:13,  numero: 13, pos: 'bottom-36%',   day: '   ', time: '     ', team1: 'Como',        team2: 'SudTirol',   pron: ' ', ris: '3-1' },
      { id:14,  numero: 14, pos: 'bottom-26%',   day: '   ', time: '     ', team1: 'Sassuolo',    team2: 'Catanzaro',  pron: ' ', ris: '1-0' },
      { id:15,  numero: 15, pos: 'bottom-11%',   day: '   ', time: '     ', team1: 'Monza',       team2: 'Frosinone',  pron: ' ', ris: '0-1' },
      { id:16,  numero: 16, pos: 'bottom-1%',    day: '   ', time: '     ', team1: 'Cagliari',    team2: 'Entella',    pron: ' ', ris: '1-1' },
    ],
  },
  //------                                                                                                      ---  Turno 2
  turno_2: {
    dates: [
      'SET/24',
      'SET/25',      
    ],
    matches: [
      // A
      { id: 1, numero: 1, pos: '10%', day: '   ', time: '     ', team1: 'Parma',    team2: 'Spezia',      pron: ' ', ris: '2-2' },
      { id: 2, numero: 2, pos: '35%', day: '   ', time: '     ', team1: 'Milan',    team2: 'Lecce',       pron: ' ', ris: '3-0' },
      { id: 3, numero: 3, pos: '31%', day: '   ', time: '     ', team1: 'Udinese',  team2: 'Cremonese',   pron: ' ', ris: '1-0' },
      { id: 4, numero: 4, pos: '6%',  day: '   ', time: '     ', team1: 'Empoli',   team2: 'Genoa',       pron: ' ', ris: '1-3' },
      // B
      { id: 5, numero: 5, pos: '10%', day: '   ', time: '     ', team1: 'Verona',   team2: 'Venezia',     pron: ' ', ris: '0-0' },
      { id: 6, numero: 6, pos: '35%', day: '   ', time: '     ', team1: 'Torino',   team2: 'Pisa',        pron: ' ', ris: '1-0' },
      { id: 7, numero: 7, pos: '31%', day: '   ', time: '     ', team1: 'Como',     team2: 'Sassuolo',    pron: ' ', ris: '3-0' },
      { id: 8, numero: 8, pos: '6%',  day: '   ', time: '     ', team1: 'Frosinone',team2: 'Cagliari',    pron: ' ', ris: '1-4' },
    ],
  },
  //------                                                                                                      ---  Ottavi 
  ottavi: {
    dates: [
      'DIC/03',
      'DIC/04',
      
      'DIC/16', 
      'DIC/17'
    ],
    matches: [
      // A
      { id: 1, numero: 1, pos: '8%',  day: '   ', time: '     ', team1: 'Bologna',    team2: 'Parma    ', pron: ' ', ris: '' },
      { id: 2, numero: 2, pos: '32%', day: '   ', time: '     ', team1: 'Lazio',      team2: 'Milan    ', pron: ' ', ris: '' },
      { id: 3, numero: 3, pos: '33%', day: '   ', time: '     ', team1: 'Juve',       team2: 'Udinese  ', pron: ' ', ris: '' },
      { id: 4, numero: 4, pos: '9%',  day: '   ', time: '     ', team1: 'Atalanta',   team2: 'Genoa    ', pron: ' ', ris: '' },
      // B
      { id: 5, numero: 5, pos: '8%',  day: '   ', time: '     ', team1: 'Inter',      team2: 'Venezia   ', pron: ' ', ris: '' },
      { id: 6, numero: 6, pos: '32%', day: '   ', time: '     ', team1: 'Roma',       team2: 'Torino    ', pron: ' ', ris: '' },
      { id: 7, numero: 7, pos: '33%', day: '   ', time: '     ', team1: 'Fiorentina', team2: 'Como      ', pron: ' ', ris: '' },
      { id: 8, numero: 8, pos: '9%',  day: '   ', time: '     ', team1: 'Napoli',     team2: 'Cagliari  ', pron: ' ', ris: '' },
    ],
  },
  //------                                                                                                      ---  Quarti
  quarti: {
    dates: [
      'FEB/03',
      'FEB/04',
      
      'FEB/10',
      'FEB/11'
    ],
    matches: [
      // A
      { id: 1, numero: 1, pos: '20%', day: '   ', time: '     ', team1: 'Bologna', team2: 'Milan   ', pron: ' ', ris: '' },
      { id: 2, numero: 2, pos: '70%', day: '   ', time: '     ', team1: 'Juve   ', team2: 'Atalanta', pron: ' ', ris: '' },
      // B
      { id: 3, numero: 3, pos: '20%', day: '   ', time: '     ', team1: 'Inter  ', team2: 'Roma    ', pron: ' ', ris: '' },
      { id: 4, numero: 4, pos: '70%', day: '   ', time: '     ', team1: 'Como   ', team2: 'Napoli  ', pron: ' ', ris: '' },
    ],
  },
  //------                                                                                                      ---  Semif A
  semifinali_andata: {
    dates: [
      'APR/03',
      'APR/04'
    ],
    matches: [
      { id: 1, numero: 1, pos: '', day: '   ', time: '     ', team1: 'Milan    ', team2: 'Juve      ', pron: ' ', ris: '' },
      { id: 2, numero: 2, pos: '', day: '   ', time: '     ', team1: 'Inter    ', team2: 'Napoli    ', pron: ' ', ris: '' },
    ],
  },
  //------                                                                                                      ---  Semif R
  semifinali_ritorno: {
    dates: [
      'APR/21',
      'APR/22'
    ],
    matches: [
      { id: 1, numero: 1, pos: '', day: '   ', time: '     ', team1: 'Juve  ', team2: 'Milan', pron: ' ', ris: '' },
      { id: 2, numero: 2, pos: '', day: '   ', time: '     ', team1: 'Napoli', team2: 'Inter', pron: ' ', ris: '' },
    ],
  },
  //------                                                                                                      ---  7 Finale
  finale: {
    dates: [
      'MAG/13'
    ],
    matches: [
      { id: 1, numero: 1, pos: '', day: '   ', time: '     ', team1: 'Juve', team2: 'Napoli', pron: ' ', ris: '' },
    ],
  },
};

export const ItaCoppa = CoppaItaliaCalendario26;
