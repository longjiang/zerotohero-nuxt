import { SERVER } from '@/lib/utils/servers'

export const getDefaultBackground = () => {
  let dayOfMonth = new Date().getDate()
  return `/img/backgrounds/background-${dayOfMonth}.jpg`
}

export const DEFAULT_BACKGROUND_IMAGE = getDefaultBackground()

const backgroundImages = {}

export const backgroundKeyword = (l2 = undefined) => {
  let backgroundsKeyWords = {
    ase: 'United States',
    tlh: 'Star Trek',
    sjn: 'Lord of the Rings',
    wuu: 'Shanghai',
    nan: 'Fujian',
    yue: 'Hong Kong',
    hni: 'Yunnan'
  }
  if (backgroundsKeyWords[l2.code]) {
    return backgroundsKeyWords[l2.code]
  }
  else if (l2.country && l2.country.length > 0) {
    let randomCountryName = l2.country[Math.floor(Math.random() * l2.country.length)].name
    return randomCountryName
  }
  else if (l2['iso639-1']) backgroundUrl = l2.name;

}


export const unsplashUrl = (keyword) => {
  return `https://source.unsplash.com/1600x900/?${keyword.replace(/\s/g, '+')}`
}

export const background = (l2 = undefined) => {
  if (!l2) return DEFAULT_BACKGROUND_IMAGE
  if (backgroundImages[l2.code]) return backgroundImages[l2.code]
  let backgroundUrl = DEFAULT_BACKGROUND_IMAGE
  let keyword = backgroundKeyword(l2)
  if (l2.han)
    backgroundUrl = `${SERVER}data/img/backgrounds/bg-zh-${Math.ceil(Math.random() * 10)}.jpg`;
  else if (["dz", "pau", "ps", "lzh", "zh", "ug", "bo", "non"].includes(l2.code))
    backgroundUrl = `${SERVER}data/img/backgrounds/bg-${l2.code}-${Math.ceil(
      Math.random() * 10
    )}.jpg`;
  else if (keyword) backgroundUrl = unsplashUrl(keyword)
  backgroundImages[l2.code] = backgroundUrl
  return backgroundImages[l2.code]
}