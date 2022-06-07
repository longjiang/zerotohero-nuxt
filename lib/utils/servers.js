// export default = 'http://hsk-server.local:8888/'
export const SERVER = 'https://server.chinesezerotohero.com/'

// export const LRC_SERVER = 'http://lyrics-search.local:8888/'
export const LRC_SERVER = 'https://lyrics-search.chinesezerotohero.com/'

export const server = SERVER
export const lrcServer = LRC_SERVER
export const sketchEngineProxy = SERVER + 'sketch-engine-proxy.php'
export const proxy = SERVER + 'proxy.php'
export const jsonProxy = SERVER + 'json-proxy.php'
export const scrape = SERVER + 'scrape.php'
export const scrape2 = SERVER + 'scrape2.php'
export const imageProxy = SERVER + 'image.php'
export const listPhotos = SERVER + 'list-photos.php'
export const savePhoto = SERVER + 'save-photo.php'
export const youtubeVideo = SERVER + 'youtube-video.php'
export const youtubePlaylist = SERVER + 'youtube-playlist.php'
export const youtubeChannelPlaylists = SERVER + 'youtube-channel-playlists.php'
export const imageUrl = SERVER + 'data/word-images/'
export const animatedSvgUrl = SERVER + 'data/char-stroke-svgs/'
export const lrcSearch = lrcServer + 'lrc/search/'
export const wiki = 'https://db2.zerotohero.ca/zerotohero/'
export const wikiAdmin = 'https://db2.zerotohero.ca/admin/#/'
export const reject = {
  en: ['m', 's', 't', 'll', 'd', 're', 'ain', 'don']
}
export const youtubeVideosTables = {
  2: [
    1874, // Basque
    6858, // Vietnamese
  ],
  3: [
    3179 // Korean
  ],
  4: [
    7731 // Chinese
  ],
  5: [
    1824 // English
  ],
  6: [
    1540 // German
  ],
  7: [
    2645, // Italian
    2780 // Japanese
  ],
  8: [
    1943, // French
  ],
  9: [
    5980, // Spanish
    1167, // Catalan
    5644, // Russian
  ]
}
export const youtubeVideosTableSuffix = (langId) => {
  if (!langId) throw 'Config.youtubeVideosTableSuffix: langId is not set!'
  let suffix = ''
  for (let key in this.youtubeVideosTables) {
    if (this.youtubeVideosTables[key].includes(langId)) {
      suffix = `_${key}`
    }
  }
  return suffix
}
export const youtubeVideosTableName = (langId) => {
  return `${this.wiki}items/youtube_videos${this.youtubeVideosTableSuffix(langId)}`
}
