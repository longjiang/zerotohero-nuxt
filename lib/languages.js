import Papa from 'papaparse'
import axios from 'axios'
import Helper from '@/lib/helper'
import Translators from '@/lib/translators'

export default {
  translations: [],
  features: [],
  l1s: [],
  locales: [],
  scripts: [],
  baiduTranslateLangs: [],
  youTubeLangs: [],
  liveTVLangs: [],
  async load() {
    console.log('Loading language data...')
    this.youTubeLangs = data.youTubeLangs,
      this.translations = data.translations,
      this.liveTVLangs = data.liveTVLangs
    this.features = this.loadCSVString(data.features)
    this.locales = this.loadCSVString(data.locales)
    await this.loadLanguages()
    return this
  },
  async loadLanguages() {
    let hours = this.loadCSVString(data.hours)
    let countries = await this.loadCSVFile(`${process.env.baseUrl}/data/languages/countries.csv.txt`)
    countries = countries.map((row) => {
      row.languages = row.languages ? row.languages.split(",") : [];
      return row;
    });
    let languages = await this.loadCSVFile(`${process.env.baseUrl}/data/languages/languages.csv.txt`)
    let omniglot = this.loadCSVString(data.omniglot)
    let dictionaries = this.loadCSVString(data.dictionaries)
    let scripts = await this.loadCSVFile(`${process.env.baseUrl}/data/languages/scripts.csv.txt`)
    let wiktionary_langs = data.wiktionary_langs.split(' ')
    let wiktionary_mapped_langs = data.wiktionary_mapped_langs.split(' ')
    let filteredLanguages = this.filterLanguages(languages, { wiktionary_langs })
    this.l1s = this.constructL1Data(filteredLanguages, { hours, countries, scripts, wiktionary_langs, wiktionary_mapped_langs, dictionaries, omniglot })
  },
  async loadCSVFile(url) {
    let res = await axios.get(url)
    if (res && res.data) {
      return this.loadCSVString(res.data)
    }
  },
  loadCSVString(csv, header = true) {
    if (typeof Papa !== 'undefined') {
      let r = Papa.parse(csv, {
        header: header
      })
      return r.data
    }
  },
  translationURL(text, l1, l2) {
    let translator = this.getTranslator(l1, l2)
    if (translator) {
      return translator.getTranslationURL(text, l1, l2)
    }
  },
  getTranslator(l1, l2) {
    if (typeof l1.translators[l2.code] === 'undefined') {
      l1.translators[l2.code] = Translators.get(l1, l2)
    }
    return l1.translators[l2.code]
  },
  get(iso639_3) {
    if (iso639_3) return this.l1s.find(language => language['iso639-3'] === iso639_3)
  },
  getById(id) {
    return this.l1s.find(l1 => l1.id === Number(id))
  },
  getSmart(code) {
    return this.l1s.find(
      language =>
        language['iso639-1'] === code || language['iso639-3'] === code || language['glottologId'] === code
    )
  },
  hasFeature(l1, l2, feature) {
    return this.getFeatures(
      {
        l1,
        l2,
      },
      process.browser
    )
      .includes(feature);
  },
  hasYouTube(l1, l2) {
    // l1.code = 'ceb', l2.code = 'en' -> yes, becuase we can find English YouTube videos, with sub translated in cebuano 
    // l1.code = 'en', l2.code = 'ceb' -> no, because we can't FIND cebuano subtitlted YouTube videos
    if (l2.code === 'ceb') return true
    if (l2.code === 'crh') return true
    if (l2.code === 'lzh') return true // Literary Chinese
    if (l2.code === 'cmn') return true // Mandarin
    let youTubeLangs = this.youTubeLangs.filter(l => [l2.code, ...l2.locales].includes(l))
    return youTubeLangs.length > 0
  },
  code(language) {
    return language['iso639-1'] || language['iso639-3'] || language['glottologId']
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
  filterLanguages(languages, { wiktionary_langs = [] } = {}) {
    let filteredLanguages = languages.filter(l => {
      if (wiktionary_langs.includes(l['iso639-3'])) return true
      if (l.type === 'L') return true
      if (l.logo) return true
      if (['hbo', 'enm', 'arc', 'grc', 'sjn'].includes(l['iso639-3'])) return true
      if (l['glottologFamilyId'] === 'sino1245') return true
    })
    return filteredLanguages
  },
  constructL1Data(languages, { hours = [], countries = [], wiktionary_langs = [], wiktionary_mapped_langs = [], dictionaries = [], omniglot = [] } = {}) {
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

    let l1s = languages.map(language => {
      let additional = {
        code: this.code(language),
        direction: language.direction || 'ltr', published: true
      }
      let obj = Object.assign(additional, language)
      if (obj.id) obj.id = Number(obj.id);
      if (obj.lat) obj.lat = Number(obj.lat);
      if (obj.long) obj.long = Number(obj.long);
      if (obj.speakers) obj.speakers = Number(obj.speakers);
      obj.name = language.name.replace(/ \(.*\)/, '').replace("Modern ", "").replace(" Standard", "").replace("Yue Chinese", "Cantonese").replace('Oriya', 'Odia').replace('Eastern Panjabi', 'Punjabi').replace('Panjabi', 'Punjabi')
      obj.country = countries.filter(c => language.country.split(' ').includes(c.alpha2Code))
      return obj
    })
    for (let l1 of l1s) {
      l1.translators = {}
      l1.apostrophe = ['tlh', 'cy', 'uz', 'br', 'tl', 'ceb', 'hy'].includes(l1.code)
      l1.han = 'cdo cjy cmn cnp cpx csp czo hak hsn lzh mnp nan wuu yue zho'.split(' ').includes(l1['iso639-3'])
      if (['leiz1236', 'hain1238'].includes(l1.glottologId)) l1.han = true
      l1.continua = l1.han || ['th', 'lo', 'ja', 'km', 'ryu', 'bo', 'my', 'dz'].includes(l1.code)
      l1.scripts = this.scripts.filter(script => script.lang === l1.code && script.ms !== 'N' && script.p !== 'N' && script.ml !== 'O')
      if (l1.scripts[0]) l1.direction = l1.scripts[0].direction
      let l1Omniglot = omniglot.find(item => item['iso639-3'] === l1['iso639-3'])
      if (l1Omniglot) {
        l1.omniglot = l1Omniglot.url
      }
      let l1hours = hours.find(item => item['iso639-3'] === l1['iso639-3'])
      if (l1hours) {
        l1.hours = l1hours.hours
      }
      if (this.translations[l1['iso639-3']]) l1.translations = this.translations[l1['iso639-3']]
      this.addLocales(l1)
    }
    for (let dictionary of dictionaries) {
      let l1 = l1s.find(language => language['iso639-3'] === dictionary.l1)
      if (typeof l1 !== 'undefined') {
        l1.dictionaries = l1.dictionaries || {}
        l1.dictionaries[dictionary.l2] = l1.dictionaries[dictionary.l2] || []
        l1.dictionaries[dictionary.l2].push(dictionary.dictionary) // "freedict"
      }
    }
    let english = l1s.find(l1 => l1.code === 'en')
    let all_wiktionary_langs = wiktionary_langs.concat(wiktionary_mapped_langs)
    for (let lang of all_wiktionary_langs) {
      english.dictionaries[lang] = english.dictionaries[lang] || []
      english.dictionaries[lang].push('wiktionary')
    }
    english.dictionaries['leiz1236'] = ['hsk-cedict']
    english.dictionaries['hain1238'] = ['hsk-cedict']
    this.loadL1Features(l1s)
    return l1s
  },
  addLocales(l1) {
    let locales = this.locales.filter(l => l.code === l1.code).map(l => l.locale)
    locales = locales.concat(l1.code)
    if (l1.han) {
      locales = locales.concat([
        'zh',
        'zh-CN',
        'zh-Hans',
        'zh-Hant',
        'zh-SG',
        'zh-TW',
        'zh-HK'])
    }
    if (!this.youTubeLangs.includes(locales[0]) && l1['iso639-3']) {
      if (l1.country && l1.country[0]) {
        let country = l1.country[0]
        if (country.languages && country.languages[0]) {
          let countryPrimaryLanguageCode = country.languages[0]
          let countryPrimaryLanguageLocales = this.locales.filter(l => l.code === countryPrimaryLanguageCode).map(l => l.locale)
          locales = locales.concat([countryPrimaryLanguageCode, ...countryPrimaryLanguageLocales])
        }
        if (country.name === "Philippines") locales.push('fil')
      }
    }
    l1.locales = Helper.unique(locales)
  },
  getFeatures({ l1, l2 }, browser) {
    let features = l1.features && l1.features[l2['iso639-3']]
      ? [].concat(l1.features[l2['iso639-3']])
      : []
    if (l1.dictionaries && (l1.dictionaries[l2['iso639-3'] || l2['glottologId']])) {
      if (!features.includes('dictionary')) features.push('dictionary')
    }
    if (this.hasYouTube(l1, l2)) {
      if (!features.includes('youtube')) features.push('youtube')
    }
    if (this.liveTVLangs.includes(l2['iso639-3'])) features.push('live-tv')
    if (browser) {
      let speechCodes = [l2.code]
      let additionalCodes = {
        'ms': ['id', 'id-ID'],
        'yue': ['zh-HK']
      }
      for (let c in additionalCodes) {
        if ((l2.code) === c) {
          speechCodes = speechCodes.concat(additionalCodes[c])
        }
      }
      if (l2.locales) speechCodes = speechCodes.concat(l2.locales)
      if (l2.han && !['yue', 'zh'].includes(l2.code)) speechCodes = [l2.code] // So that 'wuu', 'hak' does not get Mandarin speech
      let voices = speechSynthesis.getVoices().filter(voice => speechCodes.includes(voice.lang))
      if (voices.length > 0) {
        if (!features.includes('speech')) features.push('speech')
      }
    }
    if (l2.scripts && l2.scripts.length > 0 && l2.scripts[0].script !== 'Latn' && l2.scripts[0].script !== 'Zzzz') {
      if (!features.includes('transliteration')) features.push('transliteration')
    }
    if (l2.han && !features.includes('transliteration')) features.push('transliteration')
    if (l2.omniglot) {
      if (!features.includes('omniglot')) features.push('omniglot')
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
  isDescendant(child, ancestor) {
    let parent = this.parent(child)
    while (parent) {
      if (parent === ancestor) return true
      else parent = this.parent(parent)
    }
  },
  parent(language) {
    let parent = this.l1s.find(l => l.glottologId === language.glottologParentId)
    if (parent !== language) return parent
  },
}

const data = {
  translations: {
    afr: {
      'English Zero to Hero': 'Engels,Nul tot held'
    },
    ara: {
      'English Zero to Hero': 'الإنجليزية,من الصفر الى البطل'
    },
    ell: {
      'English Zero to Hero': 'Αγγλικά,Μηδέν στον Ήρωα',
    },
    fin: {
      'English Zero to Hero': 'Englanti,nolla sankarille',
    },
    fra: {
      'English Zero to Hero': 'Anglais,Zéro à héro',
    },
    gle: {
      'English Zero to Hero': 'Béarla,nialas go laoch',
    },
    hin: {
      'English Zero to Hero': 'अंग्रेज़ी,जीरो से हीरो',
    },
    hrv: {
      'English Zero to Hero': 'Engleski,nula heroju',
    },
    hun: {
      'English Zero to Hero': 'Angol,nulla hősnek',
    },
    ita: {
      'English Zero to Hero': "Inglese,zero all'eroe",
    },
    jpn: {
      'English Zero to Hero': '英語,ゼロからヒーロー',
    },
    lat: {
      'English Zero to Hero': 'Anglicus,nulla heros est',
    },
    nld: {
      'English Zero to Hero': 'Engels,Nul naar Held',
    },
    pol: {
      'English Zero to Hero': 'Angielski,zero do bohatera',
    },
    por: {
      'English Zero to Hero': 'Inglês,zero para o herói',
    },
    ron: {
      'English Zero to Hero': 'Engleză,zero la erou',
    },
    rus: {
      'English Zero to Hero': 'Aнглийский,ноль герою',
    },
    spa: {
      'English Zero to Hero': 'Inglés,Cero al héroe',
      'Chinese': 'Idioma chino',
      'Zero to Hero': 'Cero al héroe',
    },
    srp: {
      'English Zero to Hero': 'Енглеска,нула хероју',
    },
    swa: {
      'English Zero to Hero': 'Kiingereza,sifuri kwa shujaa',
    },
    swe: {
      'English Zero to Hero': 'Engelska,noll till hjälten',
    },
    tur: {
      'English Zero to Hero': 'ingilizce,sıfırdan zirveye',
    },
    eng: {
      '-ing objects of "{word}"': '-ing objects of "{word}"',
      '... abaft "{word}"': '... abaft "{word}"',
      '... aboard "{word}"': '... aboard "{word}"',
      '... about "{word}"': '... about "{word}"',
      '... above "{word}"': '... above "{word}"',
      '... across "{word}"': '... across "{word}"',
      '... afore "{word}"': '... afore "{word}"',
      '... after "{word}"': '... after "{word}"',
      '... against "{word}"': '... against "{word}"',
      '... agin "{word}"': '... agin "{word}"',
      '... ago "{word}"': '... ago "{word}"',
      '... ahead "{word}"': '... ahead "{word}"',
      '... albeit "{word}"': '... albeit "{word}"',
      '... along "{word}"': '... along "{word}"',
      '... alongside "{word}"': '... alongside "{word}"',
      '... although "{word}"': '... although "{word}"',
      '... amid "{word}"': '... amid "{word}"',
      '... amidst "{word}"': '... amidst "{word}"',
      '... among "{word}"': '... among "{word}"',
      '... amongst "{word}"': '... amongst "{word}"',
      '... anear "{word}"': '... anear "{word}"',
      '... anent "{word}"': '... anent "{word}"',
      '... around "{word}"': '... around "{word}"',
      '... as "{word}"': '... as "{word}"',
      '... aslant "{word}"': '... aslant "{word}"',
      '... astraddle "{word}"': '... astraddle "{word}"',
      '... astride "{word}"': '... astride "{word}"',
      '... at "{word}"': '... at "{word}"',
      '... athwart "{word}"': '... athwart "{word}"',
      '... atop "{word}"': '... atop "{word}"',
      '... atween "{word}"': '... atween "{word}"',
      '... away "{word}"': '... away "{word}"',
      '... bar "{word}"': '... bar "{word}"',
      '... barring "{word}"': '... barring "{word}"',
      '... because "{word}"': '... because "{word}"',
      '... before "{word}"': '... before "{word}"',
      '... behind "{word}"': '... behind "{word}"',
      '... below "{word}"': '... below "{word}"',
      '... beneath "{word}"': '... beneath "{word}"',
      '... beside "{word}"': '... beside "{word}"',
      '... besides "{word}"': '... besides "{word}"',
      '... between "{word}"': '... between "{word}"',
      '... betwixt "{word}"': '... betwixt "{word}"',
      '... beyond "{word}"': '... beyond "{word}"',
      '... by "{word}"': '... by "{word}"',
      '... chez "{word}"': '... chez "{word}"',
      '... circa "{word}"': '... circa "{word}"',
      '... come-on "{word}"': '... come-on "{word}"',
      '... comeon "{word}"': '... comeon "{word}"',
      '... concerning "{word}"': '... concerning "{word}"',
      '... considering "{word}"': '... considering "{word}"',
      '... cum "{word}"': '... cum "{word}"',
      '... despite "{word}"': '... despite "{word}"',
      '... directly "{word}"': '... directly "{word}"',
      '... down "{word}"': '... down "{word}"',
      '... downstream "{word}"': '... downstream "{word}"',
      '... downwind "{word}"': '... downwind "{word}"',
      '... during "{word}"': '... during "{word}"',
      '... en "{word}"': '... en "{word}"',
      '... ere "{word}"': '... ere "{word}"',
      '... ex "{word}"': '... ex "{word}"',
      '... except "{word}"': '... except "{word}"',
      '... excepting "{word}"': '... excepting "{word}"',
      '... failing "{word}"': '... failing "{word}"',
      '... for "{word}"': '... for "{word}"',
      '... forby "{word}"': '... forby "{word}"',
      '... forbye "{word}"': '... forbye "{word}"',
      '... fore "{word}"': '... fore "{word}"',
      '... fornenst "{word}"': '... fornenst "{word}"',
      '... forth "{word}"': '... forth "{word}"',
      '... frae "{word}"': '... frae "{word}"',
      '... from "{word}"': '... from "{word}"',
      '... here "{word}"': '... here "{word}"',
      '... home "{word}"': '... home "{word}"',
      '... howbeit "{word}"': '... howbeit "{word}"',
      '... if "{word}"': '... if "{word}"',
      '... immediately "{word}"': '... immediately "{word}"',
      '... in "{word}"': '... in "{word}"',
      '... inland "{word}"': '... inland "{word}"',
      '... inside "{word}"': '... inside "{word}"',
      '... insofar "{word}"': '... insofar "{word}"',
      '... into "{word}"': '... into "{word}"',
      '... inward "{word}"': '... inward "{word}"',
      '... is a "{word}"': '... is a "{word}"',
      '... layabout "{word}"': '... layabout "{word}"',
      '... less "{word}"': '... less "{word}"',
      '... lest "{word}"': '... lest "{word}"',
      '... like "{word}"': '... like "{word}"',
      '... maugre "{word}"': '... maugre "{word}"',
      '... mid "{word}"': '... mid "{word}"',
      '... midst "{word}"': '... midst "{word}"',
      '... minus "{word}"': '... minus "{word}"',
      '... nathless "{word}"': '... nathless "{word}"',
      '... near "{word}"': '... near "{word}"',
      '... nearest "{word}"': '... nearest "{word}"',
      '... neath "{word}"': '... neath "{word}"',
      '... neither "{word}"': '... neither "{word}"',
      '... next "{word}"': '... next "{word}"',
      '... nigh "{word}"': '... nigh "{word}"',
      '... north "{word}"': '... north "{word}"',
      '... notwithstanding "{word}"': '... notwithstanding "{word}"',
      '... now "{word}"': '... now "{word}"',
      '... of "{word}"': '... of "{word}"',
      '... off "{word}"': '... off "{word}"',
      '... offshore "{word}"': '... offshore "{word}"',
      '... on "{word}"': '... on "{word}"',
      '... once "{word}"': '... once "{word}"',
      '... onto "{word}"': '... onto "{word}"',
      '... opposite "{word}"': '... opposite "{word}"',
      '... out "{word}"': '... out "{word}"',
      '... outside "{word}"': '... outside "{word}"',
      '... outwith "{word}"': '... outwith "{word}"',
      '... over "{word}"': '... over "{word}"',
      '... overhead "{word}"': '... overhead "{word}"',
      '... pace "{word}"': '... pace "{word}"',
      '... par "{word}"': '... par "{word}"',
      '... past "{word}"': '... past "{word}"',
      '... per "{word}"': '... per "{word}"',
      '... piped-in "{word}"': '... piped-in "{word}"',
      '... plus "{word}"': '... plus "{word}"',
      '... post "{word}"': '... post "{word}"',
      '... pro "{word}"': '... pro "{word}"',
      '... qua "{word}"': '... qua "{word}"',
      '... re "{word}"': '... re "{word}"',
      '... reference "{word}"': '... reference "{word}"',
      '... regarding "{word}"': '... regarding "{word}"',
      '... respecting "{word}"': '... respecting "{word}"',
      '... sans "{word}"': '... sans "{word}"',
      '... save "{word}"': '... save "{word}"',
      '... saving "{word}"': '... saving "{word}"',
      '... senza "{word}"': '... senza "{word}"',
      '... since "{word}"': '... since "{word}"',
      '... sine "{word}"': '... sine "{word}"',
      '... sith "{word}"': '... sith "{word}"',
      '... so "{word}"': '... so "{word}"',
      '... sobeit "{word}"': '... sobeit "{word}"',
      '... south "{word}"': '... south "{word}"',
      '... such "{word}"': '... such "{word}"',
      '... syn "{word}"': '... syn "{word}"',
      '... syne "{word}"': '... syne "{word}"',
      '... than "{word}"': '... than "{word}"',
      '... though "{word}"': '... though "{word}"',
      '... thoughout "{word}"': '... thoughout "{word}"',
      '... thro "{word}"': '... thro "{word}"',
      '... through "{word}"': '... through "{word}"',
      '... throughout "{word}"': '... throughout "{word}"',
      '... thru "{word}"': '... thru "{word}"',
      '... thwart "{word}"': '... thwart "{word}"',
      '... till "{word}"': '... till "{word}"',
      '... to "{word}"': '... to "{word}"',
      '... toward "{word}"': '... toward "{word}"',
      '... towards "{word}"': '... towards "{word}"',
      '... under "{word}"': '... under "{word}"',
      '... underground "{word}"': '... underground "{word}"',
      '... underneath "{word}"': '... underneath "{word}"',
      '... unless "{word}"': '... unless "{word}"',
      '... unlike "{word}"': '... unlike "{word}"',
      '... until "{word}"': '... until "{word}"',
      '... unto "{word}"': '... unto "{word}"',
      '... up "{word}"': '... up "{word}"',
      '... uphill "{word}"': '... uphill "{word}"',
      '... upon "{word}"': '... upon "{word}"',
      '... upstream "{word}"': '... upstream "{word}"',
      '... v. "{word}"': '... v. "{word}"',
      '... versus "{word}"': '... versus "{word}"',
      '... via "{word}"': '... via "{word}"',
      '... vis-à-vis "{word}"': '... vis-à-vis "{word}"',
      '... vis-a-vis "{word}"': '... vis-a-vis "{word}"',
      '... vs. "{word}"': '... vs. "{word}"',
      '... wanting "{word}"': '... wanting "{word}"',
      '... west "{word}"': '... west "{word}"',
      '... when "{word}"': '... when "{word}"',
      '... whenas "{word}"': '... whenas "{word}"',
      '... whencesoever "{word}"': '... whencesoever "{word}"',
      '... whenever "{word}"': '... whenever "{word}"',
      '... whensoever "{word}"': '... whensoever "{word}"',
      '... where "{word}"': '... where "{word}"',
      '... whereas "{word}"': '... whereas "{word}"',
      '... wheresoever "{word}"': '... wheresoever "{word}"',
      '... whereupon "{word}"': '... whereupon "{word}"',
      '... wherever "{word}"': '... wherever "{word}"',
      '... whether "{word}"': '... whether "{word}"',
      '... while "{word}"': '... while "{word}"',
      '... whilst "{word}"': '... whilst "{word}"',
      '... whither "{word}"': '... whither "{word}"',
      '... whithersoever "{word}"': '... whithersoever "{word}"',
      '... with "{word}"': '... with "{word}"',
      '... withal "{word}"': '... withal "{word}"',
      '... within "{word}"': '... within "{word}"',
      '... without "{word}"': '... without "{word}"',
      '... worth "{word}"': '... worth "{word}"',
      '... yet "{word}"': '... yet "{word}"',
      '"{word}" abaft ...': '"{word}" abaft ...',
      '"{word}" aboard ...': '"{word}" aboard ...',
      '"{word}" about ...': '"{word}" about ...',
      '"{word}" above ...': '"{word}" above ...',
      '"{word}" across ...': '"{word}" across ...',
      '"{word}" afore ...': '"{word}" afore ...',
      '"{word}" after ...': '"{word}" after ...',
      '"{word}" against ...': '"{word}" against ...',
      '"{word}" agin ...': '"{word}" agin ...',
      '"{word}" ago ...': '"{word}" ago ...',
      '"{word}" ahead ...': '"{word}" ahead ...',
      '"{word}" albeit ...': '"{word}" albeit ...',
      '"{word}" along ...': '"{word}" along ...',
      '"{word}" alongside ...': '"{word}" alongside ...',
      '"{word}" although ...': '"{word}" although ...',
      '"{word}" amid ...': '"{word}" amid ...',
      '"{word}" amidst ...': '"{word}" amidst ...',
      '"{word}" among ...': '"{word}" among ...',
      '"{word}" amongst ...': '"{word}" amongst ...',
      '"{word}" and/or ...': '"{word}" and/or ...',
      '"{word}" anear ...': '"{word}" anear ...',
      '"{word}" anent ...': '"{word}" anent ...',
      '"{word}" around ...': '"{word}" around ...',
      '"{word}" as ...': '"{word}" as ...',
      '"{word}" aslant ...': '"{word}" aslant ...',
      '"{word}" astraddle ...': '"{word}" astraddle ...',
      '"{word}" astride ...': '"{word}" astride ...',
      '"{word}" at ...': '"{word}" at ...',
      '"{word}" athwart ...': '"{word}" athwart ...',
      '"{word}" atop ...': '"{word}" atop ...',
      '"{word}" atween ...': '"{word}" atween ...',
      '"{word}" away ...': '"{word}" away ...',
      '"{word}" bar ...': '"{word}" bar ...',
      '"{word}" barring ...': '"{word}" barring ...',
      '"{word}" because ...': '"{word}" because ...',
      '"{word}" before ...': '"{word}" before ...',
      '"{word}" behind ...': '"{word}" behind ...',
      '"{word}" below ...': '"{word}" below ...',
      '"{word}" beneath ...': '"{word}" beneath ...',
      '"{word}" beside ...': '"{word}" beside ...',
      '"{word}" besides ...': '"{word}" besides ...',
      '"{word}" between ...': '"{word}" between ...',
      '"{word}" betwixt ...': '"{word}" betwixt ...',
      '"{word}" beyond ...': '"{word}" beyond ...',
      '"{word}" by ...': '"{word}" by ...',
      '"{word}" chez ...': '"{word}" chez ...',
      '"{word}" circa ...': '"{word}" circa ...',
      '"{word}" come-on ...': '"{word}" come-on ...',
      '"{word}" comeon ...': '"{word}" comeon ...',
      '"{word}" concerning ...': '"{word}" concerning ...',
      '"{word}" considering ...': '"{word}" considering ...',
      '"{word}" cum ...': '"{word}" cum ...',
      '"{word}" despite ...': '"{word}" despite ...',
      '"{word}" directly ...': '"{word}" directly ...',
      '"{word}" down ...': '"{word}" down ...',
      '"{word}" downstream ...': '"{word}" downstream ...',
      '"{word}" downwind ...': '"{word}" downwind ...',
      '"{word}" during ...': '"{word}" during ...',
      '"{word}" en ...': '"{word}" en ...',
      '"{word}" ere ...': '"{word}" ere ...',
      '"{word}" ex ...': '"{word}" ex ...',
      '"{word}" except ...': '"{word}" except ...',
      '"{word}" excepting ...': '"{word}" excepting ...',
      '"{word}" failing ...': '"{word}" failing ...',
      '"{word}" for ...': '"{word}" for ...',
      '"{word}" forby ...': '"{word}" forby ...',
      '"{word}" forbye ...': '"{word}" forbye ...',
      '"{word}" fore ...': '"{word}" fore ...',
      '"{word}" fornenst ...': '"{word}" fornenst ...',
      '"{word}" forth ...': '"{word}" forth ...',
      '"{word}" frae ...': '"{word}" frae ...',
      '"{word}" from ...': '"{word}" from ...',
      '"{word}" here ...': '"{word}" here ...',
      '"{word}" home ...': '"{word}" home ...',
      '"{word}" howbeit ...': '"{word}" howbeit ...',
      '"{word}" if ...': '"{word}" if ...',
      '"{word}" immediately ...': '"{word}" immediately ...',
      '"{word}" in ...': '"{word}" in ...',
      '"{word}" inland ...': '"{word}" inland ...',
      '"{word}" inside ...': '"{word}" inside ...',
      '"{word}" insofar ...': '"{word}" insofar ...',
      '"{word}" into ...': '"{word}" into ...',
      '"{word}" inward ...': '"{word}" inward ...',
      '"{word}" is a ...': '"{word}" is a ...',
      '"{word}" layabout ...': '"{word}" layabout ...',
      '"{word}" less ...': '"{word}" less ...',
      '"{word}" lest ...': '"{word}" lest ...',
      '"{word}" like ...': '"{word}" like ...',
      '"{word}" maugre ...': '"{word}" maugre ...',
      '"{word}" mid ...': '"{word}" mid ...',
      '"{word}" midst ...': '"{word}" midst ...',
      '"{word}" minus ...': '"{word}" minus ...',
      '"{word}" nathless ...': '"{word}" nathless ...',
      '"{word}" near ...': '"{word}" near ...',
      '"{word}" nearest ...': '"{word}" nearest ...',
      '"{word}" neath ...': '"{word}" neath ...',
      '"{word}" neither ...': '"{word}" neither ...',
      '"{word}" next ...': '"{word}" next ...',
      '"{word}" nigh ...': '"{word}" nigh ...',
      '"{word}" north ...': '"{word}" north ...',
      '"{word}" notwithstanding ...': '"{word}" notwithstanding ...',
      '"{word}" now ...': '"{word}" now ...',
      '"{word}" of ...': '"{word}" of ...',
      '"{word}" off ...': '"{word}" off ...',
      '"{word}" offshore ...': '"{word}" offshore ...',
      '"{word}" on ...': '"{word}" on ...',
      '"{word}" once ...': '"{word}" once ...',
      '"{word}" onto ...': '"{word}" onto ...',
      '"{word}" opposite ...': '"{word}" opposite ...',
      '"{word}" out ...': '"{word}" out ...',
      '"{word}" outside ...': '"{word}" outside ...',
      '"{word}" outwith ...': '"{word}" outwith ...',
      '"{word}" over ...': '"{word}" over ...',
      '"{word}" overhead ...': '"{word}" overhead ...',
      '"{word}" pace ...': '"{word}" pace ...',
      '"{word}" par ...': '"{word}" par ...',
      '"{word}" past ...': '"{word}" past ...',
      '"{word}" per ...': '"{word}" per ...',
      '"{word}" piped-in ...': '"{word}" piped-in ...',
      '"{word}" plus ...': '"{word}" plus ...',
      '"{word}" post ...': '"{word}" post ...',
      '"{word}" pro ...': '"{word}" pro ...',
      '"{word}" qua ...': '"{word}" qua ...',
      '"{word}" re ...': '"{word}" re ...',
      '"{word}" reference ...': '"{word}" reference ...',
      '"{word}" regarding ...': '"{word}" regarding ...',
      '"{word}" respecting ...': '"{word}" respecting ...',
      '"{word}" sans ...': '"{word}" sans ...',
      '"{word}" save ...': '"{word}" save ...',
      '"{word}" saving ...': '"{word}" saving ...',
      '"{word}" senza ...': '"{word}" senza ...',
      '"{word}" since ...': '"{word}" since ...',
      '"{word}" sine ...': '"{word}" sine ...',
      '"{word}" sith ...': '"{word}" sith ...',
      '"{word}" so ...': '"{word}" so ...',
      '"{word}" sobeit ...': '"{word}" sobeit ...',
      '"{word}" south ...': '"{word}" south ...',
      '"{word}" such ...': '"{word}" such ...',
      '"{word}" syn ...': '"{word}" syn ...',
      '"{word}" syne ...': '"{word}" syne ...',
      '"{word}" than ...': '"{word}" than ...',
      '"{word}" though ...': '"{word}" though ...',
      '"{word}" thoughout ...': '"{word}" thoughout ...',
      '"{word}" thro ...': '"{word}" thro ...',
      '"{word}" through ...': '"{word}" through ...',
      '"{word}" throughout ...': '"{word}" throughout ...',
      '"{word}" thru ...': '"{word}" thru ...',
      '"{word}" thwart ...': '"{word}" thwart ...',
      '"{word}" till ...': '"{word}" till ...',
      '"{word}" to ...': '"{word}" to ...',
      '"{word}" toward ...': '"{word}" toward ...',
      '"{word}" towards ...': '"{word}" towards ...',
      '"{word}" under ...': '"{word}" under ...',
      '"{word}" underground ...': '"{word}" underground ...',
      '"{word}" underneath ...': '"{word}" underneath ...',
      '"{word}" unless ...': '"{word}" unless ...',
      '"{word}" unlike ...': '"{word}" unlike ...',
      '"{word}" until ...': '"{word}" until ...',
      '"{word}" unto ...': '"{word}" unto ...',
      '"{word}" up ...': '"{word}" up ...',
      '"{word}" uphill ...': '"{word}" uphill ...',
      '"{word}" upon ...': '"{word}" upon ...',
      '"{word}" upstream ...': '"{word}" upstream ...',
      '"{word}" v. ...': '"{word}" v. ...',
      '"{word}" versus ...': '"{word}" versus ...',
      '"{word}" via ...': '"{word}" via ...',
      '"{word}" vis-à-vis ...': '"{word}" vis-à-vis ...',
      '"{word}" vis-a-vis ...': '"{word}" vis-a-vis ...',
      '"{word}" vs. ...': '"{word}" vs. ...',
      '"{word}" wanting ...': '"{word}" wanting ...',
      '"{word}" west ...': '"{word}" west ...',
      '"{word}" when ...': '"{word}" when ...',
      '"{word}" whenas ...': '"{word}" whenas ...',
      '"{word}" whencesoever ...': '"{word}" whencesoever ...',
      '"{word}" whenever ...': '"{word}" whenever ...',
      '"{word}" whensoever ...': '"{word}" whensoever ...',
      '"{word}" where ...': '"{word}" where ...',
      '"{word}" whereas ...': '"{word}" whereas ...',
      '"{word}" wheresoever ...': '"{word}" wheresoever ...',
      '"{word}" whereupon ...': '"{word}" whereupon ...',
      '"{word}" wherever ...': '"{word}" wherever ...',
      '"{word}" whether ...': '"{word}" whether ...',
      '"{word}" while ...': '"{word}" while ...',
      '"{word}" whilst ...': '"{word}" whilst ...',
      '"{word}" whither ...': '"{word}" whither ...',
      '"{word}" whithersoever ...': '"{word}" whithersoever ...',
      '"{word}" with ...': '"{word}" with ...',
      '"{word}" withal ...': '"{word}" withal ...',
      '"{word}" within ...': '"{word}" within ...',
      '"{word}" without ...': '"{word}" without ...',
      '"{word}" worth ...': '"{word}" worth ...',
      '"{word}" yet ...': '"{word}" yet ...',
      '“{text}” videos on YouTube': '“{text}” videos on YouTube',
      '{l2} Movies': '{l2} Movies',
      '{l2} Music': '{l2} Music',
      '{l2} News': '{l2} News',
      '{l2} Talks': '{l2} Talks',
      '{l2} TV Shows': '{l2} TV Shows',
      '{l2} Video Library': '{l2} Video Library',
      '{l2} Videos': '{l2} Videos',
      '{l2} Videos': '{l2} Videos',
      '{l2} word or phrase': '{l2} word or phrase',
      '{word}\'s ...': '{word}\'s ...',
      'A_Modifier': 'V 的{word}',
      'adjective predicates of "{word}"': 'Adjective predicates of "{word}"',
      'adjectives after "{word}"': 'adjectives after "{word}"',
      'adjectives modified by "{word}"': 'adjectives modified by "{word}"',
      'adverbs modified by "{word}"': 'adverbs modified by "{word}"',
      'and/or': '{word}、N',
      'as reflexive': 'as reflexive',
      'Chinese': 'Chinese',
      'Collocations provided by': 'Collocations provided by',
      'Collocations with “{ text }”': 'Collocations with “{ text }”',
      'Collocations with “{text}”': 'Collocations with “{text}”',
      'complements of "{word}"': 'complements of "{word}"',
      'Contact {l2} Zero to Hero': 'Contact {l2} Zero to Hero',
      'copyPasteCSV': '<b>Copy</b> the text below and <b>paste</b> into your spreadsheet program, or a flashcard app like Anki or Quizlet.',
      'Courses that take your {l2} to the next level.': 'Courses that take your {l2} to the next level.',
      'Direct-Object_of': 'V {word}',
      'Direct-Object': '{word} COMPLEMENT',
      'Direct-SentObject': '……{word}……',
      'Enter a search term in {l2}...': 'Enter a search term in {l2}...',
      'For the love of {l2} words.': 'For the love of {l2} words.',
      'For the love of {count} {l2} words.': 'For the love of {count} {l2} words.',
      'For the love of the {l2} language.': 'For the love of the {l2} language.',
      'Images of “{text}” on the Web': 'Images of “{text}” on the Web',
      'in passive': 'in passive',
      'Indirect-Object_of': 'V（到）{word}',
      'Indirect-Object': '{word} N',
      'infinitive objects of "{word}"': 'Infinitive objects of "{word}"',
      'it\'s "{word}" to ...': 'it\'s "{word}" to ...',
      'libraryIntro': 'Read books from various {l2} sources directly in our Library.',
      'Measure': '一……{word}',
      'Modifier': 'ADV {word}',
      'modifiers of "{word}"': 'Modifiers of "{word}"',
      'Modifies': '{word}（的）N',
      'N_Modifier': 'N {word}',
      'nouns modified by "{word}"': 'nouns modified by "{word}"',
      'Object_of': 'V（为）{word}',
      'Object': '{word} OBJECT',
      'objects of "{word} across"': 'objects of "{word} across"',
      'objects of "{word} along"': 'objects of "{word} along"',
      'objects of "{word} apart"': 'objects of "{word} apart"',
      'objects of "{word} around"': 'objects of "{word} around"',
      'objects of "{word} aside"': 'objects of "{word} aside"',
      'objects of "{word} away"': 'objects of "{word} away"',
      'objects of "{word} down"': 'objects of "{word} down"',
      'objects of "{word} in"': 'objects of "{word} in"',
      'objects of "{word} off"': 'objects of "{word} off"',
      'objects of "{word} on"': 'objects of "{word} on"',
      'objects of "{word} open"': 'objects of "{word} open"',
      'objects of "{word} out"': 'objects of "{word} out"',
      'objects of "{word} over"': 'objects of "{word} over"',
      'objects of "{word} through"': 'objects of "{word} through"',
      'objects of "{word} unto"': 'objects of "{word} unto"',
      'objects of "{word} up"': 'objects of "{word} up"',
      'objects of "{word} upon"': 'objects of "{word} upon"',
      'objects of "{word} whole"': 'objects of "{word} whole"',
      'objects of "{word}"': 'Objects of "{word}"',
      'particles after "{word}" with object': 'particles after "{word}" with object',
      'particles after "{word}"': 'particles after "{word}"',
      'Paste {l1} translation here': 'Paste {l1} translation here',
      'Paste {l2} text here': 'Paste {l2} text here',
      'Possession': '{word}之 N',
      'Possessor': 'N 之{word}',
      'possessors of "{word}"': 'Possessors of "{word}"',
      'PP_把': '把 N {word}',
      'PP_对': '对 N {word}',
      'PP_给': '给 N {word}',
      'PP_将': '将 N {word}',
      'PP_就': '就 N {word}',
      'PP_如': '如 N {word}',
      'PP_为': '为 N {word}',
      'PP_向': '向 N {word}',
      'PP_以': '以 N {word}',
      'PP_因': '因 N {word}',
      'PP_于': '……{word}于……',
      'PP_与': '与 N {word}',
      'PP_在': '在 N {word}',
      'prepositional phrases': '介词短语',
      'pronominal objects of "{word}"': 'Pronominal objects of "{word}"',
      'pronominal possessors of "{word}"': 'Pronominal possessors of "{word}"',
      'pronominal subjects of "{word}"': 'pronominal subjects of "{word}"',
      'Random': 'Random',
      'Search {l2} YouTube': 'Search {l2} YouTube',
      'Search for more sentences at': 'Search for more sentences at',
      'Search the entire YouTube for {l2} videos with CC': 'Search the entire YouTube for {l2} videos with CC',
      'Sentences provided by': 'Sentences provided by',
      'Sentences with “{text}”': 'Sentences with “{text}”',
      'SentObject_of': 'V {word}',
      'SentObject': '{word} CLAUSE',
      'Show {count} More': 'Show {count} More',
      'Study any YouTube video that has {l2} subtitles.': 'Study any YouTube video that has {l2} subtitles.',
      'Subject_of': '{word} V',
      'Subject': 'N {word}',
      'subjects of "{word}"': '"Subjects of "{word}',
      'subjects of "be {word}"': 'Subjects of "be {word}"',
      'textReaderIntro': 'Write or paste in some {l2} text, and annotated text will show up below the textbox. You can also use <b>Markdown or HTML tags</b>. Everything is autosaved to your browser’s <code>localStorage</code>, so even if you refresh your browser everything you entered is still here.',
      'This is where you can enjoy reading a variety of {l2} books with the help of hover dictionary and the ability to save words.': 'This is where you can enjoy reading a variety of {l2} books with the help of hover dictionary and the ability to save words.',
      'TV Shows': 'TV Shows',
      'usage patterns': 'Usage patterns',
      'verbs before "{word}"': 'Verbs before "{word}"',
      'verbs complemented by "{word}"': 'Verbs complemented by "{word}"',
      'verbs modified by "{word}"': 'verbs modified by "{word}"',
      'verbs with "{word}" as object': 'Verbs with "{word}" as object',
      'verbs with "{word}" as subject': 'Verbs with "{word}" as subject',
      'verbs with particle "across" and "{word}" as object': 'verbs with particle "across" and "{word}" as object',
      'verbs with particle "along" and "{word}" as object': 'verbs with particle "along" and "{word}" as object',
      'verbs with particle "apart" and "{word}" as object': 'verbs with particle "apart" and "{word}" as object',
      'verbs with particle "around" and "{word}" as object': 'verbs with particle "around" and "{word}" as object',
      'verbs with particle "aside" and "{word}" as object': 'verbs with particle "aside" and "{word}" as object',
      'verbs with particle "away" and "{word}" as object': 'Verbs with particle "away" and "{word}" as object',
      'verbs with particle "down" and "{word}" as object': 'Verbs with particle "down" and "{word}" as object',
      'verbs with particle "in" and "{word}" as object': 'verbs with particle "in" and "{word}" as object',
      'verbs with particle "off" and "{word}" as object': 'Verbs with particle "off" and "{word}" as object',
      'verbs with particle "on" and "{word}" as object': 'verbs with particle "on" and "{word}" as object',
      'verbs with particle "open" and "{word}" as object': 'verbs with particle "open" and "{word}" as object',
      'verbs with particle "out" and "{word}" as object': 'Verbs with particle "out" and "{word}" as object',
      'verbs with particle "over" and "{word}" as object': 'Verbs with particle "over" and "{word}" as object',
      'verbs with particle "through" and "{word}" as object': 'verbs with particle "through" and "{word}" as object',
      'verbs with particle "unto" and "{word}" as object': 'verbs with particle "unto" and "{word}" as object',
      'verbs with particle "up" and "{word}" as object': 'Verbs with particle "up" and "{word}" as object',
      'verbs with particle "upon" and "{word}" as object': 'verbs with particle "upon" and "{word}" as object',
      'verbs with particle "whole" and "{word}" as object': 'verbs with particle "whole" and "{word}" as object',
      'wh-words following "{word}"': 'wh-words following "{word}"'
    },
    zho: {
      '-ing objects of "{word}"': '"{word}"的 -ing 宾语',
      '... abaft "{word}"': '... abaft "{word}"',
      '... aboard "{word}"': '... aboard "{word}"',
      '... about "{word}"': '... about "{word}"',
      '... above "{word}"': '... above "{word}"',
      '... across "{word}"': '... across "{word}"',
      '... afore "{word}"': '... afore "{word}"',
      '... after "{word}"': '... after "{word}"',
      '... against "{word}"': '... against "{word}"',
      '... agin "{word}"': '... agin "{word}"',
      '... ago "{word}"': '... ago "{word}"',
      '... ahead "{word}"': '... ahead "{word}"',
      '... albeit "{word}"': '... albeit "{word}"',
      '... along "{word}"': '... along "{word}"',
      '... alongside "{word}"': '... alongside "{word}"',
      '... although "{word}"': '... although "{word}"',
      '... amid "{word}"': '... amid "{word}"',
      '... amidst "{word}"': '... amidst "{word}"',
      '... among "{word}"': '... among "{word}"',
      '... amongst "{word}"': '... amongst "{word}"',
      '... anear "{word}"': '... anear "{word}"',
      '... anent "{word}"': '... anent "{word}"',
      '... around "{word}"': '... around "{word}"',
      '... as "{word}"': '... as "{word}"',
      '... aslant "{word}"': '... aslant "{word}"',
      '... astraddle "{word}"': '... astraddle "{word}"',
      '... astride "{word}"': '... astride "{word}"',
      '... at "{word}"': '... at "{word}"',
      '... athwart "{word}"': '... athwart "{word}"',
      '... atop "{word}"': '... atop "{word}"',
      '... atween "{word}"': '... atween "{word}"',
      '... away "{word}"': '... away "{word}"',
      '... bar "{word}"': '... bar "{word}"',
      '... barring "{word}"': '... barring "{word}"',
      '... because "{word}"': '... because "{word}"',
      '... before "{word}"': '... before "{word}"',
      '... behind "{word}"': '... behind "{word}"',
      '... below "{word}"': '... below "{word}"',
      '... beneath "{word}"': '... beneath "{word}"',
      '... beside "{word}"': '... beside "{word}"',
      '... besides "{word}"': '... besides "{word}"',
      '... between "{word}"': '... between "{word}"',
      '... betwixt "{word}"': '... betwixt "{word}"',
      '... beyond "{word}"': '... beyond "{word}"',
      '... by "{word}"': '... by "{word}"',
      '... chez "{word}"': '... chez "{word}"',
      '... circa "{word}"': '... circa "{word}"',
      '... come-on "{word}"': '... come-on "{word}"',
      '... comeon "{word}"': '... comeon "{word}"',
      '... concerning "{word}"': '... concerning "{word}"',
      '... considering "{word}"': '... considering "{word}"',
      '... cum "{word}"': '... cum "{word}"',
      '... despite "{word}"': '... despite "{word}"',
      '... directly "{word}"': '... directly "{word}"',
      '... down "{word}"': '... down "{word}"',
      '... downstream "{word}"': '... downstream "{word}"',
      '... downwind "{word}"': '... downwind "{word}"',
      '... during "{word}"': '... during "{word}"',
      '... en "{word}"': '... en "{word}"',
      '... ere "{word}"': '... ere "{word}"',
      '... ex "{word}"': '... ex "{word}"',
      '... except "{word}"': '... except "{word}"',
      '... excepting "{word}"': '... excepting "{word}"',
      '... failing "{word}"': '... failing "{word}"',
      '... for "{word}"': '... for "{word}"',
      '... forby "{word}"': '... forby "{word}"',
      '... forbye "{word}"': '... forbye "{word}"',
      '... fore "{word}"': '... fore "{word}"',
      '... fornenst "{word}"': '... fornenst "{word}"',
      '... forth "{word}"': '... forth "{word}"',
      '... frae "{word}"': '... frae "{word}"',
      '... from "{word}"': '... from "{word}"',
      '... here "{word}"': '... here "{word}"',
      '... home "{word}"': '... home "{word}"',
      '... howbeit "{word}"': '... howbeit "{word}"',
      '... if "{word}"': '... if "{word}"',
      '... immediately "{word}"': '... immediately "{word}"',
      '... in "{word}"': '... in "{word}"',
      '... inland "{word}"': '... inland "{word}"',
      '... inside "{word}"': '... inside "{word}"',
      '... insofar "{word}"': '... insofar "{word}"',
      '... into "{word}"': '... into "{word}"',
      '... inward "{word}"': '... inward "{word}"',
      '... is a "{word}"': '... is a "{word}"',
      '... layabout "{word}"': '... layabout "{word}"',
      '... less "{word}"': '... less "{word}"',
      '... lest "{word}"': '... lest "{word}"',
      '... like "{word}"': '... like "{word}"',
      '... maugre "{word}"': '... maugre "{word}"',
      '... mid "{word}"': '... mid "{word}"',
      '... midst "{word}"': '... midst "{word}"',
      '... minus "{word}"': '... minus "{word}"',
      '... nathless "{word}"': '... nathless "{word}"',
      '... near "{word}"': '... near "{word}"',
      '... nearest "{word}"': '... nearest "{word}"',
      '... neath "{word}"': '... neath "{word}"',
      '... neither "{word}"': '... neither "{word}"',
      '... next "{word}"': '... next "{word}"',
      '... nigh "{word}"': '... nigh "{word}"',
      '... north "{word}"': '... north "{word}"',
      '... notwithstanding "{word}"': '... notwithstanding "{word}"',
      '... now "{word}"': '... now "{word}"',
      '... of "{word}"': '... of "{word}"',
      '... off "{word}"': '... off "{word}"',
      '... offshore "{word}"': '... offshore "{word}"',
      '... on "{word}"': '... on "{word}"',
      '... once "{word}"': '... once "{word}"',
      '... onto "{word}"': '... onto "{word}"',
      '... opposite "{word}"': '... opposite "{word}"',
      '... out "{word}"': '... out "{word}"',
      '... outside "{word}"': '... outside "{word}"',
      '... outwith "{word}"': '... outwith "{word}"',
      '... over "{word}"': '... over "{word}"',
      '... overhead "{word}"': '... overhead "{word}"',
      '... pace "{word}"': '... pace "{word}"',
      '... par "{word}"': '... par "{word}"',
      '... past "{word}"': '... past "{word}"',
      '... per "{word}"': '... per "{word}"',
      '... piped-in "{word}"': '... piped-in "{word}"',
      '... plus "{word}"': '... plus "{word}"',
      '... post "{word}"': '... post "{word}"',
      '... pro "{word}"': '... pro "{word}"',
      '... qua "{word}"': '... qua "{word}"',
      '... re "{word}"': '... re "{word}"',
      '... reference "{word}"': '... reference "{word}"',
      '... regarding "{word}"': '... regarding "{word}"',
      '... respecting "{word}"': '... respecting "{word}"',
      '... sans "{word}"': '... sans "{word}"',
      '... save "{word}"': '... save "{word}"',
      '... saving "{word}"': '... saving "{word}"',
      '... senza "{word}"': '... senza "{word}"',
      '... since "{word}"': '... since "{word}"',
      '... sine "{word}"': '... sine "{word}"',
      '... sith "{word}"': '... sith "{word}"',
      '... so "{word}"': '... so "{word}"',
      '... sobeit "{word}"': '... sobeit "{word}"',
      '... south "{word}"': '... south "{word}"',
      '... such "{word}"': '... such "{word}"',
      '... syn "{word}"': '... syn "{word}"',
      '... syne "{word}"': '... syne "{word}"',
      '... than "{word}"': '... than "{word}"',
      '... though "{word}"': '... though "{word}"',
      '... thoughout "{word}"': '... thoughout "{word}"',
      '... thro "{word}"': '... thro "{word}"',
      '... through "{word}"': '... through "{word}"',
      '... throughout "{word}"': '... throughout "{word}"',
      '... thru "{word}"': '... thru "{word}"',
      '... thwart "{word}"': '... thwart "{word}"',
      '... till "{word}"': '... till "{word}"',
      '... to "{word}"': '... to "{word}"',
      '... toward "{word}"': '... toward "{word}"',
      '... towards "{word}"': '... towards "{word}"',
      '... under "{word}"': '... under "{word}"',
      '... underground "{word}"': '... underground "{word}"',
      '... underneath "{word}"': '... underneath "{word}"',
      '... unless "{word}"': '... unless "{word}"',
      '... unlike "{word}"': '... unlike "{word}"',
      '... until "{word}"': '... until "{word}"',
      '... unto "{word}"': '... unto "{word}"',
      '... up "{word}"': '... up "{word}"',
      '... uphill "{word}"': '... uphill "{word}"',
      '... upon "{word}"': '... upon "{word}"',
      '... upstream "{word}"': '... upstream "{word}"',
      '... v. "{word}"': '... v. "{word}"',
      '... versus "{word}"': '... versus "{word}"',
      '... via "{word}"': '... via "{word}"',
      '... vis-à-vis "{word}"': '... vis-à-vis "{word}"',
      '... vis-a-vis "{word}"': '... vis-a-vis "{word}"',
      '... vs. "{word}"': '... vs. "{word}"',
      '... wanting "{word}"': '... wanting "{word}"',
      '... west "{word}"': '... west "{word}"',
      '... when "{word}"': '... when "{word}"',
      '... whenas "{word}"': '... whenas "{word}"',
      '... whencesoever "{word}"': '... whencesoever "{word}"',
      '... whenever "{word}"': '... whenever "{word}"',
      '... whensoever "{word}"': '... whensoever "{word}"',
      '... where "{word}"': '... where "{word}"',
      '... whereas "{word}"': '... whereas "{word}"',
      '... wheresoever "{word}"': '... wheresoever "{word}"',
      '... whereupon "{word}"': '... whereupon "{word}"',
      '... wherever "{word}"': '... wherever "{word}"',
      '... whether "{word}"': '... whether "{word}"',
      '... while "{word}"': '... while "{word}"',
      '... whilst "{word}"': '... whilst "{word}"',
      '... whither "{word}"': '... whither "{word}"',
      '... whithersoever "{word}"': '... whithersoever "{word}"',
      '... with "{word}"': '... with "{word}"',
      '... withal "{word}"': '... withal "{word}"',
      '... within "{word}"': '... within "{word}"',
      '... without "{word}"': '... without "{word}"',
      '... worth "{word}"': '... worth "{word}"',
      '... yet "{word}"': '... yet "{word}"',
      '"{word}" abaft ...': '"{word}" abaft ...',
      '"{word}" aboard ...': '"{word}" aboard ...',
      '"{word}" about ...': '"{word}" about ...',
      '"{word}" above ...': '"{word}" above ...',
      '"{word}" across ...': '"{word}" across ...',
      '"{word}" afore ...': '"{word}" afore ...',
      '"{word}" after ...': '"{word}" after ...',
      '"{word}" against ...': '"{word}" against ...',
      '"{word}" agin ...': '"{word}" agin ...',
      '"{word}" ago ...': '"{word}" ago ...',
      '"{word}" ahead ...': '"{word}" ahead ...',
      '"{word}" albeit ...': '"{word}" albeit ...',
      '"{word}" along ...': '"{word}" along ...',
      '"{word}" alongside ...': '"{word}" alongside ...',
      '"{word}" although ...': '"{word}" although ...',
      '"{word}" amid ...': '"{word}" amid ...',
      '"{word}" amidst ...': '"{word}" amidst ...',
      '"{word}" among ...': '"{word}" among ...',
      '"{word}" amongst ...': '"{word}" amongst ...',
      '"{word}" and/or ...': '"{word}" 的并列搭配',
      '"{word}" anear ...': '"{word}" anear ...',
      '"{word}" anent ...': '"{word}" anent ...',
      '"{word}" around ...': '"{word}" around ...',
      '"{word}" as ...': '"{word}" as ...',
      '"{word}" aslant ...': '"{word}" aslant ...',
      '"{word}" astraddle ...': '"{word}" astraddle ...',
      '"{word}" astride ...': '"{word}" astride ...',
      '"{word}" at ...': '"{word}" at ...',
      '"{word}" athwart ...': '"{word}" athwart ...',
      '"{word}" atop ...': '"{word}" atop ...',
      '"{word}" atween ...': '"{word}" atween ...',
      '"{word}" away ...': '"{word}" away ...',
      '"{word}" bar ...': '"{word}" bar ...',
      '"{word}" barring ...': '"{word}" barring ...',
      '"{word}" because ...': '"{word}" because ...',
      '"{word}" before ...': '"{word}" before ...',
      '"{word}" behind ...': '"{word}" behind ...',
      '"{word}" below ...': '"{word}" below ...',
      '"{word}" beneath ...': '"{word}" beneath ...',
      '"{word}" beside ...': '"{word}" beside ...',
      '"{word}" besides ...': '"{word}" besides ...',
      '"{word}" between ...': '"{word}" between ...',
      '"{word}" betwixt ...': '"{word}" betwixt ...',
      '"{word}" beyond ...': '"{word}" beyond ...',
      '"{word}" by ...': '"{word}" by ...',
      '"{word}" chez ...': '"{word}" chez ...',
      '"{word}" circa ...': '"{word}" circa ...',
      '"{word}" come-on ...': '"{word}" come-on ...',
      '"{word}" comeon ...': '"{word}" comeon ...',
      '"{word}" concerning ...': '"{word}" concerning ...',
      '"{word}" considering ...': '"{word}" considering ...',
      '"{word}" cum ...': '"{word}" cum ...',
      '"{word}" despite ...': '"{word}" despite ...',
      '"{word}" directly ...': '"{word}" directly ...',
      '"{word}" down ...': '"{word}" down ...',
      '"{word}" downstream ...': '"{word}" downstream ...',
      '"{word}" downwind ...': '"{word}" downwind ...',
      '"{word}" during ...': '"{word}" during ...',
      '"{word}" en ...': '"{word}" en ...',
      '"{word}" ere ...': '"{word}" ere ...',
      '"{word}" ex ...': '"{word}" ex ...',
      '"{word}" except ...': '"{word}" except ...',
      '"{word}" excepting ...': '"{word}" excepting ...',
      '"{word}" failing ...': '"{word}" failing ...',
      '"{word}" for ...': '"{word}" for ...',
      '"{word}" forby ...': '"{word}" forby ...',
      '"{word}" forbye ...': '"{word}" forbye ...',
      '"{word}" fore ...': '"{word}" fore ...',
      '"{word}" fornenst ...': '"{word}" fornenst ...',
      '"{word}" forth ...': '"{word}" forth ...',
      '"{word}" frae ...': '"{word}" frae ...',
      '"{word}" from ...': '"{word}" from ...',
      '"{word}" here ...': '"{word}" here ...',
      '"{word}" home ...': '"{word}" home ...',
      '"{word}" howbeit ...': '"{word}" howbeit ...',
      '"{word}" if ...': '"{word}" if ...',
      '"{word}" immediately ...': '"{word}" immediately ...',
      '"{word}" in ...': '"{word}" in ...',
      '"{word}" inland ...': '"{word}" inland ...',
      '"{word}" inside ...': '"{word}" inside ...',
      '"{word}" insofar ...': '"{word}" insofar ...',
      '"{word}" into ...': '"{word}" into ...',
      '"{word}" inward ...': '"{word}" inward ...',
      '"{word}" is a ...': '"{word}" is a ...',
      '"{word}" layabout ...': '"{word}" layabout ...',
      '"{word}" less ...': '"{word}" less ...',
      '"{word}" lest ...': '"{word}" lest ...',
      '"{word}" like ...': '"{word}" like ...',
      '"{word}" maugre ...': '"{word}" maugre ...',
      '"{word}" mid ...': '"{word}" mid ...',
      '"{word}" midst ...': '"{word}" midst ...',
      '"{word}" minus ...': '"{word}" minus ...',
      '"{word}" nathless ...': '"{word}" nathless ...',
      '"{word}" near ...': '"{word}" near ...',
      '"{word}" nearest ...': '"{word}" nearest ...',
      '"{word}" neath ...': '"{word}" neath ...',
      '"{word}" neither ...': '"{word}" neither ...',
      '"{word}" next ...': '"{word}" next ...',
      '"{word}" nigh ...': '"{word}" nigh ...',
      '"{word}" north ...': '"{word}" north ...',
      '"{word}" notwithstanding ...': '"{word}" notwithstanding ...',
      '"{word}" now ...': '"{word}" now ...',
      '"{word}" of ...': '"{word}" of ...',
      '"{word}" off ...': '"{word}" off ...',
      '"{word}" offshore ...': '"{word}" offshore ...',
      '"{word}" on ...': '"{word}" on ...',
      '"{word}" once ...': '"{word}" once ...',
      '"{word}" onto ...': '"{word}" onto ...',
      '"{word}" opposite ...': '"{word}" opposite ...',
      '"{word}" out ...': '"{word}" out ...',
      '"{word}" outside ...': '"{word}" outside ...',
      '"{word}" outwith ...': '"{word}" outwith ...',
      '"{word}" over ...': '"{word}" over ...',
      '"{word}" overhead ...': '"{word}" overhead ...',
      '"{word}" pace ...': '"{word}" pace ...',
      '"{word}" par ...': '"{word}" par ...',
      '"{word}" past ...': '"{word}" past ...',
      '"{word}" per ...': '"{word}" per ...',
      '"{word}" piped-in ...': '"{word}" piped-in ...',
      '"{word}" plus ...': '"{word}" plus ...',
      '"{word}" post ...': '"{word}" post ...',
      '"{word}" pro ...': '"{word}" pro ...',
      '"{word}" qua ...': '"{word}" qua ...',
      '"{word}" re ...': '"{word}" re ...',
      '"{word}" reference ...': '"{word}" reference ...',
      '"{word}" regarding ...': '"{word}" regarding ...',
      '"{word}" respecting ...': '"{word}" respecting ...',
      '"{word}" sans ...': '"{word}" sans ...',
      '"{word}" save ...': '"{word}" save ...',
      '"{word}" saving ...': '"{word}" saving ...',
      '"{word}" senza ...': '"{word}" senza ...',
      '"{word}" since ...': '"{word}" since ...',
      '"{word}" sine ...': '"{word}" sine ...',
      '"{word}" sith ...': '"{word}" sith ...',
      '"{word}" so ...': '"{word}" so ...',
      '"{word}" sobeit ...': '"{word}" sobeit ...',
      '"{word}" south ...': '"{word}" south ...',
      '"{word}" such ...': '"{word}" such ...',
      '"{word}" syn ...': '"{word}" syn ...',
      '"{word}" syne ...': '"{word}" syne ...',
      '"{word}" than ...': '"{word}" than ...',
      '"{word}" though ...': '"{word}" though ...',
      '"{word}" thoughout ...': '"{word}" thoughout ...',
      '"{word}" thro ...': '"{word}" thro ...',
      '"{word}" through ...': '"{word}" through ...',
      '"{word}" throughout ...': '"{word}" throughout ...',
      '"{word}" thru ...': '"{word}" thru ...',
      '"{word}" thwart ...': '"{word}" thwart ...',
      '"{word}" till ...': '"{word}" till ...',
      '"{word}" to ...': '"{word}" to ...',
      '"{word}" toward ...': '"{word}" toward ...',
      '"{word}" towards ...': '"{word}" towards ...',
      '"{word}" under ...': '"{word}" under ...',
      '"{word}" underground ...': '"{word}" underground ...',
      '"{word}" underneath ...': '"{word}" underneath ...',
      '"{word}" unless ...': '"{word}" unless ...',
      '"{word}" unlike ...': '"{word}" unlike ...',
      '"{word}" until ...': '"{word}" until ...',
      '"{word}" unto ...': '"{word}" unto ...',
      '"{word}" up ...': '"{word}" up ...',
      '"{word}" uphill ...': '"{word}" uphill ...',
      '"{word}" upon ...': '"{word}" upon ...',
      '"{word}" upstream ...': '"{word}" upstream ...',
      '"{word}" v. ...': '"{word}" v. ...',
      '"{word}" versus ...': '"{word}" versus ...',
      '"{word}" via ...': '"{word}" via ...',
      '"{word}" vis-à-vis ...': '"{word}" vis-à-vis ...',
      '"{word}" vis-a-vis ...': '"{word}" vis-a-vis ...',
      '"{word}" vs. ...': '"{word}" vs. ...',
      '"{word}" wanting ...': '"{word}" wanting ...',
      '"{word}" west ...': '"{word}" west ...',
      '"{word}" when ...': '"{word}" when ...',
      '"{word}" whenas ...': '"{word}" whenas ...',
      '"{word}" whencesoever ...': '"{word}" whencesoever ...',
      '"{word}" whenever ...': '"{word}" whenever ...',
      '"{word}" whensoever ...': '"{word}" whensoever ...',
      '"{word}" where ...': '"{word}" where ...',
      '"{word}" whereas ...': '"{word}" whereas ...',
      '"{word}" wheresoever ...': '"{word}" wheresoever ...',
      '"{word}" whereupon ...': '"{word}" whereupon ...',
      '"{word}" wherever ...': '"{word}" wherever ...',
      '"{word}" whether ...': '"{word}" whether ...',
      '"{word}" while ...': '"{word}" while ...',
      '"{word}" whilst ...': '"{word}" whilst ...',
      '"{word}" whither ...': '"{word}" whither ...',
      '"{word}" whithersoever ...': '"{word}" whithersoever ...',
      '"{word}" with ...': '"{word}" with ...',
      '"{word}" withal ...': '"{word}" withal ...',
      '"{word}" within ...': '"{word}" within ...',
      '"{word}" without ...': '"{word}" without ...',
      '"{word}" worth ...': '"{word}" worth ...',
      '"{word}" yet ...': '"{word}" yet ...',
      '“{text}” videos on YouTube': '在 YouTube 上关于 “{text}” 的视频',
      '{l2} Movies': '{l2}电影',
      '{l2} Music': '{l2}音乐',
      '{l2} News': '{l2}新闻',
      '{l2} Talks': '{l2}演说',
      '{l2} TV Shows': '{l2}电视节目',
      '{l2} Video Library': '{l2}视频资料库',
      '{l2} Videos': '{l2}视频',
      '{l2} word or phrase': '{l2}单词或短语',
      '{word}\'s ...': '{word}\'s ...',
      '<b>Teachable</b> is an online platform that hosts video courses.': '<b>Teachable</b> 是一个第三方代管视频课程的在线平台。',
      'adjective predicates of "{word}"': '"{word}" 的形容词谓语',
      'adjectives after "{word}"': '"{word}" 后的形容词',
      'adjectives modified by "{word}"': '"{word}"修饰的形容词',
      'adverbs modified by "{word}"': '"{word}"修饰的副词',
      'Affiliate Program': '申请销售代理',
      'as reflexive': '反身形式',
      'Audio-Visual': '视听资源',
      'Blog': '博客',
      'Clear': '清除',
      'Code': '代码',
      'Collocations provided by': '词语搭配提供方',
      'Collocations with “{text}”': '跟 “{text}” 的词语搭配',
      'Compare': '比较',
      'Community': '社群',
      'complements of "{word}"': '"{word}" 的补语',
      'Contact {l2} Zero to Hero': '联系{l2}英雄',
      'Contact Jon with course-related questions.': '有关课程内容的问题，请联系 Jon。',
      'Contact Ken with general or business inquiries.': '一般业务咨询，请联系 Ken。',
      'Contact Us': '联系我们',
      'Contact': '联系',
      'copyPasteCSV': '将下面的文本<b>复制</b>并<b>粘贴</b>到电子表格程序中，或导入到类似 Anki 或 Quizlet 的背单词程序中。',
      'Corpus': '语料库',
      'Course Textbooks': '课程中使用的课本',
      'Courses that take your {l2} to the next level.': '让您的{l2}步入新阶段的语言课程',
      'Courses': '课程',
      'Custom Reading': '自定义阅读',
      'Definitions': '释义',
      'Dictionary': '词典',
      'Discussions': '讨论',
      'Download the WeChat app, scan Ken’s QR code below, leave him a message, and he will invite you into the group.': '下载微信应用，扫描下面 Ken 的二维码，用微信给他发消息，他会邀请你加入群。',
      'English Zero to Hero': '英语,英雄',
      'English': '英语',
      'English': '英语',
      'Enter a search term in {l2}...': '键入{l2}关键词……',
      'Enter your {l2} text here. Markdown and HTML also supported.': '在此键入{l2}文本。同时支持 Markdown 和 HTML。',
      'Export CSV': '导出 CSV 文件',
      'FAQ': '常见问题',
      'For the love of {l2} words.': '只因酷爱{l2}词。',
      'For the love of {count} {l2} words.': '只因酷爱{count}个{l2}词。',
      'For the love of the {l2} language.': '只因酷爱{l2}。',
      'Generate': '生成',
      'Go': '前往',
      'Guided Readers': '阅读材料',
      'Hakka Chinese': '客家话',
      'If you are taking our courses and have a question regarding any content, leave a comment in the comment area of the lecture.': '如果您正在学习我们的课程，对任何课程内容有疑问，请在视频讲座的评论区留言。',
      'Image search by': '图片搜索提供方',
      'Images of “{text}” on the Web': '网上关于 “{text}” 的图片',
      'in passive': '被动语态',
      'infinitive objects of "{word}"': '"{word}" 的不定式宾语',
      'Inlcude:': '包括：',
      'it\'s "{word}" to ...': 'it\'s "{word}" to ...',
      'Join our WeChat discussion group': '加入我们的微信聊天群。',
      'Jon’s Reddit:': 'Jon 的 Reddit',
      'Ken’s Email:': 'Ken 的邮箱',
      'Ken’s WeChat:': 'Ken 的微信',
      'Language Courses': '语言课程',
      'Language': '语言',
      'Learn English through various languages:': '让全世界学习英语：',
      'Learn varous languages through English:': '通过英语学习其他语言：',
      'Learning Path': '学习攻略',
      'Less words': '少标些词',
      'Library': '阅览室',
      'libraryIntro': '在 “阅览室” 页面直接阅读各式{l2}文献。',
      'Literary Chinese': '文言文',
      'Live TV': '电视直播',
      'Look for {l2} music lyrics on Google.': '使用搜索引擎查找{l2}歌词。',
      'Look up {l2} words here...': '输入{l2}单词……',
      'Look Up Phrases': '查短语',
      'Look up words here...': '在这里查词……',
      'Look Up Words': '查词典',
      'Look Up': '查词',
      'Lookup Phrases': '查短语',
      'Lookup Words': '查词',
      'Media': '影音',
      'Min Nan Chinese': '闽南语',
      'modifiers of "{word}"': '修饰 "{word}" 的词',
      'More words': '多标些词',
      'Movies': '电影',
      'Music': '音乐',
      'My Words': '生词本',
      'News': '新闻',
      'Not sure what to read?': '不知道该读什么吗？',
      'Note:': '注意：',
      'Note': '备注',
      'nouns modified by "{word}"': '"{word}" 修饰的名词',
      'objects of "{word} across"': '{word} across ...',
      'objects of "{word} along"': '{word} along ...',
      'objects of "{word} apart"': '{word} apart ...',
      'objects of "{word} around"': '{word} around ...',
      'objects of "{word} aside"': '{word} aside ...',
      'objects of "{word} away"': '{word} away ...',
      'objects of "{word} down"': '{word} down ...',
      'objects of "{word} in"': '{word} in ...',
      'objects of "{word} off"': '{word} off ...',
      'objects of "{word} on"': '{word} on ...',
      'objects of "{word} open"': '{word} open ...',
      'objects of "{word} out"': '{word} out ...',
      'objects of "{word} over"': '{word} over ...',
      'objects of "{word} through"': '{word} through ...',
      'objects of "{word} unto"': '{word} unto ...',
      'objects of "{word} up"': '{word} up ...',
      'objects of "{word} upon"': '{word} upon ...',
      'objects of "{word} whole"': '{word} whole ...',
      'objects of "{word}"': '"{word}" 的宾语',
      'Other Videos': '其他视频',
      'particles after "{word}" with object': '"{word}" 之后有宾语的虚词',
      'particles after "{word}"': '"{word}" 之后的虚词',
      'Paste {l2} text here': '在此处粘贴外语文本',
      'Phrasebooks': '短语集',
      'Playlists': '播放列表',
      'possessors of "{word}"': '"{word}" 的所属',
      'prepositional phrases': '介词短语',
      'Pricing Chart': '价格一览表',
      'Pricing': '价格',
      'pronominal objects of "{word}"': '"{word}" 的宾语代词',
      'pronominal possessors of "{word}"': '"{word}" 的所属代词',
      'pronominal subjects of "{word}"': '"{word}"的代词主语',
      'Pronunciation': '发音',
      'Random': '随机',
      'Read any online document by pasting the URL.': '粘贴网址，阅读任意网上文章。',
      'Reading': '阅读',
      'Recommended Channels': '推荐频道',
      'Reddit Articles': 'Reddit论坛文章',
      'Resources': '资源',
      'Saved Phrases': '我的短语本',
      'Saved Words': '我的生词本',
      'Saved': '我的生词本',
      'Schedule': '发布计划表',
      'Search {l2} YouTube': '搜索YouTube的{l2}视频',
      'Search for more sentences at': '用其他服务搜索更多例句',
      'Search the entire YouTube for {l2} videos with CC': '在整个YouTube搜索有{l2}字幕的视频',
      'Search YouTube': '搜索 YouTube',
      'Sentences provided by': '例句提供方',
      'Sentences with “{text}”': '有 “{text}” 的句子',
      'Settings': '设置',
      'Show {count} More': '显示另外 {count} 项',
      'Study Aid': '学习',
      'Study any YouTube video that has {l2} subtitles.': '学习任何有{l2}字幕的 YouTube 视频。',
      'Study Sheet Creator': '生词提取器',
      'Study YouTube Subtitles': '学习 YouTube 字幕',
      'Study': '学习',
      'subjects of "{word}"': '"{word}" 的主语',
      'subjects of "be {word}"': '"be {word}" 的主语',
      'Talks': '演说',
      'Text Corpus Settings': '语料库设置',
      'Text Reader': '文本阅读器',
      'Textbooks': '课本',
      'textReaderIntro': '在一些英文文本中书写或粘贴，带注释的文本将显示在文本框下方。您也可以使用<b>Markdown</b>或<b>HTML</b>标签。所有内容都会自动保存到浏览器的 <code>localstorage</code> 里，因此即使刷新浏览器，输入的所有内容仍会保留在此。',
      'These words are stored in your browser\'s local storage, which persists unless you clear your browsing data.': '这些单词将存储于浏览器的本地存储（local storage）中。除非您清除浏览数据，否则该存储会持续保留。',
      'This is where you can enjoy reading a variety of {l2} books with the help of hover dictionary and the ability to save words.': '在这里，你可以借助光标取词词典阅读各种{l2}书籍。点击任何{l2}单词，将其存入生词本，之后可前往“词典 > 生词本”查看。',
      'Transfer Purchases': '平台兑换码',
      'Try these resources:': '试试以下资源',
      'Tutoring Kit': '一对一学习课件',
      'TV Shows': '电视节目',
      'TV Shows': '电视节目',
      'usage patterns': '使用模式',
      'verbs before "{word}"': '在 "{word}" 之前的动词',
      'verbs complemented by "{word}"': '以 "{word}" 为补语的动词',
      'verbs modified by "{word}"': '"{word}" 修饰的动词',
      'verbs with "{word}" as object': '以 "{word}" 为宾语的动词',
      'verbs with "{word}" as subject': '以 "{word}" 为主语的动词',
      'verbs with particle "across" and "{word}" as object': '动词 across {word}',
      'verbs with particle "along" and "{word}" as object': '动词 along {word}',
      'verbs with particle "apart" and "{word}" as object': '动词 apart {word}',
      'verbs with particle "around" and "{word}" as object': '动词 around {word}',
      'verbs with particle "aside" and "{word}" as object': '动词 aside {word}',
      'verbs with particle "away" and "{word}" as object': '动词 + away {word}',
      'verbs with particle "down" and "{word}" as object': '动词 + down {word}',
      'verbs with particle "in" and "{word}" as object': '动词 in {word}',
      'verbs with particle "off" and "{word}" as object': '动词 + off {word}',
      'verbs with particle "on" and "{word}" as object': '动词 on {word}',
      'verbs with particle "open" and "{word}" as object': '动词 open {word}',
      'verbs with particle "out" and "{word}" as object': '动词 + out {word}',
      'verbs with particle "over" and "{word}" as object': '动词 + over {word}',
      'verbs with particle "through" and "{word}" as object': '动词 through {word}',
      'verbs with particle "unto" and "{word}" as object': '动词 unto {word}',
      'verbs with particle "up" and "{word}" as object': '动词 + up {word}',
      'verbs with particle "upon" and "{word}" as object': '动词 upon {word}',
      'verbs with particle "whole" and "{word}" as object': '动词 whole {word}',
      'Video Count': '视频总数',
      'Videos in playlists may not have subtitles.': '播放列表中的某些视频可能没有字幕。',
      'Videos': '视频',
      'View all of our courses on': '查看所有课程，前往',
      'wh-words following "{word}"': '"{word}"后的疑问代词',
      'Updates': '动态',
      'Wiki': '维基',
      'Words': '单词数',
      'YouTube Transcript': '学习 YouTube 字幕',
      'Zero to Hero': '英雄'
    }
  },
  liveTVLangs: ['amh', 'ara', 'aze', 'bak', 'ben', 'bos', 'bul', 'cat', 'ces', 'cmn', 'cnr', 'dan', 'deu', 'ell', 'eng', 'est', 'fas', 'fra', 'fry', 'glg', 'heb', 'hin', 'hrv', 'hun', 'hye', 'iku', 'ind', 'isl', 'ita', 'jpn', 'kan', 'kat', 'kaz', 'kin', 'kor', 'kur', 'lao', 'lav', 'lit', 'ltz', 'mal', 'mkd', 'mlt', 'mri', 'nan', 'nep', 'nld', 'nor', 'pan', 'pol', 'por', 'pus', 'ron', 'rus', 'sin', 'slk', 'slv', 'som', 'spa', 'sqi', 'srp', 'swe', 'tam', 'tel', 'tgl', 'tha', 'tur', 'ukr', 'urd', 'vie', 'yue', 'zho'],
  youTubeLangs: [
    'aa',
    'ab',
    'af',
    'akk',
    'am',
    'ar',
    'arc',
    'as',
    'ase',
    'ay',
    'az',
    'ba',
    'be',
    'bg',
    'bh',
    'bi',
    'bn',
    'bo',
    'br',
    'brx',
    'bs',
    'ca',
    'cho',
    'chr',
    'co',
    'cop',
    'cr',
    'cs',
    'cy',
    'da',
    'de-AT',
    'de-CH',
    'de-DE',
    'de',
    'doi',
    'dz',
    'el',
    'en-CA',
    'en-GB',
    'en-IE',
    'en-IN',
    'en-US',
    'en',
    'eo',
    'es-419',
    'es-ES',
    'es-MX',
    'es-US',
    'es',
    'et',
    'eu',
    'fa-AF',
    'fa-IR',
    'fa',
    'ff',
    'fi',
    'fil',
    'fj',
    'fo',
    'fr-BE',
    'fr-CA',
    'fr-CH',
    'fr-FR',
    'fr',
    'fy',
    'ga',
    'gd',
    'gl',
    'gn',
    'grc',
    'gu',
    'ha',
    'hak-TW',
    'hak',
    'haw',
    'hbo',
    'he',
    'hi-Latn',
    'hi',
    'ho',
    'hr',
    'ht',
    'hu',
    'hy',
    'ia',
    'id',
    'ie',
    'ig',
    'ik',
    'is',
    'it',
    'iu',
    'iw',
    'ja',
    'jv',
    'ka',
    'kk',
    'kl',
    'km',
    'kn',
    'ko',
    'kok',
    'ks',
    'ku',
    'ky',
    'la',
    'lad',
    'lb',
    'ln',
    'lo',
    'lt',
    'lus',
    'lv',
    'mai',
    'mas',
    'mg',
    'mi',
    'mk',
    'ml',
    'mn-Mong',
    'mn',
    'mni',
    'mo',
    'mr',
    'ms',
    'mt',
    'my',
    'na',
    'nan-TW',
    'nan',
    'nb',
    'ne',
    'nl-BE',
    'nl-NL',
    'nl',
    'nn',
    'no',
    'nv',
    'oc',
    'om',
    'or',
    'pa',
    'pap',
    'pl',
    'ps',
    'pt-BR',
    'pt-PT',
    'pt',
    'qu',
    'rm',
    'rn',
    'ro',
    'ru-Latn',
    'ru',
    'rw',
    'sa',
    'sat',
    'sc',
    'scn',
    'sd',
    'sdp',
    'sg',
    'sh',
    'si',
    'sk',
    'sl',
    'sm',
    'sn',
    'so',
    'sq',
    'sr-Cyrl',
    'sr-Latn',
    'sr',
    'ss',
    'st',
    'su',
    'sv',
    'sw',
    'ta',
    'te',
    'tg',
    'th',
    'ti',
    'tk',
    'tl',
    'tlh',
    'tn',
    'to',
    'tpi',
    'tr',
    'ts',
    'tt',
    'tw',
    'ug',
    'uk',
    'ur',
    'uz',
    've',
    'vi',
    'vo',
    'vro',
    'wo',
    'xh',
    'yi',
    'yo',
    'yue-HK',
    'yue',
    'zh-CN',
    'zh-Hans',
    'zh-Hant',
    'zh-HK',
    'zh-SG',
    'zh-TW',
    'zh',
    'zu'
  ],
  hours: `name,iso639-3,hours,B2,B1,A1,A1,PreA1
Afrikaans,afr,600,300,150,75,37.5,18.75
Esperanto,epo,600,300,150,75,37.5,18.75
Danish,dan,600,300,150,75,37.5,18.75
Northern Frisian,frr,600,300,150,75,37.5,18.75
Western Frisian,fry,600,300,150,75,37.5,18.75
Gronings,gos,600,300,150,75,37.5,18.75
Italian,ita,600,300,150,75,37.5,18.75
Low German,nds,600,300,150,75,37.5,18.75
Dutch,nld,600,300,150,75,37.5,18.75
Norwegian,nor,600,300,150,75,37.5,18.75
Plautdietsch,pdt,600,300,150,75,37.5,18.75
Portuguese,por,600,300,150,75,37.5,18.75
Romanian,ron,600,300,150,75,37.5,18.75
Scots,sco,600,300,150,75,37.5,18.75
Spanish,spa,600,300,150,75,37.5,18.75
Saterfriesisch,stq,600,300,150,75,37.5,18.75
Swedish,swe,600,300,150,75,37.5,18.75
Westphalien,wep,600,300,150,75,37.5,18.75
French,fra,750,375,187.5,93.75,46.875,23.4375
German,deu,900,450,225,112.5,56.25,28.125
Haitian Creole,hat,900,450,225,112.5,56.25,28.125
Indonesian,ind,900,450,225,112.5,56.25,28.125
Malay,msa,900,450,225,112.5,56.25,28.125
Swahili,swa,900,450,225,112.5,56.25,28.125
Yiddish,yid,900,450,225,112.5,56.25,28.125
Amharic,amh,1100,550,275,137.5,68.75,34.375
Azerbaijani,aze,1100,550,275,137.5,68.75,34.375
Bengali,ben,1100,550,275,137.5,68.75,34.375
Tibetan,bod,1100,550,275,137.5,68.75,34.375
Bulgarian,bul,1100,550,275,137.5,68.75,34.375
Czech,ces,1100,550,275,137.5,68.75,34.375
Greek,ell,1100,550,275,137.5,68.75,34.375
Estonian,est,1100,550,275,137.5,68.75,34.375
Persian,fas,1100,550,275,137.5,68.75,34.375
Finnish,fin,1100,550,275,137.5,68.75,34.375
Serbo-Croatian,hbs,1100,550,275,137.5,68.75,34.375
Hebrew,heb,1100,550,275,137.5,68.75,34.375
Hindi,hin,1100,550,275,137.5,68.75,34.375
Hungarian,hun,1100,550,275,137.5,68.75,34.375
Armenian,hye,1100,550,275,137.5,68.75,34.375
Icelandic,isl,1100,550,275,137.5,68.75,34.375
Georgian,kat,1100,550,275,137.5,68.75,34.375
Kazakh,kaz,1100,550,275,137.5,68.75,34.375
Khmer,khm,1100,550,275,137.5,68.75,34.375
Kyrgyz,kir,1100,550,275,137.5,68.75,34.375
Kurdish,kur,1100,550,275,137.5,68.75,34.375
Lao,lao,1100,550,275,137.5,68.75,34.375
Latvian,lav,1100,550,275,137.5,68.75,34.375
Lithuanian,lit,1100,550,275,137.5,68.75,34.375
Macedonian,mkd,1100,550,275,137.5,68.75,34.375
Mongolian,mon,1100,550,275,137.5,68.75,34.375
Burmese,mya,1100,550,275,137.5,68.75,34.375
Nepali,nep,1100,550,275,137.5,68.75,34.375
Polish,pol,1100,550,275,137.5,68.75,34.375
Dari,prs,1100,550,275,137.5,68.75,34.375
Russian,rus,1100,550,275,137.5,68.75,34.375
Sinhala,sin,1100,550,275,137.5,68.75,34.375
Slovak,slk,1100,550,275,137.5,68.75,34.375
Slovenian,slv,1100,550,275,137.5,68.75,34.375
Somali,som,1100,550,275,137.5,68.75,34.375
Albanian,sqi,1100,550,275,137.5,68.75,34.375
Tamil,tam,1100,550,275,137.5,68.75,34.375
Telugu,tel,1100,550,275,137.5,68.75,34.375
Tajik,tgk,1100,550,275,137.5,68.75,34.375
Tagalog,tgl,1100,550,275,137.5,68.75,34.375
Thai,tha,1100,550,275,137.5,68.75,34.375
Turkmen,tuk,1100,550,275,137.5,68.75,34.375
Turkish,tur,1100,550,275,137.5,68.75,34.375
Ukrainian,ukr,1100,550,275,137.5,68.75,34.375
Urdu,urd,1100,550,275,137.5,68.75,34.375
Uzbek,uzb,1100,550,275,137.5,68.75,34.375
Vietnamese,vie,1100,550,275,137.5,68.75,34.375
English,eng,1765,882.5,441.25,220.625,110.3125,55.15625
Arabic,ara,2200,1100,550,275,137.5,68.75
Japanese,jpn,2200,1100,550,275,137.5,68.75
Korean,kor,2200,1100,550,275,137.5,68.75
Yue Chinese,yue,2200,1100,550,275,137.5,68.75
Chinese,zho,2200,1100,550,275,137.5,68.75
Hakkak,hak,2200,1100,550,275,137.5,68.75
Cantonese,yue,2200,1100,550,275,137.5,68.75
Min Nan,nan,2200,1100,550,275,137.5,68.75`,
  locales: `code,locale
ar,ar-SA
ceb,fil
ceb,fil-PH
cmn,zh
cmn,zh-CN
cmn,zh-Hans
cmn,zh-Hant
cmn,zh-TW
cmn,zh-SG
crh,tr
da,da-DK
de,de-AT
de,de-CH
de,de-DE
el,el-GR
en,en-AU
en,en-CA
en,en-GB
en,en-IE
en,en-IN
en,en-US
en,en-ZA
es,es-419
es,es-AR
es,es-ES
es,es-MX
es,es-US
fa,fa-AF
fa,fa-IR
fi,fi-FI
fr,fr-BE
fr,fr-CA
fr,fr-CH
fr,fr-FR
grc,el
hak,hak-TW
hak,zh
hak,zh-CN
hak,zh-Hans
hak,zh-Hant
hak,zh-SG
hak,zh-TW
hak,zh-HK
hbo,he
hbo,he-IL
hbo,iw
he,he-IL
he,iw
hi,hi-IN
hi,hi-Latn
hil,fil
hil,fil-PH
hu,hu-HU
id,id-ID
it,it-IT
ja,ja-JP
ko,ko-KR
lzh,zh
lzh,zh-CN
lzh,zh-Hans
lzh,zh-TW
lzh,zh-SG
lzh,zh-HK
mhx,my
min,ms
min,id
nan,zh
nan,nan-TW
nan,zh-TW
nan,zh-CN
nan,zh-Hans
nan,zh-Hant
nb,nb-NO
nl,nl-BE
nl,nl-NL
no,nb
no,nb_NO
no,nn
no,nn_NO
nb,nb_NO
nn,nn_NO
prs,fa
prs,ps
pl,pl-PL
pt,pt-BR
pt,pt-PT
ro,ro-RO
ru,ru-Latn
ru,ru-RU
ryu,ja
sk,sk-SK
sr,sr-Cyrl
sr,sr-Latn
sv,sv-SE
th,th-TH
tl,fil
tl,fil-PH
tr,tr-TR
ydd,yi
yue,zh
yue,yue-HK
yue,zh-CN
yue,zh-Hans
yue,zh-Hant
yue,zh-HK
yue,zh-SG
zh,zh-CN
zh,zh-Hans
zh,zh-Hant
zh,zh-HK
zh,zh-SG
zh,zh-TW`,
  omniglot: `iso639-3,url
aae,arberesh.htm
aaq,abenaki.php
aar,afar.htm
aat,arvanitic.php
aaz,amarasi.htm
abe,abenaki.php
abk,abkhaz.htm
abl,lampung.htm
abp,abellen.htm
abq,abaza.htm
abz,abui.htm
aca,achagua.htm
ace,acehnese.htm
acf,saintluciancreole.htm
ach,acholi.htm
acm,arabic_syrian.htm
acn,achang.htm
acr,achi.htm
acu,achuarshiwiar.htm
acv,achumawi.htm
acy,cypriotarabic.htm
acz,acheron.htm
adg,arrernte.htm
ady,adyghe.htm
adz,adzera.htm
aeb,arabic_tunisian.htm
aem,kri.htm
aer,arrernte.htm
aey,amele.htm
afr,afrikaans.htm
agj,argobba.htm
agr,aguaruna.htm
agu,aguacateco.htm
agx,aghul.htm
aho,ahom.htm
aht,ahtna.htm
aib,aynu.htm
aii,assyrianneoaramaic.htm
ain,ainu.htm
aja,aja.htm
ajg,aja.htm
aji,ajie.htm
ajp,arabic_syrian.htm
aka,akan.htm
akk,akkadian.htm
akl,aklan.htm
ako,akurio.htm
akr,araki.htm
akv,akhvakh.htm
akz,alabama.php
ale,aleut.htm
alq,algonquin.htm
alt,altay.htm
aly,alyawarr.htm
alz,alur.htm
amc,amahuaca.htm
ame,yanesha.htm
amf,hamer.htm
amh,amharic.htm
ami,amis.htm
amr,amarakaeri.htm
amw,westernneoaramaic.htm
amx,arrernte.htm
anb,andoa.htm
ane,xaracuu.htm
ang,oldenglish.htm
ani,andi.htm
ank,goemai.htm
anq,jarawa.htm
aoi,enindhilyagwa.htm
aot,atong.htm
aoz,dawan.php
apa,apache.htm
apc,lebanese.htm
apj,jicarilla.htm
apm,mescalero-chiricahua.htm
app,apma.htm
apu,apurina.htm
aqc,archi.htm
arb,arabic.htm
arc,aramaic.htm
are,arrernte.htm
arg,aragonese.php
ari,arikara.htm
arl,arabela.htm
arn,mapuche.htm
arp,arapaho.htm
arq,arabic_algerian.htm
arw,arawak.htm
ary,arabic_moroccan.htm
arz,arabic_egypt.htm
asb,assiniboine.htm
asm,assamese.htm
ast,asturian.htm
atj,atikamekw.htm
ato,atong.htm
atv,teleut.htm
aud,anutan.htm
aui,anuki.htm
ava,avar.htm
ave,avestan.htm
avu,avokaya.htm
awa,awadhi.htm
awc,cipu.htm
awn,awngi.htm
awx,awara.htm
axe,arrernte.htm
aym,aymara.htm
ayp,arabic_syrian.htm
aze,azeri.htm
azo,awing.htm
azz,nahuatl.htm
bak,bashkir.htm
bal,baluchi.php
bam,bambara.htm
ban,balinese.htm
bap,bantawa.htm
bar,bavarian.htm
bax,bamum.htm
bba,bariba.htm
bbb,barai.htm
bbl,batsbi.htm
bca,bai.htm
bci,baoule.htm
bcq,bench.htm
bcr,babinewitsuwiten.htm
bde,bade.htm
bdk,budukh.htm
bdy,bundjalung.htm
bea,beaver.htm
bej,beja.htm
bel,belarusian.htm
bem,bemba.php
ben,bengali.htm
beu,blagar.htm
bew,betawi.htm
bex,jurmodo.htm
bfa,bari.htm
bfc,bai.htm
bfq,badaga.htm
bfs,bai.htm
bft,balti.htm
bgs,tagabawa.htm
bho,bhojpuri.htm
bhp,bima.htm
bik,bikol.php
bin,edo.htm
bis,bislama.php
biu,biete.htm
bjf,jewishneoaramaic.htm
bkc,baka.htm
bkm,kom.htm
bku,buhid.htm
bkx,dawan.php
bla,blackfoot.htm
blc,nuxalk.htm
bll,biloxi.htm
blt,taidam.htm
blw,balangao.htm
bme,baka.htm
bnc,bontoc.htm
bnn,bunun.htm
bno,bantoanon.htm
boa,bora.htm
bod,tibetan.htm
boi,barbareno.htm
bos,bosnian.htm
bot,bongo.htm
bph,botlikh.htm
bqj,bandial.htm
bqp,busa.htm
bre,breton.htm
brl,nsotho.htm
brx,bodo.htm
bsk,burushaski.php
bsq,bassa.htm
bua,buryat.htm
buc,bushi.htm
bug,bugis.htm
bul,bulgarian.htm
bum,bulu.htm
bwi,baniwa.htm
bxh,buhutu.htm
bxr,soyot.htm
bya,batak.htm
byn,blin.htm
bzd,bribri.htm
bzi,bisu.htm
caa,chorti.htm
cab,garifuna.htm
cad,caddo.htm
cae,laalaa.htm
cak,kaqchikel.htm
cat,catalan.htm
cay,cayuga.php
cbi,chapalaachi.htm
cbk,chavacano.php
cbr,kashibo.htm
cbs,kashinawa.htm
cbt,chayahuita.htm
cbu,candoshishapra.htm
ccc,chamicuro.htm
cco,chinanteco.htm
ccp,chakma.htm
cdh,takri.htm
ceb,cebuano.htm
ces,czech.htm
cgc,kagayanen.htm
cha,chamorro.htm
che,chechen.htm
chg,chagatai.htm
chh,chinook.htm
chj,chinanteco.htm
chk,chuukese.htm
chl,ivilyuat.htm
chm,mari.htm
chn,chinookjargon.htm
cho,choctaw.htm
chp,chipewyan.htm
chq,chinanteco.htm
chr,cherokee.htm
chu,ocslavonic.htm
chv,chuvash.htm
chy,cheyenne.htm
chz,chinanteco.htm
cia,ciacia.htm
cic,chickasaw.htm
cim,cimbrian.htm
ciw,chippewa.htm
cja,cham.htm
cje,chru.htm
cji,chamalal.htm
cjk,chokwe.htm
cjm,cham.htm
cjo,asheninka.htm
cjp,cabecar.htm
cjs,shor.htm
ckt,chukchi.htm
cku,koasati.htm
ckv,kavalan.htm
clc,chilcotin.htm
cld,chaldeanneoaramaic.htm
cle,chinanteco.htm
clk,idumishmi.htm
clm,klallam.htm
clu,caluyanon.htm
cmn,../chinese/mandarin.htm
cmr,mro.htm
cni,ashaninka.htm
cnl,chinanteco.htm
cnr,montenegrin.htm
cnt,chinanteco.htm
coc,cocopah.htm
cof,tsafiki.htm
cok,cora.htm
com,comanche.htm
con,cofan.htm
coo,comox.htm
cop,coptic.htm
cor,cornish.htm
cos,corsican.htm
cot,caquinte.htm
cox,nanti.htm
cpa,chinanteco.htm
cpb,asheninka.htm
cpc,asheninka.htm
cpg,greek.htm
cpu,asheninka.htm
cpx,../chinese/puxian.htm
cpy,asheninka.htm
crd,coeurdalene.htm
cre,cree.htm
crg,michif.htm
crh,crimeantatar.php
crn,cora.htm
cro,crow.htm
crs,seselwa.htm
crw,chrau.htm
crx,carrier.htm
csa,chinanteco.htm
csb,kashubian.htm
cso,chinanteco.htm
css,mutsun.htm
ctd,tedim.htm
cte,chinanteco.htm
ctl,chinanteco.htm
ctm,chitimacha.htm
ctu,chol.htm
cub,cubeo.htm
cuc,chinanteco.htm
cuk,kuna.htm
cuu,taiya.htm
cvn,chinanteco.htm
cym,welsh.htm
cyo,cuyonon.htm
dag,dagbani.htm
dan,danish.htm
dar,dargwa.htm
ddd,dongotono.htm
ddo,tsez.htm
dec,dengebu.htm
deu,german.htm
dga,dagaare.htm
dgc,casiguran.htm
dgd,dagaare.htm
dgi,dagaare.htm
dgr,tlicho.htm
dgz,daga.htm
dhs,kamda.htm
dhv,drehu.php
dih,tiipai.htm
din,dinka.php
div,thaana.htm
djd,jaminjung.htm
dje,zarma.htm
djk,ndjuka.htm
dlg,dolgan.htm
dlm,dalmatian.htm
dng,../chinese/dungan.htm
doi,takri.htm
drl,paakantyi.htm
dsb,sorbian.htm
dta,daur.htm
dtd,ditidaht.htm
dtp,kadazandusun.htm
dua,duala.php
duf,ndrumbea.htm
duo,dupaningan.htm
duu,drung.htm
dyo,jolafonyi.htm
dyu,nko.htm#dioula
dzg,daza.htm
dzo,dzongkha.php
efi,efik.htm
egl,emilian-romagnol.htm
eko,koti.htm
eky,kayahli.htm
ell,greek.htm
elx,elamite.htm#cuneiform
emk,mwangwego.htm
ems,alutiiq.htm
end,ende.htm
enf,enets.htm
eng,english.htm
epo,esperanto.htm
esi,inupiaq.php
esk,inupiaq.php
est,estonian.htm
esu,yupik.htm
ett,etruscan.htm
eus,basque.htm
eve,even.htm
evn,evenki.htm
ewe,ewe.htm
ewo,ewondo.php
ext,extremaduran.htm
eya,eyak.php
fan,fang.htm
fao,faroese.htm
fas,persian.htm
fax,fala.htm
fia,nobiin.htm
fij,fijian.htm
fin,finnish.htm
fkv,kven.htm
fla,salish.htm
fng,fanagalo.htm
fon,fon.htm
fra,french.htm
frp,francoprovencal.htm
frr,northfrisian.htm
fry,westfrisian.htm
fub,adamaua.htm
fud,futunan.htm
ful,fula.htm
fur,friulian.htm
fvr,fur.htm
gaa,ga.htm
gag,gagauz.htm
gal,galoli.htm
gan,../chinese/gan.htm
gbj,gadaba.htm
gbm,garhwali.htm
gcc,mali.htm
gcf,guadeloupean.php
gcr,guyanais.htm
gdi,baka.htm
gdo,godoberi.htm
gez,ethiopic.htm
ggd,gugadja.php
gha,ghadames.htm
gho,ghomara.htm
gia,gija.htm
gil,kiribati.htm
gin,hinukh.htm
git,gitxsan.htm
gjn,gonja.htm
gla,gaelic.htm
gld,nanai.htm
gle,irish.htm
glg,galician.htm
glk,gilaki.htm
glv,manx.htm
gmy,greek.htm
gnc,guanche.htm
gni,gooniyandi.php
gnz,baka.htm
gon,gondi.htm
got,gothic.htm
grc,greek.htm
grj,jabo.htm
grn,guarani.htm
grt,garo.htm
gsw,swissgerman.htm
guc,wayuu.php
guj,gujarati.htm
gum,guambiano.htm
gup,bininjkunwok.htm
gvc,guanano.htm
gwd,gawwada.htm
gwi,gwichin.php
gwj,gui.htm
gwr,gwere.htm
gxx,guere.htm
gym,guaymi.htm
haa,han.htm
hai,haida.htm
haj,hajong.htm
hak,../chinese/hakka.htm
har,harari.htm
has,haisla.htm
hat,haitiancreole.htm
hau,hausa.htm
haw,hawaiian.htm
haz,hazaragi.htm
hch,huichol.htm
hea,hmu.htm
heb,hebrew.htm
hei,heiltsuk.htm
her,herero.php
hgm,khoekhoe.htm
hid,hidatsa.htm
hif,fijihindi.htm
hil,hiligaynon.htm
hin,hindi.htm
hit,hittite.htm
hix,hixkaryana.htm
hlu,luwian.htm
hma,mashanmiao.htm
hmd,ahmao.htm
hml,luobohemiao.htm
hmm,mashanmiao.htm
hmn,hmong.htm
hmp,mashanmiao.htm
hmq,hmu.htm
hmr,hmar.htm
hms,hmu.htm
hmw,mashanmiao.htm
hni,hani.htm
hnj,hmongnjua.htm
hnn,hanunoo.htm
hns,sarnami.htm
hoa,hoava.htm
hoc,varangkshiti.htm
hop,hopi.htm
hrv,croatian.htm
hrx,hunsrik.htm
hsb,sorbian.htm
hsn,../chinese/xiang.htm
hub,huambisa.htm
huc,amkoe.htm
hun,hungarian.htm
hup,hupa.htm
hur,halkomelem.htm
hus,huasteco.htm
huu,muruihuitoto.htm
huz,hunzib.htm
hye,armenian.htm
iba,iban.htm
ibb,ibibio.htm
ibo,igbo.htm
ido,ido.htm
ifa,ifugao.htm
ifb,ifugao.htm
ifk,ifugao.htm
ifu,ifugao.htm
igs,interglossa.htm
iii,yi.htm
iku,inuktitut.htm
ikz,ikizu.htm
ilo,ilocano.htm
ina,interlingua.htm
inb,kichwa.htm
ind,indonesian.htm
Indi,inupiaq.php
ing,degxinag.htm
inh,ingush.htm
inj,kichwa.htm
ior,inor.htm
iow,chiwere.htm
ipk,inupiaq.php
irk,iraqw.htm
iru,irula.htm
isd,isnag.htm
isk,ishkashimi.htm
isl,icelandic.htm
ist,istriot.htm
ita,italian.htm
itl,itelmen.htm
ium,iumien.htm
ivv,ivatan.htm
ixl,ixil.htm
izh,ingrian.htm
jac,jakaltek.htm
jae,yabem.htm
jam,jamaican.php
jav,javanese.htm
jbo,lojban.htm
jct,krymchak.htm
jdt,juhuri.htm
jig,jingulu.htm
jit,jita.htm
jiv,shuar.htm
jje,jeju.htm
jmr,kammara.htm
jmx,mixtec.htm
jod,mwangwego.htm
jpn,japanese_language.htm
jqr,jaqaru.htm
jra,jarai.htm
jrb,judeo-arabic.htm
jud,mwangwego.htm
kaa,karakalpak.php
kab,kabyle.php
kac,jingpho.htm
kal,greenlandic.htm
kam,kamda.htm
kan,kannada.htm
kap,bezhta.htm
kaq,shipibo.htm
kar,karen.htm
kas,kashmiri.htm
kat,georgian.htm
kau,kanuri.htm
kaz,kazakh.htm
kbd,kabardian.htm
kbo,keliko.htm
kca,khanty.htm
kcp,kanga.htm
kde,makonde.htm
kdj,karamojong.php
kdr,karaim.htm
kdx,kam.htm
kea,kriol.php
kec,keiga.htm
kee,keres.htm
kek,qeqchi.htm
ket,ket.htm
key,kupia.htm
kfa,coorgicox.htm
kfb,kolam.htm
kfc,konda.htm
kff,koya.htm
kfo,mwangwego.htm
kfr,kutchi.htm
kga,mwangwego.htm
kge,lampung.htm
kgk,kaiwa.htm
kgo,krongo.htm
kgp,kaingang.php
kha,khasi.htm
khb,tailue.htm
khm,khmer.htm
khv,khwarshi.htm
khw,khowar.htm
kic,kickapoo.htm
kik,kikuyu.htm
kim,tofa.htm
kin,kinyarwanda.htm
kir,kirghiz.htm
kiz,kisi.htm
kjb,qanjobal.htm
kjh,khakas.htm
kjj,khinalug.htm
kjn,kunjen.htm
kjq,keres.htm
kju,kashaya.htm
kkh,khun.htm
kky,guuguyimithirr.htm
kkz,kaska.htm
kla,klamath.htm
klb,kiliwa.htm
kld,gamilaraay.htm
klv,maskelynes.htm
kmb,kimbundu.htm
kmm,komrem.htm
kmz,khorasaniturkic.htm
kne,kankanaey.htm
knf,mankanya.htm
knj,akatek.htm
knw,ekokakung.htm
kok,konkani.htm
kom,oldpermic.htm
kon,kongo.htm
koo,konjo.htm
kor,korean.htm
koy,koyukon.htm
kpe,kpelle.htm
kpg,kapingamarangi.htm
kpt,karata.htm
kpy,koryak.htm
kqf,kakabai.htm
kqs,kissi.htm
krc,balkar.htm
kri,krio.htm
krj,kinaraya.htm
krl,karelian.htm
kru,tolongsiki.htm
kry,kryts.htm
ksh,ripuarian.htm
kss,kissi.htm
ktm,kurti.htm
kto,kuot.htm
ktu,kituba.htm
ktz,juhoan.htm
kua,oshiwambo.php
kud,auhelawa.htm
kum,kumyk.php
kur,kurdish.htm
kut,kutenai.htm
kuu,dinaki.htm
kva,bagvalal.htm
kvc,kove.htm
kvn,kuna.htm
kvr,kerinci.htm
kvy,kayahli.htm
kwi,awapit.htm
kwk,kwakwala.htm
kwm,oshiwambo.php
kxf,kayahli.htm
kxm,northernkhmer.htm
kxv,jatapu.htm
kyh,karuk.htm
kyu,kayahli.htm
lac,lacandon.htm
lad,ladino.htm
lao,lao.htm
lat,latin2.htm
lav,latvian.htm
lay,bai.htm
lbe,lak.htm
lbj,ladakhi.htm
lbo,jru.htm
lbw,tolaki.htm
ldd,luri.htm
lep,lepcha.htm
lew,ledokaili.htm
lez,lezgi.htm
lfn,lfn.htm
lgg,lugbara.htm
lhu,lahu.htm
lia,limba.htm
lie,occidental.htm
lif,limbu.htm
lil,lillooet.htm
lim,limburgish.htm
lin,lingala.htm
lis,fraser.htm
lit,lithuanian.htm
liv,livonian.htm
ljl,ende.htm
ljp,lampung.htm
lkt,sioux.htm
lky,lokoya.htm
lld,ladin.htm
lln,lele.htm
lma,limba.htm
lmd,lumun.htm
lml,raga.htm
lmn,sugali.htm
lmo,lombard.htm
lnb,oshiwambo.php
loh,narim.htm
lom,loma.htm
lot,lotuko.htm
loz,lozi.htm
lpo,lipo.htm
lpx,lopit.htm
ltg,latgalian.htm
ltz,luxembourgish.htm
lua,tshiluba.php
luc,aringa.htm
lud,ludic.htm
lug,ganda.php
lui,luseno.htm
lul,olubo.htm
luo,dholuo.php
lus,mizo.htm
lut,lushootseed.htm
lzz,laz.htm
maa,mazatec.htm
mab,mixtec.htm
mad,madurese.htm
mag,magahi.htm
mah,marshallese.php
mai,maithili.htm
maj,jalapamazatec.htm
mak,makassarese.htm
mal,malayalam.htm
mam,mam.htm
maq,chiquihuitlanmazatec.htm
mar,marathi.htm
mas,maasai.htm
mau,mazatec.htm
maz,mazahua.htm
mbc,macushi.htm
mbt,matigsalug.htm
mbz,mixtec.htm
mcb,machiguenga.htm
mce,mixtec.htm
mdd,mbum.htm
mdf,moksha.htm
mdr,mandar.htm
mdv,mixtec.htm
mdx,dizin.htm
meh,mixtec.htm
men,mende.htm
mep,miriwoong.htm
met,mato.htm
meu,motu.htm
mev,mano.htm
mez,menominee.htm
mfe,mauritiancreole.htm
mfy,mayo.htm
mgc,morokodo.htm
mgd,moru.htm
mhi,madi.htm
mhn,mocheno.htm
mhq,mandan.htm
mhu,digaro.htm
mia,miami.php
mib,mixtec.htm
mic,mikmaq.htm
mid,mandaic.htm
mie,mixtec.htm
mig,mixtec.htm
mih,mixtec.htm
mii,mixtec.htm
mik,mikasuki.htm
mil,mixtec.htm
mim,mixtec.htm
min,minangkabau.htm
mio,mixtec.htm
mip,mixtec.htm
miq,miskito.htm
mit,mixtec.htm
miu,mixtec.htm
mix,mixtec.htm
miy,mixtec.htm
miz,mixtec.htm
mjc,mixtec.htm
mjg,monguor.htm
mjw,karbi.htm
mkd,macedonian.htm
mkf,miya.htm
mkj,mokilese.htm
mks,mixtec.htm
mku,maninka.htm
mkw,kituba.htm
mld,neomandaic.htm
mlg,malagasy.htm
mlt,maltese.htm
mlu,toqabaqita.htm
mlv,mwotlap.htm
mlz,aklan.htm
mmc,mazahua.htm
mmk,mukhadora.htm
mmr,qoxiong.htm
mna,mbula.htm
mnb,muna.htm
mnc,manchu.htm
mni,manipuri.htm
mnk,mandinka.htm
mns,mansi.htm
mnv,rennellese.htm
mnw,mon.htm
moe,montagnais.php
moh,mohawk.htm
mol,moldovan.htm
mon,mongolian.htm
mos,mossi.htm
mov,mojave.htm
mpg,marba.htm
mph,maung.htm
mpj,martuwangka.htm
mpm,mixtec.htm
mqh,mixtec.htm
mqn,moronene.htm
mqy,manggarainese.htm
mrc,maricopa.htm
mri,maori.htm
mrv,mangareva.htm
mrw,maranao.htm
msa,malay.htm
msb,masbateno.htm
msc,mwangwego.htm
mse,musey.htm
msn,vures.htm
mtd,mualang.htm
mtq,muong.htm
mtu,mixtec.htm
mtx,mixtec.htm
mui,musi.htm
muq,qoxiong.htm
mus,creek.htm
mvg,mixtec.htm
mvp,duri.htm
mwc,are.htm
mwf,murrinh-patha.php
mwl,mirandese.htm
mwp,kalalagawya.htm
mwr,marwari.htm
mww,hmongdau.htm
mxa,mixtec.htm
mxb,mixtec.htm
mxe,mele-fila.htm
mxj,miju.htm
mxs,mixtec.htm
mxt,mixtec.htm
mxv,mixtec.htm
mxx,mwangwego.htm
mxy,mixtec.htm
mya,burmese.htm
myh,makah.htm
myp,piraha.php
myv,erzya.htm
mza,mixtec.htm
mzi,mazatec.htm
mzj,mwangwego.htm
mzn,mazandarani.htm
nag,nagamese.php
nan,../chinese/taiwanese.htm
nap,neapolitan.php
naq,khoekhoe.htm
nau,nauruan.htm
nav,navajo.htm
naz,nahuatl.htm
nbc,chang.htm
nbl,ndebele.php
ncg,nisgaa.htm
nch,nahuatl.htm
nci,nahuatl.htm
ncj,nahuatl.htm
ncl,nahuatl.htm
ncx,nahuatl.htm
ncz,natchez.htm
nde,sindebele.htm
ndo,oshiwambo.php
nds,lowgerman.htm
neg,negidal.htm
neo,hmu.htm
nep,nepali.htm
new,ranjana.htm
nfa,dhao.htm
ngh,niuu.htm
ngi,ngizim.htm
ngu,nahuatl.htm
nhc,nahuatl.htm
nhe,nahuatl.htm
nhg,nahuatl.htm
nhi,nahuatl.htm
nhk,nahuatl.htm
nhm,nahuatl.htm
nhn,nahuatl.htm
nhp,nahuatl.htm
nhq,nahuatl.htm
nhr,naro.htm
nht,nahuatl.htm
nhv,nahuatl.htm
nhw,nahuatl.htm
nhx,nahuatl.htm
nhy,nahuatl.htm
nhz,nahuatl.htm
nia,nias.htm
nio,nganasan.htm
niu,niuean.php
niv,nivkh.htm
njm,angami.htm
nkr,nukuoro.htm
nld,dutch.htm
nln,nahuatl.htm
nlv,nahuatl.htm
nmf,tangkhul.htm
nmn,taa.htm
nne,oshiwambo.php
nod,lanna.htm
nog,nogai.htm
nom,kashibo.htm
non,oldnorse.htm
nor,norwegian.htm
nno,norwegian.htm
not,nomatsiguenga.htm
nov,novial.htm
npl,nahuatl.htm
npo,pochuri.htm
nrf,jerriais.htm
nrn,norn.htm
nsk,naskapi.php
nso,nsotho.htm
nsu,nahuatl.htm
ntj,ngaanyatjarra.htm
ntp,tepehuan.htm
nuf,nushu.htm
nuj,nyole.htm
nuk,nuuchahnulth.htm
num,niuafoou.htm
nup,nupe.htm
nus,nuer.htm
nuy,nunggubuyu.htm
nuz,nahuatl.htm
nwx,ranjana.htm
nxq,naxi.htm
nya,chichewa.php
nyn,nkore.htm
nys,noongar.php
nzi,nzema.htm
oaa,orok.htm
oac,oroch.htm
oav,avar.htm
oci,occitan.htm
oji,ojibwe.htm
ojs,ojicree.htm
oka,okanagan.htm
oma,omaha.htm
omw,tairoa.htm
ona,ona.htm
one,oneida.htm
ono,onondaga.htm
onw,oldnubian.htm
ood,oodham.htm
oon,onge.htm
orh,oroqen.htm
ori,kotia.htm
orm,oromo.htm
ory,oriya.htm
osa,osage.php
oss,ossetian.htm
ote,otomi.htm
otk,orkhon.htm
otl,otomi.htm
otm,otomi.htm
otn,otomi.htm
otq,otomi.htm
ots,otomi.htm
ott,otomi.htm
otw,ottawa.htm
otx,otomi.htm
otz,otomi.htm
oui,orkhon.htm
ovd,elfdalian.htm
pag,pangasinan.htm
pam,kapampangan.php
pan,punjabi.htm
pao,northernpaiute.htm
pap,papiamento.php
par,timbisha.htm
pau,palauan.htm
paw,pawnee.htm
pbb,paez.htm
pbg,paraujuano.htm
pbm,mazatec.htm
pcc,bouyei.htm
pcd,picard.htm
pci,porja.htm
pck,paite.htm
pdc,pennsylvaniagerman.htm
peb,pomo.htm
pej,northernpomo.htm
peq,southernpomo.htm
pgd,kharosthi.htm
phn,phoenician.htm
pio,piapoco.htm
pis,pijin.htm
piv,vaeakautaumako.htm
pjt,pitjantjatjara.htm
pkp,pukapukan.htm
plg,pilaga.htm
pli,pali.htm
plj,polci.htm
pll,palaung.htm
pln,palenquero.htm
plz,palula.htm
pma,paama.htm
pms,piedmontese.htm
pnk,pauna.htm
pnt,pontic.htm
pny,pinyin.htm
pol,polish.htm
pon,pohnpeian.htm
poo,centralpomo.htm
por,portuguese.htm
pot,potawatomi.htm
pov,guineabissaucreole.htm
ppi,paipai.htm
ppl,pipil.htm
pqm,malecitepassamaquoddy.htm
pri,paici.htm
prq,asheninka.htm
prs,dari.htm
pus,pashto.htm
pwi,patwin.htm
pwn,paiwan.htm
qua,quapaw.htm
quc,kiche.htm
qud,kichwa.htm
que,quechua.htm
qug,kichwa.htm
quh,southbolivianquechua.htm
qup,kichwa.htm
quw,kichwa.htm
qvi,kichwa.htm
qvj,kichwa.htm
qvo,kichwa.htm
qvz,kichwa.htm
qxl,kichwa.htm
qxq,qashqai.htm
qxr,kichwa.htm
rad,rade.htm
raj,rajasthani.htm
rap,rapanui.htm
rar,rarotongan.htm
rcf,reunioncreole.htm
rej,redjang.htm
rgn,emilian-romagnol.htm
rhg,rohingya.htm
rif,rifian.htm
rki,arakanese.htm
rmt,domari.htm
rmz,marma.htm
rng,ronga.htm
roh,romansh.htm
rom,romani.htm
ron,romanian.htm
roo,rotokas.php
row,westernrote.htm
rtm,rotuman.php
rue,rusyn.htm
rug,roviana.htm
run,kirundi.php
rup,aromanian.htm
ruq,meglenoromanian.htm
rus,russian.htm
rut,rutul.htm
ryu,okinawan.php
sac,fox.htm
sag,sango.php
sah,yakut.htm
san,sanskrit.htm
sas,sasak.htm
sat,santali.htm
sav,safen.htm
saz,saurashtra.htm
sbe,saliba.htm
sbl,botolan.htm
sce,santa.htm
scf,guadeloupean.php
scl,shina.htm
scn,sicilian.htm
sco,scots.htm
scs,northslavey.htm
sda,torajasadan.htm
sdb,shabaki.php
seb,supyire.htm
sed,sedang.htm
see,seneca.htm
seh,sena.htm
sei,seri.htm
sek,sekani.htm
sel,selkup.htm
ser,serrano.htm
sey,secoya.htm
sgh,shughni.htm
sgp,jingpho.htm
sgy,sanglechi.htm
she,sheko.htm
shh,shoshone.htm
shi,shilha.htm
shk,shilluk.htm
shn,shan.htm
shp,shipibo.htm
shs,shuswap.htm
shy,shawiya.htm
sia,saami.htm
sin,sinhala.htm
sip,sikkimese.htm
sjd,kildinsami.htm
sje,pitesami.htm
sjk,saami.htm
sjo,xibe.htm
sjr,siar.htm
sjt,tersami.htm
sju,umesami.htm
sjw,shawnee.php
skr,saraiki.htm
sku,sakao.htm
sky,sikaiana.htm
slk,slovak.htm
slm,beli.htm
slr,salar.htm
slv,slovene.htm
sma,southernsami.htm
sme,northernsami.htm
smj,lulesami.htm
smk,bolinao.htm
sml,centralsinama.htm
smn,inarisami.htm
smo,samoan.htm
smp,samaritan.htm
sms,skoltsami.htm
smw,sumbawa.htm
sna,shona.php
snd,sindhi.htm
snf,noon.htm
snk,soninke.htm
sog,sogdian.htm
soi,rana.htm
som,somali.htm
soq,kanasi.htm
sot,sesotho.htm
spa,spanish.htm
spo,salish.htm
spp,supyire.htm
sqi,albanian.htm
squ,squamish.htm
srb,savara.htm
srd,sardinian.htm
srh,sarikoli.htm
srm,saramaccan.htm
srn,sranan.htm
srp,serbian.htm
srr,serer.htm
srs,tsuutina.htm
srz,mazandarani.htm
ssw,swati.php
stl,stellingwarfs.htm
sto,stoney.htm
stp,tepehuan.htm
stq,saterlandfrisian.htm
stv,silte.htm
stw,satawalese.htm
sun,sundanese.php
sur,mwaghavul.htm
sus,susu.htm
sux,sumerian.htm
suz,jenticha.htm
sva,svan.htm
svs,savosavo.htm
swa,swahili.htm
swb,maore.htm
swe,swedish.htm
swi,sui.htm
sxr,saaroa.htm
syl,syloti.htm
syr,syriac.htm
szl,silesian.php
tab,tabassaran.htm
tac,tarahumara.htm
tae,tariana.htm
tah,tahitian.htm
tam,tamil.htm
tan,tangale.htm
tao,yami.htm
taq,tamasheq.htm
tar,tarahumara.htm
tat,tatar.htm
tau,uppertanana.htm
tay,atayal.htm
taz,tocho.htm
tbg,tairoa.htm
tbl,tboli.htm
tbw,tagbanwa.htm
tca,ticuna.htm
tcb,tanacross.htm
tce,tutchone.htm
tcf,tlapanec.htm
tcl,jingpho.htm
tcs,tsc.htm
tcu,tarahumara.htm
tcx,toda.htm
tcy,tulu.htm
tdd,tainua.htm
teh,tehuelche.htm
tel,telugu.htm
tem,temne.htm
tep,tepehuan.htm
tet,tetum.php
tfn,denaina.htm
tfr,teribe.htm
tgk,tajik.htm
tgl,tagalog.htm
tha,thai.htm
thd,kuukthaayorre.htm
the,rana.htm
thh,tarahumara.htm
thi,tainua.htm
thl,rana.htm
thq,rana.htm
thr,rana.htm
tht,tahltan.htm
thv,tamahaq.htm
tig,tigre.htm
tin,tindi.htm
tir,tigrinya.htm
tiw,tiwi.htm
tix,southerntiwa.htm
tjs,tujia.htm
tkb,rana.htm
tkl,tokelauan.htm
tkp,tikopia.htm
tkr,tsakhur.htm
tkt,rana.htm
tla,tepehuan.htm
tli,tlingit.htm
tly,talysh.htm
tmc,tumak.htm
tmh,tuareg.htm
tmy,tami.htm
tnq,taino.htm
tob,tobaqom.htm
tod,loma.htm
toi,tongan.htm
toj,tojolabal.htm
tol,tolowa.htm
toq,toposa.htm
tpc,tlapanec.htm
tpi,tokpisin.htm
tpl,tlapanec.htm
tpu,tampuan.htm
tpx,tlapanec.htm
tri,tiriyo.htm
tru,turoyo.htm
trv,seediq.htm
trw,torwali.htm
tsc,tswa.htm
tsd,tsakonian.htm
tsg,tausug.htm
tsi,tsimshian.htm
tsj,tshangla.htm
tsn,tswana.php
tso,tsonga.php
tsz,purepecha.htm
tta,tutelo.htm
ttm,tutchone.htm
ttt,tat.htm
tuk,turkmen.htm
tum,tumbuka.htm
tun,tunica.htm
tuo,tucano.htm
tur,turkish.htm
tus,tuscarora.htm
tvd,vadi.htm
tvl,tuvaluan.htm
twe,teiwa.htm
twf,taos.htm
twi,twi.htm
two,nsotho.htm
twr,tarahumara.htm
txb,tocharian.htm
txg,tangut.htm
txq,tii.htm
txr,iberian.htm#sws
tyv,tuvan.php
tzh,tzeltal.htm
tzj,tzutujil.htm
tzm,tamazight.htm
tzo,tsotsil.htm
uba,ubang.htm
uby,ubykh.htm
ude,udege.htm
udi,udi.htm
udm,udmurt.htm
udu,uduk.htm
uga,ugaritic.htm
uig,uyghur.htm
ukr,ukrainian.htm
ulc,ulch.htm
ulk,meriammir.htm
umb,umbundu.htm
umu,munsee.htm
unm,unami.htm
unr,mundari.htm
ura,urarina.htm
urd,urdu.htm
uum,urum.htm
uun,pazeh.htm
uvl,lote.htm
uzb,uzbek.htm
vai,vai.htm
var,huarijio.htm
vec,venetian.htm
ven,venda.htm
vep,veps.htm
vie,vietnamese.htm
vls,flemish.htm
vmc,mixtec.htm
vmj,mixtec.htm
vmm,mixtec.htm
vmp,mazatec.htm
vmq,mixtec.htm
vmw,makhuwa.php
vmx,mixtec.htm
vmy,mazatec.htm
vmz,mazatec.htm
vol,volapuk.htm
vot,votic.htm
vro,voro.htm
wad,wandamen.htm
wal,wolaytta.htm
wam,massachusett.htm
war,waray.php
was,washo.htm
wat,kaninuwa.htm
wbl,wakhi.php
wbm,wa.htm
wbp,warlpiri.htm
wec,guere.htm
wic,wichita.htm
wim,wik-mungkan.php
win,hotcak.htm
wlc,comorian.htm
wln,walloon.htm
wls,wallisian.htm
wmb,wambaya.htm
wmw,mwani.htm
wnc,wantoat.htm
wni,comorian.htm
wnw,wintu.htm
woe,woleaian.htm
wol,wolof.htm
wrh,wiradjuri.php
wrk,garawa.htm
wrr,wardaman.htm
wuu,../chinese/wu.htm
wya,wyandot.htm
wyb,ngiyambaa.php
wym,wymysorys.htm
xad,adaizan.htm
xal,kalmyk.htm
xan,xamtanga.htm
xav,shavante.php
xaw,kawaiisu.htm
xcb,cumbric.htm
xce,celtiberian.htm
xcg,gaulish.htm
xcr,carian.php
xga,gaulish.htm
xgf,tongva.htm
xhd,southarabian.htm
xho,xhosa.htm
xib,iberian.htm
xlc,lycian.php
xld,lydian.php
xlp,lepontic.htm
xls,iberian.htm
xlu,luwian.htm
xmf,mingrelian.htm
xmm,manadomalay.htm
xmr,meroitic.htm
xog,soga.htm
xom,komo.htm
xpg,phrygian.htm
xpo,nahuatl.htm
xpq,mohegan.htm
xpr,parthian.htm
xqt,southarabian.htm
xsa,sabaean.htm
xsb,sambal.htm
xsi,sio.htm
xsl,southslavey.htm
xta,mixtec.htm
xtb,mixtec.htm
xtc,kadugli.htm
xtd,mixtec.htm
xtg,gaulish.htm
xti,mixtec.htm
xtj,mixtec.htm
xtl,mixtec.htm
xtm,mixtec.htm
xtn,mixtec.htm
xto,tocharian.htm
xtp,mixtec.htm
xts,mixtec.htm
xtt,mixtec.htm
xtu,mixtec.htm
xty,mixtec.htm
xww,wembawemba.htm
yaa,yaminawa.htm
yad,yagua.htm
yah,yazghulami.htm
yai,yaghnobi.htm
yao,yao.htm
yap,yapese.htm
yaq,yaqui.htm
ybb,yemba.htm
ycn,yucuna.htm
yej,yevanic.htm
yeu,yerukula.htm
yid,yiddish.htm
yij,yindjibarndi.php
yim,yimchungru.htm
yly,nyelayu.htm
yoi,yonaguni.htm
yor,yoruba.htm
ypk,siberianyupik.htm
yrk,nenets.htm
yrl,nheengatu.htm
yua,yucatec.htm
yuc,yuchi.htm
yue,../chinese/yue.htm
yum,quechan.htm
yur,yurok.htm
zag,zaghawa.htm
zap,zapotec.php
zdj,comorian.htm
zea,zeelandic.htm
zen,zenaga.htm
zgh,tamazight.htm
zha,zhuang.htm
zho,../chinese/index.htm
zin,zinza.htm
ziw,zigula.htm
zkt,khitan.htm
zku,kaurna.htm
zom,zou.htm
zro,zaparo.htm
zul,zulu.htm
zun,zuni.htm
zza,zazaki.htm
,mwangwego.htm
,sorangsompeng.htm
,ipai.htm
,kumeyaay.htm
,bartangi.htm
,oroshor.htm
,teleut.htm
,arabic_syrian.htm
,alsatian.htm
,dananshanmiao.htm
,guernesiais.htm
,../chinese/cantonese.htm
,bagatha.htm
,bokar.htm
,chaha.htm
,chatino.htm
,chukchansi.htm
,norfuk.htm
,folkspraak.htm
,fuyukyrgyz.htm
,../chinese/fuzhounese.htm
,genoese.htm
,gottscheerish.htm
,goudu.htm
,griko.htm
,southarabian.htm
,interslavic.htm
,itbayat.htm
,aranese.htm
,khufi.htm
,modern_shetlandic_scots.htm
,kubachi.htm
,kambari.htm
,lsf.htm
,liqwala.htm
,saanich.htm
,moriori.htm
,chelkan.htm
,sankethi.htm
,westpolesian.htm
,nabataean.htm
,monegasque.htm
,llanito.htm
,oowekyala.htm
,pie.htm
,rushani.htm
,romanico.htm
,suriyanimalayalam.htm
,../chinese/shanghainese.htm
,slovio.htm
,solresol.htm
,../chinese/teochew.htm
,tut.htm
,varmlandic.htm
,wadi.htm
,../chinese/wenzhounese.htm
,wukchumni.htm
,protosinaitc.htm
,gallo.htm
,yukaghir.php
,yolngu.php
,zuwara.htm`,
  features: `l1,l2,home,courses,keyboard,bookmarklet,levels,roots,explore-topics,related,learn,grammar,noun-cases,endings,analyzer,hero-academy,music,radicals,characters
eng,zho,TRUE,TRUE,,,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,,,,TRUE,TRUE,TRUE,TRUE
zho,eng,TRUE,TRUE,,,,,,,,,,,,,,,
eng,tlh,,,TRUE,,,,,,,,,,,,,,
eng,hin,,,,TRUE,,,,,,,,,,,,,
eng,rus,,,,,,,,,,,TRUE,TRUE,TRUE,,,,`,
  dictionaries: `l2	l1	dictionary
eng	zho	ecdict
jpn	eng	edict
eng	afr	freedict
eng	ara	freedict
eng	ell	freedict
eng	fin	freedict
eng	fra	freedict
eng	gle	freedict
eng	hin	freedict
eng	hrv	freedict
eng	hun	freedict
eng	ita	freedict
eng	jpn	freedict
eng	lat	freedict
eng	nld	freedict
eng	pol	freedict
eng	por	freedict
eng	ron	freedict
eng	rus	freedict
eng	spa	freedict
eng	srp	freedict
eng	swa	freedict
eng	swe	freedict
eng	tur	freedict
cdo	eng	hsk-cedict
cjy	eng	hsk-cedict
cnp	eng	hsk-cedict
cpx	eng	hsk-cedict
csp	eng	hsk-cedict
czo	eng	hsk-cedict
gan	eng	hsk-cedict
hak	eng	hsk-cedict
hsn	eng	hsk-cedict
lzh	eng	hsk-cedict
lzh	zho	hsk-cedict
mnp	eng	hsk-cedict
nan	eng	hsk-cedict
wuu	eng	hsk-cedict
zha	eng	hsk-cedict
zho	eng	hsk-cedict
yue	eng	dialect-dict
hak	zho	dialect-dict
nan	zho	dialect-dict
kor	eng	kengdic
tlh	eng	klingonska
rus	eng	openrussian`,
  freedict_backup: `l2	l1	dictionary
slk	eng	freedict
ady	eng	freedict
afr	eng	freedict
ast	eng	freedict
deu	eng	freedict
hrv	eng	freedict
hun	eng	freedict
isl	eng	freedict
kur	eng	freedict
lit	eng	freedict`,
  wiktionary_mapped_langs: 'nor hrv srp bos run hbo grc hmn',
  wiktionary_langs: `aaa aab aac aad aaf aag aah aai aak aal aan aap aar aas aau aaw aax aaz aba abb abc abg abi abj abk abm abn abo abq abr abs abt abu abv abw abx aby abz aca aci ack acl acn acp acr acv acw acx acy acz ada ade adi adj adn ado adt ady adz aeb aek ael aem aer aes aew aey aez afb afn afo afr aft afz agc agd agg agj agl agm agn ago agq agr ags agt agw agx agy ahb ahg ahk ahn aho ahr ahs aia aic aid aie aif aig aih aii aij aik ail aio ait aiw aiy aji ajp aju aka akc ake akf akg akk akl akm akr aks akt aku akv akx akz ala ald ale alh ali alj alk alm alo alp alq alr alt alu alx aly amc ame amf amh ami amj amk aml amn amo amp amq amr ams amu amw amx amy amz ana anb anc and ane anf ang anh ani ank anm ann ano anp anu anv anw aoa aoc aof aog aoi aor aos aot aou aoz apb apc apd ape apf api apn app apq apr apt apu apw apx apy apz aqc aqd aqg aqm aqn aqp aqt aqz ara arc ard arg arh ari ark arl arn aro arp arq ars arv arw ary arz asb ase asi ask asl asm asn aso ass ast asu asv asx asz ata atb atc atd ate ati atj ato atr ats att atu atv atw atx aty atz aua aud aui auk aul aun auq auu auw aux avd ave avi avm avn avt avu avv awa awc awe awg awk awm awn awr awt awx axb axg axm aya ayd aye ayl aym ayo ayp ayu aza azd aze azg azn azz baa bac bae bag bak bal bam ban bao bap bar bay bbb bbd bbh bbi bbk bbl bbn bbr bbv bca bcf bch bcj bco bcw bdb bdd bde bdg bdi bdk bdl bdm bdn bdo bdp bdq bdr bdt bdw bdy bdz bea bec bee bef beg bei bej bel ben beu bew bex bfa bfc bfd bff bfg bfi bfj bfm bfn bfq bfs bft bfw bfx bfy bgb bgc bgf bgg bgs bgt bgv bgz bhg bhi bhj bhl bhm bho bhp bhq bhs bhv bhw bib bid bie big bim biq bis bja bjc bjh bji bjk bjp bjt bjv bjz bkd bkh bki bkj bkk bkl bkm bkq bkr bkt bku bky bkz blb blc bld ble blf blj blk bll blo blp blq blr bls blt blw blx blz bmc bmg bmh bmi bmk bmr bmt bmu bmx bna bnb bnf bni bnm bnn bnp bnq bnr bns bny bnz boa bod boe boi boj bol bom boq bor bot bou bpg bph bpi bpl bpn bpp bpr bps bpz bqb bqi bql bqo bqp bqq bqr bra brc bre brg brh bri brp brr brt brw brx brz bsa bsb bsk bsm bsq bss bst bsw bsx bsy btf btn btp btu btw bty bud bue bug bul bum bun buq bus buw bux bvb bvj bvk bvr bvy bvz bwa bwd bwf bwi bwp bwu bwx bxd bxf bxh bxj bxk bxn bxs bye byk byq byr byt byx bza bzb bzd bze bzg bzh bzi bzl bzn bzq bzs bzu bzz cab cac cad cag cak cal cam can cao cap caq car cas cat cav cax cay caz cbb cbc cbd cbg cbi cbk cbr cbs cbt cbu cbv cby ccc cce ccm ccp cdm cdn cdy cea ceb ceg ces cfd cgc cha chb chc chd che chf chg chh chk chl chn cho chp chr chu chv chy cia cic cih cim cin cir ciy cja cje cjh cji cjm cjo cjs cjv ckb ckl cko cks cku ckv ckx cla clc clk clu clw cmg cmi cmn cms cni cnk cns cnx coa coc coe cog coj col com con coo cop cor cos cow cpg cpi cps cqd crc crd cre crg crh cri crj crk crl crm cro crv crw crx crz csb csg csi csm cso css cst csz cta ctg ctm cto ctp ctu ctz cua cub cuh cui cul cuo cup cuq cuv cux cuy cvn cwd cwg cya cyb cym czk czt daa dad dag dah dai dak dal dan dao dar dbf dbj dbl dbn dbq dbw dby dcr ddg ddj ddr ddw deg dei des deu dga dgc dge dgg dgi dgr dgz dhi dhl dia dif dig dij dil dim din dio dis div dix dje djr dka dlg dlk dlm dma dmc dmu dmv dmw dmy dng dni dnj dnr dnw dny dob doe dor dot doy doz dpp drd drg drn dro drq dru dsb dsh dsn dsq dta dtb dtd dti dtr dtu dua duc due duf duk dum dus duu duv dva dwr dwu dww dyo dyu dzg dzo ebg ebr ebu ecr efa efi ega egl ego egy eip eka eke ekg ekp elk ell elm elx emb eme emi emn emp emx emy ena enc end enf eng enl enm enn eno enq enx epi epo eri erk ero ers ert ese esh esq ess est esy etb eto ets ett etu etx eus eve evn ewe ewo ext eya faa fad faf fao fas fau fax fay fbl fcs fia fie fij fin fip fln fmp fng foi fon for fos fqs fra frm fro frq fry fsl fud ful fun fur fut fuy fvr fwa gaa gac gad gaf gag gah gaj gap gaw gay gbb gbf gbg gbi gbj gbm gbp gbq gbr gbu gbv gby gce gdc gdd gde gdg gdm gdq gej ges gfk gft ggl ggt ghs gid gil gin gir gis git giw giz gji gjn gkn gko gla gld gle glg glk glv glw gml gmu gmv gmy gnc gnd gni gnn gnq goa gof goh goi gol gon gop gor got gou gpa gqa gqi gqr grc grh gri grn grr grs grt gru grw gsg gso gsw gub guc gue guf gug guh guj gum gun guo gup guq gur gut guu guw gux guz gvc gve gvf gvj gvl gvn gvo gvp gvs gwc gwd gwe gwm gwr gww gya gyb gyd gyg gyl gyn gyy hac had hah hai haj hao har hau haw hay haz hbb hbs hch hdn heb hed heg heh hei her hhy hia hid hif hig hih hil hin hit hiw hla hlb hmd hmo hmt hnd hne hnh hnj hnn hns hoa hoe hoh hoi hop hot hra hrc hre hro hru hrx hsb hsh hss hto hts hub hui hul hun huo hup huq hur huu hux huy huz hvc hvk hvn hye iai ian iar iba ibb ibd ibe ibg ibh ibl ibm ibn ibo ibr iby icl idb idi ido ifa ifb ife ifk ifu ify ign igo iii ijc ijn ijs iki ikl ikr iku ikx ikz ilb ili ilk ilv imn ims ina inb ind inh inm inn ins inz ipk ipo iqu irh irk iru iry isa isd isg ish isi isk isl ism ist ita itb ite itk itl itm ito itv itx itz ium ivb ivv iwm iws ixc ixl iyo izh izr jaa jab jao jav jaz jbk jbt jct jdt jeb jee jeh jek jgo jhi jib jid jig jil jio jit jiv jka jko jmb jmc jmd jmx jnj jow jpn jqr jra jrb jsl juc jum jun jup jur jut kab kac kai kal kan kap kas kat kau kay kaz kbc kbd kbe kbh kbk kbm kbo kbq kbw kbz kca kcb kcg kck kcn kco kcx kda kdd kde kdj kdp kdr kdt kdu kea kee keg kem ker kes ket keu kfa kfk kfp kfq kfs kfy kge kgg kgj kgk kgo kgp kgr kgu kha khb khc khe khl khm kho khr khs kht khv khw khz kib kic kid kih kii kij kik kin kio kip kir kis kiw kiy kja kjb kjc kje kjf kjg kjh kjn kjq kjr kju kjz kka kke kkh kkk kkr kky kkz kla klb klc kld kln klp klq klr kls klu klv klx kmb kmc kmg kmj kmk kml kmn kmo kmr kms kmt kmv kmx knb knd kne knf kni knk kno knp knv knx koa kog koh koi kon kop kor kos kot koy koz kpc kpe kpf kpg kpj kpk kpm kpt kpv kpw kpy kqa kqb kqe kqf kqi kqn kqr kqt kqv kqw kqy krc kre kri krj krk krl kru kry ksb ksc ksi ksk ksr ksw ksx kti ktn ktw ktx kug kuj kul kum kun kuo kut kuu kva kvc kvh kvi kvk kvo kvr kwa kwd kwe kwh kwi kwl kwn kwz kxa kxb kxi kxm kxo kxu kxv kxz kya kyh kyi kyj kyo kyq kys kyt kyu kyz kzf kzg kzi kzk kzl kzv kzx lac lad lae laf laj lam lan lao laq lat lav law lax lay laz lbb lbc lbe lbj lbo lbq lbu lbv lbw lbx lbz lcm lcp lcq led lei lek lep lev lew lex lgg lgl lgq lgr lgt lgu lht lhu lib lic lid lif lig lij lil lin lis lit liy ljl ljp lka lki lkt llc lld lln llp llu lmb lmc lmd lmn lmo lmw lnu loa loc loe log loj lok lol los loz lra lrc lre lrl lsd lsi lsm lsr ltg lti ltn ltz lub luc lud lue lun lus lut luv lva lvk lwl lwo lzz maa mad mae mah mai mak mal mam maq mar mas maw maz mbb mbc mbd mbf mbi mbj mbl mbn mbr mbs mbt mby mcb mcf mcg mch mck mco mcq mcr mcv mcy mcz mda mdb mdf mdr mdx mea mee mei mej mek mel meo meq mer met meu mev mew mez mfa mff mfh mfi mfj mfn mfr mfx mfy mfz mgd mgk mgm mgo mgp mgq mgr mgu mgv mgw mha mhc mhd mhe mhi mhj mhk mhl mhq mhr mhs mht mhy mia mic mid mif mig mih mik mil min mir mit miw miy miz mjb mjc mjj mjk mjl mjm mjs mjw mka mkc mkd mkf mkg mkp mkr mkt mky mkz mle mlg mlm mln mlp mls mlt mlu mlw mlz mmc mmd mmf mmg mmh mmi mmn mmt mmw mmx mmy mna mnb mnc mnd mne mnf mng mni mnj mnk mns mnw mnx moa mod moe mog moh mon mor mot mox mpe mpg mph mpi mpj mpl mpm mpn mpr mps mpt mpv mpw mqb mqe mqj mqm mqn mqo mqp mqv mqw mqx mqy mrc mrg mrh mri mrj mrk mrl mrn mro mrq mrw msa msb msf msi msk msm msn msq msu mta mtc mtd mth mtl mtm mtn mto mtq mtr mtt mtv mty mub mue mug muh mui mup mus muy muz mva mvd mvi mvm mvn mvp mvq mvr mvt mvv mvy mwc mwf mwh mwl mwm mwn mwp mwr mwt mwv mww mxb mxd mxe mxi mxk mxm mxx mxz mya myb myg myh myl myp myu myv myw myy myz mza mzb mzn mzp mzq mzs mzv mzw mzx naf nag nak nal nam nan nap naq nau nav nay naz nbb nbh nbk nbm nbn nbp nbr nbt nbv ncb nce ncg nch nci ncj ncl ncn ncr ncz ndd ndh ndo ndp nds nea nec neg neh nej nem nen nep nez nfd nfr nfu nga ngg ngi ngj ngn ngs ngu nha nhb nhc nhe nhg nhi nhm nhn nho nht nhu nhv nhw nhy nia nib nid nif nii nij nim nin nio niq nir niu niz nja njj njz nkg nkp nkr nkx nkz nlc nld nlg nll nlv nmb nmc nmk nml nmn nmq nmu nmw nmy nnb nnf nnh nnm nno nnr nnt noa nob noc nod noe nog noj nol non nop nor not noz npa nqm nqn nqo nrc nrf nrl nrm nrn nru nsh nsk nsn nsq nss nsu nsz ntj ntp ntw nuf num nun nus nux nuy nuz nwr nxa nxe nxn nxq nyb nym nyn nyo nyt nyv nyw nza nzd nzi oaa oac obi obm obt oca oci odt odu ofs ofu ogb ogc oge ogo ogu oia oin ojp ojv ojw oka okb okd okn okr ole olo olt oma omc omg omi omk omn omo omr omw omx onb one ong oni onn onu onw oon opm ora ore orh ori orm orr oru orx osa osc osp oss ost osx ota otd ote otq ots ott otw oty oua ovd owl oyd oym pac pad pag pah pan pao paq par pau paw paz pbn pbr pbv pcc pcd pcm pda pdc pdo pdt peb peh pei pek pex pez pfe pgg pgk pgl pgn pgs pgu phk phl phn pia pib pid pih pij pim pio pip pis piv piw piz pjt pkn ple plg plh pli plk pln plo plv plw ply pma pme pmf pmi pmj pmk pmo pmt pmw pmy pnh pni pnr pns pny poe poi pol pon poo por pos pot pox ppi ppk ppl ppm ppn ppo ppt ppu pqa pqm pre prk prm prn prq prs pru prw pse ptr ptu pui puj pup pus pwa pwg pwi pwm pwn pym pyu qua quc que qui qun quv qvy qwc qwt qxs qyp rac rad rag rah rai raj rak ral ram ran rar ras rau raw rax ray raz rbb rcf rea reb ree rej rel res ret rey rgn rgr rhg rhp rif rim rjs rkb rkh rki rma rmc rme rmf rmg rml rmn rmo rmp rmq rmt rmw rmy rng rnn rnw rob roe rof rog roh rol ron roo rop rpn rpt rrt rth rtm rue ruf rug rup rus rut rwk rwo ryn rys ryu sad sag sah saj sam san sar sas sat sav saw sax say saz sbh sbi sbk sbl sbq sbr scb sce scl scn sco scw scx sda sdg sdh sdp sea sed see seh sei sek sel ser set seu sey sfw sga sgd sgh sgp sgs sgt sgw sgz she shk shn sho shp shs shv shx shy sia sib sid sij sin sip sis siu six siz sja sjd sje sjg sjk sjm sjo sjr sjt sju sjw skb skc skd ski skr sks skv sky skz sle slg slk slm sln slp slr slu slv slw slz sma smb sme smj smk sml smn smo smq smr sms smw sna snc snd sne snf snk snl snm snn snr snu sny snz sob sog sok sol som sot sou spa spc spd spi spl spn sps spx sqa sqi sqt squ sra srd sre srf srh sri srm srn srq srr sru sry ssb ssc ssd ssf ssg ssj ssl ssn sso ssq ssw stf sth stk stn sto stp stu stv stw sty sua suc sue sui sun sur sus sut sux suy suz sva svb svm svs swa swb swe swg swi swj swl swm swp sxn sxr syb syc syk syl sza szb szd szl szp szw szy taa tad tae taf tah taj tak tal tam tan tao taq tar tat tau tav tay taz tba tbc tbd tbe tbf tbg tbi tbj tbk tbl tbo tbp tbw tbx tby tca tcb tcc tce tcq tcs tcx tcy tdc tdd tdf tdg tdh tdi tdj tdk tdl tdm tds tdv tdy tea tee tef teh tei tel tep teq tet teu tex tez tfr tft tgk tgl tgn tgo tgp tgt tgx tha thd thf thh thp tht thz tig tih tim tin tio tip tir tit tiv tiw tix tiy tiz tjg tji tjm tjs tkd tkm tkn tkp tkq tkr tkv tkw tlb tli tlk tlm tlr tlv tly tma tmc tmd tmf tmj tmq tmu tmz tna tnc tnl tnm tnp tnt tnx tob toi toj ton too top tos tow tox tpa tpc tpf tpi tpl tpn tpt tpu tpx tpy tpz tqb tqp tqr tqw trb trc trg tri trm trn trq trr trs trt tru trv trw tsd tsg tsi tsj tsn tso tsr tsu tsx tsz tte ttg tti ttj ttk ttr ttu ttv ttw tty tub tue tuf tuk tum tun tuo tuq tur tus tuu tuv tva tvd tvk tvn tvo tvw tvx twb twm twy txe txg txm txn txu txx tya tyj tzh tzj tzm tzo tzx uar ubl ubr ubu uby uda ude udi udj udm uga uge uig uiv uji ukg ukk ukq ukr ula ulc ule uln umb umc umo ump ums umu una und une ung unm unn unr unz upv ura urb urd urf urh uri urk urn urt urv urw ury usk usp utr utu uum uun uur uuu uve uvh uvl uwa uzb vai vam var vav vec ven veo vep vgr vie vit viv vkl vkm vkp vme vmw vmz vnp vol vot vro vrs vut wab wad wah waj wal wan wao wap was wat waw way waz wba wbb wbe wbj wbk wbl wbp wbw wdj wed wer wga wgy whg whk wic wih wii wim wir wiu wiy wka wky wlc wlk wlm wln wlo wls wmb wmc wmd wme wmh wmt wmw wnb wnc wne wni wnk wnp wnu wnw wny woc wod woe wog woi wol wos wow wrg wrl wrp wrr wrs wsa wsi wsk wss wtf wuh wul wun wut wuv www wya wyi xaa xab xad xae xag xal xam xan xau xaw xbc xbi xbr xcb xce xcl xcr xdc xdm xed xer xes xfa xgf xho xht xhu xib xin xir xiy xke xkf xkn xkq xkr xkw xla xlc xld xle xlp xls xly xmd xmf xmh xmk xmm xmr xmt xmz xnb xng xnn xnr xnt xod xok xon xoo xow xpc xpg xpi xpj xpm xpo xpq xpr xpu xqa xqt xra xrn xru xrw xsa xsi xsl xsm xsp xsr xss xsu xsv xsy xta xtd xti xtm xtz xug xum xur xve xvn xvo xvs xwa xwc xwk xwo xxt xya xyy xzh yaa yab yac yad yae yag yai yal yan yao yap yaq yar yat yav ybe ybi ybj ybm ybo yby ycl ycn yde ydg ydk yec yee yej yer yet yey ygr ygw yhl yia yid yig yii yij yik yil yim yis yix yka ykg yki ykm ykn yko yku yky yle ylg yli yll yln ylr ylu yly ymc yme yml ymm ymo ynd ynl ynn ynq yns ynu yog yoi yol yon yor yox ypg ypz yrb yre yrn yrw yry ysg ysn yta yue yuf yug yui yuj yuk yup yur yut yux yuy yuz yva yvt ywl ywr ywt yww yxg yxm yxy yzg zaa zac zad zae zaf zag zah zai zak zal zao zap zaq zar zas zat zau zav zaw zay zaz zbt zca zdj zen zgr zha zhb zho zia zik zil zin ziw zkk zko zkr zku zkz zma zmb zmc zmd zmf zmg zmh zmj zmm zmp zms zmt zmu zmv zmz zng zns zoc zoh zom zoq zor zos zpc zpf zpg zpi zpk zpl zpm zpn zpo zpq zpr zps zpt zpu zpv zpw zpx zpz zro zrs zsa zsr zsu zte ztg ztl ztm ztn ztp ztq zts ztt zty zul zum zun zwa zzj`
}