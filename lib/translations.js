import translationsGeneral from './translations-general.csv';
import translationsCollocations from './translations-collocations.csv';
import translationsCountries from './translations-countries.csv';
import translationsLanguages from './translations-languages.csv';
import translationsTopics from './translations-topics.csv';
import Papa from 'papaparse'

let translations = {}
for (let csv of [translationsGeneral, translationsCollocations, translationsCountries, translationsLanguages, translationsTopics]) {
  let csvParsed = Papa.parse(csv, {
    header: true,
  });
  // Extract the language codes from headers
  let langs = csvParsed.meta.fields
  for (let row of csvParsed.data) {
    for (let lang of langs) {
      // Use the English string as the translation key
      let key = row.eng
      // Initialize the translations for the language if there is none
      translations[lang] = translations[lang] || {}
      // Add the translated string, or use the English string as a default
      translations[lang][key] = row[lang] || row.eng
    }
  }
}
export default translations