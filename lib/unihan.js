import axios from 'axios'

export default {
  _data: [],
  async load() {
    let response = await axios.get('https://server.chinesezerotohero.com/data/unihan/Unihan_Variants.txt')
    this._data = response.data
      .split('\n')
      .filter(row => !row.startsWith('#'))
      .map(row => {
        let data = row.split('\t')
        if (data.length > 2) {
          let source = data[0].replace(/U\+/g, '0x')
          let target = data[2]
            .replace(/<.*/, '')
            .replace(/U\+/g, '0x')
            .split(' ')
          return {
            glyph: String.fromCodePoint(source),
            type: data[1],
            variants: target.map(item => String.fromCodePoint(item))
          }
        }
      })
    return this
  },
  variants(text) {
    if (text) {
      // '检查'
      let chars = text.split('') // ['检', '查']
      let word = [] // [['检', ''检'], ['查','查','查']]
      for (let char of chars) {
        let result = this._data.find(row => {
          return row && row.glyph === char
        })
        if (result) {
          word.push(result.variants.concat(char))
        } else {
          word.push([char])
        }
      }
      let wordVariants = word.reduce((aggregator, item) => {
        // aggregator = ['检', ''检']
        // item = ['查','查','查']
        let variants = []
        for (let a of aggregator) {
          for (let b of item) {
            variants.push(a + b)
          }
        }
        return variants
      })
      return wordVariants // including the origintal!

    }
  }
}
