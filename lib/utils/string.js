import decode from 'unescape'
import { parse } from 'node-html-parser'
import { unique } from './array'
import { escapeRegExp } from './regex'

export const STYLIZED_NUMBERS = [
  '⓪①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳㉑㉒㉓㉔㉕㉖㉗㉘㉙㉚㉛㉜㉝㉞㉟㊱㊲㊳㊴㊵㊶㊷㊸㊹㊺㊻㊼㊽㊾㊿',
  '🄋➀➁➂➃➄➅➆➇➈➉',
  '⓿❶❷❸❹❺❻❼❽❾❿⓫⓬⓭⓮⓯⓰⓱⓲⓳⓴',
  '🄌➊➋➌➍➎➏➐➑➒➓',
  '⓪⓵⓶⓷⓸⓹⓺⓻⓼⓽⓾',
  '🄀⒈⒉⒊⒋⒌⒍⒎⒏⒐⒑⒒⒓⒔⒕⒖⒗⒘⒙⒚⒛',
  '⓪⑴⑵⑶⑷⑸⑹⑺⑻⑼⑽⑾⑿⒀⒁⒂⒃⒄⒅⒆⒇',
  '⓪㊀㊁㊂㊃㊄㊅㊆㊇㊈㊉'
]

export const roundTo = (n, dec = 2) => {
  return Math.round(n * Math.pow(10, dec)) / Math.pow(10, dec)
}
export const normalizeCircleNumber = (circleNumber) => {
  for (let stylizedNumbers of STYLIZED_NUMBERS) {
    let number = stylizedNumbers.indexOf(circleNumber)
    if (number !== -1) return number
  }
}
export const normalizeCircleNumbers = (text) => {
  let normalized = text
  for (let stylizedNumbers of STYLIZED_NUMBERS) {
    let regex = new RegExp(`[${stylizedNumbers}]`, 'g')
    let matches = normalized.match(
      regex
    );
    if (matches) {
      for (let m of matches) {
        normalized = normalized.replace(m, `[${this.normalizeCircleNumber(m)}]`)
      }
    }
  }
  return normalized;
}
export const unescape = (escapedHTML) => {
  return decode(escapedHTML)
}
export const splitByReg = (text, reg) => {
  let words = text.replace(reg, '!!!BREAKWORKD!!!$1!!!BREAKWORKD!!!').replace(/^!!!BREAKWORKD!!!/, '').replace(/!!!BREAKWORKD!!!$/, '')
  return words.split('!!!BREAKWORKD!!!')
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

// https://stackoverflow.com/questions/48731396/javascript-unique-string-array-case-insensitive-but-keep-one-case-sensitive-resu
export const uniqueIgnoreCase = (names) => {
  let uNames = new Map(names.map(s => [s.toLowerCase(), s]));
  return [...uNames.values()]
}

export const stripTags = (html) => {
  let root = parse(html)
  return root.textContent || root.innerHTML || ''
}

export const ucFirst = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1)
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