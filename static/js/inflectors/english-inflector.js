importScripts("../vendor/compromise@14.8.2/compromise.js");
importScripts("../js/inflectors/base-inflector.js");

class EnglishInflector extends BaseInflector {
  constructor() {
    super();
    this.lefffData = {};
  }

  // Inflect a word and return the inflection table
  inflect(lemma) {
    let forms = [
      {
        table: "head",
        field: "head",
        form: lemma,
      },
    ];
    const doc = nlp(lemma);
    const verbs = doc.verbs()
    const verbInflections = verbs.conjugate()

    const moreForms = verbInflections.flatMap((tenseObj) =>
      Object.entries(tenseObj).map(([field, form]) => ({
        table: "conjugation",
        field: field,
        form: form,
      }))
    );
    forms = [...forms, ...moreForms]
    return forms;
  }
}
