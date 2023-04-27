importScripts('../vendor/localforage/localforage.js')
importScripts('../js/tokenizers/russian-tokenizer.js')

const Dictionary = {
  words: [],
  merged: [],
  index: {},
  cache: {},
  tokenizationCache: {},
  tables: [
    // 'categories_words2', // not sure what this does
    // 'expressions_words', // not sure what this does
    // 'sentences_words', // 43 mb!
    // 'sentences', // 48 mb!
    // 'words_rels' // later, or just use SketchEngine
    {
      name: 'nouns',
      fields: []
    },
    {
      name: 'translations',
      fields: []
    },
    {
      name: 'adjectives',
      fields: [
        'incomparable',
        'short_f',
        'short_m',
        'short_n',
        'short_pl',
        'superlative'
      ]
    },
    {
      name: 'conjugations',
      fields: ['sg1', 'sg2', 'sg3', 'pl1', 'pl2', 'pl3']
    },
    {
      name: 'declensions',
      fields: ['acc', 'dat', 'gen', 'inst', 'nom', 'prep']
    },
    {
      name: 'verbs',
      fields: [
        'aspect',
        'imperative_pl',
        'imperative_sg',
        'partner',
        'past_f',
        'past_m',
        'past_n',
        'past_pl'
      ]
    }
  ],
  credit() {
    return 'The Russian dictionary is provided by <a href="https://en.openrussian.org/about">OpenRussian.org</a>, which is freely distribtued.'
  },
  async loadSmart(name) {
    const server = 'https://server.chinesezerotohero.com/'
    let data = await localforage.getItem(name)
    if (!data) {
      let file = `${server}data/openrussian/${name}.csv.txt`
      console.log(`Open Russian: requesting '${file}' . . .`)
      let response = await axios.get(file)
      data = response.data
      localforage.setItem(name, data)
      response = null
    } else {
      console.log(`Open Russian: dictionary '${name}' loaded from local indexedDB via localforage`)
    }
    if (data) {
      let results = Papa.parse(data, {
        header: true
      })
      return results.data
    }
  },
  async loadDeclensions() {
    console.log(`OpenRussian: Loading declensions`)
    let data = await this.loadSmart('declensions')

    let declensions = []
    for (let row of data) {
      declensions[row.id] = row
    }
    for (let word of this.words) {
      if (word) {
        word.declensions = {}
        if (word.nouns) {
          if (word.nouns.decl_pl_id) {
            word.decl_pl = declensions[word.nouns.decl_pl_id]
          }
          if (word.nouns.decl_sg_id) {
            word.decl_sg = declensions[word.nouns.decl_sg_id]
          }
        }
        if (word.adjectives) {
          if (word.adjectives.decl_f_id) {
            word.decl_f = declensions[word.adjectives.decl_f_id]
          }
          if (word.adjectives.decl_m_id) {
            word.decl_m = declensions[word.adjectives.decl_m_id]
          }
          if (word.adjectives.decl_n_id) {
            word.decl_n = declensions[word.adjectives.decl_n_id]
          }
          if (word.adjectives.decl_pl_id) {
            word.decl_pl = declensions[word.adjectives.decl_pl_id]
          }
        }
      }
    }
  },
  async loadTable(table) {
    let data = await this.loadSmart(table)
    this[table] = []
    if (table === 'translations') {
      data = data.filter(row => row.lang === 'en')
    }
    for (let row of data) {
      let word = this.words[row.word_id]
      if (word) {
        word[table] = row
        if (table === 'translations')
          word.definitions = [row.tl]
      }
    }
  },
  async loadWords() {
    console.log('OpenRussian: Loading words')
    let data = await this.loadSmart('words')
    for (let row of data) {
      if (row.accented) {
        row.accented = this.accent(row.accented)
      }
      if (row.bare) row.head = row.bare
      delete row.audio
      row.pos = row.type
      this.words[row.id] = row
    }
  },
  async load() {
    await this.loadWords()
    let promises = []
    for (let table of this.tables.filter(
      table => table.name !== 'declensions'
    )) {
      promises.push(this.loadTable(table.name))
    }
    await Promise.all(promises)
    await this.loadDeclensions()
    // promises.push(this.merge())
    this.createIndex()    
    this.tokenizer = new RussianTokenizer()
    return this
  },
  async tokenize(text) {
    return await this.tokenizer.tokenizeWithCache(text)
  },
  // tokenize(text) {
  //   if (this.tokenizationCache[text]) return this.tokenizationCache[text];
  //   else {
  //     let tokenized = this.tokenizeIntegral(text);
  //     this.tokenizationCache[text] = tokenized;
  //     return tokenized;
  //   }
  // },
  tokenizeIntegral(text) {
    const tokens = text.match(/\p{L}+|[^\p{L}\s]+|\s+/gu);
    const labeledTokens = tokens.map(tokenString => {
      let isWord = /^\p{L}+$/u.test(tokenString)
      if (isWord) {
        return { text: tokenString };
      } else {
        return tokenString;
      }
    });
    return labeledTokens
  },
  /**
   * Get a word by ID.
   * @param {*} id the word's id
   * @param {*} head (optional) the head of the word to check if matches the word retrieved; if mismatched, we'll look for a matching word instead.
   * @returns 
   */
  get(id, head) {
    let word
    word = this.words[id]
    if (head && word.head !== head) {
      word = this.lookup(head)
    }
    return word
  },
  lookupByDef(text, limit = 30) {
    text = text.toLowerCase()
    let words = this.words
      .filter(word => word.definitions && word.definitions.join(', ').toLowerCase().includes(text))
      .slice(0, limit)
    return words
  },
  lookup(text) {
    let word = this.words.find(word => word && word.bare === text)
    return word
  },
  unique(a) {
    return a.filter((item, i, ar) => ar.indexOf(item) === i);
  },
  getWords() {
    return this.words
  },
  getWordsThatContain(text) {
    let words = this.words.filter(w => (w.head.includes(text)) || (w.bare.includes(text)))
    let strings = words
      .map((word) => word.bare)
      .concat(words.map((word) => word.head))
    return this.unique(strings)
  },
  lookupMultiple(text) {
    let words = this.words.filter(word => word && word.bare.toLowerCase() === text.toLowerCase())
    return words
  },
  createIndex() {
    console.log('Indexing...')

    for (let word of this.words) {
      if (word) {
        let w = {}
        for (let key in word) {
          if (typeof word[key] !== 'object' && !Array.isArray(word[key])) {
            w[key] = word[key]
          }
        }
        word.forms = this.wordForms(word)
        for (let form of word.forms) {
          let bareForm = form.form
            .replace(/ё/gi, 'е')
            .replace("'", '')
            .toLowerCase()
          let match = {
            word_id: word.id,
            table: form.table,
            field: form.field,
            form: this.accent(form.form) // with accents
          }
          let indexedForm = this.index[bareForm] || {
            matches: []
          }
          indexedForm.matches.push(match)
          this.index[bareForm] = indexedForm
        }

      }
    }
    console.log('... finished')
  },
  formTable() {
    let decl_fields = ['acc', 'dat', 'gen', 'inst', 'nom', 'prep']
    return this.tables.concat([
      {
        name: 'decl_pl', // adjective and nouns
        fields: decl_fields
      },
      {
        name: 'decl_sg', // nouns
        fields: decl_fields
      },
      {
        name: 'decl_m', // adjectives
        fields: decl_fields
      },
      {
        name: 'decl_f', // adjectives
        fields: decl_fields
      },
      {
        name: 'decl_n', // adjectives
        fields: decl_fields
      }
    ])
  },
  wordForms(word) {
    let forms = []
    let tables = this.formTable()
    if (word) {
      for (let table of tables) {
        for (let field of table.fields) {
          if (word[table.name] && word[table.name][field]) {
            for (let form of word[table.name][field].split(',')) {
              forms.push({
                table: table.name,
                field: field,
                form: form.trim()
              })
            }
          }
        }
      }
    }
    return forms
  },
  matchFormsIndexed(text) {
    text = text.toLowerCase().replace(/ё/gi, 'е')
    if (this.cache[text]) {
      return this.cache[text]
    }
    this.cache[text] = []
    /*
    We have:
    this.indexed['систем'] = {
      form: "систе'м"
      matches: [
        {
          field: "gen"
          table: "decl_pl"
          word_id: "341"
        }
      ]
    }

    We want:
    foundWords = [
      {
        id: 341
        bare: систем
        matches: [
          {
            field: "gen"
            table: "decl_pl",
            form: "систе'м"
          },
          {...}, ...
        ]
        // augmented word data
      }
    ]
    */
    // First get matched head word (lemma) if there is one
    let foundWords = this.words
      .filter(
        word => word && word.bare.replace(/ё/gi, 'е').toLowerCase() === text
      )
      .map(word => Object.assign({}, word))
    let indexed = this.index[text]
    if (indexed && indexed.matches) {
      for (let match of indexed.matches) {
        let foundWord = foundWords.find(w => w.id === match.word_id)
        let numbers = []
        if (match.table === 'decl_pl') {
          numbers.push('plural')
        }
        if (match.table === 'decl_sg') {
          numbers.push('singular')
        }
        match.number = numbers.join(' and ')
        let word = undefined
        if (!foundWord) {
          word = Object.assign({}, this.get(match.word_id))
          foundWords.push(word)
        } else {
          word = foundWord
        }
        word.matches = word.matches || []
        word.matches.push(match)
      }
    }
    this.cache[text] = foundWords
    return foundWords
  },
  lookupFuzzy(text) {
    return this.matchFormsIndexed(text)
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
  getSize() {
    return this.words.length
  },
  stylize(name) {
    const stylize = {
      adjectives: 'adjective',
      incomparable: 'incomparable',
      short_f: 'short (fem.)',
      short_m: 'short (masc.)',
      short_n: 'short (neut.)',
      short_pl: 'short plural',
      superlative: 'superlative',
      conjugations: 'conjugation',
      pl1: 'мы',
      pl2: 'вы',
      pl3: 'они',
      sg1: 'я',
      sg2: 'ты',
      sg3: 'он/она',
      declensions: 'declension',
      decl_sg: 'singular',
      decl_pl: 'plural',
      decl_f: 'feminine',
      decl_m: 'masculine',
      decl_n: 'neuter',
      acc: 'accusative',
      dat: 'dative',
      gen: 'genitive',
      inst: 'instrumental',
      nom: 'nominative',
      prep: 'prepositional',
      verbs: 'verb',
      aspect: 'aspect',
      imperative_pl: 'imperative plural',
      imperative_sg: 'imperative singular',
      partner: 'partner',
      past_f: 'past tense (feminine)',
      past_m: 'past tense (masculine)',
      past_n: 'past tense (neuter)',
      past_pl: 'past tense (plural)'
    }
    return stylize[name]
  }
}
