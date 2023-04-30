importScripts('../js/tokenizers/base-tokenizer.js')

class EnglishTokenizer extends BaseTokenizer {
  
  async loadData() {
    console.log('Loading English lemmatizer "javascript-lemmatizer"...');
    importScripts("../vendor/javascript-lemmatizer/js/lemmatizer.js");
    this.englishLemmatizer = new Lemmatizer();
  }

  async tokenize(text) {
    const tokenized = super.tokenize(text);
    return tokenized
  }
}