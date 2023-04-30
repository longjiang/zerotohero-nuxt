// importScripts('../vendor/kuromoji/kuromoji.js')
importScripts('../vendor/wanakana/wanakana.min.js')
importScripts('../vendor/localforage/localforage.js')
importScripts("../vendor/hash-string/hash-string.min.js")
importScripts("../js/base-dictionary.js")

class EdictDictionary extends BaseDictionary  {
  
  constructor({ l1 = undefined, l2 = undefined } = {}) {
    super({l1, l2});
    this.file = 'https://server.chinesezerotohero.com/data/edict/edict.tsv.txt';
    this.wiktionaryFile = 'https://server.chinesezerotohero.com/data/wiktionary-csv/jpn-eng.csv.txt';
    this.posLookupTable = {
      "adj-f": "noun or verb acting prenominally",
      "adj-i": "adjective (keiyoushi)",
      "adj-ix": "adjective (keiyoushi) - yoi/ii class",
      "adj-kari": "'kari' adjective (archaic)",
      "adj-ku": "'ku' adjective (archaic)",
      "adj-na": "adjectival nouns or quasi-adjectives (keiyodoshi)",
      "adj-nari": "archaic/formal form of na-adjective",
      "adj-no": "nouns which may take the genitive case particle 'no'",
      "adj-pn": "pre-noun adjectival (rentaishi)",
      "adj-shiku": "'shiku' adjective (archaic)",
      "adj-t": "'taru' adjective",
      "adv": "adverb (fukushi)",
      "adv-to": "adverb taking the 'to' particle",
      "aux": "auxiliary",
      "aux-adj": "auxiliary adjective",
      "aux-v": "auxiliary verb",
      "conj": "conjunction",
      "cop": "copula",
      "ctr": "counter",
      "exp": "expressions (phrases, clauses, etc.)",
      "int": "interjection (kandoushi)",
      "n": "noun (common) (futsuumeishi)",
      "n-adv": "adverbial noun (fukushitekimeishi)",
      "n-pr": "proper noun",
      "n-pref": "noun, used as a prefix",
      "n-suf": "noun, used as a suffix",
      "n-t": "noun (temporal) (jisoumeishi)",
      "num": "numeric",
      "pn": "pronoun",
      "pref": "prefix",
      "prt": "particle",
      "suf": "suffix",
      "unc": "unclassified",
      "v-unspec": "verb unspecified",
      "v1": "Ichidan verb",
      "v1-s": "Ichidan verb - kureru special class",
      "v2a-s": "Nidan verb with 'u' ending (archaic)",
      "v2b-k": "Nidan verb (upper class) with 'bu' ending (archaic)",
      "v2b-s": "Nidan verb (lower class) with 'bu' ending (archaic)",
      "v2d-k": "Nidan verb (upper class) with 'dzu' ending (archaic)",
      "v2d-s": "Nidan verb (lower class) with 'dzu' ending (archaic)",
      "v2g-k": "Nidan verb (upper class) with 'gu' ending (archaic)",
      "v2g-s": "Nidan verb (lower class) with 'gu' ending (archaic)",
      "v2h-k": "Nidan verb (upper class) with 'hu/fu' ending (archaic)",
      "v2h-s": "Nidan verb (lower class) with 'hu/fu' ending (archaic)",
      "v2k-k": "Nidan verb (upper class) with 'ku' ending (archaic)",
      "v2k-s": "Nidan verb (lower class) with 'ku' ending (archaic)",
      "v2m-k": "Nidan verb (upper class) with 'mu' ending (archaic)",
      "v2m-s": "Nidan verb (lower class) with 'mu' ending (archaic)",
      "v2n-s": "Nidan verb (lower class) with 'nu' ending (archaic)",
      "v2r-k": "Nidan verb (upper class) with 'ru' ending (archaic)",
      "v2r-s": "Nidan verb (lower class) with 'ru' ending (archaic)",
      "v2s-s": "Nidan verb (lower class) with 'su' ending (archaic)",
      "v2t-k": "Nidan verb (upper class) with 'tsu' ending (archaic)",
      "v2t-s": "Nidan verb (lower class) with 'tsu' ending (archaic)",
      "v2w-s": "Nidan verb (lower class) with 'u' ending and 'we' conjugation (archaic)",
      "v2y-k": "Nidan verb (upper class) with 'yu' ending (archaic)",
      "v2y-s": "Nidan verb (lower class) with 'yu' ending (archaic)",
      "v2z-s": "Nidan verb (lower class) with 'zu' ending (archaic)",
      "v4b": "Yodan verb with 'bu' ending (archaic)",
      "v4g": "Yodan verb with 'gu' ending (archaic)",
      "v4h": "Yodan verb with 'hu/fu' ending (archaic)",
      "v4k": "Yodan verb with 'ku' ending (archaic)",
      "v4m": "Yodan verb with 'mu' ending (archaic)",
      "v4n": "Yodan verb with 'nu' ending (archaic)",
      "v4r": "Yodan verb with 'ru' ending (archaic)",
      "v4s": "Yodan verb with 'su' ending (archaic)",
      "v4t": "Yodan verb with 'tsu' ending (archaic)",
      "v5aru": "Godan verb - -aru special class",
      "v5b": "Godan verb with 'bu' ending",
      "v5g": "Godan verb with 'gu' ending",
      "v5k": "Godan verb with 'ku' ending",
      "v5k-s": "Godan verb - Iku/Yuku special class",
      "v5m": "Godan verb with 'mu' ending",
      "v5n": "Godan verb with 'nu' ending",
      "v5r": "Godan verb with 'ru' ending",
      "v5r-i": "Godan verb with 'ru' ending (irregular verb)",
      "v5s": "Godan verb with 'su' ending",
      "v5t": "Godan verb with 'tsu' ending",
      "v5u": "Godan verb with 'u' ending",
      "v5u-s": "Godan verb with 'u' ending (special class)",
      "v5uru": "Godan verb - Uru old class verb (old form of Eru)",
      "vi": "intransitive verb",
      "vk": "Kuru verb - special class",
      "vn": "irregular nu verb",
      "vr": "irregular ru verb, plain form ends with -ri",
      "vs": "noun or participle which takes the aux. verb suru",
      "vs-c": "su verb - precursor to the modern suru",
      "vs-i": "suru verb - included",
      "vs-s": "suru verb - special class",
      "vt": "transitive verb",
      "vz": "Ichidan verb - zuru verb (alternative form of -jiru verbs)"
    }
  }
  
  credit() {
    return 'The Japanese dictionary is provided by <a href="http://www.edrdg.org/jmdict/edict.html">EDICT</a>, open-source and distribtued under a <a href="http://creativecommons.org/licenses/by-sa/3.0/">Creative Commons Attribution-ShareAlike 3.0 license</a>.'
  }

  async loadData() {
    const l1Code = this.l1['iso639-3']
    const l2Code = this.l2['iso639-3']
    let words = await this.loadAndNormalizeDictionaryData({ name: `edict`, file:this.file, delimiter: "\t" })
    let wiktionaryWords = await this.loadAndNormalizeDictionaryData({ name: `wiktionary-jpn-eng`, file: this.wiktionaryFile })
    this.words = uniqueByValues([...words, ...wiktionaryWords], ['id'])
    words = null
    wiktionaryWords = null
  }

  // Normalizes the input 'row' object and modifies it in place.
  normalizeWord(row) {
    if (row.kanji === 'ー') delete row.kana;
    let pos = row.english ? row.english.replace(/^\((.*?)\).*/gi, "$1").split(',')[0] : undefined;
    pos = this.posLookupTable[pos] || pos;
  
    row.head = row.kanji || row.kana;
    row.bare = row.kanji || row.kana;
    row.accented = row.kanji || row.kana;
    row.pos = pos;
    row.definitions = row.english ? row.english.replace(/\(.*?\)/gi, '').replace('/(P)', '').split('/').filter(d => d !== '') : [];
    row.cjk = {
      canonical: row.kanji && row.kanji !== 'NULL' ? row.kanji : undefined,
      phonetics: row.kana
    };
    row.romaji = wanakana.toRomaji(row.kana);
  
    // Delete unused properties
    delete row.english;
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
    let word = this.words.find(word => word && (word.kanji === text || word.kana === text))
    return word
  }
  
  lookupMultiple(text) {
    let words = this.words.filter(word => word && (word.kanji === text || word.kana === text))
    return words
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
      let shortest = Math.min(...results.map(r => r.kana ? r.kana.length : r.head.length))
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
