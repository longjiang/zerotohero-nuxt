import Papa from 'papaparse'
import axios from 'axios'
import FastestLevenshtein from 'fastest-levenshtein'

export default {
  file: 'https://server.chinesezerotohero.com/data/kengdic/kengdic_2011.tsv.txt',
  wiktionaryFile: 'https://server.chinesezerotohero.com/data/wiktionary-csv/kor-eng.csv.txt',
  words: [],
  name: 'kengdic',
  hangulRegex: /[\u1100-\u11FF\u302E\u302F\u3131-\u318E\u3200-\u321E\u3260-\u327E\uA960-\uA97C\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uFFA0-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]+/,
  credit() {
    return `The Korean dictionary is provided by <a href="https://github.com/garfieldnate/kengdic">kengdic</a> created by Joe Speigle, which is freely available from its GitHub project page. Korean conjugation made possible with <a href="https://github.com/max-christian/korean_conjugation">max-christian/korean_conjugation</a>.`
  },
  async load() {
    let words = await this.loadKengdic(this.file)
    let wiktionaryWords = await this.loadWiktionary(this.wiktionaryFile)
    wiktionaryWords = wiktionaryWords.map((word, index) => {
      word.id = String(300000 + index)
      return word
    })
    words = words.concat(wiktionaryWords)
    this.words = this.uniqueByValues(words, ['bare', 'hanja'])
    axios.get('https://py.zerotohero.ca/start-open-korean-text.php') // Call index.php to make sure the java open-korean-text process is running (Dreamhost kills it from time to time)
    return this
  },
  async loadKengdic(file) {
    let res = await axios.get(file)
    let results = await Papa.parse(res.data, {
      header: true
    })
    let sorted = results.data.sort((a, b) =>
      a.hangul && b.hangul ? a.hangul.length - b.hangul.length : 0
    )
    this.rawWords = sorted
    let data = []
    for (let row of sorted) {
      let word = Object.assign(row, {
        head: row.hangul,
        bare: row.hangul,
        accented: row.hangul,
        definitions: [row.english],
        cjk: {
          canonical: row.hanja && row.hanja !== 'NULL' ? row.hanja : undefined,
          phonetics: row.hungul
        }
      })
      data.push(word)
    }
    return data
  },
  async loadWiktionary(file) {
    console.log(`Wiktionary: loading ${file}`)
    let res = await axios.get(file)
    let words = this.parseDictionaryCSV(res.data)
    words = words.sort((a, b) => {
      if (a.head && b.head) {
        return b.head.length - a.head.length
      }
    })
    console.log(`Wiktionary: ${file} loaded.`)
    return words
  },
  parseDictionaryCSV(data) {
    console.log("Wiktionary: parsing words from CSV...")
    let parsed = Papa.parse(data, { header: true })
    let words = parsed.data
    words = words.filter(w => w.word.length > 0) // filter empty rows
      .map(item => {
        item.bare = item.word
        item.search = item.bare.toLowerCase()
        item.head = item.word
        item.accented = item.word
        delete item.word
        item.wiktionary = true
        item.definitions = item.definitions ? item.definitions.split('|') : []
        item.stems = item.stems ? item.stems.split('|') : []
        for (let definition of item.definitions.filter(d => d.includes(' of '))) {
          let lemma = this.lemmaFromDefinition(definition)
          if (lemma) item.stems.push(lemma)
        }
        item.stems = this.unique(item.stems)
        item.phrases = item.phrases ? item.phrases.split('|') : []
        if (item.han) {
          item.cjk = {
            canonical: item.han,
            pronunciation: item.bare
          }
          item.hanja = item.han
        }
        return item
      })
    return words
  },
  lemmaFromDefinition(definition) {
    definition = definition.replace(/\(.*\)/g, '').trim()
    let m = definition.match(/(.* of )([^\s\.]+)$/);
    if (m) {
      let lemma = m[2].replace(/\u200e/g, ""); // Left-to-Right Mark
      return lemma
    }
  },
  getSize() {
    return this.words.length
  },
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
  },
  // https://stackoverflow.com/questions/38613654/javascript-find-unique-objects-in-array-based-on-multiple-properties
  uniqueByValues(arr, keyProps) {
    const kvArray = arr.map(entry => {
      const key = keyProps.map(k => entry[k]).join('|');
      return [key, entry];
    });
    const map = new Map(kvArray);
    return Array.from(map.values());
  },
  unique(a) {
    return a.filter((item, i, ar) => ar.indexOf(item) === i);
  },
  getWords() {
    return this.words
  },
  getWordsThatContain(text) {
    let words = this.words.filter(w => w.head && w.head.includes(text))
    let strings = words
      .map((word) => word.head)
    return this.unique(strings)
  },
  get(id) {
    return this.words.find(row => row.id === id)
  },
  isChinese(text) {
    if (this.matchChinese(text)) return true
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
  wordForms(word) {
    let forms = [{
      table: 'head',
      field: 'head',
      form: word.bare
    }]
    if (word.bare.endsWith('다')) {
      let krForms = this.conjugate(word.bare)
      forms = forms.concat(krForms.map(f => {
        return {
          table: `conjugation`,
          field: f.name,
          form: f.form
        }
      }))
      forms = this.uniqueByValue(forms, 'form').sort((a, b) => a.length - b.length)
    }
    return forms
  },
  conjugate(text) {
    let forms = []
    let infinitive = conjugator.base(text, true);
    for (let regular of conjugator.both_regular_and_irregular ? [false] : [true]) {
      conjugator.verb_type(infinitive, regular)
      for (let key in conjugator) {
        if (conjugator[key].conjugation) {
          let conjugationFunc = conjugator[key]
          forms.push({ name: key.replace(/_/g, ' '), form: conjugationFunc(infinitive, regular), regular })
        }
      }
    }
    return forms
  },
  stylize(name) {
    return name
  },
  lookup(text) {
    let word = this.words.find(word => word && word.bare === text)
    return word
  },
  lookupByDef(text, limit = 30) {
    text = text.toLowerCase()
    let results = []
    for (let word of this.words) {
      for (let d of word.definitions) {
        if (d) {
          let found = d.toLowerCase().includes(text)
          if (found) {
            results.push(Object.assign({ score: 1 / (d.length - text.length + 1) }, word))
          }
        }
      }
    }
    results = results.sort((a, b) => b.score - a.score)
    return results.slice(0, limit)
  },
  lookupMultiple(text) {
    let words = this.words.filter(word => word && word.bare === text)
    return words
  },
  random() {
    return this.randomArrayItem(this.words)
  },
  lookupByCharacter(char) {
    return this.words.filter(row => row.hanja && row.hanja.includes(char))
  },
  lookupHangul(hangul) {
    const candidates = this.words.filter(row => {
      return row.hangul === hangul
    })
    return candidates
  },
  accent(text) {
    return text
  },
  lookupByPattern(pattern) {
    // pattern like '～体'
    var results = []
    if (pattern.includes('～')) {
      const regexPattern = '^' + pattern.replace(/～/gi, '.+') + '$'
      const regex = new RegExp(regexPattern)
      results = this.words.filter(word => regex.test(word.hangul))
    } else {
      results = this.words.filter(word => word.hangul.includes(pattern))
    }
    return results
  },
  lookupFuzzy(text, limit = 30) {
    let words = []
    for (let word of this.words) {
      let search = word.bare
      if (search && search.length > 0) {
        let distance = FastestLevenshtein.distance(search, text);
        let max = Math.max(text.length, search.length)
        let similarity = (max - distance) / max
        words.push(Object.assign({ score: similarity }, word))
      }
    }
    words = words.sort((a, b) => b.score - a.score)
    words = this.uniqueByValue(words, 'id').slice(0, limit)
    return words
  },
  lookupMultiple(text) {
    let words = this.words.filter(word => word && (word.bare === text || word.hanja === text))
    return words
  },
  async tokenizeWithOpenKoreanText(text) {
    let res = await axios.get(`https://server.chinesezerotohero.com/scrape2.php?&cache_life=-1&url=${encodeURIComponent('http://py.zerotohero.ca:4567/tokenize?text=' + text.replace(/\s/g, '%20'))}`)
    if (res.data) {
      return res.data.tokens
    }
  },
  isHangul(text) {
    let isHangul = this.hangulRegex.test(text)
    return isHangul
  },
  hasHangul(text) {
    let hasHangul = text.includes
  },
  async tokenize(text) {
    let t = []
    let lastPosition = 0
    let tokenized
    let isHangul = this.isHangul(text)
    if (isHangul) tokenized = await this.tokenizeWithOpenKoreanText(text);
    if (tokenized) {
      for (let index in tokenized) {
        let token = tokenized[index]
        if (token.offset > lastPosition) {
          t.push(' ')
          lastPosition = token.offset
        }
        let candidates = this.lookupMultiple(
          token.text
        );
        if (token.stem && token.stem !== token.text) {
          candidates = candidates.concat(
            this.lookupMultiple(
              token.stem
            )
          );
        }
        t.push({
          text: token.text,
          candidates,
          pos: token.pos
        })
        lastPosition = lastPosition + token.length
      }
      return t
    }
  },
  async tokenizeBySplitting(text) {
    let t = []
    let segs = text.split(/\s+/)
    for (let seg of segs) {
      let tokenized
      if (this.isHangul(seg)) tokenized = await this.tokenizeWithOpenKoreanText(seg);
      if (tokenized) {
        for (let index in tokenized) {
          let token = tokenized[index]
          let candidates = this.lookupMultiple(
            token.text
          );
          if (token.stem && token.stem !== token.text) {
            candidates = candidates.concat(
              this.lookupMultiple(
                token.stem
              )
            );
          }
          t.push({
            text: token.text,
            candidates,
          })
        }
      } else {
        t.push(seg)
      }
      t.push(' ')
    }
    t.pop()
    return t
  },
}