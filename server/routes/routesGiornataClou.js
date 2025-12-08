// COMPONENTE ROUTES GIORNATA
// ENDPOINT: http://localhost:5000/api/giornata/{N}
//! IL FILE E' CORRETTO

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const schemaGiornataClou = require("../schemas/schemaGiornataClou");
// const dropCollections = require("../DropCollections/dropCollectionGroupColl");

router.get("/giornata/:giornataNumber", async (req, res) => {
  const { giornataNumber } = req.params;
  try {
    const ModelGiornata = mongoose.model(`Giornata${giornataNumber}`, schemaGiornataClou, `giornata${giornataNumber}`);
    // Recupera l'ultimo documento inserito
    const giornata = await ModelGiornata.findOne().sort({ _id: -1 });

    if (giornata) {
      res.send(giornata.giornata); // Invia direttamente l'array delle partite
    } else {
      res.status(404).send({ message: "Giornata non trovata" });
    }
  } catch (error) {
    console.error(`Errore durante il recupero della giornata ${giornataNumber}:`, error);
    res.status(500).send(error);
  }
});

// Endpoint per creare o aggiornare una giornata specifica
router.post("/giornata/:giornataNumber", async (req, res) => {
  const { giornataNumber } = req.params;
  const { _id, giornata } = req.body; // Estrai _id e giornata dal corpo della richiesta

  try {
    console.log("GiornataNumber ricevuto:", giornataNumber);
    const ModelGiornata = mongoose.model(`Giornata${giornataNumber}`, schemaGiornataClou, `giornata${giornataNumber}`);

    if (!Array.isArray(giornata)) {
      return res.status(400).send({ error: "Il campo 'giornata' deve essere un array di oggetti." });
    }

    let giornataSalvata;
    if (_id) {
      // Se _id è presente, aggiorna il documento esistente
      giornataSalvata = await ModelGiornata.findByIdAndUpdate(_id, { giornata }, { new: true });
      console.log(`Aggiornamento completato per Giornata${giornataNumber} con _id ${_id}`);
    } else {
      // Se non esiste un _id, elimina eventuali documenti esistenti per quella giornata
      await ModelGiornata.deleteMany({});

      // Crea un nuovo documento
      const nuovaGiornata = new ModelGiornata({ giornata });
      giornataSalvata = await nuovaGiornata.save();
      console.log(`Salvataggio completato per Giornata${giornataNumber}`);
    }

    res.send(giornataSalvata);
  } catch (error) {
    console.error(`Errore durante l'aggiunta/aggiornamento della giornata ${giornataNumber}:`, error);
    res.status(500).send(error);
  }
});

module.exports = router;
