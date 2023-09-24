// dictionary-utils.js

const PYTHON_SERVER = "https://python.zerotohero.ca/";

const SERVER = "https://server.chinesezerotohero.com/";

const SCRAPE_URL = SERVER + "scrape2.php";

const proxy = async (
  url,
  { cacheLife = -1, encoding = false, timeout = false } = {}
) => {
  try {
    let proxyURL =
      `${SCRAPE_URL}?url=${encodeURIComponent(url)}&cache_life=${cacheLife}` +
      (encoding ? `&encoding=${encoding}` : "");
    let response = await axios.get(proxyURL, { timeout });
    if (response.data) {
      return response.data;
    }
  } catch (err) {
    console.log(`proxy() cannot get ${url}`);
  }
  return false;
};

// https://stackoverflow.com/questions/175739/how-can-i-check-if-a-string-is-a-valid-number
const isNumeric = (str) => {
  if (typeof str != "string") return false; // we only process strings!
  return (
    !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str))
  ); // ...and ensure strings of whitespace fail
};

const isThai = (text) => {
  let match = text.match(/[\u0E00-\u0E7F]+/g);
  return match;
};

const isRoman = (text) => {
  return text.match(/\w+/) ? true : false
}

const isChinese = (text) => {
  return text.match(
    // eslint-disable-next-line no-irregular-whitespace
    /[\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u3005\u3007\u3021-\u3029\u3038-\u303B‌​\u3400-\u4DB5\u4E00-\u9FCC\uF900-\uFA6D\uFA70-\uFAD9]+/g
  );
};


const isJapanese = (text) => {
  const japaneseRegex = /^[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}\p{Punctuation}\p{Symbol}]+$/ug
  return japaneseRegex.test(text)
};

const isHangul = (text) => {
  let isHangul = text.match(
    /[\u1100-\u11FF\u302E\u302F\u3131-\u318E\u3200-\u321E\u3260-\u327E\uA960-\uA97C\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uFFA0-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]+/g
  );
  return isHangul;
};

const isTraditional = (text) => {
  let matchedSimplified = [];
  let matchedTraditional = [];
  for (let row of this.words) {
    if (text.includes(row.simplified)) matchedSimplified.push(row.simplified);
    if (text.includes(row.traditional))
      matchedTraditional.push(row.traditional);
  }
  const trad = this.unique(matchedTraditional).length;
  const simp = this.unique(matchedSimplified).length;
  return trad > simp;
};

const isCombining = (char) => {
  let M =
    "\u0300-\u036F\u0483-\u0489\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u07FD\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08D3-\u08E1\u08E3-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962\u0963\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09E2\u09E3\u09FE\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2\u0AE3\u0AFA-\u0AFF\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B62\u0B63\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0C00-\u0C04\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C81-\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CE2\u0CE3\u0D00-\u0D03\u0D3B\u0D3C\u0D3E-\u0D44\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D62\u0D63\u0D82\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DF2\u0DF3\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F3E\u0F3F\u0F71-\u0F84\u0F86\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102B-\u103E\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F\u109A-\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4-\u17D3\u17DD\u180B-\u180D\u1885\u1886\u18A9\u1920-\u192B\u1930-\u193B\u1A17-\u1A1B\u1A55-\u1A5E\u1A60-\u1A7C\u1A7F\u1AB0-\u1ABE\u1B00-\u1B04\u1B34-\u1B44\u1B6B-\u1B73\u1B80-\u1B82\u1BA1-\u1BAD\u1BE6-\u1BF3\u1C24-\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CED\u1CF4\u1CF7-\u1CF9\u1DC0-\u1DF9\u1DFB-\u1DFF\u20D0-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302F\u3099\u309A\uA66F-\uA672\uA674-\uA67D\uA69E\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA823-\uA827\uA880\uA881\uA8B4-\uA8C5\uA8E0-\uA8F1\uA8FF\uA926-\uA92D\uA947-\uA953\uA980-\uA983\uA9B3-\uA9C0\uA9E5\uAA29-\uAA36\uAA43\uAA4C\uAA4D\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEB-\uAAEF\uAAF5\uAAF6\uABE3-\uABEA\uABEC\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE2F";
  let regex = new RegExp(`[${M}]+`);
  let combining = regex.test(char);
  // console.log(`👀 checking if ${char} is combinging`, combining)
  return combining;
};

// https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
const stripAccents = (str) => {
  str = str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Accents
    .replace(/[\u0600-\u0620\u064b-\u0655]/g, "") // Arabic diacritics
    .replace(/[\u0559-\u055F]/g, ""); // Armenian diacritics
  if (["he", "hbo", "iw"].includes(this.l2)) {
    str = this.stripHebrewVowels(str);
  }
  return str;
};


const addAccentMarks = (text) => {
  return text.replace(/'/g, '́')
}

/*
  * https://gist.github.com/yakovsh/345a71d841871cc3d375
  /* @shimondoodkin suggested even a much shorter way to do this */
const stripHebrewVowels = (rawString) => {
  return rawString.replace(/[\u0591-\u05C7]/g, "");
};

// https://stackoverflow.com/questions/38613654/javascript-find-unique-objects-in-array-based-on-multiple-properties
const uniqueByValues = (arr, keyProps) => {
  const kvArray = arr.map((entry) => {
    const key = keyProps.map((k) => entry[k]).join("|");
    return [key, entry];
  });
  const map = new Map(kvArray);
  return Array.from(map.values());
};

const unique = (a) => {
  return a.filter((item, i, ar) => ar.indexOf(item) === i);
};

//https://stackoverflow.com/questions/2532218/pick-random-property-from-a-javascript-object
const randomProperty = (obj) => {
  var keys = Object.keys(obj);
  return obj[keys[(keys.length * Math.random()) << 0]];
};

const randomArrayItem = (array, start = 0, length = false) => {
  length = length || array.length;
  array = array.slice(start, length);
  let index = Math.floor(Math.random() * array.length);
  return array[index];
};

const removeToneNumbers = (pinyin) => {
  return pinyin.replace(/\d+/g, "");
};

const removeToneMarks = (pinyin) => {
  const toneMap = {
    'ā': 'a',
    'á': 'a',
    'ǎ': 'a',
    'à': 'a',
    'ē': 'e',
    'é': 'e',
    'ě': 'e',
    'è': 'e',
    'ī': 'i',
    'í': 'i',
    'ǐ': 'i',
    'ì': 'i',
    'ō': 'o',
    'ó': 'o',
    'ǒ': 'o',
    'ò': 'o',
    'ū': 'u',
    'ú': 'u',
    'ǔ': 'u',
    'ù': 'u',
    'ǖ': 'ü',
    'ǘ': 'ü',
    'ǚ': 'ü',
    'ǜ': 'ü',
  };

  let noTonePinyin = '';

  for (const char of pinyin) {
    noTonePinyin += toneMap[char] || char;
  }

  return noTonePinyin;
}

const hasHan = (text) => {
  return text.match(
    /[\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u3005\u3007\u3021-\u3029\u3038-\u303B‌​\u3400-\u4DB5\u4E00-\u9FCC\uF900-\uFA6D\uFA70-\uFAD9]+/g
  );
};

const isHan = (text) => {
  return /^[\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u3005\u3007\u3021-\u3029\u3038-\u303B‌​\u3400-\u4DB5\u4E00-\u9FCC\uF900-\uFA6D\uFA70-\uFAD9]+$/.test(
    text
  );
};

/**
 *  https://blog.adriaan.io/make-a-javascript-array-with-objects-unique-by-its-nested-key.html
 *  Property can be the name of a propterty or a compare function
 */
const uniqueByFunction = (array, property) => {
  const compare =
    typeof property === "function"
      ? property
      : (left, right) => left[property] == right[property];

  const newArray = [];

  array.forEach((right) => {
    const run = (left) => compare.call(this, left, right);
    var i = newArray.findIndex(run);
    if (i === -1) newArray.push(right);
  });

  return newArray;
};

const splitByReg = (text, reg) => {
  return text.split(reg);
};


const isEnglishPartialClitic = (word) => {
  return (
    ["m", "s", "t", "ll", "d", "re", "ain", "don"].includes(word)
  );
}

const sanitizeRegexString = (str) => {
  // Escape special characters
  str = str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Remove non-alphanumeric characters
  str = str.replace(/[^a-z0-9.-]/gi, '');

  // Remove whitespace
  str = str.replace(/\s+/g, '');

  // Convert to lowercase
  str = str.toLowerCase();

  return str;
}

// https://www.consolelog.io/group-by-in-javascript/
const groupArrayBy = (array, prop) => {
  return array.reduce(function (groups, item) {
    const val = item[prop]
    groups[val] = groups[val] || []
    groups[val].push(item)
    return groups
  }, {})
}

const logError = (error, tag) => {
  if (!tag) tag = 'Error'
  if (error.response) {
    let { data, status, headers } = error.response
    console.log(tag, { message: 'Request made and server responded', data, status, headers, response: error.response, error });
  } else if (error.request) {
    console.log(tag, { message: 'The request was made but no response was received', request: error.request, error });
  } else {
    console.log(tag, { message: 'Something happened in setting up the request that triggered an Error' + error.message, status: error.status, error });
  }
}


const kebabToPascalCase = (str) => {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

const pascalToKebabCase = (str) => {
  return str
    .replace(/^(.)/, (_, c) => c.toLowerCase())
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();
}
