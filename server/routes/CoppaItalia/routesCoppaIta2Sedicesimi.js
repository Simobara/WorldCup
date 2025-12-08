

// COMPONENTE ROUTES COPPAITA SEDICESIMI
// ENDPOINT: http://localhost:5000/api/coppaItaSedicesimiA1/sedicesimiA1
// ENDPOINT: http://localhost:5000/api/coppaItaSedicesimiA2/sedicesimiA2
// ENDPOINT: http://localhost:5000/api/coppaItaSedicesimiA3/sedicesimiA3
// ENDPOINT: http://localhost:5000/api/coppaItaSedicesimiA4/sedicesimiA4
// ENDPOINT: http://localhost:5000/api/coppaItaSedicesimiB1/sedicesimiB1
// ENDPOINT: http://localhost:5000/api/coppaItaSedicesimiB2/sedicesimiB2
// ENDPOINT: http://localhost:5000/api/coppaItaSedicesimiB3/sedicesimiB3
// ENDPOINT: http://localhost:5000/api/coppaItaSedicesimiB4/sedicesimiB4
//! IL FILE E' CORRETTO
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const dropCollections = require("../../DropCollections/dropCollectionGroupColl");
const {
  CoppaItaSedicesimiA1,
  CoppaItaSedicesimiA2,
  CoppaItaSedicesimiA3,
  CoppaItaSedicesimiA4,
  CoppaItaSedicesimiB1,
  CoppaItaSedicesimiB2,
  CoppaItaSedicesimiB3,
  CoppaItaSedicesimiB4,
} = require("../../schemas/schemaCoppaIta");

// Funzione per determinare quale modello utilizzare in base all'URL
const getModel = (path) => {
  if (path.includes("sedicesimiA1")) return CoppaItaSedicesimiA1;
  if (path.includes("sedicesimiA2")) return CoppaItaSedicesimiA2;
  if (path.includes("sedicesimiA3")) return CoppaItaSedicesimiA3;
  if (path.includes("sedicesimiA4")) return CoppaItaSedicesimiA4;
  if (path.includes("sedicesimiB1")) return CoppaItaSedicesimiB1;
  if (path.includes("sedicesimiB2")) return CoppaItaSedicesimiB2;
  if (path.includes("sedicesimiB3")) return CoppaItaSedicesimiB3;
  if (path.includes("sedicesimiB4")) return CoppaItaSedicesimiB4;
  return null;
};

// Endpoint per prendere i dati dei sedicesimi
router.get(
  [
    "/coppaItaSedicesimiA1/sedicesimiA1",
    "/coppaItaSedicesimiA2/sedicesimiA2",
    "/coppaItaSedicesimiA3/sedicesimiA3",
    "/coppaItaSedicesimiA4/sedicesimiA4",
    "/coppaItaSedicesimiB1/sedicesimiB1",
    "/coppaItaSedicesimiB2/sedicesimiB2",
    "/coppaItaSedicesimiB3/sedicesimiB3",
    "/coppaItaSedicesimiB4/sedicesimiB4",
  ],
  async (req, res) => {
    try {
      const model = getModel(req.path);
      if (!model) {
        return res.status(400).send("Modello non trovato per l'endpoint richiesto.");
      }

      const limit = parseInt(req.query.limit) || 10;
      const page = parseInt(req.query.page) || 1;
      const sedicesimi = await model
        .find()
        .limit(limit)
        .skip((page - 1) * limit);
      console.log(`Sedicesimi (${req.path})`, sedicesimi);
      res.send(sedicesimi);
    } catch (error) {
      console.error(`Errore durante il recupero dei sedicesimi (${req.path}):`, error);
      res.status(500).send(error);
    }
  },
);

// Endpoint per aggiornare il nome della squadra e il risultato
router.post(
  [
    "/coppaItaSedicesimiA1/sedicesimiA1",
    "/coppaItaSedicesimiA2/sedicesimiA2",
    "/coppaItaSedicesimiA3/sedicesimiA3",
    "/coppaItaSedicesimiA4/sedicesimiA4",
    "/coppaItaSedicesimiB1/sedicesimiB1",
    "/coppaItaSedicesimiB2/sedicesimiB2",
    "/coppaItaSedicesimiB3/sedicesimiB3",
    "/coppaItaSedicesimiB4/sedicesimiB4",
  ],
  async (req, res) => {
    try {
      const model = getModel(req.path);
      if (!model) {
        return res.status(400).send("Modello non trovato per l'endpoint richiesto.");
      }

      let { _id, id, team1, team2, ris } = req.body;

      // Se _id non è definito o è null, creiamo un nuovo ObjectId
      if (!_id) {
        _id = new mongoose.Types.ObjectId();
      }

      // Assicuriamoci che l'id sia un numero intero
      if (!id || typeof id !== "number") {
        return res.status(400).send({ error: "Invalid id" });
      }

      // Trova il record per ID e aggiorna i campi team1, team2, ris e id
      const sedicesimi = await model.findOneAndUpdate({ _id }, { id, team1, team2, ris }, { new: true, upsert: true });

      console.log(`Partita aggiornata o creata (${req.path}):`, sedicesimi);

      // Cadono Collection non richieste nel database corrispondente
      // await dropCollections();
      console.log(`dropCollections CoppaItalia`);

      res.send(sedicesimi);
    } catch (error) {
      console.error(`Errore durante l'aggiornamento della partita (${req.path}):`, error);
      res.status(500).send(error);
    }
  },
);

module.exports = router;
