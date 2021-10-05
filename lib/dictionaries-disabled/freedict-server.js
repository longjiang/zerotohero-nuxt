import axios from 'axios'

export default {
  name: 'freedict',
  file: undefined,
  l1: undefined,  // 'eng', 'zho', ...
  l2: undefined,  // 'fra', 'spa', ...
  server: 'https://server.chinesezerotohero.com/',
  words: [],
  index: {},
  cache: {},
  conjugations: undefined,
  tables: [],
  credit() {
    return 'The dictionary is provided by <a href="https://freedict.org/">FreeDict</a> dict, open-source and <a href="https://freedict.org/about/">freely distribtued</a>.'
  },
  async load(options) {
    console.log('Loading FreeDict...')
    this.l1 = options.l1
    this.l2 = options.l2
    // let server = 'http://hsk-server.local:8888/'
    // let server = 'https://server.chinesezerotohero.com/'
    this.file = this.dictionaryFile(options)
    await this.loadWords()
    await this.loadConjugations()
    return this
  },
  dictionaryFile(options) {
    let filename = `${this.server}data/freedict/${options.l2}-${options.l1}.dict.txt`
    return filename
  },
  getSize() {
    return this.words.length
  },
  async loadWords() {
    let res = await axios.get(this.file)
    this.words = this.parseDictionary(res.data)
  },
  async loadConjugations() {
    if (this.l2 === 'fra') {
      console.log('Loading French conjugations from "french-verbs-lefff"...')
      let res = await axios.get(`${this.server}data/french-verbs-lefff/conjugations.json.txt`)
      if (res && res.data) {
        this.conjugations = res.data
      }
    }
  },
  parseLines(lines) {
    let words = []
    for (let index in lines) {
      index = parseInt(index)
      let english = lines[index]
      let matches = english.match(/(.*) \/(.*)\//)
      if (matches) {
        let matches2 = english.match(/<(.*)>/)
        // Parse definitions (sometimes it's one line, other times it's multiple lines with numeric headings)
        let i = 1
        let isDef = !lines[index + i].match(/(.*) \/(.*)\//)
        let definitions = []
        while (isDef) {
          let def = lines[index + i].replace(/^\d+\./, '').trim()
          if (def !== '') {
            definitions.push(def)
          }
          i = i + 1
          if (lines[index + i]) {
            isDef = !lines[index + i].match(/(.*) \/(.*)\//)
          } else {
            isDef = false
          }
        }
        let pronunciation = matches ? matches[2] : undefined
        let word = {
          bare: matches ? this.stripAccents(matches[1]) : undefined,
          head: matches
            ? matches[1]
            : undefined,
          accented: matches
            ? matches[1]
            : undefined,
          pronunciation: pronunciation,
          definitions: definitions,
          pos: matches2 && matches2.length > 1 ? matches2[1] : undefined
        }
        words.push(word)
      }
    }
    return words
  },
  parseDictionary(text) {
    text = text.replace(/^[^\n]*\n/m, '') // remove title line
    console.log('Parsing FreeDict Dictionary from ' + this.file)
    let lines = text.split('\n')
    let words = []
    words = this.parseLines(lines)
    words = words.sort((a, b) => {
      if (a.head && b.head) {
        return a.head.length - b.head.length
      }
    })
    words = words.map((word, index) => {
      word.id = index
      return word
    })
    return words
  },
  get(id) {
    console.log(this.words[id])
    return this.words[id]
  },
  lookup(text) {
    let word = this.words.find(word => word && word.bare.toLowerCase() === text.toLowerCase())
    return word
  },
  lookupMultiple(text) {
    let words = this.words.filter(word => word && word.bare.toLowerCase() === text.toLowerCase())
    return words
  },
  formTable() {
    return this.tables
  },
  stylize(name) {
    return name
  },
  // https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
  stripAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
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
  unique(a) {
    return a.filter((item, i, ar) => ar.indexOf(item) === i);
  },
  getWordsThatContain(text) {
    let words = this.words.filter(w => (w.head.includes(text)) || (w.bare.includes(text)))
    let strings = words
      .map((word) => word.bare)
      .concat(words.map((word) => word.head))
    return this.unique(strings)
  },
  wordForms(word) {
    let forms = [{
      table: 'head',
      field: 'head',
      form: word.head
    }]
    let fields = {
      0: 'je',
      1: 'tu',
      2: 'il/elle',
      3: 'nous',
      4: 'vous',
      5: 'ils'
    }
    let tables = {
      P: 'présent',
      S: 'subjonctif',
      Y: 'Y',
      I: 'imparfait',
      G: 'gérondif',
      K: 'participe passé',
      J: 'passé simple',
      T: 'subjonctif imparfait',
      F: 'futur',
      C: 'conditionnel présent'
    }
    if (this.conjugations) {
      let conjugations = this.conjugations[word.head]
      if (conjugations) {
        console.log(conjugations)
        for (let key in conjugations) {
          let conj = conjugations[key]
          forms = forms.concat(conj.map((formStr, index) => {
            return {
              table: tables[key],
              field: fields[index],
              form: formStr
            }
          }))
        }
      }
      forms = this.uniqueByValue(forms, 'form').sort((a, b) => a.length - b.length)

    }
    return forms
  },
  lookupByDef(text, limit = 30) {
    text = text.toLowerCase()
    let words = this.words
      .filter(word => word.definitions && word.definitions.join(', ').toLowerCase().includes(text))
      .slice(0, limit)
    return words
  },
  lookupFuzzy(text, limit = 30) { // text = 'abcde'
    text = this.stripAccents(text).toLowerCase()
    let words = []
    let subtexts = []
    for (let i = 1; text.length - i > 2; i++) {
      subtexts.push(text.substring(0, text.length - i))
    }
    for (let word of this.words) {
      if (word.bare && word.bare.includes(text)) {
        words.push(Object.assign({ score: text.length - (word.bare.length - text.length) }, word)) // matches 'abcde', 'abcde...'
      }
      if (word.bare && text.includes(word.bare)) {
        words.push(Object.assign({ score: word.bare.length }, word)) // matches 'cde', 'abc'
      }
      for (let subtext of subtexts) {
        if (word.bare.includes(subtext)) {
          words.push(Object.assign({ score: subtext.length - (word.bare.length - subtext.length) }, word)) // matches 'abcxyz...'
        }
      }
    }
    return words.sort((a, b) => b.score - a.score).slice(0, limit)
  },
  randomArrayItem(array, start = 0, length = false) {
    length = length || array.length
    array = array.slice(start, length)
    let index = Math.floor(Math.random() * array.length)
    return array[index]
  },
  //https://stackoverflow.com/questions/2532218/pick-random-property-from-a-javascript-object
  randomProperty(obj) {
    var keys = Object.keys(obj)
    return obj[keys[(keys.length * Math.random()) << 0]]
  },
  random() {
    return this.randomProperty(this.words)
  },
  accent(text) {
    return text.replace(/'/g, '́')
  }
}