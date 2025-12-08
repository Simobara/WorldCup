require("dotenv").config({ path: "../../.env" });
const dropCollectionsIfNeeded = require("./dropCollections");
const dropGiornataCollections = require("./dropGiornataCollections");

async function dropCollections() {
  try {
    // dropCollectionsIfNeeded "giornataClouN" from DB_NAME_COPPA_ITA
    await dropCollectionsIfNeeded("giornataClouN", process.env.DB_NAME_COPPA_ITA);

    await dropCollectionsIfNeeded("CoppaIta6Finale", process.env.DB_NAME_SERIE_A);

    await dropCollectionsIfNeeded("CoppaIta5SemifA", process.env.DB_NAME_SERIE_A);
    await dropCollectionsIfNeeded("CoppaIta5SemifB", process.env.DB_NAME_SERIE_A);

    await dropCollectionsIfNeeded("CoppaIta4QuartiA1", process.env.DB_NAME_SERIE_A);
    await dropCollectionsIfNeeded("CoppaIta4QuartiA2", process.env.DB_NAME_SERIE_A);
    await dropCollectionsIfNeeded("CoppaIta4QuartiB1", process.env.DB_NAME_SERIE_A);
    await dropCollectionsIfNeeded("CoppaIta4QuartiB2", process.env.DB_NAME_SERIE_A);

    await dropCollectionsIfNeeded("CoppaIta3OttaviA1", process.env.DB_NAME_SERIE_A);
    await dropCollectionsIfNeeded("CoppaIta3OttaviA2", process.env.DB_NAME_SERIE_A);
    await dropCollectionsIfNeeded("CoppaIta3OttaviA3", process.env.DB_NAME_SERIE_A);
    await dropCollectionsIfNeeded("CoppaIta3OttaviA4", process.env.DB_NAME_SERIE_A);
    await dropCollectionsIfNeeded("CoppaIta3OttaviB1", process.env.DB_NAME_SERIE_A);
    await dropCollectionsIfNeeded("CoppaIta3OttaviB2", process.env.DB_NAME_SERIE_A);
    await dropCollectionsIfNeeded("CoppaIta3OttaviB3", process.env.DB_NAME_SERIE_A);
    await dropCollectionsIfNeeded("CoppaIta3OttaviB4", process.env.DB_NAME_SERIE_A);

    await dropCollectionsIfNeeded("CoppaIta2SedicesimiA1", process.env.DB_NAME_SERIE_A);
    await dropCollectionsIfNeeded("CoppaIta2SedicesimiA2", process.env.DB_NAME_SERIE_A);
    await dropCollectionsIfNeeded("CoppaIta2SedicesimiA3", process.env.DB_NAME_SERIE_A);
    await dropCollectionsIfNeeded("CoppaIta2SedicesimiA4", process.env.DB_NAME_SERIE_A);
    await dropCollectionsIfNeeded("CoppaIta2SedicesimiB1", process.env.DB_NAME_SERIE_A);
    await dropCollectionsIfNeeded("CoppaIta2SedicesimiB2", process.env.DB_NAME_SERIE_A);
    await dropCollectionsIfNeeded("CoppaIta2SedicesimiB3", process.env.DB_NAME_SERIE_A);
    await dropCollectionsIfNeeded("CoppaIta2SedicesimiB4", process.env.DB_NAME_SERIE_A);

    await dropCollectionsIfNeeded("CoppaIta1TrentaduesimiA1", process.env.DB_NAME_SERIE_A);
    await dropCollectionsIfNeeded("CoppaIta1TrentaduesimiA2", process.env.DB_NAME_SERIE_A);
    await dropCollectionsIfNeeded("CoppaIta1TrentaduesimiA3", process.env.DB_NAME_SERIE_A);
    await dropCollectionsIfNeeded("CoppaIta1TrentaduesimiA4", process.env.DB_NAME_SERIE_A);
    await dropCollectionsIfNeeded("CoppaIta1TrentaduesimiA5", process.env.DB_NAME_SERIE_A);
    await dropCollectionsIfNeeded("CoppaIta1TrentaduesimiA6", process.env.DB_NAME_SERIE_A);
    await dropCollectionsIfNeeded("CoppaIta1TrentaduesimiA7", process.env.DB_NAME_SERIE_A);
    await dropCollectionsIfNeeded("CoppaIta1TrentaduesimiA8", process.env.DB_NAME_SERIE_A);
    await dropCollectionsIfNeeded("CoppaIta1TrentaduesimiB1", process.env.DB_NAME_SERIE_A);
    await dropCollectionsIfNeeded("CoppaIta1TrentaduesimiB2", process.env.DB_NAME_SERIE_A);
    await dropCollectionsIfNeeded("CoppaIta1TrentaduesimiB3", process.env.DB_NAME_SERIE_A);
    await dropCollectionsIfNeeded("CoppaIta1TrentaduesimiB4", process.env.DB_NAME_SERIE_A);
    await dropCollectionsIfNeeded("CoppaIta1TrentaduesimiB5", process.env.DB_NAME_SERIE_A);
    await dropCollectionsIfNeeded("CoppaIta1TrentaduesimiB6", process.env.DB_NAME_SERIE_A);
    await dropCollectionsIfNeeded("CoppaIta1TrentaduesimiB7", process.env.DB_NAME_SERIE_A);
    await dropCollectionsIfNeeded("CoppaIta1TrentaduesimiB8", process.env.DB_NAME_SERIE_A);
    // dropCollectionsIfNeeded "giornata" from DB_NAME_COPPA_ITA
    await dropGiornataCollections(process.env.DB_NAME_COPPA_ITA);
  } catch (error) {
    console.error("Error dropping collections:", error);
  }
}

module.exports = dropCollections;
