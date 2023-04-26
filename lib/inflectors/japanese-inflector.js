// @/lib/inflectors/japanese-inflector.js
import jpConjugation from 'jp-conjugation';

import BaseInflector from './base-inflector';

class JapaneseInflector extends BaseInflector {
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

export default JapaneseInflector;
