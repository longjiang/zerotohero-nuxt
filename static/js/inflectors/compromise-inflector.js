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

  // Inflect a word and return the inflection table
  inflect(lemma) {
    let forms = [
      {
        table: "head",
        field: "head",
        form: lemma,
      },
    ];
    const doc = this.nlp(lemma);
    const verbs = doc.verbs();
    const verbInflections = verbs.conjugate();

    let moreForms = [];

    if (verbInflections?.length > 0) {
      if (this.l2["iso639-3"] === "eng") {
        moreForms = verbInflections.flatMap((tenseObj) =>
          Object.entries(tenseObj).map(([field, form]) => ({
            table: "conjugation",
            field: field,
            form: form,
          }))
        );
      }
      if (this.l2["iso639-3"] === "deu") {
        moreForms = Object.entries(verbInflections[0]).flatMap(
          ([key, value]) => {
            if (typeof value === "string") {
              return { table: key, field: key, form: value };
            } else {
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
    forms = [...forms, ...moreForms];
    return forms;
  }
}
