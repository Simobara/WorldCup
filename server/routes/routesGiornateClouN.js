//COMPONENTE GIORNATA CLOU N
// ENDPOINT: http://localhost:5000/api/giornate/clou/{N}
//! IL FILE E' CORRETTO
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const schemaGiornataClouN = require("../schemas/schemaGiornateClouN");
// const dropCollections = require("../DropCollections/dropCollectionGroupColl");
const GiornataClouN = mongoose.model("GiornataClouN", schemaGiornataClouN);

router.get("/giornate/clou/:N", async (req, res) => {
  const { N } = req.params;
  try {
    console.log("routesGiornateClouN.js => Req GET ricevuta a /api/giornate/clou/:N");
    const giornateClouN = await GiornataClouN.find({ giornataClouN: true });
    console.log("Giornate clou trovate:", giornateClouN);
    res.send(giornateClouN);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/giornate/clou/:N", async (req, res) => {
  const { N } = req.params;
  try {
    console.log("routesGiornateClouN.js => Req POST ricevuta a /api/giornate/clou/:N =>", req.body.numero);
    const { numero } = req.body;
    const giornataClouSelected = await GiornataClouN.findOneAndUpdate({ numeroSelezionato: numero }, { giornataClouN: true }, { new: true, upsert: true });

    console.log("Giornata clou selected e aggiornata:", giornataClouSelected);
    // Cadono Collection non richieste nel database corrispondente
    // await dropCollections();
    console.log(`done GiornataClouN`);

    res.send(giornataClouSelected);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
