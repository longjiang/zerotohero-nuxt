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

export const NON_PRO_MAX_LINES = 15; // The 'you need pro' prompt obscures 7 lines, so only NON_PRO_MAX_LINES - 7 are actually visible to non-pro users

export const NON_PRO_MAX_SUBS_SEARCH_HITS = 2;

export const POPULAR_LANGS = 'zh ja en fr de es ko ru yue it'.split(' ')

export const LANGS_WITH_META = 'vi fr ko yue ru de ja'.split(' ')