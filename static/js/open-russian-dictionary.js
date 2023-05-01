importScripts('../vendor/localforage/localforage.js')
importScripts('../js/base-dictionary.js')

class OpenRussianDictionary extends BaseDictionary {

  constructor({ l1 = undefined, l2 = undefined } = {}) {
    super({l1, l2});
    this.file = `${SERVER}data/openrussian/words_with_definitions.csv.txt`
  }

  credit() {
    return 'The Russian dictionary is provided by <a href="https://en.openrussian.org/about">OpenRussian.org</a>, which is freely distribtued.';
  }

  async loadData() {
    let words = await this.loadAndNormalizeDictionaryData({ name: 'open-russian', file: this.file })
    words = words.filter(word => word && word.head)
    this.words = words
    words = null
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
