import csv from 'raw-loader!./translations.csv';
import Papa from 'papaparse'

let translations = {}
let csvParsed = Papa.parse(csv, {
  header: true,
});
let langs = csvParsed.meta.fields
for (let row of csvParsed.data) {
  for (let lang of langs) {
    let key = row.eng
    translations[lang] = translations[lang] || {}
    translations[lang][key] = row[lang] || row.eng
  }
}
export default translations