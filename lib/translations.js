import csv from 'raw-loader!./translations.csv';
import Papa from 'papaparse'

let translations = {}

let csvParsed = Papa.parse(csv, {
  header: true,
});
for (let row of csvParsed.data) {
  for (let lang in row) {
    let key = row.eng
    translations[lang] = translations[lang] || {}
    translations[lang][key] = row[lang]
  }
}
console.log(translations)
export default translations