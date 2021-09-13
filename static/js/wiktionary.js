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
  useJSON: ['abq',
  'agm',
  'ang',
  'aqp',
  'atb',
  'bag',
  'bak',
  'bam',
  'ceg',
  'chu',
  'ckx',
  'cms',
  'cpg',
  'crx',
  'dgi',
  'dlm',
  'dum',
  'dus',
  'egy',
  'etu',
  'frm',
  'fro',
  'goh',
  'grc',
  'gsw',
  'gug',
  'gvl',
  'hnj',
  'hvc',
  'jig',
  'kan',
  'kaz',
  'kht',
  'lij',
  'luv',
  'mar',
  'mhi',
  'neh',
  'nrf',
  'ntw',
  'ogu',
  'ota',
  'pcc',
  'pij',
  'pwn',
  'rup',
  'ryu',
  'sga',
  'sln',
  'syl',
  'tce',
  'tcy',
  'tiw',
  'tpx',
  'tus',
  'unn',
  'xcl',
  'xlc',
  'zha',
  'zmg',
  'zpq',
  'zzj'],
  server: 'https://server.chinesezerotohero.com/',
  l1: undefined,
  l2: undefined,
  supplementalLangs: {
    msa: 'ind',
    ind: 'msa',
    ceb: 'tgl',
    tgl: 'ceb',
    cmn: 'zho',
    nor: 'nno',
    nob: 'nno',
  },
  conjugations: undefined, // for french only
  romanizations: undefined, // for persian only
  credit() {
    return 'The dictionary is provided by <a href="https://en.wiktionary.org/wiki/Wiktionary:Main_Page">Wiktionary</a>, which is freely distribtued under the <a href="https://creativecommons.org/licenses/by-sa/3.0/">Creative Commons Attribution-ShareAlike License</a>. The dictionary is parsed by <a href="https://github.com/tatuylonen/wiktextract">wiktextract</a>.'
  },
  dictionaryFile({
    l1 = undefined,
    l2 = undefined
  } = {}) {
    if (l1 && l2) {
      l2 = l2.replace('hrv', 'hbs') // Serbian uses Serbo-Croatian
        .replace('nor', 'nob') // Default Norwegian to Bokmål (which is supplemented with Nynorsk)
        .replace('srp', 'hbs') // Croatian uses Serbo-Croatian
        .replace('bos', 'hbs') // Bosnian uses Serbo-Croatian
        .replace('run', 'kin') // Rundi uses Rwanda-Rundi
        .replace('hbo', 'heb') // Ancient Hebrew uses Hebrew
        .replace('grc', 'ell') // Ancient Greek uses Greek
        .replace('hmn', 'mww') // Hmong uses white Hmong
        .replace('prs', 'fas') // Dari uses Persian
        .replace('arb', 'ara') // Modern Standard Arabic uses Arabic
        .replace('zsm', 'msa') // Standard Malaysian uses Malaysian
        .replace('lvs', 'lav') // Standard Latvian uses Latvian
        .replace('ekk', 'est') // Standard Estonian uses Estonian
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
      let supplementalLang = this.supplementalLangs[l2]
      if (l1 === 'eng' && supplementalLang) {
        // Append indonesian words to malay dictionary so we get more words
        let supplWords = await this.loadWords(this.dictionaryFile({ l1, l2: supplementalLang }))
        for (let w of supplWords) {
          w.id = supplementalLang + '-' + w.id
          w.supplementalLang = supplementalLang
        }
        words = words.concat(supplWords)
        words = words.sort((a, b) => {
          if (a.head && b.head) {
            return b.head.length - a.head.length
          }
        })
      }
      this.words = words
      if (this.l2 === 'fra') await this.loadFrenchConjugationsAndLemmatizer()
      if (this.l2 === 'fas') await this.loadPersianRomanization()
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
  async loadPersianRomanization() {
    console.log('Loading Persian romanization file...')
    try {
      let res = await axios.get(`${this.server}data/persian-g2p/tihudictBIG.csv.txt`)
      if (res && res.data) {
        let parsed = Papa.parse(res.data, {header: true})
        this.romanizations = parsed.data
      }
    } catch(err) {

    }
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
  /**
   * Romanize Persian text
   * @param {String} text
   */
  romanize(text) {
    text = text.trim()
    let row = this.romanizations.find(r => r.persian === text)
    if (row) return row.roman
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
                let definition = sense.glosses[0]
                if (sense.form_of) {
                  let stem = this.normalizeStem(sense.form_of[0])
                  stems.push(stem)
                  if (!definition.includes(' of ')) {
                    definition = definition + ' of ' + stem
                  }
                }
                definitions.push(definition)
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
    words = words.filter(w => w.word.length > 0) // filter empty rows
      .map(item => {
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
    return this.words.find(word => word.id == id)
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
  getWordsThatContain(text) {
    let words = this.words.filter(w => (w.head.includes(text)) || (w.bare.includes(text)))
    let strings = words
      .map((word) => word.bare)
      .concat(words.map((word) => word.head))
    return this.unique(strings)
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
    definition = definition.replace(/\(.*\)/g, '').trim()
    let m = definition.match(/(.* of )([^\s\.]+)$/);
    if (m) {
      let lemma = m[2].replace(/\u200e/g, ""); // Left-to-Right Mark
      if (this.l2 === 'lat') lemma = this.stripAccents(lemma)
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
        return text.includes(row.head) || (row.search.length > 0 && search.includes(row.search))
      }
    })
    return this.subdict(words)
  },
  isCombining(char) {
    let M = '\u0300-\u036F\u0483-\u0489\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u07FD\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08D3-\u08E1\u08E3-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962\u0963\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09E2\u09E3\u09FE\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2\u0AE3\u0AFA-\u0AFF\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B62\u0B63\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0C00-\u0C04\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C81-\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CE2\u0CE3\u0D00-\u0D03\u0D3B\u0D3C\u0D3E-\u0D44\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D62\u0D63\u0D82\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DF2\u0DF3\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F3E\u0F3F\u0F71-\u0F84\u0F86\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102B-\u103E\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F\u109A-\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4-\u17D3\u17DD\u180B-\u180D\u1885\u1886\u18A9\u1920-\u192B\u1930-\u193B\u1A17-\u1A1B\u1A55-\u1A5E\u1A60-\u1A7C\u1A7F\u1AB0-\u1ABE\u1B00-\u1B04\u1B34-\u1B44\u1B6B-\u1B73\u1B80-\u1B82\u1BA1-\u1BAD\u1BE6-\u1BF3\u1C24-\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CED\u1CF4\u1CF7-\u1CF9\u1DC0-\u1DF9\u1DFB-\u1DFF\u20D0-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302F\u3099\u309A\uA66F-\uA672\uA674-\uA67D\uA69E\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA823-\uA827\uA880\uA881\uA8B4-\uA8C5\uA8E0-\uA8F1\uA8FF\uA926-\uA92D\uA947-\uA953\uA980-\uA983\uA9B3-\uA9C0\uA9E5\uAA29-\uAA36\uAA43\uAA4C\uAA4D\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEB-\uAAEF\uAAF5\uAAF6\uABE3-\uABEA\uABEC\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE2F'
    let regex = new RegExp(`[${M}]+`)
    let combining = regex.test(char)
    // console.log(`👀 checking if ${char} is combinging`, combining)
    return combining
  },
  /* Returns the longest word in the dictionary that is inside `text` */
  longest(text) {
    // Only return the *first* seen word and those the same as it
    let first = false
    let search = text.toLowerCase()
    if (this.l2 !== 'vie') search = this.stripAccents(search)
    let matchedText
    let matches = this.words
      .filter((word) => {
        if (word.head.trim() === '') return false
        if (first) {
          return word.head === first
        } else {
          let matchedIndex = search.indexOf(word.search)
          if (matchedIndex !== -1) {
            let matchEndIndex = matchedIndex + word.search.length
            let nextChar = text.charAt(matchEndIndex)
            // console.log(`Characgter at matchedIndex (${matchedIndex}) is ${text.charAt(matchedIndex)}, next char (${matchEndIndex}) is ${nextChar}`)
            while (this.isCombining(nextChar)) {
              matchEndIndex = matchEndIndex + 1
              nextChar = text.charAt(matchEndIndex)
            }
            first = word.head
            matchedText = text.slice(matchedIndex, matchEndIndex)
            return true
          }
        }
      })
      .sort((a, b) => {
        return b.head.length - a.head.length
      })
    // console.log('😄 final matched text: ' + matchedText)
    return {
      matches: matches,
      text: matchedText
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
  isThai(text) {
    let match = text.match(
      /[\u0E00-\u0E7F]+/g
    )
    return match
  },
  tokenizeRecursively(text, subdict) {
    const longest = subdict.longest(text)
    if (this.l2 === 'tha') {
      const isThai = subdict.isThai(text)
      if (!isThai) {
        return [text]
      }
    }
    if (longest.matches.length > 0) {
      for (let word of longest.matches) {
        longest.matches = longest.matches.concat(this.stemWords(word, 1))
        longest.matches = longest.matches.concat(this.phrases(word, 1))
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
      result = result.filter(item => {
        if (typeof item === 'string') {
          return item !== ''
        }
        else {
          return item.text !== ''
        }
      })
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
      .replace(/[\u0559-\u055F]/g, "") // Armenian diacritics
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
      words = this.words.filter(word => word.search === text).map(w => Object.assign({ score: 1 }, w))
      let stems = this.findStems(text)
      if (stems.length > 0) {
        let stemWords = this.stringsToWords(stems)
        let stemWordsWithScores = stemWords.map(w => Object.assign({ score: 1 }, w))
        words = words.concat(stemWordsWithScores)
      }
    }
    words = this.words.filter(word => word.search === text).map(w => Object.assign({ score: 1 }, w))
    for (let word of words) {
      let stemWords = this.stemWords(word, 1)
      let phrases = this.phrases(word, 1)
      words = words.concat(stemWords).concat(phrases)
    }
    if (words.length === 0 && this.words.length < 200000) {
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
    words = this.uniqueByValue(words, 'id')
    words = words.slice(0, limit)
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