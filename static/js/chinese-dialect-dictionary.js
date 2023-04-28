importScripts("../vendor/localforage/localforage.js")
importScripts('../js/base-dictionary.js')
importScripts("../js/tokenizers/base-tokenizer.js");
importScripts("../vendor/pinyinify/pinyinify.js");
class ChineseDialectDictionary extends BaseDictionary {
  
  constructor({ l1 = undefined, l2 = undefined } = {}) {
    super({l1, l2});
    this.files = {
      yue: 'cc-canto/cccanto-webdist.csv.txt',
      hak: 'dict-hakka/dict-hakka.csv.txt',
      nan: 'dict-twblg/dict-twblg.csv.txt',
    };
    this.version = '1.1.3';
  }

  static async load({ l1 = undefined, l2 = undefined } = {}) {
    const instance = new ChineseDialectDictionary({l1, l2});
    await instance.loadWords();
    instance.tokenizer = new BaseTokenizer(l2, instance.words)
    return instance;
  }

  async loadWords() {
    const l1Code = this.l1['iso639-3']
    const l2Code = this.l2['iso639-3']
    const file = this.dictionaryFile({ l1Code, l2Code })
    let data = await this.loadSmart(`dialect-dict-${l1Code}-${l2Code}`, file)
    let sorted = data.sort((a, b) =>
      a.traditional && b.traditional ? a.traditional.length - b.traditional.length : 0
    )
    let words = []
    for (let [index, row] of sorted.entries()) {
      let definitions = row.english ? row.english.split('/').map(d => d.trim()) : row.definitions ? row.definitions.split('|').map(d => d.trim()) : []
      let word = {
        id: index.toString(),
        head: row.traditional,
        bare: row.traditional,
        pinyin: row.pinyin ? this.parsePinyin(row.pinyin) : '',
        accented: row.traditional,
        pronunciation: row.pronunciation || row.jyutping,
        definitions,
        search: removeTones(((row.pronunciation || row.jyutping) + row.pinyin).replace(/ /g, '')),
        cjk: {
          canonical: row.traditional && row.traditional !== 'NULL' ? row.traditional : undefined,
          phonetics: row.pronunciation || row.jyutping
        },
        traditional: row.traditional,
        simplified: row.simplified,
      }
      words.push(word)
    }
    this.words = words
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

  async loadSmart(name, file) {
    let data = await localforage.getItem(name)
    if (!data) {
      console.log(`Dialect Dict: requesting '${file}' . . .`)
      let response = await axios.get(file)
      data = response.data
      localforage.setItem(name, data)
      response = null
    } else {
      console.log(`Dialect Dict: dictionary '${name}' loaded from local indexedDB via localforage`)
    }
    if (data) {
      let results = Papa.parse(data, {
        header: true,
        delimiter: ','
      })
      return results.data
    }
  }


  parsePinyin(pinyin) {
    return pinyinify(pinyin.replace(/u:/gi, 'ü')) // use the pinyinify library to parse tones
      .replace(/\d/g, '') // pinyinify does not handle 'r5', we remove all digits
  }

  lookupByPronunciation(jyutping) {
    let words = this.words.filter(
      row =>
        (row.cjk.phonetics ? this.removeTones(row.cjk.phonetics).replace(/ /g, '') : '') ===
        this.removeTones(jyutping).replace(/ /g, '')
    )
    return words
  }

  lookupByDef(text, limit = 30) {
    text = text.toLowerCase()
    let results = this.words.filter(row => row.english && row.english.toLowerCase().includes(text)).slice(0, limit)
    return results
  }

  /**
   * Get a word by ID.
   * @param {*} id the word's id
   * @param {*} head (optional) the head of the word to check if matches the word retrieved; if mismatched, we'll look for a matching word instead.
   * @returns 
   */
  get(id, head) {
    let word
    word = this.words.find(row => row.id === id)
    if (head && word.head !== head) {
      word = this.lookup(head)
    }
    return word
  }

  getSize() {
    return this.words.length
  }

  isRoman(text) {
    return text.match(/\w+/) ? true : false
  }

  random() {
    return randomArrayItem(this.words)
  }

  lookupByCharacter(char) {
    return this.words.filter(row => row.traditional && row.traditional.includes(char))
  }

  uniqueByValue(array, key) {
    let flags = []
    let unique = []
    let l = array.length
    for (let i = 0; i < l; i++) {
      if (flags[array[i][key]]) continue
      flags[array[i][key]] = true
      unique.push(array[i])
    }
    return unique
  }

  lookupMultiple(text) {
    let results = this.lookupSimplified(text).concat(this.lookupTraditional(text))
    return this.uniqueByValue(results, 'id')
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

  lookup(text) {
    let word = this.words.find(word => word && (word.simplified === text || word.traditional === text))
    return word
  }

  getWords() {
    return this.words
  }

  getWordsThatContain(text) {
    let words = this.words.filter(w => (w.simplified && w.simplified.includes(text)) || (w.traditional && w.traditional.includes(text)))
    let strings = this.unique(
      words
        .map((word) => word.simplified)
        .concat(words.map((word) => word.traditional))
    )
    return strings
  }

  lookupFuzzy(text, limit = false) {
    let results = []
    if (this.isChinese(text)) {
      let reg = new RegExp(text, 'gi')
      results = this.words
        .filter(
          row => reg.test(row.simplified) || reg.test(row.traditional)
        )
    } else {
      text = text.toLowerCase().trim()
      results = this.words
        .filter(row =>
          row.search.includes(
            text.replace(/ /g, '')
          )
        )
    }
    if (results) {
      results = results.sort((a, b) => b.weight - a.weight)
        .sort((a, b) => a.simplified.length - b.simplified.length)
      if (limit) {
        results = results.slice(0, limit)
      }
      let maxWeight = Math.max(...results.map(w => w.weight))
      let shortest = Math.min(...results.map(r => r.simplified.length))
      results = results.map(word => {
        let score = shortest / word.simplified.length - 0.1 + (word.weight / maxWeight * 0.1)
        return Object.assign({ score }, word)
      })
      return results
    }
  }
  
  async tokenize(text) {
    return await this.tokenizer.tokenizeWithCache(text)
  }
}
