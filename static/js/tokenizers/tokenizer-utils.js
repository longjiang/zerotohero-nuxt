const PYTHON_SERVER = 'https://python.zerotohero.ca/'

const SERVER = 'https://server.chinesezerotohero.com/'

const scrape2 = SERVER + 'scrape2.php'

const proxy = async (url, { cacheLife = -1, encoding = false, timeout = false } = {}) => {
  try {
    let proxyURL = `${scrape2}?url=${encodeURIComponent(
      url
    )}&cache_life=${cacheLife}` + (encoding ? `&encoding=${encoding}` : '')
    let response = await
      axios.get(
        proxyURL, { timeout }
      )
    if (response.data) {
      return response.data
    }
  } catch (err) {
    console.log(`Helper.proxy() cannot get ${url}`)
  }
  return false
}


// https://stackoverflow.com/questions/175739/how-can-i-check-if-a-string-is-a-valid-number
const isNumeric = (str) => {
  if (typeof str != "string") return false; // we only process strings!
  return (
    !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str))
  ); // ...and ensure strings of whitespace fail
}

const isThai = (text) => {
  let match = text.match(/[\u0E00-\u0E7F]+/g);
  return match;
}

const isChinese = (text) => {
  return text.match(
    // eslint-disable-next-line no-irregular-whitespace
    /[\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u3005\u3007\u3021-\u3029\u3038-\u303B‌​\u3400-\u4DB5\u4E00-\u9FCC\uF900-\uFA6D\uFA70-\uFAD9]+/g
  )
}

const isHangul = (text) => {
  let isHangul = text.match(/[\u1100-\u11FF\u302E\u302F\u3131-\u318E\u3200-\u321E\u3260-\u327E\uA960-\uA97C\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uFFA0-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]+/g)
  return isHangul
}