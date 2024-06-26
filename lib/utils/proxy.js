import $ from 'jquery'
import { SCRAPE_URL } from '../config'
import { parse } from "node-html-parser";

/**
 * Get the content from an URL via a caching proxy server
 * @param {string} url the url to proxy
 * @param {Object} options cacheLife is in seconds, -1 means never clear cache, 0 means clear cache immediately
 * @returns if the response data is text, returns text; if the response data is json, returns an object
 */
export const proxy = async (url, { cacheLife = -1, encoding = false, timeout = false } = {}) => {
  try {
    let proxyURL = `${SCRAPE_URL}?url=${encodeURIComponent(
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
    console.log(`proxy() cannot get ${url}`)
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
      `${SCRAPE_URL}?url=${encodeURIComponent(
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
    console.log(`scrape() cannot get ${url}`)
  }
}