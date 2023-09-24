importScripts('../js/tokenizers/base-tokenizer.js')

class JavaScriptLemmatizerTokenizer extends BaseTokenizer {
  
  async loadData() {
    console.log('Loading English lemmatizer "javascript-lemmatizer"...');
    importScripts("../vendor/javascript-lemmatizer/js/lemmatizer.js");
    this.englishLemmatizer = new Lemmatizer();
  }

  async tokenize(text) {
    const tokenized = await super.tokenize(text);
    tokenized.forEach(token => {
      const text = token.text
      if (text) {
        let lemmas = this.englishLemmatizer.lemmas(text);
        lemmas = lemmas.map(lemma => {
          return {
            lemma: lemma[0],
            pos: lemma[1]
          }
        })
        token.lemmas = lemmas
      }
    })
    return tokenized
  }
}