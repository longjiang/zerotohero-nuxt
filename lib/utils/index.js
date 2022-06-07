import axios from 'axios'
import $ from 'jquery'
import decode from 'unescape'
import escapeStringRegexp from 'escape-string-regexp'
import { parse } from 'node-html-parser'
import { v4 as uuidv4 } from 'uuid';
import Config from '../config'
import countries from '../countries'
export { default as timeout } from './timeout'
export { default as speak } from './speak'
export { default as SPECIAL_LANGUAGES } from './special-languages'
export { DEFAULT_BACKGROUND_IMAGE, background } from './background'
export { default as SAMPLE_TEXT } from './sample-text'
export * from './language';
import { LEVELS, languageLevels } from './levels'
export { LEVELS, languageLevels }
import EXAMS from './exams'
export { EXAMS }
import { CJK, NON_CJK, characterClass } from './regex'
export { CJK, NON_CJK, characterClass }


export const hskColors = {
  1: '#f8b51e',
  2: '#267f94',
  3: '#fd4f1c',
  4: '#bb1718',
  5: '#1b3e76',
  6: '#6a3669',
  outside: '#28a745'
}
export const hskWordCount = {
  1: 150,
  2: 150,
  3: 300,
  4: 600,
  5: 1300,
  6: 2500
}
export const loaderMessages = []
export const topics = {
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
}
export const stylizedNumbers = [
  '⓪①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳㉑㉒㉓㉔㉕㉖㉗㉘㉙㉚㉛㉜㉝㉞㉟㊱㊲㊳㊴㊵㊶㊷㊸㊹㊺㊻㊼㊽㊾㊿',
  '🄋➀➁➂➃➄➅➆➇➈➉',
  '⓿❶❷❸❹❺❻❼❽❾❿⓫⓬⓭⓮⓯⓰⓱⓲⓳⓴',
  '🄌➊➋➌➍➎➏➐➑➒➓',
  '⓪⓵⓶⓷⓸⓹⓺⓻⓼⓽⓾',
  '🄀⒈⒉⒊⒋⒌⒍⒎⒏⒐⒑⒒⒓⒔⒕⒖⒗⒘⒙⒚⒛',
  '⓪⑴⑵⑶⑷⑸⑹⑺⑻⑼⑽⑾⑿⒀⒁⒂⒃⒄⒅⒆⒇',
  '⓪㊀㊁㊂㊃㊄㊅㊆㊇㊈㊉'
]

export const logError = (error, tag) => {
  if (!tag) tag = 'Error'
  if (error.response) {
    // Request made and server responded
    let { data, status, headers } = error.response
    console.log(tag, { data, status, headers });
  } else if (error.request) {
    // The request was made but no response was received
    console.log(tag, { request: error.request });
  } else {
    // Something happened in setting up the request that triggered an Error
    console.log(tag, { message: error.message });
  }
}
export const dictionaryTooLargeAndWillCauseServerCrash = (l2) => {
  let tooLarge = ['lat', 'spa', 'deu', 'ita', 'fra', 'por'].includes(l2)
  return tooLarge
}
export const isMobile = () => {
  if (typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    return true
  } else {
    return false
  }
}
export const normalizeCircleNumber = (circleNumber) => {
  for (let stylizedNumbers of stylizedNumbers) {
    let number = stylizedNumbers.indexOf(circleNumber)
    if (number !== -1) return number
  }
}
export const normalizeCircleNumbers = (text) => {
  let normalized = text
  for (let stylizedNumbers of stylizedNumbers) {
    let regex = new RegExp(`[${stylizedNumbers}]`, 'g')
    let matches = normalized.match(
      regex
    );
    if (matches) {
      for (let m of matches) {
        normalized = normalized.replace(m, `[${normalizeCircleNumber(m)}]`)
      }
    }
  }
  return normalized;
}
export const languageHours = (language) => {
  let baseHours = language.hours || 1100
  let levels = Object.assign({}, LEVELS)
  let hours = {}
  for (let level in levels) {
    hours[level] = baseHours * levels[level].hoursMultiplier
  }
  return hours
}
export const iOS = () => {
  return [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod'
  ].includes(navigator.platform)
}
export const wide = () => {
  return typeof window !== "undefined" && window.innerWidth > 991;
}
export const level = (level, l2 = undefined) => {
  let levels = languageLevels(l2)
  return levels[level]
}
export const unescape = (escapedHTML) => {
  return decode(escapedHTML)
}
export const uniqueId = () => {
  let uniqueID = uuidv4()
  return uniqueID
}
export const splitByReg = (text, reg) => {
  let words = text.replace(reg, '!!!BREAKWORKD!!!$1!!!BREAKWORKD!!!').replace(/^!!!BREAKWORKD!!!/, '').replace(/!!!BREAKWORKD!!!$/, '')
  return words.split('!!!BREAKWORKD!!!')
}

export const uniqueByValue = (array, key) => {
  let flags = []
  let unique = []
  let l = array.length
  for (let i = 0; i < l; i++) {
    if (flags[array[i][key]]) continue
    flags[array[i][key]] = true
    unique.push(array[i])
  }
  return unique
}
// https://stackoverflow.com/questions/38613654/javascript-find-unique-objects-in-array-based-on-multiple-properties
export const uniqueByValues = (arr, keyProps) => {
  const kvArray = arr.map(entry => {
    const key = keyProps.map(k => entry[k]).join('|');
    return [key, entry];
  });
  const map = new Map(kvArray);
  return Array.from(map.values());
}
export const uniqueSort = (items, uniqueKey, sortKey, order, locale) => {
  return uniqueByValue(items, uniqueKey).sort((x, y) => {
    if (order === 'ascending') {
      return x[sortKey] ? x[sortKey].localeCompare(y[sortKey], locale, { numeric: true }) : 0
    } else {
      return y[sortKey] ? y[sortKey].localeCompare(x[sortKey], locale, { numeric: true }) : 0
    }
  })

}
export const flatten = (object) => {
  return Object.keys(object).reduce((r, k) => { return r.concat(object[k]) }, [])
}
// https://www.consolelog.io/group-by-in-javascript/
export const groupArrayBy = (array, prop) => {
  return array.reduce(function (groups, item) {
    const val = item[prop]
    groups[val] = groups[val] || []
    groups[val].push(item)
    return groups
  }, {})
}
// https://stackoverflow.com/questions/8922107/javascript-scrollintoview-middle-alignment
export const documentOffsetTop = (element) => {
  return element.offsetTop +
    (element.offsetParent ? documentOffsetTop(element.offsetParent) : 0);
}
export const scrollToTargetAdjusted = (element, headerOffset, behavior = 'smooth') => {
  var elementPosition = element.getBoundingClientRect().top;
  var offsetPosition = elementPosition + window.pageYOffset - headerOffset;

  window.scrollTo({
    top: offsetPosition,
    behavior
  });
}
// https://www.javascripttutorial.net/dom/css/check-if-an-element-is-visible-in-the-viewport/
export const isInViewport = (element, offsetTop = 0, offsetBottom = 0) => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= offsetTop &&
    rect.left >= 0 &&
    rect.bottom <= ((window.innerHeight || document.documentElement.clientHeight) - offsetBottom) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}
export const elementHeight = (element, offset = 0) => {
  const rect = element.getBoundingClientRect();
  return rect.bottom - rect.top
}
/**
 * Get the content from an URL via a caching proxy server
 * @param {string} url the url to proxy
 * @param {Object} options cacheLife is in seconds, -1 means never clear cache, 0 means clear cache immediately
 * @returns if the response data is text, returns text; if the response data is json, returns an object
 */
export const proxy = async (url, { cacheLife = -1, encoding = false } = {}) => {
  try {
    let proxyURL = `${Config.scrape2}?url=${encodeURIComponent(
      url
    )}&cache_life=${cacheLife}` + (encoding ? `&encoding=${encoding}` : '')
    let response = await
      axios.get(
        proxyURL
      )
    if (response.data) {
      return response.data
    }
  } catch (err) {
    console.log(`Helper.proxy() cannot get ${url}`)
  }
  return false
}
export const proxyParsed = async (url, cacheLife = -1, encoding = false) => {
  let html = await proxy(url, { cacheLife, encoding })
  return parse(html)
}
export const scrape = async (url, cacheLife = -1, encoding = false) => {
  try {
    let response = await axios.get(
      `${Config.scrape2}?url=${encodeURIComponent(
        url
      )}&cache_life=${cacheLife}` + (encoding ? `&encoding=${encoding}` : '')
    )
    if (response && response.data) {
      if (typeof document !== 'undefined') {
        let ownerDocument = document.implementation.createHTMLDocument('virtual')
        var $html = $(response.data, ownerDocument)
        return $html
      }
    }
  } catch (err) {
    console.log(`Helper.scrape() cannot get ${url}`)
  }
}
export const highlight = (text, word, level = false) => {
  let levelAttr = level ? ` data-level="${level}"` : ''
  if (text && word && word.trim() !== '') {
    return text
      .replace(
        new RegExp('(' + escapeRegExp(word).replace(/\*/g, '[^，。！？,!.?]+?') + ')', 'gi'),
        `<span ${levelAttr} class="highlight">$1</span>`
      )
  } else {
    return text
  }
}
// https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
export const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
export const highlightMultiple = (text, words, level) => {
  if (!words) return text
  let sortedWords = unique(words)
  sortedWords = sortedWords.sort((a, b) => b.length - a.length)
  if (text && sortedWords && sortedWords.length > 0) {
    for (let word of sortedWords) {
      text = highlight(text, word, level)
    }
    return text
  } else {
    return text
  }
}
/* http://hackingui.com/front-end/a-pure-css-solution-for-multiline-text-truncation/ */
export const ellipsizeTextBox = (el) => {
  var wordArray = el.innerHTML.split(' ')
  while (el.scrollHeight > el.offsetHeight) {
    wordArray.pop()
    el.innerHTML = wordArray.join(' ') + '...'
  }
}
export const unique = (a) => {
  return a.filter((item, i, ar) => ar.indexOf(item) === i);
}
/*
 * If we have an array ['ad', 'adi', 'adim'], this will filter out 'adi' and 'adim' and give you ['ad']
 */
export const mutuallyExclusive = (a) => {
  let mutuallyExclusive = []
  for (let igenek of a) {
    let pass = true
    for (let igen of a) {
      if (igenek !== igen && igenek.includes(igen)) pass = false
    }
    if (pass) mutuallyExclusive.push(igenek)
  }
  return mutuallyExclusive
}
// https://stackoverflow.com/questions/48731396/javascript-unique-string-array-case-insensitive-but-keep-one-case-sensitive-resu
export const uniqueIgnoreCase = (names) => {
  let uNames = new Map(names.map(s => [s.toLowerCase(), s]));
  return [...uNames.values()]
}
export const country = (code) => {
  for (let country of countries) {
    if (country.code === code) {
      return country
    }
  }
}
// https://css-tricks.com/snippets/javascript/shuffle-array/
// THIS MUTATES THE ARRAY!
export const shuffle = (o) => {
  for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
}
export const stripTags = (html) => {
  let root = parse(html)
  return root.textContent || root.innerHTML || ''
}
export const randomInt = (max) => {
  return Math.floor(Math.random() * Math.floor(max))
}
export const randomArrayItem = (array, start = 0, length = false) => {
  length = length || array.length
  array = array.slice(start, length)
  let index = Math.floor(Math.random() * array.length)
  return array[index]
}
export const ucFirst = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1)
}
export const absoluteURL = (base, relative) => {
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
}
export const isEmpty = (obj) => {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) return false
  }
  return true
}
export const randBase64 = (length) => {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() *
      charactersLength));
  }
  return result;
}
export const arrayChunk = (array, chunk = 10) => {
  var i, j, temporary;
  var chunks = []
  for (i = 0, j = array.length; i < j; i += chunk) {
    temporary = array.slice(i, i + chunk);
    chunks.push(temporary)
  }
  return chunks
}
export const makeTextFile = (text) => {
  if (typeof window !== 'undefined') {
    var data = new Blob([text], { type: "text/plain" });
    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks.
    if (textFile !== null) {
      window.URL.revokeObjectURL(textFile);
    }

    var textFile = window.URL.createObjectURL(data);
    // returns a URL you can use as a href
    return textFile;
  }
}
export const portrait = () => {
  let landscape =
    typeof window !== "undefined" && window.innerWidth < window.innerHeight;
  return landscape;
}
export const roundTo = (n, dec = 2) => {
  return Math.round(n * Math.pow(10, dec)) / Math.pow(10, dec)
}
export const formatK = (n, dec = 2) => {
  if (n >= Math.pow(10, 12)) {
    return roundTo(n / Math.pow(10, 12), dec) + "T"
  }
  if (n >= Math.pow(10, 9)) {
    return roundTo(n / Math.pow(10, 9), dec) + "B"
  }
  if (n >= Math.pow(10, 6)) {
    return roundTo(n / Math.pow(10, 6), dec) + "M"
  }
  if (n >= Math.pow(10, 3)) {
    return roundTo(n / Math.pow(10, 3), dec) + "K"
  }
  return n
}
//https://stackoverflow.com/questions/1714786/query-string-encoding-of-a-javascript-object
export const queryString = (obj) => {
  var str = [];
  for (var p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(p + "=" + encodeURIComponent(obj[p]));
    }
  return str.join("&");
}
