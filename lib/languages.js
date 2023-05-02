import Papa from "papaparse";
import axios from "axios";
import Helper from "@/lib/helper";
import Translators from "@/lib/translators";
import translations from "./translations";
import hoursCSV from "@/static/data/languages/hours.csv.txt";
import localesCSV from "@/static/data/languages/locales.csv.txt";
import countriesCSV from "@/static/data/languages/countries.csv.txt";
import commonLanguagesCSV from "@/static/data/languages/common-languages.csv.txt";
import dictionariesCSV from "@/static/data/languages/dictionaries.csv.txt";

export default {
  fullyLoaded: false, // Whether the full list of thousands of languages are loaded (set by loadFull())
  l1s: [],
  translations,
  youTubeLangs: "aa ab af akk am ar arc as ase ay az ba be bg bh bi bn bo br brx bs ca cho chr co cop cr cs cy da de-AT de-CH de-DE de doi dz el en-CA en-GB en-IE en-IN en-US en eo es-419 es-ES es-MX es-US es et eu fa-AF fa-IR fa ff fi fil fj fo fr-BE fr-CA fr-CH fr-FR fr fy ga gd gl gn grc gu ha hak-TW hak haw hbo he hi-Latn hi ho hr ht hu hy ia id ie ig ik is it iu iw ja jv ka kk kl km kn ko kok ks ku ky la lad lb ln lo lt lus lv mai mas mg mi mk ml mn-Mong mn mni mo mr ms mt my na nan-TW nan nb ne nl-BE nl-NL nl nn no nv oc om or pa pap pl ps pt-BR pt-PT pt qu rm rn ro ru-Latn ru rw sa sat sc scn sd sdp sg sh si sk sl sm sn so sq sr-Cyrl sr-Latn sr ss st su sv sw ta te tg th ti tk tl tlh tn to tpi tr ts tt tw ug uk ur uz ve vi vo vro wo xh yi yo yue-HK yue zh-CN zh-Hans zh-Hant zh-HK zh-SG zh-TW zh zu".split(
    " "
  ),
  liveTVLangs: "amh ara aze bak ben bos bul cat ces cmn cnr dan deu ell eng est fas fra fry glg heb hin hrv hun hye iku ind isl ita jpn kan kat kaz kin kor kur lao lav lit ltz mal mkd mlt mri nan nep nld nor pan pol por pus ron rus sin slk slv som spa sqi srp swe tam tel tgl tha tur ukr urd vie yue zho".split(
    " "
  ),
  contentLangs: "zho eng kor deu ita jpn fra spa cat rus vie tur yue ukr nld ara nor ell swe cmn hin pol nan fas ase ind por tha hun kat ron srp tgl msa wol tam epo heb slk hrv cym hye ben guj bul dan isl mar ces kaz mon lav tlh glg est bre lit lat mkd aze fin sun pan cnr lzh ins tel hbs sqi urd bel bod gle mya asm kan uzb hak mri mlt arb mal ltz ckb grc gla ami lao khm tat fao san que yor nsl smo sin som jav kur slv bak afr amh ceb kir fsl eus fry hbo wuu bos oci snd kac swa yid nep non tir orm prs srm sco gsw crh mxv pes roh mlg bho scn hil kvk nav cop got hsn ina krl lin nob abk nno ryu xho sah uig zha zul aib cpx grn hni mnp pus sli tgk zzj ang csb hau ojp sme ain cjy kal lad acu arc dsb dzo glv iii ksw ltc sux ybe akk aou awa aym fur hne kab kpe mai mhx nqo acf bsk byq czo gan gkp goh ibo ipk min mni och ori pis pms srd ssw vec vol xpe zzj arz enm jam kok lkt osc sjn tsd".split(
    " "
  ),
  commonLangs: [],
  scriptsIndex: {},
  omniglotIndex: {},
  featureCache: {},
  countries: [],
  async load() {
    console.log("🤟 Languages: Loading languages...");
    let features = this.loadCSVString(data.features);
    let locales = this.loadCSVString(data.locales);
    let hours = this.loadCSVString(data.hours);
    let dictionaries = this.loadCSVString(data.dictionaries);
    let wiktionary_mapped_langs = Object.keys(data.wiktionary_mappings);
    let countries = this.loadCSVString(data.countries);
    this.countries = countries.map(country => {
      country.languages = country.languages ? country.languages.split(",") : [];
      return country;
    });
    let commonLanguages = this.loadCSVString(data.commonLanguages);
    for (let language of commonLanguages) {
      language.scripts = JSON.parse(language.scripts)
    }
    this.commonLangs = commonLanguages.map(l => l.code)
    this.l1s = this.constructL1Data(commonLanguages, {
      features,
      countries,
      locales,
      hours,
      wiktionary_mapped_langs,
      dictionaries
    });
    return this;
  },
  async loadFull(limitToCodes = undefined) {
    if (!this.fullyLoaded) {
      console.log("🤟 Loading all language data...");
      // let server = "https://server.chinesezerotohero.com"; // Use DreamHost
      let server = process.env.baseUrl // Use Vercel
      let features = this.loadCSVString(data.features);
      let locales = this.loadCSVString(data.locales);
      let hours = this.loadCSVString(data.hours);
      let [countries, languages, omniglot, scripts] = await Promise.all([
        this.loadCSVFile(`${server}/data/languages/countries.csv.txt`),
        this.loadCSVFile(`${server}/data/languages/languages.csv.txt`),
        this.loadCSVFile(`${server}/data/languages/omniglot.csv.txt`),
        this.loadCSVFile(`${server}/data/languages/scripts.csv.txt`)
      ]);
      for (let script of scripts) {
        if (!Array.isArray(this.scriptsIndex[script.lang]))
          this.scriptsIndex[script.lang] = [];
        if (script.ms !== "N") this.scriptsIndex[script.lang].push(script);
      }
      for (let o of omniglot) {
        this.omniglotIndex[o["iso639-3"]] = o;
      }
      countries = countries.map(country => {
        country.languages = country.languages ? country.languages.split(",") : [];
        return country;
      });
      if (typeof limitToCodes !== "undefined" && limitToCodes[0]) {
        limitToCodes.push("en");
        languages = languages.filter(
          l =>
            limitToCodes.includes(l["iso639-1"]) ||
            limitToCodes.includes(l["iso639-3"])
        );
      }
      let dictionaries = this.loadCSVString(data.dictionaries);
      let wiktionary_mapped_langs = Object.keys(data.wiktionary_mappings);

      let filteredLanguages = this.filterLanguages(languages);
      this.l1s = this.constructL1Data(filteredLanguages, {
        features,
        locales,
        scripts,
        hours,
        countries,
        scripts,
        wiktionary_mapped_langs,
        dictionaries,
        omniglot
      });
      this.fullyLoaded = true
    }
    return this;
  },
  async loadCSVFile(url) {
    let res = await axios.get(url);
    if (res && res.data) {
      let parsed = this.loadCSVString(res.data)
      res = null;
      return parsed;
    }
  },
  loadCSVString(csv, header = true) {
    if (typeof Papa !== "undefined") {
      let r = Papa.parse(csv, {
        header: header
      });
      return r.data;
    }
  },
  countryFromCode(code) {
    let country = this.countries.find(c => c.alpha2Code === code)
    if (country) {
      return country
    }
  },
  filterLanguages(languages) {
    let filteredLanguages = languages.filter(l => {
      if (l.wiktionary) return true;
      if (l.type === "L") return true;
      if (l.logo) return true;
      if (["hbo", "enm", "arc", "grc", "sjn"].includes(l["iso639-3"]))
        return true;
      if (l["glottologFamilyId"] === "sino1245") return true;
    });
    return filteredLanguages;
  },
  constructL1Data(
    languages,
    {
      features = [],
      locales = [],
      hours = [],
      countries = [],
      wiktionary_mapped_langs = [],
      dictionaries = [],
    } = {}
  ) {
    /*
     Goal:
    {
      "code": "af",
      "iso639-1": "af",
      "iso639-3": "afr",
      "name": "Afrikaans",
      "direction": 'ltr',
      "dictionaries": {
        "eng": ["freedict"] // means we have a dictionary with L1 as Afrikaans and L2 as English
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
    let countryIndex = {};
    for (let country of countries) {
      countryIndex[country.alpha2Code] = country;
    }
    let l1s = languages.map(language => {
      let additional = {
        code: this.code(language),
        direction: language.direction || "ltr",
        published: true
      };
      let obj = Object.assign(additional, language);
      if (obj.id) obj.id = Number(obj.id);
      if (obj.lat) obj.lat = Number(obj.lat);
      if (obj.long) obj.long = Number(obj.long);
      if (obj.speakers) obj.speakers = Number(obj.speakers);
      if (obj.wiktionary) obj.wiktionary = Number(obj.wiktionary);
      obj.otherNames = obj.otherNames ? obj.otherNames.split(",") : [];
      obj.name = this.renameLanguage(language.name);
      let countryCodes = language.country.split(" ");
      obj.country = countryCodes
        .map(alpha2Code => countryIndex[alpha2Code])
        .filter(alpha2Code => alpha2Code);
      return obj;
    });
    for (let l1 of l1s) this.augmentLanguage(l1, { hours });
    for (let l1 of l1s) this.addLocales(l1, locales);
    for (let l1 of l1s) this.addHostCountryLocales(l1, locales);
    this.addIdenticalLangs(l1s);
    this.assignDictionaries(l1s, { dictionaries, wiktionary_mapped_langs });
    this.loadL1Features(l1s, features);
    console.log("🤟 Languages: loaded.");
    return l1s;
  },
  exportCSV() {
    let languages = this.l1s.filter(obj =>
      this.contentLangs.includes(obj["iso639-3"])
    );
    let csv = Papa.unparse(
      languages.map(item => {
        let obj = Object.assign({}, item);
        delete obj.published;
        if (obj.country)
          obj.country = obj.country.map(c => c.alpha2Code).join(" ");
        if (obj.scripts) obj.scripts = JSON.stringify(obj.scripts);
        delete obj.translators;
        return obj;
      })
    );
    return csv;
  },
  renameLanguage(name) {
    name = name.replace(/ \(.*\)/, "");
    for (let rename of [
      ["Modern ", ""],
      [" Standard", ""],
      ["Yue Chinese", "Cantonese"],
      ["Oriya", "Odia"],
      ["Eastern Panjabi", "Punjabi"],
      ["Panjabi", "Punjabi"]
    ]) {
      name = name.replace(rename[0], rename[1]);
    }
    return name;
  },
  augmentLanguage(l1, { hours = [] } = {}) {
    // l1.translators = {}; // This is needed for translators to be added
    l1.apostrophe = ["tlh", "cy", "uz", "br", "tl", "ceb", "hy"].includes(
      l1.code
    );
    l1.han =
      [
        "cdo",
        "cjy",
        "cmn",
        "cnp",
        "cpx",
        "csp",
        "czo",
        "hak",
        "hsn",
        "ltc",
        "lzh",
        "mnp",
        "nan",
        "och",
        "wuu",
        "yue",
        "zho"
      ].includes(l1["iso639-3"]) ||
      ["leiz1236", "hain1238"].includes(l1.glottologId);
    l1.continua =
      l1.han ||
      ["th", "lo", "ja", "km", "ryu", "bo", "my", "dz", "soa"].includes(
        l1.code
      );
    l1.scripts = l1.scripts || this.scriptsIndex[l1.code] || [];
    if (l1.scripts[0]) l1.direction = l1.scripts[0].direction;
    let l1Omniglot = this.omniglotIndex[l1["iso639-3"]];
    if (l1Omniglot) {
      l1.omniglot = l1Omniglot.url;
    }
    let l1hours = hours.find(item => item["iso639-3"] === l1["iso639-3"]);

    if (l1hours) {
      l1.hours = Number(l1hours.hours);
    } else {
      l1.hours = 1100
    }
    if (this.translations[l1["iso639-3"]])
      l1.translations = this.translations[l1["iso639-3"]];
    l1.agglutinative = this.isAgglutinative(l1);
  },
  isAgglutinative(l1) {
    // https://en.wikipedia.org/wiki/Agglutinative_language
    if (
      [
        "abkh1242", // https://en.wikipedia.org/wiki/Northwest_Caucasian_languages
        "algo1256", // https://en.wikipedia.org/wiki/Algonquian_languages
        "arau1255", // https://en.wikipedia.org/wiki/Araucanian_languages
        "araw1281", // https://en.wikipedia.org/wiki/Arawakan_languages
        "atha1247", // https://en.wikipedia.org/wiki/Athabaskan_languages
        "aust1307", // https://en.wikipedia.org/wiki/Austronesian_languages
        "ayma1253", // https://en.wikipedia.org/wiki/Aymaran_languages
        "azte1234", // https://en.wikipedia.org/wiki/Nahuatl
        "berb1260", // https://en.wikipedia.org/wiki/Berber_languages
        "drav1251", // https://en.wikipedia.org/wiki/Dravidian_languages
        "eski1264", // https://en.wikipedia.org/wiki/Eskimo%E2%80%93Aleut_languages
        "iroq1247", // https://en.wikipedia.org/wiki/Iroquoian_languages
        "kart1248", // https://en.wikipedia.org/wiki/Kartvelian_languages
        "kass1244", // https://en.wikipedia.org/wiki/Kassite_language
        "mong1329", // https://en.wikipedia.org/wiki/Mongolic_languages
        "mund1335", // https://en.wikipedia.org/wiki/Munda_languages
        "musk1252", // https://en.wikipedia.org/wiki/Muskogean_languages
        "nakh1245", // https://en.wikipedia.org/wiki/Northeast_Caucasian_languages
        "narr1281", // https://en.wikipedia.org/wiki/Bantu_languages
        "quec1387", // https://en.wikipedia.org/wiki/Quechuan_languages
        "sali1255", // https://en.wikipedia.org/wiki/Salishan_languages
        "siou1252", // https://en.wikipedia.org/wiki/Siouan_languages
        "tung1282", // https://en.wikipedia.org/wiki/Tungusic_languages
        "tupi1275", // https://en.wikipedia.org/wiki/Tupian_languages
        "turk1311", // https://en.wikipedia.org/wiki/Turkic_languages
        "ural1272" // https://en.wikipedia.org/wiki/Uralic_languages
      ].includes(l1.glottologFamilyId)
    )
      return true;
    if (
      [
        "akk", // https://en.wikipedia.org/wiki/Akkadian_language
        "bod", // https://en.wikipedia.org/wiki/Lhasa_Tibetan
        "cnh", // https://en.wikipedia.org/wiki/Hakha_Chin_language
        "elx", // https://en.wikipedia.org/wiki/Elamite_language
        "eus", // https://en.wikipedia.org/wiki/Basque_language
        "hus", // https://en.wikipedia.org/wiki/Huastec_language
        "jpn",
        "kor",
        "lus", // https://en.wikipedia.org/wiki/Mizo_language
        "sux", // https://en.wikipedia.org/wiki/Sumerian_language
        "xct", // https://en.wikipedia.org/wiki/Classical_Tibetan
        "xht", // https://en.wikipedia.org/wiki/Hattic_language
        "yuc" // https://en.wikipedia.org/wiki/Yuchi_language
      ].includes(l1["iso639-3"])
    )
      return true;
    return false;
  },
  addLocales(l1, locales) {
    let l1Locales = [];
    if (l1["iso639-1"]) l1Locales = l1Locales.concat(l1.code);
    l1Locales = l1Locales.concat(
      locales.filter(l => l.code === l1.code).map(l => l.locale)
    );
    if (l1.han) {
      l1Locales = l1Locales.concat([
        "zh",
        "zh-CN",
        "zh-Hans",
        "zh-Hant",
        "zh-SG",
        "zh-TW",
        "zh-HK"
      ]);
    }
    l1Locales = Helper.unique(l1Locales);
    l1.locales = l1Locales;
  },
  /**
   * This function takes an array of language objects and adds an array of
   * identical languages and locales to each language object. Identical languages
   * are languages that are very similar or considered the same in some contexts.
   *
   * @param {Array} l1s - An array of language objects.
   */
  addIdenticalLangs(l1s) {
    // Define an array of language groups. Each group contains ISO 639-3 codes
    // of identical or closely related languages.
    let groups = [
      ["ara", "arb"],
      ["arc", "syc", "syr"],
      ["aze", "azj"],
      ["bul", "mkd"],
      ["est", "ekk"],
      ["fas", "pes", "prs"],
      ["ful", "fuv"],
      ["hbs", "srp", "bos", "hrv", "cnr"],
      ["ins", "pks", "wbs"],
      ["kur", "ckb"],
      ["kpe", "gkp", "xpe"], // Kapelle: Guinea and Liberia
      ["lav", "lvs"],
      ["msa", "zlm", "zsm"],
      ["mwr", "mve", "rwr"],
      ["nor", "nob", "nno"],
      ["nep", "npi"],
      ["orm", "gax"],
      ["ori", "ory"],
      ["mlg", "plt"],
      ["pus", "pbu"],
      [
        "sme",
        "sma",
        "sju",
        "sje",
        "smj",
        "sjk",
        "smn",
        "sms",
        "sia",
        "sjd",
        "sjt"
      ],
      ["swa", "swh"],
      ["uzb", "uzn"],
      ["zho", "cmn"]
    ];
    for (let group of groups) {
      let languages = group
        .map(code => l1s.find(l => l["iso639-3"] === code))
        .filter(l => l);
  
      for (let language of languages) {
        // Create an array of identical languages' codes without the current language.
        let identicalLangsCodes = languages
          .filter(l => l !== language)
          .map(l => l["iso639-3"]);
  
        let localesFromIdenticalLangs = [];
        for (let lang of languages.filter(l => l !== language)) {
          localesFromIdenticalLangs = localesFromIdenticalLangs.concat(lang.locales);
        }
  
        if (language.locales && language["iso639-3"] === group[0]) {
          language.locales = Helper.unique(
            language.locales.concat(localesFromIdenticalLangs)
          );
        }
  
        // Add the identical languages' codes to the current language object.
        language.identicalLangs = identicalLangsCodes;
      }
    }
  },
  addHostCountryLocales(l1, locales) {
    let hostCountryLocales = [];
    let l1Locales = l1.locales;
    if (!this.youTubeLangs.includes(l1Locales[0]) && l1["iso639-3"]) {
      if (l1.country && l1.country[0]) {
        for (let country of l1.country) {
          if (country.languages && country.languages[0]) {
            let countryPrimaryLanguageCode = country.languages[0];
            let countryPrimaryLanguageLocales = locales
              .filter(l => l.code === countryPrimaryLanguageCode)
              .map(l => l.locale);
            hostCountryLocales = hostCountryLocales.concat([
              countryPrimaryLanguageCode,
              ...countryPrimaryLanguageLocales
            ]);
          }
          if (country.name === "Philippines") hostCountryLocales.push("fil");
          if (l1.code === "gv") hostCountryLocales = ["ga"]; // Manx uses Irish
        }
      }
    } else {
      // Make room for special cases, such as when Wolof is being subbed in French
      let specialCases = {
        wo: ["fr"]
      };
      let specialCaseL2Codes = specialCases[l1Locales[0]];
      if (specialCaseL2Codes) {
        for (let countryPrimaryLanguageCode of specialCaseL2Codes) {
          let countryPrimaryLanguageLocales = locales
            .filter(l => l.code === countryPrimaryLanguageCode)
            .map(l => l.locale);
          hostCountryLocales = hostCountryLocales.concat([
            countryPrimaryLanguageCode,
            ...countryPrimaryLanguageLocales
          ]);
        }
      }
    }
    hostCountryLocales = Helper.unique(hostCountryLocales);
    l1.hostCountryLocales = hostCountryLocales;
  },
  assignDictionaries(
    l1s,
    { dictionaries = [], wiktionary_mapped_langs = [] } = {}
  ) {
    for (let dictionary of dictionaries) {
      let l1 = l1s.find(language => language["iso639-3"] === dictionary.l1);
      if (typeof l1 !== "undefined") {
        l1.dictionaries = l1.dictionaries || {};
        l1.dictionaries[dictionary.l2] = l1.dictionaries[dictionary.l2] || [];
        l1.dictionaries[dictionary.l2].push(dictionary.dictionary); // "freedict"
      }
    }
    for (let l1 in data.wiktionary_langs) {
      let wiktionary_langs = data.wiktionary_langs[l1];
      let all_wiktionary_langs = wiktionary_langs.concat(wiktionary_mapped_langs);
      let l1_object = l1s.find(l => l['iso639-3'] === l1);
      for (let lang of all_wiktionary_langs) {
        l1_object.dictionaries[lang] = l1_object.dictionaries[lang] || [];
        l1_object.dictionaries[lang].push("wiktionary-csv");
      }
      if (l1 === "eng") {
        l1_object.dictionaries["leiz1236"] = ["hsk-cedict"];
        l1_object.dictionaries["hain1238"] = ["hsk-cedict"];
      }
    }
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
    for (let row of features) {
      let l1 = l1s.find(language => language["iso639-3"] === row.l1);
      if (l1) {
        l1.features = l1.features || {};
        l1.features[row.l2] = l1.features[row.l2] || [];
        for (let key in row) {
          // key = 'home'
          if (key !== "l1" && key !== "l2" && row[key] === "TRUE") {
            l1.features[row.l2].push(key); // key = 'home'
          }
        }
      }
    }
  },
  translationURL(text, l1, l2) {
    let translator = this.getTranslator(l1, l2);
    if (typeof translator !== "undefined") {
      return translator.getTranslationURL(text, l1, l2);
    }
  },
  getTranslator(l1, l2) {
    // if (typeof l1.translators[l2.code] === "undefined") {
    //   l1.translators[l2.code] = Translators.get(l1, l2);
    // }
    // return l1.translators[l2.code];
    return Translators.get(l1, l2);
  },
  get(iso639_3) {
    if (iso639_3)
      return this.l1s.find(language => language["iso639-3"] === iso639_3);
  },
  getById(id) {
    return this.l1s.find(l1 => l1.id === Number(id));
  },
  getSmart(code) {
    return this.l1s.find(
      language =>
        language["iso639-1"] === code ||
        language["iso639-3"] === code ||
        language["glottologId"] === code
    );
  },
  hasFeature(l1, l2, feature) {
    let features = this.getFeatures(
      {
        l1,
        l2
      },
      process.browser
    );
    let hasFeature = features.includes(feature);
    return hasFeature;
  },
  hasYouTube(l1, l2) {
    // l1.code = 'ceb', l2.code = 'en' -> yes, becuase we can find English YouTube videos, with sub translated in cebuano
    // l1.code = 'en', l2.code = 'ceb' -> no, because we can't FIND cebuano subtitlted YouTube videos
    if (l2.code === "ceb") return true;
    if (l2.code === "crh") return true;
    if (l2.code === "lzh") return true; // Literary Chinese
    if (l2.code === "cmn") return true; // Mandarin
    let youTubeLangs = this.youTubeLangs.filter(l =>
      [l2.code, ...l2.locales, ...l2.hostCountryLocales].includes(l)
    );
    return youTubeLangs.length > 0;
  },
  code(language) {
    return (
      language["iso639-1"] || language["iso639-3"] || language["glottologId"]
    );
  },
  checkSpeech(l2, browser) {
    if (!browser) return;
    let speechSynthesis = window?.speechSynthesis;
    if (!speechSynthesis) return
    let speechCodes = [l2.code];
    let additionalCodes = {
      ms: ["id", "id-ID"],
      yue: ["zh-HK"]
    };
    for (let c in additionalCodes) {
      if (l2.code === c) {
        speechCodes = speechCodes.concat(additionalCodes[c]);
      }
    }
    if (l2.locales) speechCodes = speechCodes.concat(l2.locales);
    if (l2.han && !["yue", "zh"].includes(l2.code)) speechCodes = [l2.code]; // So that 'wuu', 'hak' does not get Mandarin speech
    let voices = speechSynthesis
      .getVoices()
      .filter(voice => speechCodes.includes(voice.lang));
    if (voices.length > 0) {
      return true;
    }
  },
  getFeatures({ l1, l2 }, browser) {
    if (!this.featureCache[l1.code]) this.featureCache[l1.code] = {};
    if (this.featureCache[l2["iso639-3"]]) {
      if (
        !this.featureCache[l2["iso639-3"]].includes("speech") &&
        this.checkSpeech(l2, browser)
      )
        this.featureCache[l2["iso639-3"]].push("speech");
      return this.featureCache[l2["iso639-3"]];
    }
    let features =
      l1.features && l1.features[l2["iso639-3"]]
        ? [].concat(l1.features[l2["iso639-3"]])
        : [];
    if (
      l1.dictionaries &&
      l1.dictionaries[l2["iso639-3"] || l2["glottologId"]]
    ) {
      if (!features.includes("dictionary")) features.push("dictionary");
    }
    if (this.hasYouTube(l1, l2)) {
      if (!features.includes("youtube")) features.push("youtube");
    }
    if (this.liveTVLangs.includes(l2["iso639-3"])) features.push("live-tv");
    if (
      l2.scripts &&
      l2.scripts.length > 0 &&
      l2.scripts[0].script !== "Latn" &&
      l2.scripts[0].script !== "Zzzz"
    ) {
      if (!features.includes("transliteration"))
        features.push("transliteration");
    }
    if (l2.han && !features.includes("transliteration"))
      features.push("transliteration");
    if (l2.omniglot) {
      if (!features.includes("omniglot")) features.push("omniglot");
    }
    if (!features.includes("speech") && this.checkSpeech(l2, browser))
      features.push("speech");
    this.featureCache[l2["iso639-3"]] = features;
    return features;
  },
  logo(code) {
    if (code === "en") {
      return `/img/ezh-icon.png`;
    } else if (code === "zh") {
      return `/img/czh-icon.png`;
    } else {
      return `/img/logo-square/${code}.jpeg`;
    }
  },
  isDescendant(child, ancestor) {
    let parent = this.parent(child);
    while (parent) {
      if (parent === ancestor) return true;
      else parent = this.parent(parent);
    }
  },
  parent(language) {
    let parent = this.l1s.find(
      l => l.glottologId === language.glottologParentId
    );
    if (parent !== language) return parent;
  },
  translate(message, code, data = {}) {
    let iso3 = code
    let translated = message
    if (code.length < 3) iso3 = this.getSmart(code)['iso639-3']
    if (this.translations[iso3] && this.translations[iso3][message]) {
      translated = this.translations[iso3][message]
    }
    for (let key in data) {
      translated = translated.replace(`{${key}}`, data[key])
    }
    return translated
  },
  countryCode(l2) {
    let manuallySetCountries = {
      af: 'ZA',
      az: "AZ",
      ar: "SA",
      en: "GB",
      eu: "ES",
      da: "DK",
      gl: "ES",
      pa: "IN",
      ta: "LK",
      hak: "CN",
      bn: "BD",
      yue: "HK",
      ca: "ES",
      nan: "CN",
      nn: "NO",
      ko: "KR",
      he: "IL",
      hi: "IN",
      urd: "PK"
    };
    if (manuallySetCountries[l2.code]) return manuallySetCountries[l2.code];
    if (l2.country && l2.country[0]) {
      let country;
      let countries = l2.country;
      if (countries.length === 1) country = countries[0];
      else {
        let prefCountries = l2.country.filter(c =>
          c.name.startsWith(l2.name.slice(0, 2))
        );
        if (prefCountries && prefCountries[0]) country = prefCountries[0];
        else {
          let l2CodeUpper = l2.code.toUpperCase();
          country = l2.country.find(c => c.alpha2Code === l2CodeUpper);
        }
      }
      if (!country && l2.country) country = l2.country[0]
      if (country) return country.alpha2Code;
    }
  }
};

const data = {
  hours: hoursCSV,
  locales: localesCSV,
  features: `l1	l2	home	courses	keyboard	bookmarklet	levels	roots	explore-topics	related	learn	grammar	noun-cases	endings	analyzer	hero-academy	music	radicals	characters
eng	zho	TRUE	TRUE			TRUE	TRUE	TRUE	TRUE	TRUE	TRUE				TRUE	TRUE	TRUE	TRUE
zho	eng	TRUE	TRUE															
eng	tlh			TRUE														
eng	hin				TRUE													
eng	rus											TRUE	TRUE	TRUE				
eng	jpn										TRUE							
eng	kor										TRUE							
zho	jpn										TRUE							`,
  dictionaries: dictionariesCSV,
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
  wiktionary_langs: {
    "eng": "aaa aab aac aad aaf aag aah aai aak aal aan aap aaq aar aas aau aaw aax aaz aba abb abc abd abe abg abi abj abk abl abm abn abo abp abq abr abs abt abu abv abw abx aby abz aca ace ach aci ack acl acm acn acp acr acu acv acw acx acy acz ada ade adi adj adn ado adt adw ady adz aeb aee aek ael aem aer aes aew aey aez afb afn afo afr aft afz agc agd agg agj agl agm agn ago agq agr ags agt agu agv agw agx agy ahb ahg ahk ahn aho ahr ahs aht aia aib aic aid aie aif aig aih aii aij aik ail ain aio ait aiw aiy aja ajg aji ajp aka akb akc ake akf akg akj akk akl akm akr aks akt aku akv akx akz ala alc ald ale alh ali alj alk alm alo alp alq alr alt alu alw alx aly amc ame amf amg amh ami amj amk aml amm amn amo amp amq amr ams amu amw amx amy amz ana anb anc and ane anf ang anh ani ank anm ann ano anp anq anu anv anw any aoa aoc aof aog aoi aor aos aot aou aoz apb apc apd ape apf aph api apj apk apl apm apn app apq apr apt apu apw apx apy apz aqc aqd aqg aqm aqn aqp aqt aqz ara arc ard are arg arh ari ark arl arn aro arp arq arr ars arv arw arx ary arz asa asb ase asi asj ask asl asm asn aso ass ast asu asv asx asz ata atb atc atd ate ati atj ato atr ats att atu atv atw atx aty atz aua auc aud aui auj auk aul aum aun auq auu auw aux auy ava avd ave avi avm avn avt avu avv awa awb awc awe awg awk awm awn awr awt awx axb axg axk axm axx aya ayd aye ayl aym ayn ayo ayp ayu ayz aza azd aze azg azn azz baa bac bae bag bak bal bam ban bao bap bar bas bav bay bbb bbc bbd bbh bbi bbj bbk bbl bbn bbo bbr bbu bbv bca bcf bch bci bcj bck bcl bcm bcn bco bcr bcu bcw bdb bdd bde bdg bdh bdi bdj bdk bdl bdm bdn bdo bdp bdq bdr bdt bdw bdy bdz bea bec bee bef beg bei bej bel bem ben beu bew bex bey bez bfa bfc bfd bff bfg bfi bfj bfm bfn bfq bfs bft bfw bfx bfy bgb bgc bgf bgg bgs bgt bgv bgz bhg bhh bhi bhj bhl bhm bho bhp bhq bhs bhv bhw bib bid bie big bij bim bin biq bis bja bjb bjc bjh bji bjk bjl bjn bjp bjt bjv bjz bkc bkd bkh bki bkj bkk bkl bkm bkq bkr bkt bku bky bkz bla blb blc bld ble blf blj blk bll blm bln blo blp blq blr bls blt blw blx blz bmc bmg bmh bmi bmk bmr bmt bmu bmx bna bnb bnd bnf bni bnm bnn bno bnp bnq bnr bns bnv bny bnz boa bod boe boi boj bol bom boq bor bot bou bpa bpg bph bpi bpl bpn bpp bpr bps bpy bpz bqb bqc bqi bql bqo bqp bqq bqr bra brc bre brg brh bri brk brp brr brt brw brx brz bsa bsb bsh bsk bsm bsn bsq bss bst bsw bsx bsy btd btf btn bto btp btu btw btx bty bua bud bue bug buk bul bum bun buq bus buw bux buy bvb bvj bvk bvr bvx bvy bvz bwa bwd bwf bwi bwp bwq bwr bwu bwx bxa bxd bxe bxf bxh bxj bxk bxn bxs bxw bya bye byk bym byn byq byr byt byx bza bzb bzd bze bzg bzh bzi bzj bzl bzn bzq bzs bzu bzv bzw bzx bzz caa cab cac cad cag cak cal cam can cao cap caq car cas cat cav cax cay caz cbb cbc cbd cbg cbi cbk cbn cbr cbs cbt cbu cbv cby ccc cce ccg ccm ccp cdm cdn cdy cea ceb ceg ces cfd cgc cgk cha chb chc chd che chf chg chh chk chl chm chn cho chp chr chu chv chy cia cic cih cim cin cir ciy cja cje cjh cji cjm cjo cjs cjv ckb ckl cko cks ckt cku ckv ckx cla clc clk clm clu clw cmg cmi cmn cms cnh cni cnk cns cnx coa coc cod coe cof cog coj col com con coo cop cor cos cow cpg cpi cpo cps cqd crc crd cre crg crh cri crj crk crl crm crn cro crs crv crw crx crz csb csf csg csi csm cso css cst csz cta ctg ctm cto ctp cts ctu ctz cua cub cug cuh cui cuk cul cuo cup cuq cuv cux cuy cvn cwd cwg cya cyb cym cyo czk czt daa dad dag dah dai dak dal dan dao dar dba dbf dbg dbj dbl dbn dbq dbt dbw dby dcc dcr ddg ddi ddj ddo ddr ddw deg dei den des deu dga dgb dgc dge dgg dgi dgr dgz dhg dhi dhl dhv dia dif dig dij dil dim din dio dis diu div dix djd dje djj djk djm djr dka dlg dlk dlm dma dmc dmo dmu dmv dmw dmy dng dni dnj dnn dnr dnw dny dob doe doi don dor dot doy doz dpp drd drg drl drn dro drq dru dsb dsh dsn dsq dta dtb dtd dti dto dtp dtr dtu dty dua duc due duf duk dum duo dus duu duv dux dva dwr dwu dww dym dyo dyu dyy dzg dzl dzo ebg ebk ebr ebu ecr efa efi ega egl ego egy eip eka eke ekg ekp elk ell elm elx emb eme emi emn emp ems emx emy ena enc end enf eng enl enm enn eno enq enw enx eot epi epo eri erk ero ers ert ese esh esq ess est esu esy etb eto ets ett etu etx eus eve evn ewe ewo ext eya faa fab fad faf fak fan fao fap fas fau fax fay fbl fcs fia fie fij fin fip fit fkk fkv fla fln fmp fng foi fon for fos fpe fqs fra frm fro frp frq frr fry fsl fud ful fun fur fut fuy fvr fwa gaa gac gad gae gaf gag gah gaj gal gap gaw gay gbb gbf gbg gbi gbj gbm gbp gbq gbr gbu gbv gbw gby gce gcf gcr gdc gdd gde gdg gdj gdm gdo gdq geh gej gek gel ges gez gfk gft ggl ggt ggu gha ghs gid gie gil gim gin gir gis git giw giz gji gjn gkn gko gla gld gle glg glk glv glw gmh gml gmu gmv gmy gnc gnd gni gnn gnq goa gof goh goi gol gon gop gor got gou gpa gqa gqi gqn gqr grc grd grh gri grn grs grt gru grw gsg gso gsw gtu gub guc gue guf gug guh guj gul gum gun guo gup guq gur gut guu guw gux guz gva gvc gve gvf gvj gvl gvn gvo gvp gvs gwc gwd gwe gwi gwm gwr gww gya gyb gyd gyg gyl gyn gyy haa hac had hah hai haj hao har hat hau haw hay haz hbb hbs hch hdn heb hed heg heh hei her hhy hia hid hif hig hih hil hin hio hit hiw hix hla hlb hmd hmo hmt hna hnd hne hnh hnj hnn hns hoa hob hoe hoh hoi hop hot hra hrc hre hro hru hrx hsb hsh hss hto hts hub hui hul hun huo hup huq hur hus huu huv hux huy huz hvc hvk hvn hwc hye iai ian iar iba ibb ibd ibe ibg ibh ibl ibm ibn ibo ibr iby icl idb idi ido ifa ifb ife ifk ifu ify ign igo iii ijc ijn ijs iki ikl ikr ikt iku ikx ikz ilb ilg ili ilk ill ilo ilv imn ims ina inb ind ing inh inm inn ins inz iow ipk ipo iqu irh irk iru iry isa isd isg ish isi isk isl ism ist ita itb itd ite itk itl itm ito itv itx itz ium ivb ivv iwm iws ixc ixl iyo izh izr jaa jab jac jae jam jan jao jav jaz jbk jbn jbt jct jdt jeb jee jeh jek jgo jhi jib jid jig jil jio jit jiv jje jka jko jmb jmc jmd jmx jnj jow jpn jqr jra jsl juc juh jum jun jup jur jut kaa kab kac kai kak kal kam kan kao kap kas kat kau kaw kay kaz kbb kbc kbd kbe kbh kbk kbm kbo kbp kbq kbt kbw kbz kca kcb kcg kck kcl kcn kco kcx kda kdd kde kdj kdp kdr kdt kdu kea kee keg kek kem ker kes ket keu kew kfa kfb kfk kfp kfq kfr kfs kfy kge kgg kgj kgk kgo kgp kgr kgu kha khb khc khe khl khm kho khp khq khr khs kht khv khw khz kib kic kid kih kii kij kik kim kin kio kip kir kis kiw kiy kja kjb kjc kje kjg kjh kjj kjl kjn kjp kjq kjr kju kjz kka kke kkh kkk kkp kkr kks kky kkz kla klb klc kld klg klj klm kln klp klq klr kls klu klv klw klx kmb kmc kmf kmg kmi kmj kmk kml kmn kmo kmr kms kmt kmv kmx knb knd kne knf kni knj knk knm kno knp knt knv knx koa kog koh koi kok kon kop kor kos kot koy koz kpc kpe kpf kpg kpj kpk kpm kpt kpv kpw kpx kpy kqa kqb kqe kqf kqi kqn kqr kqt kqv kqw kqy krc kre kri krj krk krl krs kru kry ksb ksc ksd ksi ksk ksr kss ksw ksx ktg kti ktn ktu ktw ktx ktz kua kud kue kug kui kuj kul kum kun kuo kut kuu kva kvc kvh kvi kvk kvo kvr kwa kwd kwe kwh kwi kwk kwl kwn kwz kxa kxb kxd kxi kxm kxn kxo kxu kxv kxz kya kyh kyi kyj kyo kyq kys kyt kyu kyz kzf kzg kzh kzi kzj kzk kzl kzt kzv kzw kzx lac lad lae laf laj lam lan lao laq lat lav law lax lay laz lbb lbc lbe lbj lbk lbn lbo lbq lbu lbv lbw lbx lbz lcm lcp lcq ldd led lei lek lep leu lev lew lex lez lgg lgk lgl lgq lgr lgt lgu lha lht lhu lib lic lid lif lig lij lil lim lin lis lit liv liy ljl ljp lka lki lkt llc lld lln llp llu lmb lmc lmd lml lmn lmo lmw lmy lnd lnj lnu loa loc lod loe log loj lok lol lom los lot lou loz lra lrc lre lrl lsd lsi lsm lsr ltg lti ltn ltz lub luc lud lue lug lui lun luo lus lut luv luy lva lvi lvk lwl lwo lzz maa mad mae mah mai mak mal mam maq mar mas mat maw maz mbb mbc mbd mbf mbi mbj mbl mbn mbp mbr mbs mbt mby mcb mcf mcg mch mck mcm mco mcq mcr mcv mcy mcz mda mdb mdc mde mdf mdh mdr mdx mea meb mee mei mej mek mel men meo mep meq mer met meu mev mew mey mez mfa mfe mff mfg mfh mfi mfj mfn mfr mfx mfy mfz mga mgd mgi mgk mgm mgo mgp mgq mgr mgu mgv mgw mha mhc mhd mhe mhi mhj mhk mhl mhn mhq mhs mht mhu mhx mhy mhz mia mic mid mif mig mih mij mik mil min miq mir mit miw miy miz mjb mjc mjj mjk mjl mjm mjs mjt mjw mka mkc mkd mkf mkg mkp mkr mkt mky mkz mla mle mlg mlm mln mlp mls mlt mlu mlv mlw mlz mmc mmd mmf mmg mmh mmi mmn mmq mmt mmw mmx mmy mna mnb mnc mnd mne mnf mng mni mnj mnk mnr mns mnt mnv mnw mnx moa mod moe mog moh mon mop mor mos mot mov mox mpc mpe mpg mph mpi mpj mpl mpm mpn mpr mps mpt mpv mpw mpx mqb mqe mqj mqm mqn mqo mqp mqv mqw mqx mqy mqz mrc mrg mrh mri mrj mrk mrl mrn mro mrq mrt mrv mrw mrx mry msa msb msf msi msk msm msn msq msu mta mtc mtd mte mtf mth mtl mtm mtn mto mtq mtr mtt mtv mty mub muc mue mug muh mui mul mup mus muy muz mva mvd mvi mvm mvn mvp mvq mvr mvt mvv mvy mwc mwf mwh mwl mwm mwn mwp mwr mwt mwv mww mxb mxd mxe mxi mxj mxk mxm mxx mxz mya myb myg myh myl myp myu myv myw myx myy myz mza mzb mzn mzp mzq mzs mzv mzw mzx nab naf nag nah nak nal nam nan nap naq nas nau nav nay naz nbb nbc nbh nbk nbl nbm nbn nbp nbr nbt nbv ncb nce ncg nch nci ncj ncl ncn ncr ncz ndd nde ndh ndo ndp nds nea neb nec nee neg neh nej nem nen nep new nez nfd nfl nfr nfu nga ngc ngg ngh ngi ngj ngn ngs ngu nha nhb nhc nhe nhg nhi nhk nhm nhn nho nht nhu nhv nhw nhx nhy nia nib nid nif nig nih nii nij nim nin nio niq nir niu niv niz nja njj njm njo njz nkg nkp nkr nkx nkz nlc nld nlg nll nlv nmb nmc nmf nmk nml nmn nmq nmu nmw nmy nnb nnf nnh nnm nno nnp nnr nnt nnv noa nob noc nod noe nog noj nol non nop nor not noz npa nph nqm nqn nqo nrc nrf nrl nrm nrn nru nrz nsb nsh nsk nsm nsn nso nsq nss nsu nsz ntj ntp ntw nua nuf nuk num nun nup nur nus nut nux nuy nuz nwc nwr nxa nxe nxg nxn nxq nya nyb nyi nym nyn nyo nys nyt nyv nyw nyy nza nzd nzi oaa oac obi obm obt oca oci ocu odt odu ofs ofu ogb ogc oge ogo ogu oia oin oji ojp ojv ojw oka okb okd okg okm okn oko okr ole olo olt oma omb omc omg omi omk omn omo omr omw omx ona onb one ong oni onn onu onw ood oon opm ora ore orh ori orm orr oru orv orx osa osc osp oss ost osx ota otd ote otk otq ots ott otw oty oui ovd owl oyd oym pab pac pad pag pah pal pam pan pao pap paq par pau pav paw paz pbh pbi pbn pbr pbv pcc pcd pck pcm pda pdc pdo pdt peb ped peh pei pek peo pex pez pfe pga pgd pgg pgk pgl pgn pgs pgu phk phl phn pia pib pid pih pij pim pio pip pis pit piv piw piz pjt pka pkc pkn pkp ple plg plh pli plk pln plo pls plu plv plw ply pma pme pmf pmh pmi pmj pmk pml pmo pms pmt pmw pmy pnh pni pnk pnr pns pnt pnw pny pnz poe poi pol pon poo por pos pot pov pox ppi ppk ppl ppm ppn ppo ppt ppu pqa pqm pre prg prk prm prn pro prq pru prw pse psi psu pti ptr ptu pua pui puj pup pus puw pwa pwg pwi pwm pwn pwo pym pyu qua quc que qui qum qun quv qvy qwc qwm qwt qxs qyp rab rac rad rag rah rai raj rak ral ram ran rap rar ras rau raw rax ray raz rbb rcf rea reb ree rej rel res ret rey rgn rgr rhg rhp rif rim rit rjs rkb rkh rki rkt rma rmc rme rmf rmg rml rmn rmo rmp rmq rmt rmw rmy rng rnn rnw rob roe rof rog roh rol rom ron roo rop rpn rpt rro rrt rth rtm rue ruf rug ruo rup ruq rus rut rwk rwm rwo ryn rys ryu sac sad sag sah saj sam san sar sas sat sav saw sax say saz sbc sbe sbf sbh sbi sbk sbl sbq sbr scb sce scl scn sco scp scw scx sda sdc sdg sdh sdn sdp sea sed see seh sei sek sel ser ses set seu sey sfw sga sgb sgd sgh sgp sgs sgt sgw sgz she shh shi shk shn sho shp shs shv shx shy sia sib sid sij sim sin sip sis siu six siz sja sjd sje sjg sjk sjl sjm sjo sjr sjt sju sjw skb skc skd ski skr sks skv sky skz slc sle slg slk slm sln slp slr slu slv slw slz sma smb sme smj smk sml smn smo smp smq smr sms smw sna snc snd sne snf snk snl snm snn snr snu sny snz sob sog sok sol som sos sot sou sov spa spc spd spe spi spl spn spp sps spx sqa sqi sqt squ sra srd sre srf srh sri srm srn srq srr srs sru sry ssb ssc ssd ssf ssg ssj ssl sso ssq ssw stf sth stk stn sto stp stq str stu stv stw sty sua suc sue sui sun sur sus sut sux suy suz sva svb svm svs swa swb swe swg swi swj swl swm swn swp sxg sxn sxr syb syc syk syl sza szb szd szl szp szv szw szy taa tab tad tae taf tah taj tak tal tam tan tao tar tat tau tav tay taz tba tbc tbd tbe tbf tbg tbi tbj tbk tbl tbo tbp tbw tbx tby tca tcb tcc tce tcf tcq tcs tcx tcy tdc tdd tdf tdg tdh tdi tdj tdk tdl tdm tds tdv tdy tea tee tef teh tei tel tem tep teq tet teu tew tex tez tfn tfr tft tgf tgk tgl tgn tgo tgp tgt tgx tha thd thf thh thm thp tht tig tih tim tin tio tip tir tit tiv tiw tix tiy tiz tjg tji tjm tjs tjw tkd tkl tkm tkn tkp tkq tkr tkv tkw tlb tlc tli tlk tlm tlr tlv tly tma tmb tmc tmd tmf tmh tmj tmq tmu tmz tna tnc tnl tnm tnp tnq tnt tnx tob toi toj ton too top tos tow tox tpa tpc tpf tpi tpl tpn tpt tpu tpw tpx tpy tpz tqb tqp tqr tqw trb trc trg tri trm trn tro trp trq trr trs trt tru trv trw tsd tsg tsi tsj tsn tso tsr tsu tsx tte ttg tti ttj ttk ttr tts ttt ttu ttv ttw tty tub tue tuf tuk tum tun tuo tuq tur tus tuu tuv tva tvd tvk tvl tvn tvo tvw tvx twb twe twf twm twy txb txe txg txm txn txu txx tya tye tyj typ tyv tzh tzj tzm tzo tzx uar ubl ubr ubu uby uda ude udi udj udl udm uga uge ugo uig uiv uji ukg ukk ukq ukr ula ulc ule ulk uln umb umc umo ump ums umu una und une ung unm unn unr unz upv ura urb urd urf urh uri urk urn urt urv urw ury usk usp ute utp utr utu uum uun uur uuu uve uvh uvl uwa uzb vai vam var vav vay vec ven veo vep vgr vie vit viv vkl vkm vkp vls vma vmb vme vmf vmg vmw vmz vnk vnp vol vot vro vrs vrt vut wab wad wah waj wal wam wan wao wap waq war was wat wau waw way waz wba wbb wbe wbj wbk wbl wbp wbw wdj wed wer wew wga wgy whg whk wic wig wih wii wim win wir wiu wiv wiy wka wkd wky wlc wlk wlm wln wlo wls wmb wmc wmd wme wmh wmt wmw wnb wnc wne wni wnk wnp wnu wnw wny woc wod woe wog woi wol wom wos wow wpc wrb wrg wrh wrk wrl wro wrp wrr wrs wsa wsi wsk wss wtf wth wuh wul wun wut wuv wwo www wya wyb wyi wym xaa xab xad xae xag xal xam xan xas xau xav xaw xbc xbi xbr xcb xce xcl xco xcr xda xdc xdk xdm xeb xed xer xes xfa xgf xho xht xhu xib xin xir xiy xke xkf xkl xkn xkq xkr xkw xkz xla xlc xld xle xlp xls xlu xly xmd xmf xmh xmk xmm xmr xmt xmz xnb xng xnn xnr xnt xod xok xon xoo xow xpc xpg xpi xpj xpm xpo xpq xpr xpu xpz xqa xqt xra xrn xru xrw xsa xsb xsi xsl xsm xsp xsr xss xsu xsv xsy xta xtc xtd xti xtm xto xtz xug xum xur xuu xve xvn xvo xvs xwa xwc xwk xwo xww xxt xya xyy xzh yaa yab yac yad yae yaf yag yah yai yak yal yan yao yap yaq yar yas yat yav ybe ybh ybi ybj ybm ybo yby ycl ycn yde ydg ydk yec yee yej yen yer yes yet yey ygr ygw yha yhl yia yid yig yii yij yik yil yim yis yix yiy yka ykg yki ykm ykn yko yku yky yle ylg yli yll yln ylr ylu yly ymc yme yml ymm ymo ynd ynk ynl ynn yns ynu yog yoi yol yon yor yox ypg ypz yrb yre yrk yrl yrn yrw yry ysc ysg ysn ysr yta yua yue yuf yug yui yuj yuk yum yup yur yut yux yuy yuz yva yvt ywl ywr ywt yww yxg yxl yxm yxy yyu yzg zaa zab zac zad zae zaf zag zah zai zak zal zam zao zap zaq zar zas zat zau zav zaw zay zaz zbt zca zdj zea zen zgh zgr zha zhb zho zia zik zil zin ziw zkh zkk zko zkr zkt zku zkz zma zmb zmc zmd zmf zmg zmh zmj zml zmm zmp zmr zms zmt zmu zmv zmz zne zng zns zoc zoh zom zoq zor zos zpc zpf zpg zpi zpk zpl zpm zpn zpo zpq zpr zps zpt zpu zpv zpw zpx zpz zrn zro zrs zsa zsr zsu zte ztg ztl ztm ztn ztp ztq zts ztt ztu zty zul zum zun zwa zza zzj".split(" "),
    "zho": ["kor"],
    // most zhwiktionary ones aren't working very well due to bad parsing
    // "zho": "aar abk afr aka amh ara arg asm ava ave aym aze bak bam bel ben bis bod bre bul cat ces cha che chu chv cor cos cym dan deu deu div dzo ell eng epo est eus ewe fao fas fij fin fra fry ful gla gle glg glv grn guj hat hau hbs heb her hin hmo hun hye ibo ido iii iku ile ina ind ipk isl ita jav kal kan kas kat kau kaz khm kik kin kir kon kor kua kur lao lat lav lim lin lit ltz lub lug mah mal mar mkd mlg mlt mon mri msa mya nau nav nbl nde ndo nep nld nno nob nor nya oci oji ori orm oss pan pli pol por pus que roh ron run rus sag san sin slk slv sme smo sna snd som sot spa sqi srd ssw sun swa swe tah tam tat tel tgk tgl tha tir ton tsn tso tuk tur uig ukr urd uzb ven vie vol wln wol xho yid yor zha zul".split(" ") // 'zho' doesn't work well (need pinyin and simplified / traditional logic)
  },
  wiktionary_mappings: {
    "hrv": "hbs", // Serbian uses Serbo-Croatian
    "nor": "nob", // Default Norwegian to Bokmål (which is supplemented with Nynorsk)
    "srp": "hbs", // Croatian uses Serbo-Croatian
    "bos": "hbs", // Bosnian uses Serbo-Croatian
    "cnr": "hbs", // Montenegrin uses Serbo-Croatian
    "run": "kin", // Rundi uses Rwanda-Rundi
    "hbo": "heb", // Ancient Hebrew uses Hebrew
    "grc": "ell", // Ancient Greek uses Greek
    "hmn": "mww", // Hmong uses white Hmong
    "prs": "fas", // Dari uses Persian
    "arb": "ara", // Modern Standard Arabic uses Arabic
    "zsm": "msa", // Standard Malaysian uses Malaysian
    "lvs": "lav", // Standard Latvian uses Latvian
    "ekk": "est", // Standard Estonian uses Estonian
  },
  commonLanguages: commonLanguagesCSV,
  countries: countriesCSV,
};
