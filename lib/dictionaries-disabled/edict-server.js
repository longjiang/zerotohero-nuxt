import Papa from 'papaparse'
import axios from 'axios'

export default {
  file: `${process.env.baseUrl}/data/edict/edict.tsv.txt`,
  words: [],
  name: 'edict',
  tokenizer: undefined,
  credit() {
    return 'The Japanese dictionary is provided by <a href="http://www.edrdg.org/jmdict/edict.html">EDICT</a>, open-source and distribtued under a <a href="http://creativecommons.org/licenses/by-sa/3.0/">Creative Commons Attribution-ShareAlike 3.0 license</a>.'
  },
  async load() {
    // const server =  `${process.env.baseUrl}/`
    const server = 'https://server.chinesezerotohero.com/'
    this.file = `${server}data/edict/edict.tsv.txt`
    let res = await axios.get(this.file)
    let results = await Papa.parse(res.data, {
      header: true
    })
    let sorted = results.data.sort((a, b) =>
      a.kana && b.kana ? a.kana.length - b.kana.length : 0
    )
    let data = []
    for (let row of sorted) {
      let word = Object.assign(row, {
        head: row.kanji || row.kana,
        bare: row.kanji || row.kana,
        accented: row.kanji || row.kana,
        definitions: row.english ? row.english.replace(/\(.*?\)/gi, '').replace('/(P)', '').split('/').filter(d => d !== '') : [],
        cjk: {
          canonical: row.kanji && row.kanji !== 'NULL' ? row.kanji : undefined,
          phonetics: row.kana
        }
      })
      data.push(word)
    }
    this.words = data.sort((a, b) => b.head && a.head ? b.head.length - a.head.length : 0)
    return this
  },
  getSize() {
    return this.words.length
  },
  wordForms(word) {
    let forms = [{
      table: 'head',
      field: 'head',
      form: word.bare
    }]
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
    let word = this.words.find(word => word && word.bare === text)
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
  get(id) {
    let entry = this.words.find(row => row.id === id)
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
      let reg = new RegExp(text, 'gi')
      results = this.words
        .filter(
          row => reg.test(row.kanji) || reg.test(row.kana)
        )
    } else {
      text = text.toLowerCase().trim()
      results = this.words
        .filter(row =>
          row.romaji.includes(
            text.replace(/ /g, '')
          )
        )
    }
    if (results) {
      results = results
        .sort((a, b) => {
          return a.kana.length - b.kana.length
        })
      if (limit) {
        results = results.slice(0, limit)
      }
      let shortest = Math.min(...results.map(r => r.kana.length))
      results = results.map(word => {
        let score = shortest / word.kana.length - 0.1 * Math.min(word.kana.replace(text, '').length, word.kanji.replace(text, '').length)
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
  tokenize(text) {
    let t = []
    let segs = text.split(/\s+/)
    for (let seg of segs) {
      let tokenized = this.tokenizer.tokenize(seg);
      for (let index in tokenized) {
        let token = tokenized[index]
        let candidates = this.lookupMultiple(
          token.surface_form
        );
        if (token.basic_form && token.basic_form !== token.surface_form) {
          candidates = candidates.concat(
            this.lookupMultiple(
              token.basic_form
            )
          );
        }
        t.push({
          text: token.surface_form,
          candidates,
        })
      }
      t.push(' ')
    }
    t.pop()
    return t
  },
}