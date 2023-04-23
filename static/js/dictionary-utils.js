// dictionary-utils.js

const DictionaryUtils = {
  // https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
  stripAccents(str) {
    str = str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Accents
      .replace(/[\u0600-\u0620\u064b-\u0655]/g, "") // Arabic diacritics
      .replace(/[\u0559-\u055F]/g, ""); // Armenian diacritics
    if (["he", "hbo", "iw"].includes(this.l2)) {
      str = this.stripHebrewVowels(str);
    }
    return str;
  }
}