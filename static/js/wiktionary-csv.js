const Dictionary = {
  name: 'wiktionary',
  file: undefined,
  words: [],
  index: {},
  cache: {},
  tables: [],
  l1: undefined,
  l2: undefined,
  credit() {
    return 'The dictionary is provided by <a href="https://en.wiktionary.org/wiki/Wiktionary:Main_Page">Wiktionary</a>, which is freely distribtued under the <a href="https://creativecommons.org/licenses/by-sa/3.0/">Creative Commons Attribution-ShareAlike License</a>. The dictionary is parsed by <a href="https://github.com/tatuylonen/wiktextract">wiktextract</a>.'
  },
  async loadWords() {
    let res = await axios.get(this.file)
    this.words = this.parseDictionary(res.data)
    console.log(this.words)
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
  parseDictionary(data) {
    let parsed = Papa.parse(data, {header: true})
    let words = parsed.data
    words = words.map(item => {
      item.bare = item.word
      item.head = item.word
      item.accented = item.word
      item.word = undefined
      item.wiktionary = true
      item.definitions = item.definitions ? item.definitions.split(';') : undefined
      return item
    })
    words = words.sort((a, b) => {
      if (a.head && b.head) {
        return b.head.length - a.head.length
      }
    })
    words = words.map((word, index) => {
      word.id = index
      return word
    })
    return words
  },
  dictionaryFile(options) {
    let l2 = options.l2.replace('nor', 'nob') // Default Norwegian to Bokmål
      .replace('hrv', 'hbs') // Serbian uses Serbo-Croatian
      .replace('srp', 'hbs') // Croatian uses Serbo-Croatian
      .replace('bos', 'hbs') // Bosnian uses Serbo-Croatian
      .replace('run', 'kin') // Rundi uses Rwanda-Rundi
      .replace('hbo', 'heb') // Ancient Hebrew uses Hebrew
    const server = 'https://server.chinesezerotohero.com/'
    let filename = `${server}data/wiktionary-csv/${l2}-${options.l1}.csv.txt`
    return filename
  },
  async load(options) {
    console.log('Loading Wiktionary...')
    this.l1 = options.l1
    this.l2 = options.l2
    this.file = this.dictionaryFile(options)
    await this.loadWords()
    return this
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
  lookupFuzzy(text, limit = 30) { // text = 'abcde'
    text = text.toLowerCase()
    if (['he', 'hbo', 'iw'].includes(this.l2)) text = this.stripHebrewVowels(text)
    let words = []
    let subtexts = []
    for (let i = 1; text.length - i > 2; i++) {
      subtexts.push(text.substring(0, text.length - i))
    }
    for (let word of this.words) {
      let head = word.head ? word.head.toLowerCase() : undefined
      if (head && head.startsWith(text)) {
        words.push(
          Object.assign(
            { score: text.length - (head.length - text.length) },
            word
          )
        ) // matches 'abcde', 'abcde...'
      }
      if (head && text.includes(head)) {
        words.push(Object.assign({ score: head.length }, word)) // matches 'cde', 'abc'
      }
      for (let subtext of subtexts) {
        if (head && head.includes(subtext)) {
          words.push(
            Object.assign(
              { score: subtext.length - (head.length - subtext.length) },
              word
            )
          ) // matches 'abcxyz...'
        }
      }
    }
    return this.uniqueByValue(words, 'id').sort((a, b) => b.score - a.score).slice(0, limit)
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