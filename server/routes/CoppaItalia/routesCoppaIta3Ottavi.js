// COMPONENTE ROUTES COPPAITA OTTAVI
// ENDPOINT: http://localhost:5000/api/coppaItaOttaviA1/ottaviA1
// ENDPOINT: http://localhost:5000/api/coppaItaOttaviA2/ottaviA2
// ENDPOINT: http://localhost:5000/api/coppaItaOttaviA3/ottaviA3
// ENDPOINT: http://localhost:5000/api/coppaItaOttaviA4/ottaviA4
// ENDPOINT: http://localhost:5000/api/coppaItaOttaviB1/ottaviB1
// ENDPOINT: http://localhost:5000/api/coppaItaOttaviB2/ottaviB2
// ENDPOINT: http://localhost:5000/api/coppaItaOttaviB3/ottaviB3
// ENDPOINT: http://localhost:5000/api/coppaItaOttaviB4/ottaviB4
//! IL FILE E' CORRETTO

const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const dropCollections = require("../../DropCollections/dropCollectionGroupColl");
const {
  CoppaItaOttaviA1,
  CoppaItaOttaviA2,
  CoppaItaOttaviA3,
  CoppaItaOttaviA4,
  CoppaItaOttaviB1,
  CoppaItaOttaviB2,
  CoppaItaOttaviB3,
  CoppaItaOttaviB4,
} = require("../../schemas/schemaCoppaIta");

// Funzione per determinare quale modello utilizzare in base all'URL
const getModel = (path) => {
  if (path.includes("ottaviA1")) return CoppaItaOttaviA1;
  if (path.includes("ottaviA2")) return CoppaItaOttaviA2;
  if (path.includes("ottaviA3")) return CoppaItaOttaviA3;
  if (path.includes("ottaviA4")) return CoppaItaOttaviA4;
  if (path.includes("ottaviB1")) return CoppaItaOttaviB1;
  if (path.includes("ottaviB2")) return CoppaItaOttaviB2;
  if (path.includes("ottaviB3")) return CoppaItaOttaviB3;
  if (path.includes("ottaviB4")) return CoppaItaOttaviB4;
  return null;
};

// Endpoint per prendere i dati degli ottavi
router.get(
  [
    "/coppaItaOttaviA1/ottaviA1",
    "/coppaItaOttaviA2/ottaviA2",
    "/coppaItaOttaviA3/ottaviA3",
    "/coppaItaOttaviA4/ottaviA4",
    "/coppaItaOttaviB1/ottaviB1",
    "/coppaItaOttaviB2/ottaviB2",
    "/coppaItaOttaviB3/ottaviB3",
    "/coppaItaOttaviB4/ottaviB4",
  ],
  async (req, res) => {
    try {
      const model = getModel(req.path);
      if (!model) {
        return res.status(400).send("Modello non trovato per l'endpoint richiesto.");
      }

      const limit = parseInt(req.query.limit) || 10;
      const page = parseInt(req.query.page) || 1;
      const ottavi = await model
        .find()
        .limit(limit)
        .skip((page - 1) * limit);
      console.log(`Ottavi (${req.path})`, ottavi);
      res.send(ottavi);
    } catch (error) {
      console.error(`Errore durante il recupero degli ottavi (${req.path}):`, error);
      res.status(500).send(error);
    }
  },
);

// Endpoint per aggiornare il nome della squadra e il risultato
router.post(
  [
    "/coppaItaOttaviA1/ottaviA1",
    "/coppaItaOttaviA2/ottaviA2",
    "/coppaItaOttaviA3/ottaviA3",
    "/coppaItaOttaviA4/ottaviA4",
    "/coppaItaOttaviB1/ottaviB1",
    "/coppaItaOttaviB2/ottaviB2",
    "/coppaItaOttaviB3/ottaviB3",
    "/coppaItaOttaviB4/ottaviB4",
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
      const ottavi = await model.findOneAndUpdate({ _id }, { id, team1, team2, ris }, { new: true, upsert: true });

      console.log(`Partita aggiornata o creata (${req.path}):`, ottavi);

      // Cadono Collection non richieste nel database corrispondente
      // await dropCollections();
      console.log(`dropCollections CoppaItalia`);

      res.send(ottavi);
    } catch (error) {
      console.error(`Errore durante l'aggiornamento della partita (${req.path}):`, error);
      res.status(500).send(error);
    }
  },
);

module.exports = router;
