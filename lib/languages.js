import Papa from 'papaparse'
import Helper from '@/lib/helper'
import Config from '@/lib/config'
import axios from 'axios'

export default {
  dictionaries: [],
  wiktionary_langs: [],
  wiktionary_mapped_langs: [],
  languages: [],
  countries: [],
  translations: [],
  features: [],
  l1s: [],
  locales: [],
  scripts: [],
  omniglot: [],
  hours: [],
  googleTranslateLangs: [],
  youTubeLangs: [],
  liveTVLangs: [],
  async load() {
    console.log('Loading language data...')
    this.googleTranslateLangs = data.googleTranslateLangs,
      this.youTubeLangs = data.youTubeLangs,
      this.translations = data.translations,
      this.liveTVLangs = data.liveTVLangs
    this.dictionaries = this.loadCSVString(data.dictionaries)

    this.wiktionary_langs = data.wiktionary_langs.split(' ')
    this.wiktionary_mapped_langs = data.wiktionary_mapped_langs.split(' ')
    let res = await axios.get(`${Config.server}data/languages/languages.csv.txt`)
    this.languages = this.loadCSVString(res.data)
    res = await axios.get(`${Config.server}data/countries/countries.csv.txt`)
    let countries = this.loadCSVString(res.data)
    this.countries = countries.map((row) => {
      row.languages = row.languages ? row.languages.split(",") : [];
      return row;
    });
    this.features = this.loadCSVString(data.features)
    this.locales = this.loadCSVString(data.locales)
    this.scripts = this.loadCSVString(data.scripts)
    this.omniglot = this.loadCSVString(data.omniglot)
    this.hours = this.loadCSVString(data.hours)
    this.l1s = this.constructL1Data()
    return this
  },
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
  loadCSVString(csv, header = true) {
    if (typeof Papa !== 'undefined') {
      let r = Papa.parse(csv, {
        header: header
      })
      return r.data
    }
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
  hasGoogleTranslate(l2) {
    return this.googleTranslateLangs.includes(this.code(l2))
  },
  hasYouTube(l1, l2) {
    // l1.code = 'ceb', l2.code = 'en' -> yes, becuase we can find English YouTube videos, with sub translated in cebuano 
    // l1.code = 'en', l2.code = 'ceb' -> no, because we can't FIND cebuano subtitlted YouTube videos
    if (l2.code === 'ceb') return true
    if (l2.code === 'crh') return true
    if (l2.code === 'lzh') return true // Literary Chinese
    if (l2.code === 'cmn') return true // Mandarin
    let youtubeLangs = this.youTubeLangs.filter(l => [l2.code, ...l2.locales].includes(l))
    return youtubeLangs.length > 0
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
  constructL1Data() {
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
    let l1s = this.languages.filter(l => {
      if (this.wiktionary_langs.includes(l['iso639-3'])) return true
      if (l.type === 'L') return true
      if (['hbo', 'enm', 'arc', 'grc'].includes(l['iso639-3'])) return true
      if (l['glottologFamilyId'] === 'sino1245') return true
    }).map(language => {
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
      obj.country = this.countries.filter(c => language.country.split(' ').includes(c.alpha2Code))
      return obj
    })
    for (let l1 of l1s) {
      l1.apostrophe = ['tlh', 'cy', 'uz', 'br', 'tl', 'ceb', 'hy'].includes(l1.code)
      l1.han = l1.name.includes('Chinese')
      l1.continua = l1.han || ['th', 'lo', 'ja', 'km', 'ryu', 'bo', 'my', 'dz'].includes(l1.code)
      l1.scripts = this.scripts.filter(script => script.lang === l1.code && script.ms !== 'N' && script.p !== 'N' && script.ml !== 'O')
      if (l1.scripts[0]) l1.direction = l1.scripts[0].direction
      let omniglot = this.omniglot.find(item => item['iso639-3'] === l1['iso639-3'])
      if (omniglot) {
        l1.omniglot = omniglot.url
      }
      let hours = this.hours.find(item => item['iso639-3'] === l1['iso639-3'])
      if (hours) {
        l1.hours = hours.hours
      }
      if (this.translations[l1['iso639-3']]) l1.translations = this.translations[l1['iso639-3']]
      l1.locales = this.locales.filter(l => l.code === l1.code).map(l => l.locale)
      if (l1.han) {
        l1.locales = Helper.unique(l1.locales.concat([
          'zh',
          'zh-CN',
          'zh-Hans',
          'zh-Hant',
          'zh-SG',
          'zh-TW',
          'zh-HK']))
      }
    }
    for (let dictionary of this.dictionaries) {
      let l1 = l1s.find(language => language['iso639-3'] === dictionary.l1)
      if (typeof l1 !== 'undefined') {
        l1.dictionaries = l1.dictionaries || {}
        l1.dictionaries[dictionary.l2] = l1.dictionaries[dictionary.l2] || []
        l1.dictionaries[dictionary.l2].push(dictionary.dictionary) // "freedict"
      }
    }
    let english = l1s.find(l1 => l1.code === 'en')
    let all_wiktionary_langs = this.wiktionary_langs.concat(this.wiktionary_mapped_langs)
    for (let lang of all_wiktionary_langs) {
      english.dictionaries[lang] = english.dictionaries[lang] || []
      english.dictionaries[lang].push('wiktionary')
    }
    this.loadL1Features(l1s)
    return l1s
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
    'he',
    'haw',
    'hi',
    'hm',
    'hmn',
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
    'or',
    'pa',
    'pl',
    'ps',
    'pt',
    'ro',
    'ru',
    'rw',
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
    'tk',
    'tl',
    'tr',
    'tt',
    'ug',
    'uk',
    'ur',
    'uz',
    'vi',
    'xh',
    'yi',
    'yo',
    'zh',
    'zh-CN',
    'zu',
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
  scripts: `script,ms,lang,ml,p,direction
Latn,,uz,,,
Latn,,ro,,,
Latn,,tr,,,
Latn,,id,,,
Latn,,wo,,,
Cyrl,,kk,,,
Cyrl,,ky,,,
Latn,,ms,,,
Latn,,ku,,,
Latn,,so,,,
Guru,,pa,,N,
Latn,,az,,,
Cyrl,,az,,,
Adlm,,ff,,N,rtl
Ahom,N,und,?,?,
Hluw,N,und,?,?,
Arab,,ar,,,rtl
Arab,,az,,,rtl
Arab,,fa,,,rtl
Arab,,id,,,rtl
Arab,,kk,,,rtl
Arab,,ky,,,rtl
Arab,,ms,,,rtl
Arab,,ps,,,rtl
Arab,,so,,,rtl
Arab,,tg,,,rtl
Arab,,tk,,,rtl
Arab,,tr,,,rtl
Arab,,ur,,,rtl
Arab,,uz,,,rtl
Arab,,wni,,,rtl
Arab,,wo,,,rtl
Arab,,zdj,,,rtl
Arab,,aeb,,N,rtl
Arab,,arq,,N,rtl
Arab,,ars,,N,rtl
Arab,,ary,,N,rtl
Arab,,arz,,N,rtl
Arab,,bal,,N,rtl
Arab,,bej,,N,rtl
Arab,,bft,,N,rtl
Arab,,bgn,,N,rtl
Arab,,bqi,,N,rtl
Arab,,brh,,N,rtl
Arab,,cja,,N,rtl
Arab,,cjm,,N,rtl
Arab,,ckb,,N,rtl
Arab,,dcc,,N,rtl
Arab,,doi,,N,rtl
Arab,,dyo,,N,rtl
Arab,,fia,,N,rtl
Arab,,gbz,,N,rtl
Arab,,gjk,,N,rtl
Arab,,gju,,N,rtl
Arab,,glk,,N,rtl
Arab,,ha,,N,rtl
Arab,,haz,,N,rtl
Arab,,hnd,,N,rtl
Arab,,hno,,N,rtl
Arab,,inh,,N,rtl
Arab,,khw,,N,rtl
Arab,,ks,,N,rtl
Arab,,ku,,N,rtl
Arab,,kvx,,N,rtl
Arab,,kxp,,N,rtl
Arab,,lah,,N,rtl
Arab,,lki,,N,rtl
Arab,,lrc,,N,rtl
Arab,,luz,,N,rtl
Arab,,mfa,,N,rtl
Arab,,mvy,,N,rtl
Arab,,mzn,,N,rtl
Arab,,pa,,N,rtl
Arab,,prd,,N,rtl
Arab,,rmt,,N,rtl
Arab,,sd,,N,rtl
Arab,,sdh,,N,rtl
Arab,,shi,,N,rtl
Arab,,skr,,N,rtl
Arab,,sus,,N,rtl
Arab,,swb,,N,rtl
Arab,,tly,,N,rtl
Arab,,ttt,,N,rtl
Arab,,ug,,N,rtl
Arab,,cop,O,N,rtl
Armn,,hy,,,
Avst,N,ae,O,N,rtl
Bali,,ban,,N,
Bamu,,bax,,N,
Beng,,bn,,,
Beng,,as,,N,
Beng,,bpy,,,
Beng,,ccp,,,
Beng,,grt,,,
Beng,,kha,,,
Beng,,lus,,,
Beng,,mni,,,
Beng,,rkt,,,
Beng,,sat,,,
Beng,,syl,,,
Beng,,unr,,,
Beng,,unx,,,
Bass,N,und,?,?,
Batk,,bbc,,N,
Bhks,N,und,?,?,
Bopo,,zh,,,
Brah,N,und,?,?,
Bugi,N,bug,,N,
Bugi,,mak,,,
Bugi,,mdr,,,
Buhd,N,bku,,N,
Cari,N,xcr,O,N,
Aghb,N,lez,,N,
Cakm,,ccp,,N,
Cham,,cja,,N,
Cham,,cjm,,,
Cher,,chr,,N,
Copt,N,cop,O,N,
Cprt,N,grc,O,N,rtl
Cyrl,,be,,,
Cyrl,,bg,,,
Cyrl,,bs,,,
Cyrl,,mk,,,
Cyrl,,mn,,,
Cyrl,,ro,,,
Cyrl,,ru,,,
Cyrl,,sr,,,
Cyrl,,tg,,,
Cyrl,,tk,,,
Cyrl,,uk,,,
Cyrl,,uz,,,
Cyrl,,ab,,N,
Cyrl,,abq,,,
Cyrl,,ady,,,
Cyrl,,aii,,,
Cyrl,,alt,,,
Cyrl,,av,,,
Cyrl,,ba,,,
Cyrl,,bua,,,
Cyrl,,ce,,,
Cyrl,,chm,,,
Cyrl,,cjs,,,
Cyrl,,ckt,,,
Cyrl,,crh,,,
Cyrl,,cv,,,
Cyrl,,dar,,,
Cyrl,,dng,,,
Cyrl,,evn,,,
Cyrl,,gag,,,
Cyrl,,gld,,,
Cyrl,,inh,,,
Cyrl,,kaa,,,
Cyrl,,kbd,,,
Cyrl,,kca,,,
Cyrl,,kjh,,,
Cyrl,,koi,,,
Cyrl,,kpy,,,
Cyrl,,krc,,,
Cyrl,,ku,,,
Cyrl,,kum,,,
Cyrl,,kv,,,
Cyrl,,lbe,,,
Cyrl,,lez,,,
Cyrl,,mdf,,,
Cyrl,,mns,,,
Cyrl,,mrj,,,
Cyrl,,myv,,,
Cyrl,,nog,,,
Cyrl,,os,,,
Cyrl,,pnt,,,
Cyrl,,rom,,,
Cyrl,,rue,,,
Cyrl,,sah,,,
Cyrl,,se,,,
Cyrl,,sel,,,
Cyrl,,tab,,,
Cyrl,,tkr,,,
Cyrl,,tly,,,
Cyrl,,tt,,,
Cyrl,,ttt,,,
Cyrl,,tyv,,,
Cyrl,,ude,,,
Cyrl,,udm,,,
Cyrl,,ug,,,
Cyrl,,xal,,,
Cyrl,,yrk,,,
Cyrl,,cu,O,,
Cyrl,,lfn,,,
Dsrt,N,en,,,
Deva,,hi,,,
Deva,,hif,,,
Deva,,ne,,,
Deva,,anp,,N,
Deva,,awa,,,
Deva,,bap,,,
Deva,,bfy,,,
Deva,,bgc,,,
Deva,,bhb,,,
Deva,,bhi,,,
Deva,,bho,,,
Deva,,bjj,,,
Deva,,bra,,,
Deva,,brx,,,
Deva,,btv,,,
Deva,,dty,,,
Deva,,gbm,,,
Deva,,gom,,,
Deva,,gon,,,
Deva,,gvr,,,
Deva,,hne,,,
Deva,,hoc,,,
Deva,,hoj,,,
Deva,,jml,,,
Deva,,kfr,,,
Deva,,kfy,,,
Deva,,khn,,,
Deva,,kok,,,
Deva,,kru,,,
Deva,,ks,,,
Deva,,lif,,,
Deva,,mag,,,
Deva,,mai,,,
Deva,,mgp,,,
Deva,,mr,,,
Deva,,mrd,,,
Deva,,mtr,,,
Deva,,mwr,,,
Deva,,new,,,
Deva,,noe,,,
Deva,,raj,,,
Deva,,rjs,,,
Deva,,sat,,,
Deva,,sck,,,
Deva,,sd,,,
Deva,,srx,,,
Deva,,swv,,,
Deva,,taj,,,
Deva,,tdg,,,
Deva,,tdh,,,
Deva,,thl,,,
Deva,,thq,,,
Deva,,thr,,,
Deva,,tkt,,,
Deva,,unr,,,
Deva,,unx,,,
Deva,,wbr,,,
Deva,,wtm,,,
Deva,,xnr,,,
Deva,,xsr,,,
Deva,,pi,O,,
Deva,,sa,,,
Dogr,N,und,?,?,
Dupl,N,fr,,,
Egyp,N,egy,O,N,
Elba,N,sq,,,
Elym,N,und,?,?,
Ethi,,am,,,
Ethi,,ti,,,
Ethi,,byn,,N,
Ethi,,om,,,
Ethi,,tig,,,
Ethi,,wal,,,
Ethi,,gez,O,,
Lisu,,lis,,N,
Geor,,ka,,,
Geor,,lzz,,N,
Geor,,xmf,,,
Glag,N,und,?,?,
Goth,N,got,O,N,
Gran,N,sa,O,N,
Grek,,el,,,
Grek,,bgx,,N,
Grek,,pnt,,,
Grek,,tsd,,,
Grek,,cop,O,,
Grek,,grc,,,
Gujr,,gu,,N,
Gong,,und,?,?,
Hani,,vi,,,
Hang,,und,?,?,
Rohg,,und,?,?,rtl
Hano,N,hnn,,N,
Hatr,N,und,?,?,
Hebr,,he,,,rtl
Hebr,,jpr,,N,rtl
Hebr,,jrb,,,rtl
Hebr,,lad,,,rtl
Hebr,,yi,,,rtl
Hebr,,sam,O,,rtl
Hebr,,hbo,,,rtl
Armi,N,arc,O,N,rtl
Zinh,,und,?,?,
Phli,N,pal,O,N,rtl
Prti,N,xpr,O,N,rtl
Jpan,,ja,,,
Java,,jv,,N,
Kthi,N,und,?,?,
Knda,,kn,,N,
Knda,,tcy,,,
Kana,,ain,,N,
Kana,,ryu,,,
Kali,,eky,,N,
Kali,,kyu,,,
Khar,N,und,?,?,rtl
Khmr,,km,,,
Khoj,N,sd,,N,
Sind,N,sd,,N,
Kore,,ko,,,
Lana,,nod,,N,
Laoo,,lo,,,
Laoo,,hnj,,N,
Laoo,,kjg,,,
Latn,,ay,,,
Latn,,bi,,,
Latn,,bs,,,
Latn,,ca,,,
Latn,,ch,,,
Latn,,cs,,,
Latn,,da,,,
Latn,,de,,,
Latn,,en,,,
Latn,,es,,,
Latn,,et,,,
Latn,,fi,,,
Latn,,fil,,,
Latn,,fj,,,
Latn,,fo,,,
Latn,,fr,,,
Latn,,ga,,,
Latn,,gil,,,
Latn,,gn,,,
Latn,,gsw,,,
Latn,,gv,,,
Latn,,hif,,,
Latn,,ho,,,
Latn,,hr,,,
Latn,,ht,,,
Latn,,hu,,,
Latn,,is,,,
Latn,,it,,,
Latn,,kl,,,
Latn,,ky,,,
Latn,,lb,,,
Latn,,lt,,,
Latn,,lv,,,
Latn,,mg,,,
Latn,,mh,,,
Latn,,mi,,,
Latn,,mt,,,
Latn,,na,,,
Latn,,nb,,,
Latn,,nd,,,
Latn,,niu,,,
Latn,,nl,,,
Latn,,nn,,,
Latn,,ny,,,
Latn,,pap,,,
Latn,,pau,,,
Latn,,pl,,,
Latn,,pt,,,
Latn,,qu,,,
Latn,,rn,,,
Latn,,ro,,,
Latn,,rw,,,
Latn,,sg,,,
Latn,,sk,,,
Latn,,sl,,,
Latn,,sm,,,
Latn,,sn,,,
Latn,,sq,,,
Latn,,sr,,,
Latn,,ss,,,
Latn,,st,,,
Latn,,sv,,,
Latn,,sw,,,
Latn,,tet,,,
Latn,,tg,,,
Latn,,tk,,,
Latn,,tkl,,,
Latn,,tn,,,
Latn,,to,,,
Latn,,tpi,,,
Latn,,tvl,,,
Latn,,ty,,,
Latn,,tzm,,,
Latn,,vi,,,
Latn,,wo,,,
Latn,,yo,,,
Latn,,aa,,N,
Latn,,abr,,,
Latn,,ace,,,
Latn,,ach,,,
Latn,,ada,,,
Latn,,af,,,
Latn,,agq,,,
Latn,,ain,,,
Latn,,ak,,,
Latn,,akz,,,
Latn,,ale,,,
Latn,,aln,,,
Latn,,amo,,,
Latn,,an,,,
Latn,,aoz,,,
Latn,,arn,,,
Latn,,aro,,,
Latn,,arp,,,
Latn,,arw,,,
Latn,,asa,,,
Latn,,ast,,,
Latn,,atj,,,
Latn,,bal,,,
Latn,,ban,,,
Latn,,bar,,,
Latn,,bas,,,
Latn,,bbc,,,
Latn,,bbj,,,
Latn,,bci,,,
Latn,,bem,,,
Latn,,bew,,,
Latn,,bez,,,
Latn,,bfd,,,
Latn,,bhk,,,
Latn,,bik,,,
Latn,,bin,,,
Latn,,bjn,,,
Latn,,bkm,,,
Latn,,bku,,,
Latn,,bla,,,
Latn,,bm,,,
Latn,,bmq,,,
Latn,,bqv,,,
Latn,,br,,,
Latn,,brh,,,
Latn,,bss,,,
Latn,,bto,,,
Latn,,buc,,,
Latn,,bug,,,
Latn,,bum,,,
Latn,,bvb,,,
Latn,,byv,,,
Latn,,bze,,,
Latn,,bzx,,,
Latn,,cad,,,
Latn,,car,,,
Latn,,cay,,,
Latn,,cch,,,
Latn,,ceb,,,
Latn,,cgg,,,
Latn,,chk,,,
Latn,,chn,,,
Latn,,cho,,,
Latn,,chp,,,
Latn,,chy,,,
Latn,,cic,,,
Latn,,co,,,
Latn,,cps,,,
Latn,,cr,,,
Latn,,crj,,,
Latn,,crl,,,
Latn,,crs,,,
Latn,,csb,,,
Latn,,ctd,,,
Latn,,cy,,,
Latn,,dak,,,
Latn,,dav,,,
Latn,,del,,,
Latn,,den,,,
Latn,,dgr,,,
Latn,,din,,,
Latn,,dje,,,
Latn,,dnj,,,
Latn,,dsb,,,
Latn,,dtm,,,
Latn,,dtp,,,
Latn,,dua,,,
Latn,,dyo,,,
Latn,,dyu,,,
Latn,,ebu,,,
Latn,,ee,,,
Latn,,efi,,,
Latn,,egl,,,
Latn,,eka,,,
Latn,,esu,,,
Latn,,eu,,,
Latn,,ewo,,,
Latn,,ext,,,
Latn,,fan,,,
Latn,,ff,,,
Latn,,ffm,,,
Latn,,fit,,,
Latn,,fon,,,
Latn,,frc,,,
Latn,,frp,,,
Latn,,frr,,,
Latn,,frs,,,
Latn,,fud,,,
Latn,,fuq,,,
Latn,,fur,,,
Latn,,fuv,,,
Latn,,fvr,,,
Latn,,fy,,,
Latn,,gaa,,,
Latn,,gag,,,
Latn,,gay,,,
Latn,,gba,,,
Latn,,gcr,,,
Latn,,gd,,,
Latn,,gl,,,
Latn,,gor,,,
Latn,,gos,,,
Latn,,grb,,,
Latn,,gub,,,
Latn,,guc,,,
Latn,,gur,,,
Latn,,guz,,,
Latn,,gvr,,,
Latn,,gwi,,,
Latn,,ha,,,
Latn,,hai,,,
Latn,,haw,,,
Latn,,hil,,,
Latn,,hmn,,,
Latn,,hnn,,,
Latn,,hop,,,
Latn,,hsb,,,
Latn,,hup,,,
Latn,,hz,,,
Latn,,iba,,,
Latn,,ibb,,,
Latn,,ife,,,
Latn,,ig,,,
Latn,,ii,,,
Latn,,ik,,,
Latn,,ikt,,,
Latn,,ilo,,,
Latn,,inh,,,
Latn,,iu,,,
Latn,,izh,,,
Latn,,jam,,,
Latn,,jgo,,,
Latn,,jmc,,,
Latn,,jv,,,
Latn,,kab,,,
Latn,,kac,,,
Latn,,kaj,,,
Latn,,kam,,,
Latn,,kao,,,
Latn,,kcg,,,
Latn,,kck,,,
Latn,,kde,,,
Latn,,kea,,,
Latn,,kfo,,,
Latn,,kg,,,
Latn,,kge,,,
Latn,,kgp,,,
Latn,,kha,,,
Latn,,khq,,,
Latn,,ki,,,
Latn,,kiu,,,
Latn,,kj,,,
Latn,,kjg,,,
Latn,,kkj,,,
Latn,,kln,,,
Latn,,kmb,,,
Latn,,kos,,,
Latn,,kpe,,,
Latn,,kr,,,
Latn,,kri,,,
Latn,,krj,,,
Latn,,krl,,,
Latn,,ksb,,,
Latn,,ksf,,,
Latn,,ksh,,,
Latn,,kut,,,
Latn,,kvr,,,
Latn,,kw,,,
Latn,,lag,,,
Latn,,laj,,,
Latn,,lam,,,
Latn,,lbw,,,
Latn,,lg,,,
Latn,,li,,,
Latn,,lij,,,
Latn,,liv,,,
Latn,,ljp,,,
Latn,,lkt,,,
Latn,,lmo,,,
Latn,,ln,,,
Latn,,lol,,,
Latn,,loz,,,
Latn,,ltg,,,
Latn,,lu,,,
Latn,,lua,,,
Latn,,lun,,,
Latn,,luo,,,
Latn,,lut,,,
Latn,,luy,,,
Latn,,lzz,,,
Latn,,mad,,,
Latn,,maf,,,
Latn,,mak,,,
Latn,,man,,,
Latn,,mas,,,
Latn,,maz,,,
Latn,,mdh,,,
Latn,,mdr,,,
Latn,,mdt,,,
Latn,,men,,,
Latn,,mer,,,
Latn,,mfe,,,
Latn,,mgh,,,
Latn,,mgo,,,
Latn,,mgy,,,
Latn,,mic,,,
Latn,,min,,,
Latn,,mls,,,
Latn,,moe,,,
Latn,,moh,,,
Latn,,mos,,,
Latn,,mro,,,
Latn,,mua,,,
Latn,,mus,,,
Latn,,mwk,,,
Latn,,mwl,,,
Latn,,mwv,,,
Latn,,mxc,,,
Latn,,myx,,,
Latn,,nap,,,
Latn,,naq,,,
Latn,,nch,,,
Latn,,ndc,,,
Latn,,nds,,,
Latn,,ng,,,
Latn,,ngl,,,
Latn,,nhe,,,
Latn,,nhw,,,
Latn,,nia,,,
Latn,,nij,,,
Latn,,njo,,,
Latn,,nmg,,,
Latn,,nnh,,,
Latn,,nr,,,
Latn,,nsk,,,
Latn,,nso,,,
Latn,,nus,,,
Latn,,nv,,,
Latn,,nxq,,,
Latn,,nym,,,
Latn,,nyn,,,
Latn,,nyo,,,
Latn,,nzi,,,
Latn,,oc,,,
Latn,,oj,,,
Latn,,om,,,
Latn,,osa,,,
Latn,,pag,,,
Latn,,pam,,,
Latn,,pcd,,,
Latn,,pcm,,,
Latn,,pdc,,,
Latn,,pdt,,,
Latn,,pfl,,,
Latn,,pko,,,
Latn,,pms,,,
Latn,,pnt,,,
Latn,,pon,,,
Latn,,prg,,,
Latn,,puu,,,
Latn,,quc,,,
Latn,,qug,,,
Latn,,rap,,,
Latn,,rar,,,
Latn,,rcf,,,
Latn,,rej,,,
Latn,,rgn,,,
Latn,,ria,,,
Latn,,rif,,,
Latn,,rm,,,
Latn,,rmf,,,
Latn,,rmo,,,
Latn,,rmu,,,
Latn,,rng,,,
Latn,,rob,,,
Latn,,rof,,,
Latn,,rom,,,
Latn,,rtm,,,
Latn,,rug,,,
Latn,,rup,,,
Latn,,rwk,,,
Latn,,sad,,,
Latn,,saf,,,
Latn,,saq,,,
Latn,,sas,,,
Latn,,sat,,,
Latn,,sbp,,,
Latn,,sc,,,
Latn,,scn,,,
Latn,,sco,,,
Latn,,scs,,,
Latn,,sdc,,,
Latn,,se,,,
Latn,,see,,,
Latn,,sef,,,
Latn,,seh,,,
Latn,,sei,,,
Latn,,ses,,,
Latn,,sgs,,,
Latn,,shi,,,
Latn,,sid,,,
Latn,,sli,,,
Latn,,sly,,,
Latn,,sma,,,
Latn,,smj,,,
Latn,,smn,,,
Latn,,sms,,,
Latn,,snk,,,
Latn,,srb,,,
Latn,,srn,,,
Latn,,srr,,,
Latn,,ssy,,,
Latn,,stq,,,
Latn,,su,,,
Latn,,suk,,,
Latn,,sus,,,
Latn,,swb,,,
Latn,,swg,,,
Latn,,sxn,,,
Latn,,syi,,,
Latn,,szl,,,
Latn,,tbw,,,
Latn,,tem,,,
Latn,,teo,,,
Latn,,ter,,,
Latn,,tiv,,,
Latn,,tkr,,,
Latn,,tli,,,
Latn,,tly,,,
Latn,,tmh,,,
Latn,,tog,,,
Latn,,tru,,,
Latn,,trv,,,
Latn,,ts,,,
Latn,,tsg,,,
Latn,,tsi,,,
Latn,,ttj,,,
Latn,,ttt,,,
Latn,,tum,,,
Latn,,twq,,,
Latn,,udm,,,
Latn,,ug,,,
Latn,,uli,,,
Latn,,umb,,,
Latn,,vai,,,
Latn,,ve,,,
Latn,,vec,,,
Latn,,vep,,,
Latn,,vic,,,
Latn,,vls,,,
Latn,,vmf,,,
Latn,,vmw,,,
Latn,,vot,,,
Latn,,vro,,,
Latn,,vun,,,
Latn,,wa,,,
Latn,,wae,,,
Latn,,war,,,
Latn,,was,,,
Latn,,wbp,,,
Latn,,wls,,,
Latn,,xav,,,
Latn,,xh,,,
Latn,,xog,,,
Latn,,yao,,,
Latn,,yap,,,
Latn,,yav,,,
Latn,,ybb,,,
Latn,,yrl,,,
Latn,,yua,,,
Latn,,za,,,
Latn,,zag,,,
Latn,,zap,,,
Latn,,zea,,,
Latn,,zmi,,,
Latn,,zu,,,
Latn,,zun,,,
Latn,,zza,,,
Latn,,ang,O,,
Latn,,avk,,,
Latn,,dum,,,
Latn,,enm,,,
Latn,,eo,,,
Latn,,ett,,,
Latn,,frm,,,
Latn,,fro,,,
Latn,,gmh,,,
Latn,,goh,,,
Latn,,ia,,,
Latn,,jut,,,
Latn,,la,,,
Latn,,lfn,,,
Latn,,lui,,,
Latn,,nov,,,
Latn,,osc,,,
Latn,,pro,,,
Latn,,sga,,,
Latn,,vo,,,
Latn,,xum,,,
Lepc,,lep,,N,
Limb,,lif,,N,
Lina,N,lab,O,N,
Linb,N,grc,O,N,
Lyci,N,xlc,O,N,
Lydi,N,xld,O,N,rtl
Mahj,N,hi,,,
Maka,N,und,?,?,
Mlym,,ml,,N,
Mand,,myz,O,N,rtl
Mani,N,xmn,O,N,rtl
Marc,N,und,?,?,
Gonm,N,und,?,?,
Medf,N,und,?,?,
Mtei,,mni,,N,
Mend,N,men,,N,rtl
Mero,N,und,?,?,
Merc,N,xmr,O,N,
Modi,N,mr,,N,
Mong,N,mn,,,
Mong,,mnc,,N,
Mroo,N,mro,,N,
Mult,N,und,?,?,
Mymr,,my,,,
Mymr,,kht,,N,
Mymr,,mnw,,,
Mymr,,shn,,,
Nkoo,,bm,,N,rtl
Nkoo,,man,,,rtl
Nkoo,,nqo,,,rtl
Nbat,N,arc,O,N,rtl
Nand,N,und,?,?,
Talu,,khb,,N,
Newa,,und,?,?,
Nshu,N,und,?,?,
Hmnp,,und,?,?,
Orya,,or,,N,
Orya,,sat,,,
Ogam,N,sga,O,N,
Olck,,sat,,N,
Hung,N,und,?,?,rtl
Ital,N,ett,O,N,rtl
Ital,,osc,,,rtl
Ital,,xum,,,rtl
Narb,N,xna,O,N,rtl
Perm,N,kv,,N,
Xpeo,N,peo,O,N,
Sogo,N,und,?,?,
Sarb,N,xsa,O,N,rtl
Orkh,N,otk,O,N,rtl
Osge,,und,?,?,
Osma,N,so,,,
Hmng,N,hmn,,N,
Palm,N,arc,O,N,rtl
Pauc,N,und,?,?,
Phag,N,mn,,,
Phag,,zh,,,
Phnx,N,phn,O,N,rtl
Plrd,,hmd,,N,
Phlp,N,pal,O,N,rtl
Rjng,N,rej,,N,
Runr,N,de,,,
Runr,,non,O,N,
Samr,N,sam,O,N,rtl
Samr,,smp,,,rtl
Saur,,saz,,N,
Shrd,N,sa,O,N,
Shaw,N,en,,,
Sidd,N,sa,O,N,
Sgnw,N,und,?,?,
Hans,,zh,,,
Hans,,gan,,N,
Hans,,hak,,,
Hans,,hsn,,,
Hans,,lzh,,,
Hans,,nan,,,
Hans,,wuu,,,
Hans,,yue,,,
Hans,,za,,,
Hans,,lzh,O,,
Sinh,,si,,,
Sinh,,pi,O,N,
Sinh,,sa,,,
Sogd,N,und,?,?,
Sora,N,srb,,N,
Soyo,N,und,?,?,
Xsux,N,akk,O,N,
Xsux,,hit,,,
Sund,,su,,N,
Sylo,,syl,,N,
Syrc,,ar,,,rtl
Syrc,,aii,,N,rtl
Syrc,,syr,,,rtl
Syrc,,tru,,,rtl
Tglg,N,fil,,,
Tagb,N,tbw,,N,
Tale,,tdd,,N,
Tavt,,blt,,N,
Takr,N,doi,,N,
Taml,,ta,,,
Taml,,bfq,,N,
Tang,N,und,?,?,
Telu,,gon,,N,
Telu,,lmn,,,
Telu,,te,,,
Telu,,wbq,,,
Thaa,,dv,,,rtl
Thai,,th,,,
Thai,,kdt,,N,
Thai,,kxm,,,
Thai,,lcp,,,
Thai,,lwl,,,
Thai,,sou,,,
Thai,,tts,,,
Thai,,pi,O,,
Tibt,,dz,,,
Tibt,,bft,,N,
Tibt,,bo,,,
Tibt,,taj,,,
Tibt,,tdg,,,
Tibt,,tsj,,,
Tfng,,tzm,,,
Tfng,,rif,,N,
Tfng,,shi,,,
Tfng,,zen,,,
Tfng,,zgh,,,
Tirh,N,mai,,N,
Hant,,zh,,,
Hant,,yue,,N,
Ugar,N,uga,O,N,
Cans,,chp,,N,
Cans,,cr,,,
Cans,,crj,,,
Cans,,crk,,,
Cans,,crl,,,
Cans,,crm,,,
Cans,,csw,,,
Cans,,den,,,
Cans,,iu,,,
Cans,,nsk,,,
Cans,,oj,,,
Zzzz,n/a,ase,,?,
Zzzz,,dzg,,,
Zzzz,,fat,,,
Zzzz,,kbl,,,
Zzzz,,ken,,,
Zzzz,,lou,,,
Zzzz,,mde,,,
Zzzz,,mye,,,
Zzzz,,no,,,
Zzzz,,sba,,,
Zzzz,,sh,,,
Zzzz,,shu,,,
Zzzz,,tl,,,
Zzzz,,tw,,,
Vaii,,vai,,N,
Wara,N,hoc,,N,
Wcho,,und,?,?,
Yiii,,ii,,N,
Zanb,N,und,?,?,`,
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
leiz1236	eng	hsk-cedict
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
  wiktionary_langs: `aaa aab aac aad aaf aag aah aai aak aal aan aap aar aas aau aaw aax aaz aba abb abc abf abg abh abi abj abk abm abn abo abq abr abs abt abu abv abw abx aby abz aca acb acd aci ack acl acn acp acr acs acv acw acx acy acz ada adb ade adf adg adh adi adj adl adn ado adq adr ads adt adu ady adz aea aeb aed aek ael aem aen aeq aer aes aeu aew aey aez afb afd afe afg afh afi afk afn afo afp afr afs aft afu afz aga agb agc agd age agf agg agh agi agj agk agl agm agn ago agq agr ags agt agw agx agy aha ahb ahg ahh ahi ahk ahl ahm ahn aho ahp ahr ahs aia aic aid aie aif aig aih aii aij aik ail aim aio aip air ait aiw aix aiy aji ajn ajp ajt aju ajw ajz aka akc akd ake akf akg akh aki akk akl akm ako akp akq akr aks akt aku akv akw akx aky akz ala ald ale alf alh ali alj alk all alm alo alp alq alr alt alu alx aly alz ama amb amc ame amf amh ami amj amk aml amn amo amp amq amr ams amt amu amv amw amx amy amz ana anb anc and ane anf anh ani anj ank anm ann ano anp anr ans ant anu anv anw anx anz aoa aob aoc aod aoe aof aog aoi aoj aok aol aom aon aor aos aot aou aox aoz apb apc apd ape apf apg api apn apo app apq apr aps apt apu apv apw apx apy apz aqc aqd aqg aqm aqn aqp aqr aqt aqz ara arc ard arg arh ari arj ark arl arn aro arp arq ars arv arw ary arz asb asc ase asf asg ash asi ask asl asm asn aso asp asq asr ass ast asu asv asx asy asz ata atb atc atd ate ati atj atk atm ato atp atq atr ats att atu atv atw atx aty atz aua aub aud aug auh aui auk aul aun auo aup auq aur aut auu auw aux auz avb avd ave avi avk avm avn avo avs avt avu avv awa awc awe awg awh awi awk awm awn awo awr aws awt awu awv aww awx awy axb axe axg axl axm aya ayd aye ayi ayk ayl aym ayo ayp ays ayu ayy aza azd aze azg azm azn azo azt azz baa bab bac bae baf bag baj bak bal bam ban bao bap bar baw bay bba bbb bbd bbe bbf bbg bbh bbi bbk bbl bbm bbn bbp bbq bbr bbs bbt bbv bbw bbx bby bca bcb bcd bce bcf bcg bch bcj bco bcq bcs bct bcv bcw bcy bcz bda bdb bdc bdd bde bdf bdg bdi bdk bdl bdm bdn bdo bdp bdq bdr bds bdt bdu bdv bdw bdx bdy bdz bea beb bec bed bee bef beg beh bei bej bek bel ben beo bep beq bes beu bev bew bex bfa bfb bfc bfd bfe bff bfg bfh bfi bfj bfk bfl bfm bfn bfo bfp bfq bfr bfs bft bfu bfw bfx bfy bfz bga bgb bgc bgd bge bgf bgg bgi bgj bgk bgo bgq bgr bgs bgt bgu bgv bgw bgx bgy bgz bha bhb bhc bhd bhe bhf bhg bhi bhj bhl bhm bhn bho bhp bhq bhs bht bhu bhv bhw bhx bhy bia bib bic bid bie bif big bil bim bio bip biq bir bis bit biu biv biw bix biy biz bja bjc bje bjf bjg bjh bji bjk bjm bjo bjp bjr bjs bjt bju bjv bjw bjx bjy bjz bka bkd bkf bkg bkh bki bkj bkk bkl bkm bkn bko bkq bkr bkt bku bkv bkw bkx bky bkz blb blc bld ble blf blg blh bli blj blk bll blo blp blq blr bls blt blv blw blx bly blz bma bmb bmc bmd bme bmg bmh bmi bmj bmk bml bmo bmp bmq bmr bmt bmu bmv bmw bmx bmz bna bnb bne bnf bng bni bnj bnk bnl bnm bnn bnp bnq bnr bns bnu bnw bnx bny bnz boa bob bod boe bof bog boi boj bok bol bom bon boo bop boq bor bot bou bov bow box boz bpd bpg bph bpi bpj bpk bpl bpm bpn bpo bpp bpq bpr bps bpt bpu bpv bpx bpz bqa bqb bqd bqf bqg bqh bqi bqj bqk bql bqm bqn bqo bqp bqq bqr bqs bqt bqu bqw bqx bqy bqz bra brb brc brd bre brf brg brh bri brj brl brm brn bro brp brq brr brs brt bru brv brw brx bry brz bsa bsb bsc bse bsf bsg bsi bsj bsk bsl bsm bso bsp bsq bsr bss bst bsu bsv bsw bsx bsy bta btc bte btf btg bth bti btj btn btp btq btr btt btu btv btw bty bub bud bue buf bug buh bui buj bul bum bun buo bup buq bus but buu buv buw bux bva bvb bvc bvd bve bvf bvg bvh bvi bvj bvk bvl bvm bvn bvo bvp bvq bvr bvt bvu bvv bvw bvy bvz bwa bwb bwc bwd bwe bwf bwg bwh bwi bwj bwk bwl bwm bwn bwp bws bwu bww bwx bwy bwz bxb bxc bxd bxf bxg bxh bxi bxj bxk bxl bxn bxo bxp bxq bxs bxv bxz byb byc byd bye byf byg byi byk byl byo byp byq byr bys byt byv byw byx byz bza bzb bzd bze bzf bzg bzh bzi bzl bzm bzn bzo bzp bzq bzr bzs bzu bzy bzz cab cac cad caf cag cah caj cak cal cam can cao cap caq car cas cat cav caw cax cay caz cbb cbc cbd cbg cbi cbj cbk cbl cbo cbr cbs cbt cbu cbv cbw cby cca ccc cce cch ccj ccl ccm cco ccp ccr cda cde cdf cdh cdi cdj cdm cdn cdr cds cdy cdz cea ceb ceg cen ces cet cfa cfd cfg cfm cga cgc cha chb chc chd che chf chg chh chj chk chl chn cho chp chq chr cht chv chx chy chz cia cib cic cid cie cih cik cim cin cip cir ciy cja cje cjh cji cjk cjm cjn cjo cjp cjs cjv ckb ckh ckl ckn cko ckq ckr cks cku ckv ckx cky ckz cla clc cld cle clh cli clj clk cll clo clt clu clw cly cma cme cmg cmi cml cmm cmn cmo cms cmt cna cnb cnc cng cni cnk cnl cno cns cnt cnu cnw cnx coa cob coc coe cog coj cok col com con const { unregister } = require("enquire.js") coo cop coq cor cos cot cou cov cow cox coz cpa cpb cpc cpg cpi cpn cps cpu cpy cqd cra crb crc crd cre crf crg crh cri crj crk crl crm cro crq crr crt crv crw crx cry crz csa csb csc csd cse csg csh csi csj csk csl csm csn cso csr css cst csv csw csy csz cta ctd cte ctg cth ctl ctm ctn cto ctp ctt ctu ctz cua cub cuc cuh cui cuj cul cuo cup cuq cur cut cuu cuv cuw cux cuy cvg cvn cwa cwb cwd cwe cwg cwt cya cyb cym czk czn czt daa dac dad dae dag dah dai daj dak dal dam dan dao daq dar das dau dav daw dax daz dbb dbd dbe dbf dbi dbj dbl dbm dbn dbo dbp dbq dbr dbu dbv dbw dby dcr dda ddd dde ddg ddj ddr dds ddw dec ded dee def deg deh dei dek dem dep der des deu dev dez dga dgc dgd dge dgg dgh dgi dgk dgn dgr dgs dgw dgx dgz dhi dhl dhm dhn dho dhs dhu dhx dia dib dic did dif dig dii dij dik dil dim din dio dip dir dis div diw dix diy diz dja djb djc dje djf dji djo djr dju djw dka dkk dkr dks dkx dlg dlk dlm dln dma dmb dmc dmd dme dmg dmk dml dmr dms dmu dmv dmw dmx dmy dna dnd dne dng dni dnj dnk dno dnr dnt dnu dnv dnw dny doa dob doe dof doh dok dol doo dop doq dor dos dot dow dox doy doz dpp drb drc drd drg drn dro drq drs dru dry dsb dse dsh dsi dsl dsn dso dsq dta dtb dtd dth dti dtk dtm dtr dts dtt dtu dua dub duc due duf duh dui duk dul dun dup duq dur dus duu duv duw duy dva dwa dwr dwu dww dwy dwz dya dyb dyd dyg dyn dyo dyu dza dze dzg dzn dzo ebg ebr ebu ecr ecs ecy eee efa efe efi ega egl ego ehu eip eit eiv eja eka eke ekg eki ekm eko ekp ekr eky ele elh eli elk ell elm elo elu elx emb eme emg emi emk emm emn emp emu emw emx emy ena enb enc end enf eng enh enl enm enn eno enq enu enx epi epo era erg erh eri erk ero err ers ert erw ese esh esi esk esm esn eso esq ess est esy etb etc eth etn eto etr ets ett etu etx etz eus eve evh evn ewe ewo ext eya eyo eza eze faa fad faf fag fah fai faj fal fam fao far fas fau fax fay faz fbl fcs fer ffi fgr fia fie fij fin fip fir fiw flh fli fll fln flr fmp fmu fng fni fod foi fom fon for fos fqs fra frd frq frt fry fse fsl fud fuj ful fum fun fur fut fuu fuy fvr fwa fwe gaa gab gac gad gaf gag gah gai gaj gak gam gao gap gaq gar gas gat gaw gay gbb gbe gbf gbg gbh gbi gbj gbk gbl gbm gbn gbo gbp gbq gbr gbs gbu gbv gbx gby gcc gcd gce gcl gcn gct gdc gdd gde gdf gdg gdh gdi gdk gdl gdm gdn gdq gdr gds gdt gdu gdx gea geb gec ged geg gei gej geq ges gew gex gey gfk gft gga ggb ggd ggg ggk ggl ggt ggw ghe ghh ghk ghl ghn gho ghr ghs gib gid gig gih gil gin giq gir gis git giu giw gix giy giz gji gjk gjm gjn gka gke gkn gko gkp gla glc gld gle glg glk glo glr glv glw gly gma gmb gmd gml gmm gmn gmu gmv gmx gmy gna gnb gnc gnd gne gng gnh gni gnj gnk gnl gnm gnn gnq gnr gnt gnu gnw gnz goa gob goc god goe gof gog goi goj gol gon goo gop goq gor got gou gow gox goy goz gpa gpn gqa gqi gqr gqu gra grb grg grh gri grj grm grn gro grq grr grs grt gru grv grw grx gry grz gse gsg gsl gsm gso gsp gss gta gua gub guc gud gue guf guh gui guj guk gum gun guo gup guq gur gus gut guu guw gux guz gvc gve gvf gvj gvl gvm gvn gvo gvp gvs gvy gwa gwb gwc gwd gwe gwf gwg gwm gwn gwr gwt gwu gww gwx gxx gya gyb gyd gye gyf gyg gyi gyl gym gyn gyo gyr gyy gza gzn hab hac had haf hag hah hai haj hak hal ham hao hap har has hau hav haw hax hay haz hba hbb hbn hbs hbu hca hch hdn hds hdy hea heb hed heg heh hei hem her hgm hgw hhi hhr hhy hia hib hid hif hig hih hii hij hik hil hin hir hit hiw hji hka hke hkk hkn hks hla hlb hld hle hma hmc hmd hme hmf hmg hmh hmi hmj hmk hml hmm hmo hmp hmq hmr hms hmt hmu hmv hmw hmy hmz hnd hne hnh hni hnj hnn hno hns hnu hoa hoc hod hoe hoh hoi hoj hol hom hoo hop hor hos hot hov how hoy hoz hpo hra hrc hre hrk hrm hro hrp hrt hru hrw hrx hrz hsb hsh hsl hss hti hto hts htu hub hud huf hug huh hui huj huk hul hum hun huo hup huq hur huu huw hux huy huz hvc hvk hvn hwa hwo hya hye iai ian iar iba ibb ibd ibe ibg ibh ibl ibm ibn ibo ibr ibu iby ica ich icl icr ida idb idc idd ide idi ido idr ids idt idu ifa ifb ife iff ifk ifm ifu ify igb ige igg igl igm ign igo igw ihi ihp iii ijc ije ijj ijn ijs ike iki ikk ikl iko ikp ikr iks ikt iku ikv ikw ikx ikz ila ilb ile ili ilk ils ilu ilv ima imi iml imn imo imr ims imy ina inb ind inh inj inl inm inn ino inp ins int inz ior iou ipi ipk ipo iqu iqw ire irh iri irk irr iru irx iry isa isc isd ise isg ish isi isk isl ism isn iso isr ist ita itb ite iti itk itl itm ito itr its itt itv itw itx ity itz ium ivb ivv iwk iwm iwo iws ixc ixl iya iyo izh izr jaa jab jad jaf jah jaj jal jao jaq jas jat jau jav jax jay jaz jbe jbj jbk jbo jbr jbt jbu jbw jcs jct jda jdg jdt jeb jee jeh jei jek jel jen jer jet jeu jgb jgk jgo jhi jhs jia jib jic jid jie jig jii jil jio jiq jit jiu jiv jiy jka jko jkp jkr jku jle jls jma jmb jmc jmd jml jmn jmr jmw jmx jna jnd jng jni jnj jnl jns job jod jor jos jow jpn jpr jqr jra jrb jrr jru jsl jua jub juc jud juk jul jum jun juo jup jur jus jut juu juw juy jvd jvn jwi jye jyy kab kac kae kaf kag kai kaj kal kan kap kaq kas kat kau kax kay kaz kba kbc kbd kbe kbh kbi kbj kbk kbm kbo kbq kbr kbs kbu kbw kbx kbz kca kcb kcc kcd kce kcf kcg kch kci kcj kck kcn kco kcp kcq kcr kcs kct kcv kcw kcx kcy kcz kda kdc kdd kde kdf kdg kdh kdi kdj kdl kdm kdn kdp kdq kdr kdt kdu kdw kdx kdy kdz kea keb kec ked kee kef keg keh kei kej kem ken keo kep keq ker kes ket keu kev kex key kez kfa kfc kfd kfe kff kfg kfh kfi kfj kfk kfl kfn kfp kfq kfs kft kfu kfv kfw kfx kfy kfz kga kgb kge kgf kgg kgi kgj kgk kgl kgm kgn kgo kgp kgq kgr kgs kgt kgu kgv kgw kgx kgy kha khb khc khd khe khf khh khj khl khm kho khr khs kht khu khv khw khx khz kia kib kic kid kie kif kig kih kii kij kik kil kin kio kip kiq kir kis kit kiv kiw kix kiy kiz kja kjb kjc kjd kje kjf kjg kjh kji kjk kjm kjn kjo kjq kjr kjs kju kjx kjy kjz kka kkb kkc kkd kke kkf kkg kkh kki kkj kkk kkl kkm kkn kko kkq kkr kkt kku kkv kkw kkx kky kkz kla klb klc kld klf klh kli klk kll kln klo klp klq klr kls klt klu klv klx kly klz kma kmb kmc kme kmg kmh kmj kmk kml kmm kmn kmo kmp kmq kmr kms kmt kmu kmv kmx kmy kmz knb knd kne knf kni knk knl kno knp knq knr kns knu knv knx kny knz koa koc kod koe kof kog koh koi kon koo kop koq kor kos kot kou kov kow koy koz kpa kpb kpc kpd kpe kpf kpg kph kpi kpj kpk kpl kpm kpn kpo kpq kpr kps kpt kpu kpv kpw kpy kpz kqa kqb kqc kqd kqe kqf kqg kqh kqi kqj kqk kql kqm kqn kqo kqp kqq kqr kqs kqt kqu kqv kqw kqx kqy kqz kra krb krc krd kre krf krh kri krj krk krl krn krp kru krv krw krx kry krz ksa ksb ksc kse ksf ksg ksi ksj ksk ksl ksm ksn kso ksp ksq ksr kst ksu ksv ksw ksx ksy ksz kta ktb ktc ktd ktf kth kti ktj ktk ktl ktm ktn kto ktp ktq kts ktt ktv ktw ktx kub kuc kuf kug kuh kuj kuk kul kum kun kuo kup kuq kus kut kuu kuv kuw kux kuy kuz kva kvb kvc kvd kve kvf kvg kvh kvi kvj kvk kvm kvn kvo kvp kvq kvr kvt kvu kvv kvw kvx kvy kvz kwa kwc kwd kwe kwf kwg kwh kwi kwj kwl kwm kwn kwo kwp kwr kws kwt kwu kwv kww kwx kwz kxa kxb kxf kxi kxj kxk kxl kxm kxo kxp kxq kxs kxt kxu kxv kxw kxx kxy kxz kya kyb kyc kyd kye kyf kyg kyh kyi kyj kyk kyl kym kyo kyp kyq kyr kys kyt kyu kyv kyw kyx kyy kyz kza kzb kzc kzd kze kzf kzg kzi kzk kzl kzm kzn kzo kzp kzq kzr kzs kzu kzv kzx kzz lab lac lad lae laf lag lah lai laj lam lan lao laq lar lat lau lav law lax lay laz lbb lbc lbe lbf lbg lbi lbj lbl lbm lbo lbq lbs lbt lbu lbv lbw lbx lbz lcc lcd lce lcf lch lcl lcm lcp lcq lcs ldg ldh ldj ldk ldl ldm ldn ldo ldp ldq lea leb lec led lee lef leh lei lej lek lem leo lep leq ler les let lev lew lex ley lfa lfn lga lgb lgg lgh lgi lgl lgm lgq lgr lgt lgu lgz lhh lhi lhl lhn lhp lhs lht lhu lia lib lic lid lie lif lig lih lij lik lil lin lio lip liq lir lis lit liu liw lix liy liz lja lje lji ljl ljp ljw ljx lka lkb lkc lkd lke lkh lki lkj lkl lkm lkn lko lkr lks lkt lku lky lla llb llc lld llf llg llh lli llk lll llm lln llp llq lls llu llx lma lmb lmc lmd lme lmf lmg lmh lmi lmj lmk lmn lmo lmp lmq lmr lmu lmv lmw lmx lmz lna lnb lnh lni lnl lnm lnn lns lnu lnw loa lob loc loe lof log loh loj lok lol lon loo lop loq lor los lov low lox loz lpa lpe lpn lpo lpx lra lrc lre lrg lri lrk lrl lrm lrn lro lrt lrv lrz lsa lsd lse lsh lsi lsl lsm lso lsp lsr lss lst lsy ltg lti ltn ltu ltz lub luc lud lue luf luj luk lul lum lun lup luq lur lus lut luu luv luz lva lvk lvu lwa lwe lwg lwh lwl lwm lwo lws lwt lwu lww lya lyg lyn lzh lzl lzn lzz maa mab mad mae maf mag mah mai maj mak mal mam man maq mar mas mau mav maw max maz mba mbb mbc mbd mbe mbf mbh mbi mbj mbk mbl mbm mbn mbo mbq mbr mbs mbt mbu mbv mbw mby mbz mca mcb mcc mcd mce mcf mcg mch mci mcj mck mcl mcn mco mcp mcq mcr mcs mcu mcv mcx mcy mcz mda mdb mdd mdf mdg mdi mdj mdk mdl mdm mdn mdp mdq mdr mdt mdu mdv mdw mdx mdz mea med mee mef meh mei mej mek mel mem meo meq mer mes met meu mev mew mez mfa mfb mfc mfd mff mfh mfi mfj mfk mfl mfm mfn mfo mfp mfq mfr mfs mft mfu mfv mfw mfx mfy mfz mgb mgc mgd mge mgf mgh mgj mgk mgl mgm mgn mgo mgp mgq mgr mgs mgt mgu mgv mgw mgy mgz mha mhb mhc mhd mhe mhf mhg mhi mhj mhk mhl mhm mhp mhq mhr mhs mht mhw mhy mia mib mic mid mie mif mig mih mii mik mil mim min mio mip mir mit miu miw mix miy miz mjb mjc mjd mje mji mjj mjk mjl mjm mjo mjp mjq mjr mjs mju mjv mjw mjx mjy mjz mka mkb mkc mkd mke mkf mkg mki mkj mkk mkl mkm mkn mko mkp mkq mkr mks mkt mku mkv mky mkz mlb mle mlf mlg mlh mli mlj mlk mll mlm mln mlo mlp mlq mlr mls mlt mlu mlw mlx mlz mma mmb mmc mmd mme mmf mmg mmh mmi mmj mmk mml mmm mmn mmo mmr mmt mmu mmv mmw mmx mmy mmz mna mnb mnc mnd mne mnf mng mni mnj mnk mnl mnm mnn mnq mns mnu mnw mnx mny mnz moa moc mod moe mog moh moi moj mok mon moo mor mot mou mow mox moy moz mpa mpd mpe mpg mph mpi mpj mpk mpl mpm mpn mpo mpp mpq mpr mps mpt mpu mpv mpw mpy mpz mqb mqc mqe mqf mqg mqh mqi mqj mqk mql mqm mqn mqo mqp mqq mqr mqs mqt mqu mqv mqw mqx mqy mra mrb mrc mrd mre mrf mrg mrh mri mrj mrk mrl mrm mrn mro mrp mrq mrs mru mrw mrz msa msb msc msd mse msf msg msi msk msl msm msn mso msp msq msr mss msu msv msw msx msy msz mta mtb mtc mtd mtg mth mtj mtk mtl mtm mtn mto mtp mtq mtr mts mtt mtu mtv mtx mty mua mub mud mue mug muh mui muj mum muo mup muq mur mus mut muu muv mux muy muz mva mvb mvd mvg mvi mvk mvl mvm mvn mvo mvp mvq mvr mvs mvt mvu mvv mvw mvx mvy mvz mwa mwb mwc mwf mwg mwh mwi mwk mwl mwm mwn mwo mwp mwq mwr mws mwt mwu mwv mwz mxa mxb mxd mxe mxf mxg mxh mxi mxk mxl mxm mxn mxo mxp mxq mxr mxs mxt mxu mxv mxw mxx mxy mxz mya myb myc mye myf myg myh myj myk myl mym myo myp myr mys myu myv myw myy myz mza mzb mzc mzd mze mzg mzh mzi mzj mzk mzl mzm mzn mzo mzp mzq mzr mzs mzt mzu mzv mzw mzx mzy mzz naa nac nae naf nag naj nak nal nam nan nao nap naq nar nau nav naw nax nay naz nba nbb nbd nbe nbg nbh nbi nbk nbm nbn nbo nbp nbq nbr nbs nbt nbu nbv nbw nby nca ncb ncc ncd nce ncf ncg nch nci ncj ncl ncm ncn nco ncr ncs nct ncu ncx ncz nda ndb ndc ndd ndf ndg ndh ndj ndk ndl ndm ndn ndo ndp ndq ndr nds ndt ndu ndv ndw ndx ndy ndz nea nec ned nef neg neh nej nek nem nen neo nep neq ner nes net neu nev nex ney nez nfa nfd nfr nfu nga ngb ngd nge ngg ngi ngj ngl ngm ngn ngo ngp ngs ngu ngv ngw ngx ngy ngz nha nhb nhc nhd nhe nhf nhg nhh nhi nhm nhn nho nhq nhr nht nhu nhv nhw nhy nhz nia nib nid nie nif nii nij nik nil nim nin nio niq nir nis nit niu niw nix niy niz nja njb njh nji njj njl njn njr njs njt nju njx njy njz nka nkb nkc nkd nke nkf nkg nkh nki nkj nkk nkm nkn nko nkp nkq nkr nks nku nkw nkx nkz nla nlc nld nle nlg nli nlj nlk nll nlm nlo nlq nlu nlv nlw nlx nly nlz nma nmb nmc nmd nme nmg nmh nmi nmj nmk nml nmm nmn nmo nmp nmq nmr nms nmt nmu nmv nmw nmy nmz nna nnb nnc nnd nne nnf nng nnh nni nnj nnk nnl nnm nnn nno nnq nnr nnt nnu nnw nny nnz noa nob noc nod noe nof nog noh noi noj nok nol nom non nop noq nor nos not nou nov now noy noz npa npb npl npn npo nps npu npy nqk nql nqm nqn nqo nqq nra nrb nrc nre nrg nri nrk nrl nrm nrn nrp nrr nrt nru nrx nsa nsc nsd nse nsg nsh nsi nsk nsl nsn nsp nsq nsr nss nsu nsv nsw nsx nsy nsz nte ntg nti ntj ntm nto ntp ntr ntu ntw nty nuc nud nue nuf nug nuh nui nul num nun nuo nuq nus nuu nuv nuw nux nuy nuz nvh nvm nvo nwa nwb nwe nwi nwm nwo nwr nwx nwy nxa nxe nxi nxl nxm nxn nxo nxq nxr nxu nxx nyb nyc nye nyf nyg nyk nyl nym nyn nyo nyp nyt nyu nyv nyw nyx nza nzb nzd nzi nzk nzm nzs nzy nzz oaa oac oav obi obl obm obo obr obt obu oca och oci oco oda odk odt odu ofo ofs ofu ogb ogc oge ogg ogo ogu ohu oia oin ojb ojc ojg ojp ojs ojv ojw oka okb okd oke okh oki okj okk okl okn okr oks oku okv okx old ole olm olo olr olt olu oma omc omg omi omk oml omn omo omp omr omt omu omw omx onb one ong oni onj onk onn ono onp onr ons ont onu onw oog oon oor oos opa opk opm opo opt opy ora ore org orh ori orm oro orr ort oru orw orx orz osa osc osi oso osp oss ost osu osx otd ote oti otl otm otn otq otr ots ott otu otw otx oty otz oua oub oue oum ovd owi owl oyb oyd oym oyy ozm pac pad pae paf pag pah pai pak pan pao paq par pas pat pau paw pax pay paz pbb pbc pbe pbf pbg pbl pbm pbn pbo pbp pbr pbs pbv pca pcb pcc pcd pce pcf pcg pch pci pcj pcl pcm pcn pcp pcw pda pdc pdi pdo pdt pdu pea peb pee pef peg peh pei pej pek pel pem pep peq pev pex pey pez pfa pfe pgg pgi pgk pgl pgn pgs pgu pgz pha phd phg phh phk phl phm phn pho phq phr pht phu phv phw pia pib pic pid pie pif pig pih pii pij pil pim pin pio pip pir pis piu piv piw pix piy piz pjt pkg pkh pkn pko pkr pks pkt pku pla plb plc ple plg plh pli plj plk pll pln plo plq plr plv plw ply plz pma pmb pmd pme pmf pmi pmj pmk pmn pmo pmq pmr pmt pmw pmx pmy pmz pna pnb pnc pnd pne png pnh pni pnj pnl pnn pno pnp pnr pns pnu pnv pnx pny poc poe pof pog poh poi pok pol pom pon poo poq por pos pot pow pox poy ppe ppi ppk ppl ppm ppn ppo ppq pps ppt ppu pqa pqm prc pre prf prh pri prk prl prm prn prq prr prt pru prw prx prz psa psc psd pse psg psl psm psn pso psp psq psr pss psw psy pta pth ptn pto ptp ptq ptr ptt ptu ptv ptw pty pub puc pud pue puf pug pui puj pum puo pup puq pur pus put puu pux puy pwa pwb pwg pwi pwm pwn pwr pxm pye pym pyn pys pyu pyy pzn qua quc que qui qun quq quv qvy qwc qwt qxs qya qyp raa rac rad raf rag rah rai raj rak ral ram ran rao raq rar ras rat rau rav raw rax ray raz rbb rbl rcf rdb rea reb ree reg rei rej rel rem ren rer res ret rey rga rgk rgn rgr rgs rgu rhg rhp rif rim rin rir riu rjg rji rjs rka rkb rkh rki rkm rkw rma rmc rmd rme rmf rmg rmh rmi rmk rml rmm rmn rmo rmp rmq rms rmt rmu rmv rmw rmx rmy rmz rng rnl rnn rnp rnw rob roc rod roe rof rog roh rol ron roo rop ror rou row rpn rpt rri rrt rsb rsl rsm rth rtm rtw rub ruc rue ruf rug ruh rui ruk rus rut ruu ruy ruz rwa rwk rwo rxd rxw ryn rys saa sab sad sae saf sag sah saj sak sam san sao saq sar sas sat sau sav saw sax say saz sba sbb sbd sbg sbh sbi sbj sbk sbl sbm sbn sbo sbp sbq sbr sbs sbt sbu sbv sbw sbx sby sbz scb sce scf scg sch sci sck scl scn sco scq scs scu scv scw scx sda sdb sde sdf sdg sdh sdj sdk sdl sdm sdo sdp sdr sds sdu sdx sea sec sed see sef seg seh sei sej sek sel sen seo sep seq ser set seu sev sew sey sez sfm sfs sfw sgc sgd sge sgg sgh sgi sgk sgm sgp sgr sgs sgt sgu sgw sgx sgy sgz sha shb shc shd she shg shj shk shl shm shn sho shp shq shr shs sht shu shv shw shx shy shz sia sib sid sie sif sig sih sii sij sik sil sin sip siq sir sis siu siv siw six siy siz sja sjb sjd sje sjg sjk sjm sjn sjo sjp sjr sjs sjt sju sjw ska skb skc skd skf skh ski skn sko skp skq skr sks skt sku skv skw skx sky skz sld sle slf slg slh slj slk sll slm sln slp slq slr sls slt slu slv slw slx sly slz sma smb smc smd sme smf smg smh smj smk sml smm smn smo smq smr sms smt smu smv smw smx smy smz sna snb snc snd sne snf sni snj snk snl snm snn sno snp snq snr snu snv snw snx sny snz soa sob sod soe sog soi sok sol som sop soq sor sot sou sow sox soy soz spa spb spc spd spg spi spk spl spn spo spr sps spt spu spv spx spy sqa sqh sqi sqk sqm sqn sqo sqq sqs sqt squ sra srb srd sre srf srg srh sri srk srl srm srn srq srr srt sru srw srx sry srz ssb ssc ssd sse ssf ssg ssh ssi ssj ssk ssl ssm ssn sso ssp ssq ssr sss sst ssu ssv ssw ssx ssy ssz stb ste stf stg sth sti stj stk stm stn sto stp sts stt stu stv stw sty sua sub suc sue sug sui suk sun suq sur sus sut suw sux suy suz sva svb svc sve svk svm svs svx swa swb swe swf swg swi swj swl swm swo swp swq swr sws swt swu sww swx swy sxb sxc sxe sxk sxm sxn sxo sxr sxs sxw sya syb syc syi syk syl sym syn syo sys syw syy sza szb szc szd sze szg szl szn szp szw szy taa tac tad tae taf tag tah taj tak tal tam tan tao tap taq tar tas tat tau tav taw tax tay taz tba tbb tbc tbd tbe tbf tbg tbi tbj tbk tbl tbm tbn tbo tbp tbr tbs tbu tbv tbw tbx tby tbz tca tcb tcc tcd tce tcg tch tci tck tcm tco tcp tcq tcs tct tcu tcw tcx tcy tcz tda tdb tdc tdd tde tdf tdg tdh tdi tdj tdk tdl tdm tdn tdo tdq tdr tds tdt tdv tdy tea teb tec ted tee tef teg teh tei tek tel ten tep teq ter tes tet teu tev tex tey tez tfi tfo tfr tft tga tgb tgc tgd tge tgh tgi tgk tgl tgn tgo tgp tgq tgr tgs tgt tgu tgv tgw tgx tgy tha thd the thf thh thi thk thl thn thp thq thr ths tht thu thv thy thz tia tic tif tig tih tii tij tik til tim tin tio tip tiq tir tis tit tiu tiv tiw tix tiy tiz tja tjg tji tjm tjn tjo tjs tju tka tkb tkd tke tkf tkm tkn tkp tkq tkr tkt tku tkv tkw tkx tkz tla tlb tld tlf tlg tlh tli tlj tlk tll tlm tln tlo tlp tlq tlr tls tlu tlv tlx tly tma tmc tmd tme tmf tmg tmi tmj tmk tml tmm tmn tmo tmq tms tmt tmu tmy tmz tna tnb tnc tnd tng tnh tni tnk tnl tnm tnn tno tnp tns tnt tnu tnv tnw tnx tny tnz tob toc tod tof toi toj tol tom ton too top toq tor tos tou tov tow tox toy toz tpa tpc tpe tpf tpg tpi tpj tpk tpl tpm tpn tpo tpp tpq tpr tpt tpu tpv tpx tpy tpz tqb tql tqm tqn tqo tqp tqq tqr tqt tqu tqw tra trb trc trd tre trf trg trh tri trj trl trm trn trq trr trs trt tru trv trw try trz tsa tsb tsc tsd tse tsg tsh tsi tsj tsl tsm tsn tso tsp tsq tsr tss tsu tsv tsw tsx tsy tsz tta ttb ttc ttd tte ttf ttg tth tti ttj ttk ttl ttm ttn tto ttp ttq ttr ttu ttv ttw tty ttz tua tub tuc tud tue tuf tug tuh tui tuj tuk tul tum tun tuo tuq tur tus tuu tuv tux tuy tuz tva tvd tve tvk tvm tvn tvo tvs tvt tvu tvw tvx tvy twa twb twc twg twh twm twn two twp twq twr twt twu tww twy txa txc txe txg txh txi txj txm txn txo txq txr txs txt txu txx tya tyh tyi tyj tyl tyn tyr tyt tyu tyx tyz tza tzh tzj tzl tzm tzn tzo tzx uam uan uar uba ubi ubl ubr ubu uby uda ude udg udi udj udm udu ues ufi uga ugb uge ugn ugy uha uhn uig uis uiv uji uka ukg ukh ukk ukl ukp ukq ukr uku ukw ula ulb ulc ule uli ull ulm uln ulu ulw uma umb umc umd umi umm umn umo ump umr ums umu una und une ung unk unm unn unr unu unx unz upi upv ura urb urc urd ure urf urg urh uri urk url urm urn urp urr urt uru urv urw urx ury urz usa ush usi usk usp usu uta utr utu uum uun uur uuu uve uvh uvl uwa uya uzb vaa vae vag vah vai vaj val vam van vao vap var vas vau vav vbb vec ved vem ven veo vep ver vgr vid vie vif vig vil vis vit viv vka vki vkj vkk vkl vkm vko vkp vkt vku vlp vmc vmd vme vmh vmi vmj vmk vml vmm vmp vmq vmr vmu vmv vmw vmx vmy vmz vnp vol vor vot vra vro vrs vsi vsl vsv vto vum vun vut vwa waa wab wac wad waf wag wah waj wal wan wao wap was wat wav waw wax way waz wba wbb wbe wbf wbh wbj wbk wbl wbm wbp wbq wbr wbv wbw wca wci wdd wdg wdj wdu wdy wea wec wed weh wei wem weo wer wes wet wfg wga wgb wgi wgo wgu wgy whg whk whu wib wic wie wif wih wii wij wik wil wim wir wiu wiy wja wji wka wkb wkl wku wkw wky wla wlc wle wlg wli wlk wll wlm wln wlo wlr wls wlu wlv wlw wlx wly wmb wmc wmd wme wmh wmi wmm wmn wms wmt wmw wmx wnb wnc wnd wne wng wni wnk wnm wno wnp wnu wnw wny wob woc wod woe wog woi wok wol won woo wor wos wow wra wrg wri wrl wrm wrn wrp wrr wrs wru wrv wrw wrx wsa wsi wsk wsr wss wsu wsv wtf wti wtk wtm wtw wua wub wud wuh wul wum wun wur wut wuv wux wuy wwa wwr www wxa wxw wya wyi wyr wyy xaa xab xac xad xae xag xai xaj xal xam xan xao xap xaq xar xat xau xaw xay xbb xbc xbd xbe xbg xbi xbj xbm xbn xbp xbr xbw xcb xcc xce xch xcm xcn xcr xct xcu xcv xcw xcy xdc xdm xdy xed xeg xel xem xep xer xes xet xeu xfa xga xgb xgd xgf xgg xgi xgl xgr xgu xgw xha xhc xhd xhe xho xhr xht xhu xhv xib xii xil xin xir xis xiv xiy xjb xka xkd xke xkf xkg xki xkj xkk xkn xko xkp xkq xkr xks xkt xku xkv xkw xkx xky xla xlb xlc xld xle xli xlo xlp xls xly xmb xmc xmd xmf xmg xmh xmj xmk xml xmm xmo xmp xmq xmr xms xmt xmu xmx xmy xmz xna xnb xng xnh xni xnk xnn xnr xns xnt xnu xny xoc xod xog xoi xok xon xoo xop xor xow xpa xpc xpe xpg xpi xpj xpm xpn xpo xpp xpq xpr xps xpu xqa xqt xra xrb xrd xre xrg xri xrm xrn xrq xrr xrt xru xrw xsa xsd xse xsh xsi xsj xsl xsm xsn xso xsp xsq xsr xss xsu xsv xsy xta xtb xtd xte xth xti xtj xtl xtm xtn xtp xtq xtr xts xtt xtu xtv xtw xty xtz xua xub xud xug xuj xul xum xun xuo xup xur xut xve xvn xvo xvs xwa xwc xwd xwe xwg xwj xwk xwl xwo xwr xxk xxm xxr xxt xya xyb xyl xyt xyy xzh xzm xzp yaa yab yac yad yae yag yai yaj yal yam yan yao yap yaq yar yat yau yav yaw yay yaz yba ybb ybe ybi ybj ybk ybl ybm ybn ybo ybx yby ych ycl ycn ycp yda yde ydg ydk yea yec yee yei yej yer yet yeu yev yey ygi ygl ygm ygp ygr ygu ygw yhd yhl yia yid yif yig yii yij yik yil yim yip yiq yir yis yit yiu yiv yix yiz yka ykg yki ykk ykl ykm ykn yko ykr ykt yku yky yla ylb yle ylg yli yll ylm yln ylo ylr ylu yly ymb ymc ymd yme ymg ymh ymi ymk yml ymm ymo ymp ymq ymr yms ymx ymz yna ynd yne yng ynl ynn yno ynq yns ynu yob yog yoi yol yom yon yor yox yoy ypa ypb ypg yph ypm ypn ypo ypp ypz yra yrb yre yrn yro yrw yry ysd ysg ysl ysn ysp yss ysy yta ytl ytp ytw yty yub yuc yud yue yuf yug yui yuj yuk yul yup yuq yur yut yux yuy yuz yva yvt ywa ywg ywl ywn ywr ywt ywu yww yxa yxg yxm yxu yxy yyz yzg yzk zaa zac zad zae zaf zag zah zai zaj zak zal zao zap zaq zar zas zat zau zav zaw zax zay zaz zbt zca zdj zeg zen zga zgr zha zhb zhi zhn zho zhw zia zib zik zil zim zin zir ziw ziz zka zkb zkk zko zkp zkr zku zkv zkz zma zmb zmc zmd zme zmf zmg zmh zmi zmj zmk zmm zmn zmo zmp zmq zms zmt zmu zmv zmx zmy zmz zna zng znk zns zoc zoh zom zoo zoq zor zos zpa zpb zpc zpd zpe zpf zpg zph zpi zpj zpk zpl zpm zpn zpo zpp zpq zpr zps zpt zpu zpv zpw zpx zpy zpz zrg zro zrs zsa zsk zsl zsr zsu zte ztg ztl ztm ztn ztp ztq zts ztt ztx zty zua zuh zul zum zun zuy zwa zzj`,
}