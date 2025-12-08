// COMPONENTE ROUTES COPPAITA SEMIFINALI
// ENDPOINT: http://localhost:5000/api/coppaItaSemifinaleA/semifinaleA
// ENDPOINT: http://localhost:5000/api/coppaItaSemifinaleB/semifinaleB
//! IL FILE E' CORRETTO
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const dropCollections = require("../../DropCollections/dropCollectionGroupColl");
const { CoppaItaSemifinaleA, CoppaItaSemifinaleB } = require("../../schemas/schemaCoppaIta");

// Funzione per determinare quale modello utilizzare in base all'URL
const getModel = (path) => {
  if (path.includes("semifinaleA")) return CoppaItaSemifinaleA;
  if (path.includes("semifinaleB")) return CoppaItaSemifinaleB;
  return null;
};

// Endpoint per prendere i dati delle semifinali
router.get(["/coppaItaSemifinaleA/semifinaleA", "/coppaItaSemifinaleB/semifinaleB"], async (req, res) => {
  try {
    const model = getModel(req.path);
    if (!model) {
      return res.status(400).send("Modello non trovato per l'endpoint richiesto.");
    }

    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const semifinali = await model
      .find()
      .limit(limit)
      .skip((page - 1) * limit);
    console.log(`Semifinali (${req.path})`, semifinali);
    res.send(semifinali);
  } catch (error) {
    console.error(`Errore durante il recupero delle semifinali (${req.path}):`, error);
    res.status(500).send(error);
  }
});

// Endpoint per aggiornare il nome della squadra e il risultato
router.post(["/coppaItaSemifinaleA/semifinaleA", "/coppaItaSemifinaleB/semifinaleB"], async (req, res) => {
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
    const semifinali = await model.findOneAndUpdate({ _id }, { id, team1, team2, ris }, { new: true, upsert: true });

    console.log(`Partita aggiornata o creata (${req.path}):`, semifinali);

    // Cadono Collection non richieste nel database corrispondente
    // await dropCollections();
    console.log(`dropCollections CoppaItalia`);

    res.send(semifinali);
  } catch (error) {
    console.error(`Errore durante l'aggiornamento della partita (${req.path}):`, error);
    res.status(500).send(error);
  }
});

module.exports = router;
