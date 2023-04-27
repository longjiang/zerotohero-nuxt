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