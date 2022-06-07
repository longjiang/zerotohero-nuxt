export const DEFAULT_BACKGROUND_IMAGE = `/img/background-earth-vector.jpg`

const backgroundImages = {}

export const background = (l2 = undefined) => {
  if (!l2) return DEFAULT_BACKGROUND_IMAGE
  if (backgroundImages[l2.code]) return backgroundImages[l2.code]
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
    backgroundImages[l2.code] = `https://source.unsplash.com/1600x900/?${backgroundsKeyWords[l2.code].replace(/\s/g, '+')}`
  }
  else if (["dz", "pau", "ps", "lzh", "zh", "ug", "bo", "non"].includes(l2.code))
    backgroundImages[l2.code] = `${Config.server}data/img/backgrounds/bg-${l2.code}-${Math.ceil(
      Math.random() * 10
    )}.jpg`;
  else if (l2.han)
    backgroundImages[l2.code] = `${Config.server}data/img/backgrounds/bg-zh-${Math.ceil(Math.random() * 10)}.jpg`;
  else if (l2.country && l2.country.length > 0) {
    let randomCountryName = l2.country[Math.floor(Math.random() * l2.country.length)].name
    backgroundImages[l2.code] = `https://source.unsplash.com/1600x900/?${randomCountryName}`;
  }
  else if (l2['iso639-1']) backgroundImages[l2.code] = `https://source.unsplash.com/1600x900/?${l2.name}`;
  else backgroundImages[l2.code] = `${Config.server}data/img/backgrounds/background-branch.jpg`;
  return backgroundImages[l2.code]
}