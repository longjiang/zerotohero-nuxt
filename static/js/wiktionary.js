importScripts('../vendor/fastest-levenshtein/fastest-levenshtein.js')

const Dictionary = {
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
  dictionaryFile(options) {
    let l2 = options.l2.replace('nor', 'nob') // Default Norwegian to Bokmål
      .replace('hrv', 'hbs') // Serbian uses Serbo-Croatian
      .replace('srp', 'hbs') // Croatian uses Serbo-Croatian
      .replace('bos', 'hbs') // Bosnian uses Serbo-Croatian
      .replace('run', 'kin') // Rundi uses Rwanda-Rundi
      .replace('hbo', 'heb') // Ancient Hebrew uses Hebrew
      .replace('grc', 'ell') // Ancient Greek uses Greek
    let csv = !this.useJSON.includes(this.l2)
    let filename = `${this.server}data/wiktionary${csv ? '-csv' : ''}/${l2}-${options.l1}.${csv ? 'csv' : 'json'}.txt`
    return filename
  },
  async load(options) {
    this.l1 = options.l1
    this.l2 = options.l2
    this.file = this.dictionaryFile(options)
    await this.loadWords()
    if (this.l2 === 'fra') await this.loadFrenchConjugationsAndLemmatizer()
    return this
  },
  async loadWords() {
    console.log("Wiktionary: loading...")
    let res = await axios.get(this.file)
    let words = !this.useJSON.includes(this.l2) ? this.parseDictionaryCSV(res.data) : this.parseDictionary(res.data)

    words = words.sort((a, b) => {
      if (a.head && b.head) {
        return b.head.length - a.head.length
      }
    })
    words = words.map((word, index) => {
      word.id = index
      return word
    })
    this.words = words
    console.log("Wiktionary: loaded.")
  },
  async loadFrenchConjugationsAndLemmatizer() {
    console.log('Loading French conjugations from "french-verbs-lefff"...')
    let res = await axios.get(`${this.server}data/french-verbs-lefff/conjugations.json.txt`)
    if (res && res.data) {
      this.conjugations = res.data
    }
    console.log('Loading French tokenizer...')
    importScripts('../vendor/nlp-js-tools-french/nlp-js-tools-french.js')
    for (let key of ['adj',
      'adv',
      'art',
      'con',
      'nom',
      'ono',
      'pre',
      'ver',
      'pro']) {
      let res = await axios.get(`/vendor/nlp-js-tools-french/dict/${key.replace('con', 'conj')}.json`)
      let lexi = res.data
      this.NlpjsTFrDict[key] = { lexi }
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
        if (definitions.length > 0) {
          let audio = undefined
          if (item.sounds) {
            for (let pronunciation of item.sounds) {
              if (pronunciation.audio) {
                audio = pronunciation.audio
              }
            }
          }
          let bare = this.l2 !== 'vie' ? this.stripAccents(item.word) : item.word
          let word = {
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
          }
          words.push(Object.assign(item, word))
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
      item.bare = this.l2 !== 'vie' ? this.stripAccents(item.word) : item.word
      item.search = item.bare.toLowerCase(),
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
    return this.words[id]
  },
  lookup(text) {
    let word = this.words.find(word => word && word.bare.toLowerCase() === text.toLowerCase())
    return word
  },
  lookupMultiple(text, ignoreAccents = false) {
    if (ignoreAccents && this.l2 !== 'vie') text = this.stripAccents(text)
    let words = this.words.filter(word => word && word[ignoreAccents ? 'bare' : 'head'].toLowerCase() === text.toLowerCase())
    return words
  },
  formTable() {
    return this.tables
  },
  stylize(name) {
    return name
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
  wordForms(word) {
    let forms = [{
      table: 'head',
      field: 'head',
      form: word.head
    }]
    if (this.l2 === 'fra') forms = forms.concat(this.frenchWordForms(word))
    else if (this.l2 !== 'vie') forms = forms.concat(this.findForms(word))
    forms = this.uniqueByValues(forms, ['table', 'field', 'form'])
    return forms
  },
  lemmaFromDefinition(definition) {
    let m = definition.match(/(.* of )([^\s\.]+)(.*)/);
    if (m) {
      let lemma = m[2].replace(/\u200e/g, ""); // Left-to-Right Mark
      return lemma
    }
  },
  findForms(word) {
    let heads = [word.head]
    let forms = []
    if (word.stems && word.stems[0]) {
      forms = forms.concat(word.stems.map(s => {
        return {
          table: 'lemma',
          field: 'lemma',
          form: s
        }
      }))
    }
    let words = this.words.filter(w => {
      let found = w.stems.filter(s => heads.includes(s))
      return found.length > 0
    })
    let moreForms = []
    for (let w of words) {
      for (let d of w.definitions) {
        let lemma = this.lemmaFromDefinition(d)
        for (let head of heads) {
          if (head === lemma) {
            field = d.replace(new RegExp(`of ${head}.*`), '').trim()
            field = field.replace(/form$/, '').trim()
            let table = field.replace(/.*?([^\s]+)$/, "$1").trim()
            if (table.includes(')')) table = ''
            if (table === 'A') table = ''
            if (table === '') {
              table = 'inflected'
              field = field.replace('A(n) ', '').replace('A', 'inflected') + " form"
            }
            else field = field.replace(table, '')
            if (field === 'A') field = 'inflected'
            let form = {
              table,
              field: field ? field : table,
              form: w.head
            }
            moreForms.push(form)
          }
        }
      }
    }
    forms = forms.concat(moreForms)
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
      .sort((a, b) => a.bare.length - b.bare.length)
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
    let search = text.toLowerCase()
    if (this.l2 !== 'vie') search = this.stripAccents(search)
    let words = this.words.filter(function (row) {
      if (this.l2 === 'vie') {
        return text.includes(row.head) || search.includes(row.head)
      } else {
        return text.includes(row.head) || search.includes(row.search)
      }
    })
    return this.subdict(words)
  },
  /* Returns the longest word in the dictionary that is inside `text` */
  longest(text) {
    // Only return the *first* seen word and those the same as it
    let first = false
    let search = text.toLowerCase()
    if (this.l2 !== 'vie') search = this.stripAccents(search)

    let matchedText

    let matches = this.words
      .filter(function (word) {
        if (first) {
          return word.head === first
        } else {
          let matchedIndex = search.indexOf(word.search)


          if (matchedIndex !== -1) {
            first = word.head

            matchedText = text.slice(matchedIndex, matchedIndex + word.search.length)
            return true
          }
        }
      })
      .sort((a, b) => {
        return b.head.length - a.head.length
      })
    return {
      matches: matches,
      text: matchedText
    }
  },
  tokenize(text) {
    if (this.l2 === 'fra') {
      return this.tokenizeFrench(text)
    } else if (this.l2 === 'spa') {
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
        if (typeof item === 'string' && item !== text) {
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
    str = str.normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Accents
      .replace(/[\u0600-\u0620\u064b-\u0655]/g, "") // Arabic diacritics
    if (['he', 'hbo', 'iw'].includes(this.l2)) str = this.stripHebrewVowels(str)
    return str
  },
  stringsToWords(strings) {
    let words = []
    for (let s of strings) {
      words = words.concat(this.lookupMultiple(s))
    }
    return words
  },
  stemWords(word, score = undefined) {
    if (word.stems.length > 0) {
      let stemWords = this.stringsToWords(word.stems)
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
  unique(a) {
    return a.filter((item, i, ar) => ar.indexOf(item) === i);
  },
  findStems(text) {
    let word = text.toLowerCase();
    if (this.l2 === 'fra') {
      let tokenizer = new NlpjsTFr(this.NlpjsTFrDict, text);
      var lemmas = tokenizer.lemmatizer()
      var flattend = this.unique([word].concat(lemmas.map(l => l.lemma)))
      return flattend
    } else {
      return []
    }
  },
  lookupFuzzy(text, limit = 30) { // text = 'abcde'
    if (this.l2 !== 'vie') text = this.stripAccents(text)
    text = text.toLowerCase()
    let words = []
    if (['fra'].includes(this.l2)) {
      let stems = this.findStems(text)
      if (stems.length > 0) {
        let stemWords = this.stringsToWords(stems)
        let stemWordsWithScores = stemWords.map(w => Object.assign({ score: 1 }, w))
        words = words.concat(stemWordsWithScores)
        words = this.words.filter(word => word.search === text).map(w => Object.assign({ score: 0.9 }, w))
      }
    }
    if (words.length === 0) {
      for (let word of this.words) {
        let search = word.search ? word.search : undefined
        if (search) {
          let distance = FastestLevenshtein.distance(search, text);
          let max = Math.max(text.length, search.length)
          let similarity = (max - distance) / max
          if (similarity > 0.5) {
            words.push(Object.assign({ score: similarity }, word))
          }
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