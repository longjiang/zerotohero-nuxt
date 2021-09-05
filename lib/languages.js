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
    let filteredLanguages = languages.filter(l => {
      if (wiktionary_langs.includes(l['iso639-3'])) return true
      if (l.type === 'L') return true
      if (l.logo) return true
      if (['hbo', 'enm', 'arc', 'grc', 'sjn'].includes(l['iso639-3'])) return true
      if (l['glottologFamilyId'] === 'sino1245') return true
    })
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
      obj.name = this.renameLanguage(language.name)
      obj.country = countries.filter(c => language.country.split(' ').includes(c.alpha2Code))
      return obj
    })
    for (let l1 of l1s) {
      this.augmentLanguage(l1, { scripts, omniglot, hours })
      this.addLocales(l1, locales)
      this.addIdenticalLangs(l1s)
      this.addHostCountryLocales(l1, locales)
    }
    this.assignDictionaries(l1s, { dictionaries, wiktionary_langs, wiktionary_mapped_langs })
    this.loadL1Features(l1s, features)
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
    l1.han = 'cdo cjy cmn cnp cpx csp czo hak hsn lzh mnp nan wuu yue zho'.split(' ').includes(l1['iso639-3']) || ['leiz1236', 'hain1238'].includes(l1.glottologId)
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
    let l1Locales = locales.filter(l => l.code === l1.code).map(l => l.locale)
    l1Locales = l1Locales.concat(l1.code)
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
      ['zho', 'cmn'],
      ['est', 'ekk'],
      ['hbs', 'srp', 'bos', 'hrv', 'cnr']
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