import axios from 'axios'

export default {
  name: 'klingonska',
  file: undefined,
  dictionary: undefined,
  words: [],
  index: {},
  cache: {},
  tables: [],
  l1: undefined,
  l2: undefined,
  credit() {
    return 'The Klingon dictionary is provided by <a href="http://klingonska.org/dict/">klingonska.org</a>.'
  },
  async loadWords() {
    console.log('Klingonska: Loading words')
    let res = await axios.get(this.file)
    this.words = this.parseDictionary(res.data)
    return this
  },
  parseDictionary(text) {
    this.dictionary = text.split('\n\n')
    let words = []
    for(let block of this.dictionary) {
      let item = {}
      for(let line of block.split('\n')) {
        let pair = line.split(':\t')
        if (pair.length > 0) {
          let key = pair[0]
          let value = pair[1]
          item[key] = value
        }
      }
      if (item.tlh) {
        item.word = item.tlh.replace(/.*\{(.*)\}.*/, '$1') || undefined
        words.push(
          Object.assign(item, {
            bare: item.word,
            head: item.word,
            accented: item.word,
            pronunciation:
                  item.pronunciations && item.pronunciations[0].ipa
                    ? item.pronunciations[0].ipa[0][1].replace(/\//g, '')
                    : undefined,
            definitions: [item.en.replace(/[<>«»]/g, '')],
            pos: item.pos
          })
        )
      }
    }
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
    let filename = 'https://server.chinesezerotohero.com/data/klingonska/dict.zdb.txt'
    return filename
  },
  load(options) {
    console.log('Loading Klingonska...')
    this.l1 = options.l1
    this.l2 = options.l2
    this.file = this.dictionaryFile(options)
    return new Promise(async resolve => {
      let promises = [this.loadWords()]
      await Promise.all(promises)
      resolve(this)
    })
  },
  get(id) {
    return this.words[id]
  },
  lookup(text) {
    let word = this.words.find(
      word => word && word.bare.toLowerCase() === text.toLowerCase()
    )
    return word
  },
  formTable() {
    return this.tables
  },
  stylize(name) {
    return name
  },
  wordForms(word) {
    let forms = [
      {
        table: 'head',
        field: 'head',
        form: word.bare
      }
    ]
    return forms
  },
  lookupByDef(text, limit = 30) {
    text = text.toLowerCase()
    let words = this.words
      .filter(
        word => word.definitions && word.definitions.join(', ').toLowerCase().includes(text)
      )
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
      this.words.filter(function(row) {
        return text.includes(row.head)
      })
    )
  },
  /* Returns the longest word in the dictionary that is inside `text` */
  longest(text) {
    // Only return the *first* seen word and those the same as it
    let first = false
    let matches = this.words
      .filter(function(word) {
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
    return this.tokenizeRecursively(text, this.subdictFromText(text))
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
          for (let token of this.tokenizeRecursively(item, subdict)) {
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
  lookupFuzzy(text, limit = 30) {
    // text = 'abcde'
    text = text.replace('ʼ', '\'').toLowerCase()
    let words = []
    let subtexts = []
    for (let i = 1; text.length - i > 2; i++) {
      subtexts.push(text.substring(0, text.length - i))
    }
    for (let word of this.words) {
      let head = word.head ? word.head.toLowerCase() : undefined
      if (head && head.includes(text)) {
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
        if (head.includes(subtext)) {
          words.push(
            Object.assign(
              { score: subtext.length - (head.length - subtext.length) },
              word
            )
          ) // matches 'abcxyz...'
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
