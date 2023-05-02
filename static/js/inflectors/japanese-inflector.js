importScripts('../vendor/jp-conjugations/jp-conjugations.js')
importScripts('../js/inflectors/base-inflector.js')

class JapaneseInflector extends BaseInflector {
  // Inflect a word and return the inflection table
  inflect(word) {
    let forms = [{
      table: 'head',
      field: 'head',
      form: word
    }];
    let jpForms = JPConjugations.conjugate(word);
    forms = forms.concat(jpForms.map(f => {
      return {
        table: 'conjugation',
        field: f.name,
        form: f.form
      };
    }));

    return forms;
  }
}
