export default {
  _merged: [],
  _weightHash: {},
  _cedictData: [],
  _cedictWeightsData: [],
  _hskData: [],
  _cedictFile: 'data/cedict_ts.u8.txt',
  _cedictWeightsCSV: 'data/cedict_weights.csv',
  _hskCSV: 'data/HSK 1-6 Vocabulary/HSK Standard Course 1-6-Table 1.csv',
  _hskFields: {
    hskId: 'Id',
    simplified: 'Simplified',
    traditional: 'Traditional',
    pinyin: 'Pinyin',
    definitions: 'English',
    book: 'Book',
    hsk: 'HSK',
    lesson: 'Lesson',
    dialog: 'Dialog',
    nw: 'NW',
    example: 'Example',
    exampleTranslation: 'Translation',
    oofc: 'OofC',
    pn: 'PN'
  },
  loadHSK(callback) {
    Papa.parse(this._hskCSV, {
      download: true,
      header: true,
      complete: results => {
        for (let row of results.data) {
          var result = {}
          for (var index in this._hskFields) {
            result[index] = row[this._hskFields[index]]
          }
          // result.index = 0
          Object.freeze(result)
          this._hskData.push(result)
        }
        callback()
      }
    })
  },
  parsePinyin(pinyin) {
    return pinyinify(pinyin.replace(/u:/gi, 'ü')) // use the pinyinify library to parse tones
      .replace(/\d/g, '') // pinyinify does not handle 'r5', we remove all digits
  },
  loadCEDICTWeights(callback) {
    Papa.parse(this._cedictWeightsCSV, {
      download: true,
      header: true,
      complete: results => {
        let same = {
          traditional: undefined,
          pinyin: undefined,
          count: 0
        }
        this._cedictWeightsData = results.data
        for (let row of this._cedictWeightsData) {
          // if(row.simplified === '向') {
          //   console.log(row)
          // }
          row.pinyin = row.pinyin ? this.parsePinyin(row.pinyin) : ''
          if (
            row.traditional === same.traditional &&
            row.pinyin === same.pinyin
          ) {
            same.count++
            row.index = same.count
          } else {
            same = {
              traditional: row.traditional,
              pinyin: row.pinyin,
              count: 0
            }
            row.index = 0
          }
          row.identifier = `${row.traditional},${row.pinyin.replace(
            / /g,
            '_'
          )},${row.index}`
          this._weightHash[row.identifier] = row.weight
          Object.freeze(row)
        }
        callback()
      }
    })
  },
  loadCEDICT(callback) {
    let xhttp = new XMLHttpRequest()
    let that = this
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        that.loadCEDICTData(this.responseText, callback)
      }
    }
    xhttp.open('GET', this._cedictFile, true) // Use .txt extension so gzip will work with it
    xhttp.setRequestHeader('Cache-Control', 'max-age=3600')
    xhttp.send()
  },
  loadCEDICTData(cedictText, callback) {
    let same = {
      traditional: undefined,
      pinyin: undefined,
      count: 0
    }
    for (let line of cedictText.split('\n')) {
      if (!line.startsWith('#')) {
        line = line.replace(/\[.+?\]/g, m => this.parsePinyin(m))
        const matches = line.match(/^([^\s]+) ([^\s]+) \[(.+)\] \/(.*)\//)
        if (matches) {
          let row = {
            simplified: matches[2],
            traditional: matches[1],
            pinyin: matches[3],
            definitions: matches[4],
            index: 0 // for homonyms
          }
          if (
            row.traditional === same.traditional &&
            row.pinyin === same.pinyin
          ) {
            same.count++
            row.index = same.count
          } else {
            same = {
              traditional: row.traditional,
              pinyin: row.pinyin,
              count: 0
            }
          }
          Object.freeze(row)
          if (row) this._cedictData.push(row)
        }
      }
    }
    callback()
  },
  getHSK(simplified, pinyin) {
    return this._hskData.filter(function(row) {
      return (
        row.simplified === simplified &&
        row.pinyin.toLowerCase() === pinyin.toLowerCase() &&
        row.oofc === ''
      )
    })
  },
  assignHSK(cedictWord) {
    const hskWords = this.getHSK(cedictWord.simplified, cedictWord.pinyin)
    if (hskWords.length > 0) {
      const hskWord = Object.assign({}, hskWords[0])
      const result = Object.assign(hskWord, cedictWord)
      return result
    } else {
      let emptyHSKWord = {}
      for (let field in this._hskFields) {
        emptyHSKWord[field] = ''
      }
      emptyHSKWord.hsk = 'outside'
      emptyHSKWord.weight = 0
      const result = Object.assign(emptyHSKWord, cedictWord)
      return result
    }
  },
  download(filename, text) {
    var element = document.createElement('a')
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(text)
    )
    element.setAttribute('download', filename)

    element.style.display = 'none'
    document.body.appendChild(element)

    element.click()

    document.body.removeChild(element)
  },
  findHSKNotInCEDICT() {
    return this._hskData.filter(
      h => !this._cedictData.find(c => c.simplified === h.simplified)
    )
  },
  merge() {
    console.log('Merging...')
    this._merged = []
    for (let c of this._cedictData) {
      let row = Object.assign({}, c)
      let identifier = `${row.traditional},${row.pinyin.replace(/ /g, '_')},${
        row.index
      }`
      let w = this._weightHash[identifier]
      row.weight = w ? w : 0
      this._merged.push(this.assignHSK(row))
    }
    this._merged = this._merged
      .concat(this.findHSKNotInCEDICT())
      .sort(function(a, b) {
        return b.definitions.length - a.definitions.length
      })
      .sort(function(a, b) {
        return b.weight - a.weight
      })
      .sort(function(a, b) {
        return b.simplified.length - a.simplified.length
      })
    console.log('Merged, generating CSV...')
    window.csv = Papa.unparse(this._merged)
    console.log(
      'CSV ready. Type `copy(csv)` in the console to copy to clipboard.'
    )
  }
}
