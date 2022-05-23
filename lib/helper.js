import axios from 'axios'
import Config from '@/lib/config'
import countries from './countries.js'
import $ from 'jquery'
import { parse } from 'node-html-parser'
import decode from 'unescape'
import { v4 as uuidv4 } from 'uuid';
import escapeStringRegexp from 'escape-string-regexp'

export default {
  specialLanguages: {
    lzh: {
      name: "文言文",
      l1: "zh",
    },
    och: {
      name: "上古汉语",
      l1: "zh",
    },
    ltc: {
      name: "中古汉语",
      l1: "zh",
    },
    hak: {
      name: "客家话",
      l1: "zh",
    },
    nan: {
      name: "闽南话",
      l1: "zh",
    },
    // en: {
    //   name: "英语",
    //   l1: "zh",
    // },
  },
  sampleText: {
    zh: "在这里输入中文，可以看到拼音",
    es: "Ingrese el texto en español aquí para buscar rápidamente todas las palabras.",
    de: "Geben Sie hier deutschen Text ein, um alle Wörter schnell nachzuschlagen.",
    fr: "Entrez le texte allemand ici pour rechercher rapidement tous les mots.",
    ko: "여기에 한글을 입력하면 금방 모든 단어를 찾을 수 있고, 한자도 병기로 볼 수 있다.",
    ja: "ここに日本語を入力すると振り仮名が見えます.",
    en: "Enter English text here to quickly look up all the words.",
    it: "Inserisci qui il testo italiano per cercare rapidamente tutte le parole.",
    eu: "Sartu hemen euskarazko testua hitz guztiak azkar bilatzeko.",
    vi: "Nếu bạn nhập tiếng Việt vào đây, bạn có thể biết được ý nghĩa của từng từ và bạn có thể nhìn thấy chữ Hán.",
    ca: "Introduïu aquí el text català per cercar ràpidament totes les paraules.",
    ru: "Введите каталонский текст здесь, чтобы быстро найти все слова."
  },
  hskColors: {
    1: '#f8b51e',
    2: '#267f94',
    3: '#fd4f1c',
    4: '#bb1718',
    5: '#1b3e76',
    6: '#6a3669',
    outside: '#28a745'
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
  stylizedNumbers: [
    '⓪①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳㉑㉒㉓㉔㉕㉖㉗㉘㉙㉚㉛㉜㉝㉞㉟㊱㊲㊳㊴㊵㊶㊷㊸㊹㊺㊻㊼㊽㊾㊿',
    '🄋➀➁➂➃➄➅➆➇➈➉',
    '⓿❶❷❸❹❺❻❼❽❾❿⓫⓬⓭⓮⓯⓰⓱⓲⓳⓴',
    '🄌➊➋➌➍➎➏➐➑➒➓',
    '⓪⓵⓶⓷⓸⓹⓺⓻⓼⓽⓾',
    '🄀⒈⒉⒊⒋⒌⒍⒎⒏⒐⒑⒒⒓⒔⒕⒖⒗⒘⒙⒚⒛',
    '⓪⑴⑵⑶⑷⑸⑹⑺⑻⑼⑽⑾⑿⒀⒁⒂⒃⒄⒅⒆⒇',
    '⓪㊀㊁㊂㊃㊄㊅㊆㊇㊈㊉'
  ],
  l1Code(l2Code) {
    let l1 = "en";
    let special = this.specialLanguages[l2Code];
    if (special) l1 = special.l1;
    return l1
  },
  dictionaryTooLargeAndWillCauseServerCrash(l2) {
    let tooLarge = ['lat', 'spa', 'deu', 'ita', 'fra', 'por'].includes(l2)
    return tooLarge
  },
  isMobile() {
    if (typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      return true
    } else {
      return false
    }
  },
  normalizeCircleNumber(circleNumber) {
    for (let stylizedNumbers of this.stylizedNumbers) {
      let number = stylizedNumbers.indexOf(circleNumber)
      if (number !== -1) return number
    }
  },
  normalizeCircleNumbers(text) {
    let normalized = text
    for (let stylizedNumbers of this.stylizedNumbers) {
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
  },
  levels: {
    1: {
      hsk: "1",
      cefr: "PreA1",
      jlpt: "Pre-N5",
      topik: "Pre-1",
      category: "Beginner",
      hoursMultiplier: 1 / 16
    },
    2: {
      hsk: "2",
      cefr: "A1",
      jlpt: "N5",
      topik: "1",
      category: "Beginner",
      hoursMultiplier: 1 / 16
    },
    3: {
      hsk: "3",
      cefr: "A2",
      jlpt: "N4",
      topik: "2",
      category: "Beginner",
      hoursMultiplier: 1 / 8
    },
    4: {
      hsk: "4",
      cefr: "B1",
      jlpt: "N3",
      topik: "3",
      category: "Intermediate",
      hoursMultiplier: 1 / 4
    },
    5: {
      hsk: "5",
      cefr: "B2",
      jlpt: "N2",
      topik: "4",
      category: "Intermediate",
      hoursMultiplier: 1 / 2
    },
    6: {
      hsk: "6",
      cefr: "C1",
      jlpt: "N1",
      topik: "5",
      category: "Advanced",
      hoursMultiplier: 1
    },
    7: {
      hsk: "7-9",
      cefr: "C2",
      topik: "6",
      category: "Advanced",
      hoursMultiplier: 2
    },
  },
  exams: [
    {
      lang: 'zh',
      slug: "hsk",
      name: "HSK"
    },
    {
      lang: 'ja',
      slug: "jlpt",
      name: "JLPT"
    },
    {
      lang: 'ko',
      slug: "topik",
      name: "TOPIK"
    },
    {
      slug: "cefr",
      name: "CEFR"
    },
  ],
  languageLevels(language) {
    let levels = {};
    for (let level in this.levels) {
      let exam = this.exams.find(e => e.lang === language.code) || this.exams.find(e => e.slug === 'cefr')
      let key = exam.slug
      levels[level] = {
        exam,
        level: this.levels[level][key] || this.levels[level].cefr
      }
    }
    return levels;
  },
  languageHours(language) {
    let baseHours = language.hours || 1100
    let levels = Object.assign({}, this.levels)
    let hours = {}
    for (let level in levels) {
      hours[level] = baseHours * levels[level].hoursMultiplier
    }
    return hours
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
  wide() {
    return typeof window !== "undefined" && window.innerWidth > 991;
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
  scrollToTargetAdjusted(element, headerOffset, behavior = 'smooth') {
    var elementPosition = element.getBoundingClientRect().top;
    var offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior
    });
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
    return rect.bottom - rect.top
  },
  // json or plain text only, and returns object
  async proxy(url, cacheLife = -1, encoding = false) {
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
  },
  async proxyParsed(url, cacheLife = -1, encoding = false) {
    let html = await this.proxy(url, cacheLife, encoding)
    return parse(html)
  },
  async scrape(url, cacheLife = -1, encoding = false) {
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
    if (l2.code === 'ms') preferredLocales = preferredLocales.concat(['id', 'id-ID'])
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
          new RegExp('(' + this.escapeRegExp(word).replace(/\*/g, '[^，。！？,!.?]+?') + ')', 'gi'),
          `<span ${levelAttr} class="highlight">$1</span>`
        )
    } else {
      return text
    }
  },
  // https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  },
  highlightMultiple(text, words, level) {
    if (!words) return text
    let sortedWords = this.unique(words)
    sortedWords = sortedWords.sort((a, b) => b.length - a.length)
    if (text && sortedWords && sortedWords.length > 0) {
      for (let word of sortedWords) {
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
  /*
   * If we have an array ['ad', 'adi', 'adim'], this will filter out 'adi' and 'adim' and give you ['ad']
   */
  mutuallyExclusive(a) {
    let mutuallyExclusive = []
    for (let igenek of a) {
      let pass = true
      for (let igen of a) {
        if (igenek !== igen && igenek.includes(igen)) pass = false
      }
      if (pass) mutuallyExclusive.push(igenek)
    }
    return mutuallyExclusive
  },
  // https://stackoverflow.com/questions/48731396/javascript-unique-string-array-case-insensitive-but-keep-one-case-sensitive-resu
  uniqueIgnoreCase(names) {
    let uNames = new Map(names.map(s => [s.toLowerCase(), s]));
    return [...uNames.values()]
  },
  country(code) {
    for (let country of countries) {
      if (country.code === code) {
        return country
      }
    }
  },
  // https://css-tricks.com/snippets/javascript/shuffle-array/
  // THIS MUTATES THE ARRAY!
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
  },
  randBase64(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() *
        charactersLength));
    }
    return result;
  },
  arrayChunk(array, chunk = 10) {
    var i, j, temporary;
    var chunks = []
    for (i = 0, j = array.length; i < j; i += chunk) {
      temporary = array.slice(i, i + chunk);
      chunks.push(temporary)
    }
    return chunks
  },
  makeTextFile(text) {
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
  },
  characterClass(category) {
    // Letter
    if (category === 'L') return "A-Za-z\u00AA\u00B5\u00BA\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u0590-\u05ff\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u08A0-\u08B4\u08B6-\u08BD\u0900-\u0DFF\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1878\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FEF\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA7BF\uA7C2-\uA7C6\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB67\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC"
    if (category === 'LLegacy') return "\u0041-\u005A\u0061-\u007A\u00AA\u00B5\u00BA\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u0527\u0530-\u058F\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\u0750-\u077F\u0780-\u07BF\u07C0-\u07FF\u0800-\u083F\u0840-\u085F\u0860-\u086F\u08A0-\u08FF\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F\u0D80-\u0DFF\u0E00-\u0E7F\u0E80-\u0EFF\u0F00-\u0FFF\u1000-\u109F\u10A0-\u10FF\u1100-\u11FF\u1200-\u137F\u1380-\u139F\u13A0-\u13FF\u1400-\u167F\u1680-\u169F\u16A0-\u16FF\u1700-\u171F\u1720-\u173F\u1740-\u175F\u1760-\u177F\u1780-\u17FF\u1800-\u18AF\u18B0-\u18FF\u1900-\u194F\u1950-\u197F\u1980-\u19DF\u19E0-\u19FF\u1A00-\u1A1F\u1A20-\u1AAF\u1AB0-\u1AFF\u1B00-\u1B7F\u1B80-\u1BBF\u1BC0-\u1BFF\u1C00-\u1C4F\u1C50-\u1C7F\u1C80-\u1C8F\u1C90-\u1CBF\u1CC0-\u1CCF\u1CD0-\u1CFF\u1D00-\u1D7F\u1D80-\u1DBF\u1DC0-\u1DFF\u1E00-\u1EFF\u1F00-\u1FFF\u2070-\u209F\u20D0-\u20FF\u2100-\u214F\u2150-\u218F\u2800-\u28FF\u2C00-\u2C5F\u2C60-\u2C7F\u2C80-\u2CFF\u2D00-\u2D2F\u2D30-\u2D7F\u2D80-\u2DDF\u2DE0-\u2DFF\u2E80-\u2EFF\u2F00-\u2FDF\u3040-\u309F\u30A0-\u30FF\u3100-\u312F\u3130-\u318F\u31A0-\u31BF\u31F0-\u31FF\u3200-\u32FF\u3300-\u33FF\u3400-\u4DBF\u4E00-\u9FFF\uA000-\uA48F\uA490-\uA4CF\uA4D0-\uA4FF\uA500-\uA63F\uA640-\uA69F\uA6A0-\uA6FF\uA720-\uA7FF\uA800-\uA82F\uA840-\uA87F\uA880-\uA8DF\uA8E0-\uA8FF\uA900-\uA92F\uA930-\uA95F\uA960-\uA97F\uA980-\uA9DF\uA9E0-\uA9FF\uAA00-\uAA5F\uAA60-\uAA7F\uAA80-\uAADF\uAAE0-\uAAFF\uAB00-\uAB2F\uAB30-\uAB6F\uAB70-\uABBF\uABC0-\uABFF\uAC00-\uD7AF\uD7B0-\uD7FF\uD800-\uDB7F\uDB80-\uDBFF\uDC00-\uDFFF\uE000-\uF8FF\uF900-\uFAFF\uFB00-\uFB4F\uFB50-\uFDFF\uFE00-\uFE0F\uFE20-\uFE2F\uFE70-\uFEFF\uFF00-\uFFEF"
    if (category === 'LLegacy2') return "\u0041-\u005A\u0061-\u007A\u00AA\u00B5\u00BA\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u0527\u0530-\u058F\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\u0750-\u077F\u0780-\u07BF\u07C0-\u07FF\u0800-\u083F\u0840-\u085F\u0860-\u086F\u08A0-\u08FF\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F\u0D80-\u0DFF\u0E00-\u0E7F\u0E80-\u0EFF\u0F00-\u0FFF\u1000-\u109F\u10A0-\u10FF\u1100-\u11FF\u1200-\u137F\u1380-\u139F\u13A0-\u13FF\u1400-\u167F\u1680-\u169F\u16A0-\u16FF\u1700-\u171F\u1720-\u173F\u1740-\u175F\u1760-\u177F\u1780-\u17FF\u1800-\u18AF\u18B0-\u18FF\u1900-\u194F\u1950-\u197F\u1980-\u19DF\u19E0-\u19FF\u1A00-\u1A1F\u1A20-\u1AAF\u1AB0-\u1AFF\u1B00-\u1B7F\u1B80-\u1BBF\u1BC0-\u1BFF\u1C00-\u1C4F\u1C50-\u1C7F\u1C80-\u1C8F\u1C90-\u1CBF\u1CC0-\u1CCF\u1CD0-\u1CFF\u1D00-\u1D7F\u1D80-\u1DBF\u1DC0-\u1DFF\u1E00-\u1EFF\u1F00-\u1FFF\u2070-\u209F\u20D0-\u20FF\u2100-\u214F\u2150-\u218F\u2800-\u28FF\u2C00-\u2C5F\u2C60-\u2C7F\u2C80-\u2CFF\u2D00-\u2D2F\u2D30-\u2D7F\u2D80-\u2DDF\u2DE0-\u2DFF\u2E80-\u2EFF\u2F00-\u2FDF\u3040-\u309F\u30A0-\u30FF\u3100-\u312F\u3130-\u318F\u31A0-\u31BF\u31F0-\u31FF\u3200-\u32FF\u3300-\u33FF\u3400-\u4DBF\u4E00-\u9FFF\uA000-\uA48F\uA490-\uA4CF\uA4D0-\uA4FF\uA500-\uA63F\uA640-\uA69F\uA6A0-\uA6FF\uA720-\uA7FF\uA800-\uA82F\uA840-\uA87F\uA880-\uA8DF\uA8E0-\uA8FF\uA900-\uA92F\uA930-\uA95F\uA960-\uA97F\uA980-\uA9DF\uA9E0-\uA9FF\uAA00-\uAA5F\uAA60-\uAA7F\uAA80-\uAADF\uAAE0-\uAAFF\uAB00-\uAB2F\uAB30-\uAB6F\uAB70-\uABBF\uABC0-\uABFF\uAC00-\uD7AF\uD7B0-\uD7FF\uD800-\uDB7F\uDB80-\uDBFF\uDC00-\uDFFF\uE000-\uF8FF\uF900-\uFAFF\uFB00-\uFB4F\uFB50-\uFDFF\uFE00-\uFE0F\uFE20-\uFE2F\uFE70-\uFEFF\uFF00-\uFFEF"
    // Combining
    if (category === 'M') return '\u0300-\u036F\u0483-\u0489\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u07FD\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08D3-\u08E1\u08E3-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962\u0963\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09E2\u09E3\u09FE\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2\u0AE3\u0AFA-\u0AFF\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B62\u0B63\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0C00-\u0C04\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C81-\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CE2\u0CE3\u0D00-\u0D03\u0D3B\u0D3C\u0D3E-\u0D44\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D62\u0D63\u0D82\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DF2\u0DF3\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F3E\u0F3F\u0F71-\u0F84\u0F86\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102B-\u103E\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F\u109A-\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4-\u17D3\u17DD\u180B-\u180D\u1885\u1886\u18A9\u1920-\u192B\u1930-\u193B\u1A17-\u1A1B\u1A55-\u1A5E\u1A60-\u1A7C\u1A7F\u1AB0-\u1ABE\u1B00-\u1B04\u1B34-\u1B44\u1B6B-\u1B73\u1B80-\u1B82\u1BA1-\u1BAD\u1BE6-\u1BF3\u1C24-\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CED\u1CF4\u1CF7-\u1CF9\u1DC0-\u1DF9\u1DFB-\u1DFF\u20D0-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302F\u3099\u309A\uA66F-\uA672\uA674-\uA67D\uA69E\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA823-\uA827\uA880\uA881\uA8B4-\uA8C5\uA8E0-\uA8F1\uA8FF\uA926-\uA92D\uA947-\uA953\uA980-\uA983\uA9B3-\uA9C0\uA9E5\uAA29-\uAA36\uAA43\uAA4C\uAA4D\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEB-\uAAEF\uAAF5\uAAF6\uABE3-\uABEA\uABEC\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE2F'
    // Han
    if (category === 'Han') return "\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u3005\u3007\u3021-\u3029\u3038-\u303B\u3400-\u4DB5\u4E00-\u9FEF\uF900-\uFA6D\uFA70-\uFAD9"
    // Hangul
    if (category === 'Hangul') return "\u1100-\u11FF\u302E\u302F\u3131-\u318E\u3200-\u321E\u3260-\u327E\uA960-\uA97C\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uFFA0-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC"
    // Greek
    if (category === 'Greek') return "\u0370-\u0373\u0375-\u0377\u037A-\u037D\u037F\u0384\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03E1\u03F0-\u03FF\u1D26-\u1D2A\u1D5D-\u1D61\u1D66-\u1D6A\u1DBF\u1F00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FC4\u1FC6-\u1FD3\u1FD6-\u1FDB\u1FDD-\u1FEF\u1FF2-\u1FF4\u1FF6-\u1FFE\u2126\uAB65"
    // Kana
    if (category === 'Kana') return "\u30A1-\u30FA\u30FD-\u30FF\u31F0-\u31FF\u32D0-\u32FE\u3300-\u3357\uFF66-\uFF6F\uFF71-\uFF9D"
    if (category === 'Punctuation') return escapeStringRegexp("♪♫!-#%-*,-/\:-@\[-\]_\{\}\u00A1\u00A7\u00AB\u00B6\u00B7\u00BB\u00BF\u037E\u0387\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u09FD\u0A76\u0AF0\u0C77\u0C84\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E4F\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65")
    if (category === 'PunctuationNoApostrophe') return escapeStringRegexp("♪♫!-#%&(-*+,-/\:-@\[-\]_\{\}\u00A1\u00A7\u00AB\u00B6\u00B7\u00BB\u00BF\u037E\u0387\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u09FD\u0A76\u0AF0\u0C77\u0C84\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2017\u201A-\u201F\u2020-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E4F\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65")
    if (category === 'PunctuationNoApostropheNoHyphen') return escapeStringRegexp("♪♫!-#%&(-*+,./\:-@\[-\]_\{\}\u00A1\u00A7\u00AB\u00B6\u00B7\u00BB\u00BF\u037E\u0387\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u09FD\u0A76\u0AF0\u0C77\u0C84\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F0A\u0F0C-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2017\u201A-\u201F\u2020-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E4F\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65")
  },
  portrait() {
    let landscape =
      typeof window !== "undefined" && window.innerWidth < window.innerHeight;
    return landscape;
  },
  background(l2 = undefined) {
    let background
    if (typeof l2 === 'undefined') return `/img/background-earth-vector.jpg`;
    if (l2.code === 'ase') {
      return `https://source.unsplash.com/1600x900/?United+States`;
    }
    if (l2.code === 'tlh') {
      return `https://source.unsplash.com/1600x900/?Star+Trek`;
    }
    if (l2.code === 'sjn') {
      return `https://source.unsplash.com/1600x900/?Lord+of+the+Rings`;
    }
    if (l2.code === 'wuu') {
      return `https://source.unsplash.com/1600x900/?Shanghai`;
    }
    if (l2.code === 'nan') {
      return `https://source.unsplash.com/1600x900/?Fujian`;
    }
    if (l2.code === 'yue') {
      return `https://source.unsplash.com/1600x900/?Hong+Kong`;
    }
    if (l2.code === 'hni') {
      return `https://source.unsplash.com/1600x900/?Yunnan`; // Hani
    }
    else if (["dz", "pau", "ps", "lzh", "zh", "ug", "bo", "non"].includes(l2.code))
      background = `${Config.server}data/img/backgrounds/bg-${l2.code}-${Math.ceil(
        Math.random() * 10
      )}.jpg`;
    else if (l2.han)
      background = `${Config.server}data/img/backgrounds/bg-zh-${Math.ceil(Math.random() * 10)}.jpg`;
    else if (l2.country && l2.country.length > 0) {
      let randomCountryName = l2.country[Math.floor(Math.random() * l2.country.length)].name
      background = `https://source.unsplash.com/1600x900/?${randomCountryName}`;
    }
    else if (l2['iso639-1']) background = `https://source.unsplash.com/1600x900/?${l2.name}`;
    else background = `${Config.server}data/img/backgrounds/background-branch.jpg`;
    return background
  },
  roundTo(n, dec = 2) {
    return Math.round(n * Math.pow(10, dec)) / Math.pow(10, dec)
  },
  formatK(n, dec = 2) {
    if (n >= Math.pow(10, 12)) {
      return this.roundTo(n / Math.pow(10, 12), dec) + "T"
    }
    if (n >= Math.pow(10, 9)) {
      return this.roundTo(n / Math.pow(10, 9), dec) + "B"
    }
    if (n >= Math.pow(10, 6)) {
      return this.roundTo(n / Math.pow(10, 6), dec) + "M"
    }
    if (n >= Math.pow(10, 3)) {
      return this.roundTo(n / Math.pow(10, 3), dec) + "K"
    }
    return n
  }
}
