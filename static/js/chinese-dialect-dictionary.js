importScripts('../js/base-dictionary.js')
importScripts("../vendor/pinyinify/pinyinify.js");
class ChineseDialectDictionary extends BaseDictionary {
  
  constructor({ l1 = undefined, l2 = undefined } = {}) {
    super({l1, l2});
    this.indexKeys = ['traditional', 'simplified'];
    this.traditionalIndex = {};
    this.simplifiedIndex = {};
    this.files = {
      yue: 'cc-canto/cccanto-webdist.csv.txt',
      hak: 'dict-hakka/dict-hakka.csv.txt',
      nan: 'dict-twblg/dict-twblg.csv.txt',
    };
    this.version = '1.1.3';
  }

  async loadData() {
    const l1Code = this.l1['iso639-3']
    const l2Code = this.l2['iso639-3']
    const file = this.dictionaryFile({ l1Code, l2Code })
    let words = await this.loadAndNormalizeDictionaryData({name: `dialect-dict-${l1Code}-${l2Code}`, file})
    this.words = words
  }

  // Normalizes the input 'row' object and modifies it in place.
  normalizeWord(row) {
    let definitions = row.english ? row.english.split('/').map(d => d.trim()) : row.definitions ? row.definitions.split('|').map(d => d.trim()) : [];

    row.id = "d" + hash(row.traditional + definitions[0]);
    row.head = row.traditional;
    row.bare = row.traditional;
    row.pinyin = row.pinyin ? this.parsePinyin(row.pinyin) : '';
    row.accented = row.traditional;
    row.pronunciation = row.pronunciation || row.jyutping;
    row.definitions = definitions;
    row.search = removeToneNumbers(((row.pronunciation || row.jyutping) + row.pinyin).replace(/ /g, ''));

    row.cjk = {
      canonical: row.traditional && row.traditional !== 'NULL' ? row.traditional : undefined,
      phonetics: row.pronunciation || row.jyutping
    };

    row.traditional = row.traditional;
    row.simplified = row.simplified;

    // Delete unnecessary properties
    delete row.english;
  }

  credit() {
    return `The Cantonese dictionary is provided by <a href="http://cantonese.org/download.html">cc-canto</a> dict, 
    open-source and distribtued under a <a href="http://creativecommons.org/licenses/by-sa/3.0/">Creative Commons Attribution-ShareAlike 3.0 license</a>. 
    The Hakka and Min Nan dictionaries are provided by <a href="https://github.com/g0v/moedict-data-hakka">g0v/moedict-data-hakka</a> 
    and <a href="https://github.com/g0v/moedict-data-twblg">g0v/moedict-data-twblg</a>, 
    distrubuted under the condition <a href="http://hakka.dict.edu.tw/hakkadict/qa.htm">citation, no modification, no commercial use</a>. `
  }

  dictionaryFile({
    l1Code = undefined,
    l2Code = undefined
  } = {}) {
    if (l1Code && l2Code) {
      return `${SERVER}data/${this.files[l2Code]}`
    }
  }

  lookupByPronunciation(jyutping) {
    let words = this.words.filter(
      row =>
        (row.cjk.phonetics ? removeToneNumbers(row.cjk.phonetics).replace(/ /g, '') : '') ===
        removeToneNumbers(jyutping).replace(/ /g, '')
    )
    return words
  }

  lookupByCharacter(char) {
    return this.words.filter(row => row.traditional && row.traditional.includes(char))
  }

  lookupSimplified(simplified, pinyin = false) {
    const candidates = this.words
      .filter(row => {
        let pinyinMatch = true
        if (pinyin.length > 0) {
          pinyinMatch = row.pinyin === pinyin
        }
        return pinyinMatch && row.simplified === simplified
      })
    return candidates
  }

  lookupTraditional(traditional, pinyin = false) {
    const candidates = this.words
      .filter(row => row.traditional === traditional)
    return candidates
  }

  parsePinyin(pinyin) {
    return pinyinify(pinyin.replace(/u:/gi, 'ü')) // use the pinyinify library to parse tones
      .replace(/\d/g, '') // pinyinify does not handle 'r5', we remove all digits
  }
}
