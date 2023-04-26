import BaseInflector from './base-inflector';
import { uniqueByValue } from '@/lib/utils';

// Loaded via script tag in default.vue: /static/vendor/korean_conjugation/html/korean/conjugator.js')
// Loaded via script tag in default.vue: /static/vendor/korean_conjugation/html/korean/hangeul.js')

class KoreanInflector extends BaseInflector {
  // Helper function to remove duplicates and sort
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
    let infinitive = window.conjugator.base(text, true);
    for (let regular of window.conjugator.both_regular_and_irregular
      ? [false]
      : [true]) {
      window.conjugator.verb_type(infinitive, regular);
      for (let key in window.conjugator) {
        if (window.conjugator[key].conjugation) {
          let conjugationFunc = window.conjugator[key];
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
      forms = uniqueByValue(forms, "form").sort(
        (a, b) => a.length - b.length
      );
    }
    return forms;
  }
}


export default KoreanInflector;