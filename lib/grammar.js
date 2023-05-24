import Papa from 'papaparse'
import axios from 'axios'
import { uniqueByValue, groupArrayBy } from './utils'

export default {
  serverPath: '/grammar/',
  l1: undefined,
  l2: undefined,
  _grammarData: [],
  _grammarCSVs: {
    'zho': 'zh-grammar.csv.txt',
    'jpn': 'ja-grammar.csv.txt',
    'kor': 'ko-grammar.csv.txt',
  },
  getCSVSource(l2) {
    if (!this._grammarCSVs[l2]) return
    return this.serverPath + this._grammarCSVs[l2]
  },
  isChinese(text) {
    if (this.matchChinese(text)) return true
  },
  matchChinese(text) {
    return text.match(
      // eslint-disable-next-line no-irregular-whitespace
      /[\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u3005\u3007\u3021-\u3029\u3038-\u303B‌​\u3400-\u4DB5\u4E00-\u9FCC\uF900-\uFA6D\uFA70-\uFAD9]+/g
    )
  },

  async load({ l1 = undefined, l2 = undefined } = {}) {
    if (this.l1 === l1 && this.l2 === l2) return this // Already loaded
    this.l1 = l1
    this.l2 = l2
    let csvSource = this.getCSVSource(l2)
    if (!csvSource) return
    let response = await axios.get(csvSource)
    let results = Papa.parse(response.data, {
      header: true,
    })

    let grammarData = []

    for (let row of results.data) {
      var result = row
      result.book = result.code.replace(/^([^.]+).*/, '$1')
      let level = result.level || result.book
      if (level === '7-9') level = '7' // Legacy for Chinese HSK 7-9 (should be 7 instead)
      result.level = level
      result.lesson = parseInt(
        result.code.replace(/^(\d)\.(\d+).*/, '$2')
      )
      result.number = parseInt(
        result.code.replace(/^(\d)\.(\d+)\.(\d+).*/, '$3')
      )
      result.words = this.matchChinese(result.structure)
      if (result.pattern) result.patterns = result.pattern.split("|")
      else result.patterns = []
      result.regex = result.patterns.map(p => new RegExp(p.replace(/\*/g, '.+').replace(/_/g, '.'), 'gi'))
      grammarData.push(result)
    }
    this._grammarData = grammarData
    console.log('Grammar library ready.')
    return this
  },

  get(id) {
    return this._grammarData.find(function(row) {
      return parseInt(row.id) === parseInt(id)
    })
  },

  count() {
    return this._grammarData.length
  },

  lookup(code) {
    return this._grammarData.filter(function(row) {
      return row.code === code
    })
  },

  lookupFuzzy(term) {
    term = term.toLowerCase()
    return this._grammarData.filter(function(row) {
      return (
        row.code.includes(term) ||
        row.structure.includes(term) ||
        row.english.includes(term)
      )
    })
  },

  list() {
    return this._grammarData
  },

  listWhere(filterFunction) {
    return this._grammarData.filter(filterFunction)
  },

  listByBook(book) {
    var getFilterFunction = function(book) {
      return function(row) {
        return row.book === parseInt(book)
      }
    }
    return this.listWhere(getFilterFunction(book))
  },

  listByBookLesson(book, lesson) {
    var getFilterFunction = function(book, lesson) {
      return function(row) {
        return row.book === parseInt(book) && row.lesson === parseInt(lesson)
      }
    }
    return this.listWhere(getFilterFunction(book, lesson))
  },

  firstId() {
    const min = Math.min(
      ...this._grammarData.map(function(row) {
        return row.id
      })
    )
    return min
  },

  lastId() {
    const max = Math.max(
      ...this._grammarData.map(function(row) {
        return row.id
      })
    )
    return max
  },

  hasPrevious(id) {
    return id > this.first()
  },

  hasNext(id) {
    return id < this.last()
  },

  compileBooks() {
    // https://www.consolelog.io/group-by-in-javascript/
    var books = groupArrayBy(this._grammarData, 'book')
    for (var book in books) {
      books[book] = groupArrayBy(books[book], 'lesson')
    }
    return books
  },

  findInText(text, level) {
    let matched = this._grammarData.filter(row => {
      if (level && row.level <= level) return false
      if (row.regex.length > 0) {
        let pass = false
        for (let regex of row.regex) {
          if (regex.test(text)) pass = true
        }
        return pass
      }
    })
    matched = uniqueByValue(matched, 'id')
    return matched
  }
}
