import { v4 as uuidv4 } from 'uuid';
import countries from '../countries'
export { default as timeout } from './timeout'
export { default as speak } from './speak'
export { default as SPECIAL_LANGUAGES } from './special-languages'
export { DEFAULT_BACKGROUND_IMAGE, background } from './background'
export { default as SAMPLE_TEXT } from './sample-text'
export * from './language';
export * from './levels'
export * from './exams'
export * from './regex'
export * from './proxy'
export * from './url'
export * from './string'
export * from './array'
export * from './device'
export * from './random'
export * from './viewport'

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
export const uniqueId = () => {
  let uniqueID = uuidv4()
  return uniqueID
}
export const country = (code) => {
  for (let country of countries) {
    if (country.code === code) {
      return country
    }
  }
}
export const roundTo = (n, dec = 2) => {
  return Math.round(n * Math.pow(10, dec)) / Math.pow(10, dec)
}
export const isEmpty = (obj) => {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) return false
  }
  return true
}
