// COMPONENTE ROUTES COPPAITA QUARTI
// ENDPOINT: http://localhost:5000/api/coppaItaQuartiA1/quartiA1
// ENDPOINT: http://localhost:5000/api/coppaItaQuartiA2/quartiA2
// ENDPOINT: http://localhost:5000/api/coppaItaQuartiB1/quartiB1
// ENDPOINT: http://localhost:5000/api/coppaItaQuartiB2/quartiB2
//! IL FILE E' CORRETTO

const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const dropCollections = require("../../DropCollections/dropCollectionGroupColl");
const { CoppaItaQuartiA1, CoppaItaQuartiA2, CoppaItaQuartiB1, CoppaItaQuartiB2 } = require("../../schemas/schemaCoppaIta");

// Funzione per determinare quale modello utilizzare in base all'URL
const getModel = (path) => {
  if (path.includes("quartiA1")) return CoppaItaQuartiA1;
  if (path.includes("quartiA2")) return CoppaItaQuartiA2;
  if (path.includes("quartiB1")) return CoppaItaQuartiB1;
  if (path.includes("quartiB2")) return CoppaItaQuartiB2;
  return null;
};

// Endpoint per prendere i dati dei quarti
router.get(["/coppaItaQuartiA1/quartiA1", "/coppaItaQuartiA2/quartiA2", "/coppaItaQuartiB1/quartiB1", "/coppaItaQuartiB2/quartiB2"], async (req, res) => {
  try {
    const model = getModel(req.path);
    if (!model) {
      return res.status(400).send("Modello non trovato per l'endpoint richiesto.");
    }

    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const quarti = await model
      .find()
      .limit(limit)
      .skip((page - 1) * limit);
    console.log(`Quarti (${req.path})`, quarti);
    res.send(quarti);
  } catch (error) {
    console.error(`Errore durante il recupero dei quarti (${req.path}):`, error);
    res.status(500).send(error);
  }
});

// Endpoint per aggiornare il nome della squadra e il risultato
router.post(["/coppaItaQuartiA1/quartiA1", "/coppaItaQuartiA2/quartiA2", "/coppaItaQuartiB1/quartiB1", "/coppaItaQuartiB2/quartiB2"], async (req, res) => {
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
    const quarti = await model.findOneAndUpdate({ _id }, { id, team1, team2, ris }, { new: true, upsert: true });

    console.log(`Partita aggiornata o creata (${req.path}):`, quarti);

    // Cadono Collection non richieste nel database corrispondente
    // await dropCollections();
    console.log(`dropCollections CoppaItalia`);

    res.send(quarti);
  } catch (error) {
    console.error(`Errore durante l'aggiornamento della partita (${req.path}):`, error);
    res.status(500).send(error);
  }
});

module.exports = router;
