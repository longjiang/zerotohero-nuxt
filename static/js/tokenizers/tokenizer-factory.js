const TokenizerFactory = {
  tokenizers: {
    // Listed in the order of preference (the further down the list, the less preferred)
    QalsadiTokenizer: ["ara"], // remotely tokenized and lemmatized by qalsadi
    ZeyrekTokenizer: ["tur"], // remotely tokenized and lemmatized by hazm
    HazmTokenizer: ["fas"], // remotely tokenized and lemmatized by zeyrek
    MeCabTokenizer: ["jpn"], // remotely tokenized and lemmatized by MeCab
    OpenKoreanTextTokenizer: ["kor"], // remotely tokenized and lemmatized by Open Korean Text
    JiebaTokenizer: ["zho"], // remotely tokenized and lemmatized by jieba
    // JavaScriptLemmatizerTokenizer: ["eng"], // locally tokenized by splitting, locally lemmatized by javascript-lemmatizer
    Pymorphy2Tokenizer: ["rus"], // remotely tokenized and lemmatized by pymorphy2
    PyidaungsuTokenizer: ["mya"], // remotely tokenized and lemmatized by pyidaungsu
    // spaCy lemmatizer is generally very slow on the server and can lead to unrendered text. We avoid it if we can use SimplemmaTokenizer instead.
    SpacyTokenizer: [
      // 'cat',
      // 'dan',
      // 'deu',
      // 'ell',
      // 'eng',
      // 'spa',
      // 'fin',
      // 'fra',
      // 'hrv',
      // 'ita',
      // 'lit',
      // 'mkd',
      // 'nor',
      // 'nob',
      // 'nld',
      // 'pol',
      // 'por',
      // 'ron',
      // 'rus',
      // 'swe',
      // 'ukr',
      // 'jpn',
      // 'kor',
      // 'zho'
    ],
    // We remove 'cym' from SimplemmaTokenizer because it does not treat apostrophes correctly
    // We remove 'hin' from SimplemmaTokenizer because it breaks too many words
    // We remove 'fra' from SimplemmaTokenizer because it's not getting lemmas for verbs
    SimplemmaTokenizer: ['ast', 'bul', 'cat', 'ces', 'dan', 'deu', 'ell', 'eng', 'enm', 'est', 'fin', 'gla', 'gle', 'glg', 'glv', 'hbs', 'hun', 'hye', 'ind', 'isl', 'ita', 'kat', 'lat', 'lav', 'lit', 'ltz', 'mkd', 'msa', 'nld', 'nno', 'nor', 'nob', 'pol', 'por', 'por', 'ron', 'rus', 'slk', 'slv', 'sme', 'spa', 'sqi', 'swa', 'swe', 'tgl', 'tur', 'ukr'],
    LemmatizationListTokenizer: ["ast", "bul", "cat", "ces", "cym", "deu", "eng", "est", "fas", "fra", "gla", "gle", "glg", "glv", "hun", "ita", "por", "ron", "rus", "slk", "slv", "spa", "swe", "ukr"], // tokenized and lemmatized by lemmatization list

  },

  getTokenizerName(languageCode) {
    for (let tokenizer in this.tokenizers) {
      if (this.tokenizers[tokenizer].includes(languageCode)) {
        return tokenizer;
      }
    }
    return 'BaseTokenizer';
  },

  getTokenizationType(l2) {
    let tokenizationType = "integral"; // default
    if (l2.continua || ["vi"].includes(l2.code)) {
      tokenizationType = "continua";
    } else if (
      (l2.scripts && l2.scripts[0] && l2.scripts[0].script === "Arab") ||
      ["hu", "et"].includes(l2.code)
    ) {
      tokenizationType = "integral";
    } else if (["de", "gsw", "no", "hy"].includes(l2.code)) {
      tokenizationType = "integral"; // Used to be 'agglutenative', but we treat them as integral for now
    } else if (l2.agglutinative && l2.wiktionary && l2.wiktionary > 2000) {
      tokenizationType = "integral"; // Used to be 'agglutenative', but we treat them as integral for now
    }
    return tokenizationType;
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
    const tokenizationType = this.getTokenizationType(l2);
    return tokenizer === 'BaseTokenizer'
      ? new TokenizerClass({l2, words, indexKeys, tokenizationType})
      : await TokenizerClass.load({l2, words, indexKeys, tokenizationType});
  },

}