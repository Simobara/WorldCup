//api/giornate.js: Contiene la logica per connettersi a MongoDB e recuperare i dati.

import { MongoClient } from "mongodb"; 

const uri = process.env.MONGODB_URI; //prende uri
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true }); //tramite uri crea il new MongoClient nuova istanza

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      await client.connect(); //connssione al client
      const database = client.db(process.env.DB_NAME); //imposta il database
      const collection = database.collection("giornate"); //Ottiene il riferimento alla collezione giornate all'interno del database.
      const giornate = await collection.find({}).toArray(); //Esegue una query per trovare tutti i documenti nella collezione giornate e li converte in un array.
      res.status(200).json(giornate);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch data" });
    } finally {
      await client.close();
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
