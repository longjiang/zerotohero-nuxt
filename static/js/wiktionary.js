importScripts('../vendor/string-similarity/string-similarity.js')

const Dictionary = {
  name: 'wiktionary',
  file: undefined,
  dictionary: undefined,
  words: [],
  index: {},
  cache: {},
  tables: [],
  useCSV: ['fra'],
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
    const server = 'https://server.chinesezerotohero.com/'
    let csv = this.useCSV.includes(this.l2)
    let filename = `${server}data/wiktionary${csv ? '-csv' : ''}/${l2}-${options.l1}.${csv ? 'csv' : 'json'}.txt`
    return filename
  },
  async load(options) {
    this.l1 = options.l1
    this.l2 = options.l2
    this.file = this.dictionaryFile(options)
    await this.loadWords()
    return this
  },
  async loadWords() {
    console.log("Wiktionary: loading...")
    let res = await axios.get(this.file)
    let words = this.useCSV.includes(this.l2) ? this.parseDictionaryCSV(res.data) : this.parseDictionary(res.data)

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
          words.push(Object.assign(item, {
            bare: this.stripAccents(item.word),
            head: item.word,
            accented: item.word,
            pronunciation: undefined,
            pronunciation: item.sounds && item.sounds.length > 0 ? item.sounds.filter(s => s.ipa).map(s => s.ipa.replace(/[/\[\]]/g, '')).join(', ') : undefined,
            audio: audio,
            definitions: definitions,
            pos: item.pos,
            stems: stems.filter(s => s !== item.word),
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
      item.head = item.word
      item.accented = item.word
      delete item.word
      item.wiktionary = true
      item.definitions = item.definitions ? item.definitions.split('|') : []
      item.stems = item.stems ? item.stems.split('|') : []
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
  wordForms(word) {
    let forms = [{
      table: 'head',
      field: 'head',
      form: word.bare
    }]
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
    return this.tokenizeRecursively(
      text,
      this.subdictFromText(text)
    )
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
  lookupFuzzy(text, limit = 30) { // text = 'abcde'
    text = this.stripAccents(text.toLowerCase())
    if (['he', 'hbo', 'iw'].includes(this.l2)) text = this.stripHebrewVowels(text)
    let words = this.words.filter(w => w.bare && w.bare === text)

    if (words.length > 0) {
      let returnWords = []
      for (let word of words) {
        returnWords.push(Object.assign(
          { score: 1 },
          word
        ))
        returnWords = returnWords.concat(this.stemWords(word, 1))
      }
      words = returnWords
    } else {
      for (let word of this.words) {
        let bare = word.bare ? word.bare.toLowerCase() : undefined
        let similarity = stringSimilarity.compareTwoStrings(bare, text);
        if (similarity > 0.5) {
          words.push(Object.assign({ score: similarity }, word))
        }
      }
    }
    words = this.uniqueByValue(words, 'id').sort((a, b) => b.score - a.score).slice(0, limit)
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