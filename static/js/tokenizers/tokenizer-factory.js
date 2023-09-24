const TokenizerFactory = {
  tokenizers: {
    // Listed in the order of preference (the further down the list, the less preferred)
    QalsadiTokenizer: ["ara"], // remotely tokenized and lemmatized by qalsadi
    ZeyrekTokenizer: ["tur"], // remotely tokenized and lemmatized by hazm
    HazmTokenizer: ["fas"], // remotely tokenized and lemmatized by zeyrek
    MeCabTokenizer: ["jpn"], // remotely tokenized and lemmatized by MeCab
    OpenKoreanTextTokenizer: ["kor"], // remotely tokenized and lemmatized by Open Korean Text
    JiebaTokenizer: ["zho"], // remotely tokenized and lemmatized by jieba
    JavaScriptLemmatizerTokenizer: ["eng"], // locally tokenized by splitting, locally lemmatized by javascript-lemmatizer
    Pymorphy2Tokenizer: ["rus"], // remotely tokenized and lemmatized by pymorphy2
    PyidaungsuTokenizer: ["mya"], // remotely tokenized and lemmatized by pyidaungsu
    // We remove 'cym' from SimplemmaTokenizer because it does not treat apostrophes correctly
    // We remove 'hin' from SimplemmaTokenizer because it breaks too many words
    SimplemmaTokenizer: ['ast', 'bul', 'cat', 'ces', 'dan', 'deu', 'ell', 'eng', 'enm', 'est', 'fin', 'fra', 'fra', 'gla', 'gle', 'glg', 'glv', 'hbs', 'hun', 'hye', 'ind', 'isl', 'ita', 'kat', 'lat', 'lav', 'lit', 'ltz', 'mkd', 'msa', 'nld', 'nno', 'nob', 'pol', 'por', 'por', 'ron', 'rus', 'slk', 'slv', 'sme', 'spa', 'sqi', 'swa', 'swe', 'tgl', 'tur', 'ukr'], // tokenized and lemmatized by simplemma-tokenizer.js
    LemmatizationListTokenizer: ["ast", "bul", "cat", "ces", "cym", "deu", "eng", "est", "fas", "fra", "gla", "gle", "glg", "glv", "hun", "ita", "por", "ron", "rus", "slk", "slv", "spa", "swe", "ukr"], // tokenized and lemmatized by lemmatization list
    SpacyTokenizer: [
      // "hrv", // tokenized and lemmatized by spacy // too slow
      // "jpn", // tokenized and lemmatized by spacy // too slow
      // "kor", // tokenized and lemmatized by spacy // too slow
      // "zho", // tokenized and lemmatized by spacy // too slow
    ]
  },

  getTokenizerName(languageCode) {
    for (let tokenizer in this.tokenizers) {
      if (this.tokenizers[tokenizer].includes(languageCode)) {
        return tokenizer;
      }
    }
    return 'BaseTokenizer';
  },

  async createTokenizer({l2, words = [], indexKeys = ['search']}) {
    let languageCode = l2["iso639-3"] || l2["glottologId"];
    const tokenizer = this.getTokenizerName(languageCode);
    
    // Construct the tokenizer file path and import it
    const tokenizerFile = `../js/tokenizers/${tokenizer.replace('Tokenizer', '').toLowerCase()}-tokenizer.js`;
    console.log('Initialize tokenizer: ', tokenizer);
    importScripts(tokenizerFile);

    // Initialize the tokenizer class
    const TokenizerClass = tokenizer === 'BaseTokenizer' ? BaseTokenizer : eval(tokenizer);
    return tokenizer === 'BaseTokenizer'
      ? new TokenizerClass({l2, words, indexKeys})
      : await TokenizerClass.load({l2, words, indexKeys});
  },

}