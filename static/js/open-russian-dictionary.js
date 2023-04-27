importScripts('../vendor/localforage/localforage.js')
importScripts('../js/dictionary-utils.js')
importScripts('../js/tokenizers/russian-tokenizer.js')
importScripts("../js/inflectors/inflector-factory.js")

class RussianDictionary {
  constructor({ l1 = undefined, l2 = undefined } = {}) {
    this.words = [];
    this.l1 = l1;
    this.l2 = l2;
    this.loadWords();
    this.tokenizer = new RussianTokenizer();
    this.inflector = InflectorFactory.createInflector(this.l2);
  }

  credit() {
    return 'The Russian dictionary is provided by <a href="https://en.openrussian.org/about">OpenRussian.org</a>, which is freely distribtued.';
  }

  async loadWords() {
    console.log('OpenRussian: Loading words');
    let data = await this.loadSmart('words');
    for (let row of data) {
      if (row.accented) {
        row.accented = this.accent(row.accented);
      }
      if (row.bare) row.head = row.bare;
      delete row.audio;
      row.pos = row.type;
      this.words[row.id] = row;
    }
  }
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
  }
  async tokenize(text) {
    return await this.tokenizer.tokenizeWithCache(text)
  }
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
  }
  lookupByDef(text, limit = 30) {
    text = text.toLowerCase()
    let words = this.words
      .filter(word => word.definitions && word.definitions.join(', ').toLowerCase().includes(text))
      .slice(0, limit)
    return words
  }
  lookup(text) {
    let word = this.words.find(word => word && word.bare === text)
    return word
  }
  unique(a) {
    return a.filter((item, i, ar) => ar.indexOf(item) === i);
  }
  getWords() {
    return this.words
  }
  getWordsThatContain(text) {
    let words = this.words.filter(w => (w.head.includes(text)) || (w.bare.includes(text)))
    let strings = words
      .map((word) => word.bare)
      .concat(words.map((word) => word.head))
    return this.unique(strings)
  }
  lookupMultiple(text) {
    let words = this.words.filter(word => word && word.bare.toLowerCase() === text.toLowerCase())
    return words
  }

  async inflect(text) {
    return await this.inflector.inflectWithCache(text)
  }

  lookupFuzzy(text) {
    return this.lookupMultiple(text)
  }
  // Called from the dictionary page
  random() {
    return randomProperty(this.words)
  }
  accent(text) {
    return text.replace(/'/g, '́')
  }
  getSize() {
    return this.words.length
  }
}
