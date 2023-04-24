// @/lib/tokenizer-factory.js
import BaseTokenizer from "@/lib/tokenizers/base-tokenizer";
import ArabicTokenizer from "@/lib/tokenizers/arabic-tokenizer";
import TurkishTokenizer from "@/lib/tokenizers/turkish-tokenizer";
import PersianTokenizer from "@/lib/tokenizers/persian-tokenizer";
import SimpleLemmaTokenizer from "@/lib/tokenizers/simple-lemma-tokenizer";

export default {
  tokenizers: {
    ArabicTokenizer: ["ara"], // tokenized and lemmatized by qalsadi
    TurkishTokenizer: ["tur"], // tokenized and lemmatized by hazm
    PersianTokenizer: ["fas"], // tokenized and lemmatized by zeyrek
    SimpleLemmaTokenizer: ['ast', 'bul', 'cat', 'ces', 'cym', 'dan', 'deu', 'ell', 'eng', 'enm', 'est', 'fin', 'fra', 'fra', 'gla', 'gle', 'glg', 'glv', 'hbs', 'hin', 'hun', 'hye', 'ind', 'isl', 'ita', 'ita', 'kat', 'lat', 'lav', 'lit', 'ltz', 'mkd', 'msa', 'nld', 'nno', 'nob', 'pol', 'por', 'por', 'ron', 'rus', 'slk', 'slv', 'sme', 'spa', 'sqi', 'swa', 'swe', 'tgl', 'tur', 'ukr'], // tokenized and lemmatized by simple-lemma-tokenizer.js
    SpacyTokenizer: [
      // "hrv", // tokenized and lemmatized by spacy // too slow
      // "jpn", // tokenized and lemmatized by spacy // too slow
      // "kor", // tokenized and lemmatized by spacy // too slow
      // "zho", // tokenized and lemmatized by spacy // too slow
    ]
  },
  createTokenizer(l1, l2) {
    console.log('💿 Creating tokenizer', {l1, l2})
    // pick the right tokenizer for the language
    for (let tokenizer in this.tokenizers) {
      if (this.tokenizers[tokenizer].includes(l2['iso639-3'] || l2['glottologId'])) {
        switch (tokenizer) {
          case 'ArabicTokenizer':
            return new ArabicTokenizer(l1, l2);
          case 'TurkishTokenizer':
            return new TurkishTokenizer(l1, l2);
          case 'PersianTokenizer':
            return new PersianTokenizer(l1, l2);
          case 'SimpleLemmaTokenizer':
            return new SimpleLemmaTokenizer(l1, l2);
          // Add more cases here for other tokenizers
          default:
            return new BaseTokenizer(l1, l2);
        }
      }
    }
    return new BaseTokenizer(l1, l2);
  },
}