// importScripts('../vendor/kuromoji/kuromoji.js')
importScripts('../vendor/wanakana/wanakana.min.js')
importScripts('../vendor/localforage/localforage.js')
importScripts("../vendor/hash-string/hash-string.min.js")
importScripts("../js/base-dictionary.js")

class KdicJcDictionary extends BaseDictionary  {
  
  constructor({ l1 = undefined, l2 = undefined } = {}) {
    super({l1, l2});
    this.file = 'https://server.chinesezerotohero.com/data/edict/edict.tsv.txt';
  }
  
  credit() {
    return '日汉词典来自StarDict格式的<a href="https://github.com/a0726h77/stardict-dict-ja" target="_blank">kdic-jc</a>。'
  }

  async loadData() {
    const l1Code = this.l1['iso639-3']
    const l2Code = this.l2['iso639-3']
    let words = await this.loadAndNormalizeDictionaryData({ name: `kdic-jc`, file: this.file, delimiter: '\t' })
    this.words = words
    words = null
  }

  // Normalizes the input 'row' object and modifies it in place.
  normalizeWord(row) {
    if (row.kanji === 'ー') delete row.kana;
    row.head = row.kanji || row.kana;
    row.bare = row.kanji || row.kana;
    row.accented = row.kanji || row.kana;
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
    let moreWords = this.words.filter(word => word && word.kana === text) || []
    return [...words, ...moreWords]
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

  lookupFuzzy(text, limit = false) {
    let results = []
    if (!isRoman(text)) {
      try {
        let reg = new RegExp(sanitizeRegexString(text), 'gi')
        results = this.words
          .filter(
            row => reg.test(row.kanji) || reg.test(row.kana)
          )
      } catch (err) {
        console.log(err)
      }
    } else {
      text = text.toLowerCase().trim()
      results = this.words
        .filter(row =>
          row.romaji && row.romaji.includes(
            text.replace(/ /g, '')
          )
        )
    }
    if (results) {
      results = results
        .sort((a, b) => {
          return a.kana && b.kana ? a.kana.length - b.kana.length : 0
        })
      if (limit) {
        results = results.slice(0, limit)
      }
      let shortest = Math.min(...results.map(r => r.kana ? r.kana.length : r.head ? r.head.length : 0))
      results = results.map(word => {
        let w = word.kana || word.head
        let score = shortest / w.length - 0.1 * Math.min(w.replace(text, '').length, word.kanji.replace(text, '').length)
        return Object.assign({ score }, word)
      })
      return results
    }
  }
  
  transliterate(text) {
    return wanakana.toRomaji(text)
  }
}
