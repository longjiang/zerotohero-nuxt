importScripts("../vendor/localforage/localforage.js")
importScripts('../js/base-dictionary.js')

class FreedictDictionary extends BaseDictionary {

  credit() {
    return 'The dictionary is provided by <a href="https://freedict.org/">FreeDict</a> dict, open-source and <a href="https://freedict.org/about/">freely distribtued</a>.'
  }
  
  
  async loadData() {
    console.log('Loading FreeDict...')
    let l1Code = this.l1['iso639-3']
    let l2Code = this.l2['iso639-3']
    let words = await this.loadAndNormalizeDictionaryData({ name: `freedict-${l1Code}-${l2Code}`, file: this.dictionaryFile({l1Code, l2Code}) })
    this.words = words
  }

  dictionaryFile({l1Code, l2Code}) {
    let filename = `${SERVER}data/freedict/${l2Code}-${l1Code}.dict.txt`
    return filename
  }
  
  parseDictionaryData({ data }) { 
    data = data.replace(/^[^\n]*\n/m, '') // remove title line
    console.log('Parsing FreeDict Dictionary data...')
    let lines = data.split('\n')
    let words = []
    words = this.parseLines(lines)
    words.forEach((word) => {
      word.id = "f" + hash(word.head + word.definitions[0]);
    })
    return words
  }

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
        const bare = matches ? stripAccents(matches[1]) : undefined
        const head = matches ? matches[1] : undefined
        const pronunciation = matches ? matches[2] : undefined
        const pos = matches2 && matches2.length > 1 ? matches2[1] : undefined
        let word = {
          bare,
          head,
          search: bare.toLowerCase(),
          accented: head,
          pronunciation,
          definitions,
          pos
        }
        words.push(word)
      }
    }
    return words
  }

  normalizeWord(word) {
    // Already normalized, so do nothing
  }

}