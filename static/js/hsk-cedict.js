const Dictionary = {
  file: undefined,
  characterFile: undefined,
  newHSKFile: undefined,
  words: [],
  characters: [],
  newHSK: [],
  _maxWeight: 0,
  credit() {
    return 'The Chinese dictionary is provided by <a href="https://www.mdbg.net/chinese/dictionary?page=cedict">CC-CEDICT</a>, open-source and distribtued under a <a href="https://creativecommons.org/licenses/by-sa/4.0/">Creative Commons Attribution-ShareAlike 4.0 International License</a>. We also added HSK information on top.'
  },
  load() {
    const server = 'https://server.chinesezerotohero.com/'
    this.file = `${server}/data/hsk-cedict/hsk_cedict.csv.txt`
    this.characterFile = `${server}/data/hsk-cedict/hsk_characters.csv.txt`
    this.newHSKFile = `${server}/data/hsk-cedict/new_hsk.csv.txt`
    // const server =  `${process.env.baseUrl}/`
    return new Promise(resolve => {
      let wordsPromise = new Promise(resolve => {
        axios.get(this.file).then(response => {
          let results = Papa.parse(response.data, {
            header: true
          })
          this.words = results.data.map(row => this.augment(row))
            .sort((a, b) => b.simplified.length - a.simplified.length)
          for (let row of this.words) {
            row.rank = row.weight / this._maxWeight
          }
          resolve()
        })
      })
      let characterPromise = new Promise(resolve => {
        axios.get(this.characterFile).then(response => {
          let results = Papa.parse(response.data, {
            header: true
          })
          this.characters = results.data
          resolve()

        })
      })
      let newHSKPromise = new Promise(resolve => {
        axios.get(this.newHSKFile).then(response => {
          let results = Papa.parse(response.data, {
            header: true,
            delimiter: ','
          })
          this.newHSK = results.data
          resolve()
        })
      })
      Promise.all([wordsPromise, characterPromise, newHSKPromise]).then(() => resolve(this))
    })
  },
  getWords() {
    return this.words
  },
  getWordsThatContain(text) {
    let words = this.words.filter(w => (w.simplified && w.simplified.includes(text)) || (w.traditional && w.traditional.includes(text)))
    let strings = this.unique(
      words
        .map((word) => word.simplified)
        .concat(words.map((word) => word.traditional))
    )
    return strings
  },
  getWordsWithCharacter(term) {
    let words = this.lookupFuzzySimple(term)
    words = words.filter((word) => word.simplified.length > 1)
    return this.unique(
      words
        .map((word) => word.simplified)
        .concat(words.map((word) => word.traditional))
    )
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
  stylize(name) {
    return name
  },
  accent(text) {
    return text
  },
  getNewHSK() {
    if (this.newHSKCrunched) return this.newHSKCrunched
    else {
      let newHSK = this.newHSK
      let newHSKWordsFlattened = newHSK.reduce(
        (previousValue, currentValue) => previousValue + currentValue.simplified,
        ""
      );
      let subdict = this.subdictFromText(newHSKWordsFlattened)
      for (let word of newHSK) {
        let ws = subdict.lookupSimplified(word.simplified);
        if (ws) {
          let w = ws[0];
          word.hsk = w.hsk;
          word.pinyin = w.pinyin;
          word.id = w.id;
          if (w.definitions) {
            word.definitions = w.definitions
              .filter((def) => !def.startsWith("CL"))
              .join("; ");
          }
        }
      }
      this.newHSKCrunched = newHSK
      return this.newHSKCrunched
    }
  },
  getByNewHSK(level, num) {
    let match = this.newHSK.find(word => word.level === level && Number(word.num) === num)
    let words = this.lookupSimplified(match.simplified, match.pinyin, match.definitions)
    if (words.length === 0) words = this.lookupSimplified(match.simplified, match.pinyin)
    if (words.length === 0) words = this.lookupSimplified(match.simplified)
    if (words && words.length > 0) {
      return words[0]
    }
  },
  getNewLevel(word) {
    return this.newHSK.filter(row => row.simplified === word.simplified && row.pinyin == word.pinyin && row.definitions.includes(word.definitions[0]))
  },
  unique(names) {
    var uniqueNames = []
    $.each(names, function (i, el) {
      if ($.inArray(el, uniqueNames) === -1) uniqueNames.push(el)
    })
    return uniqueNames
  },
  addNewHSK(word) {
    let newHSKMatches = this.getNewLevel(word) || []
    let newHSK = this.unique(newHSKMatches.map(word => word.level)).join('/')
    return Object.assign(word, {
      newHSKMatches,
      newHSK
    })
  },
  unique(array) {
    var uniqueArray = []
    for (let i in array) {
      if (!uniqueArray.includes(array[i])) uniqueArray.push(array[i])
    }
    return uniqueArray
  },
  getByHSKId(hskId) {
    let word = this.words.find(row => row.hskId === hskId)
    return this.addNewHSK(word)
  },
  get(id) {
    let word = this.words.find(row => row.id === id)
    return this.addNewHSK(word)
  },
  getByBookLessonDialog(book, lesson, dialog) {
    return this.words.filter(
      row =>
        parseInt(row.book) === parseInt(book) &&
        parseInt(row.lesson) === parseInt(lesson) &&
        row.dialog.toString() === dialog.toString()
    )
  },
  // https://www.consolelog.io/group-by-in-javascript/
  groupArrayBy(array, prop) {
    return array.reduce(function (groups, item) {
      const val = item[prop]
      groups[val] = groups[val] || []
      groups[val].push(item)
      return groups
    }, {})
  },
  compileBooks() {
    var books = this.groupArrayBy(this.words.filter(row => row.book), 'book')
    for (var book in books) {
      books[book] = this.groupArrayBy(books[book], 'lesson')
      for (var lesson in books[book]) {
        books[book][lesson] = this.groupArrayBy(books[book][lesson], 'dialog')
      }
    }
    return books
  },
  lookupByLesson(level, lesson) {
    level = String(level)
    lesson = String(lesson)
    return this.words.filter(row => row.hsk === level && row.lesson === lesson)
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
  removeTones(pinyin) {
    return pinyin.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  },
  lookupFuzzySimple(text) {
    return this.words.filter(word => word.bare.includes(text))
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
      results = results.map(word => this.addNewHSK(word))
      results = results.map(word => {
        let score = shortest / word.simplified.length - 0.1 + (word.weight / maxWeight * 0.1)
        return Object.assign({ score }, word)
      })
      return results
    }
  },
  lookup(text) {
    let results = this.lookupSimplified(text) || this.lookupTraditional(text)
    if (results.length > 0) {
      return results[0]
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
  lookupMultiple(text) {
    let results = this.lookupSimplified(text).concat(this.lookupTraditional(text))
    return this.uniqueByValue(results, 'id')
  },
  lookupByCharacter(char) {
    return this.words.filter(row => row.simplified.includes(char))
  },
  lookupPinyinFuzzy(pinyin) {
    return this.words.filter(
      row =>
        this.removeTones(row.pinyin).replace(/ /g, '') ===
        this.removeTones(pinyin).replace(/ /g, '')
    )
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
    let rand = this.randomProperty(this.words)
    return rand
  },
  lookupSimplified(simplified, pinyin = false, definitions = false) {
    const candidates = this.words
      .filter(row => {
        let pinyinMatch = pinyin ? row.pinyin === pinyin : true
        let defMatch = definitions ? definitions.includes(row.definitions[0]) : true
        return pinyinMatch && defMatch && row.simplified === simplified
      })
      .sort((a, b) => {
        return b.weight - a.weight
      })
    return candidates.map(candidate => this.addNewHSK(candidate))
  },
  lookupTraditional(traditional, pinyin = false) {
    const candidates = this.words
      .filter(row => {
        let pinyinMatch = true
        if (pinyin.length > 0) {
          pinyinMatch = row.pinyin === pinyin
        }
        return pinyinMatch && row.traditional === traditional
      })
      .sort((a, b) => {
        return b.weight - a.weight
      })
    return candidates.map(candidate => this.addNewHSK(candidate))
  },
  lookupByPattern(pattern) {
    // pattern like '～体'
    var results = []
    if (pattern.includes('～')) {
      const regexPattern = '^' + pattern.replace(/～/gi, '.+') + '$'
      const regex = new RegExp(regexPattern)
      results = this.words.filter(
        word =>
          regex.test(word.simplified) &&
          word.oofc === '' &&
          word.hsk != 'outside'
      )
    } else {
      results = this.words.filter(
        word =>
          word.simplified.includes(pattern) &&
          word.oofc === '' &&
          word.hsk != 'outside'
      )
    }
    return results
  },
  augment(row) {
    if (row.definitions.includes('surname ') || row.definitions.startsWith('variant') || row.definitions.startsWith('old variant') || row.traditional.startsWith('妳')) {
      row.weight = -1
    }
    let definitions = row.definitions.split('/')
    let pos
    if (definitions[0]) {
      if (definitions[0].startsWith('to ')) pos = 'verb'
      if (definitions[0].startsWith('surname ') || /^[A-Z].*/.test(definitions[0])) pos = 'proper noun'
    }
    let augmented = Object.assign(row, {
      id: `${row.traditional},${row.pinyin.replace(/ /g, '_')},${row.index}`,
      bare: row.simplified,
      head: row.simplified,
      accented: row.simplified,
      weight: Number(row.weight),
      cjk: {
        canonical:
          row.traditional && row.traditional !== 'NULL'
            ? row.traditional
            : undefined,
        phonetics: row.pinyin
      },
      pronunciation: row.pinyin,
      definitions,
      search: this.removeTones(row.pinyin.replace(/ /g, '')),
      level: row.hsk,
      pos
    })
    for (let definition of augmented.definitions) {
      definition = definition.replace(/\[.*\] /g, '')
      if (definition.startsWith('CL')) {
        let counters = definition.replace('CL:', '').split(',')
        let cs = []
        for (let counter of counters) {
          let c = {
            pinyin: counter.replace(/.*\[(.*)\]/, '$1'),
          }
          let t = counter.replace(/\[(.*)\]/, '').split('|')
          c.simplified = t[t.length - 1]
          c.traditional = t[0]
          cs.push(c)
        }
        augmented.counters = cs
        if (!augmented.pos) augmented.pos = 'noun'
      }
    }
    augmented.definitions = augmented.definitions.filter(
      (def) => !def.startsWith('CL')
    )
    this._maxWeight = Math.max(augmented.weight, this._maxWeight)
    return augmented
  },
  /* Returns the longest word in the dictionary that is inside `text` */
  longest(text, traditional = false) {
    // Only return the *first* seen word and those the same as it
    let first = false
    const tradOrSimp = traditional ? 'traditional' : 'simplified'
    let matches = this.words
      .filter(row => this.isChinese(row.simplified))
      .filter(function (row) {
        if (first) {
          return row[tradOrSimp] === first
        } else {
          if (text.includes(row[tradOrSimp])) {
            first = row[tradOrSimp]
            return true
          }
        }
      })
      .sort((a, b) => {
        return b.weight - a.weight
      })
    return {
      matches: matches.map(candidate => this.addNewHSK(candidate)),
      text: matches && matches.length > 0 ? matches[0][tradOrSimp] : ''
    }
  },
  tokenize(text) {
    return this.tokenizeRecursively(
      text,
      this.subdictFromText(text),
      this.isTraditional(text)
    )
  },
  variants(word) {
    let variants = []
    for (let def of word.definitions) {
      let matches = def.match(/of (?<traditional>[^\s|]+)(\|(?<simplified>[^\s|]+))?\[(?<pinyin>.+?)\]/)
      if (matches && matches.groups) {
        let { traditional, simplified, pinyin } = matches.groups
        let words = this.lookupTraditional(traditional, pinyin)
        variants = variants.concat(words)
      }
    }
    return variants
  },
  tokenizeRecursively(text, subdict, traditional = false) {
    const isChinese = subdict.isChinese(text)
    if (!isChinese) {
      return [text]
    }
    const longest = subdict.longest(text, traditional)
    if (longest.matches.length > 0) {
      for (let word of longest.matches) {
        longest.matches = longest.matches.concat(this.variants(word))
      }
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
            subdict,
            traditional
          )) {
            tokens.push(token)
          }
        } else {
          tokens.push(item)
        }
      }
      if (tokens[0] && tokens[0].candidates && tokens[0].candidates[0].simplified.length === 1) {
        let character = tokens[0].candidates[0].simplified
        let hskChar = this.lookupHSKChar(character)
        if (hskChar) tokens[0].candidates[0].level = hskChar.hsk
      }
      return tokens
    } else {
      return [text]
    }
  },
  lookupHSKChar(simplified) {
    return this.characters.find(row => row.word === simplified)
  },
  // text = 涎[xian2]
  // text = 協|协[xie2]
  parseWord(text) {
    var m = text.match(/(.*)\[(.*)\]/)
    if (!m) {
      m = [text, text, '']
    }
    const c = m[1].split('|')
    return {
      simplified: c.length > 1 ? c[1] : c[0], // 涎, 协
      traditional: c[0], // 涎, 協
      pinyin: m[2]
    }
  },
  subdict(data) {
    let newDict = Object.assign({}, this)
    return Object.assign(newDict, { words: data })
  },
  isTraditional(text) {
    let matchedSimplified = []
    let matchedTraditional = []
    for (let row of this.words) {
      if (text.includes(row.simplified)) matchedSimplified.push(row.simplified)
      if (text.includes(row.traditional))
        matchedTraditional.push(row.traditional)
    }
    const trad = this.unique(matchedTraditional).length
    const simp = this.unique(matchedSimplified).length
    return trad > simp
  },
  subdictFromText(text) {
    return this.subdict(
      this.words.filter(function (row) {
        return text.includes(row.simplified) || text.includes(row.traditional)
      })
    )
  },
  listCharacters() {
    return this.characters
  }
}