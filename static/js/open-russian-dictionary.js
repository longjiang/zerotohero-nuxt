importScripts('../vendor/localforage/localforage.js')
importScripts('../js/base-dictionary.js')

class OpenRussianDictionary extends BaseDictionary {

  constructor({ l1 = undefined, l2 = undefined } = {}) {
    super({l1, l2});
    this.file = `${SERVER}data/openrussian/words_with_definitions_pronunciation.csv.txt`
    this.wiktionaryFile = "https://server.chinesezerotohero.com/data/wiktionary-csv/rus-eng.csv.txt"
    this.indexDbVerByLang = {
      rus: '2.18.7',
    };
  }

  credit() {
    return 'The Russian dictionary is provided by <a href="https://en.openrussian.org/about">OpenRussian.org</a>, which is freely distribtued.';
  }

  async loadData() {
    let words = await this.loadAndNormalizeDictionaryData({ name: 'open-russian', file: this.file })
    let wiktionaryWords = await this.loadDictionaryData({ name: `wiktionary-rus-eng`, file: this.wiktionaryFile })
    words = words.filter(word => word && word.head)
    wiktionaryWords.forEach(this.normalizeWiktionaryWord)
    this.words = [...words, ...wiktionaryWords];
    words = null
    wiktionaryWords = null
  }

  // Normalizes the input 'row' object and modifies it in place.
  normalizeWord(row) {
    if (row.head) {
      if (row.accented) {
        row.accented = addAccentMarks(row.accented);
      }
      row.bare = row.head
      row.search = row.head.toLowerCase()
      row.definitions = row.definitions.split('|')
    }
  }

  normalizeWiktionaryWord(item) {
    const head = item.word.replace(/^\-/, '')
    item.head = head;
    item.bare = head;
    item.search = head.toLowerCase();
    item.definitions = item.definitions ? item.definitions.split("|") : [];
    item.id = "w" + hash(item.head + item.definitions[0]);
    delete item.han;
    delete item.word;
    delete item.stems
    delete item.phrases
  }
  
  lookup(text) {
    let word = this.words.find(word => word && word.bare === text)
    return word
  }
  
  lookupMultiple(text) {
    let words = this.words.filter(word => word && word.bare.toLowerCase() === text.toLowerCase())
    return words
  }

  lookupFuzzy(text) {
    return this.lookupMultiple(text)
  }
}
