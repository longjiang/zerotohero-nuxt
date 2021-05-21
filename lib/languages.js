export default {
  dictionaries: [],
  languages: [],
  translations: [],
  features: [],
  l1s: [],
  locales: [],
  scripts: [],
  omniglot: [],
  hours: [],
  youTubeLangs: [
    'aa',
    'ab',
    'af',
    'tw',
    'sq',
    'ase',
    'am',
    'ar',
    'arc',
    'hy',
    'as',
    'ay',
    'az',
    'bn',
    'ba',
    'eu',
    'be',
    'bh',
    'bi',
    'bs',
    'br',
    'bg',
    'my',
    'yue',
    'yue-HK',
    'ca',
    'chr',
    'zh',
    'zh-CN',
    'zh-HK',
    'zh-Hans',
    'zh-SG',
    'zh-TW',
    'zh-Hant',
    'cho',
    'co',
    'hr',
    'cs',
    'da',
    'nl',
    'nl-BE',
    'nl-NL',
    'dz',
    'en',
    'en-CA',
    'en-IE',
    'en-GB',
    'en-US',
    'eo',
    'et',
    'fo',
    'fj',
    'fil',
    'tl',
    'fi',
    'fr',
    'fr-BE',
    'fr-CA',
    'fr-FR',
    'fr-CH',
    'ff',
    'gl',
    'he',
    'ka',
    'de',
    'de-AT',
    'de-DE',
    'de-CH',
    'el',
    'grc',
    'gn',
    'gu',
    'hak',
    'hak-TW',
    'ha',
    'hbo',
    'iw',
    'hi',
    'hi-Latn',
    'hu',
    'is',
    'ig',
    'id',
    'ia',
    'ie',
    'iu',
    'ik',
    'ga',
    'it',
    'ja',
    'jv',
    'kl',
    'kn',
    'ks',
    'kk',
    'km',
    'rw',
    'tlh',
    'ko',
    'ku',
    'ky',
    'lo',
    'la',
    'lv',
    'ln',
    'lt',
    'lb',
    'mk',
    'mg',
    'ms',
    'ml',
    'mt',
    'mni',
    'mi',
    'mr',
    'mas',
    'nan',
    'nan-TW',
    'lus',
    'mn',
    'na',
    'nv',
    'ne',
    'no',
    'nb',
    'nn',
    'oc',
    'or',
    'om',
    'ps',
    'fa',
    'fa-AF',
    'fa-IR',
    'pl',
    'pt',
    'pt-BR',
    'pt-PT',
    'pa',
    'qu',
    'mo',
    'ro',
    'rm',
    'rn',
    'ru',
    'ru-Latn',
    'sm',
    'sg',
    'sa',
    'sc',
    'gd',
    'sr',
    'sr-Cyrl',
    'sh',
    'sr-Latn',
    'sdp',
    'sn',
    'scn',
    'sd',
    'si',
    'sk',
    'sl',
    'so',
    'st',
    'es',
    'es-419',
    'es-MX',
    'es-ES',
    'es-US',
    'su',
    'sw',
    'ss',
    'sv',
    'tg',
    'ta',
    'tt',
    'te',
    'th',
    'bo',
    'ti',
    'to',
    'ts',
    'tn',
    'tr',
    'tk',
    'uk',
    'ur',
    'uz',
    'vi',
    'vo',
    'cy',
    'fy',
    'wo',
    'xh',
    'yi',
    'yo',
    'zu'
  ],
  googleTranslateLangs: [
    'af',
    'am',
    'ar',
    'az',
    'be',
    'bg',
    'bn',
    'bs',
    'ca',
    'ceb',
    'co',
    'cs',
    'cy',
    'da',
    'de',
    'el',
    'en',
    'eo',
    'es',
    'et',
    'eu',
    'fa',
    'fi',
    'fr',
    'fy',
    'ga',
    'gd',
    'gl',
    'gu',
    'ha',
    'ha',
    'he',
    'hi',
    'hm',
    'hr',
    'ht',
    'hu',
    'hy',
    'id',
    'ig',
    'is',
    'it',
    'iw',
    'ja',
    'jw',
    'ka',
    'kk',
    'km',
    'kn',
    'ko',
    'ku',
    'ky',
    'la',
    'lb',
    'lo',
    'lt',
    'lv',
    'mg',
    'mi',
    'mk',
    'ml',
    'mn',
    'mr',
    'ms',
    'mt',
    'my',
    'ne',
    'nl',
    'no',
    'ny',
    'pa',
    'pl',
    'ps',
    'pt',
    'ro',
    'ru',
    'sd',
    'si',
    'sk',
    'sl',
    'sm',
    'sn',
    'so',
    'sq',
    'sr',
    'st',
    'su',
    'sv',
    'sw',
    'ta',
    'te',
    'tg',
    'th',
    'tl',
    'tr',
    'uk',
    'ur',
    'uz',
    'vi',
    'xh',
    'yi',
    'yo',
    'zh',
    'zh',
    'zu',
  ],
  loadFile(file) {
    return new Promise(resolve => {
      if (typeof Papa !== 'undefined') {
        Papa.parse(file, {
          download: true,
          header: true,
          complete: results => {
            resolve(results.data)
          }
        })
      }
    })
  },
  async loadDictionaries() {
    this.dictionaries = await this.loadFile('/data/languages/dictionaries.csv.txt')
  },
  async loadLanguages() {
    this.languages = await this.loadFile('/data/languages/languages.csv.txt')
  },
  async loadTranslations() {
    this.translations = await this.loadFile('/data/languages/translations.csv.txt')
  },
  async loadFeatures() {
    this.features = await this.loadFile('/data/languages/features.csv.txt')
  },
  async loadLocales() {
    this.locales = await this.loadFile('/data/languages/locales.csv.txt')
  },
  async loadScripts() {
    this.scripts = await this.loadFile('/data/languages/scripts.csv.txt')
  },
  async loadOmniglot() {
    this.omniglot = await this.loadFile('/data/languages/omniglot.csv.txt')
  },
  async loadHours() {
    this.hours = await this.loadFile('/data/languages/hours.csv.txt')
  },
  get(iso639_2t) {
    return this.l1s.find(language => language['iso639-3'] === iso639_2t)
  },
  getSmart(code) {
    return this.l1s.find(
      language =>
        language['iso639-3'] === code || language['iso639-1'] === code
    )
  },
  hasYouTube(l1, l2) {
    // l1.code = 'ceb', l2.code = 'en' -> yes, becuase we can find English YouTube videos, with sub translated in cebuano 
    // l1.code = 'en', l2.code = 'ceb' -> no, because we can't FIND cebuano subtitlted YouTube videos
    if (l2.code === 'ceb') return true
    if (l2.code === 'crh') return true
    return this.googleTranslateLangs.includes(this.code(l1)) && this.youTubeLangs.includes(this.code(l2))
  },
  code(language) {
    return language['iso639-1'] || language['iso639-3']
  },
  loadL1Features(l1s) {
    /*
     Goal:
    {
      "code": "af",
      ...
      "features": {
        "eng": [ "home", "courses" ] // means we have the "home" feature if you are studing English through Afrikaans
      }
    },
     */
    console.log('Loading language features.')
    for (let features of this.features) {
      let l1 = l1s.find(language => language['iso639-3'] === features.l1)
      l1.features = l1.features || {}
      l1.features[features.l2] = l1.features[features.l2] || []
      for (let key in features) {
        // key = 'home'
        if (key !== 'l1' && key !== 'l2' && features[key] === 'TRUE') {
          l1.features[features.l2].push(key) // key = 'home'
        }
      }
    }
    console.log('Features loaded.')
  },
  constructL1Data() {
    let l1s = []
    /*
     Goal:
    {
      "code": "af",
      "iso639-1": "afr",
      "iso639-3": "afr",
      "name": "Afrikaans",
      "direction": 'ltr',
      "dictionaries": {
        "eng": ["freedict"] // means we have a English-Afrikaans dictionary
      },
      "locales": ['zh-CN', 'zh-HK']
      "published": true,
      "translations": {
        "english": "Engels",
        "zerotohero": "Nul tot held"
      },
      "features": {
        "eng": [ "home", "courses" ] // means we have the "home" feature if you are studing English through Afrikaans
      }
    },
     */
    for (let language of this.languages) {
      let l1 = {
        code: this.code(language),
        id: language.id,
        'iso639-1': language['iso639-1'],
        'iso639-2t': language['iso639-2t'],
        'iso639-3': language['iso639-3'],
        name: language.name,
        type: language.type,
        direction: language.direction || 'ltr',
        published: true
      }
      l1s.push(l1)
    }
    for (let l1 of l1s) {
      l1.apostrophe = ['tlh', 'cy', 'uz', 'br'].includes(l1.code)
      l1.continua = ['zh', 'yue', 'nan', 'hak', 'th', 'lo', 'ja', 'km', 'ryu', 'bo', 'my'].includes(l1.code)
      l1.han = ['zh', 'yue', 'nan', 'hak', 'ja'].includes(l1.code)
      l1.scripts = this.scripts.filter(script => script.lang === l1.code && script.ms !== 'N' && script.p !== 'N' && script.ml !== 'O')
      let omniglot = this.omniglot.find(item => item['iso639-3'] === l1['iso639-3'])
      if (omniglot) {
        l1.omniglot = omniglot.url
      }
      let hours = this.hours.find(item => item['iso639-3'] === l1['iso639-3'])
      if (hours) {
        l1.hours = hours.hours
      }
    }
    for (let translation of this.translations) {
      let l1 = l1s.find(
        language => language['iso639-3'] === translation['iso639-3']
      )
      if (l1) {
        l1.translations = translation
      }
    }
    for (let dictionary of this.dictionaries) {
      let l1 = l1s.find(language => language['iso639-3'] === dictionary.l1)
      l1.dictionaries = l1.dictionaries || {}
      l1.dictionaries[dictionary.l2] = l1.dictionaries[dictionary.l2] || []
      l1.dictionaries[dictionary.l2].push(dictionary.dictionary) // "freedict"
    }
    this.loadL1Features(l1s)
    for (let locale of this.locales) {
      let l1 = l1s.find(language => language.code === locale.code)
      if (l1) {
        l1.locales = l1.locales || []
        l1.locales.push(locale.locale)
      }
    }
    return l1s
  },
  getFeatures(options) {
    let features = options.l1.features && options.l1.features[options.l2['iso639-3']]
      ? options.l1.features[options.l2['iso639-3']]
      : []
    if (options.l1.dictionaries && options.l1.dictionaries[options.l2['iso639-3']]) {
      if(!features.includes('dictionary')) features.push('dictionary')
    }
    if (this.hasYouTube(options.l1, options.l2)) {
      if(!features.includes('youtube')) features.push('youtube')
    }
    let speechCode = options.l2.code === 'yue' ? 'zh-HK' : options.l2.code
    let voices = speechSynthesis.getVoices().filter(voice => voice.lang.startsWith(speechCode))
    if (voices.length > 0) {
      if(!features.includes('speech')) features.push('speech')
    }
    if (options.l2.scripts && options.l2.scripts.length > 0 && options.l2.scripts[0].script !== 'Latn' && options.l2.scripts[0].script !== 'Zzzz') {
      if(!features.includes('transliteration')) features.push('transliteration')
    }
    if (options.l2.omniglot) {
      if(!features.includes('omniglot')) features.push('omniglot')
    }
    return features
  },
  logo(code) {
    if (code === 'en') {
      return `/img/ezh-icon.png`
    } else if (code === 'zh') {
      return `/img/czh-icon.png`
    } else {
      return `/img/logo-square/${code}.jpeg`
    }
  },
  async load() {
    console.log('Loading language data...')
    let promises = [
      this.loadDictionaries(),
      this.loadLanguages(),
      this.loadTranslations(),
      this.loadFeatures(),
      this.loadLocales(),
      this.loadScripts(),
      this.loadOmniglot(),
      this.loadHours()
    ]
    return new Promise(async resolve => {
      await Promise.all(promises)
      this.l1s = this.constructL1Data()
      resolve(this)
    })
  }
}
