import Papa from 'papaparse'
import axios from 'axios'
import { uniqueByValue } from './utils/array'

export default {
  _grammarData: [],
  _grammarCSV: 'https://server.chinesezerotohero.com/data/zh-grammar/zh-grammar.csv.txt',

  isChinese(text) {
    if (this.matchChinese(text)) return true
  },
  matchChinese(text) {
    return text.match(
      // eslint-disable-next-line no-irregular-whitespace
      /[\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u3005\u3007\u3021-\u3029\u3038-\u303B‌​\u3400-\u4DB5\u4E00-\u9FCC\uF900-\uFA6D\uFA70-\uFAD9]+/g
    )
  },

  async load() {
    let response = await axios.get(this._grammarCSV)
    let results = Papa.parse(response.data, {
      header: true,
    })

    for (let row of results.data) {
      var result = row
      result.book = result.code.replace(/^([^.]+).*/, '$1')
      result.level = result.level || result.book
      result.lesson = parseInt(
        result.code.replace(/^(\d)\.(\d+).*/, '$2')
      )
      result.number = parseInt(
        result.code.replace(/^(\d)\.(\d+)\.(\d+).*/, '$3')
      )
      result.words = this.matchChinese(result.structure)
      if (result.pattern) result.regex = new RegExp(result.pattern.replace(/\*/g, '.+').replace(/_/g, '.'), 'gi')
      this._grammarData.push(result)
    }
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
    var books = Helper.groupArrayBy(this._grammarData, 'book')
    for (var book in books) {
      books[book] = Helper.groupArrayBy(books[book], 'lesson')
    }
    return books
  },

  findInText(text) {
    let matched = this._grammarData.filter(row => {
      let regex = row.regex
      if (row.pattern.length > 1 && regex) {
        let test = regex.test(text)
        return test
      }
    })
    matched = uniqueByValue(matched)
    return matched
  }
}
