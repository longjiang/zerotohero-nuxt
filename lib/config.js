// const dictionaryServer = 'http://hsk-server.local:8888/'
const dictionaryServer = 'https://server.chinesezerotohero.com/'

// const lrcServer = 'http://lyrics-search.local:8888/'
const lrcServer = 'https://lyrics-search.chinesezerotohero.com/'

export default {
  server: dictionaryServer,
  lrcServer: lrcServer,
  sketchEngineProxy: dictionaryServer + 'sketch-engine-proxy.php',
  proxy: dictionaryServer + 'proxy.php',
  jsonProxy: dictionaryServer + 'json-proxy.php',
  scrape: dictionaryServer + 'scrape.php',
  scrape2: dictionaryServer + 'scrape2.php',
  imageProxy: dictionaryServer + 'image.php',
  listPhotos: dictionaryServer + 'list-photos.php',
  savePhoto: dictionaryServer + 'save-photo.php',
  youtubeVideo: dictionaryServer + 'youtube-video.php',
  youtubePlaylist: dictionaryServer + 'youtube-playlist.php',
  youtubeChannelPlaylists: dictionaryServer + 'youtube-channel-playlists.php',
  imageUrl: dictionaryServer + 'data/word-images/',
  animatedSvgUrl: dictionaryServer + 'data/char-stroke-svgs/',
  lrcSearch: lrcServer + 'lrc/search/',
  wiki: 'https://db2.zerotohero.ca/zerotohero/',
  wikiAdmin: 'https://db2.zerotohero.ca/admin/#/',
  reject: {
    en: ['m', 's', 't', 'll', 'd', 're', 'ain', 'don']
  },
  youtubeVideosTableSuffix: {
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
  },
  youtubeVideosTableName(langId) {
    if (!langId) return false
    let suffix = ''
    for (let key in this.youtubeVideosTableSuffix) {
      if (this.youtubeVideosTableSuffix[key].includes(langId)) {
        suffix = `_${key}`
      }
    }
    return `${this.wiki}items/youtube_videos${suffix}`
  }
}
