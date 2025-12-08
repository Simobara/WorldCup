require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");

// Definizione dello schema comune per tutte le fasi della competizione
const schemaCoppaIta = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  pos: {
    type: String,
    default: "",
  },
  team1: {
    type: String,
    default: "",
  },
  team2: {
    type: String,
    default: "",
  },
  ris: {
    type: String,
    default: "",
  },
});

// Creazione dei modelli per i trentaduesimi di finale
const CoppaItaTrentaduesimiA1 = mongoose.model("CoppaItaTrentaduesimiA1", schemaCoppaIta, process.env.COLLECTION_COPPA_ITA_TRENTADUESIMI_A1);
const CoppaItaTrentaduesimiA2 = mongoose.model("CoppaItaTrentaduesimiA2", schemaCoppaIta, process.env.COLLECTION_COPPA_ITA_TRENTADUESIMI_A2);
const CoppaItaTrentaduesimiA3 = mongoose.model("CoppaItaTrentaduesimiA3", schemaCoppaIta, process.env.COLLECTION_COPPA_ITA_TRENTADUESIMI_A3);
const CoppaItaTrentaduesimiA4 = mongoose.model("CoppaItaTrentaduesimiA4", schemaCoppaIta, process.env.COLLECTION_COPPA_ITA_TRENTADUESIMI_A4);
const CoppaItaTrentaduesimiA5 = mongoose.model("CoppaItaTrentaduesimiA5", schemaCoppaIta, process.env.COLLECTION_COPPA_ITA_TRENTADUESIMI_A5);
const CoppaItaTrentaduesimiA6 = mongoose.model("CoppaItaTrentaduesimiA6", schemaCoppaIta, process.env.COLLECTION_COPPA_ITA_TRENTADUESIMI_A6);
const CoppaItaTrentaduesimiA7 = mongoose.model("CoppaItaTrentaduesimiA7", schemaCoppaIta, process.env.COLLECTION_COPPA_ITA_TRENTADUESIMI_A7);
const CoppaItaTrentaduesimiA8 = mongoose.model("CoppaItaTrentaduesimiA8", schemaCoppaIta, process.env.COLLECTION_COPPA_ITA_TRENTADUESIMI_A8);

const CoppaItaTrentaduesimiB1 = mongoose.model("CoppaItaTrentaduesimiB1", schemaCoppaIta, process.env.COLLECTION_COPPA_ITA_TRENTADUESIMI_B1);
const CoppaItaTrentaduesimiB2 = mongoose.model("CoppaItaTrentaduesimiB2", schemaCoppaIta, process.env.COLLECTION_COPPA_ITA_TRENTADUESIMI_B2);
const CoppaItaTrentaduesimiB3 = mongoose.model("CoppaItaTrentaduesimiB3", schemaCoppaIta, process.env.COLLECTION_COPPA_ITA_TRENTADUESIMI_B3);
const CoppaItaTrentaduesimiB4 = mongoose.model("CoppaItaTrentaduesimiB4", schemaCoppaIta, process.env.COLLECTION_COPPA_ITA_TRENTADUESIMI_B4);
const CoppaItaTrentaduesimiB5 = mongoose.model("CoppaItaTrentaduesimiB5", schemaCoppaIta, process.env.COLLECTION_COPPA_ITA_TRENTADUESIMI_B5);
const CoppaItaTrentaduesimiB6 = mongoose.model("CoppaItaTrentaduesimiB6", schemaCoppaIta, process.env.COLLECTION_COPPA_ITA_TRENTADUESIMI_B6);
const CoppaItaTrentaduesimiB7 = mongoose.model("CoppaItaTrentaduesimiB7", schemaCoppaIta, process.env.COLLECTION_COPPA_ITA_TRENTADUESIMI_B7);
const CoppaItaTrentaduesimiB8 = mongoose.model("CoppaItaTrentaduesimiB8", schemaCoppaIta, process.env.COLLECTION_COPPA_ITA_TRENTADUESIMI_B8);

// Creazione dei modelli per i sedicesimi di finale
const CoppaItaSedicesimiA1 = mongoose.model("CoppaItaSedicesimiA1", schemaCoppaIta, process.env.COLLECTION_COPPA_ITA_SEDICESIMI_A1);
const CoppaItaSedicesimiA2 = mongoose.model("CoppaItaSedicesimiA2", schemaCoppaIta, process.env.COLLECTION_COPPA_ITA_SEDICESIMI_A2);
const CoppaItaSedicesimiA3 = mongoose.model("CoppaItaSedicesimiA3", schemaCoppaIta, process.env.COLLECTION_COPPA_ITA_SEDICESIMI_A3);
const CoppaItaSedicesimiA4 = mongoose.model("CoppaItaSedicesimiA4", schemaCoppaIta, process.env.COLLECTION_COPPA_ITA_SEDICESIMI_A4);
const CoppaItaSedicesimiB1 = mongoose.model("CoppaItaSedicesimiB1", schemaCoppaIta, process.env.COLLECTION_COPPA_ITA_SEDICESIMI_B1);
const CoppaItaSedicesimiB2 = mongoose.model("CoppaItaSedicesimiB2", schemaCoppaIta, process.env.COLLECTION_COPPA_ITA_SEDICESIMI_B2);
const CoppaItaSedicesimiB3 = mongoose.model("CoppaItaSedicesimiB3", schemaCoppaIta, process.env.COLLECTION_COPPA_ITA_SEDICESIMI_B3);
const CoppaItaSedicesimiB4 = mongoose.model("CoppaItaSedicesimiB4", schemaCoppaIta, process.env.COLLECTION_COPPA_ITA_SEDICESIMI_B4);

// Creazione dei modelli per gli ottavi di finale
const CoppaItaOttaviA1 = mongoose.model("CoppaItaOttaviA1", schemaCoppaIta, process.env.COLLECTION_COPPA_ITA_OTTAVI_A1);
const CoppaItaOttaviA2 = mongoose.model("CoppaItaOttaviA2", schemaCoppaIta, process.env.COLLECTION_COPPA_ITA_OTTAVI_A2);
const CoppaItaOttaviA3 = mongoose.model("CoppaItaOttaviA3", schemaCoppaIta, process.env.COLLECTION_COPPA_ITA_OTTAVI_A3);
const CoppaItaOttaviA4 = mongoose.model("CoppaItaOttaviA4", schemaCoppaIta, process.env.COLLECTION_COPPA_ITA_OTTAVI_A4);
const CoppaItaOttaviB1 = mongoose.model("CoppaItaOttaviB1", schemaCoppaIta, process.env.COLLECTION_COPPA_ITA_OTTAVI_B1);
const CoppaItaOttaviB2 = mongoose.model("CoppaItaOttaviB2", schemaCoppaIta, process.env.COLLECTION_COPPA_ITA_OTTAVI_B2);
const CoppaItaOttaviB3 = mongoose.model("CoppaItaOttaviB3", schemaCoppaIta, process.env.COLLECTION_COPPA_ITA_OTTAVI_B3);
const CoppaItaOttaviB4 = mongoose.model("CoppaItaOttaviB4", schemaCoppaIta, process.env.COLLECTION_COPPA_ITA_OTTAVI_B4);

// Creazione dei modelli per i quarti di finale
const CoppaItaQuartiA1 = mongoose.model("CoppaItaQuartiA1", schemaCoppaIta, process.env.COLLECTION_COPPA_ITA_QUARTI_A1);
const CoppaItaQuartiA2 = mongoose.model("CoppaItaQuartiA2", schemaCoppaIta, process.env.COLLECTION_COPPA_ITA_QUARTI_A2);
const CoppaItaQuartiB1 = mongoose.model("CoppaItaQuartiB1", schemaCoppaIta, process.env.COLLECTION_COPPA_ITA_QUARTI_B1);
const CoppaItaQuartiB2 = mongoose.model("CoppaItaQuartiB2", schemaCoppaIta, process.env.COLLECTION_COPPA_ITA_QUARTI_B2);

// Creazione dei modelli per le semifinali
const CoppaItaSemifinaleA = mongoose.model("CoppaItaSemifinaleA", schemaCoppaIta, process.env.COLLECTION_COPPA_ITA_SEMIF_A);
const CoppaItaSemifinaleB = mongoose.model("CoppaItaSemifinaleB", schemaCoppaIta, process.env.COLLECTION_COPPA_ITA_SEMIF_B);

// Creazione del modello per la finale
const CoppaItaFinale = mongoose.model("CoppaItaFinale", schemaCoppaIta, process.env.COLLECTION_COPPA_ITA_FINALE);

module.exports = {
  CoppaItaTrentaduesimiA1,
  CoppaItaTrentaduesimiA2,
  CoppaItaTrentaduesimiA3,
  CoppaItaTrentaduesimiA4,
  CoppaItaTrentaduesimiA5,
  CoppaItaTrentaduesimiA6,
  CoppaItaTrentaduesimiA7,
  CoppaItaTrentaduesimiA8,
  CoppaItaTrentaduesimiB1,
  CoppaItaTrentaduesimiB2,
  CoppaItaTrentaduesimiB3,
  CoppaItaTrentaduesimiB4,
  CoppaItaTrentaduesimiB5,
  CoppaItaTrentaduesimiB6,
  CoppaItaTrentaduesimiB7,
  CoppaItaTrentaduesimiB8,
  CoppaItaSedicesimiA1,
  CoppaItaSedicesimiA2,
  CoppaItaSedicesimiA3,
  CoppaItaSedicesimiA4,
  CoppaItaSedicesimiB1,
  CoppaItaSedicesimiB2,
  CoppaItaSedicesimiB3,
  CoppaItaSedicesimiB4,
  CoppaItaOttaviA1,
  CoppaItaOttaviA2,
  CoppaItaOttaviA3,
  CoppaItaOttaviA4,
  CoppaItaOttaviB1,
  CoppaItaOttaviB2,
  CoppaItaOttaviB3,
  CoppaItaOttaviB4,
  CoppaItaQuartiA1,
  CoppaItaQuartiA2,
  CoppaItaQuartiB1,
  CoppaItaQuartiB2,
  CoppaItaSemifinaleA,
  CoppaItaSemifinaleB,
  CoppaItaFinale,
};
