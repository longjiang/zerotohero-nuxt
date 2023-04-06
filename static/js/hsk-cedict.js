importScripts("../vendor/localforage/localforage.js")

const PYTHON_SERVER = 'https://python.zerotohero.ca/'

const PROXY_SERVER = 'https://server.chinesezerotohero.com/'

const Dictionary = {
  file: undefined,
  characterFile: undefined,
  newHSKFile: undefined,
  version: '1.1.11',
  words: [],
  hskStandardCourseWords: {}, // a tree structure by book, lesson and dialog
  characters: [],
  newHSK: [],
  _maxWeight: 0,
  tokenizationCache: {},
  traditionalIndex: {},
  variantIndex: {},
  credit() {
    return 'The Chinese dictionary is provided by <a href="https://www.mdbg.net/chinese/dictionary?page=cedict">CC-CEDICT</a>, open-source and distribtued under a <a href="https://creativecommons.org/licenses/by-sa/4.0/">Creative Commons Attribution-ShareAlike 4.0 International License</a>. We also added HSK information on top.'
  },
  async load() {
    const server = 'https://server.chinesezerotohero.com/'
    this.file = `${server}/data/hsk-cedict/hsk_cedict.csv.txt`
    this.characterFile = `${server}/data/hsk-cedict/hsk_characters.csv.txt`
    this.newHSKFile = `${server}/data/hsk-cedict/new_hsk.csv.txt`
    // const server =  `${process.env.baseUrl}/`

    let [words, characters, newHSK] = await Promise.all([this.loadSmart('hsk_cedict'), this.loadSmart('hsk_characters'), this.loadSmart('new_hsk')])
    this.words = words.map(row => this.augment(row))
      .sort((a, b) => b.simplified.length - a.simplified.length)
    for (let row of this.words) {
      row.rank = row.weight / this._maxWeight
      this.compileHSKStandardCourseWords(row)
    }
    this.characters = characters
    this.newHSK = newHSK
    this.createIndices()
  },
  compileHSKStandardCourseWords(word) {
    let { book, lesson, dialog } = word
    if (book && lesson && dialog) {
      this.hskStandardCourseWords[book] = this.hskStandardCourseWords[book] || {}
      this.hskStandardCourseWords[book][lesson] = this.hskStandardCourseWords[book][lesson] || {}
      this.hskStandardCourseWords[book][lesson][dialog] = this.hskStandardCourseWords[book][lesson][dialog] || []
      this.hskStandardCourseWords[book][lesson][dialog].push(word)
    }
  },
  getHSKStandardCourseWords() {
    return this.hskStandardCourseWords
  },
  lemmaFromDefinition(text) {
    let m = text.match(/(.*?)([^\s]+?)\|([^\s]+?)\[(.+?)\](.*?)/);
    if (!m) m = text.match(/(.*?)([^\s]+?)\[(.+?)\](.*?)/);
    if (m) {
      stringBefore = m[1];
      lemma = m[2].replace(/\u200e/g, ""); // Left-to-Right Mark
      stringAfter = m[m.length - 1];
    }
    return { lemma, morphology: stringBefore.trim() }
  },
  async loadSmart(name) {
    const server = 'https://server.chinesezerotohero.com/'
    let data = await localforage.getItem(name)
    if (!data) {
      let file = `${server}data/hsk-cedict/${name}.csv.txt`
      console.log(`HSK CEDICT: requesting '${file}' . . .`)
      let response = await axios.get(file)
      data = response.data
      localforage.setItem(name, data)
      response = null
    } else {
      console.log(`HSK CEDICT: dictionary '${name}' loaded from local indexedDB via localforage`)
    }
    if (data) {
      let results = Papa.parse(data, {
        header: true,
        delimiter: ','
      })
      return results.data
    }
  },
  createIndices() {
    console.log('HSK CEDICT: Indexing...')
    for (let word of this.words) {
      for (let indexType of ["traditional"]) {
        if (!Array.isArray(this[indexType + "Index"][word[indexType]]))
          this[indexType + "Index"][word[indexType]] = [];
        this[indexType + "Index"][word[indexType]] = this[indexType + "Index"][
          word[indexType]
        ].concat(word);
      }
    }
    this.buildVariantIndex()
  },
  buildVariantIndex() {
    for (let word of this.words) {
      // if (word.simplified !== '殒落') continue;
      for (let definition of word.definitions.filter(d => d.includes('['))) {
        let lemma = this.lemmaFromDefinition(definition)
        // console.log({lemma, definition})
        if (lemma) {
          let lemmaWords = this.traditionalIndex[lemma.lemma]
          if (lemmaWords && lemmaWords.length > 0) {
            this.variantIndex[word.traditional] = this.variantIndex[word.traditional] || []
            this.variantIndex[word.traditional] = this.variantIndex[word.traditional].concat(lemmaWords)
          }
        }
      }
    }
    for (let lemmaKey in this.variantIndex) {
      this.variantIndex[lemmaKey] = this.uniqueByValue(this.variantIndex[lemmaKey], 'id')
    }
  },
  getWords() {
    return this.words
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
  findPhrases(word) {
    if (word) {
      if (!word.phrases || word.phrases.length === 0) {
        let phrases = []
        for (let w of this.words) {
          if (w.traditional.length > word.traditional.length && w.traditional.includes(word.traditional)) phrases.push(w)
        }
        word.phrases = phrases.sort((a, b) => a.traditional.length - b.traditional.length).sort((a, b) => b.weight - a.weight)
        return word.phrases
      } else {
        return word.phrases
      }
    }
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
      let newHSKWordsFlattened = newHSK.map(row => row.simplified).reduce(
        (a, b) => a + b,
        ""
      );
      let subdict = this.subdictFromText(newHSKWordsFlattened)
      for (let newHSKWord of newHSK) {
        let matchedWords = subdict.lookupSimplified(newHSKWord.simplified, newHSKWord.pinyin);
        if (matchedWords && matchedWords[0]) {
          let { hsk, pinyin, id, definitions } = matchedWords[0];
          newHSKWord = Object.assign(newHSKWord, { hsk, id })
        }
      }
      this.newHSKCrunched = newHSK // Cache this
      newHSKWordsFlattened = null
      subdict = null
      return this.newHSKCrunched
    }
  },
  defString(definitions) {
    return definitions
      .filter((def) => !def.startsWith("CL"))
      .join("; ");
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
    let words = this.words.filter(
      row =>
        parseInt(row.book) === parseInt(book) &&
        parseInt(row.lesson) === parseInt(lesson)
    )
    if (dialog) words = words.filter(row => row.dialog.toString() === dialog.toString())
    return words
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
  lookupByLesson(level, lesson) {
    level = String(level)
    lesson = String(lesson)
    return this.words.filter(row => row.hsk === level && row.lesson === lesson)
  },
  lookupByPinyin(pinyin) {
    return this.words.filter(w => w.pinyin === pinyin)
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
      else if (definitions[0].startsWith('a ') || ('the ')) pos = 'noun'
      else if (definitions[0].startsWith('surname ') || /^[A-Z].*/.test(definitions[0])) pos = 'proper noun'
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
      matches,
      text: matches && matches.length > 0 ? matches[0][tradOrSimp] : ''
    }
  },
  getLemmas(traditional) {
    let variants = this.variantIndex[traditional]
    return variants
  },
  /**
   * Tokenizes the given text into words using the lemmatization server and as an array of objects
   * @param {*} text The text to search for words in
   * @returns {Array} An array of objects with the following properties:  {traditional, simplified, pinyin, definitions, weight}
   */
  async tokenizeChinese(text) {
    text = text.replace(/-/g, "- ");
    let url = `${PYTHON_SERVER}lemmatize-chinese?text=${encodeURIComponent(
      text
    )}`;
    let tokenized = await this.proxy(url);
    // check if the tokenized is an array and not a string
    if (!tokenized || typeof tokenized === 'string') {
      // try again without caching
      tokenized = await this.proxy(url, 0);
      if (!tokenized || typeof tokenized === 'string') {
        return
      }
    }
    let tokens = [];
    for (let token of tokenized) {
      if (!token) {
        tokens.push(" ");
      } else if (token.pos === 'x') {
        tokens.push(token.word);
      } else {
        tokens.push(token);
      }
    }
    return tokens;
  },
  sortCandidatesInText(candidates, text) {
    const arr = candidates;

    const sequence = text;
    
    function compare(a, b) {
      const aInSeq = sequence.indexOf(a.head) !== -1;
      const bInSeq = sequence.indexOf(b.head) !== -1;
    
      if (aInSeq && bInSeq) {
        return sequence.indexOf(a.head) - sequence.indexOf(b.head);
      }
      
      if (aInSeq) return -1;
      if (bInSeq) return 1;
    
      const aMutuallyExclusive = arr.every(el => el === a || !a.head.includes(el.head));
      const bMutuallyExclusive = arr.every(el => el === b || !b.head.includes(el.head));
    
      if (aMutuallyExclusive && bMutuallyExclusive) {
        return b.head.length - a.head.length;
      }
    
      if (aMutuallyExclusive) return -1;
      if (bMutuallyExclusive) return 1;
    
      return b.head.length - a.head.length;
    }
    
    const sortedArray = arr.sort(compare);
    
    return sortedArray
  },
  getWordsWithinText(text) {
    let reducedText = text.replace(/[一个得不]/gi, '')
    let candidates = this.words.filter(w => {
      let regex = new RegExp(w.simplified + "|" + w.traditional)
      return text.match(regex) || reducedText.match(regex)
    })
    return candidates
  },
  async tokenize(text) {
    if (this.tokenizationCache[text]) return this.tokenizationCache[text]
    let tokenized = await this.tokenizeChinese(text);
    if (!tokenized) return this.tokenizeLocally(text);
    let final = []
    for (let index in tokenized) {
      let token = tokenized[index]
      if (typeof token === 'object' && this.isChinese(token.word)) {
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
        if (candidates.length === 0 && token.word) {
          candidates = this.getWordsWithinText(token.word)
        }
        candidates = this.sortCandidatesInText(candidates, text)
        final.push({
          text: token.word,
          candidates,
          pos: token.pos,
          pronunciation: token.pronunciation
        })
        if (token.word && !this.isChinese(token.word)) final.push(" ")
      } else {
        final.push(token.word || token) // string
      }
    }
    this.tokenizationCache[text] = final
    return final
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
    let subict = this.subdict(
      this.words.filter(function (row) {
        return text.includes(row.simplified) || text.includes(row.traditional)
      })
    )
    return subict
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
      matches: matches,
      text: matches && matches.length > 0 ? matches[0][tradOrSimp] : ''
    }
  },
  tokenizeLocally(text) {
    this.tokenizationCache[text] = this.tokenizationCache[text] || this.tokenizeRecursively(
      text,
      this.subdictFromText(text),
      this.isTraditional(text)
    )
    return this.tokenizationCache[text]
  },
  tokenizeRecursively(text, subdict, traditional = false) {
    const isChinese = subdict.isChinese(text)
    if (!isChinese) {
      return [text]
    }
    const longest = subdict.longest(text, traditional)
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
            subdict,
            traditional
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
  listCharacters() {
    return this.characters
  }
}