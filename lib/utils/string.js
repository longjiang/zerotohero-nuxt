import decode from 'unescape'
import { parse } from 'node-html-parser'
import { unique } from './array'
import { escapeRegExp } from './regex'

import { transliterate as tr} from "transliteration";
import { addPitchAccent } from "./japanese";

export const STYLIZED_NUMBERS = [
  '⓪①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳㉑㉒㉓㉔㉕㉖㉗㉘㉙㉚㉛㉜㉝㉞㉟㊱㊲㊳㊴㊵㊶㊷㊸㊹㊺㊻㊼㊽㊾㊿',
  '🄋➀➁➂➃➄➅➆➇➈➉',
  '⓿❶❷❸❹❺❻❼❽❾❿⓫⓬⓭⓮⓯⓰⓱⓲⓳⓴',
  '🄌➊➋➌➍➎➏➐➑➒➓',
  '⓪⓵⓶⓷⓸⓹⓺⓻⓼⓽⓾',
  '🄀⒈⒉⒊⒋⒌⒍⒎⒏⒐⒑⒒⒓⒔⒕⒖⒗⒘⒙⒚⒛',
  '⓪⑴⑵⑶⑷⑸⑹⑺⑻⑼⑽⑾⑿⒀⒁⒂⒃⒄⒅⒆⒇',
  '⓪㊀㊁㊂㊃㊄㊅㊆㊇㊈㊉',
  '０１２３４５６７８９'
]

export const roundTo = (n, dec = 2) => {
  return Math.round(n * Math.pow(10, dec)) / Math.pow(10, dec)
}
export const normalizeStylizedNumber = (circleNumber) => {
  for (let stylizedNumbers of STYLIZED_NUMBERS) {
    let number = stylizedNumbers.indexOf(circleNumber)
    if (number !== -1) return number
  }
}
export const normalizeStylizedNumbersInText = (text) => {
  let normalized = text
  for (let stylizedNumbers of STYLIZED_NUMBERS) {
    let regex = new RegExp(`[${stylizedNumbers}]`, 'g')
    let matches = normalized.match(
      regex
    );
    if (matches) {
      for (let m of matches) {
        normalized = normalized.replace(m, `[${normalizeStylizedNumber(m)}]`)
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

export const highlight = (text, word, level = false, className = "highlight") => {
  let levelAttr = level ? ` data-level="${level}"` : ''
  if (text && word && word.trim() !== '') {
    return text
      .replace(
        new RegExp('(' + escapeRegExp(word).replace(/\*/g, '[^，。！？,!.?]+?') + ')', 'gi'),
        `<span ${levelAttr} class="${className}">$1</span>`
      )
  } else {
    return text
  }
}

export const highlightMultiple = (text, words, level, className = "highlight") => {
  if (!words) return text
  let sortedWords = unique(words)
  sortedWords = sortedWords.sort((a, b) => b.length - a.length)
  if (text && sortedWords && sortedWords.length > 0) {
    for (let word of sortedWords) {
      text = highlight(text, word, level, className)
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
  let text = root.textContent || root.innerHTML || ''
  return decode(text)
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

export const formatK = (n, dec = 2, lang = "en") => {
  if (['ko'].includes(lang)) {
    if (n >= Math.pow(10, 12)) {
      return roundTo(n / Math.pow(10, 12), dec) + "조"
    }
    if (n >= Math.pow(10, 8)) {
      return roundTo(n / Math.pow(10, 8), dec) + "억"
    }
    if (n >= Math.pow(10, 4)) {
      return roundTo(n / Math.pow(10, 4), dec) + "만"
    }
  } else if (['ja', 'zh'].includes(lang)) {
    if (n >= Math.pow(10, 12)) {
      return roundTo(n / Math.pow(10, 12), dec) + "兆"
    }
    if (n >= Math.pow(10, 8)) {
      return roundTo(n / Math.pow(10, 8), dec) + "亿"
    }
    if (n >= Math.pow(10, 4)) {
      return roundTo(n / Math.pow(10, 4), dec) + "万"
    }
  } else {
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
  }
  return n
}

export const removeInlineStylesFromString = (htmlString) => {
  if (typeof DOMParser === "undefined") {
    console.warn("DOMParser is not defined. Cannot remove inline styles.");
    return htmlString;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");
  const elementsWithStyle = doc.querySelectorAll("[style]");

  elementsWithStyle.forEach((element) => {
    element.removeAttribute("style");
  });

  const serializer = new XMLSerializer();
  const updatedHtmlString = serializer.serializeToString(doc.body);
  return updatedHtmlString;
}


export const parseQueryString = (queryString) => {
  const params = new URLSearchParams(queryString);
  const obj = {};
  for (let [key, value] of params.entries()) {
      obj[key] = value;
  }
  return obj;
}

/*
* https://gist.github.com/yakovsh/345a71d841871cc3d375
/* @shimondoodkin suggested even a much shorter way to do this */
export const stripHebrewVowels = (rawString) => {
  return rawString.replace(/[\u0591-\u05C7]/g, "");
}

export const breakSentences = (text) => {
  text = text.replace(/([!?:。！？：;；])/g, "$1SENTENCEENDING!!!");
  text = text.replace(/(\. )/g, "$1SENTENCEENDING!!!");
  let sentences = text.split("SENTENCEENDING!!!");
  return sentences.filter((sentence) => sentence.trim() !== "");
}

// Convert ISO 8601 duration string to total seconds
export const convertDurationToSeconds = (durationStr) => {
  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(durationStr);

  if (!match) {
    return 0; // or you might throw an error or handle it differently
  }

  const hours = match[1] ? parseInt(match[1], 10) : 0;
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const seconds = match[3] ? parseInt(match[3], 10) : 0;

  return (hours * 3600) + (minutes * 60) + seconds;
}

// Format total seconds as a duration string
export const formatSecondsToDuration = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const formattedMinutes = minutes.toString().padStart(hours ? 2 : 1, "0");
  const formattedSeconds = seconds.toString().padStart(2, "0");

  return hours ? `${hours}:${formattedMinutes}:${formattedSeconds}` : `${formattedMinutes}:${formattedSeconds}`;
}

// Convert ISO 8601 duration string to a formatted duration string
export const parseDuration = (durationStr) => {
  return formatSecondsToDuration(convertDurationToSeconds(durationStr));
}

export const timeStringToSeconds = (timeString) => {
  const timeParts = timeString.split(':').reverse();
  let totalSeconds = 0;

  if (timeParts[0]) {
    totalSeconds += parseInt(timeParts[0], 10); // seconds
  }
  if (timeParts[1]) {
    totalSeconds += parseInt(timeParts[1], 10) * 60; // minutes
  }
  if (timeParts[2]) {
    totalSeconds += parseInt(timeParts[2], 10) * 3600; // hours
  }

  return totalSeconds;
}


// Called from <EntryForms> and <WordBlock> components for Russian words

export const accent = (text) => {
  return text.replace(/'/g, "́");
}

// https://stackoverflow.com/questions/175739/how-can-i-check-if-a-string-is-a-valid-number
export const isNumeric = (str) => {
  if (typeof str != "string") return false; // we only process strings!
  return (
    !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str))
  ); // ...and ensure strings of whitespace fail
}

export const isPunctuation = (str) => {
  const regex = /^[\p{P}\p{S}]+$/u;
  return regex.test(str);
}

export const isThai = (text) => {
  let match = text.match(/[\u0E00-\u0E7F]+/g);
  return match;
}

export const isChinese = (text) => {
  return text.match(
    // eslint-disable-next-line no-irregular-whitespace
    /[\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u3005\u3007\u3021-\u3029\u3038-\u303B‌​\u3400-\u4DB5\u4E00-\u9FCC\uF900-\uFA6D\uFA70-\uFAD9]+/g
  )
}

export const hasKanji = (str) => {
  // Match Kanji characters (U+4E00 - U+9FFF)
  const kanjiRegex = /[\u4E00-\u9FFF]/;
  return kanjiRegex.test(str);
}

export const isHangul = (text) => {
  let isHangul = text.match(/[\u1100-\u11FF\u302E\u302F\u3131-\u318E\u3200-\u321E\u3260-\u327E\uA960-\uA97C\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uFFA0-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]+/g)
  return isHangul
}

export const containsCJKCharacters = (name) => {
  const cjkPattern = /[\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/;
  return cjkPattern.test(name);
}

export const formatName = (firstName, lastName, firstNameOnly = false) => {
  if (containsCJKCharacters(firstName) || containsCJKCharacters(lastName)) {
    return `${lastName}${firstName}`;
  } else {
    return firstNameOnly ? firstName : `${firstName} ${lastName}`;
  }
}

export const toCamelCase = (str) => {
  return str.replace(/_([a-z])/g, function (g) {
    return g[1].toUpperCase();
  });
}

export const sanitizeFilename = (filename) => {
  // remove invalid characters
  filename = filename.replace(/[\/:*?"<>|]/g, '-');

  // truncate if necessary (example: 200 characters)
  if (filename.length > 200) {
    filename = filename.slice(0, 197) + '...';
  }

  return filename;
}

export const convertPinyinSyllableToIPA = (pinyinWord) => {
  const pinyinToIPA = {
    a: "a",
    ai: "aɪ̯",
    an: "an",
    ang: "aŋ",
    ao: "aʊ̯",
    e: "ɤ",
    ei: "eɪ̯",
    en: "ən",
    eng: "əŋ",
    i: "i",
    ia: "ja",
    ian: "jɛn",
    iang: "jɛŋ",
    iao: "jau̯",
    ie: "je",
    in: "in",
    ing: "iŋ",
    iong: "joŋ",
    iu: "joʊ̯",
    o: "uo",
    ou: "oʊ̯",
    ong: "oŋ",
    u: "u",
    ua: "wa",
    uai: "waɪ̯",
    uan: "wan",
    uang: "waŋ",
    ue: "we",
    ui: "weɪ̯",
    un: "wən",
    uo: "wɔ",
    ü: "y",
    üe: "yɛ",
    üan: "yɛn",
    ün: "yn",
    // initial consonants
    b: "p",
    p: "pʰ",
    m: "m",
    f: "f",
    d: "t",
    t: "tʰ",
    n: "n",
    l: "l",
    g: "k",
    k: "kʰ",
    h: "x",
    j: "t͡ɕ",
    q: "t͡ɕʰ",
    x: "ɕ",
    zh: "ʈ͡ʂ",
    ch: "ʈ͡ʂʰ",
    sh: "ʂ",
    r: "ʐ",
    z: "ts",
    c: "tsʰ",
    s: "s",
    // tones
    1: "˥",
    2: "˧˥",
    3: "˨˩˦",
    4: "˥˩",
    5: "",
  };
  // Tone processing
  const tones = {
    ā: ["a", "1"],
    á: ["a", "2"],
    ǎ: ["a", "3"],
    à: ["a", "4"],
    ē: ["e", "1"],
    é: ["e", "2"],
    ě: ["e", "3"],
    è: ["e", "4"],
    ī: ["i", "1"],
    í: ["i", "2"],
    ǐ: ["i", "3"],
    ì: ["i", "4"],
    ō: ["o", "1"],
    ó: ["o", "2"],
    ǒ: ["o", "3"],
    ò: ["o", "4"],
    ū: ["u", "1"],
    ú: ["u", "2"],
    ǔ: ["u", "3"],
    ù: ["u", "4"],
    ǖ: ["ü", "1"],
    ǘ: ["ü", "2"],
    ǚ: ["ü", "3"],
    ǜ: ["ü", "4"],
  };

  for (let toneChar in tones) {
    if (pinyinWord.includes(toneChar)) {
      pinyinWord = pinyinWord.replace(toneChar, tones[toneChar][0]);
      pinyinWord += tones[toneChar][1];
    }
  }

  let ipaWord = "";

  // Convert consonants and vowels
  while (pinyinWord.length > 0) {
    let matchFound = false;

    for (let syllable of Object.keys(pinyinToIPA).sort(
      (a, b) => b.length - a.length
    )) {
      if (pinyinWord.startsWith(syllable)) {
        ipaWord += pinyinToIPA[syllable];
        pinyinWord = pinyinWord.slice(syllable.length);
        matchFound = true;
        break;
      }
    }

    if (!matchFound) {
      ipaWord += pinyinWord[0];
      pinyinWord = pinyinWord.slice(1);
    }
  }

  return ipaWord;
}

export const convertPinyinToIPA = (pinyin) => {
  if (!pinyin) {
    return "";
  }
  const syllables = pinyin.split(" ");
  const ipaArray = syllables.map(convertPinyinSyllableToIPA);
  return ipaArray.join(" ");
}

/**
 * 発音表記を整形するユーティリティ関数
 * @param {Object} params - パラメータをまとめたオブジェクト
 * @param {Object} params.word - 単語に関するオブジェクト。プロパティとして pronunciation, head, kana, jyutping, pinyin, accentPatterns などを含む
 * @param {string} params.langCode - 対象言語のコード（例："ja", "vi", "tlh", "zh" など）
 * @param {Function} params.hasFeature - 機能判定用の関数。たとえば、hasFeature("transliteration") のように呼び出す
 * @returns {string} 整形済みの発音表記
 */
export const formatPronunciation = ({ word, langCode, hasFeature }) => {
  let pronunciation = word.pronunciation;

  if (langCode === "vi") {
    // ベトナム語の場合、[[…#Vietnamese|…]] の形式を単純化する
    pronunciation = pronunciation.replace(/\[\[(.+?)#Vietnamese\|.+?]]/g, "$1");
  } else if (langCode === "tlh") {
    // キリン語の場合、ヘッド表記からIPA表記に変換する
    pronunciation = Klingon.latinToIPA(word.head);
  } else if (word.kana) {
    // かな表記が存在するならそちらを使用
    pronunciation = word.kana;
  } else if (word.jyutping && word.pinyin) {
    // 粤語と中国語（拼音）の両方が存在するなら、カンマで結合する
    pronunciation = [word.jyutping, word.pinyin].join(", ");
  } else if (
    !pronunciation &&
    hasFeature("transliteration") &&
    !["tlh", "fa", "ja"].includes(langCode)
  ) {
    // 発音が無く、かつ transliteration 機能が有効で、対象言語が除外対象でなければ transliteration を適用する
    pronunciation = tr(word.head);
  }

  // 日本語でアクセントパターンがある場合、ピッチアクセントを付与する
  if (langCode === "ja" && word.accentPatterns && word.accentPatterns.length) {
    const accentedPronunciations = addPitchAccent(pronunciation, word.accentPatterns);
    // 上昇記号は削除、下降記号は「ꜜ」に置換する（もしくは他の記号でも可）
    const pronunciations = accentedPronunciations.map(p =>
      p.replace(/↑/g, "").replace(/↓/g, "ꜜ")
    );
    // 重複を排除して結合する
    pronunciation = [...new Set(pronunciations)].join(", ");
  }

  // 発音が存在する場合は角括弧で囲む
  let formattedPronunciation = pronunciation ? `[${pronunciation}]` : "";

  // キリン語の場合は、ヘッド表記を先頭に付加する
  if (langCode === "tlh") {
    formattedPronunciation = word.head + " " + formattedPronunciation;
  }

  // 中国語の場合は、元の発音に加え、変換したIPA表記も表示する
  if (langCode === "zh") {
    formattedPronunciation =
      word.pronunciation + " [" + convertPinyinToIPA(word.pronunciation) + "]";
  }

  // 日本語でアクセントパターンが存在する場合、装飾数字を末尾に追加する
  if (langCode === "ja" && word.accentPatterns && word.accentPatterns.length) {
    formattedPronunciation += word.accentPatterns.map(p => STYLIZED_NUMBERS[0][p]).join(", ");
  }

  return formattedPronunciation;
}