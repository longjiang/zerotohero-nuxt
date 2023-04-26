// Import the jp-conjugation module
const jpConjugation = require('jp-conjugation');

class JapaneseInflector {
  // Inflect a word and return the inflection table
  inflect(word) {
    let forms = [{
      table: 'head',
      field: 'head',
      form: word
    }];
    console.log('🕹️', word);
    let jpForms = jpConjugation.conjugate(word);
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

module.exports = JapaneseInflector;
