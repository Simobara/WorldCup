const mongoose = require("mongoose");
const schemaPartita = new mongoose.Schema(
  {
    numero: {
      type: Number,
      required: true,
    },
    day: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    team1: {
      type: String,
      required: true,
    },
    team2: {
      type: String,
      required: true,
    },
    pron: {
      type: String,
      default: "",
    },
    results: {
      type: String,
      default: "",
    },
  },
  { _id: false }, // Disabilita l'_id per i subdocumenti
);
const schemaGiornataClou = new mongoose.Schema({
  giornata: [schemaPartita],
});

module.exports = schemaGiornataClou;
