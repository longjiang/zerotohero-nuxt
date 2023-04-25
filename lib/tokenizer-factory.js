// @/lib/tokenizer-factory.js
import BaseTokenizer from "@/lib/tokenizers/base-tokenizer";
import ArabicTokenizer from "@/lib/tokenizers/arabic-tokenizer";
import TurkishTokenizer from "@/lib/tokenizers/turkish-tokenizer";
import PersianTokenizer from "@/lib/tokenizers/persian-tokenizer";
import SimpleLemmaTokenizer from "@/lib/tokenizers/simple-lemma-tokenizer";
import JapaneseTokenizer from "@/lib/tokenizers/japanese-tokenizer";
import ChineseTokenizer from "@/lib/tokenizers/chinese-tokenizer";
import KoreanTokenizer from "@/lib/tokenizers/korean-tokenizer";

export default {
  tokenizers: {
    ArabicTokenizer: ["ara"], // tokenized and lemmatized by qalsadi
    TurkishTokenizer: ["tur"], // tokenized and lemmatized by hazm
    PersianTokenizer: ["fas"], // tokenized and lemmatized by zeyrek
    JapaneseTokenizer: ["jpn"], // tokenized and lemmatized by MeCab
    KoreanTokenizer: ["kor"], // tokenized and lemmatized by Open Korean Text
    ChineseTokenizer: ["cdo", "cjy", "cnp", "cpx", "csp", "czo", "gan", "hak", "hsn", "ltc", "lzh", "mnp", "nan", "och", "wuu", "yue", "zha", "zho"], // tokenized and lemmatized by jieba
    SimpleLemmaTokenizer: ['ast', 'bul', 'cat', 'ces', 'cym', 'dan', 'deu', 'ell', 'eng', 'enm', 'est', 'fin', 'fra', 'fra', 'gla', 'gle', 'glg', 'glv', 'hbs', 'hin', 'hun', 'hye', 'ind', 'isl', 'ita', 'ita', 'kat', 'lat', 'lav', 'lit', 'ltz', 'mkd', 'msa', 'nld', 'nno', 'nob', 'pol', 'por', 'por', 'ron', 'rus', 'slk', 'slv', 'sme', 'spa', 'sqi', 'swa', 'swe', 'tgl', 'tur', 'ukr'], // tokenized and lemmatized by simple-lemma-tokenizer.js
    SpacyTokenizer: [
      // "hrv", // tokenized and lemmatized by spacy // too slow
      // "jpn", // tokenized and lemmatized by spacy // too slow
      // "kor", // tokenized and lemmatized by spacy // too slow
      // "zho", // tokenized and lemmatized by spacy // too slow
    ]
  },
  createTokenizer(l2, words = []) {
    const tokenizerMapping = {
      ArabicTokenizer,
      TurkishTokenizer,
      PersianTokenizer,
      SimpleLemmaTokenizer,
      JapaneseTokenizer,
      ChineseTokenizer,
      KoreanTokenizer,
    };
    // pick the right tokenizer for the language
    let languageCode = l2["iso639-3"] || l2["glottologId"];
    for (let tokenizer in this.tokenizers) {
      if (this.tokenizers[tokenizer].includes(languageCode)) {
        const TokenizerClass = tokenizerMapping[tokenizer];
        return new TokenizerClass(l2, words);
      }
    }
    return new BaseTokenizer(l2, words);
  },
}