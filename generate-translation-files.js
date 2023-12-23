// Usage: node generate-translation-files.js
// Description: Converts CSV files in static/translations-csv to JSON files in static/locales

const fs = require("fs");
const csv = require("csv-parser");
const mkdirp = require("mkdirp");

async function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => {
        resolve(results);
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

async function codeByIso639_3(iso639_3, langData) {
  const languageRow = langData.find((row) => row["iso639-3"] === iso639_3);

  if (languageRow && languageRow["iso639-1"] && languageRow["iso639-1"].trim() !== "") {
    return languageRow["iso639-1"].trim();
  } else if (languageRow && languageRow["iso639-3"] && languageRow["iso639-3"].trim() !== "") {
    return languageRow["iso639-3"].trim();
  } else if (languageRow && languageRow["glottologId"] && languageRow["glottologId"].trim() !== "") {
    return languageRow["glottologId"].trim();
  } else {
    return "";
  }
}

async function readAndMergeTranslations(filename, translations, langData) {
  return new Promise(async (resolve, reject) => {
    const results = [];
    fs.createReadStream(filename)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        const languagesLong = Object.keys(results[0]);
        for (const lang of languagesLong) {
          const langShort = await codeByIso639_3(lang, langData);
          if (!translations[langShort]) {
            translations[langShort] = {};
          }

          results.forEach((row) => {
            const key = row[languagesLong[0]];
            const translation = row[lang] || key;
            translations[langShort][key] = translation;
          });
        }
        resolve(translations);
      })
      .on("error", reject);
  });
}

async function startConversion() {
  const langData = await parseCSV("static/data/languages/languages.csv.txt");
  const csvFiles = [
    "static/translations-csv/translations-general.csv",
    "static/translations-csv/translations-collocations.csv",
    "static/translations-csv/translations-countries.csv",
    "static/translations-csv/translations-languages.csv",
    "static/translations-csv/translations-topics.csv",
  ];

  let translations = {};
  for (const csvFile of csvFiles) {
    translations = await readAndMergeTranslations(csvFile, translations, langData);
  }

  const outputDir = "static/locales";
  mkdirp.sync(outputDir);

  for (const [lang, transDict] of Object.entries(translations)) {
    if (!lang) {
      continue;
    }
    
    // Create an array from the object, sort it by keys, and then reconstruct the object
    const sortedTransDict = Object.entries(transDict)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});
  
    fs.writeFileSync(
      `${outputDir}/${lang}.json`,
      JSON.stringify(sortedTransDict, null, 2),
      "utf-8"
    );
  }  

  console.log("Conversion complete!");
}

startConversion();
