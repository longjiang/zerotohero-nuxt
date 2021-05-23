import axios from 'axios'
import Config from '@/lib/config'
import countries from './countries.js'
import domino from 'domino'
import $ from 'jquery'
import { parse } from 'node-html-parser'
import decode from 'unescape'

export default {
  hskColors: {
    1: '#f8b51e',
    2: '#267f94',
    3: '#fd4f1c',
    4: '#bb1718',
    5: '#1b3e76',
    6: '#6a3669',
    outside: '#c59f94'
  },
  hskWordCount: {
    1: 150,
    2: 150,
    3: 300,
    4: 600,
    5: 1300,
    6: 2500
  },
  loaderMessages: [],
  lastId: 0,
  topics: {
    animation: 'Animation',
    art: 'Art',
    engineering: 'Engineering',
    education: 'Education',
    entertainment: 'Entertainment',
    food: 'Food',
    geography: 'Geography',
    history: 'History',
    kids: 'Kids',
    language: 'Language',
    literature: 'Literature',
    music: 'Music',
    news: 'News',
    religion: 'Religion',
    science: 'Science',
    society: 'Society'
  },
  cjk: /[\u4E00-\u9FCC\u3400-\u4DB5\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]+/gi,
  nonCjk: /[^\u4E00-\u9FCC\u3400-\u4DB5\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]+/gi,
  levels(l2 = undefined) {
    if (l2 && l2.code === 'zh') {
      return {
        1: 'HSK 1',
        2: 'HSK 2',
        3: 'HSK 3',
        4: 'HSK 4',
        5: 'HSK 5',
        6: 'HSK 6',
        7: 'Outside HSK'
      }
    } else if (l2 && l2.code === 'ja') {
      return {
        1: 'Pre-N5',
        2: 'N5',
        3: 'N4',
        4: 'N3',
        5: 'N2',
        6: 'N1',
        7: 'C2'
      }
    } else {
      return {
        1: 'Pre-A1',
        2: 'A1',
        3: 'A2',
        4: 'B1',
        5: 'B2',
        6: 'C1',
        7: 'C2'
      }
    }
  },
  iOS() {
    return [
      'iPad Simulator',
      'iPhone Simulator',
      'iPod Simulator',
      'iPad',
      'iPhone',
      'iPod'
    ].includes(navigator.platform)
  },
  level(level, l2 = undefined) {
    let levels = this.levels(l2)
    return levels[level]
  },
  unescape(escapedHTML) {
    return decode(escapedHTML)
  },
  uniqueId() {
    this.lastId += 1
    return this.lastId
  },
  delay(ms) {
    return new Promise(res => setTimeout(res, ms))
  },
  splitByReg(text, reg) {
    let words = text.replace(reg, '!!!BREAKWORKD!!!$1!!!BREAKWORKD!!!').replace(/^!!!BREAKWORKD!!!/, '').replace(/!!!BREAKWORKD!!!$/, '')
    return words.split('!!!BREAKWORKD!!!')
  },
  timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  },
  uniqueByValue(array, key) {
    let flags = []
    let unique = []
    let l = array.length
    for (let i = 0; i < l; i++) {
      if (flags[array[i][key]]) continue
      flags[array[i][key]] = true
      unique.push(array[i])
    }
    return unique
  },
  flatten(object) {
    return Object.keys(object).reduce((r, k) => { return r.concat(object[k]) }, [])
  },
  // json or plain text only, and returns object
  async proxy(url, cacheLife = -1, encoding = false) {
    let response = await
      axios.get(
        `${Config.scrape2}?url=${encodeURIComponent(
          url
        )}&cache_life=${cacheLife}` + (encoding ? `&encoding=${encoding}` : '')
      )
    if (response.data) {
      return response.data
    } else {
      return false
    }
  },
  async scrape(url, cacheLife = -1, encoding = false) {
    return new Promise((resolve, reject) => {
      axios.get(
        `${Config.scrape2}?url=${encodeURIComponent(
          url
        )}&cache_life=${cacheLife}` + (encoding ? `&encoding=${encoding}` : '')
      ).then(response => {
        if (response) {
          var domimpl = domino.createDOMImplementation();
          var ownerDocument = domimpl.createHTMLDocument();
          if (typeof document !== 'undefined') {
            ownerDocument = document.implementation.createHTMLDocument('virtual')
            var $html = $(response.data, ownerDocument)
            resolve($html, ownerDocument, response)
          } else {
            resolve(false)
          }
        } else {
          resolve(false)
        }
      })
    })
  },
  highlight(text, word, level = false) {
    let levelAttr = level ? ` data-level="${level}"` : ''
    if (text && word && word.trim() !== '') {
      return text
        .replace(
          new RegExp('(' + word.replace(/\*/g, '[^，。！？,!.?]+?') + ')', 'gi'),
          `<span ${levelAttr} class="highlight">$1</span>`
        )
    } else {
      return text
    }
  },
  highlightMultiple(text, words, level) {
    if (text && words && words.length > 0) {
      for (let word of words) {
        text = this.highlight(text, word, level)
      }
      return text
    } else {
      return text
    }
  },
  /* http://hackingui.com/front-end/a-pure-css-solution-for-multiline-text-truncation/ */
  ellipsizeTextBox(el) {
    var wordArray = el.innerHTML.split(' ')
    while (el.scrollHeight > el.offsetHeight) {
      wordArray.pop()
      el.innerHTML = wordArray.join(' ') + '...'
    }
  },
  unique(names) {
    var uniqueNames = []
    $.each(names, function (i, el) {
      if ($.inArray(el, uniqueNames) === -1) uniqueNames.push(el)
    })
    return uniqueNames
  },
  country(code) {
    for (let country of countries) {
      if (country.code === code) {
        return country
      }
    }
  },
  // https://css-tricks.com/snippets/javascript/shuffle-array/
  shuffle(o) {
    for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
  },
  randomInt(max) {
    return Math.floor(Math.random() * Math.floor(max))
  },
  randomArrayItem(array, start = 0, length = false) {
    length = length || array.length
    array = array.slice(start, length)
    let index = Math.floor(Math.random() * array.length)
    return array[index]
  },
  ucFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
  },
  absoluteURL(base, relative) {
    if (relative.startsWith('http') || relative.startsWith('//')) {
      return relative
    }
    if (relative.startsWith('#')) {
      return base + relative
    }
    if (relative.startsWith('/')) {
      const protocal = base.replace(/(.*):\/\/.*/, '$1')
      const host = base.replace(/.*\/\/([^/]*).*/, '$1')
      return `${protocal}://${host}${relative}`
    }
    var stack = base.split('/'),
      parts = relative.split('/')
    stack.pop() // remove current file name (or empty string)
    // (omit if "base" is the current folder without trailing slash)
    for (var i = 0; i < parts.length; i++) {
      if (parts[i] == '.') continue
      if (parts[i] == '..') stack.pop()
      else stack.push(parts[i])
    }
    return stack.join('/')
  },
  isEmpty(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) return false
    }
    return true
  }
}
