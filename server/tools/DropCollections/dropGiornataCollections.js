require("dotenv").config({ path: "../../.env" });
const mongoose = require("mongoose");

async function dropGiornataCollections(targetDbName) {
  // Controlla se il nome del database corrente è lo stesso del database target
  if (mongoose.connection.name === targetDbName) {
    try {
      // Loop da 1 a 38 per droppare tutte le collezioni giornata1, giornata2, ..., giornata38
      for (let i = 1; i <= 38; i++) {
        const collectionName = `giornata${i}`;
        try {
          await mongoose.connection.dropCollection(collectionName);
        } catch (error) {
          if (error.code) {
            console.error(`Error dropping collection "${collectionName}" from ${targetDbName}:`, error);
          }
        }
      }
    } catch (error) {
      console.error(`Error during dropping collections in ${targetDbName}:`, error);
    }
  }
}

module.exports = dropGiornataCollections;
