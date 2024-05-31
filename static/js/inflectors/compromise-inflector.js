importScripts("../js/inflectors/base-inflector.js");

class CompromiseInflector extends BaseInflector {
  async loadData() {
    switch (this.l2["iso639-3"]) {
      case "eng":
        importScripts("../vendor/compromise@14.8.2/compromise.js");
        this.nlp = nlp;
        break;
      case "fra":
        importScripts("../vendor/fr-compromise@b24c7ba/fr-compromise.min.js");
        this.nlp = frCompromise;
        break;
      case "ita":
        importScripts("../vendor/it-compromise@38f40d4/it-compromise.min.js");
        this.nlp = itCompromise;
        break;
      case "spa":
        importScripts("../vendor/es-compromise@2018e73/es-compromise.min.js");
        this.nlp = esCompromise;
        break;
      case "deu":
        importScripts("../vendor/de-compromise@5a2275a/de-compromise.min.js");
        this.nlp = deCompromise;
        break;
    }
  }

  /**
   * Inflect a word and return the inflection table.
   * @param {string} lemma - The word to inflect.
   * @returns {Array} An array of objects, each representing an inflected form of the word.
   * For example, for the German verb "laufen" (run), the array would be:
   *  [
   *    { table: "head", field: "head", form: "laufen" },
   *    { table: "indicative", field: "first person singular present", form: "laufe" },
   *    { table: "indicative", field: "second person singular present", form: "läufst" },
   *    { table: "indicative", field: "third person singular present", form: "läuft" },
   *    { table: "subjunctive", field: "first person singular present", form: "liefe" },
   *    // ... other inflected forms ...
   *  ]
   */
  inflect(lemma) {
    // Initialize the forms array with the lemma itself
    let forms = [
      {
        table: "head",
        field: "head",
        form: lemma,
      },
    ];

    // Create a document from the lemma
    const doc = this.nlp(lemma);

    // Get the verbs from the document
    const verbs = doc.verbs();

    // Get the verb inflections
    const verbInflections = verbs.conjugate();

    let moreForms = [];

    // If there are verb inflections
    if (verbInflections?.length > 0) {
      // If the language is English
      if (this.l2["iso639-3"] === "eng") {
        // Map each tense object to an array of form objects
        moreForms = verbInflections.flatMap((tenseObj) =>
          Object.entries(tenseObj).map(([field, form]) => ({
            table: "conjugation",
            field: field,
            form: form,
          }))
        );
      }
      // If the language is German
      if (this.l2["iso639-3"] === "deu") {
        // Map each verb inflection to a form object
        moreForms = Object.entries(verbInflections[0]).flatMap(
          ([key, value]) => {
            if (typeof value === "string") {
              return { table: key, field: key, form: value };
            } else {
              // If the value is an object, map each entry to a form object
              return Object.entries(value).map(([field, form]) => ({
                table: key,
                field: field,
                form: form,
              }));
            }
          }
        );
      }
    }

    // Combine the original forms with the additional forms
    forms = [...forms, ...moreForms];

    // Return the forms
    return forms;
  }
}
