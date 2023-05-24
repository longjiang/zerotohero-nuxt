importScripts('../vendor/wanakana/wanakana.min.js')
importScripts('../vendor/localforage/localforage.js')
importScripts("../vendor/hash-string/hash-string.min.js")
importScripts("../js/base-dictionary.js")

class KdicJcDictionary extends BaseDictionary  {
  
  constructor({ l1 = undefined, l2 = undefined } = {}) {
    super({l1, l2});
    this.indexKeys = ['search', 'kana', 'romaji'];
    this.kanaIndex = {};
    this.romajiIndex = {};
    this.indexDbVerByLang = {
      jpn: '0fc5e9b',
    };
    this.file = '/data/kdic-jc/kdic-jc.tsv.txt';
  }
  
  credit() {
    return '日汉词典来自StarDict格式的<a href="https://github.com/a0726h77/stardict-dict-ja" target="_blank">kdic-jc</a>。'
  }

  async loadData() {
    let words = await this.loadAndNormalizeDictionaryData({ name: `kdic-jc`, file: this.file, delimiter: '\t' })
    this.words = words
    words = null
  }

  // Normalizes the input 'row' object and modifies it in place.
  normalizeWord(row) {
    if (row.kanji === 'ー') delete row.kana;
    row.head = row.kanji || row.kana;
    row.bare = row.head;
    row.search = row.head;
    row.accented = row.head;
    row.pos = '';
    row.definitions = row.translation ? row.translation.split('，').filter(d => d !== '') : [];
    row.cjk = {
      canonical: row.kanji && row.kanji !== 'NULL' ? row.kanji : undefined,
      phonetics: row.kana
    };
    row.romaji = wanakana.toRomaji(row.kana);
  
    // Delete unused properties
    delete row.translation;
  }

  getWordsThatContain(text) {
    let strings = []
    this.words.forEach(w => {
      if (w.kanji && w.kanji.includes(text)) {
        strings.push(w.kanji)
      }
      if (w.kana && w.kana.includes(text)) {
        strings.push(w.kana)
      }
    })
    return strings
  }

  lookup(text) {
    let words = this.searchIndex[text];
    if (words && words[0]) return words[0];
    else {
      return this.words.find(word => word && word.kana === text)
    }
  }
  
  lookupMultiple(text) {
    let words = this.searchIndex[text] || [];
    let moreWords = this.kanaIndex[text] || []
    let candidates = [...words, ...moreWords]
    return candidates
  }
  
  lookupByCharacter(char) {
    return this.words.filter(row => row.kanji && row.kanji.includes(char))
  }

  lookupKana(kana) {
    const candidates = this.words.filter(row => {
      return row.kana === kana
    })
    return candidates
  }
  
  transliterate(text) {
    return wanakana.toRomaji(text)
  }
}
