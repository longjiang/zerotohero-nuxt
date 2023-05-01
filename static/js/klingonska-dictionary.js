importScripts("../vendor/localforage/localforage.js")
importScripts('../js/base-dictionary.js')

class KlingonskaDictionary extends BaseDictionary {
  constructor({ l1 = undefined, l2 = undefined } = {}) {
    super({ l1, l2 });
    this.file = 'https://server.chinesezerotohero.com/data/klingonska/dict.zdb.txt';
  }

  credit() {
    return 'The Klingon dictionary is provided by <a href="http://klingonska.org/dict/">klingonska.org</a>.'
  }
  
  async loadData() {
    console.log('Loading Klingonska dictionary...')
    let words = await this.loadAndNormalizeDictionaryData({ name: 'klingonska', file: this.file })
    this.words = words
  }

  parseDictionaryData({ data }) {
    const lines = data.split('\n\n')
    let words = []
    for (let block of lines) {
      let item = {}
      for (let line of block.split('\n')) {
        let pair = line.split(':\t')
        if (pair.length > 0) {
          let key = pair[0]
          let value = pair[1]
          item[key] = value
        }
      }
      if (item.tlh) {
        words.push(item)
      }
    }
    return words
  }

  normalizeWord(item) {
    const head = item.tlh.replace(/.*\{(.*)\}.*/, '$1') || undefined
    const definitions = [item.en.replace(/[<>«»]/g, '')]
    Object.assign(item, {
      head,
      bare: head,
      accented: head,
      search: head,
      pronunciation:
        item.pronunciations && item.pronunciations[0].ipa
          ? item.pronunciations[0].ipa[0][1].replace(/\//g, '')
          : undefined,
      definitions,
      pos: item.pos,
      id: "k" + hash(head + definitions[0])
    })
  }
}
