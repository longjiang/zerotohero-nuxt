importScripts('../js/inflectors/base-inflector.js')
importScripts('../vendor/korean_conjugation/html/korean/hangeul.js')
importScripts('../vendor/korean_conjugation/html/korean/conjugator.js')

// Loaded via script tag in default.vue: /static/vendor/korean_conjugation/html/korean/conjugator.js')
// Loaded via script tag in default.vue: /static/vendor/korean_conjugation/html/korean/hangeul.js')

class KoreanInflector extends BaseInflector {
  constructor() {
    super();
    axios.get("https://py.zerotohero.ca/start-open-korean-text.php"); // Call index.php to make sure the java open-korean-text process is running (Dreamhost kills it from time to time)
  }

  // Removes duplicates and sort
  uniqueByValue(array, key) {
    const seen = new Set();
    return array.filter(item => {
      const value = item[key];
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    }).sort((a, b) => a[key].length - b[key].length);
  }

  conjugate(text) {
    let forms = [];
    let infinitive = conjugator.base(text, true);
    for (let regular of conjugator.both_regular_and_irregular
      ? [false]
      : [true]) {
      conjugator.verb_type(infinitive, regular);
      for (let key in conjugator) {
        if (conjugator[key].conjugation) {
          let conjugationFunc = conjugator[key];
          forms.push({
            name: key.replace(/_/g, " "),
            form: conjugationFunc(infinitive, regular),
            regular
          });
        }
      }
    }
    return forms;
  }

  inflect(word) {
    let forms = [
      {
        table: "head",
        field: "head",
        form: word
      }
    ];
    if (word.endsWith("다")) {
      let krForms = this.conjugate(word);
      forms = forms.concat(
        krForms.map(f => {
          return {
            table: `conjugation`,
            field: f.name,
            form: f.form
          };
        })
      );
      forms = uniqueByValues(forms, ["form"]).sort(
        (a, b) => a.length - b.length
      );
    }
    return forms;
  }
}