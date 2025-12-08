// COMPONENTE ROUTES COPPAITA 6FINALE
// ENDPOINT: http://localhost:5000/api/coppaItaFinale/finale
//! IL FILE E' CORRETTO
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const dropCollections = require("../../DropCollections/dropCollectionGroupColl");
const { CoppaItaFinale } = require("../../schemas/schemaCoppaIta");

// Endpoint per prendere il nome della squadra
router.get("/coppaItaFinale/finale", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const finale = await CoppaItaFinale.find()
      .limit(limit)
      .skip((page - 1) * limit);
    console.log("Finale ", finale);
    res.send(finale);
  } catch (error) {
    console.error("Errore durante il recupero della finale:", error);
    res.status(500).send(error);
  }
});

// Endpoint per aggiornare il nome della squadra e il risultato
router.post("/coppaItaFinale/finale", async (req, res) => {
  try {
    let { _id, id, team1, team2, ris, pos } = req.body;

    // Se _id non è definito o è null, creiamo un nuovo ObjectId
    if (!_id) {
      _id = new mongoose.Types.ObjectId();
    }

    // Assicuriamoci che l'id sia un numero intero
    if (!id || typeof id !== "number") {
      return res.status(400).send({ error: "Invalid id" });
    }

    // Trova il record per ID e aggiorna i campi necessari
    const finale = await CoppaItaFinale.findOneAndUpdate({ _id }, { id, team1, team2, ris, pos }, { new: true, upsert: true });

    console.log("Partita aggiornata o creata:", finale);
    // Cadono Collection non richieste nel database corrispondente
    // await dropCollections();
    console.log(`dropCollections CoppaItalia`);
    res.send(finale);
  } catch (error) {
    console.error("Errore durante l'aggiornamento della partita:", error);
    res.status(500).send(error);
  }
});

module.exports = router;
