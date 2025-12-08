require("dotenv").config({ path: "../../.env" });
const mongoose = require("mongoose");

async function dropCollectionIfNeeded(collectionName, targetDbName) {
  if (mongoose.connection.name === targetDbName) {
    try {
      await mongoose.connection.dropCollection(collectionName);
    } catch (error) {
      console.error(`Error dropping collection "${collectionName}" from ${targetDbName}:`, error);
    }
  }
}

module.exports = dropCollectionIfNeeded;
