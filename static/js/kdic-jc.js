// importScripts('../vendor/kuromoji/kuromoji.js')
importScripts('../vendor/wanakana/wanakana.min.js')
importScripts('../vendor/jpconjugations.js')
importScripts('../vendor/localforage/localforage.js')
importScripts("../vendor/hash-string/hash-string.min.js")
importScripts("../js/map-kana.js")

const PYTHON_SERVER = 'https://python.zerotohero.ca/'

const PROXY_SERVER = 'https://server.chinesezerotohero.com/'

const Dictionary = {
  file: 'https://server.chinesezerotohero.com/data/kdic-jc/kdic-jc.tsv.txt',
  words: [],
  tokenizationCache: {},
  name: 'edict',
  // tokenizer: undefined,
  credit() {
    return '日汉词典来自StarDict格式的<a href="https://github.com/a0726h77/stardict-dict-ja" target="_blank">kdic-jc</a>。'
  },
  async load() {
    // this.tokenizer = await new Promise(resolve => {
    //   kuromoji.builder({ dicPath: `https://server.chinesezerotohero.com/data/kuromoji/` }).build((err, tokenizer) => {
    //     resolve(tokenizer)
    //   })
    // })
    let [edictData] = await Promise.all([
      this.loadSmart('kdic-jc', this.file),
    ]);
    let words = await this.loadEdict(edictData)
    this.words = this.uniqueByValues(words, ["id"]);
    words = null
    return this
  },
  async loadEdict(csv) {
    let results = await Papa.parse(csv, {
      header: true
    });
    let data = results.data
    let sorted = data.sort((a, b) =>
      a.kana && b.kana ? a.kana.length - b.kana.length : 0
    )
    let words = []
    for (let row of sorted) {
      if (row.kanji === 'ー') delete row.kana

      let word = Object.assign(row, {
        head: row.kanji || row.kana,
        bare: row.kanji || row.kana,
        accented: row.kanji || row.kana,
        pos: '',
        definitions: row.translation ? row.translation.split('，').filter(d => d !== '') : [],
        cjk: {
          canonical: row.kanji && row.kanji !== 'NULL' ? row.kanji : undefined,
          phonetics: row.kana
        },
        romaji: wanakana.toRomaji(row.kana)
      })
      if (word.id) words.push(word)
    }
    words = words.sort((a, b) => b.head && a.head ? b.head.length - a.head.length : 0)
    return words
  },
  // https://stackoverflow.com/questions/38613654/javascript-find-unique-objects-in-array-based-on-multiple-properties
  uniqueByValues(arr, keyProps) {
    const kvArray = arr.map(entry => {
      const key = keyProps.map(k => entry[k]).join("|");
      return [key, entry];
    });
    const map = new Map(kvArray);
    return Array.from(map.values());
  },
  async loadSmart(name, file) {
    let data = await localforage.getItem(name)
    if (!data) {
      console.log(`EDICT: requesting '${file}' . . .`)
      let response = await axios.get(file)
      data = response.data
      localforage.setItem(name, data)
      response = null
    } else {
      console.log(`EDICT: dictionary '${name}' loaded from local indexedDB via localforage`)
    }
    if (data) {
      return data
    }
  },
  getSize() {
    return this.words.length
  },
  getWords() {
    return this.words
  },
  getWordsThatContain(text) {
    let strings = []
    let words = this.words.filter(w => {
      if (w.kanji && w.kanji.includes(text)) {
        strings.push(w.kanji)
      }
      if (w.kana && w.kana.includes(text)) {
        strings.push(w.kana)
      }
    })
    return strings
  },
  wordForms(word) {
    let forms = [{
      table: 'head',
      field: 'head',
      form: word.bare
    }]
    let jpForms = JPConjugations.conjugate(word.bare)
    forms = forms.concat(jpForms.map(f => {
      return {
        table: 'conjugation',
        field: f.name,
        form: f.form
      }
    }))
    return forms
  },
  stylize(name) {
    return name
  },
  accent(text) {
    return text
  },
  lookupByDef(text, limit = 30) {
    text = text.toLowerCase()
    let results = []
    for (let word of this.words) {
      for (let d of word.definitions) {
        let found = d.toLowerCase().includes(text)
        if (found) {
          results.push(Object.assign({ score: 1 / (d.length - text.length + 1) }, word))
        }
      }
    }
    results = results.sort((a, b) => b.score - a.score)
    return results.slice(0, limit)
  },
  lookup(text) {
    let word = this.words.find(word => word && word.head === text)
    return word
  },
  lookupMultiple(text) {
    let words = this.words.filter(word => word && (word.kanji === text || word.kana === text))
    return words
  },
  unique(array) {
    var uniqueArray = []
    for (let i in array) {
      if (!uniqueArray.includes(array[i])) uniqueArray.push(array[i])
    }
    return uniqueArray
  },
  /**
   * Get a word by ID.
   * @param {*} id the word's id
   * @param {*} head (optional) the head of the word to check if matches the word retrieved; if mismatched, we'll look for a matching word instead.
   * @returns 
   */
  get(id, head) {
    let entry = this.words.find(row => row.id === id)
    if (head) {
      if (!entry || entry.head !== head) {
        entry = this.lookup(head)
      }
    }
    return entry
  },
  isChinese(text) {
    if (this.matchChinese(text)) return true
  },
  isRoman(text) {
    return text.match(/\w+/) ? true : false
  },
  matchChinese(text) {
    return text.match(
      // eslint-disable-next-line no-irregular-whitespace
      /[\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u3005\u3007\u3021-\u3029\u3038-\u303B‌​\u3400-\u4DB5\u4E00-\u9FCC\uF900-\uFA6D\uFA70-\uFAD9]+/g
    )
  },
  randomArrayItem(array, start = 0, length = false) {
    length = length || array.length
    array = array.slice(start, length)
    let index = Math.floor(Math.random() * array.length)
    return array[index]
  },
  random() {
    return this.randomArrayItem(this.words)
  },
  lookupByCharacter(char) {
    return this.words.filter(row => row.kanji && row.kanji.includes(char))
  },
  lookupKana(kana) {
    const candidates = this.words.filter(row => {
      return row.kana === kana
    })
    return candidates
  },
  findPhrases(word) {
    if (word) {
      if (!word.phrases || word.phrases.length === 0) {
        let phrases = []
        for (let w of this.words) {
          if (w.kanji.length > word.kanji.length && w.kanji.includes(word.kanji)) phrases.push(w)
        }
        phrases = phrases.sort((a, b) => a.kanji.length - b.kanji.length).sort((a, b) => b.weight - a.weight)
        return phrases
      } else {
        return word.phrases
      }
    }
  },
  lookupByPattern(pattern) {
    // pattern like '～体'
    var results = []
    if (pattern.includes('～')) {
      const regexPattern = '^' + pattern.replace(/～/gi, '.+') + '$'
      const regex = new RegExp(regexPattern)
      results = this.words.filter(word => regex.test(word.kana))
    } else {
      results = this.words.filter(word => word.kana.includes(pattern))
    }
    return results
  },
  lookupFuzzy(text, limit = false) {
    let results = []
    if (!this.isRoman(text)) {
      try {
        let reg = new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
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
  },
  subdict(data) {
    let newDict = Object.assign({}, this)
    return Object.assign(newDict, { words: data })
  },
  subdictFromText(text) {
    return this.subdict(
      this.words.filter(function (row) {
        return text.includes(row.head)
      })
    )
  },
  /* Returns the longest word in the dictionary that is inside `text` */
  longest(text) {
    // Only return the *first* seen word and those the same as it
    let first = false
    let matches = this.words
      .filter(function (word) {
        if (first) {
          return word.head === first
        } else {
          if (text.includes(word.head)) {
            first = word.head
            return true
          }
        }
      })
      .sort((a, b) => {
        return b.head.length - a.head.length
      })
    return {
      matches: matches,
      text: matches && matches.length > 0 ? matches[0].head : ''
    }
  },
  // json or plain text only, and returns object
  async proxy(url, cacheLife = -1, encoding = false) {
    try {
      let proxyURL = `${PROXY_SERVER}scrape2.php?cache_life=${cacheLife}${encoding ? "&encoding=" + encoding : ""
        }&url=${encodeURIComponent(url)}`;
      let response = await axios.get(proxyURL);
      if (response.data) {
        return response.data;
      }
    } catch (err) {
      console.log(`Cannot get ${url}`);
    }
    return false;
  },
  async tokenizeJapanese(text) {
    text = text.replace(/-/g, "- ");
    let url = `${PYTHON_SERVER}lemmatize-japanese?text=${encodeURIComponent(
      text
    )}`;
    let tokenized = await this.proxy(url);
    let tokens = [];
    for (let token of tokenized) {
      if (!token) {
        tokens.push(" ");
      } else if (["補助記号-"].includes(token.pos)) {
        tokens.push(token.word);
      } else {
        tokens.push(token);
      }
    }
    return tokens;
  },
  uniqueByValue(array, key) {
    let flags = [];
    let unique = [];
    let l = array.length;
    for (let i = 0; i < l; i++) {
      if (flags[array[i][key]]) continue;
      flags[array[i][key]] = true;
      unique.push(array[i]);
    }
    return unique;
  },
  isJapanese(text) {
    const japaneseRegex = /^[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}\p{Punctuation}\p{Symbol}]+$/ug
    return japaneseRegex.test(text)
  },
  async tokenize(text) {
    if (this.tokenizationCache[text]) return this.tokenizationCache[text]
    let tokenized = await this.tokenizeJapanese(text);
    let final = []
    for (let index in tokenized) {
      let token = tokenized[index]
      let candidates = this.lookupMultiple(
        token.word
      );
      if (token.lemma && token.lemma !== token.word) {
        candidates = candidates.concat(
          this.lookupMultiple(
            token.lemma
          )
        );
      }
      let mappedPronunciation = mapKana(token.word, wanakana.toHiragana(token.pronunciation))
      final.push({
        text: token.word,
        candidates,
        pos: token.pos,
        pronunciation: wanakana.toHiragana(token.pronunciation),
        mappedPronunciation
      })
      if (!this.isJapanese(token.word)) final.push(" ")
    }
    this.tokenizationCache[text] = final
    return final
  },
  transliterate(text) {
    return wanakana.toRomaji(text)
  }
}
