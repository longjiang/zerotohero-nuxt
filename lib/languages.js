import Papa from 'papaparse'
import axios from 'axios'
import Helper from '@/lib/helper'
import Translators from '@/lib/translators'
import translations from './translations'

export default {
  l1s: [],
  translations,
  youTubeLangs: 'aa ab af akk am ar arc as ase ay az ba be bg bh bi bn bo br brx bs ca cho chr co cop cr cs cy da de-AT de-CH de-DE de doi dz el en-CA en-GB en-IE en-IN en-US en eo es-419 es-ES es-MX es-US es et eu fa-AF fa-IR fa ff fi fil fj fo fr-BE fr-CA fr-CH fr-FR fr fy ga gd gl gn grc gu ha hak-TW hak haw hbo he hi-Latn hi ho hr ht hu hy ia id ie ig ik is it iu iw ja jv ka kk kl km kn ko kok ks ku ky la lad lb ln lo lt lus lv mai mas mg mi mk ml mn-Mong mn mni mo mr ms mt my na nan-TW nan nb ne nl-BE nl-NL nl nn no nv oc om or pa pap pl ps pt-BR pt-PT pt qu rm rn ro ru-Latn ru rw sa sat sc scn sd sdp sg sh si sk sl sm sn so sq sr-Cyrl sr-Latn sr ss st su sv sw ta te tg th ti tk tl tlh tn to tpi tr ts tt tw ug uk ur uz ve vi vo vro wo xh yi yo yue-HK yue zh-CN zh-Hans zh-Hant zh-HK zh-SG zh-TW zh zu'.split(' '),
  liveTVLangs: 'amh ara aze bak ben bos bul cat ces cmn cnr dan deu ell eng est fas fra fry glg heb hin hrv hun hye iku ind isl ita jpn kan kat kaz kin kor kur lao lav lit ltz mal mkd mlt mri nan nep nld nor pan pol por pus ron rus sin slk slv som spa sqi srp swe tam tel tgl tha tur ukr urd vie yue zho'.split(' '),
  async load() {
    console.log('Loading language data...')
    let features = this.loadCSVString(data.features)
    let locales = this.loadCSVString(data.locales)
    let hours = this.loadCSVString(data.hours)
    let countries = await this.loadCSVFile(`${process.env.baseUrl}/data/languages/countries.csv.txt`)
    countries = countries.map((row) => {
      row.languages = row.languages ? row.languages.split(",") : [];
      return row;
    });
    let languages = await this.loadCSVFile(`${process.env.baseUrl}/data/languages/languages.csv.txt`)
    let omniglot = await this.loadCSVFile(`${process.env.baseUrl}/data/languages/omniglot.csv.txt`)
    let dictionaries = this.loadCSVString(data.dictionaries)
    let scripts = await this.loadCSVFile(`${process.env.baseUrl}/data/languages/scripts.csv.txt`)
    let wiktionary_langs = data.wiktionary_langs.split(' ')
    let wiktionary_mapped_langs = data.wiktionary_mapped_langs.split(' ')
    let filteredLanguages = this.filterLanguages(languages, { wiktionary_langs })
    this.l1s = this.constructL1Data(filteredLanguages, { features, locales, scripts, hours, countries, scripts, wiktionary_langs, wiktionary_mapped_langs, dictionaries, omniglot })
    return this
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
  filterLanguages(languages, { wiktionary_langs = [] } = {}) {
    console.log(`Filtering through ${languages.length} languages...`)
    let filteredLanguages = languages.filter(l => {
      if (wiktionary_langs.includes(l['iso639-3'])) return true
      if (l.type === 'L') return true
      if (l.logo) return true
      if (['hbo', 'enm', 'arc', 'grc', 'sjn'].includes(l['iso639-3'])) return true
      if (l['glottologFamilyId'] === 'sino1245') return true
    })
    console.log(`Left with ${filteredLanguages.length} languages...`)
    return filteredLanguages
  },
  constructL1Data(languages, { features = [], locales = [], scripts = [], hours = [], countries = [], wiktionary_langs = [], wiktionary_mapped_langs = [], dictionaries = [], omniglot = [] } = {}) {
    /*
     Goal:
    {
      "code": "af",
      "iso639-1": "af",
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
    console.log('Constructing L1 Data...')
    let l1s = languages.map(language => {
      let additional = {
        code: this.code(language),
        direction: language.direction || 'ltr',
        published: true
      }
      let obj = Object.assign(additional, language)
      if (obj.id) obj.id = Number(obj.id);
      if (obj.lat) obj.lat = Number(obj.lat);
      if (obj.long) obj.long = Number(obj.long);
      if (obj.speakers) obj.speakers = Number(obj.speakers);
      if (obj.otherNames) obj.otherNames = obj.otherNames.split(', ')
      obj.name = this.renameLanguage(language.name)
      obj.country = countries.filter(c => language.country.split(' ').includes(c.alpha2Code))
      return obj
    })
    console.log('Augmenting, adding locales, adding host country locales...')
    for (let l1 of l1s) {
      this.augmentLanguage(l1, { scripts, omniglot, hours })
      this.addLocales(l1, locales)
      this.addHostCountryLocales(l1, locales)
    }
    console.log('Adding identical languages information, assigning dictionaries, loading language feature list...')
    this.addIdenticalLangs(l1s)
    this.assignDictionaries(l1s, { dictionaries, wiktionary_langs, wiktionary_mapped_langs })
    this.loadL1Features(l1s, features)
    console.log('Language-loading finished. 🍺')
    return l1s
  },
  renameLanguage(name) {
    name = name.replace(/ \(.*\)/, '')
    for (let rename of [
      ["Modern ", ""],
      [" Standard", ""],
      ["Yue Chinese", "Cantonese"],
      ['Oriya', 'Odia'],
      ['Eastern Panjabi', 'Punjabi'],
      ['Panjabi', 'Punjabi']
    ]) {
      name = name.replace(rename[0], rename[1])
    }
    return name
  },
  augmentLanguage(l1, { scripts = [], omniglot = [], hours = [] } = {}) {
    l1.translators = {} // This is needed for translators to be added
    l1.apostrophe = ['tlh', 'cy', 'uz', 'br', 'tl', 'ceb', 'hy'].includes(l1.code)
    l1.han = 'cdo cjy cmn cnp cpx csp czo hak hsn ltc lzh mnp nan och wuu yue zho'.split(' ').includes(l1['iso639-3']) || ['leiz1236', 'hain1238'].includes(l1.glottologId)
    l1.continua = l1.han || ['th', 'lo', 'ja', 'km', 'ryu', 'bo', 'my', 'dz'].includes(l1.code)
    l1.scripts = scripts.filter(script => script.lang === l1.code && script.ms !== 'N' && script.p !== 'N' && script.ml !== 'O')
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
  },
  addLocales(l1, locales) {
    let l1Locales = []
    if (l1['iso639-1']) l1Locales = l1Locales.concat(l1.code)
    l1Locales = l1Locales.concat(locales.filter(l => l.code === l1.code).map(l => l.locale))
    if (l1.han) {
      l1Locales = l1Locales.concat([
        'zh',
        'zh-CN',
        'zh-Hans',
        'zh-Hant',
        'zh-SG',
        'zh-TW',
        'zh-HK'])
    }
    l1Locales = Helper.unique(l1Locales)
    l1.locales = l1Locales
  },
  addIdenticalLangs(l1s) {
    let groups = [
      ['ara', 'arb'],
      ['arc', 'syc', 'syr'],
      ['aze', 'azj'],
      ['bul', 'mkd'],
      ['est', 'ekk'],
      ['fas', 'pes', 'prs'],
      ['ful', 'fuv'],
      ['hbs', 'srp', 'bos', 'hrv', 'cnr'],
      ['ins', 'pks', 'wbs'],
      ['kur', 'ckb'],
      ['kpe', 'gkp', 'xpe'], // Kapelle: Guinea and Liberia
      ['lav', 'lvs'],
      ['msa', 'zlm', 'zsm'],
      ['mwr', 'mve', 'rwr'],
      ['nor', 'nob', 'nno'],
      ['nep', 'npi'],
      ['orm', 'gax'],
      ['mlg', 'plt'],
      ['pus', 'pbu'],
      ['sme', 'sma', 'sju', 'sje', 'smj', 'sjk', 'smn', 'sms', 'sia', 'sjd', 'sjt'],
      ['swa', 'swh'],
      ['uzb', 'uzn'],
      ['zho', 'cmn'],
    ]
    for (let group of groups) {
      let languages = group.map(code => l1s.find(l => l['iso639-3'] === code))
      for (let language of languages) {
        if (typeof language !== 'undefined') language.identicalLangs = languages.filter(l => l !== language)
        let localesFromIdenticalLangs = []
        for (let lang of language.identicalLangs) {
          // console.log(lang.name, lang.locales)
          localesFromIdenticalLangs = localesFromIdenticalLangs.concat(lang.locales)
        }
        if (language.locales) language.locales = Helper.unique(language.locales.concat(localesFromIdenticalLangs))
      }
    }

  },
  addHostCountryLocales(l1, locales) {
    let hostCountryLocales = []
    let l1Locales = l1.locales
    if (!this.youTubeLangs.includes(l1Locales[0]) && l1['iso639-3']) {
      if (l1.country && l1.country[0]) {
        let country = l1.country[0]
        if (country.languages && country.languages[0]) {
          let countryPrimaryLanguageCode = country.languages[0]
          let countryPrimaryLanguageLocales = locales.filter(l => l.code === countryPrimaryLanguageCode).map(l => l.locale)
          hostCountryLocales = [countryPrimaryLanguageCode, ...countryPrimaryLanguageLocales]
        }
        if (country.name === "Philippines") hostCountryLocales.push('fil')
        hostCountryLocales = Helper.unique(hostCountryLocales)
      }
    }
    l1.hostCountryLocales = hostCountryLocales
  },
  assignDictionaries(l1s, { dictionaries = [], wiktionary_langs = [], wiktionary_mapped_langs = [] } = {}) {
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
  },
  loadL1Features(l1s, features) {
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
    for (let row of features) {
      let l1 = l1s.find(language => language['iso639-3'] === row.l1)
      l1.features = l1.features || {}
      l1.features[row.l2] = l1.features[row.l2] || []
      for (let key in row) {
        // key = 'home'
        if (key !== 'l1' && key !== 'l2' && row[key] === 'TRUE') {
          l1.features[row.l2].push(key) // key = 'home'
        }
      }
    }
    console.log('Features loaded.')
  },
  translationURL(text, l1, l2) {
    let translator = this.getTranslator(l1, l2)
    if (typeof translator !== 'undefined') {
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
    let youTubeLangs = this.youTubeLangs.filter(l => [l2.code, ...l2.locales, ...l2.hostCountryLocales].includes(l))
    return youTubeLangs.length > 0
  },
  code(language) {
    return language['iso639-1'] || language['iso639-3'] || language['glottologId']
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
azj,az
ceb,fil
ceb,fil-PH
cmn,zh
cmn,zh-CN
cmn,zh-Hans
cmn,zh-Hant
cmn,zh-TW
cmn,zh-SG
ckb,ku
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
gax,om
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
ins,en
ins,en-IN
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
mve,mwr
nan,zh
nan,nan-TW
nan,zh-TW
nan,zh-CN
nan,zh-Hans
nan,zh-Hant
nb,nb-NO
nep,ne
nl,nl-BE
nl,nl-NL
no,nb
no,nb_NO
no,nn
no,nn_NO
nb,nb_NO
nn,nn_NO
pbu,ps
prs,fa
prs,ps
pl,pl-PL
pt,pt-BR
pt,pt-PT
plt,mg
ro,ro-RO
ru,ru-Latn
ru,ru-RU
rwr,mwr
ryu,ja
sk,sk-SK
sr,sr-Cyrl
sr,sr-Latn
sv,sv-SE
swh,sw
th,th-TH
tl,fil
tl,fil-PH
tr,tr-TR
ug,tr
ug,tr-TR
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
zh,zh-TW
zlm,ms`,
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
ltc	eng	hsk-cedict
ltc	zho	hsk-cedict
lzh	eng	hsk-cedict
lzh	zho	hsk-cedict
mnp	eng	hsk-cedict
nan	eng	hsk-cedict
och	eng	hsk-cedict
och	zho	hsk-cedict
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
  wiktionary_langs: `aaa aab aac aad aaf aag aah aai aak aal aan aap aaq aar aas aau aaw aax aaz aba abb abc abd abe abf abg abh abi abj abk abl abm abn abo abp abq abr abs abt abu abv abw abx aby abz aca acb acd ace ach aci ack acl acm acn acp acr acs acu acv acw acx acy acz ada adb add ade adf adg adh adi adj adl adn ado adp adq adr ads adt adu adw ady adz aea aeb aed aee aek ael aem aeq aer aes aeu aew aey aez afb afd afe afg afh afi afk afn afo afp afr afs aft afu afz aga agb agc agd age agf agg agh agi agj agk agl agm agn ago agq agr ags agt agu agv agw agx agy agz aha ahb ahg ahh ahi ahk ahl ahm ahn aho ahp ahr ahs aht aia aib aic aid aie aif aig aih aii aij aik ail aim ain aio aip air ait aiw aix aiy aja ajg aji ajn ajp aju ajw ajz aka akb akc akd ake akf akg akh aki akj akk akl akm ako akp akq akr aks akt aku akv akw akx aky akz ala alc ald ale alf alh ali alj alk all alm alo alp alq alr alt alu alw alx aly alz ama amb amc ame amf amg amh ami amj amk aml amm amn amo amp amq amr ams amt amu amv amw amx amy amz ana anb anc and ane anf ang anh ani anj ank anl anm ann ano anp anq anr ans ant anu anv anw anx any anz aoa aob aoc aod aoe aof aog aoi aoj aok aol aom aon aor aos aot aou aox aoz apb apc apd ape apf apg aph api apj apk apl apm apn apo app apq apr aps apt apu apv apw apx apy apz aqc aqd aqg aqm aqn aqp aqr aqt aqz ara arc ard are arg arh ari arj ark arl arn aro arp arq arr ars aru arv arw arx ary arz asa asb asc ase asf asg ash asi asj ask asl asm asn aso asp asq asr ass ast asu asv asw asx asy asz ata atb atc atd ate atg ati atj atk atl atm ato atp atq atr ats att atu atv atw atx aty atz aua aub auc aud aug auh aui auj auk aul aum aun auo aup auq aur aut auu auw aux auy auz ava avb avd ave avi avk avm avn avo avs avt avu avv awa awb awc awe awg awh awi awk awm awn awo awr aws awt awu awv aww awx awy axb axe axg axk axl axm axx aya ayb ayd aye ayg ayi ayk ayl aym ayn ayo ayp ayq ays ayu ayy ayz aza azd aze azg azm azn azo azt azz baa bab bac bae baf bag bah baj bal bam ban bao bap bar bas bau bav baw bax bay bba bbb bbc bbd bbe bbf bbg bbh bbi bbj bbk bbl bbm bbn bbo bbp bbq bbr bbs bbt bbu bbv bbw bbx bby bca bcb bcd bce bcf bcg bch bci bcj bck bcl bcm bcn bco bcp bcq bcr bcs bcu bcv bcw bcy bcz bda bdb bdc bdd bde bdf bdg bdh bdi bdj bdk bdl bdm bdn bdo bdp bdq bdr bds bdt bdu bdv bdw bdx bdy bdz bea beb bec bed bee bef beg beh bei bej bek bel bem ben beo bep beq bes bet beu bev bew bex bey bez bfa bfb bfc bfd bfe bff bfg bfh bfi bfj bfk bfl bfm bfn bfo bfp bfq bfr bfs bft bfu bfw bfx bfy bfz bga bgb bgc bgd bge bgf bgg bgi bgj bgk bgl bgo bgq bgr bgs bgt bgu bgv bgw bgx bgy bgz bha bhb bhc bhd bhe bhf bhg bhh bhi bhj bhl bhm bhn bho bhp bhq bhs bht bhu bhv bhw bhx bhy bhz bia bib bic bid bie bif big bij bil bim bin bio bip biq bir bis bit biu biv biw bix biy biz bja bjb bjc bje bjf bjg bjh bji bjj bjk bjl bjm bjn bjo bjp bjr bjs bjt bju bjv bjw bjx bjy bjz bka bkc bkd bkf bkh bki bkj bkk bkl bkm bkn bko bkp bkq bkr bks bkt bku bkv bkw bkx bky bkz bla blb blc bld ble blf blg blh bli blj blk bll blm bln blo blp blq blr bls blt blv blw blx bly blz bma bmb bmc bmd bme bmf bmg bmh bmi bmj bmk bml bmn bmo bmp bmq bmr bmt bmu bmv bmw bmx bmz bna bnb bnd bne bnf bng bni bnj bnk bnl bnm bnn bno bnp bnq bnr bns bnu bnv bnw bnx bny bnz boa bob bod boe bof bog boh boi boj bok bol bom bon boo bop boq bor bot bou bov bow box boy boz bpa bpd bpg bph bpi bpj bpk bpl bpm bpn bpo bpp bpq bpr bps bpt bpu bpv bpx bpy bpz bqa bqb bqc bqd bqf bqg bqh bqi bqj bqk bql bqm bqn bqo bqp bqq bqr bqs bqt bqu bqv bqw bqx bqy bqz bra brb brc brd bre brf brg brh bri brj brk brl brm brn bro brp brq brr brs brt bru brv brw brx bry brz bsa bsb bse bsf bsg bsh bsj bsk bsl bsm bsn bso bsp bsq bss bst bsu bsv bsw bsx bsy btc btd bte btf btg bth bti btj btm btn bto btp btq btr bts btt btu btv btw btx bty btz bua bub bud bue buf bug buh bui buj buk bul bum bun buo bup buq bus but buu buv buw bux buy bva bvb bvc bvd bve bvf bvg bvh bvi bvj bvk bvl bvm bvn bvo bvp bvq bvr bvt bvu bvv bvw bvx bvy bvz bwa bwb bwc bwd bwe bwf bwg bwh bwi bwj bwk bwl bwm bwn bwo bwp bwq bwr bws bwt bwu bww bwx bwy bwz bxa bxb bxc bxd bxe bxf bxg bxh bxi bxj bxk bxl bxn bxo bxp bxq bxs bxv bxw bxz bya byb byc byd bye byf byg byh byi byj byk byl bym byn byo byp byq byr byt byv byw byx byz bza bzb bzd bze bzf bzg bzh bzi bzj bzk bzl bzm bzn bzo bzp bzq bzr bzs bzu bzv bzw bzx bzy bzz caa cab cac cad cae caf cag cah caj cak cal cam can cao cap caq car cas cat cav caw cax cay caz cbb cbc cbd cbg cbi cbj cbk cbl cbn cbo cbq cbr cbs cbt cbu cbv cbw cby cca ccc ccd cce ccg cch ccj ccl ccm cco ccp ccr cda cde cdf cdh cdi cdj cdm cdn cdo cdr cds cdy cdz cea ceb ceg cen ces cet cfa cfd cfg cfm cga cgc cgg cgk cha chb chc chd che chf chg chh chj chk chl chm chn cho chp chq chr cht chu chv chw chx chy chz cia cib cic cid cie cih cik cim cin cip cir ciy cja cje cjh cji cjk cjm cjn cjo cjp cjs cjv cjy ckb ckh ckl ckn cko ckq ckr cks ckt cku ckv ckx cky ckz cla clc cld cle clh cli clj clk cll clm clo clt clu clw cly cma cme cmg cmi cml cmm cmn cmo cmr cms cmt cna cnb cnc cng cnh cni cnk cnl cno cns cnt cnu cnw cnx coa cob coc cod coe cof cog coh coj cok col com con coo cop coq cor cos cou cov cow cox coy coz cpa cpb cpc cpi cpn cpo cps cpu cpx cpy cqd cra crb crc crd cre crf crg crh cri crj crk crl crm crn cro crq crr crs crt crv crw cry crz csa csb csc csd cse csf csg csh csi csj csk csl csm csn cso csq csr css cst csw csy csz cta ctc ctd cte ctg cth ctl ctm ctn cto ctp cts ctt ctu ctz cua cub cuc cug cuh cui cuj cuk cul cuo cup cuq cur cut cuu cuv cuw cux cuy cvg cvn cwa cwb cwd cwe cwg cwt cya cyb cym cyo czh czk czn czo czt daa dac dad dae dag dah dai daj dak dal dam dan dao daq dar das dau dav daw daz dba dbb dbd dbe dbf dbg dbi dbj dbl dbm dbn dbo dbp dbq dbr dbt dbu dbv dbw dby dcc dcr dda ddd dde ddg ddi ddj ddn ddo ddr dds ddw dec ded dee def deg deh dei dek dem den dep der des deu dev dez dga dgb dgc dgd dge dgg dgh dgi dgk dgn dgo dgr dgs dgt dgw dgx dgz dhg dhi dhl dhm dhn dho dhr dhs dhu dhv dhw dhx dia dib dic did dif dig dii dij dik dil dim din dio dip dir dis diu div diw dix diy diz dja djb djc djd dje djf dji djj djk djl djm djn djo djr dju djw dka dkk dkr dks dkx dlg dlk dlm dln dma dmb dmc dmd dme dmf dmg dmk dml dmm dmo dmr dms dmu dmv dmw dmx dmy dna dnd dne dng dni dnj dnk dnn dno dnr dnt dnu dnv dnw dny doa dob doc doe dof doh doi dok dol don doo dop doq dor dos dot dov dow dox doy doz dpp drb drc drd drg dri drl drn dro drq drs dru dry dsb dse dsh dsi dsl dsn dso dsq dta dtb dtd dth dti dtk dtm dto dtp dtr dts dtt dtu dty dua dub duc due duf dug duh dui duk dul dum dun duo dup duq dur dus duu duv duw dux duy duz dva dwa dwr dwu dww dwy dwz dya dyb dyd dyg dyi dym dyn dyo dyu dyy dza dzg dzl dzn dzo ebg ebk ebr ebu ecr ecs ecy eee efa efe efi ega egl ego egy ehu eip eit eiv eja eka eke ekg eki ekl ekm eko ekp ekr eky ele elh eli elk ell elm elo elu elx ema emb eme emg emi emk emm emn emp ems emu emw emx emy ena enb enc end enf eng enh enl enm enn eno enq enr enu env enw enx eot epi epo era erg erh eri erk ero err ers ert erw ese esh esi esk esl esm esn eso esq ess est esu esy etb etc eth etn eto etr ets ett etu etx etz eus eve evh evn ewe ewo ext eya eyo eza eze faa fab fad faf fag fah fai faj fak fal fam fan fao fap far fas fau fax fay faz fbl fcs fer ffi fgr fia fie fij fin fip fir fit fiw fkk fkv fla flh fli fll fln flr fly fmp fmu fng fni fod foi fom fon for fos fpe fqs fra frd frm fro frp frq frr frt fry fse fsl fss fud fuj ful fum fun fur fut fuu fuy fvr fwa fwe gaa gab gac gad gae gaf gag gah gai gaj gak gal gam gan gao gap gaq gar gas gat gau gaw gay gba gbb gbd gbe gbf gbg gbh gbi gbj gbk gbl gbm gbn gbo gbp gbq gbr gbs gbu gbv gbw gbx gby gcc gcd gce gcf gcl gcn gcr gct gdb gdc gdd gde gdf gdg gdh gdi gdj gdk gdl gdm gdn gdo gdq gdr gds gdt gdu gdx gea geb gec ged geg geh gei gej gek gel geq ges gev gew gex gey gez gfk gft gga ggb ggd gge ggg ggk ggl ggn ggt ggu gha ghe ghh ghk ghl ghn gho ghr ghs ght gia gib gid gie gig gih gil gim gin gio gip giq gir gis git giu giw gix giy giz gji gjk gjm gjn gka gkd gke gkn gko gkp gla glc gld gle glg glh glj glk glo glr glv glw gly gma gmd gmg gmh gml gmm gmn gmu gmv gmx gmy gmz gna gnb gnc gnd gne gng gnh gni gnj gnk gnl gnm gnn gnq gnr gnt gnu gnw gnz goa gob goc god goe gof goh goi goj gol gon goo gop goq gor got gou gow gox goy goz gpa gpn gqa gqi gqn gqr gqu gra grb grc grd grg grh gri grj grm grn gro grq grr grs grt gru grv grw grx gry grz gse gsg gsm gsn gso gsp gss gsw gta gtu gua gub guc gud gue guf gug guh gui guj guk gul gum gun guo gup guq gur gus gut guu guv guw gux guz gva gvc gve gvf gvj gvl gvn gvo gvp gvr gvs gvy gwa gwb gwc gwd gwe gwf gwg gwi gwj gwm gwn gwr gwt gwu gww gwx gxx gya gyb gyd gye gyf gyg gyi gyl gym gyn gyo gyr gyy gza gzn haa hab hac had haf hag hah hai haj hak hal ham hao hap har has hat hau hav haw hax hay haz hba hbb hbn hbs hbu hca hch hdn hds hdy hea heb hed heg heh hei hem her hgm hgw hhi hhr hhy hia hib hid hif hig hih hii hij hik hil hin hio hir hit hiw hix hji hka hke hkk hkn hks hla hlb hld hle hlt hma hmb hmc hmd hme hmf hmg hmh hmi hmj hmk hml hmm hmo hmp hmq hmr hms hmt hmu hmv hmw hmy hmz hna hnd hne hnh hni hnj hnn hno hns hnu hoa hob hoc hod hoe hoh hoi hoj hol hom hoo hop hor hos hot hov how hoy hoz hpo hps hra hrc hre hrk hrm hro hrp hrt hru hrw hrx hrz hsb hsh hsl hsn hss hti hto hts htu hub huc hud huf hug huh hui huj huk hul hum hun huo hup huq hur hus huu huv huw hux huy huz hvc hvk hvn hwa hwc hwo hya hye iai ian iar iba ibb ibd ibe ibg ibh ibl ibm ibn ibo ibr ibu iby ica ich icl icr ida idb idc idd ide idi ido idr ids idt idu ifa ifb ife iff ifk ifm ifu ify igb ige igg igl igm ign igo igs igw ihb ihi ihp iii ijc ije ijj ijn ijs ike iki ikk ikl iko ikp ikr iks ikt iku ikv ikw ikx ikz ila ilb ile ilg ili ilk ill ilo ils ilu ilv ima imi iml imn imo imr ims imy ina inb ind ing inh inj inl inm inn ino inp ins int inz ior iou iow ipi ipk ipo iqu iqw ire irh iri irk irn irr iru irx iry isa isc isd ise isg ish isi isk isl ism isn iso isr ist isu ita itb itd ite iti itk itl itm ito itr its itt itv itw itx ity itz ium ivb ivv iwk iwm iwo iws ixc ixl iyo iyx izh izi izr izz jaa jab jac jad jae jaf jah jaj jal jam jan jao jaq jas jat jau jav jax jay jaz jbj jbk jbn jbo jbr jbt jbu jbw jcs jct jda jdg jdt jeb jee jeg jeh jei jek jel jen jer jet jeu jgb jgk jgo jhi jhs jia jib jic jid jie jig jih jii jil jim jio jiq jit jiu jiv jiy jje jjr jka jko jkr jku jle jls jma jmb jmc jmd jmi jml jmn jmr jmw jmx jna jnd jng jni jnj jnl jns job jod jor jos jow jpn jpr jqr jra jrb jrr jru jsl jua jub juc jud juh jui juk jul jum jun juo jup jur jus jut juu juw juy jvd jvn jwi jyy kaa kab kac kad kae kaf kag kah kai kaj kak kal kam kan kao kap kaq kas kat kau kaw kax kay kaz kba kbb kbc kbd kbe kbh kbi kbj kbk kbm kbn kbo kbp kbq kbr kbs kbt kbu kbv kbw kbx kbz kca kcb kcc kcd kce kcf kcg kch kci kcj kck kcl kcm kcn kco kcp kcq kcr kcs kct kcu kcv kcw kcx kcy kcz kda kdc kdd kde kdf kdg kdh kdi kdj kdk kdl kdm kdn kdp kdq kdr kdt kdu kdv kdw kdx kdy kdz kea keb kec ked kee kef keg keh kei kej kek kel kem ken keo kep keq ker kes ket keu kev kew kex key kez kfa kfb kfc kfd kfe kff kfg kfh kfi kfj kfk kfl kfn kfo kfp kfq kfr kfs kft kfu kfv kfw kfx kfy kfz kga kgb kgd kge kgf kgg kgi kgj kgk kgl kgm kgn kgo kgp kgq kgr kgs kgt kgu kgv kgw kgx kgy kha khb khc khd khe khf khh khj khl khm khn kho khp khq khr khs kht khu khv khw khx khy khz kia kib kic kid kie kif kig kih kii kij kik kil kim kin kio kip kiq kir kis kit kiv kiw kix kiy kiz kja kjb kjc kjd kje kjf kjg kjh kji kjj kjk kjm kjn kjo kjp kjq kjr kjs kjt kju kjx kjy kjz kka kkb kkc kkd kke kkf kkg kkh kki kkj kkk kkl kkm kkn kko kkp kkq kkr kks kkt kku kkv kkw kkx kky kkz kla klb klc kld kle klf klg klh kli klj klk kll klm kln klo klp klq klr kls klt klu klv klw klx kly klz kma kmb kmc kmd kme kmf kmg kmh kmi kmj kmk kml kmn kmo kmp kmq kmr kms kmt kmu kmv kmw kmx kmz kna knb knd kne knf kni knj knk knl knm kno knp knq knr kns knt knu knv knx kny knz koa koc kod koe kof kog koh koi kok kol kon koo kop koq kor kos kot kou kov kow koy koz kpa kpb kpc kpd kpe kpf kpg kph kpi kpj kpk kpl kpm kpn kpo kpp kpq kpr kps kpt kpu kpv kpw kpx kpy kpz kqa kqb kqc kqd kqe kqf kqg kqh kqi kqj kqk kql kqm kqn kqo kqp kqq kqr kqs kqt kqu kqv kqw kqx kqy kqz kra krb krc krd kre krf krh kri krj krk krl krn krp krr kru krv krw krx kry krz ksa ksb ksc ksd kse ksf ksg ksi ksj ksk ksl ksm ksn kso ksp ksq ksr kss kst ksu ksv ksw ksx ksy ksz kta ktb ktc ktd ktf ktg kth kti ktj ktk ktl ktm ktn kto ktp ktq ktr kts ktt ktu ktv ktw ktx kty ktz kua kub kuc kud kue kuf kug kuh kui kuj kuk kul kum kun kuo kuq kus kut kuu kuv kuw kux kuy kuz kva kvb kvc kvd kve kvf kvg kvh kvi kvj kvk kvl kvm kvn kvo kvp kvq kvr kvt kvu kvv kvw kvx kvy kvz kwa kwb kwc kwd kwe kwf kwg kwh kwi kwj kwk kwl kwm kwn kwo kwp kwq kwr kws kwt kwu kwv kww kwx kwz kxa kxb kxc kxd kxe kxf kxh kxi kxj kxk kxl kxm kxn kxo kxp kxq kxr kxs kxt kxu kxv kxw kxx kxy kxz kya kyb kyc kyd kye kyf kyg kyh kyi kyj kyk kyl kym kyn kyo kyp kyq kyr kys kyt kyu kyv kyw kyx kyy kyz kza kzb kzc kzd kze kzf kzg kzh kzi kzj kzk kzl kzm kzn kzo kzp kzq kzr kzs kzt kzu kzv kzw kzx kzy kzz laa lab lac lad lae laf lag lah lai laj lak lam lan lao lap laq lar las lat lau lav law lax lay laz lbb lbc lbe lbf lbg lbi lbj lbk lbl lbm lbn lbo lbq lbr lbs lbt lbu lbv lbw lbx lby lbz lcc lcd lce lcf lch lcl lcm lcp lcq lcs lda ldb ldd ldg ldh ldj ldk ldl ldm ldn ldo ldp ldq lea leb lec led lee lef leh lei lej lek lel lem len leo lep leq ler les let leu lev lew lex ley lez lfa lfn lga lgb lgg lgh lgi lgk lgl lgm lgn lgq lgr lgt lgu lgz lha lhh lhi lhl lhn lhp lhs lht lhu lia lib lic lid lie lif lig lih lii lij lik lil lim lin lio lip liq lir lis list lit liu liv liw lix liy liz lja lje lji ljl ljp ljw ljx lka lkb lkc lkd lke lkh lki lkj lkl lkm lkn lko lkr lks lkt lku lky lla llb llc lld lle llf llg llh lli llj llk lll llm lln llo llp llq lls llu llx lma lmb lmc lmd lme lmf lmg lmh lmi lmj lmk lml lmn lmo lmp lmq lmr lmu lmv lmw lmx lmy lmz lna lnb lnd lnh lni lnj lnl lnm lnn lno lns lnu lnw loa lob loc lod loe lof log loh loi loj lok lol lom lon loo lop loq lor los lot lou lov low lox loz lpa lpe lpn lpo lpx lra lrc lre lrg lri lrk lrl lrm lrn lro lrr lrt lrv lrz lsa lsd lse lsh lsi lsl lsm lso lsp lsr lst lsy ltc ltg lti ltn lto lts ltu ltz lua lub luc lud lue luf lug lui luj luk lul lum lun luo lup luq lur lus lut luu luv luy luz lva lvi lvk lvu lwa lwe lwg lwh lwl lwm lwo lws lwt lwu lww lya lyg lyn lzh lzl lzn lzz maa mab mad mae maf mag mah mai maj mak mal mam man maq mar mas mat mau mav maw max maz mba mbb mbc mbd mbe mbf mbh mbi mbj mbk mbl mbm mbn mbo mbp mbq mbr mbs mbt mbu mbv mbw mbx mby mbz mca mcb mcc mcd mce mcf mcg mch mci mcj mck mcl mcm mcn mco mcp mcq mcr mcs mcu mcv mcw mcx mcy mcz mda mdb mdc mdd mdf mdg mdh mdi mdj mdk mdl mdm mdn mdp mdq mdr mds mdt mdu mdv mdw mdx mdy mdz mea meb mec med mee mef meg meh mei mej mek mel mem men meo mep meq mer mes met meu mev mew mey mez mfa mfb mfc mfd mfe mff mfg mfh mfi mfj mfk mfl mfm mfn mfo mfp mfq mfr mfs mft mfu mfv mfw mfx mfy mfz mga mgb mgc mgd mge mgf mgg mgh mgi mgj mgk mgl mgm mgn mgo mgp mgq mgr mgs mgt mgu mgv mgw mgy mgz mha mhb mhc mhd mhe mhf mhg mhi mhj mhk mhl mhm mhn mho mhp mhq mhr mhs mht mhu mhw mhx mhy mhz mia mib mic mid mie mif mig mih mii mij mik mil mim min mio mip miq mir mit miu miw mix miy miz mjb mjc mjd mje mjg mji mjj mjk mjl mjm mjn mjo mjp mjq mjr mjs mjt mju mjv mjw mjx mjy mjz mka mkb mkc mkd mke mkf mkg mki mkj mkk mkl mkm mkn mko mkp mkq mkr mks mkt mku mkv mkx mky mkz mla mlb mlc mle mlf mlg mlh mli mlj mlk mll mlm mln mlo mlp mlq mlr mls mlt mlu mlv mlw mlx mlz mma mmb mmc mmd mme mmf mmg mmh mmi mmj mmk mml mmm mmn mmo mmp mmq mmr mmt mmu mmv mmw mmx mmy mmz mna mnb mnc mnd mne mnf mng mnh mni mnj mnk mnl mnm mnn mnp mnr mns mnt mnu mnv mnw mnx mny mnz moa moc mod moe mog moh moi moj mok mom mon moo mop moq mor mos mot mou mow mox moy moz mpa mpb mpc mpd mpe mpg mph mpi mpj mpk mpl mpm mpn mpo mpp mpq mpr mps mpt mpu mpv mpw mpx mpy mpz mqa mqb mqc mqe mqf mqg mqh mqi mqj mqk mql mqm mqn mqo mqp mqr mqs mqu mqv mqw mqx mqy mqz mra mrb mrc mrd mre mrf mrg mrh mri mrj mrk mrl mrm mrn mro mrp mrq mrr mrs mrt mru mrv mrw mrx mry mrz msa msb msc msd mse msf msg msi msj msk msl msm msn mso msp msq msr mss msu msv msw msx msy msz mta mtb mtc mtd mte mtf mtg mth mti mtj mtk mtl mtm mtn mto mtp mtq mtr mts mtt mtu mtv mtw mtx mty mua mub muc mud mue mug muh mui muj mul mum muo mup muq mur mus mut muu muv mux muy muz mva mvb mvd mvg mvh mvi mvk mvl mvm mvn mvo mvp mvq mvr mvs mvt mvu mvv mvw mvx mvy mvz mwa mwb mwc mwe mwf mwg mwh mwi mwk mwl mwm mwn mwo mwp mwq mwr mws mwt mwu mwv mww mwz mxa mxb mxd mxe mxf mxg mxh mxi mxj mxk mxl mxm mxn mxo mxp mxq mxr mxs mxt mxu mxw mxx mxy mxz mya myb myc myf myg myh myj myk myl mym myo myp myr mys myu myv myw myx myy myz mza mzb mzc mzd mze mzg mzh mzi mzj mzk mzl mzm mzn mzo mzp mzq mzr mzs mzu mzv mzw mzx mzy mzz naa nab nac nae naf nag nah naj nak nal nam nan nao nap naq nar nas nat nau nav naw nax nay naz nba nbb nbc nbd nbe nbg nbh nbi nbj nbk nbl nbm nbn nbo nbp nbq nbr nbs nbt nbu nbv nbw nby nca ncb ncc ncd nce ncf ncg nch nci ncj nck ncl ncm ncn nco ncr ncs nct ncu ncx ncz nda ndb ndc ndd nde ndf ndg ndh ndi ndj ndk ndl ndm ndn ndo ndp ndq ndr nds ndt ndu ndv ndw ndx ndy ndz nea neb nec ned nee nef neg neh nej nek nem nen neo nep neq ner nes net neu nev new nex ney nez nfa nfd nfl nfr nfu nga ngb ngc ngd nge ngg ngh ngi ngj ngk ngl ngm ngn ngo ngp ngq ngr ngs ngt ngu ngv ngw ngx ngy ngz nha nhb nhc nhd nhe nhf nhg nhh nhi nhk nhm nhn nho nhp nhq nhr nht nhu nhv nhw nhx nhy nhz nia nib nid nie nif nig nih nii nij nik nil nim nin nio niq nir nis nit niu niv niw nix niy niz nja njb njh nji njj njl njm njn njo njr njs njt nju njx njy njz nka nkb nkc nkd nke nkf nkg nkh nki nkj nkk nkm nkn nko nkp nkq nkr nks nkt nku nkw nkx nkz nla nlc nld nle nlg nli nlj nlk nll nlm nlo nlq nlu nlv nlw nlx nly nlz nma nmb nmc nmd nmf nmg nmh nmi nmj nmk nml nmm nmn nmo nmp nmq nmr nms nmt nmu nmv nmw nmy nmz nna nnb nnc nnd nne nnf nng nnh nni nnj nnk nnl nnm nnn nno nnp nnq nnr nnt nnv nnw nnx nny nnz noa nob noc nod noe nof nog noh noi noj nok nol nom non nop noq nor nos not nou nov now noy noz npa npb npg nph npl npn npo nps npu npy nqg nqk nql nqm nqn nqo nqq nqy nra nrb nrc nre nrf nrg nri nrk nrl nrm nrn nrp nrr nrt nru nrx nrz nsa nsb nsc nsd nse nsg nsh nsi nsk nsl nsm nsn nso nsp nsq nsr nss nst nsu nsv nsw nsx nsy nsz ntd nte ntg nti ntj ntk ntm nto ntp ntr nts ntu ntw ntx nty nua nuc nud nue nuf nug nuh nui nuj nuk nul num nun nuo nup nuq nur nus nut nuu nuv nuw nux nuy nuz nvh nvm nvo nwa nwb nwc nwe nwi nwm nwo nwr nwx nwy nxa nxd nxe nxg nxi nxl nxm nxn nxo nxq nxr nxu nxx nya nyb nyc nyd nye nyf nyg nyh nyi nyj nyk nyl nym nyn nyo nyp nys nyt nyu nyv nyw nyx nyy nza nzb nzd nzi nzk nzm nzs nzu nzy nzz oaa oac oav obi obk obl obm obo obr obt obu oca och oci oco ocu oda odk odt odu ofo ofs ofu ogb ogc oge ogg ogo ogu ohu oia oin ojb ojc ojg oji ojp ojs ojv ojw oka okb okd oke okg okh oki okj okk okl okm okn oko okr oks oku okv okx old ole olm olo olr olt olu oma omb omc omg omi omk oml omn omo omp omr omt omu omw omx ona onb one ong oni onj onk onn ono onp onr ons ont onu onw onx ood oog oon oor oos opa opk opm opo opt opy ora ore org orh ori orm oro orr ort oru orv orw orx orz osa osc osi oso osp oss ost osu osx ota otd ote oti otk otl otm otn otq otr ots ott otu otw otx oty oua oub oue oui oum ovd owi owl oyb oyd oym oyy ozm pab pac pad pae paf pag pah pai pak pal pam pan pao pap paq par pas pat pau pav paw pax pay paz pbb pbc pbe pbf pbg pbh pbi pbl pbm pbn pbo pbp pbr pbs pbv pby pca pcb pcc pcd pce pcf pcg pch pci pcj pck pcl pcm pcn pcp pcw pda pdc pdi pdn pdo pdt pdu pea peb ped pee pef peg peh pei pej pek pel pem peo peq pev pex pey pez pfa pfe pga pgd pgg pgi pgk pgl pgn pgs pgu pgz pha phd phg phh phk phl phm phn pho phq phr pht phu phv phw pia pib pic pid pie pif pig pih pii pil pim pin pio pip pir pis pit piu piv piw pix piy piz pjt pka pkb pkc pkg pkh pkn pko pkp pkr pks pkt pku pla plb plc ple plg plh pli plj plk pll pln plo plq plr pls plu plv plw ply plz pma pmb pmd pme pmf pmh pmi pmj pmk pml pmm pmn pmo pmq pmr pms pmt pmu pmw pmx pmy pmz pna pnb pnc pnd pne png pnh pni pnj pnk pnl pnm pnn pno pnp pnq pnr pns pnt pnu pnv pnw pnx pny pnz poc poe pof pog poh poi pok pol pom pon poo pop poq por pos pot pov pow pox poy ppa ppe ppi ppk ppl ppm ppn ppo ppq pps ppt ppu pqa pqm prc pre prf prg prh pri prk prl prm prn pro prq prr prt pru prw prx prz psa psc psd pse psg psh psi psl psm psn pso psp psq psr pss psu psw psy pta pth pti ptn pto ptp ptq ptr ptt ptu ptv ptw pty pua pub puc pud pue puf pug pui puj pum puo pup puq pur pus put puu puw pux puy pwa pwb pwg pwi pwm pwn pwo pwr pww pxm pye pym pyn pys pyu pyx pyy pzn qua quc que qui qum qun quq quv qvy qwc qwm qwt qxs qya qyp raa rab rac rad raf rag rah rai raj rak ral ram ran rao rap raq rar ras rat rau rav raw rax ray raz rbb rbk rbl rcf rdb rea reb ree reg rei rej rel rem ren rer res ret rey rga rge rgk rgn rgr rgs rgu rhg rhp ria rif ril rim rin rir rit riu rjg rji rjs rka rkb rkh rki rkm rkt rkw rma rmb rmc rmd rme rmf rmg rmh rmi rmk rml rmm rmn rmo rmp rmq rms rmt rmu rmv rmw rmx rmy rmz rnd rng rnl rnn rnp rnw rob roc rod roe rof rog roh rol rom ron roo rop ror rou row rpn rpt rri rro rrt rsb rsl rsm rtc rth rtm rtw rub ruc rue ruf rug ruh rui ruk ruo rup ruq rus rut ruu ruy ruz rwa rwk rwm rwo rxd rxw ryn rys ryu rzh saa sab sac sad sae saf sag sah saj sak sam san sao saq sar sas sat sau sav saw sax say saz sba sbb sbc sbd sbe sbf sbg sbh sbi sbj sbk sbl sbm sbn sbo sbp sbq sbr sbt sbu sbv sbw sbx sby sbz scb sce scf scg sch sci sck scl scn sco scp scq scs scu scv scw scx sda sdb sdc sde sdf sdg sdh sdj sdk sdl sdm sdn sdo sdp sdr sds sdu sdx sea sec sed see sef seg seh sei sej sek sel sen seo sep seq ser ses set seu sev sew sey sez sfb sfm sfs sfw sga sgb sgc sgd sge sgg sgh sgi sgk sgm sgp sgr sgs sgt sgu sgw sgx sgy sgz sha shb shc shd she shg shh shi shj shk shl shm shn sho shp shq shr shs sht shu shv shw shx shy shz sia sib sid sie sif sig sih sii sij sik sil sim sin sip siq sir sis siu siv siw six siy siz sja sjb sjd sje sjg sjk sjl sjm sjn sjo sjp sjr sjs sjt sju sjw ska skb skc skd ske skf skh ski skj skk skm skn sko skp skq skr sks skt sku skv skw skx sky skz slc sld sle slf slg slh slj slk sll slm sln slp slq slr sls slt slu slv slw slx sly slz sma smb smc smd sme smf smg smh smj smk sml smm smn smo smp smq smr sms smt smu smv smw smx smy smz sna snb snc snd sne snf sng sni snj snk snl snm snn sno snp snq snr sns snu snv snw snx sny snz soa sob soc sod soe sog soh soi sok sol som soo sop soq sor sos sot sou sov sow sox soz spa spb spc spd spe spg spi spk spl spm spn spo spp spr sps spt spu spv spx spy sqa sqh sqi sqk sqm sqn sqo sqq sqr sqs sqt squ sra srb srd sre srf srg srh sri srk srl srm srn srq srr srs srt sru srv srw srx sry srz ssb ssc ssd sse ssf ssg ssh ssi ssj ssl ssm ssn sso ssp ssq ssr sss sst ssu ssv ssw ssx ssy ssz stb std ste stf stg sth sti stj stk stm stn sto stp stq str sts stt stu stv stw sty sua sub suc sue sug sui suk sun suq sur sus sut suv suw sux suy suz sva svb svc sve svk svm svs svx swa swb swe swf swg swi swj swl swm swn swo swp swq swr sws swt swu sww swx swy sxb sxc sxe sxg sxk sxl sxm sxn sxo sxr sxs sxw sya syb syc syi syk sym syn syo sys syw syx syy sza szb szc szd sze szg szl szn szp szv szw szy taa tab tac tad tae taf tag tah taj tak tal tam tan tao taq tar tas tat tau tav taw tax tay taz tba tbb tbc tbd tbe tbf tbg tbh tbi tbj tbk tbl tbm tbn tbo tbp tbr tbs tbt tbu tbv tbw tbx tby tbz tca tcb tcc tcd tce tcf tcg tch tci tck tcl tcm tco tcp tcq tcs tcu tcw tcx tcy tcz tda tdb tdc tdd tde tdf tdg tdh tdi tdj tdk tdl tdm tdn tdo tdq tdr tds tdt tdu tdv tdy tea teb tec ted tee tef teg teh tei tek tel tem ten teo tep teq ter tes tet teu tev tew tex tey tez tfi tfn tfo tfr tft tga tgb tgc tgd tge tgf tgh tgi tgk tgl tgn tgo tgp tgq tgr tgs tgt tgu tgv tgw tgx tgy tha thc thd the thf thh thi thk thl thm thn thp thq thr ths tht thu thy thz tic tif tig tih tii tij tik til tim tin tio tip tiq tir tis tit tiu tiv tiw tix tiy tiz tja tjg tji tjl tjm tjn tjs tju tjw tka tkb tkd tke tkf tkl tkm tkn tkp tkq tkr tks tkt tku tkv tkw tkx tkz tla tlb tlc tld tlf tlg tlh tli tlj tlk tll tlm tln tlo tlp tlq tlr tls tlt tlu tlv tlx tly tma tmb tmc tmd tme tmf tmg tmh tmi tmj tmk tml tmm tmn tmo tmp tmq tms tmt tmu tmv tmy tmz tna tnb tnc tnd tne tng tnh tni tnk tnl tnm tnn tno tnp tnq tnr tns tnt tnu tnv tnw tnx tny tnz tob toc tod tof tog toh toi toj tol tom ton too top toq tor tos tou tov tow tox toy toz tpa tpc tpe tpf tpg tpi tpj tpk tpl tpm tpn tpo tpp tpq tpr tpt tpu tpv tpw tpx tpy tpz tqb tql tqm tqn tqo tqp tqq tqr tqt tqu tqw tra trb trc trd tre trf trg trh tri trj trl trm trn tro trp trq trr trs trt tru trv trw trx try trz tsa tsb tsc tsd tse tsf tsg tsh tsi tsj tsl tsm tsn tso tsp tsq tsr tss tsu tsv tsw tsx tsy tsz tta ttb ttc ttd tte ttf ttg tth tti ttj ttk ttl ttm ttn tto ttp ttr tts ttt ttu ttv ttw tty ttz tua tub tuc tud tue tuf tug tuh tui tuj tuk tul tum tun tuo tuq tur tus tuu tuv tux tuy tuz tva tvd tve tvk tvl tvm tvn tvo tvs tvt tvu tvw tvx tvy twa twb twc twe twf twg twh twm twn two twp twq twr twt twu tww twy txa txb txc txe txg txh txi txj txm txn txo txq txr txs txt txu txx tya tye tyh tyi tyj tyl tyn typ tyr tys tyt tyu tyv tyx tyz tza tzh tzj tzl tzm tzn tzo tzx uam uan uar uba ubi ubl ubr ubu uby uda ude udg udi udj udl udm udu ues ufi uga ugb uge ugn ugo ugy uha uhn uig uis uiv uji uka ukg ukh ukk ukl ukp ukq ukr uks uku ukw uky ula ulb ulc ule ulf uli ulk ull ulm uln ulu ulw uma umb umc umd umg umi umm umn umo ump umr ums umu una und une ung unk unm unn unr unu unx unz uok upi upv ura urb urc urd ure urf urg urh uri urk url urm urn uro urp urr urt uru urv urw urx ury urz usa ush usi usk usp uss usu uta ute uth utp utr utu uum uun uur uuu uve uvh uvl uwa uya uzb vaa vae vag vah vai vaj val vam van vao vap var vas vau vav vay vbb vbk vec ved vem ven veo vep ver vgr vgt vic vid vie vif vig vil vis vit viv vka vki vkj vkk vkl vkm vko vkp vkt vku vlp vls vma vmb vmc vmd vme vmf vmg vmh vmi vmk vml vmm vmp vmq vmr vmu vmv vmw vmx vmy vmz vnk vnm vnp vol vor vot vra vro vrs vrt vsi vsl vsv vto vum vun vut vwa waa wab wac wad waf wag wah waj wal wam wan wao wap waq war was wat wau wav waw wax way waz wba wbb wbe wbf wbh wbi wbj wbk wbl wbm wbp wbq wbr wbt wbv wbw wca wci wdd wdg wdj wdu wdy wea wec wed weh wei wem weo wer wes wet weu wew wfg wga wgb wgi wgo wgu wgy wha whg whk whu wib wic wie wif wig wih wii wij wik wil wim win wir wiu wiv wiy wja wji wka wkb wkd wkl wku wkw wky wla wlc wle wlg wli wlk wll wlm wln wlo wlr wls wlu wlv wlw wlx wly wmb wmc wmd wme wmh wmi wmm wmn wmo wms wmt wmw wmx wnb wnc wnd wne wni wnk wnm wno wnp wnu wnw wny woa wob woc wod woe wog woi wok wol wom won woo wor wos wow wpc wra wrb wrg wrh wri wrk wrl wrm wrn wro wrp wrr wrs wru wrv wrw wrx wrz wsa wsi wsk wsr wss wsu wsv wtf wth wti wtk wtm wtw wua wub wud wuh wul wum wun wur wut wuu wuv wux wuy wwa wwo wwr www wxa wxw wya wyb wyi wym wyr wyy xaa xab xac xad xae xag xai xaj xak xal xam xan xao xap xaq xar xas xat xau xav xaw xay xbb xbc xbd xbe xbg xbi xbj xbm xbn xbo xbp xbr xbw xby xcb xcc xce xch xcl xcm xcn xco xcr xct xcu xcv xcw xcy xda xdc xdk xdm xdy xeb xed xeg xel xem xep xer xes xet xeu xfa xga xgb xgd xgf xgg xgi xgl xgm xgr xgu xgw xha xhc xhd xhe xho xhr xht xhu xhv xib xii xil xin xir xis xiv xiy xjb xka xkb xkc xkd xke xkf xkg xki xkj xkk xkl xkn xko xkp xkq xkr xks xkt xku xkv xkw xkx xky xkz xla xlb xlc xld xle xlg xli xlo xlp xls xlu xly xmb xmc xmd xmf xmg xmh xmj xmk xml xmm xmo xmp xmq xmr xms xmt xmu xmx xmy xmz xna xnb xng xnh xni xnk xnn xnr xns xnt xnu xny xoc xod xog xoi xok xom xon xoo xop xor xow xpa xpb xpc xpd xpe xpf xpg xph xpi xpj xpk xpl xpm xpn xpo xpp xpq xpr xps xpu xpv xpw xpx xpy xpz xqa xqt xra xrb xrd xrg xrm xrn xrq xrr xrt xru xrw xsa xsb xsd xse xsh xsi xsl xsm xsn xso xsp xsq xsr xss xsu xsv xsy xta xtb xtc xtd xte xth xti xtj xtl xtm xtn xto xtp xtq xtr xts xtt xtu xtv xtw xty xtz xua xub xud xug xuj xul xum xun xuo xup xur xut xuu xve xvn xvo xvs xwa xwc xwd xwe xwg xwj xwk xwl xwo xwr xww xxb xxk xxm xxr xxt xya xyb xyl xyt xyy xzh xzm xzp yaa yab yac yad yae yaf yag yah yai yaj yak yal yam yan yao yap yaq yar yas yat yau yav yaw yay yaz yba ybb ybe ybh ybi ybj ybk ybl ybm ybn ybo ybx yby ych ycl ycn ycp yda yde ydg ydk yea yec yee yei yej yen yer yes yet yeu yev yey ygi ygl ygm ygp ygr ygs ygu ygw yha yhl yia yid yif yig yii yij yik yil yim yin yip yir yis yit yiu yiv yix yiy yiz yka ykg yki ykk ykl ykm ykn yko ykr ykt yku yky yla ylb yle ylg yli yll ylm yln ylo ylr ylu yly ymb ymc ymd yme ymg ymh ymk yml ymm ymn ymo ymp ymq ymr ymx ymz yna ynd yne yng ynk ynl ynn yno ynq yns ynu yob yog yoi yol yom yon yor yox yoy ypa ypb ypg yph ypm ypn ypo ypp ypz yra yrb yre yri yrk yrl yrn yro yrw yry ysc ysd ysg ysl ysn yso ysp ysr yss ysy yta ytl ytp ytw yty yua yub yuc yue yuf yug yui yuj yuk yul yum yun yup yuq yur yut yuw yux yuy yuz yva yvt ywa ywg ywl ywn ywq ywr ywt ywu yww yxa yxg yxl yxm yxu yxy yyu yyz yzg yzk zaa zab zac zad zae zaf zag zah zai zaj zak zal zam zao zap zaq zar zas zat zau zav zaw zax zay zaz zbt zca zdj zea zeg zen zga zgh zgr zha zhb zhi zhn zho zhw zia zib zik zil zim zin zir ziw ziz zka zkb zkh zkk zko zkp zkr zkt zku zkz zma zmb zmc zmd zme zmf zmg zmh zmi zmj zmk zml zmm zmn zmo zmp zmq zmr zms zmt zmu zmv zmw zmx zmy zmz zna zne zng znk zns zoc zoh zom zoo zoq zor zos zpa zpb zpc zpd zpe zpf zpg zph zpi zpj zpk zpl zpm zpn zpo zpp zpr zps zpt zpu zpv zpw zpx zpy zpz zra zrg zrn zro zrs zsa zsk zsl zsr zsu zte ztg ztl ztm ztn ztp ztq zts ztt ztu ztx zty zua zuh zul zum zun zuy zwa zyp zza zzj`
}