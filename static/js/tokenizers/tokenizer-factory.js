const TokenizerFactory = {
  tokenizers: {
    // Listed in the order of preference (the further down the list, the less preferred)
    ArabicTokenizer: ["ara"], // remotely tokenized and lemmatized by qalsadi
    TurkishTokenizer: ["tur"], // remotely tokenized and lemmatized by hazm
    PersianTokenizer: ["fas"], // remotely tokenized and lemmatized by zeyrek
    JapaneseTokenizer: ["jpn"], // remotely tokenized and lemmatized by MeCab
    KoreanTokenizer: ["kor"], // remotely tokenized and lemmatized by Open Korean Text
    ChineseTokenizer: ["zho"], // remotely tokenized and lemmatized by jieba
    EnglishTokenizer: ["eng"], // locally tokenized by splitting, locally lemmatized by javascript-lemmatizer
    RussianTokenizer: ["rus"], // remotely tokenized and lemmatized by pymorphy2
    SimplemmaTokenizer: ['ast', 'bul', 'cat', 'ces', 'cym', 'dan', 'deu', 'ell', 'eng', 'enm', 'est', 'fin', 'fra', 'fra', 'gla', 'gle', 'glg', 'glv', 'hbs', 'hin', 'hun', 'hye', 'ind', 'isl', 'ita', 'kat', 'lat', 'lav', 'lit', 'ltz', 'mkd', 'msa', 'nld', 'nno', 'nob', 'pol', 'por', 'por', 'ron', 'rus', 'slk', 'slv', 'sme', 'spa', 'sqi', 'swa', 'swe', 'tgl', 'tur', 'ukr'], // tokenized and lemmatized by simplemma-tokenizer.js
    LemmatizationListTokenizer: ["ast", "bul", "cat", "ces", "cym", "deu", "eng", "est", "fas", "fra", "gla", "gle", "glg", "glv", "hun", "ita", "por", "ron", "rus", "slk", "slv", "spa", "swe", "ukr"], // tokenized and lemmatized by lemmatization list
    SpacyTokenizer: [
      // "hrv", // tokenized and lemmatized by spacy // too slow
      // "jpn", // tokenized and lemmatized by spacy // too slow
      // "kor", // tokenized and lemmatized by spacy // too slow
      // "zho", // tokenized and lemmatized by spacy // too slow
    ]
  },
 
  async createTokenizer(l2, words = []) {
    // pick the right tokenizer for the language
    let languageCode = l2["iso639-3"] || l2["glottologId"];
    for (let tokenizer in this.tokenizers) {
      if (this.tokenizers[tokenizer].includes(languageCode)) {
        console.log('Initialize tokenizer: ', tokenizer);
        const tokenizerFile = `../js/tokenizers/${tokenizer.replace('Tokenizer', '').toLowerCase()}-tokenizer.js`;

        // Load the required tokenizer file using importScripts
        importScripts(tokenizerFile);

        // Initialize the tokenizer class
        const TokenizerClass = eval(tokenizer); // Access the tokenizer class from the global scope
        return await TokenizerClass.load({l2, words});
      }
    }
    importScripts('../js/tokenizers/base-tokenizer.js');
    const BaseTokenizerClass = BaseTokenizer;
    return new BaseTokenizerClass(l2, words);
  },
}