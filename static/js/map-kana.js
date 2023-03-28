// const wanakana = require('wanakana');

// helper function to check if a character is a kanji
function isKanji(char) {
  // use Unicode range for kanji characters
  return char >= '\u4e00' && char <= '\u9faf';
}

// helper function to check if a character is a hiragana
function isHiragana(char) {
  // use Unicode range for hiragana characters
  return char >= '\u3040' && char <= '\u309f';
}




function segmentKanjisAndNonKanjis(text) {
  let normalized = convertKatakanaToHiragana(text)
  const regex = /([\u4e00-\u9faf]+|[^\u4e00-\u9faf]+)/g;
  const segments = normalized.match(regex);
  const originalSegments = text.match(regex)
  let parts = [];
  let i = 0;
  while (i < segments.length) {
    if (isKanji(segments[i][0]) == true) {
      parts.push({
        type: 'kanji',
        surface: originalSegments[i],
        reading: segments[i]
      });
    } else {
      parts.push({
        type: 'non-kanji',
        surface: originalSegments[i],
        reading: segments[i]
      });
    }
    i++;
  }
  return parts;
}

function convertKatakanaToHiragana(katakana) {
  let converted = ''
  for (let char of katakana) {
    if (wanakana.isKatakana(char)) converted += wanakana.toHiragana(char)
    else converted += char
  }
  return converted
}

function sanitizeRegexString(str) {
  // Escape special characters
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function createRegex(segments) {
  let regexStr = ''
  for (let segment of segments) {
    if (segment.type === 'kanji') regexStr += '(.+)'
    else regexStr += `(${sanitizeRegexString(segment.reading)})`
  }
  return new RegExp(regexStr)
}

function mapKana(word, reading) {
  let segments = segmentKanjisAndNonKanjis(word)
  let readings = reading.match(createRegex(segments))
  if (readings) {
    readings = readings.slice(1)
    for (let index in segments) {
      let segment = segments[index]
      segment.reading = readings[index]
    }
    return segments
  } else {
    return [{ type: 'kanji', surface: word, reading }]
  }
}

function test() {
  console.log(mapKana('乗り遅れる', 'のりおくれる'))
  console.log(mapKana('朝ご飯', 'あさごはん'))
  console.log(mapKana('食べ物', 'たべもの'))
  console.log(mapKana('お金', 'おかね'))
  console.log(mapKana('お弁当', 'おべんとう'))
  console.log(mapKana('食パン', 'しょくぱん'))
  console.log(mapKana('占める', 'しめる'))
}