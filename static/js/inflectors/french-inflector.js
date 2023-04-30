importScripts("../vendor/french-verbs/french-verbs-browserified.js");
importScripts("../js/inflectors/base-inflector.js");

class FrenchInflector extends BaseInflector {
  constructor() {
    super();
    this.lefffData = {};
  }

  async loadData() {
    try {
      let res = await axios.get(
        `${SERVER}data/french-verbs-lefff/conjugations.json.txt`
      );
      if (res && res.data) {
        this.lefffData = res.data;
      }
    } catch (err) {
      console.error("Error loading conjugations data:", err);
    }
  }

  // Inflect a word and return the inflection table
  inflect(lemma) {
    let fields = {
      0: "je",
      1: "tu",
      2: "il/elle",
      3: "nous",
      4: "vous",
      5: "ils",
    };
    let tables = {
      P: "présent",
      S: "subjonctif",
      Y: "Y",
      I: "imparfait",
      G: "gérondif",
      K: "participe passé",
      J: "passé simple",
      T: "subjonctif imparfait",
      F: "futur",
      C: "conditionnel présent",
    };
    const forms = [
      {
        table: "head",
        field: "head",
        form: lemma,
      },
    ];
    let conjugations = this.lefffData[lemma]
    if (conjugations) {
      Object.entries(conjugations).forEach(([key, conj]) => {
        const filteredConj = conj.filter((formStr) => formStr !== "NA");

        const mappedConj = filteredConj.map((formStr, index) => ({
          table: tables[key] || key,
          field: fields[index] || index,
          form: formStr,
        }));

        forms.push(...mappedConj);
      });
    }
    return forms;
  }
}
