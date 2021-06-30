import axios from 'axios'
import Config from '@/lib/config'
import countries from './countries.js'
import $ from 'jquery'
import { parse } from 'node-html-parser'
import decode from 'unescape'
import { v4 as uuidv4 } from 'uuid';

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
  dictionaryTooLargeAndWillCauseServerCrash(l2){
    let tooLarge = ['fra', 'spa', 'hbs', 'ita', 'lat', 'por'].includes(l2)
    return tooLarge
  },
  isMobile() {
    if (typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      return true
    } else {
      return false
    }
  },
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
    let uniqueID = uuidv4()
    return uniqueID
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
  // https://stackoverflow.com/questions/38613654/javascript-find-unique-objects-in-array-based-on-multiple-properties
  uniqueByValues(arr, keyProps) {
    const kvArray = arr.map(entry => {
      const key = keyProps.map(k => entry[k]).join('|');
      return [key, entry];
    });
    const map = new Map(kvArray);
    return Array.from(map.values());
  },
  uniqueSort(items, uniqueKey, sortKey, order, locale) {
    return this.uniqueByValue(items, uniqueKey).sort((x, y) => {
      if (order === 'ascending') {
        return x[sortKey] ? x[sortKey].localeCompare(y[sortKey], locale, { numeric: true }) : 0
      } else {
        return y[sortKey] ? y[sortKey].localeCompare(x[sortKey], locale, { numeric: true }) : 0
      }
    })

  },
  flatten(object) {
    return Object.keys(object).reduce((r, k) => { return r.concat(object[k]) }, [])
  },
  // https://www.consolelog.io/group-by-in-javascript/
  groupArrayBy(array, prop) {
    return array.reduce(function (groups, item) {
      const val = item[prop]
      groups[val] = groups[val] || []
      groups[val].push(item)
      return groups
    }, {})
  },
  // https://stackoverflow.com/questions/8922107/javascript-scrollintoview-middle-alignment
  documentOffsetTop(element) {
    return element.offsetTop +
      (element.offsetParent ? this.documentOffsetTop(element.offsetParent) : 0);
  },
  // https://www.javascripttutorial.net/dom/css/check-if-an-element-is-visible-in-the-viewport/
  isInViewport(element, offsetTop = 0, offsetBottom = 0) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= offsetTop &&
      rect.left >= 0 &&
      rect.bottom <= ((window.innerHeight || document.documentElement.clientHeight) - offsetBottom) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },
  elementHeight(element, offset = 0) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= offset &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
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
  async proxyParsed(url, cacheLife = -1, encoding = false) {
    let html = await this.proxy(url, cacheLife, encoding)
    return parse(html)
  },
  async scrape(url, cacheLife = -1, encoding = false) {
    return new Promise((resolve, reject) => {
      axios.get(
        `${Config.scrape2}?url=${encodeURIComponent(
          url
        )}&cache_life=${cacheLife}` + (encoding ? `&encoding=${encoding}` : '')
      ).then(response => {
        if (response) {
          if (typeof document !== 'undefined') {
            let ownerDocument = document.implementation.createHTMLDocument('virtual')
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
  speak(text, l2, rate = 0.75, volume = 1, localOnly = false) {
    let voices = speechSynthesis.getVoices()
    if (localOnly) {
      voices = voices.filter(voice => voice.localService === true)
    }
    let availableLocales = voices.map((voice) => voice.lang)
    let preferredLocales = [l2.code]
    if (l2.code === 'yue') preferredLocales = ['zh-HK'].concat(preferredLocales)
    if (l2.code === 'en') preferredLocales = ['en-US'].concat(preferredLocales)
    if (l2.locales)
      preferredLocales = preferredLocales.concat(l2.locales)
    let bestLocale = preferredLocales.find(preferredLocale => availableLocales.includes(preferredLocale))
    if (bestLocale) {
      let bestVoice = voices.find(voice => voice.lang === bestLocale)
      if (bestVoice) {
        var utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = bestLocale
        utterance.voice = bestVoice
        utterance.rate = rate
        utterance.volume = volume

        return new Promise(function (resolve) {
          utterance.onend = resolve;
          utterance.onerror = resolve;
          // console.log('🌲 Started speaking')
          speechSynthesis.speak(utterance);
          // console.log(utterance)
          // console.log(speechSynthesis)
        });
        // console.log('🍁 finished speaking')
      }
    }
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
  unique(a) {
    return a.filter((item, i, ar) => ar.indexOf(item) === i);
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
  stripTags(html) {
    let root = parse(html)
    return root.textContent || root.innerHTML || ''
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
