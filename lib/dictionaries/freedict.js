export default {
  name: 'freedict',
  file: undefined,
  words: [],
  index: {},
  cache: {},
  tables: [],
  credit() {
    return 'The dictionary is provided by <a href="https://freedict.org/">FreeDict</a> dict, open-source and <a href="https://freedict.org/about/">freely distribtued</a>.'
  },
  loadWords() {
    return new Promise(resolve => {
      console.log('FreeDict: Loading words')
      let xhttp = new XMLHttpRequest()
      let that = this
      xhttp.onload = function() {
        if (this.readyState == 4 && (this.status >= 200 && this.status < 400)) {
          that.words = that.parseDictionary(this.responseText)
          resolve()
        }
      }
      xhttp.open('GET', this.file, true)
      xhttp.send()
    })
  },
  parseLines(lines) {
    let words = []
    for (let index in lines) {
      index = parseInt(index)
      let english = lines[index]
      let matches = english.match(/(.*) \/(.*)\//)
      if (matches) {
        let matches2 = english.match(/<(.*)>/)
        // Parse definitions (sometimes it's one line, other times it's multiple lines with numeric headings)
        let i = 1
        let isDef = !lines[index + i].match(/(.*) \/(.*)\//)
        let definitions = []
        while (isDef) {
          let def = lines[index + i].replace(/^\d+\./, '').trim()
          if (def !== '') {
            definitions.push(def)
          }
          i = i + 1
          if (lines[index + i]) {
            isDef = !lines[index + i].match(/(.*) \/(.*)\//)
          } else {
            isDef = false
          }
        }
        let pronunciation = matches ? matches[2] : undefined
        let word = {
          bare: matches ? matches[1] : undefined,
          head: matches
            ? matches[1].replace(/\(.*\)\/ /, '').toLowerCase()
            : undefined,
          pronunciation: pronunciation,
          definitions: definitions,
          pos: matches2 && matches2.length > 1 ? matches2[1] : undefined
        }
        word.accented = word.bare
        words.push(word)
      }
    }
    return words
  },
  parseDictionary(text) {
    text = text.replace(/^[^\n]*\n/m, '') // remove title line
    console.log('Parsing FreeDict Dictionary from ' + this.file)
    let lines = text.split('\n')
    let words = []
    words = this.parseLines(lines)
    words = words.sort((a, b) => {
      if (a.head && b.head) {
        return a.head.length - b.head.length
      }
    })
    words = words.map((word, index) => {
      word.id = index
      return word
    })
    return words
  },
  dictionaryFile(options) {
    const server = 'https://server.chinesezerotohero.com/'
    let filename = `${server}data/freedict/${options.l2}-${options.l1}.dict.txt`
    return filename
  },
  load(options) {
    console.log('Loading FreeDict...')
    this.l1 = options.l1
    // let server = 'http://hsk-server.local:8888/'
    // let server = 'https://server.chinesezerotohero.com/'
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
    if (word) {
      for (let table of this.formTable()) {
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
  lookupByDef(text, limit = 30) {
    text = text.toLowerCase()
    let words = this.words
      .filter(word => word.definitions && word.definitions.join(', ').toLowerCase().includes(text))
      .slice(0, limit)
    return words
  },
  lookupFuzzy(text, limit = 30) { // text = 'abcde'
    text = text.toLowerCase()
    let words = []
    let subtexts = []
    for (let i = 1; text.length - i > 2; i++) {
      subtexts.push(text.substring(0, text.length - i))
    }
    for (let word of this.words) {
      if (word.head && word.head.includes(text)) {
        words.push(Object.assign({score: text.length - (word.head.length - text.length)}, word)) // matches 'abcde', 'abcde...'
      }
      if (word.head && text.includes(word.head)) {
        words.push(Object.assign({score: word.head.length}, word)) // matches 'cde', 'abc'
      }
      for (let subtext of subtexts) {
        if (word.head.includes(subtext)) {
          words.push(Object.assign({score: subtext.length - (word.head.length - subtext.length)}, word)) // matches 'abcxyz...'
        }
      }
    }
    return words.sort((a,b) => b.score - a.score).slice(0, limit)
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
