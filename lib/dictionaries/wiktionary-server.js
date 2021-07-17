import axios from 'axios'
import Papa from 'papaparse'
import FastestLevenshtein from 'fastest-levenshtein'

export default {
  name: 'wiktionary',
  file: undefined,
  dictionary: undefined,
  words: [],
  index: {},
  cache: {},
  tables: [],
  NlpjsTFrDict: {},
  useJSON: [],
  server: 'https://server.chinesezerotohero.com/',
  l1: undefined,
  l2: undefined,
  credit() {
    return 'The dictionary is provided by <a href="https://en.wiktionary.org/wiki/Wiktionary:Main_Page">Wiktionary</a>, which is freely distribtued under the <a href="https://creativecommons.org/licenses/by-sa/3.0/">Creative Commons Attribution-ShareAlike License</a>. The dictionary is parsed by <a href="https://github.com/tatuylonen/wiktextract">wiktextract</a>.'
  },
  dictionaryFile({
    l1 = undefined,
    l2 = undefined
  } = {}) {
    if (l1 && l2) {
      l2 = l2.replace('nor', 'nob') // Default Norwegian to Bokmål
        .replace('hrv', 'hbs') // Serbian uses Serbo-Croatian
        .replace('srp', 'hbs') // Croatian uses Serbo-Croatian
        .replace('bos', 'hbs') // Bosnian uses Serbo-Croatian
        .replace('run', 'kin') // Rundi uses Rwanda-Rundi
        .replace('hbo', 'heb') // Ancient Hebrew uses Hebrew
        .replace('grc', 'ell') // Ancient Greek uses Greek
      let csv = !this.useJSON.includes(this.l2)
      let filename = `${this.server}data/wiktionary${csv ? '-csv' : ''}/${l2}-${l1}.${csv ? 'csv' : 'json'}.txt`
      return filename
    }
  },
  async load({
    l1 = undefined,
    l2 = undefined
  } = {}) {
    if (l1 && l2) {
      this.l1 = l1
      this.l2 = l2
      this.file = this.dictionaryFile({ l1, l2 })
      let words = await this.loadWords(this.file)
      if (l1 === 'eng' && l2 === 'msa') {
        // Append indonesian words to malay dictionary so we get more words
        let indonesianWords = await this.loadWords(this.dictionaryFile({ l1, l2: 'ind' }))
        for (let w of indonesianWords) {
          w.id = 'ind-' + w.id
          w.supplementalLang = 'ind'
        }
        words = words.concat(indonesianWords)
        words = words.sort((a, b) => {
          if (a.head && b.head) {
            return b.head.length - a.head.length
          }
        })
      }
      this.words = words
      if (this.l2 === 'fra') await this.loadFrenchConjugationsAndLemmatizer()
      console.log("Wiktionary: loaded.")
      return this

    }
  },
  async loadWords(file) {
    console.log(`Wiktionary: loading ${file}`)
    let res = await axios.get(file)
    let words = !this.useJSON.includes(this.l2) ? this.parseDictionaryCSV(res.data) : this.parseDictionary(res.data)

    words = words.sort((a, b) => {
      if (a.head && b.head) {
        return b.head.length - a.head.length
      }
    })
    words = words.map((word, index) => {
      word.id = String(index)
      return word
    })
    console.log(`Wiktionary: ${file} loaded.`)
    return words
  },
  async loadConjugations() {
    if (this.l2 === 'fra') {
      console.log('Loading French conjugations from "french-verbs-lefff"...')
      let res = await axios.get(`${this.server}data/french-verbs-lefff/conjugations.json.txt`)
      if (res && res.data) {
        this.conjugations = res.data
      }
      console.log('Loading French tokenizer...')
    }
  },
  parseDictionary(data) {
    console.log("Wiktionary: parsing words from JSON...")
    this.dictionary = data
    let words = []
    for (let item of this.dictionary) {
      if (item.word && !item.redirect) {
        let definitions = []
        let stems = []
        if (item.senses && item.senses[0]) {
          for (let sense of item.senses) {
            if (sense.glosses) {
              if (!sense.complex_inflection_of) {
                definitions.push(sense.glosses[0])
                if (sense.form_of) {
                  let stem = this.normalizeStem(sense.form_of[0])
                  stems.push(stem)
                }
              } else {
                // definitions.concat(this.inflections(sense)) // Probably not that useful in practice.
              }
            }
          }
        }
        if (item.forms) stems = stems.concat(item.forms.map(f => this.normalizeStem(f.form)))
        if (definitions.length > 0) {
          let audio = undefined
          if (item.sounds) {
            for (let pronunciation of item.sounds) {
              if (pronunciation.audio) {
                audio = pronunciation.audio
              }
            }
          }
          let bare = this.stripAccents(item.word)
          words.push(Object.assign(item, {
            bare,
            search: bare.toLowerCase(),
            head: item.word,
            accented: item.word,
            pronunciation: item.sounds && item.sounds.length > 0 ? item.sounds.filter(s => s.ipa).map(s => s.ipa.replace(/[/\[\]]/g, '')).join(', ') : undefined,
            audio: audio,
            definitions: definitions,
            pos: item.pos,
            stems: stems.filter(s => s !== item.word),
            phrases: item.derived ? item.derived.map(d => d.word) : [],
            wiktionary: true
          }))
        } else {
          // definitions.push(this.blankInflection(item))
          // probably not that useful in practice
        }
      }
    }
    return words
  },
  parseDictionaryCSV(data) {
    console.log("Wiktionary: parsing words from CSV...")
    let parsed = Papa.parse(data, { header: true })
    let words = parsed.data
    words = words.map(item => {
      item.bare = this.stripAccents(item.word)
      item.search = item.bare.toLowerCase(),
        item.head = item.word
      item.accented = item.word
      delete item.word
      item.wiktionary = true
      item.definitions = item.definitions ? item.definitions.split('|') : []
      item.stems = item.stems ? item.stems.split('|') : []
      item.phrases = item.phrases ? item.phrases.split('|') : []
      return item
    })
    return words
  },
  inflections(sense) {
    let definitions = []
    for (let inflection of sense.complex_inflection_of) {
      let head = inflection['1'] || inflection['2']
      if (head) {
        definitions.push(`${inflection['3']} ${inflection['4']} ${inflection['5']} inflection of <a href="https://en.wiktionary.org/wiki/${head}" target="_blank">${head}</a>`)
      }
    }
    return definitions
  },
  blankInflection(item) {
    `(inflected form, see <a href="https://en.wiktionary.org/wiki/${item.word}" target="_blank">Wiktionary</a> for details)`
  },
  lemmaFromDefinition(definition) {
    definition = definition.replace(/\(.*\)/g, '').trim()
    let m = definition.match(/(.* of )([^\s\.]+)$/);
    if (m) {
      let lemma = m[2].replace(/\u200e/g, ""); // Left-to-Right Mark
      return lemma
    }
  },
  exportCSV() {
    console.log('Exporting CSV...')
    let csv = Papa.unparse(this.words.map(item => {
      return {
        word: item.word,
        pronunciation: item.pronunciation,
        audio: item.audio,
        definitions: item.definitions.join('|'),
        pos: item.pos,
        stems: item.stems.join('|'),
        phrases: item.phrases.join('|')
      }
    }))
    console.log('CSV exported.')
    return csv
  },
  normalizeStem(stemStr) {
    stemStr = stemStr.replace(/ \(.*\)/, '').replace(/ \[\[.*\]\]/g, '')
    if (this.l2 === 'heb') {
      stemStr = stemStr.split(/ \u000092 /)[0]
      stemStr = this.stripHebrewVowels(stemStr.replace(/\u200e/gi, ''))
    }
    return stemStr.trim()
  },
  get(id) {
    return this.words.find(word => word.id === id)
  },
  lookup(text) {
    let word = this.words.find(word => word && word.bare.toLowerCase() === text.toLowerCase())
    return word
  },
  lookupMultiple(text) {
    let words = this.words.filter(word => word && word.head.toLowerCase() === text.toLowerCase())
    return words
  },
  formTable() {
    return this.tables
  },
  stylize(name) {
    return name
  },
  wordForms(word) {
    let forms = [{
      table: 'head',
      field: 'head',
      form: word.head
    }]
    if (this.l2 === 'fra') forms = forms.concat(this.frenchWordForms(word))
    return forms
  },
  getSize() {
    return this.words.length
  },
  frenchWordForms(word) {
    let forms = []
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
        for (let key in conjugations) {
          let conj = conjugations[key]
          forms = forms.concat(conj.filter(formStr => formStr !== 'NA').map((formStr, index) => {
            return {
              table: tables[key],
              field: fields[index],
              form: formStr
            }
          }))
        }
      }
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
    if (this.l2 === 'spa') {
      return this.tokenizeSpanish(text)
    } else {
      let tokenized = this.tokenizeRecursively(
        text,
        this.subdictFromText(text)
      )
      return tokenized
    }
  },
  splitByReg(text, reg) {
    let words = text.replace(reg, '!!!BREAKWORKD!!!$1!!!BREAKWORKD!!!').replace(/^!!!BREAKWORKD!!!/, '').replace(/!!!BREAKWORKD!!!$/, '')
    return words.split('!!!BREAKWORKD!!!')
  },
  tokenizeRecursively(text, subdict) {
    const longest = subdict.longest(text)
    if (longest.matches.length > 0) {
      let result = []
      /* 
      result = [
        '我', 
        {
          text: '是'
          candidates: [{...}, {...}, {...}
        ],
        '中国人。'
      ]
      */
      for (let textFragment of text.split(longest.text)) {
        result.push(textFragment) // '我'
        result.push({
          text: longest.text,
          candidates: longest.matches
        })
      }
      result = result.filter(item => item !== '')
      result.pop() // last item is always useless, remove it
      var tokens = []
      for (let item of result) {
        if (typeof item === 'string') {
          for (let token of this.tokenizeRecursively(
            item,
            subdict
          )) {
            tokens.push(token)
          }
        } else {
          tokens.push(item)
        }
      }
      return tokens
    } else {
      return [text]
    }
  },
  // https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
  stripAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  },
  stemWords(word, score = undefined) {
    if (word.stems.length > 0) {
      let stemWords = []
      for (let s of word.stems) {
        stemWords = stemWords.concat(this.lookupMultiple(s))
      }
      stemWordsWithScores = stemWords.map(w => Object.assign({ score: score }, w))
      return stemWordsWithScores
    } else return []
  },
  phrases(word, score = undefined) {
    if (word.phrases.length > 0) {
      let phrases = []
      for (let s of word.phrases) {
        phrases = phrases.concat(this.lookupMultiple(s))
      }
      phrasesWithScores = phrases.map(w => Object.assign({ score: score }, w))
      return phrasesWithScores
    } else return []
  },
  lookupFuzzy(text, limit = 30) { // text = 'abcde'
    if (this.l2 !== 'vie') text = this.stripAccents(text)
    text = text.toLowerCase()
    let words = []
    if (['fra'].includes(this.l2)) {
      words = this.words.filter(word => word.search === text).map(w => Object.assign({ score: 1 }, w))
      let stems = this.findStems(text)
      if (stems.length > 0) {
        let stemWords = this.stringsToWords(stems)
        let stemWordsWithScores = stemWords.map(w => Object.assign({ score: 1 }, w))
        words = words.concat(stemWordsWithScores)
      }
    }
    if (words.length === 0) {
      for (let word of this.words) {
        let search = word.search ? word.search : undefined
        if (search) {
          let distance = FastestLevenshtein.distance(search, text);
          let max = Math.max(text.length, search.length)
          let similarity = (max - distance) / max
          words.push(Object.assign({ score: similarity }, word))
          if (similarity === 1) {
            words = words.concat(this.stemWords(word, 1))
            words = words.concat(this.phrases(word, 1))
          }
        }
      }
    }
    words = words.sort((a, b) => b.score - a.score)
    words = this.uniqueByValue(words, 'id').slice(0, limit)
    return words
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
  },

  /*
  * https://gist.github.com/yakovsh/345a71d841871cc3d375
  /* @shimondoodkin suggested even a much shorter way to do this */
  stripHebrewVowels(rawString) {
    return rawString.replace(/[\u0591-\u05C7]/g, "")
  },
}