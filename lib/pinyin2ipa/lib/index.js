'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _pinyinSeparate = require('pinyin-separate');

var _pinyinSeparate2 = _interopRequireDefault(_pinyinSeparate);

var _default = require('./methods/default.json');

var _default2 = _interopRequireDefault(_default);

var _sophisticated = require('./methods/sophisticated.json');

var _sophisticated2 = _interopRequireDefault(_sophisticated);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultOptions = {
  method: 'default',
  toneMarker: 'number',
  markNeutral: false,
  superscript: false,
  filterUnknown: true
};

var toneReps = {
  number: ['1', '2', '3', '4', '5'],
  numberSuperscript: ['¹', '²', '³', '⁴', '⁵'],
  chaonumber: ['55', '35', '214', '51', ''],
  chaonumberSuperscript: ['⁵⁵', '³⁵', '²¹⁴', '⁵¹', ''],
  chaoletter: ['˥', '˧˥', '˨˩˦', '˥˩', '']
};

var pinyinRegEx = /^(((miu|[pm]ou|[bpm](o|e(i|ng?)?|a(ng?|i|o)?|i(e|ng?|a[no])?|u))|(f(ou?|[ae](ng?|i)?|u))|(d(e(i|ng?)|i(a[on]?|u))|[dt](a(i|ng?|o)?|e(i|ng)?|i(a[on]?|e|ng|u)?|o(ng?|u)|u(o|i|an?|n)?))|(neng?|[ln](a(i|ng?|o)?|e(i|ng)?|i(ang|a[on]?|e|ng?|u)?|o(ng?|u)|[uü](o|i|an?|n)?|ve?))|([ghk](a(i|ng?|o)?|e(i|ng?)?|o(u|ng)|u(a(i|ng?)?|i|n|o)?))|(zh?ei|[cz]h?(e(ng?)?|o(ng?|u)?|ao|u?a(i|ng?)?|u?(o|i|n)?))|(song|shua(i|ng?)?|shei|sh?(a(i|ng?|o)?|en?g?|ou|u(a?n|o|i)?|i))|(r([ae]ng?|i|e|ao|ou|ong|u[oin]|ua?n?))|([jqx](i(a(o|ng?)?|[eu]|ong|ng?)?|[uü](e|a?n)?))|((a(i|o|ng?)?|ou?|e(i|ng?|r)?))|(w(a(i|ng?)?|o|e(i|ng?)?|u))|y(a(o|ng?)?|e|in?g?|o(u|ng)?|[uü](e|a?n)?))[0-5]?)+$/i;

function removeDiacritics(word) {
  return word.replace(/[āáǎăà]/ig, 'a').replace(/[ēéěěĕè]/ig, 'e').replace(/[īíǐĭì]/ig, 'i').replace(/[ōóǒŏò]/ig, 'o').replace(/[ūúǔŭù]/ig, 'u').replace(/([ǖǘǚǚü̆ǜv̄v́v̆v̌v̀]|[ūúǔŭù]:)/ig, 'ü').replace(/ü/ig, 'u');
}

function numberifyTones(wordIn) {
  var word = wordIn;
  if (/\d$/.test(word)) {
    return word;
  }

  if (/[āēīōūǖv̄]/.test(word)) {
    word += '1';
  } else if (/[áéíóúǘv́]/.test(word)) {
    word += '2';
  } else if (/[ǎăěĕǐĭǒŏǔŭǚǚü̆v̆v̌]/.test(word)) {
    word += '3';
  } else if (/[àèìòùǜv̀]/.test(word)) {
    word += '4';
  } else {
    word += '5';
  }
  return removeDiacritics(word);
}

function isNumberPinYin(wordIn) {
  var word = wordIn;
  word = word.replace(/\r?\n/g, '');
  return pinyinRegEx.test(word);
}

function isPinYin(wordIn) {
  var word = wordIn;
  word = removeDiacritics(word.replace(/\r?\n/g, ''));
  return pinyinRegEx.test(word);
}

function pinyinWord2IPA(wordIn, methodTable, toneRep, options) {
  var word = wordIn;
  if (word === '#~linebreak~#') return '\n';

  if (parseInt(word, 10) === word) {
    return word;
  }

  if (!isNumberPinYin(word)) {
    var splits = (0, _pinyinSeparate2.default)(word);
    var convertedWords = [];
    if (splits.length > 1) {
      var part = null;
      var convertedWord = null;
      for (var i = 0; i < splits.length; i++) {
        part = splits[i];
        convertedWord = pinyinWord2IPA(part, methodTable, toneRep, options);
        if (convertedWord.length) {
          convertedWords.push(convertedWord);
        }
      }
      return convertedWords.join(' ');
    }
    word = numberifyTones(word.toLowerCase());
  }

  var pureWord = word.replace(/([^\d]+)\d+/g, '$1');
  if (!isPinYin(pureWord)) {
    return options.filterUnknown ? '' : '*' + pureWord + '*';
  }

  var toneMatch = word.match(/\d$/);
  var toneIndex = (toneMatch ? parseInt(toneMatch[0], 10) : 5) - 1;
  var toneMark = toneIndex === 4 && (!options.markNeutral || options.toneMarker !== 'number') ? '' : toneRep[toneIndex];
  if (pureWord === '\\n') return '\n';

  var result = '';
  if (word === pureWord && methodTable[word + '5']) {
    result = methodTable[word + '5'] + toneMark;
  } else if (methodTable[word]) {
    result = methodTable[word] + toneMark;
  } else if (methodTable[pureWord]) {
    result = methodTable[pureWord] + toneMark;
  } else {
    result = options.filterUnknown ? '' : '*' + pureWord + '*';
  }

  return result;
}

function pinyin2ipa(pinyIn) {
  var optionsArg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultOptions;

  var options = optionsArg;
  var output = pinyIn;

  if (options !== defaultOptions) {
    options = Object.assign({}, defaultOptions, options);
  }

  if (options.superscript && options.toneMarker !== 'number' && options.toneMarker !== 'chaonumber') {
    options.superscript = false;
  }

  var toneRep = toneReps['' + options.toneMarker + (options.superscript ? 'Superscript' : '')];

  output = output.replace(/(\d+)([^ ])/g, '$1 $2');
  output = output.replace(/\r?\n/g, ' #~linebreak~# ');

  var words = output.split(/[ '".,;:?!*“”\-—$§€()/´`]+/g);
  words = words.filter(function (w) {
    return !/^ +$/.test(w);
  });

  var methodTable = pinyin2ipa.methods[options.method];
  words = words.map(function (word) {
    return pinyinWord2IPA(word, methodTable, toneRep, options);
  });

  words = words.filter(function (w) {
    return !/^ +$/.test(w);
  });

  return words.join(' ').replace(/ ?(#~linebreak~#|\n) ?/g, '\n').trim();
}

pinyin2ipa.methods = {
  default: _default2.default,
  sophisticated: _sophisticated2.default
};

exports.default = pinyin2ipa;

// export { pinyin2ipa };

module.exports = exports.default;