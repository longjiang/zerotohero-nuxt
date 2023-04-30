importScripts("../js/tokenizers/base-tokenizer.js");

class LemmatizationListTokenizer extends BaseTokenizer {
  constructor({ l2, words = [] }) {
    super({ l2, words });
    this.lemmatizationTable = {};
    this.lemmatizationTableLangs = [
      "ast",
      "bul",
      "cat",
      "ces",
      "cym",
      "deu",
      "eng",
      "est",
      "fas",
      "fra",
      "gla",
      "gle",
      "glg",
      "glv",
      "hun",
      "ita",
      "por",
      "ron",
      "rus",
      "slk",
      "slv",
      "spa",
      "swe",
      "ukr",
    ]; // Languages that can be lemmatized by https://github.com/michmech/lemmatization-lists
  }

  async loadData() {
    const langCode = this.l2["iso639-1"];
    let res = await axios.get(
      `${SERVER}data/lemmatization-lists/lemmatization-${langCode}.txt`
    );
    if (res && res.data) {
      let parsed = Papa.parse(res.data, { header: false });
      let table = {};
      for (let row of parsed.data) {
        let lemma = row[0];
        let surface = row[1];
        if (surface && lemma) {
          if (!table[surface]) table[surface] = [];
          table[surface].push(lemma);
        }
      }
      this.lemmatizationTable = table;
    }
  }

  async tokenize(text) {
    const tokenized = await super.tokenize(text);
    tokenized.forEach((token) => {
      const text = token.text;
      if (text) {
        let lemmas = this.getLemmas(text);
        lemmas = lemmas.map((lemma) => {
          return {
            lemma,
          };
        });
        token.lemmas = lemmas;
      }
    });
    return tokenized;
  }

  /**
   * Lemmatizes some languages (languages in this.lemmatizationTableLangs)
   */
  getLemmas(text) {
    let lemmas = [];
    if (this.lemmatizationTableLangs.includes(this.l2["iso639-3"]))
      lemmas = this.lemmatizationTable[text] || [];
    return lemmas;
  }
}
