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
  isCombining(char) {

    let combining = /[\u034F\u0488\u0489\u0591-\u05AF\u05BD\u05C4\u05C5\u0610-\u061A\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0740\u0743\u0744\u0747-\u074A\u08D3-\u08E1\u08EA-\u08EF\u08F3\u0951\u0952\u0F18\u0F19\u0F35\u0F37\u0F3E\u0F3F\u0F82\u0F83\u0F86\u0F87\u0FC6\u17B4\u17B5\u17D3\u180B-\u180D\u1A7F\u1B6B-\u1B73\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CF4\u1CF7-\u1CF9\u2D7F\uA670-\uA672\uA8E0-\uA8F1\uFE00-\uFE0F\uFE21\uFE23-\uFE26\uFE28\uFE2A-\uFE2D\uFE2F\U000102E0\U00011366-\U0001136C\U00011370-\U00011374\U0001D165-\U0001D169\U0001D16D-\U0001D172\U0001D17B-\U0001D182\U0001D185-\U0001D18B\U0001D1AA-\U0001D1AD\U0001D242-\U0001D244\U0001DA00-\U0001DA36\U0001DA3B-\U0001DA6C\U0001DA75\U0001DA84\U0001DA9B-\U0001DA9F\U0001DAA1-\U0001DAAF\U0001E8D0-\U0001E8D6\U000E0100-\U000E01EF\u0332\u0313\u0343\u0486\u2CF1\u0314\u0485\u2CF0\u0301\u0341\u0954\u0300\u0340\u0953\u0306\u0302\u030C\u030A\u0342\u0308\u0344\u030B\u0303\u0307\u0338\u0327\u0328\u0304\u030D\u030E\u0312\u0315\u031A\u033D-\u033F\u0346\u034A-\u034C\u0350-\u0352\u0357\u035B\u035D\u035E\u0484\u0487\u0741\u0745\u17CB-\u17D1\u17DD\u1AB0-\u1AB4\u1ABB\u1ABC\u1DC0\u1DC1\u1DC3-\u1DC9\u1DCB-\u1DCE\u1DD1\u1DF5-\u1DF8\u1DFB\u1DFE\u20F0\u2CEF\uA67C\uA67D\U00010AE5\U00010D24-\U00010D27\U00010F48-\U00010F4A\U00010F4C\U0001BC9D\u0316-\u0319\u031C-\u0320\u0329-\u032C\u032F\u0333\u033A-\u033C\u0347-\u0349\u034D\u034E\u0353-\u0356\u0359\u035A\u035C\u035F\u0362\u0742\u0746\u07FD\u0859-\u085B\u1AB5-\u1ABA\u1ABD\u1DC2\u1DCF\u1DD0\u1DF9\u1DFC\u1DFD\u1DFF\u20EC-\u20EF\uFE27\U00010A0D\U00010AE6\U00010F46\U00010F47\U00010F4B\U00010F4D-\U00010F50\u0336\u0337\u20D8-\u20DA\u20E5\u20EA\u20EB\U0001BC9E\u1ABE\u20DD-\u20E0\u20E2-\u20E4\u3099\u309A\u0335\u0305\u0309\u030F-\u0311\u031B\u0321-\u0326\u032D\u032E\u0330\u0331\u0334\u0339\u0345\u0358\u0360\uFE22\uFE29\u0361\uFE20\u0483\uFE2E\uA66F\u05B0-\u05B8\u05C7\u05B9-\u05BB\u05C2\u05C1\u05BC\u05BF\uFB1E\u081C-\u0823\u0825-\u0827\u0829-\u082C\u0818\u0819\u082D\u064B\u08F0\u08E7\u064C\u08F1\u08E8\u064D\u08F2\u08E9\u064E\u08E4\u08F4\u08F5\u064F\u08E5\u08FE\u0650\u08E6\u08F6\u0651\u0AFB\U00011237\u0652\u0AFA\U0001123E\u0653\u0AFC\u0654\u0655\u065F\u0656-\u0658\u08FF\u0659-\u065E\u08E3\u08F7\u08F8\u08FD\u08FB\u08FC\u08F9\u08FA\u0670\u0711\u0730-\u073F\u07EB-\u07F3\u135F\u135E\u135D\uA6F0\uA6F1\U00016AF0-\U00016AF4\U0001E944-\U0001E946\U0001E94A\U0001E947-\U0001E949\u093C\u09BC\u0A3C\u0ABC\u0AFD-\u0AFF\u0B3C\u0CBC\u1B34\u1BE6\u1C37\uA9B3\U000110BA\U00011173\U000111CA\U00011236\U000112E9\U0001133B\U0001133C\U00011446\U000114C3\U000115C0\U000116B7\U0001183A\U00011A33\U00011D42\u0900\u0901\u0981\u0A01\u0A81\u0B01\u0C00\u0C01\u0C81\u0D01\u1B00\u1B01\uA8C5\uA980\U00011000\U00011080\U00011100\U00011180\U00011301\U00011443\U000114BF\U000115BC\U00011640\U00011A35-\U00011A37\U00011C3C\U00011CB6\U00011D43\u0902\u0982\u0A02\u0A82\u0B02\u0B82\u0C02\u0C04\u0C82\u0D00\u0D02\u0D82\u0F7E\u1036\u17C6\u1A74\u1B02\u1B80\u1CED\uA80B\uA880\uA981\U00010A0E\U00011001\U00011081\U00011101\U00011181\U00011234\U000112DF\U00011300\U00011302\U00011444\U000114C0\U000115BD\U0001163D\U000116AB\U00011837\U000119DE\U00011A38\U00011A96\U00011C3D\U00011CB5\U00011D40\U00011D95\u0903\u0983\u0A03\u0A83\u0B03\u0C03\u0C83\u0D03\u0D83\u0F7F\u1038\u17C7\u1B04\u1B82\uA881\uA983\U00010A0F\U00011002\U00011082\U00011102\U00011182\U00011303\U00011445\U000114C1\U000115BE\U0001163E\U000116AC\U00011838\U000119DF\U00011A39\U00011A97\U00011C3E\U00011D41\U00011D96\u09FE\U000111C9\U0001145E\u0A70\u0A71\u1B03\uA982\u1B81\uABEC\U00010A38-\U00010A3A\U000111CB\U000111CC\U00011A98\u0E4E\u0E47-\u0E4D\u0EC8-\u0ECD\uAABF\uAAC1\u0F39\uA92B-\uA92D\u1037\u17C8-\u17CA\u1A75-\u1A7C\u1939-\u193B\U00016B30\U0001E131\U00016B31\U0001E136\U00016B32\U0001E132\U00016B33\U0001E133\U00016B34\U0001E130\U00016B35\U0001E134\U00016B36\U0001E135\U0001E2EC-\U0001E2EF\u302A-\u302F\u20D0-\u20D7\u20DB\u20DC\u20E1\u20E6-\u20E9\U000101FD\u0363\u1DF2\u1DD3-\u1DD6\u1DE7-\u1DE9\u0368\u1DD7\u0369\u1DD9\u1DD8\u0364\u1DEA\u1DEB\u1DDA\u1DDB\u036A\u0365\u1DDC-\u1DDE\u1DEC\u036B\u1DDF-\u1DE1\u0366\u1DF3\u1DED\u1DEE\u036C\u1DCA\u1DE2-\u1DE5\u1DEF\u036D\u0367\u1DF4\u1DF0\u036E\u1DF1\u036F\u1DE6\u1DD2\u2DF6\u2DE0-\u2DE3\u2DF7\uA674\u2DE4\u2DE5\uA675\uA676\u2DF8\u2DE6-\u2DED\u2DF5\u2DEE\uA677\u2DF9\uA69E\u2DEF\uA67B\u2DF0-\u2DF3\uA678-\uA67A\u2DFA-\u2DFC\uA69F\u2DFD-\u2DFF\u2DF4\U0001E000-\U0001E006\U0001E008-\U0001E018\U0001E01B-\U0001E021\U0001E023\U0001E024\U0001E026-\U0001E02A\U00010376-\U0001037A\u0816\u0817\u081B\u07A6-\u07B0\u093E\u093A\u093B\u094F\u0956\u0957\u093F-\u0944\u0962\u0963\u0945\u0955\u0946\u0947\u094E\u0948\uA8FF\u0949-\u094D\u09BE-\u09C4\u09E2\u09E3\u09C7\u09C8\u09CB-\u09CD\u09D7\u0A51\u0A75\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0ABE-\u0AC4\u0AE2\u0AE3\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0B3E-\u0B44\u0B62\u0B63\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0C3E-\u0C44\u0C62\u0C63\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0CBE-\u0CC4\u0CE2\u0CE3\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0D3E-\u0D44\u0D62\u0D63\u0D46-\u0D48\u0D4A-\u0D4C\u0D57\u0D4D\u0D3B\u0D3C\u0DCF-\u0DD4\u0DD6\u0DD8\u0DF2\u0DDF\u0DF3\u0DD9-\u0DDE\u0DCA\uABE3-\uABEA\uAAEB-\uAAEF\uAAF5\uABED\uAAF6\uA802\uA806\uA823-\uA827\uA8B4-\uA8C4\U000110B0-\U000110B9\U000111B3-\U000111C0\U0001122C-\U00011233\U00011235\U000112E0-\U000112E8\U000112EA\U0001133E-\U00011344\U00011362\U00011363\U00011347\U00011348\U0001134B-\U0001134D\U00011357\U00011435-\U00011442\U000114B0-\U000114BE\U000114C2\U000115AF-\U000115B2\U000115DC\U000115B3\U000115DD\U000115B4\U000115B5\U000115B8-\U000115BB\U000115BF\U00011630-\U0001163C\U0001163F\U000116AD-\U000116B6\U000119D1-\U000119D7\U000119DA\U000119E4\U000119DB-\U000119DD\U000119E0\U0001182C-\U00011836\U00011839\U00011720-\U0001172B\U0001171D-\U0001171F\U00011D47\U00011D31-\U00011D36\U00011D3A\U00011D3C\U00011D3D\U00011D3F\U00011D44\U00011D45\U00011D8A-\U00011D8E\U00011D90\U00011D91\U00011D93\U00011D94\U00011D97\u1BAC\u1BA1-\u1BA3\u1BAD\u1BA4-\u1BAB\U00011038-\U00011046\U0001107F\U00010A01-\U00010A03\U00010A05\U00010A06\U00010A0C\U00010A3F\U00011C2F-\U00011C36\U00011C38-\U00011C3B\U00011C3F\u0E31\u0E34-\u0E3A\u0EB1\u0EB4-\u0EBC\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\u0F90\u0FB9\u0F91-\u0F97\u0F99-\u0FAD\u0FBA\u0FAE-\u0FB1\u0FBB\u0FB2\u0FBC\u0FB3-\u0FB8\u0F8D-\u0F8F\u0F71-\u0F73\u0F80\u0F81\u0F74-\u0F7D\u0F84\U00011A3B-\U00011A3E\U00011A01-\U00011A0A\U00011A34\U00011A47\U00011A51-\U00011A53\U00011A59\U00011A5A\U00011A54\U00011A56\U00011A55\U00011A57\U00011A58\U00011A5B\U00011A8A-\U00011A90\U00011A95\U00011A91-\U00011A94\U00011A99\U00011C92-\U00011CA7\U00011CA9-\U00011CB4\u1C24\u1C25\u1C36\u1C26-\u1C35\u1920-\u192B\u1930-\u1938\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u1A17-\u1A1B\U00011EF3-\U00011EF6\u1BE7-\u1BF3\uA947-\uA953\uA926-\uA92A\u105E\u105F\u103B\u103C\u1060\u103D\u1082\u103E\u102C\u102B\u1083\u1072\u109C\u102D\u1071\u102E\u1033\u102F\u1073\u1074\u1030\u1056-\u1059\u1031\u1084\u1035\u1085\u1032\u109D\u1034\u1062\u1067\u1068\uA9E5\u1086\u1039\u103A\u1063\u1064\u1069-\u106D\u1087\u108B\u1088\u108C\u108D\u1089\u108A\u108F\u109A\u109B\uAA7B-\uAA7D\U00011127-\U00011132\U00011145\U00011146\U00011133\U00011134\u17B6-\u17C5\u17D2\u1A58-\u1A5B\u1A6B\u1A55-\u1A57\u1A5C-\u1A5E\u1A61\u1A6C\u1A62-\u1A6A\u1A6E\u1A6F\u1A73\u1A70-\u1A72\u1A6D\u1A60\uAA33-\uAA36\uAA29-\uAA32\uAA43\uAA4C\uAA4D\u1B35-\u1B44\uA9BE\uA9BF\uA9B4\uA9BC\uA9B6-\uA9B9\uA9BD\uA9BA\uA9BB\uA9B5\uA9C0\u1885\u1886\u18A9\U00016F51-\U00016F53\U00016F4F\U00016F54-\U00016F58\U00016F81\U00016F59-\U00016F5C\U00016F83\U00016F5D-\U00016F60\U00016F84\U00016F61-\U00016F65\U00016F86\U00016F66-\U00016F6D\U00016F7F\U00016F87\U00016F6E-\U00016F72\U00016F80\U00016F73\U00016F74\U00016F85\U00016F82\U00016F75-\U00016F7E\U00016F8F-\U00016F92]+/.test(char)
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