import Papa from "papaparse";
import axios from "axios";
import Helper from "@/lib/helper";
import Translators from "@/lib/translators";
import translations from "./translations";

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
    console.log("🍉 Loading COMMON language data...");
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
    let common_languages = this.loadCSVString(data.common_languages);
    for (let language of common_languages) {
      language.scripts = JSON.parse(language.scripts)
    }
    this.commonLangs = common_languages.map(l => l.code)
    this.l1s = this.constructL1Data(common_languages, {
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
      console.log("📦 Loading ALL language data...");
      let server = "https://server.chinesezerotohero.com"; // Use DreamHost
      // let server = process.env.baseUrl // Use Vercel
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
    console.log("Loading language CSV file: " + url);
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
    console.log(`Filtering through ${languages.length} languages...`);
    let filteredLanguages = languages.filter(l => {
      if (l.wiktionary) return true;
      if (l.type === "L") return true;
      if (l.logo) return true;
      if (["hbo", "enm", "arc", "grc", "sjn"].includes(l["iso639-3"]))
        return true;
      if (l["glottologFamilyId"] === "sino1245") return true;
    });
    console.log(`Left with ${filteredLanguages.length} languages...`);
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
    console.log("Constructing L1 Data...");
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
    console.log("Augmenting language information...");
    for (let l1 of l1s) this.augmentLanguage(l1, { hours });
    console.log("Adding locales...");
    for (let l1 of l1s) this.addLocales(l1, locales);
    console.log('Adding language "native country" locales...');
    for (let l1 of l1s) this.addHostCountryLocales(l1, locales);
    console.log(
      "Adding identical languages information, assigning dictionaries, loading language feature list..."
    );
    this.addIdenticalLangs(l1s);
    this.assignDictionaries(l1s, { dictionaries, wiktionary_mapped_langs });
    this.loadL1Features(l1s, features);
    console.log("Language-loading finished. 🍺");
    return l1s;
  },
  exportCSV() {
    console.log("Languages: Exporting CSV...");
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
    console.log("CSV exported.");
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
    l1.indo = this.isIndo(l1);
  },
  isIndo(l1) {
    return [
      "aee",
      "aeq",
      "anp",
      "anr",
      "asm",
      "awa",
      "bdv",
      "ben",
      "bfb",
      "bfy",
      "bfz",
      "bgc",
      "bgd",
      "bge",
      "bgq",
      "bgw",
      "bha",
      "bhb",
      "bhd",
      "bhe",
      "bhi",
      "bho",
      "bht",
      "bhu",
      "bjj",
      "bkk",
      "bmj",
      "bns",
      "bpx",
      "bpy",
      "bra",
      "btv",
      "ccp",
      "cdh",
      "cdi",
      "cdj",
      "cih",
      "clh",
      "ctg",
      "dcc",
      "dgo",
      "dhd",
      "dhn",
      "dho",
      "dhw",
      "div",
      "dmk",
      "dml",
      "doi",
      "dry",
      "dty",
      "dub",
      "duh",
      "dwz",
      "gas",
      "gbk",
      "gbl",
      "gbm",
      "gda",
      "gdx",
      "ggg",
      "ghr",
      "gig",
      "gjk",
      "gju",
      "glh",
      "gom",
      "gra",
      "guj",
      "gwc",
      "gwf",
      "gwt",
      "haj",
      "hca",
      "hif",
      "hii",
      "hin",
      "hkh",
      "hlb",
      "hnd",
      "hne",
      "hno",
      "hns",
      "hoj",
      "jat",
      "jdg",
      "jml",
      "jnd",
      "jns",
      "kas",
      "kbu",
      "keq",
      "key",
      "kfr",
      "kfs",
      "kft",
      "kfu",
      "kfv",
      "kfx",
      "kfy",
      "khn",
      "khw",
      "kjo",
      "kls",
      "knn",
      "kra",
      "ksy",
      "kvx",
      "kxp",
      "kyw",
      "lbm",
      "lhl",
      "lmn",
      "lss",
      "luv",
      "mag",
      "mai",
      "mar",
      "mby",
      "mjl",
      "mjz",
      "mkb",
      "mke",
      "mki",
      "mtr",
      "mup",
      "mve",
      "mvy",
      "nag",
      "nep",
      "nhh",
      "nli",
      "nlm",
      "nlx",
      "noe",
      "noi",
      "npi",
      "odk",
      "omr",
      "ort",
      "ory",
      "pan",
      "paq",
      "pcl",
      "pgg",
      "phd",
      "phl",
      "phr",
      "pli",
      "plk",
      "plp",
      "pmh",
      "pmu",
      "pnb",
      "psh",
      "psi",
      "psu",
      "pwr",
      "qpp",
      "rei",
      "rhg",
      "rjs",
      "rkt",
      "rmc",
      "rme",
      "rmf",
      "rmi",
      "rml",
      "rmn",
      "rmo",
      "rmq",
      "rmt",
      "rmw",
      "rmy",
      "rom",
      "rtw",
      "rwr",
      "san",
      "saz",
      "sbn",
      "sck",
      "scl",
      "sdg",
      "sdr",
      "sgj",
      "shd",
      "sin",
      "sjp",
      "skr",
      "smm",
      "smv",
      "snd",
      "soi",
      "spv",
      "srx",
      "ssi",
      "sts",
      "swv",
      "syl",
      "tdb",
      "the",
      "thl",
      "thq",
      "thr",
      "tkb",
      "tkt",
      "tnv",
      "tra",
      "trw",
      "urd",
      "ush",
      "vaa",
      "vah",
      "vas",
      "vav",
      "ved",
      "vgr",
      "wbr",
      "wry",
      "wsv",
      "wtm",
      "xhe",
      "xka",
      "xnr"
    ].includes(l1["iso639-3"]);
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
    console.log("Loading language features.");
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
    console.log("Features loaded.");
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
kac,my
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
  features: `l1	l2	home	courses	keyboard	bookmarklet	levels	roots	explore-topics	related	learn	grammar	noun-cases	endings	analyzer	hero-academy	music	radicals	characters
eng	zho	TRUE	TRUE			TRUE	TRUE	TRUE	TRUE	TRUE	TRUE				TRUE	TRUE	TRUE	TRUE
zho	eng	TRUE	TRUE															
eng	tlh			TRUE														
eng	hin				TRUE													
eng	rus											TRUE	TRUE	TRUE				
eng	jpn										TRUE							
eng	kor										TRUE							
zho	jpn										TRUE							`,
  dictionaries: `l2	l1	dictionary
cdo	eng	hsk-cedict
cjy	eng	hsk-cedict
cnp	eng	hsk-cedict
cpx	eng	hsk-cedict
csp	eng	hsk-cedict
czo	eng	hsk-cedict
deu	zho	wiktionary-csv
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
eng	zho	wiktionary-csv
fra	zho	wiktionary-csv
gan	eng	hsk-cedict
hak	eng	hsk-cedict
hak	zho	chinese-dialect
hsn	eng	hsk-cedict
jpn	eng	edict
jpn	zho	kdic-jc
kor	eng	kengdic
kor	zho	kengdic
ltc	eng	hsk-cedict
ltc	zho	hsk-cedict
lzh	eng	hsk-cedict
lzh	zho	hsk-cedict
mnp	eng	hsk-cedict
nan	eng	hsk-cedict
nan	zho	chinese-dialect
och	eng	hsk-cedict
och	zho	hsk-cedict
rus	eng	openrussian
tlh	eng	klingonska
wuu	eng	hsk-cedict
yue	eng	chinese-dialect
zha	eng	hsk-cedict
zho	eng	hsk-cedict`,
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
  common_languages: `id,code,direction,name,vernacularName,otherNames,wiktionary,glottologId,glottologFamilyId,glottologParentId,level,lat,long,country,iso639-3,iso639-1,scope,type,speakers,logo,logoDesc,apostrophe,han,continua,scripts,omniglot,agglutinative,indo,locales,hostCountryLocales
33,ab,,Abkhaz,аԥсуа,,350,abkh1244,abkh1242,abkh1243,language,43.056218,41.159115,GE RU TR,abk,ab,I,L,190110,ab,"Peter von Uslar (1816 – 1875), inventor of the first Abkhaz alphabet",FALSE,FALSE,FALSE,"[{""lang"":""ab"",""script"":""Cyrl"",""ms"":"""",""ml"":"""",""p"":""N"",""direction"":""""}]",abkhaz.htm,TRUE,FALSE,ab,
53,acf,ltr,Saint Lucian Creole French,Kwéyòl (Patwa),,,sain1246,indo1319,less1242,language,15.3947,-61.3641,LC,acf,,I,L,,,,FALSE,FALSE,FALSE,[],saintluciancreole.htm,FALSE,FALSE,,"en,en-AU,en-CA,en-GB,en-IE,en-IN,en-US,en-ZA"
65,acu,ltr,Achuar,achuar-shiwiar,Achuar-Shiwiar,7,achu1248,jiva1245,shua1256,language,-2.82646,-77.2641,EC PE,acu,,I,L,4500,,,FALSE,FALSE,FALSE,[],achuarshiwiar.htm,FALSE,FALSE,,"es,es-419,es-AR,es-ES,es-MX,es-US"
118,af,,Afrikaans,Afrikaans,,6653,afri1274,indo1319,afri1273,language,-22,30,BW MZ NA ZA ZM ZW,afr,af,I,L,7200000,af,"General James Barry Munnik Hertzog KC (3 April 1866 – 21 November 1942), a South African politician and soldier",FALSE,FALSE,FALSE,"[{""lang"":""af"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",afrikaans.htm,FALSE,FALSE,af,
163,aib,ltr,Aynu,Abaknon,"Ainu,Äynu,Ainu (China),Aini,Eyni,Ejnu,Abdal,Äynú",4,ainu1251,turk1311,east2792,language,39.2714,76.4209,CN,aib,,I,L,,,,FALSE,FALSE,FALSE,[],aynu.htm,TRUE,FALSE,,"zh,zh-CN,zh-Hans,zh-Hant,zh-HK,zh-SG,zh-TW"
175,ain,,Ainu,アイヌ語 ,,525,ainu1240,ainu1252,hokk1250,language,43.633654,142.46167,JP,ain,,I,L,,,,FALSE,FALSE,FALSE,"[{""lang"":""ain"",""script"":""Kana"",""ms"":"""",""ml"":"""",""p"":""N"",""direction"":""""},{""lang"":""ain"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",ainu.htm,FALSE,FALSE,,"ja,ja-JP"
203,akk,ltr,Akkadian,𒀝𒅆𒉡𒆠 ,,329,akka1240,afro1255,east2678,language,33.1,44.1,IQ,akk,,I,A,,akk,"Sargon of Akkad, the first ruler of the Akkadian Empire",FALSE,FALSE,FALSE,[],akkadian.htm,TRUE,FALSE,,"ar,ar-SA"
247,am,,Amharic,አማርኛ,,636,amha1245,afro1255,amha1244,language,11.708182,39.543456,DJ ET,amh,am,I,L,32000000,am,"Tewodros II, Emperor of Ethiopia from 1855 until his death in 1868",FALSE,FALSE,FALSE,"[{""lang"":""am"",""script"":""Ethi"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",amharic.htm,FALSE,FALSE,am,
248,ami,ltr,Amis,阿美語,Nataoran Amis,737,amis1246,aust1307,cent2103,language,23.0917,121.348,TW,ami,,I,L,138000,,,FALSE,FALSE,FALSE,[],amis.htm,TRUE,FALSE,,"zh,zh-CN,zh-Hans,zh-Hant,zh-HK,zh-SG,zh-TW"
272,ang,,Old English,Ænglisc ,,10500,olde1238,indo1319,angl1265,language,51.06,-1.31,GB,ang,,I,H,,ang,"William the Conqueror (1028 – 1087), the first Norman monarch of England",FALSE,FALSE,FALSE,"[{""lang"":""ang"",""script"":""Latn"",""ms"":"""",""ml"":""O"",""p"":"""",""direction"":""""}]",oldenglish.htm,FALSE,FALSE,,"en,en-AU,en-CA,en-GB,en-IE,en-IN,en-US,en-ZA"
309,aou,ltr,A'ou,阿欧方言,"Ayo,A'ou Gelao",165,aoua1234,taik1256,ahou1236,language,26.8,105.85,CN,aou,,I,L,100,aou,,FALSE,FALSE,FALSE,[],,FALSE,FALSE,,"zh,zh-CN,zh-Hans,zh-Hant,zh-HK,zh-SG,zh-TW"
346,ar,rtl,Arabic,العربية,,125016,arab1395,afro1255,arab1394,family,24,54,AE BH DJ DZ EG EH ER GM IL IQ JO KM KW LB LY MA MR OM PS QA SA SD SO SY TD TN YE,ara,ar,M,L,350000000,ar,"Ibn al-Haytham (c. 965 – c. 1040), a Muslim Arab mathematician, astronomer, and physicist of the Islamic Golden Age",FALSE,FALSE,FALSE,"[{""lang"":""ar"",""script"":""Arab"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""rtl""},{""lang"":""ar"",""script"":""Syrc"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""rtl""}]",,FALSE,FALSE,"ar,ar-SA",
347,arb,rtl,Standard Arabic,العربية ,,,stan1318,afro1255,arab1395,language,27.9625,43.8525,AE BH DJ DZ EG ER IL IQ JO KM KW LB LY MA OM PS QA SA SD SO SY TD TN TZ YE,arb,,I,L,280000000,arb,"Taha Hussein (1889–1973), one of the most influential 20th-century Egyptian writers and intellectuals",FALSE,FALSE,FALSE,"[{""lang"":""arb"",""script"":""Arab"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""rtl""}]",arabic.htm,FALSE,FALSE,,"ar,ar-SA,fr,fr-BE,fr-CA,fr-CH,fr-FR,ti,he,he-IL,iw,so,sw"
348,arc,rtl,Aramaic,ܐܪܡܝܐ ,,2087,impe1235,afro1255,impe1236,language,33.905,42.185,IQ,arc,,I,A,,arc,"Eliezer Ben‑Yehuda (1858 – 1922), a Hebrew lexicographer and newspaper editor",FALSE,FALSE,FALSE,"[{""lang"":""arc"",""script"":""Armi"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""rtl""}]",aramaic.htm,FALSE,FALSE,,"ar,ar-SA"
368,arz,rtl,Egyptian Arabic,العربية (اللهجة المصرية),,487,egyp1253,afro1255,egyp1254,language,31,31,EG IL LY,arz,,I,L,,,,FALSE,FALSE,FALSE,"[{""lang"":""arz"",""script"":""Arab"",""ms"":"""",""ml"":"""",""p"":""N"",""direction"":""rtl""}]",arabic_egypt.htm,FALSE,FALSE,,"ar,ar-SA,he,he-IL,iw"
372,ase,,American Sign Language,American Sign Language,,359,amer1248,sign1238,amer1258,language,33.8117,-81.6121,BB BF BJ BO CA CD CF CI CN GA GH JM KE MG MR NG PH SG TD TG US ZW,ase,,I,L,500000,ase,"Laura Redden Searing (1839–1923), a deaf poet and journalist",FALSE,FALSE,FALSE,"[{""lang"":""ase"",""script"":""Zzzz"",""ms"":""n/a"",""ml"":"""",""p"":""?"",""direction"":""""}]",,FALSE,FALSE,,"en,en-AU,en-CA,en-GB,en-IE,en-IN,en-US,en-ZA,fr,fr-BE,fr-CA,fr-CH,fr-FR,es,es-419,es-AR,es-ES,es-MX,es-US,zh,zh-CN,zh-Hans,zh-Hant,zh-HK,zh-SG,zh-TW,ar,ar-SA,tgl,fil"
380,as,,Assamese,অসমীয়া,,3715,assa1263,indo1319,assa1262,language,26.0876,91.2932,BD BT IN,asm,as,I,L,15311351,as,"Lakshminath Bezbaroa (1864 – 1938), a writer from Assam",FALSE,FALSE,FALSE,"[{""lang"":""as"",""script"":""Beng"",""ms"":"""",""ml"":"""",""p"":""N"",""direction"":""""}]",assamese.htm,FALSE,TRUE,as,
454,awa,,Awadhi,Awadhi,,86,awad1243,indo1319,awad1245,language,27.5907,82.4663,IN NP,awa,,I,L,38261000,awa,"Malik Muhammad Jayasi (1477 –  1542), an Indian Sufi poet and pir",FALSE,FALSE,FALSE,"[{""lang"":""awa"",""script"":""Deva"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",awadhi.htm,FALSE,TRUE,,"hi,hi-IN,hi-Latn,ne"
490,ay,,Aymara,Aymara,,75,nucl1667,ayma1253,ayma1253,family,-17,-65,BO,aym,ay,M,L,1700000,ay,"David Choquehuanca (born 1961), the 39th Vice President of Bolivia",FALSE,FALSE,FALSE,"[{""lang"":""ay"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",aymara.htm,TRUE,FALSE,ay,
504,az,,Azerbaijani,Azərbaycan,,9189,mode1262,turk1311,azer1255,family,40.3,47.7,,aze,az,M,L,23000000,az,"Huseyn Javid (1882 – 1941), a prominent Azerbaijani poet and playwright",FALSE,FALSE,FALSE,"[{""lang"":""az"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""},{""lang"":""az"",""script"":""Cyrl"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""},{""lang"":""az"",""script"":""Arab"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""rtl""}]",azeri.htm,TRUE,FALSE,az,
520,ba,,Bashkir,башҡорт,,2753,bash1264,turk1311,nort2696,language,53.5967,56.5594,KZ RU UA,bak,ba,I,L,1400000,ba,"Maksud Syundyukle (1904 – 1981), Tatar and Bashkir poet, translator",FALSE,FALSE,FALSE,"[{""lang"":""ba"",""script"":""Cyrl"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",bashkir.htm,TRUE,FALSE,ba,
621,be,,Belarusian,беларуская,,3556,bela1254,indo1319,east1426,language,53.2307,25.6038,BY LT LV PL RU UA,bel,be,I,L,5100000,be,"Francišak Bahuševič (1840 – 1900) a Belarusian poet, writer and lawyer",FALSE,FALSE,FALSE,"[{""lang"":""be"",""script"":""Cyrl"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",belarusian.htm,FALSE,FALSE,be,
623,bn,,Bengali,বাংলা,,3110,beng1280,indo1319,gaud1238,language,24,90,BD IN NP,ben,bn,I,L,230000000,bn,"Rabindranath Tagore (1861 – 1941), a Bengali polymath – poet, writer, playwright, composer, philosopher, social reformer and painter",FALSE,FALSE,FALSE,"[{""lang"":""bn"",""script"":""Beng"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",bengali.htm,FALSE,TRUE,bn,
697,bho,,Bhojpuri,भोजपुरी,,264,bhoj1244,indo1319,bhoj1246,language,26.458455,84.817115,IN NP,bho,,I,L,51000000,bho,"Bhikari Thakur (1887– 1971), an Indian Bhojpuri language poet, playwright, lyricist, actor, folk dancer, folk singer and social activist",FALSE,FALSE,FALSE,"[{""lang"":""bho"",""script"":""Deva"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",bhojpuri.htm,FALSE,TRUE,,"hi,hi-IN,hi-Latn,ne"
857,bo,,Tibetan,བོད་སྐད།,,2868,tibe1272,sino1245,cent2346,language,28.3681,90.1872,BT CN IN NP,bod,bo,I,L,1200000,bo,"Gendün Chöphel (1903 – 1951), a Tibetan scholar, thinker, writer, poet, linguist, and artist",FALSE,FALSE,TRUE,"[{""lang"":""bo"",""script"":""Tibt"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",tibetan.htm,TRUE,FALSE,bo,
872,bs,,Bosnian,bosanski,,,bosn1245,indo1319,east2821,dialect,43.859,17.046,BA HR ME RS,bos,bs,I,L,2500000,bs,"Safvet-beg Bašagić (1870 – 1934), a a Bosnian writer",FALSE,FALSE,FALSE,"[{""lang"":""bs"",""script"":""Cyrl"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""},{""lang"":""bs"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",bosnian.htm,FALSE,FALSE,bs,
932,br,,Breton,Brezhoneg,,1608,bret1244,indo1319,sout3176,language,48.2452,-3.78934,FR,bre,br,I,L,210000,br,"Abeozen (1896 – 1963), a Breton nationalist, novelist and dramatist who wrote in the Breton language",TRUE,FALSE,FALSE,"[{""lang"":""br"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",breton.htm,FALSE,FALSE,br,
963,bsk,ltr,Burushaski,Burushaski,,73,buru1296,,,language,36.2161,74.8236,IN PK,bsk,,I,L,,,,FALSE,FALSE,FALSE,[],burushaski.php,FALSE,FALSE,,"hi,hi-IN,hi-Latn,en,en-AU,en-CA,en-GB,en-IE,en-IN,en-US,en-ZA"
1012,bg,,Bulgarian,български,,43450,bulg1262,indo1319,mace1252,language,43.3646,25.047,BG GR MD MK RO RS TR UA,bul,bg,I,L,8000000,bg,"Elin Pelin (1877 – 1949), arguably considered Bulgaria’s best narrator of country life",FALSE,FALSE,FALSE,"[{""lang"":""bg"",""script"":""Cyrl"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",bulgarian.htm,FALSE,FALSE,"bg,mk",
1115,byq,ltr,Basay,Binisaya,,4,basa1287,aust1307,nort2900,language,25.0046,121.857,TW,byq,,I,E,,,,FALSE,FALSE,FALSE,[],,TRUE,FALSE,,"zh,zh-CN,zh-Hans,zh-Hant,zh-HK,zh-SG,zh-TW"
1167,ca,,Catalan,català,,137507,stan1289,indo1319,sout3183,language,41.453,1.569,AD ES FR IT,cat,ca,I,L,4100000,ca,"Àngel Guimerà (1845 – 1924), a Spanish Nobel-nominated writer in the Catalan language",FALSE,FALSE,FALSE,"[{""lang"":""ca"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",catalan.htm,FALSE,FALSE,ca,
1218,ceb,,Cebuano,Cebuano,,16049,cebu1242,aust1307,bisa1268,language,8.38799,124.367,PH,ceb,,I,L,15230000,ceb,"Vicente Sotto (1877 – 1950), a Filipino politician who served as a Senator, the main author of the Press Freedom Law",TRUE,FALSE,FALSE,"[{""lang"":""ceb"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",cebuano.htm,TRUE,FALSE,"fil,fil-PH",
1222,cs,,Czech,čeština,,42779,czec1258,indo1319,czec1261,language,49.873398,15.10437,AT CZ PL SK,ces,cs,I,L,14000000,cs,"Jan Neruda (1834 – 1891), a Czech journalist, writer, poet and art critic",FALSE,FALSE,FALSE,"[{""lang"":""cs"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",czech.htm,FALSE,FALSE,cs,
1281,cjy,ltr,Jin,晋语 ,"Jinyu,Jinhua,Jinese,Shanxinese,Jin Chinese,Jinyu Chinese",,jiny1235,sino1245,nort3155,language,38.8284,111.278,CN,cjy,,I,L,63050000,cjy,"Hua Guofeng (1921 – 2008), Chairman of the Communist Party of China",FALSE,TRUE,TRUE,[],,FALSE,FALSE,"zh,zh-CN,zh-Hans,zh-Hant,zh-SG,zh-TW,zh-HK",
1282,ckb,rtl,Central Kurdish,کوردی سۆرانی,,387,cent1972,indo1319,kurd1259,language,35.6539,45.8077,IQ IR,ckb,,I,L,20000000,ckb,"Ibrahim Ahmad (1914 – 2000), a Kurdish writer, novelist, judge and translator",FALSE,FALSE,FALSE,"[{""lang"":""ckb"",""script"":""Arab"",""ms"":"""",""ml"":"""",""p"":""N"",""direction"":""rtl""}]",,FALSE,FALSE,ku,
1317,cmn,ltr,Mandarin,官话,"Mandarin Chinese,Putonghua,Guoyu,Huayu,Guanhua,Beifanghua,Standard Chinese",53932,mand1415,sino1245,mand1471,language,40.0209,116.228,CN KP LA MM MN RU TW VN,cmn,,I,L,920000000,cmn,"Ba Jin (1904–2005), a Chinese writer and author who also wrote three original works in Esperanto",FALSE,TRUE,TRUE,[],../chinese/mandarin.htm,FALSE,FALSE,"zh,zh-CN,zh-Hans,zh-Hant,zh-TW,zh-SG,zh-HK",
1331,cnr,ltr,Montenegrin,crnogorski,,,mont1282,indo1319,east2821,dialect,,,ME,cnr,,I,L,,cnr,"Vuk Vrčević (1811–1882), a Montenegrin Serb collector of lyric poetry",FALSE,FALSE,FALSE,[],montenegrin.htm,FALSE,FALSE,,"sr,sr-Cyrl,sr-Latn"
1351,cop,rtl,Coptic,ϯⲙⲉⲧⲣⲉⲙⲛ̀ⲭⲏⲙⲓ ,,1625,copt1239,afro1255,egyp1245,language,29.472,31.2053,EG,cop,,I,E,,cop,"Amelia Edwards (1831 – 1892), an English novelist, journalist, traveller and Egyptologist",FALSE,FALSE,FALSE,"[{""lang"":""cop"",""script"":""Arab"",""ms"":"""",""ml"":""O"",""p"":""N"",""direction"":""rtl""},{""lang"":""cop"",""script"":""Grek"",""ms"":"""",""ml"":""O"",""p"":"""",""direction"":""""}]",coptic.htm,FALSE,FALSE,,"ar,ar-SA"
1370,cpx,ltr,Puxian,莆仙话 ,"Pu-Xian,Puxian Min,Pu-Xian Min,Pu Xian,Pu Xian Chinese,Putian,Xinghua,Hinghwa",,puxi1243,sino1245,coas1318,language,25.37,118.68,CN,cpx,,I,L,2600000,cpx,"Lin Yuanpei (1936 – ), native of Putian County, Fujian Province, Chinese bridge expert of the Chinese Academy of Engineering",FALSE,TRUE,TRUE,[],../chinese/puxian.htm,FALSE,FALSE,"zh,zh-CN,zh-Hans,zh-Hant,zh-SG,zh-TW,zh-HK",
1380,crh,,Crimean Tatar,къырымтатар (кирилл),,2284,crim1257,turk1311,crim1259,language,45,34.08,BG MD RO UA UZ,crh,,I,L,,crh,Bekir Çoban-zade (1893 – 1937) was a Crimean Tatar poet and professor of Turkic languages,FALSE,FALSE,FALSE,"[{""lang"":""crh"",""script"":""Cyrl"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",crimeantatar.php,TRUE,FALSE,tr,
1398,csb,,Kashubian,kaszëbsczi,,666,kash1274,indo1319,lech1241,language,54.2996,18.6163,PL,csb,,I,L,,csb,"Jozef Cieminski (1867 – 1959), a Polish-born Roman Catholic priest",FALSE,FALSE,FALSE,"[{""lang"":""csb"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",kashubian.htm,FALSE,FALSE,,"pl,pl-PL"
1464,cy,,Welsh,Cymraeg,,13280,wels1247,indo1319,oldm1247,language,52,-4,GB,cym,cy,I,L,993600,cy,"Alun Lewis (1915 – 1944), a Welsh poet",TRUE,FALSE,FALSE,"[{""lang"":""cy"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",welsh.htm,FALSE,FALSE,cy,
1469,czo,ltr,Min Zhong,闽中语 ,,,minz1235,sino1245,inla1267,language,26.0686,117.376,CN,czo,,I,L,683000,czo,"Zou Taofen (1895 – 1944), a native of Yongan, Fujian, Chinese journalist and publisher",FALSE,TRUE,TRUE,[],,FALSE,FALSE,"zh,zh-CN,zh-Hans,zh-Hant,zh-SG,zh-TW,zh-HK",
1482,da,,Danish,Dansk,,46381,dani1285,indo1319,sout3248,language,54.8655,9.36284,DE DK FO GL,dan,da,I,L,6000000,da,"Hans Peter Holst (1811 – 1893), a Danish poet",FALSE,FALSE,FALSE,"[{""lang"":""da"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",danish.htm,FALSE,FALSE,"da,da-DK",
1540,de,,German,Deutsch,,290801,stan1295,indo1319,glob1243,language,48.649,12.4676,AT BE CH CZ DE DK FR HU IT LI LU NL PL RO SI SK,deu,de,I,L,95000000,de,"Johann Wolfgang von Goethe (1749 – 1832) a German poet, playwright, novelist, scientist, statesman, theatre director, and critic",FALSE,FALSE,FALSE,"[{""lang"":""de"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",german.htm,FALSE,FALSE,"de,de-AT,de-CH,de-DE",
1692,dsb,,Lower Sorbian,Dolnoserbski,,3176,lowe1385,indo1319,sorb1249,language,51.6621,13.9407,DE,dsb,,I,L,,dsb,"Mato Kósyk (1853 – 1940), a Sorbian poet and minister",FALSE,FALSE,FALSE,"[{""lang"":""dsb"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",sorbian.htm,FALSE,FALSE,,"de,de-AT,de-CH,de-DE"
1761,dz,,Dzongkha,Dzongkha (Roman),,322,dzon1239,sino1245,nucl1307,language,27.410786,89.581604,BT CN IN NP,dzo,dz,I,L,171080,dz,"Ugyen Wangchuck (1862 – 1926), the first Druk Gyalpo (King of Bhutan)",FALSE,FALSE,TRUE,"[{""lang"":""dz"",""script"":""Tibt"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",dzongkha.php,FALSE,FALSE,dz,
1800,el,,Greek,Ελληνική,,69622,mode1248,indo1319,nucl1783,language,38.36,23.13,AL BG CY EG GR IT MK RO TR UA,ell,el,I,L,13400000,el,"Constantine P. Cavafy (1863 – 1933), a Greek poet, journalist and civil servant from Alexandria",FALSE,FALSE,FALSE,"[{""lang"":""el"",""script"":""Grek"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",greek.htm,FALSE,FALSE,"el,el-GR",
1824,en,,English,English,,1059319,stan1293,indo1319,macr1271,language,53,-1,AU BM BR BZ CA CC CK CU CX DO FK GB GG GI GP GS GT GY HN IE IM IO JE KY LR MX NF PN SH SR UM US VE ZA,eng,en,I,L,400000000,en,"William Shakespeare (1564 – 1616), an English playwright, poet, and actor, widely regarded as the greatest writer in the English language and the world's greatest dramatist",FALSE,FALSE,FALSE,"[{""lang"":""en"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",english.htm,FALSE,FALSE,"en,en-AU,en-CA,en-GB,en-IE,en-IN,en-US,en-ZA",
1827,enm,,Middle English,Middle English,,31420,midd1317,indo1319,merc1242,language,51.65,-1.11,GB,enm,,I,H,,enm,"John Lydgate (c. 1370 – c. 1451), English monk and poet",FALSE,FALSE,FALSE,"[{""lang"":""enm"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",,FALSE,FALSE,,"en,en-AU,en-CA,en-GB,en-IE,en-IN,en-US,en-ZA"
1838,eo,,Esperanto,Esperanto,,124003,espe1235,arti1236,espe1236,language,49.3273,2.81045,PL,epo,eo,I,C,180000,eo,"L. L. Zamenhof (15 December 1859 – 14 April 1917),  an ophthalmologist who lived for most of his life in Warsaw",FALSE,FALSE,FALSE,"[{""lang"":""eo"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",esperanto.htm,FALSE,FALSE,eo,
1860,et,,Estonian,eesti,,9361,esto1258,ural1272,cent2329,language,58.73,25.78,EE LV RU,est,et,M,L,1100000,et,"Marie Under (1883 – 1980), one of the greatest Estonian poets",FALSE,FALSE,FALSE,"[{""lang"":""et"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",estonian.htm,TRUE,FALSE,et,
1874,eu,,Basque,Euskara,,4740,basq1248,,,language,43.2787,-1.31622,ES FR,eus,eu,I,L,750000,eu,"Salbatore Mitxelena (1919 – 1965), a friar and a writer in the Basque language",FALSE,FALSE,FALSE,"[{""lang"":""eu"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",basque.htm,TRUE,FALSE,eu,
1897,fo,,Faroese,Føroyskt,,7513,faro1244,indo1319,icel1246,language,62.0732,-6.88497,DK FO,fao,fo,I,L,72000,fo,"Andrias Høgenni (born 1988), a Faroese film director from Tórshavn",FALSE,FALSE,FALSE,"[{""lang"":""fo"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",faroese.htm,FALSE,FALSE,fo,
1900,fa,rtl,Persian,فارسی,,13363,fars1254,indo1319,mode1259,family,32,53,IR,fas,fa,M,L,70000000,fa,"Ruhollah Khomeini (1900 – 1989), an Iranian political and religious leader and the founder of the Islamic Republic of Iran",FALSE,FALSE,FALSE,"[{""lang"":""fa"",""script"":""Arab"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""rtl""}]",persian.htm,FALSE,FALSE,"fa,fa-AF,fa-IR,ps",
1916,fi,,Finnish,suomi,,214832,finn1318,ural1272,nucl1717,language,64.7628,25.5577,EE FI NO RU SE,fin,fi,I,L,5800000,fi,"Aleksis Kivi (1834 – 1872), one of the greatest Finnish authors",FALSE,FALSE,FALSE,"[{""lang"":""fi"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",finnish.htm,TRUE,FALSE,"fi,fi-FI",
1943,fr,,French,Français,,372707,stan1290,indo1319,glob1239,language,48,2,AD BE CA CH FR GF IT LU MC PM TF US,fra,fr,I,L,76800000,fr,"Louis XVIII (1755 – 1824), King of France during the French Revolution",FALSE,FALSE,FALSE,"[{""lang"":""fr"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",french.htm,FALSE,FALSE,"fr,fr-BE,fr-CA,fr-CH,fr-FR",
1954,fy,,West Frisian,Frysk,,3188,west2354,indo1319,west2902,language,53.143,5.86091,NL,fry,fy,I,L,470000,fy,"Recha Freier (1892 – 1984), who saved the lives of 7,000 Jewish children",FALSE,FALSE,FALSE,"[{""lang"":""fy"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",westfrisian.htm,FALSE,FALSE,fy,
1956,fsl,ltr,French Sign Language,Langue des signes française,,10,fren1243,sign1238,lsfi1234,language,47,3,FR TG,fsl,,I,L,,,,FALSE,FALSE,FALSE,[],,FALSE,FALSE,,"fr,fr-BE,fr-CA,fr-CH,fr-FR"
1970,fur,,Friulian,Furlan,,1944,friu1240,indo1319,gall1280,language,46.1473,13.0493,AT IT,fur,,I,L,600000,fur,"Amedeo Giacomini (1939 – 2006), a contemporary Italian writer and poet",FALSE,FALSE,FALSE,"[{""lang"":""fur"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",friulian.htm,FALSE,FALSE,,"de,de-AT,de-CH,de-DE,it,it-IT"
1991,gan,,Gan,赣语 ,,,ganc1239,sino1245,midd1354,language,27.9896,115.166,CN,gan,,I,L,55000000,gan,"Rao Pingru (1922–2020), a Chinese comic book author who wrote the autobiographical love memoir ‘Our Story’",FALSE,FALSE,FALSE,"[{""lang"":""gan"",""script"":""Hans"",""ms"":"""",""ml"":"""",""p"":""N"",""direction"":""""}]",../chinese/gan.htm,FALSE,FALSE,,"zh,zh-CN,zh-Hans,zh-Hant,zh-HK,zh-SG,zh-TW"
2127,gkp,ltr,Guinea Kpelle,Kpɛlɛɛwoo,,,guin1254,mand1469,kpel1252,language,7.93196,-8.98843,GN LR,gkp,,I,L,808000,,,FALSE,FALSE,FALSE,[],,FALSE,FALSE,,"fr,fr-BE,fr-CA,fr-CH,fr-FR,en,en-AU,en-CA,en-GB,en-IE,en-IN,en-US,en-ZA"
2129,gd,,Scottish Gaelic,Gàidhlig,,15834,scot1245,indo1319,east2734,language,56.7574,-5.24366,GB,gla,gd,I,L,57000,gd,"Sorley MacLean (1911 – 1996), a Scottish Gaelic poet",FALSE,FALSE,FALSE,"[{""lang"":""gd"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",gaelic.htm,FALSE,FALSE,gd,
2132,ga,,Irish,Gaeilge,,31634,iris1253,indo1319,mode1265,language,53.2186,-7.61509,GB IE,gle,ga,I,L,170000,ga,"Francis Bacon (1909 – 1992), an Irish-born British figurative painter known for his raw, unsettling imagery",FALSE,FALSE,FALSE,"[{""lang"":""ga"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",irish.htm,FALSE,FALSE,ga,
2133,gl,,Galician,Galego,,33437,gali1258,indo1319,gali1263,language,42.2446,-7.5343,ES PT,glg,gl,I,L,2400000,gl,"Rosalía de Castro (1837 – 1885), a Galician poet, strongly identified with her native Galicia and the celebration of the Galician language",FALSE,FALSE,FALSE,"[{""lang"":""gl"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",galician.htm,FALSE,FALSE,gl,
2142,gv,,Manx,Gaelg,,7565,manx1243,indo1319,east2734,language,54.2604,-4.45437,IM,glv,gv,I,L,1800,gv,"Doug Fargher (1926 – 1987), a Manx language activist, author, and radio personality who was involved with the revival of the Manx language on the Isle of Man in the 20th century",FALSE,FALSE,FALSE,"[{""lang"":""gv"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",manx.htm,FALSE,FALSE,gv,ga
2185,goh,,Old High German,Althochdeutsch,,1537,oldh1241,indo1319,high1286,language,52,10,DE,goh,,I,H,,goh,"Otto I (912 – 973), an East Francian king and Holy Roman Emperor",FALSE,FALSE,FALSE,"[{""lang"":""goh"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",,FALSE,FALSE,,"de,de-AT,de-CH,de-DE"
2197,got,ltr,Gothic,𐌲𐌿𐍄𐌹𐍃𐌺 ,,21435,goth1244,indo1319,east2805,language,46.9304,29.9786,UA,got,,I,A,,got,"J. R. R. Tolkien (1892–1973), an English writer, poet, philologist, and academic who made use of Gothic as a creative language",FALSE,FALSE,FALSE,[],gothic.htm,FALSE,FALSE,,uk
2213,grc,,Ancient Greek,Ἑλληνική ,,30187,anci1242,indo1319,east2798,language,39.8155,21.9129,GR,grc,,I,H,,grc,"Epicurus (341–270 BC), an ancient Greek philosopher and sage who founded Epicureanism, a highly influential school of philosophy",FALSE,FALSE,FALSE,"[{""lang"":""grc"",""script"":""Grek"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",greek.htm,FALSE,FALSE,el,
2220,gn,,Guaraní,Avañe'ẽ,,262,para1311,,,,-34,-64,AR PY,grn,gn,M,L,6500000,gn,,FALSE,FALSE,FALSE,"[{""lang"":""gn"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",guarani.htm,FALSE,FALSE,gn,
2240,gsw,,Alemannic German,Schweizerdeutsch,"Swiss German,Walser German,Walserdeutsch,Walser,Wallisertiitsch,Italian Walser,Pomattertitsch,Formazza,Kampel,Remmaljertittschu,Rimella,Chalchoufe,Titzschu,Alagna,Greschóneytitsch,Greschóney,Greschoney,Gressoney,Éischemtöitschu,Issime",1647,swis1247,indo1319,sout3294,language,47.0516,8.46419,AT CH DE FR IT LI,gsw,,I,L,,,,FALSE,FALSE,FALSE,"[{""lang"":""gsw"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",swissgerman.htm,FALSE,FALSE,,"de,de-AT,de-CH,de-DE,fr,fr-BE,fr-CA,fr-CH,fr-FR,it,it-IT"
2252,gu,,Gujarati,ગુજરાતી,,3374,guja1252,indo1319,guja1256,language,22.687,71.0962,BD IN PK,guj,gu,I,L,56000000,gu,"Keshavram Kashiram Shastri (born 1905), the founding leader of the Vishwa Hindu Parishad",FALSE,FALSE,FALSE,"[{""lang"":""gu"",""script"":""Gujr"",""ms"":"""",""ml"":"""",""p"":""N"",""direction"":""""}]",gujarati.htm,FALSE,TRUE,gu,
2323,hak,,Hakka,客家話（台灣）,,,hakk1236,sino1245,midd1354,language,25,116,CN TW,hak,,I,L,47800000,hak,"Sun Yat-sen (1866 – 1925), a Chinese statesman, physician, and political philosopher, who served as the provisional first president of the Republic of China",FALSE,TRUE,TRUE,"[{""lang"":""hak"",""script"":""Hans"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",../chinese/hakka.htm,FALSE,FALSE,"hak-TW,zh,zh-CN,zh-Hans,zh-Hant,zh-SG,zh-TW,zh-HK",
2333,ha,rtl,Hausa,Hausa,,1314,haus1257,afro1255,west2718,language,11.1513,8.7804,BF BJ CM NE NG TD,hau,ha,I,L,60000000,ha,"Balaraba Ramat Yakubu (born 1959), a Nigerian author who writes in Hausa",FALSE,FALSE,FALSE,"[{""lang"":""ha"",""script"":""Arab"",""ms"":"""",""ml"":"""",""p"":""N"",""direction"":""rtl""},{""lang"":""ha"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",hausa.htm,FALSE,FALSE,ha,
2342,hbo,rtl,Ancient Hebrew,עִבְרִית ,,,anci1244,afro1255,hebr1246,language,31.7761,35.1725,IL,hbo,,I,H,,hbo,"Moses, the most important prophet in Judaism",FALSE,FALSE,FALSE,"[{""lang"":""hbo"",""script"":""Hebr"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""rtl""}]",,FALSE,FALSE,"he,he-IL,iw",
2343,sh,,Serbo-Croatian,Српскохрватски,,59701,sout1528,indo1319,west2804,language,44.15,18.81,RS,hbs,sh,M,L,21000000,sh,"Ivo Andrić (1892 – 1975), a Yugoslav novelist, poet, and short story writer who won the Nobel Prize in Literature in 1961",FALSE,FALSE,FALSE,"[{""lang"":""sh"",""script"":""Zzzz"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",,FALSE,FALSE,"sh,sr,sr-Cyrl,sr-Latn,bs,hr",
2351,he,rtl,Hebrew,עברית,,12668,hebr1245,afro1255,hebr1246,language,31.1056,35.0179,IL JO LB PS SY,heb,he,I,L,5000000,he,"David Ben-Gurion (1886 – 1973), the primary national founder of the State of Israel and the first Prime Minister of Israel",FALSE,FALSE,FALSE,"[{""lang"":""he"",""script"":""Hebr"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""rtl""}]",hebrew.htm,FALSE,FALSE,"he,he-IL,iw",
2372,hil,,Hiligaynon,Hiligaynon,,1714,hili1240,aust1307,capi1240,language,10.4018,122.974,PH,hil,,I,L,7000000,hil,"Antonio Ledesma Jayme (1854 – 1937), a Filipino layer, revolutionary hero, Governor of Negros Occidental, and assemblyman",FALSE,FALSE,FALSE,"[{""lang"":""hil"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",hiligaynon.htm,TRUE,FALSE,"fil,fil-PH",
2373,hi,,Hindi,हिंदी,Hindavi,15707,hind1269,indo1319,hind1270,language,25,77,BD BT IN NP,hin,hi,I,L,322000000,hi,"Mahatma Gandhi (1869 – 1948), an Indian lawyer, anti-colonial nationalist and political ethicist",FALSE,FALSE,FALSE,"[{""lang"":""hi"",""script"":""Deva"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",hindi.htm,FALSE,TRUE,"hi,hi-IN,hi-Latn",
2418,hne,,Chhattisgarhi,छत्तीसगढ़ी (देवनागरी),,7,chha1249,indo1319,east2726,language,20.3601,82.0483,IN,hne,,I,L,17500000,hne,"Habib Tanvir (1923–2009), one of the most popular Indian Urdu, Hindi playwrights and a theatre director, poet and actor",FALSE,FALSE,FALSE,"[{""lang"":""hne"",""script"":""Deva"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",,FALSE,TRUE,,"hi,hi-IN,hi-Latn"
2420,hni,ltr,Hani,Haqniqdoq,,,hani1248,sino1245,haya1251,language,22.67753,102.851673333,CN LA VN,hni,,I,L,747000,,,FALSE,FALSE,FALSE,[],hani.htm,FALSE,FALSE,,"zh,zh-CN,zh-Hans,zh-Hant,zh-HK,zh-SG,zh-TW,lo,vi"
2456,hr,,Croatian,hrvatski,,,croa1245,indo1319,east2821,dialect,45.555,15.982,AT BA HR HU IT ME RS SI,hrv,hr,I,L,5600000,hr,"Dubravka Ugrešić (born 1949), a Yugoslav and later Croatian writer",FALSE,FALSE,FALSE,"[{""lang"":""hr"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",croatian.htm,FALSE,FALSE,hr,
2463,hsn,,Xiang,湘语 ,,,xian1251,sino1245,midd1354,language,27.66847,111.47112,CN,hsn,,I,L,38000000,hsn,"Mao Zedong (1893 – 1976), a Chinese communist revolutionary who was the founding father of the People's Republic of China",FALSE,TRUE,TRUE,"[{""lang"":""hsn"",""script"":""Hans"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",../chinese/xiang.htm,FALSE,FALSE,"zh,zh-CN,zh-Hans,zh-Hant,zh-SG,zh-TW,zh-HK",
2482,hu,,Hungarian,magyar,,69483,hung1274,ural1272,ural1272,language,46.9068585714,19.6555271429,AT HR HU RO RS SI SK UA,hun,hu,I,L,13000000,hu,"Ernő Szép (1884 – 1953), a Hungarian poet, novelist, journalist, playwright, narrator",FALSE,FALSE,FALSE,"[{""lang"":""hu"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",hungarian.htm,TRUE,FALSE,"hu,hu-HU",
2504,hy,,Armenian,Հայերեն,,17980,nucl1235,indo1319,east2768,language,40,45,AM AZ GE IR SY TR,hye,hy,I,L,6700000,hy,"Louise Aslanian (1904 – 1945), a French-Armenian communist and anti-fascist activist, writer, novelist, poet, a prominent figure in the French Resistance",TRUE,FALSE,FALSE,"[{""lang"":""hy"",""script"":""Armn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",armenian.htm,FALSE,FALSE,hy,
2518,ig,,Igbo,Igbo,,171,nucl1417,atla1278,igbo1259,language,4.62705,7.23441,NG,ibo,ig,I,L,42000000,ig,,FALSE,FALSE,FALSE,"[{""lang"":""ig"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",igbo.htm,FALSE,FALSE,ig,
2558,ii,,Sichuan Yi,ꆇꉙ / ꆇꊰ ,,357,sich1238,sino1245,nasu1236,language,28.1947,102.121,CN,iii,ii,I,L,2000000,ii,,FALSE,FALSE,FALSE,"[{""lang"":""ii"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""},{""lang"":""ii"",""script"":""Yiii"",""ms"":"""",""ml"":"""",""p"":""N"",""direction"":""""}]",yi.htm,FALSE,FALSE,ii,"zh,zh-CN,zh-Hans,zh-Hant,zh-HK,zh-SG,zh-TW"
2599,ia,,Interlingua,Interlingua,,3365,inte1239,arti1236,arti1236,language,48.203,2.615,FR,ina,ia,I,C,,ia,"Alice Vanderbilt Morris (1874 – 1950), co-founder of the International Auxiliary Language Association (IALA)",FALSE,FALSE,FALSE,"[{""lang"":""ia"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",interlingua.htm,FALSE,FALSE,ia,
2601,id,,Indonesian,Indonesia,,10426,indo1316,aust1307,stan1327,language,-7.33458,109.716,ID NL PH SA SG US,ind,id,I,L,43000000,id,"Pramoedya Ananta Toer (1925 – 2006), an Indonesian author of novels, short stories, essays, polemics and histories of his homeland and its people",FALSE,FALSE,FALSE,"[{""lang"":""id"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""},{""lang"":""id"",""script"":""Arab"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""rtl""}]",indonesian.htm,TRUE,FALSE,"id,id-ID",
2610,ins,ltr,Indian Sign Language,Indian Sign Language,,1,indi1237,sign1238,indo1332,language,27.5186,79.6787,BD IN PK,ins,,I,L,,,,FALSE,FALSE,FALSE,[],,FALSE,FALSE,"en,en-IN",
2617,ik,,Inupiaq,Iñupiaq,,654,inup1234,eski1264,inui1246,family,64.0685,-152.2782,US,ipk,ik,M,L,20709,ik,"Ticasuk Brown (1904 – 1982), an Iñupiaq educator, poet and writer",FALSE,FALSE,FALSE,"[{""lang"":""ik"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",inupiaq.php,TRUE,FALSE,ik,
2638,is,,Icelandic,íslenska,,20493,icel1247,indo1319,icel1246,language,63.4837,-19.0212,IS,isl,is,I,L,314000,is,"Jón Árnason (1819 — 1888),  an Icelandic author, librarian, and museum director who made the first collection of Icelandic folktales",FALSE,FALSE,FALSE,"[{""lang"":""is"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",icelandic.htm,FALSE,FALSE,is,
2645,it,,Italian,Italiano,,601926,ital1282,indo1319,ital1287,language,43.0464,12.6489,AT CH FR HR IT SI SM VA,ita,it,I,L,67000000,it,"Oriana Fallaci (1929 – 2006), an Italian journalist, author, and political interviewer.",FALSE,FALSE,FALSE,"[{""lang"":""it"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",italian.htm,FALSE,FALSE,"it,it-IT",
2687,jam,,Jamaican Creole,Patwa,"Jamaican,Jamaican Patois,Patois,Patwa",354,jama1262,indo1319,jama1264,language,18.13,-77.2612,JM PA,jam,,I,L,,,,FALSE,FALSE,FALSE,"[{""lang"":""jam"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",jamaican.php,FALSE,FALSE,,"en,en-AU,en-CA,en-GB,en-IE,en-IN,en-US,en-ZA,es,es-419,es-AR,es-ES,es-MX,es-US"
2694,jv,,Javanese,Jawa Timur,,1739,java1254,aust1307,mode1251,language,-7.001,109.287,ID MY,jav,jv,I,L,82000000,jv,"Kartini (1879 – 1904), a prominent Indonesian activist who advocated for women's rights and female education",FALSE,FALSE,FALSE,"[{""lang"":""jv"",""script"":""Java"",""ms"":"""",""ml"":"""",""p"":""N"",""direction"":""""},{""lang"":""jv"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",javanese.htm,TRUE,FALSE,jv,
2780,ja,,Japanese,日本語,,115466,nucl1643,japo1237,japa1258,language,35,135,JP,jpn,ja,I,L,128000000,ja,"Egaku (822 –864), or Hui’E, a well-connected 9th century Japanese scholar-monk who made frequent trips to Tang China for pilgrimage and bringing back Buddhist teachings to Japan",FALSE,FALSE,TRUE,"[{""lang"":""ja"",""script"":""Jpan"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",japanese_language.htm,TRUE,FALSE,"ja,ja-JP",
2814,kab,,Kabyle,Taqbaylit,,209,kaby1243,afro1255,kaby1244,language,36.4103,4.76137,DZ,kab,,I,L,,,,FALSE,FALSE,FALSE,"[{""lang"":""kab"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",kabyle.php,FALSE,FALSE,,"ar,ar-SA"
2815,kac,,Jingpho,Kachin,Kachin,239,kach1280,sino1245,jing1260,language,25.4634,97.3278,CN MM,kac,,I,L,940000,,,FALSE,FALSE,FALSE,"[{""lang"":""kac"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",jingpho.htm,FALSE,FALSE,my,
2824,kl,,Greenlandic,Kalaallisut,,2438,kala1399,eski1264,gree1280,language,69.3761,-52.864,DK GL,kal,kl,I,L,52000,kl,,FALSE,FALSE,FALSE,"[{""lang"":""kl"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",greenlandic.htm,TRUE,FALSE,kl,
2826,kn,,Kannada,ಕನ್ನಡ,,1306,nucl1305,drav1251,kann1255,language,13.5878,76.1198,IN,kan,kn,I,L,43000000,kn,"Ferdinand Kittel (1854), a priest and indologist with the Basel Mission in south India, famous for his studies of the Kannada language",FALSE,FALSE,FALSE,"[{""lang"":""kn"",""script"":""Knda"",""ms"":"""",""ml"":"""",""p"":""N"",""direction"":""""}]",kannada.htm,TRUE,FALSE,kn,
2831,ka,,Georgian,ქართული,,17171,nucl1302,kart1248,geor1253,language,41.850397,43.78613,AM AZ GE IR RU TR,kat,ka,I,L,3700000,ka,"Giya Kancheli (1935 – 2019), a Georgian composer",FALSE,FALSE,FALSE,"[{""lang"":""ka"",""script"":""Geor"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",georgian.htm,TRUE,FALSE,ka,
2837,kk,,Kazakh,қазақ,,7626,kaza1248,turk1311,sout2701,language,41.8729,65.7709,AF CN IR KG KZ MN RU TJ TM UZ,kaz,kk,I,L,13200000,kk,"Balzhan Bultrikova (1921 – 1998), a Soviet and Kazakh teacher and stateswoman who helped establish the diplomatic corps in the Kazakh Soviet Socialist Republic",FALSE,FALSE,FALSE,"[{""lang"":""kk"",""script"":""Cyrl"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""},{""lang"":""kk"",""script"":""Arab"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""rtl""}]",kazakh.htm,TRUE,FALSE,kk,
2996,km,,Khmer,ខ្មែរ,,5674,cent1989,aust1305,khme1253,language,12.0515,105.015,KH LA TH VN,khm,km,I,L,16000000,km,"Chuon Nath (1883 – 1969), the late Kana Mahanikaya Supreme Patriarch of Cambodia",FALSE,FALSE,TRUE,"[{""lang"":""km"",""script"":""Khmr"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",khmer.htm,FALSE,FALSE,km,
3027,ky,,Kyrgyz,кыргыз,,1909,kirg1245,turk1311,east2791,language,42,74,AF CN KG KZ TJ UZ,kir,ky,I,L,4300000,ky,"Iasyr Shivaza, (1906 – 1988), a famous Soviet Dungan poet, writer, editor, linguist, translator, scholar and social activist",FALSE,FALSE,FALSE,"[{""lang"":""ky"",""script"":""Cyrl"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""},{""lang"":""ky"",""script"":""Arab"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""rtl""},{""lang"":""ky"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",kirghiz.htm,TRUE,FALSE,ky,
3172,kok,,Konkani,कोंकणी ,,429,,,,,15.27,74.21,IN,kok,,M,L,2300000,,,FALSE,FALSE,FALSE,"[{""lang"":""kok"",""script"":""Deva"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",konkani.htm,FALSE,FALSE,,"hi,hi-IN,hi-Latn"
3179,ko,,Korean,한국어,,31399,kore1280,kore1284,kore1284,language,37.5,128,CN KP KR RU,kor,ko,I,L,77200000,ko,"Sejong the Great (1397 – 1450), the fourth king of the Joseon dynasty of Korea",FALSE,FALSE,FALSE,"[{""lang"":""ko"",""script"":""Kore"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",korean.htm,TRUE,FALSE,"ko,ko-KR",
3191,kpe,,Kpelle,Kpɛlɛɛ,,1,,,,,7.42,-9.38,LR GN,kpe,,M,L,1300000,kpe,,FALSE,FALSE,FALSE,"[{""lang"":""kpe"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",kpelle.htm,FALSE,FALSE,,"en,en-AU,en-CA,en-GB,en-IE,en-IN,en-US,en-ZA,fr,fr-BE,fr-CA,fr-CH,fr-FR"
3248,krl,,Karelian,Karjala,,731,kare1335,ural1272,lado1234,language,65.1691,30.8655,FI RU,krl,,I,L,80000,krl,"Liisi Beckmann (1924 – 2004), a Finnish designer and artist primarily active in Italy from the late 1950s to the late 1970s",FALSE,FALSE,FALSE,"[{""lang"":""krl"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",karelian.htm,TRUE,FALSE,,"fi,fi-FI,ru,ru-Latn,ru-RU"
3282,ksw,ltr,S'gaw Karen,ကညီ(စှီၤ)ကျိာ်,,232,sgaw1245,sino1245,sgaw1244,language,17.9872,97.7126,MM TH,ksw,,I,L,2000000,,,FALSE,FALSE,FALSE,[],,FALSE,FALSE,,"my,th,th-TH"
3328,ku,,Kurdish,Kurdî,,,kurd1259,indo1319,laki1246,family,33,44,IQ,kur,ku,M,L,30000000,ku,"Celadet Alî Bedirxan (1893 – 1951), also known as Mîr Celadet, a Kurdish diplomat, writer, linguist, journalist and political activist",FALSE,FALSE,FALSE,"[{""lang"":""ku"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""},{""lang"":""ku"",""script"":""Arab"",""ms"":"""",""ml"":"""",""p"":""N"",""direction"":""rtl""},{""lang"":""ku"",""script"":""Cyrl"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",kurdish.htm,FALSE,FALSE,ku,
3347,kvk,ltr,Korean Sign Language,한국 수어,,5,kore1273,sign1238,jsli1234,language,37.4718,127.609,KR,kvk,,I,L,,,,FALSE,FALSE,FALSE,[],,FALSE,FALSE,,"ko,ko-KR"
3463,lad,,Ladino,Djudeo-espanyol,"Judaeo-Spanish,Judæo-Spanish,Judeo-Spanish",1711,ladi1251,indo1319,sout3200,language,41.205,28.6632,GR TR,lad,,I,L,120000,lad,"Elias Canetti (1905 – 1994), a German-language author born in Ruse, Bulgaria",FALSE,FALSE,FALSE,"[{""lang"":""lad"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""},{""lang"":""lad"",""script"":""Hebr"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""rtl""}]",ladino.htm,FALSE,FALSE,,"el,el-GR,tr,tr-TR"
3474,lo,,Lao,ລາວ,,1742,laoo1244,taik1256,laot1235,language,19,102.46,KH LA TH,lao,lo,I,L,30000000,lo,"Kaysone Phomvihane (1920 – 1992), the first leader of the Communist Lao People’s Revolutionary Party",FALSE,FALSE,TRUE,"[{""lang"":""lo"",""script"":""Laoo"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",lao.htm,FALSE,FALSE,lo,
3479,la,,Latin,Latine,,845098,lati1261,indo1319,impe1234,language,41.9026,12.8,VA,lat,la,I,A,,la,"Ovid (43 BC – 17/18 AD), a Roman poet who lived during the reign of Augustus",FALSE,FALSE,FALSE,"[{""lang"":""la"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",latin2.htm,FALSE,FALSE,la,
3481,lv,,Latvian,latviešu,,127609,latv1249,indo1319,east2280,language,56.826108,24.309118,BY EE LT LV RU,lav,lv,M,L,1750000,lv,"Aspazija (1865 – 1943), a Latvian poet and playwright",FALSE,FALSE,FALSE,"[{""lang"":""lv"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",latvian.htm,FALSE,FALSE,lv,
3595,ln,,Lingala,Lingala,,481,ling1263,atla1278,ling1269,language,-4.409174,15.28532,CD CF CG,lin,ln,I,L,20000000,ln,"Franco Luambo (1938 – 1989), a musician from Congo",FALSE,FALSE,FALSE,"[{""lang"":""ln"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",lingala.htm,FALSE,FALSE,ln,
3601,lt,,Lithuanian,lietuvių,,23123,lith1251,indo1319,east2280,language,55.1429,23.9601,BY LT LV PL RU,lit,lt,I,L,3000000,lt,"Kazys Puida (1883 – 1945), a Lithuanian writer, playwright, press worker, translator",FALSE,FALSE,FALSE,"[{""lang"":""lt"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",lithuanian.htm,FALSE,FALSE,lt,
3629,lkt,,Lakota,Lakotiya,Lakhota,493,lako1247,siou1252,siou1253,language,46.3699,-103.95,CA US,lkt,,I,L,,,,FALSE,FALSE,FALSE,"[{""lang"":""lkt"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",sioux.htm,TRUE,FALSE,,"en,en-AU,en-CA,en-GB,en-IE,en-IN,en-US,en-ZA"
3748,ltc,ltr,Middle Chinese,中古漢語 ,"Late Middle Chinese,Early Middle Chinese",,midd1344,sino1245,midd1354,language,34.27,108.9,CN,ltc,,I,H,,ltc,"Li Bai (701–762), a Chinese poet acclaimed from his own day to the present as a genius and a romantic figure who took traditional poetic forms to new heights",FALSE,TRUE,TRUE,[],,FALSE,FALSE,"zh,zh-CN,zh-Hans,zh-Hant,zh-SG,zh-TW,zh-HK",
3756,lb,,Luxembourgish,Lëtzebuergesch,,6657,luxe1241,indo1319,midd1319,language,49.6839,6.14931,BE DE FR LU,ltz,lb,I,L,,lb,"Michel Lentz (1820 – 1893), a Luxembourg poet best known for having written “Ons Hémécht”, the national anthem of Luxembourg",FALSE,FALSE,FALSE,"[{""lang"":""lb"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",luxembourgish.htm,FALSE,FALSE,lb,
3800,lzh,,Literary Chinese,文言文 ,,,lite1248,sino1245,clas1255,language,34.09,109.05,CN,lzh,,I,H,,lzh,"Confucius (511 – 479 BCE), a Chinese philosopher and politician of the Spring and Autumn period",FALSE,TRUE,TRUE,"[{""lang"":""lzh"",""script"":""Hans"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""},{""lang"":""lzh"",""script"":""Hans"",""ms"":"""",""ml"":""O"",""p"":"""",""direction"":""""}]",,FALSE,FALSE,"zh,zh-CN,zh-Hans,zh-TW,zh-SG,zh-HK,zh-Hant",
3811,mai,,Maithili,मैथिली,,87,mait1250,indo1319,mait1254,language,26.3817,86.2211,IN NP,mai,,I,L,34700000,mai,"Surendra Jha ‘Suman’ (1910–2002), a Maithili poet, writer, publisher, editor and elected member of legislative assembly and parliament",FALSE,FALSE,FALSE,"[{""lang"":""mai"",""script"":""Deva"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",maithili.htm,FALSE,TRUE,,"hi,hi-IN,hi-Latn,ne"
3814,ml,,Malayalam,മലയാളം,,1359,mala1464,drav1251,mala1541,language,9.59208,76.7651,IN,mal,ml,I,L,35000000,ml,"Thilakan (1935 – 2012), a veteran Indian film and stage actor who appeared in over 200 Malayalam films",FALSE,FALSE,FALSE,"[{""lang"":""ml"",""script"":""Mlym"",""ms"":"""",""ml"":"""",""p"":""N"",""direction"":""""}]",malayalam.htm,TRUE,FALSE,ml,
3818,mr,,Marathi,मराठी,,2037,mara1378,indo1319,mode1268,language,17.9344,76.6665,IN,mar,mr,I,L,83000000,mr,"Kusumagraj (1912 – 1999), an eminent Marathi poet, playwright, novelist, short story writer",FALSE,FALSE,FALSE,"[{""lang"":""mr"",""script"":""Deva"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",marathi.htm,FALSE,TRUE,mr,
3998,mhx,ltr,Lhao Vo,Lhao Vo,"Langsu,Maru",3,maru1249,sino1245,midn1240,language,24.942535,99.8338,CN MM,mhx,,I,L,100000,,,FALSE,FALSE,FALSE,[],,FALSE,FALSE,my,
4014,min,,Minangkabau,Baso Minangkabau,,77,mina1268,aust1307,mina1280,language,-0.896,100.44,ID,min,,I,L,6500000,min,"Tuanku Imam Bonjol (1772 – 1864), one of the most popular leaders of the Padri movement in Central Sumatra",FALSE,FALSE,FALSE,"[{""lang"":""min"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",minangkabau.htm,TRUE,FALSE,"ms,id",
4053,mk,,Macedonian,македонски,,25710,mace1250,indo1319,mace1252,language,41.5957,21.7932,AL BG GR MK RS,mkd,mk,I,L,3500000,mk,"Krste Misirkov (1874 – 1926), a philologist, journalist, historian and ethnographer",FALSE,FALSE,FALSE,"[{""lang"":""mk"",""script"":""Cyrl"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",macedonian.htm,FALSE,FALSE,mk,
4080,mg,,Malagasy,Malagasy,,3780,mala1537,aust1307,sout2919,family,-20,47,MG,mlg,mg,M,L,25000000,mg,"Dox (1913 – 1978), a Malagasy writer and poet considered one of the most important literary figures in the country’s history",FALSE,FALSE,FALSE,"[{""lang"":""mg"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",malagasy.htm,TRUE,FALSE,mg,
4093,mt,,Maltese,Malti,,6050,malt1254,afro1255,nort3191,language,35.8884,14.4508,MT,mlt,mt,I,L,520000,mt,"Fortunato Mizzi (1844 – 1905), the founder of the Anti-Reform Party and the one who started the process which eventually led to Malta’s independence",FALSE,FALSE,FALSE,"[{""lang"":""mt"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",maltese.htm,FALSE,FALSE,mt,
4132,mni,,Manipuri,মৈতৈলোন্,"Meitei,Meithei",21,mani1292,sino1245,kuki1245,language,24.4409,93.3426,BD IN MM,mni,,I,L,1500000,mni,,FALSE,FALSE,FALSE,"[{""lang"":""mni"",""script"":""Beng"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""},{""lang"":""mni"",""script"":""Mtei"",""ms"":"""",""ml"":"""",""p"":""N"",""direction"":""""}]",manipuri.htm,FALSE,FALSE,,"bn,hi,hi-IN,hi-Latn,my"
4138,mnp,ltr,Min Bei,闽北语 ,,,minb1244,sino1245,inla1267,language,27.05,118.32,CN,mnp,,I,L,2191000,mnp,"Sun Keji (1917–2005), a native of Wuyishan City and a general of the People’s Liberation Army",FALSE,TRUE,TRUE,[],,FALSE,FALSE,"zh,zh-CN,zh-Hans,zh-Hant,zh-SG,zh-TW,zh-HK",
4158,mn,,Mongolian,монгол,,3535,mong1331,mong1349,khal1273,family,46,105,MN,mon,mn,M,L,5200000,mn,"Peljidiin Genden (1892 – 1937), a prominent political leader of the Mongolian People’s Republic who served as the country’s first President",FALSE,FALSE,FALSE,"[{""lang"":""mn"",""script"":""Cyrl"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",mongolian.htm,FALSE,FALSE,mn,
4229,mi,,Maori,Te Reo Māori,,1158,maor1246,aust1307,cent2062,language,-38.2881,176.541,NZ,mri,mi,I,L,149000,mi,"Āpirana Ngata (1874 – 1950), a prominent New Zealand statesman known for his work in promoting and protecting Māori culture and language",FALSE,FALSE,FALSE,"[{""lang"":""mi"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",maori.htm,TRUE,FALSE,mi,
4247,ms,,Malay,Melayu,,5861,mala1538,aust1307,nort3170,family,4.5,114.6667,BN CX MY SG,msa,ms,M,L,77000000,ms,"Abdullah Hussain (1920 – 2014), a Malaysian novelist and writer",FALSE,FALSE,FALSE,"[{""lang"":""ms"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""},{""lang"":""ms"",""script"":""Arab"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""rtl""}]",malay.htm,TRUE,FALSE,ms,
4387,mxv,ltr,Metlatónoc Mixtec,tu’un sâví,,,metl1238,otom1299,guer1245,language,17.1947,-98.35138,MX,mxv,,I,L,65000,,,FALSE,FALSE,FALSE,[],mixtec.htm,FALSE,FALSE,,"es,es-419,es-AR,es-ES,es-MX,es-US"
4392,my,,Burmese,မြန်မာ,,5395,nucl1310,sino1245,oldm1246,language,20.7926,93.9665,BD MM TH,mya,my,I,L,33000000,my,"May Shin (1917 – 2008), a Burmese actress and singer",FALSE,FALSE,TRUE,"[{""lang"":""my"",""script"":""Mymr"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",burmese.htm,FALSE,FALSE,my,
4448,nan,,Min Nan,Hokkien Medan,"Hokkien,Taiwanese,Amoy,Xiamenese",566,minn1241,sino1245,coas1318,language,24.5,118.17,CN TW,nan,,I,L,48000000,nan,"Chen Lei (born 1963), Taiwanese pop music singer",FALSE,TRUE,TRUE,"[{""lang"":""nan"",""script"":""Hans"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",../chinese/taiwanese.htm,FALSE,FALSE,"zh,nan-TW,zh-TW,zh-CN,zh-Hans,zh-Hant,zh-SG,zh-HK",
4456,nv,,Navajo,Diné Bizaad,,6709,nava1243,atha1245,west2810,language,36.33,-109.38,US,nav,nv,I,L,170000,,,FALSE,FALSE,FALSE,"[{""lang"":""nv"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",navajo.htm,FALSE,FALSE,nv,
4546,ne,,Nepali,नेपाली,,1897,east1436,indo1319,indo1310,family,27.5947033333,87.6200833333,NP,nep,ne,M,L,16000000,ne,"Siddhicharan Shrestha (1912 – 1992), one of the most prominent writers of Nepal",FALSE,FALSE,FALSE,"[{""lang"":""ne"",""script"":""Deva"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",nepali.htm,FALSE,TRUE,ne,
4677,nl,,Dutch,Nederlands,,117616,dutc1256,indo1319,glob1241,language,52,5,AW BE BR DE GF GY NL SR,nld,nl,I,L,25000000,nl,"Joseph Albert Alberdingk Thijm (1820 – 1889), a Dutch writer, art critic, philologist, poet",FALSE,FALSE,FALSE,"[{""lang"":""nl"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",dutch.htm,FALSE,FALSE,"nl,nl-BE,nl-NL",
4733,nn,,Norwegian Nynorsk,Nynorsk,,56754,norw1262,indo1319,norw1258,dialect,,,,nno,nn,I,L,,nn,"Tarjei Vesaas (1897 – 1970), a Norwegian poet and novelist considered to be one of Norway’s greatest writers of the twentieth century",FALSE,FALSE,FALSE,"[{""lang"":""nn"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",norwegian.htm,FALSE,FALSE,"nn,nn_NO",
4744,nb,,Norwegian Bokmål,Bokmål,,71691,norw1259,indo1319,norw1258,dialect,61.112,8.886,NO,nob,nb,I,L,,nb,"Ivar Aasen (1813 – 1896), a Norwegian philologist, lexicographer, playwright, and poet",FALSE,FALSE,FALSE,"[{""lang"":""nb"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",,FALSE,FALSE,"nb,nb-NO,nb_NO",
4756,non,,Old Norse,Old Norse,"Old Icelandic,Old Norwegian",7060,oldn1244,indo1319,west2805,language,63.42,10.38,NO,non,,I,H,,non,"Rasmus Rask (1787–1832), a Danish linguist and philologist",FALSE,FALSE,FALSE,"[{""lang"":""non"",""script"":""Runr"",""ms"":"""",""ml"":""O"",""p"":""N"",""direction"":""""}]",oldnorse.htm,FALSE,FALSE,,"no,nb,nb_NO,nn,nn_NO"
4759,no,,Norwegian,Norsk,,71691,norw1258,indo1319,west2805,language,59.92,10.71,FI NO RU SE SJ,nor,no,M,L,5320000,no,"Knut Hamsun (1859 – 1952), a Norwegian writer who was awarded the Nobel Prize in Literature in 1920",FALSE,FALSE,FALSE,"[{""lang"":""no"",""script"":""Zzzz"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",norwegian.htm,FALSE,FALSE,"no,nb,nb_NO,nn,nn_NO,nb-NO",
4784,nqo,rtl,N'Ko,ߒߞߏ ,,11,nkoa1234,arti1236,arti1236,language,,,BF CI GM GN GW LR ML SL SN,nqo,,I,L,,nqo,,FALSE,FALSE,FALSE,"[{""lang"":""nqo"",""script"":""Nkoo"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""rtl""}]",,FALSE,FALSE,,"fr,fr-BE,fr-CA,fr-CH,fr-FR,en,en-AU,en-CA,en-GB,en-IE,en-IN,en-US,en-ZA,pt,pt-BR,pt-PT"
4813,nsl,ltr,Norwegian Sign Language,Norsk tegnspråk,,,norw1255,sign1238,norw1261,language,60.7733,10.242,NO,nsl,,I,L,,,,FALSE,FALSE,FALSE,[],,FALSE,FALSE,,"no,nb,nb_NO,nn,nn_NO"
4944,och,ltr,Old Chinese,上古漢語,,,oldc1244,sino1245,sini1245,language,36.12,114.32,CN,och,,I,A,,och,"Fu Hao (? – c. 1200 BC), one of the many wives of King Wu Ding of the Shang dynasty who served as a military general and high priestess",FALSE,TRUE,TRUE,[],,FALSE,FALSE,"zh,zh-CN,zh-Hans,zh-Hant,zh-SG,zh-TW,zh-HK",
4945,oc,,Occitan,Occitan,,6000,occi1239,indo1319,occi1240,language,44.1415,6.82979,AD ES FR IT MC,oci,oc,I,L,800000,oc,"Frédéric Mistral (1830 – 1914), a French writer of Occitan literature and lexicographer of the Provençal form of the language",FALSE,FALSE,FALSE,"[{""lang"":""oc"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",occitan.htm,FALSE,FALSE,oc,
4969,ojp,ltr,Old Japanese,上代日本語 ,,367,oldj1239,japo1237,japa1256,language,34.683333,135.8,JP,ojp,,I,H,,,,FALSE,FALSE,FALSE,[],,FALSE,FALSE,,"ja,ja-JP"
5047,or,,Odia,ଓଡ଼ିଆ,,265,macr1269,indo1319,oriy1254,family,20.27,85.82,IN,ori,or,M,L,35000000,or,"Madhusudan Rao (1853 – 1912), an Odia poet and writer from India",FALSE,FALSE,FALSE,"[{""lang"":""or"",""script"":""Orya"",""ms"":"""",""ml"":"""",""p"":""N"",""direction"":""""}]",kotia.htm,FALSE,FALSE,or,
5048,om,,Oromo,Afaan Oromoo,,1001,nucl1736,afro1255,nucl1701,family,8,38,ET KE,orm,om,M,L,38068600,om,"Jawar Mohammed (born 1986), an Ethiopian political analyst and activist",FALSE,FALSE,FALSE,"[{""lang"":""om"",""script"":""Ethi"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""},{""lang"":""om"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",oromo.htm,FALSE,FALSE,om,
5061,osc,,Oscan,Osco,,30,osca1245,indo1319,sabe1249,language,40.98,15.67,IT,osc,,I,A,,,,FALSE,FALSE,FALSE,"[{""lang"":""osc"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""},{""lang"":""osc"",""script"":""Ital"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""rtl""}]",,FALSE,FALSE,,"it,it-IT"
5111,pa,,Punjabi,ਪੰਜਾਬੀ,,1468,panj1256,indo1319,east2727,language,30.0368,75.6702,BD IN PK,pan,pa,I,L,113000000,pa,"Amrita Pritam (1919 – 2005), an Indian novelist, essayist and poet",FALSE,FALSE,FALSE,"[{""lang"":""pa"",""script"":""Guru"",""ms"":"""",""ml"":"""",""p"":""N"",""direction"":""""},{""lang"":""pa"",""script"":""Arab"",""ms"":"""",""ml"":"""",""p"":""N"",""direction"":""rtl""}]",punjabi.htm,FALSE,TRUE,pa,
5180,pes,rtl,Western Farsi,فارسی,,,west2369,indo1319,fars1255,language,32.9,53.3,AF AZ IQ IR TM TR,pes,,I,L,33000000,pes,"Sadegh Hedayat (1903–1951), an Iranian writer, translator and intellectual, one of the earliest Iranian writers to adopt literary modernism in their career",FALSE,FALSE,FALSE,"[{""lang"":""pes"",""script"":""Arab"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""rtl""}]",,FALSE,FALSE,,"ps,az,ar,ar-SA,fa,fa-AF,fa-IR,tk,tr,tr-TR"
5229,pis,ltr,Pijin,Solomon Islands Pidgin,"Kanaka,Neo-Solomonic,Solomons Pidgin",67,piji1239,indo1319,earl1243,language,-9.567,160.137,SB,pis,,I,L,350000,,,FALSE,FALSE,FALSE,[],pijin.htm,FALSE,FALSE,,"en,en-AU,en-CA,en-GB,en-IE,en-IN,en-US,en-ZA"
5288,pms,,Piedmontese,Piemontese,,644,piem1238,indo1319,piem1239,language,45.4633,8.32366,AU IT US,pms,,I,L,,,,FALSE,FALSE,FALSE,"[{""lang"":""pms"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",piedmontese.htm,FALSE,FALSE,,"en,en-AU,en-CA,en-GB,en-IE,en-IN,en-US,en-ZA,it,it-IT"
5326,pl,,Polish,polski,,103899,poli1260,indo1319,lech1241,language,51.8439,18.6255,BY CZ DE LT PL RU SK UA,pol,pl,I,L,45000000,pl,"Stefan Żeromski (1864 – 1925), a Polish novelist and dramatist belonging to the Young Poland movement at the turn of the 20th century",FALSE,FALSE,FALSE,"[{""lang"":""pl"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",polish.htm,FALSE,FALSE,"pl,pl-PL",
5332,pt,,Portuguese,Português (Brasil),,298891,port1283,indo1319,braz1247,language,39.91,-8.1,AD AR BO BR CO ES FR GF GY PE PT PY SR UY VE,por,pt,I,L,250000000,pt,"Raul Brandão (1867 – 1930), a Portuguese writer, journalist and military officer",FALSE,FALSE,FALSE,"[{""lang"":""pt"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",portuguese.htm,FALSE,FALSE,"pt,pt-BR,pt-PT",
5368,prs,rtl,Dari,دری,,,dari1249,indo1319,east2745,language,31.0405,67.3593,AF IR PK TJ TM,prs,,I,L,7000000,,,FALSE,FALSE,FALSE,"[{""lang"":""prs"",""script"":""Arab"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""rtl""}]",dari.htm,FALSE,FALSE,"fa,ps",
5420,ps,rtl,Pashto,پښتو,,1146,nucl1276,indo1319,pash1269,family,30,70,PK,pus,ps,M,L,60000000,ps,"Khan Abdul Ghani Khan (1914–1996), a Pashtun philosopher, poet, artist, writer and politician",FALSE,FALSE,FALSE,"[{""lang"":""ps"",""script"":""Arab"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""rtl""}]",pashto.htm,FALSE,FALSE,ps,
5448,qu,,Quechua,Quechua (Ancash),,2452,quec1387,,,family,-2,-77.5,BO EC PE,que,qu,M,L,10000000,qu,"José María Arguedas (1911 – 1969), a Peruvian novelist, poet, and anthropologist",FALSE,FALSE,FALSE,"[{""lang"":""qu"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",quechua.htm,FALSE,FALSE,qu,
5610,rm,,Romansch,Rumantsch (Ladin),,2349,roma1326,indo1319,gall1280,language,46.5538,9.92812,AT CH IT,roh,rm,I,L,40074,rm,"Arno Camenisch (born 1978), a Swiss writer",FALSE,FALSE,FALSE,"[{""lang"":""rm"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",romansh.htm,FALSE,FALSE,rm,
5613,ro,,Romanian,Română,,59314,roma1327,indo1319,east2865,language,46.3913,24.2256,BG HU MD RO RS UA,ron,ro,I,L,26000000,ro,"Mircea Eliade (1907 – 1986), a Romanian historian of religion, fiction writer, philosopher, and professor at the University of Chicago",FALSE,FALSE,FALSE,"[{""lang"":""ro"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""},{""lang"":""ro"",""script"":""Cyrl"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""},{""lang"":""ro"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",romanian.htm,FALSE,FALSE,"ro,ro-RO",
5644,ru,,Russian,русский,,420055,russ1263,indo1319,east1426,language,59,50,BY CN EE FI GE KG KP KZ LT LV MD MN NO PL RO RU SJ TM UA UZ,rus,ru,I,L,150000000,ru,"Peter the Great (1672 – 1725), the ruler of the Tsardom of Russia and later the Russian Empire",FALSE,FALSE,FALSE,"[{""lang"":""ru"",""script"":""Cyrl"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",russian.htm,FALSE,FALSE,"ru,ru-Latn,ru-RU",
5658,ryu,,Okinawan,ウチナーグチ,,717,cent2126,japo1237,okin1244,language,26.14854,127.7816,JP,ryu,,I,L,,,,FALSE,FALSE,TRUE,"[{""lang"":""ryu"",""script"":""Kana"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",okinawan.php,FALSE,FALSE,ja,
5667,sah,,Yakut,сахалыы,Sakha,636,yaku1245,turk1311,nort2688,language,61.6974,133.98,RU,sah,,I,L,363000,,,FALSE,FALSE,FALSE,"[{""lang"":""sah"",""script"":""Cyrl"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",yakut.htm,TRUE,FALSE,,"ru,ru-Latn,ru-RU"
5671,sa,,Sanskrit,संस्कृतम्,,8181,sans1269,indo1319,indo1321,language,20,77,IN,san,sa,I,A,194433,sa,"Sher Shah Suri (1472 – 1545), the founder of the Suri Empire in India",FALSE,FALSE,FALSE,"[{""lang"":""sa"",""script"":""Deva"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""},{""lang"":""sa"",""script"":""Sinh"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",sanskrit.htm,FALSE,TRUE,sa,
5717,scn,,Sicilian,sicilianu,,1982,sici1248,indo1319,ital1287,language,37.5735,14.0414,IT,scn,,I,L,,,,FALSE,FALSE,FALSE,"[{""lang"":""scn"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",sicilian.htm,FALSE,FALSE,,"it,it-IT"
5718,sco,,Scots,Scots,Lowland Scots,4070,scot1243,indo1319,late1254,language,55.886945,-3.710133,GB,sco,,I,L,1500000,sco,"David Hume (1711 – 1776), a Scottish Enlightenment philosopher, historian, economist, librarian and essayist",FALSE,FALSE,FALSE,"[{""lang"":""sco"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",scots.htm,FALSE,FALSE,,"en,en-AU,en-CA,en-GB,en-IE,en-IN,en-US,en-ZA"
5833,si,,Sinhalese,සිංහල,,264,sinh1246,indo1319,sinh1247,language,8,81,LK,sin,si,I,L,17000000,si,"S. W. R. D. Bandaranaike (1899 – 1959), the fourth Prime Minister of the Dominion of Ceylon (now Sri Lanka)",FALSE,FALSE,FALSE,"[{""lang"":""si"",""script"":""Sinh"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",sinhala.htm,FALSE,TRUE,si,
5852,sjn,ltr,Sindarin,Sindarin,,,sind1281,arti1236,arti1236,language,,,GB,sjn,,I,C,,sjn,"Legolas, a fictional character in J. R. R. Tolkien's The Lord of the Rings, a Sindar Elf of the Woodland Realm and one of the nine members of the Fellowship",FALSE,FALSE,FALSE,[],,FALSE,FALSE,,"en,en-AU,en-CA,en-GB,en-IE,en-IN,en-US,en-ZA"
5890,sli,,Lower Silesian,Dolnośląskie,,,lowe1388,indo1319,schl1237,language,50.6963,15.9667,CZ PL,sli,,I,L,,,,FALSE,FALSE,FALSE,"[{""lang"":""sli"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",,FALSE,FALSE,,"cs,pl,pl-PL"
5892,sk,,Slovak,slovenčina,,6431,slov1269,indo1319,czec1260,language,48.545705,18.78479,AT CZ HU PL RS SK UA,slk,sk,I,L,5200000,sk,"Pavol Országh Hviezdoslav (1849 – 1921), a Slovak poet, dramatist, translator",FALSE,FALSE,FALSE,"[{""lang"":""sk"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",slovak.htm,FALSE,FALSE,"sk,sk-SK",
5902,sl,,Slovene,slovenščina,,5463,slov1268,indo1319,west2804,language,46.2543,14.7766,AT HR HU IT SI,slv,sl,I,L,2500000,sl,"Ivan Cankar (1876 – 1918), a Slovene writer, playwright, essayist, poet, and political activist",FALSE,FALSE,FALSE,"[{""lang"":""sl"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",slovene.htm,FALSE,FALSE,sl,
5911,se,,Northern Sami,sámegiella (davvi),,5248,nort2671,ural1272,cent2240,language,68.725,22.1113,FI NO SE,sme,se,I,L,25000,se,"Nils Vibe Stockfleth (1787 – 1866), a Norwegian cleric who was instrumental in the first development of the written form of the Northern Sami language",FALSE,FALSE,FALSE,"[{""lang"":""se"",""script"":""Cyrl"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""},{""lang"":""se"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",northernsami.htm,TRUE,FALSE,se,"fi,fi-FI,no,nb,nb_NO,nn,nn_NO,sv,sv-SE"
5920,sm,,Samoan,Faa-Samoa,,374,samo1305,aust1307,samo1310,language,-13.92,-171.83,AS WS,smo,sm,I,L,510000,,,FALSE,FALSE,FALSE,"[{""lang"":""sm"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",samoan.htm,TRUE,FALSE,sm,
5935,sd,rtl,Sindhi,سِنڌي,,180,sind1272,indo1319,sind1279,language,26,69,IN PK,snd,sd,I,L,32000000,sd,"Hotchand Molchand Gurbakhshani (1884-1947), a leading academician, an educationist and scholar",FALSE,FALSE,FALSE,"[{""lang"":""sd"",""script"":""Arab"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""rtl""},{""lang"":""sd"",""script"":""Deva"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",sindhi.htm,FALSE,TRUE,sd,
5967,so,,Somali,Soomaali,,811,soma1255,afro1255,east2653,language,4.778704,45.152856,DJ ET KE SO,som,so,I,L,21807730,so,"Sheikh Ali Ayanle Samatar, a prominent Somali Islamic scholar",FALSE,FALSE,FALSE,"[{""lang"":""so"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""},{""lang"":""so"",""script"":""Arab"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""rtl""}]",somali.htm,FALSE,FALSE,so,
5980,es,,Spanish,español,,701866,stan1288,indo1319,cast1243,language,40.4414,-1.11788,AD AR BO BR BZ CL CO CR CU DO EC ES FR GI GT GY HN HT MA MX NI PA PE PR PT PY SV US UY VE,spa,es,I,L,586000000,es,"Ricky Martin (1971–), a Puerto Rican singer, songwriter, actor, author, record producer, and humanitarian who is known as the ""King of Latin Pop”",FALSE,FALSE,FALSE,"[{""lang"":""es"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",spanish.htm,FALSE,FALSE,"es,es-419,es-AR,es-ES,es-MX,es-US",
6003,sq,,Albanian,shqip,,7346,alba1267,indo1319,clas1257,family,41,20,AL,sqi,sq,M,L,6000000,sq,"Hysni Kapo (1915 – 1979), an Albanian military commander and leading member of the Party of Labour of Albania",FALSE,FALSE,FALSE,"[{""lang"":""sq"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",albanian.htm,FALSE,FALSE,sq,
6016,sc,,Sardinian,Sardu,,1043,sard1257,indo1319,sard1256,family,42.8333,12.8333,IT,srd,sc,M,L,1350000,sc,"Grazia Deledda (1871 – 1936), an Italian writer who received the Nobel Prize for Literature in 1926",FALSE,FALSE,FALSE,"[{""lang"":""sc"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",sardinian.htm,FALSE,FALSE,sc,
6024,srm,ltr,Saramaccan,Saamakatöngö,,10,sara1340,indo1319,suri1275,language,4.54729,-54.0238,GF SR,srm,,I,L,,,,FALSE,FALSE,FALSE,[],saramaccan.htm,FALSE,FALSE,,"fr,fr-BE,fr-CA,fr-CH,fr-FR,nl,nl-BE,nl-NL"
6027,sr,,Serbian,српски (ћирилица),,,serb1264,indo1319,east2821,dialect,44.3238,21.9192,AL BA BG HR HU ME MK RO RS,srp,sr,I,L,12000000,sr,"Borislav Pekić (1930 – 1992), a Serbian and Yugoslav writer and political activist",FALSE,FALSE,FALSE,"[{""lang"":""sr"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""},{""lang"":""sr"",""script"":""Cyrl"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",serbian.htm,FALSE,FALSE,"sr,sr-Cyrl,sr-Latn",
6059,ss,,Swazi,SiSwati,,1614,swat1243,atla1278,ngun1267,language,-26,31.5,LS MZ SZ ZA,ssw,ss,I,L,2300000,ss,,FALSE,FALSE,FALSE,"[{""lang"":""ss"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",swati.php,FALSE,FALSE,ss,
6094,su,,Sundanese,Sunda,,999,sund1252,aust1307,sund1251,language,-6.89708,107.106,ID,sun,su,I,L,42000000,su,,FALSE,FALSE,FALSE,"[{""lang"":""su"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""},{""lang"":""su"",""script"":""Sund"",""ms"":"""",""ml"":"""",""p"":""N"",""direction"":""""}]",sundanese.php,TRUE,FALSE,su,
6101,sux,ltr,Sumerian,𒅴𒂠,,283,sume1241,,,language,31.3,45.6667,IQ,sux,,I,A,,sux,"Sargon of Akkad, the first ruler of the Akkadian Empire (c. 2334 – 2279 BC)",FALSE,FALSE,FALSE,[],sumerian.htm,TRUE,FALSE,,"ar,ar-SA"
6112,sw,,Swahili,Kiswahili,,9519,swah1254,atla1278,saba1282,family,0,25,CD KE TZ UG,swa,sw,M,L,18000000,sw,"Ali Mazrui (1933 – 2014), a Kenyan-born American academic, professor, and political writer on African and Islamic studies",FALSE,FALSE,FALSE,"[{""lang"":""sw"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",swahili.htm,FALSE,FALSE,sw,
6115,sv,,Swedish,Svenska,,109211,swed1254,indo1319,east2781,language,59.800634,17.389526,DK FI NO SE,swe,sv,I,L,10000000,sv,"Anna Greta Wide (1920 – 1965), a Swedish poet",FALSE,FALSE,FALSE,"[{""lang"":""sv"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",swedish.htm,FALSE,FALSE,"sv,sv-SE",
6187,ta,,Tamil,தமிழ்,,4453,tami1289,drav1251,tami1300,language,10.520219,78.825989,IN LK,tam,ta,I,L,75000000,ta,"Subramania Bharati (1882 – 1921), a Tamil writer, poet, journalist, Indian independence activist, social reformer and polyglot",FALSE,FALSE,FALSE,"[{""lang"":""ta"",""script"":""Taml"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",tamil.htm,TRUE,FALSE,ta,
6194,tt,,Tatar,татар,,1235,tata1255,turk1311,nort2696,language,55,50,AZ BY CN EE FI GE KZ LT LV RU UA,tat,tt,I,L,5200000,tt,"Şefika Gaspıralı (1886 – 1975), a politician, publisher, educator",FALSE,FALSE,FALSE,"[{""lang"":""tt"",""script"":""Cyrl"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",tatar.htm,TRUE,FALSE,tt,
6281,te,,Telugu,తెలుగు,,18874,telu1262,drav1251,telu1265,language,16.4529,78.7024,IN,tel,te,I,L,83000000,te,"Gidugu Venkata Ramamurthy (1863 – 1940), a Telugu writer and one of the earliest modern Telugu linguists and social visionaries during the British rule",FALSE,FALSE,FALSE,"[{""lang"":""te"",""script"":""Telu"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",telugu.htm,TRUE,FALSE,te,
6310,tg,,Tajik,тоҷикӣ,,1143,taji1245,indo1319,taji1250,language,38.8213,68.5549,AF CN KG TJ UZ,tgk,tg,I,L,8100000,tg,,FALSE,FALSE,FALSE,"[{""lang"":""tg"",""script"":""Cyrl"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""},{""lang"":""tg"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""},{""lang"":""tg"",""script"":""Arab"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""rtl""}]",tajik.htm,FALSE,FALSE,tg,
6311,tl,,Tagalog,Tagalog,,13580,taga1270,aust1307,taga1269,language,14.06,121.747,PH,tgl,tl,I,L,23800000,tl,"José Rizal (1861 – 1896), a Filipino nationalist and polymath during the tail end of the Spanish colonial period of the Philippines",TRUE,FALSE,FALSE,"[{""lang"":""tl"",""script"":""Zzzz"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",tagalog.htm,TRUE,FALSE,"tl,fil,fil-PH",
6325,th,,Thai,ไทย,,17167,thai1261,taik1256,laot1235,language,14.192,100.671,KH MM TH,tha,th,I,L,36000000,th,,FALSE,FALSE,TRUE,"[{""lang"":""th"",""script"":""Thai"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",thai.htm,FALSE,FALSE,"th,th-TH",
6359,ti,,Tigrinya,ትግርኛ,,600,tigr1271,afro1255,tigr1276,language,15.3359,38.9266,DJ ER ET SD,tir,ti,I,L,9850000,,,FALSE,FALSE,FALSE,"[{""lang"":""ti"",""script"":""Ethi"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",tigrinya.htm,FALSE,FALSE,ti,
6405,tlh,,Klingon,tlhIngan Hol,,,klin1234,arti1236,arti1236,language,,,US,tlh,,I,C,,tlh,A Klingon man as he appears in the Star Trek: The Original Series episode “Day of the Dove”,TRUE,FALSE,FALSE,"[{""lang"":""tlh"",""script"":""Piqd"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",,FALSE,FALSE,,"en,en-AU,en-CA,en-GB,en-IE,en-IN,en-US,en-ZA"
6552,tsd,,Tsakonian,Τσακωνική διάλεκτος,,38,tsak1248,indo1319,gree1276,language,37.1405,22.7341,GR,tsd,,I,L,,,,FALSE,FALSE,FALSE,"[{""lang"":""tsd"",""script"":""Grek"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",tsakonian.htm,FALSE,FALSE,,"el,el-GR"
6615,tr,,Turkish,Türkçe,,23116,nucl1301,turk1311,west2406,language,39.8667,32.8667,AL AM AZ BG CY GE GR IQ IR MK SY TR,tur,tr,I,L,75700000,tr,"Mehmet Akif Ersoy (1873 – 1936), a Turkish poet, writer, academic, politician, and the author of the Turkish National Anthem",FALSE,FALSE,FALSE,"[{""lang"":""tr"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""},{""lang"":""tr"",""script"":""Arab"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""rtl""}]",turkish.htm,TRUE,FALSE,"tr,tr-TR",
6725,ug,rtl,Uyghur,Уйғур (кирилл йезиғи),,1531,uigh1240,turk1311,uigh1243,language,43.88,87.38,CN IN KG KZ MN PK UZ,uig,ug,I,L,10000000,ug,"Abduhalik Uyghur (1901 – 1933), a Uyghur poet famous for his poem “Oyghan”",FALSE,FALSE,FALSE,"[{""lang"":""ug"",""script"":""Arab"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""rtl""},{""lang"":""ug"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""},{""lang"":""ug"",""script"":""Cyrl"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",uyghur.htm,TRUE,FALSE,"ug,tr,tr-TR",
6736,uk,,Ukrainian,українська,,8200,ukra1253,indo1319,ukra1257,language,49.796,29.945,BY HU MD PL RO RU SK UA,ukr,uk,I,L,35000000,uk,"Taras Shevchenko (1814 – 1861), a Ukrainian poet, writer, artist",FALSE,FALSE,FALSE,"[{""lang"":""uk"",""script"":""Cyrl"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",ukrainian.htm,FALSE,FALSE,uk,
6782,ur,rtl,Urdu,اُردو,,4346,urdu1245,indo1319,hind1270,language,25,67,AF BD IN PK,urd,ur,I,L,68620000,ur,"Ra’ana Liaquat Ali Khan (1905 – 1990), the First Lady of Pakistan from 1947 to 1951",FALSE,FALSE,FALSE,"[{""lang"":""ur"",""script"":""Arab"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""rtl""}]",urdu.htm,FALSE,TRUE,ur,
6824,uz,,Uzbek,ўзбекча,,1917,uzbe1247,turk1311,uygh1240,family,41,64,UZ,uzb,uz,M,L,34000000,uz,"Hamza Hakimzade Niyazi (1889 – 1929), an Uzbek author, composer, playwright, poet, scholar, political activist",TRUE,FALSE,FALSE,"[{""lang"":""uz"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""},{""lang"":""uz"",""script"":""Arab"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""rtl""},{""lang"":""uz"",""script"":""Cyrl"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",uzbek.htm,TRUE,FALSE,uz,
6846,vec,,Venetian,Talian,,4469,vene1258,indo1319,gall1279,language,45.503581,12.214167,BR HR IT MX SI,vec,,I,L,3852500,,,FALSE,FALSE,FALSE,"[{""lang"":""vec"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",venetian.htm,FALSE,FALSE,,"pt,pt-BR,pt-PT,hr,it,it-IT,es,es-419,es-AR,es-ES,es-MX,es-US,sl"
6858,vi,,Vietnamese,Việt,,24652,viet1252,aust1305,viet1251,language,20.681188,105.774071,CN LA VN,vie,vi,I,L,76000000,vi,"Ho Chi Minh (1890 – 1969), a Vietnamese revolutionary and politician, Prime Minister and President of North Vietnam",FALSE,FALSE,FALSE,"[{""lang"":""vi"",""script"":""Hani"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""},{""lang"":""vi"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",vietnamese.htm,FALSE,FALSE,vi,
6904,vo,,Volapük,Volapük,,3937,vola1234,arti1236,arti1236,language,51,9,DE,vol,vo,I,C,20,vo,"Johann Martin Schleyer (1831 – 1912), a German Catholic priest who invented the constructed language Volapük",FALSE,FALSE,FALSE,"[{""lang"":""vo"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",volapuk.htm,FALSE,FALSE,vo,
7075,wo,,Wolof,Wolof,,526,nucl1347,atla1278,wolo1247,language,15.2534,-15.383,GM GW ML MR SN,wol,wo,I,L,5454000,wo,,FALSE,FALSE,FALSE,"[{""lang"":""wo"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""},{""lang"":""wo"",""script"":""Arab"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""rtl""},{""lang"":""wo"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",wolof.htm,FALSE,FALSE,wo,"fr,fr-BE,fr-CA,fr-CH,fr-FR"
7127,wuu,,Wu,吴语,"Suzhounese,Shanghainese",,wuch1236,sino1245,wuhu1234,language,29.8621,119.682,CN,wuu,,I,L,80000000,wuu,"Lu Xun (1881 – 1936), a Chinese writer, essayist, poet, and literary critic",FALSE,TRUE,TRUE,"[{""lang"":""wuu"",""script"":""Hans"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",../chinese/wu.htm,FALSE,FALSE,"zh,zh-CN,zh-Hans,zh-Hant,zh-SG,zh-TW,zh-HK",
7227,xh,,Xhosa,IsiXhosa,,3158,xhos1239,atla1278,zulu1251,language,-31.0389,28.0769,BW LS ZA,xho,xh,I,L,8200000,xh,,FALSE,FALSE,FALSE,"[{""lang"":""xh"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",xhosa.htm,FALSE,FALSE,xh,
7331,xpe,ltr,Liberia Kpelle,Kpelle,,,libe1247,mand1469,kpel1252,language,6.92048,-9.96128,GN LR,xpe,,I,L,,,,FALSE,FALSE,FALSE,[],,FALSE,FALSE,,"fr,fr-BE,fr-CA,fr-CH,fr-FR,en,en-AU,en-CA,en-GB,en-IE,en-IN,en-US,en-ZA"
7476,ybe,ltr,Western Yugur,غوغر تىلى,,8,west2402,turk1311,east2792,language,39.0548,99.3112,CN,ybe,,I,L,4600,,,FALSE,FALSE,FALSE,[],,TRUE,FALSE,,"zh,zh-CN,zh-Hans,zh-Hant,zh-HK,zh-SG,zh-TW"
7522,yi,rtl,Yiddish,ייִדיש,,7261,yidd1255,indo1319,east2832,family,31.5,34.75,IL,yid,yi,M,L,1500000,yi,"Debora Vogel (1902 – 1942), a Polish-Jewish philosopher and poet",FALSE,FALSE,FALSE,"[{""lang"":""yi"",""script"":""Hebr"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""rtl""}]",yiddish.htm,FALSE,FALSE,yi,
7601,yo,,Yoruba,Yorùbá,,620,yoru1245,atla1278,lucu1239,language,7.15345,3.67225,BJ NG,yor,yo,I,L,50000000,yo,,FALSE,FALSE,FALSE,"[{""lang"":""yo"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",yoruba.htm,FALSE,FALSE,yo,
7644,yue,,Cantonese,粤语,"Yue,Yüeh",1733,yuec1235,sino1245,yuep1234,language,23,113,CN VN,yue,,I,L,84000000,yue,"Bruce Lee (1940 – 1973), a Hong Kong American martial artist, actor, director, martial arts instructor and philosopher",FALSE,TRUE,TRUE,"[{""lang"":""yue"",""script"":""Hans"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""},{""lang"":""yue"",""script"":""Hant"",""ms"":"""",""ml"":"""",""p"":""N"",""direction"":""""}]",../chinese/yue.htm,FALSE,FALSE,"zh,yue-HK,zh-CN,zh-Hans,zh-Hant,zh-HK,zh-SG,zh-TW",
7726,za,,Zhuang,Vahcuengh,,1937,nort3180,taik1256,nort3326,family,24.31,108.06,CN,zha,za,M,L,16000000,za,"Huang Xianfan (1899 – 1982), a Zhuang Chinese historian, ethnologist and educator",FALSE,FALSE,FALSE,"[{""lang"":""za"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""},{""lang"":""za"",""script"":""Hans"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",zhuang.htm,FALSE,FALSE,za,"zh,zh-CN,zh-Hans,zh-Hant,zh-HK,zh-SG,zh-TW"
7731,zh,,Chinese,汉语,,143063,sini1245,sino1245,sino1245,family,40.0209,116.228,CN KP LA MM MN RU TW VN,zho,zh,M,L,1200000000,zh,"Hu Shih (1891 – 1962), a Chinese diplomat, essayist, literary scholar, philosopher, and politician",FALSE,TRUE,TRUE,"[{""lang"":""zh"",""script"":""Bopo"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""},{""lang"":""zh"",""script"":""Phag"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""},{""lang"":""zh"",""script"":""Hans"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""},{""lang"":""zh"",""script"":""Hant"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",../chinese/index.htm,FALSE,FALSE,"zh,zh-CN,zh-Hans,zh-Hant,zh-HK,zh-SG,zh-TW",
7851,zu,,Zulu,IsiZulu,,3164,zulu1248,atla1278,zulu1251,language,-28.9,30.2,BW LS MZ SZ ZA,zul,zu,I,L,12000000,zu,,FALSE,FALSE,FALSE,"[{""lang"":""zu"",""script"":""Latn"",""ms"":"""",""ml"":"""",""p"":"""",""direction"":""""}]",zulu.htm,FALSE,FALSE,zu,
7863,zzj,ltr,Zuojiang Zhuang,Abaknon,,1,zuoj1238,taik1256,nort3180,language,22.4,106.9,CN VN,zzj,,I,L,,,,FALSE,FALSE,FALSE,[],,FALSE,FALSE,,"zh,zh-CN,zh-Hans,zh-Hant,zh-HK,zh-SG,zh-TW,vi"`,
  countries: `alpha2Code,name,native,phone,continent,capital,currency,languages,alpha3Code,numericCode,lat,long
AD,Andorra,Andorra,376,Europe,Andorra la Vella,EUR,ca,AND,20,42.5,1.6
AE,United Arab Emirates,دولة الإمارات العربية المتحدة,971,Asia,Abu Dhabi,AED,ar,ARE,784,24,54
AF,Afghanistan,افغانستان,93,Asia,Kabul,AFN,"ps,uz,tk",AFG,4,33,65
AG,Antigua and Barbuda,Antigua and Barbuda,1268,North America,Saint John's,XCD,"en,aig",ATG,28,17.05,-61.8
AI,Anguilla,Anguilla,1264,North America,The Valley,XCD,"en,aig",AIA,660,18.25,-63.1667
AL,Albania,Shqipëria,355,Europe,Tirana,ALL,sq,ALB,8,41,20
AM,Armenia,Հայաստան,374,Asia,Yerevan,AMD,"hy,ru",ARM,51,40,45
AO,Angola,Angola,244,Africa,Luanda,AOA,pt,AGO,24,-12.5,18.5
AQ,Antarctica,Antarctica,672,Antarctica,,,,ATA,10,-90,0
AR,Argentina,Argentina,54,South America,Buenos Aires,ARS,"es,gn",ARG,32,-34,-64
AS,American Samoa,American Samoa,1684,Oceania,Pago Pago,USD,"en,sm",ASM,16,-14.3333,-170
AT,Austria,Österreich,43,Europe,Vienna,EUR,de,AUT,40,47.3333,13.3333
AU,Australia,Australia,61,Oceania,Canberra,AUD,en,AUS,36,-27,133
AW,Aruba,Aruba,297,North America,Oranjestad,AWG,"nl,pa",ABW,533,12.5,-69.9667
AZ,Azerbaijan,Azərbaycan,994,Asia,Baku,AZN,az,AZE,31,40.5,47.5
BA,Bosnia and Herzegovina,Bosna i Hercegovina,387,Europe,Sarajevo,BAM,"bs,hr,sr",BIH,70,44,18
BB,Barbados,Barbados,1246,North America,Bridgetown,BBD,"en,bjs",BRB,52,13.1667,-59.5333
BD,Bangladesh,Bangladesh,880,Asia,Dhaka,BDT,bn,BGD,50,24,90
BE,Belgium,België,32,Europe,Brussels,EUR,"nl,fr,de",BEL,56,50.8333,4
BF,Burkina Faso,Burkina Faso,226,Africa,Ouagadougou,XOF,"fr,ff",BFA,854,13,-2
BG,Bulgaria,България,359,Europe,Sofia,BGN,bg,BGR,100,43,25
BH,Bahrain,البحرين,973,Asia,Manama,BHD,ar,BHR,48,26,50.55
BI,Burundi,Burundi,257,Africa,Bujumbura,BIF,"fr,rn",BDI,108,-3.5,30
BJ,Benin,Bénin,229,Africa,Porto-Novo,XOF,"fr,fon,ajg,gej,yo,bba,ddn,pil",BEN,204,9.5,2.25
BM,Bermuda,Bermuda,1441,North America,Hamilton,BMD,en,BMU,60,32.3333,-64.75
BN,Brunei,Negara Brunei Darussalam,673,Asia,Bandar Seri Begawan,BND,ms,BRN,96,4.5,114.6667
BO,Bolivia,Bolivia,591,South America,Sucre,"BOB,BOV","es,ay,qu",BOL,68,-17,-65
BR,Brazil,Brasil,55,South America,Brasília,BRL,pt,BRA,76,-10,-55
BS,Bahamas,Bahamas,1242,North America,Nassau,BSD,"en,bah",BHS,44,24.25,-76
BT,Bhutan,ʼbrug-yul,975,Asia,Thimphu,"BTN,INR",dz,BTN,64,27.5,90.5
BV,Bouvet Island,Bouvetøya,47,Antarctica,,NOK,"no,nb,nn",BVT,74,-54.4333,3.4
BW,Botswana,Botswana,267,Africa,Gaborone,BWP,"en,tn",BWA,72,-22,24
BY,Belarus,Белару́сь,375,Europe,Minsk,BYN,"be,ru",BLR,112,53,28
BZ,Belize,Belize,501,North America,Belmopan,BZD,"en,es",BLZ,84,17.25,-88.75
CA,Canada,Canada,1,North America,Ottawa,CAD,"en,fr",CAN,124,60,-95
CC,Cocos [Keeling] Islands,Cocos (Keeling) Islands,61,Asia,West Island,AUD,"en,coa",CCK,166,-12.5,96.8333
CD,Democratic Republic of the Congo,République démocratique du Congo,243,Africa,Kinshasa,CDF,"fr,ln,kg,sw,lu",COD,180,0,25
CF,Central African Republic,Ködörösêse tî Bêafrîka,236,Africa,Bangui,XAF,"fr,sg",CAF,140,7,21
CG,Republic of the Congo,République du Congo,242,Africa,Brazzaville,XAF,"fr,ln",COG,178,-1,15
CH,Switzerland,Schweiz,41,Europe,Bern,"CHE,CHF,CHW","de,fr,it",CHE,756,47,8
CI,Ivory Coast,Côte d'Ivoire,225,Africa,Yamoussoukro,XOF,"fr,ak,bci,dmn,klu",CIV,384,8,-5
CK,Cook Islands,Cook Islands,682,Oceania,Avarua,NZD,"en,rar,pnh,rkh",COK,184,-21.2333,-159.7667
CL,Chile,Chile,56,South America,Santiago,"CLF,CLP","es,arn,ay,rap,csg",CHL,152,-30,-71
CM,Cameroon,Cameroon,237,Africa,Yaoundé,XAF,"en,fr",CMR,120,6,12
CN,China,中国,86,Asia,Beijing,CNY,zh,CHN,156,35,105
CO,Colombia,Colombia,57,South America,Bogotá,COP,es,COL,170,4,-72
CR,Costa Rica,Costa Rica,506,North America,San José,CRC,"es,cba",CRI,188,10,-84
CU,Cuba,Cuba,53,North America,Havana,"CUC,CUP",es,CUB,192,21.5,-80
CV,Cape Verde,Cabo Verde,238,Africa,Praia,CVE,pt,CPV,132,16,-24
CX,Christmas Island,Christmas Island,61,Asia,Flying Fish Cove,AUD,"zh,ms,en,tl",CXR,162,-10.5,105.6667
CY,Cyprus,Κύπρος,357,Europe,Nicosia,EUR,"el,tr,hy",CYP,196,35,33
CZ,Czech Republic,Česká republika,420,Europe,Prague,CZK,"cs,sk",CZE,203,49.75,15.5
DE,Germany,Deutschland,49,Europe,Berlin,EUR,de,DEU,276,51,9
DJ,Djibouti,Djibouti,253,Africa,Djibouti,DJF,"fr,ar",DJI,262,11.5,43
DK,Denmark,Danmark,45,Europe,Copenhagen,DKK,da,DNK,208,56,10
DM,Dominica,Dominica,1767,North America,Roseau,XCD,"en,acf",DMA,212,15.4167,-61.3333
DO,Dominican Republic,República Dominicana,"1809,1829,1849",North America,Santo Domingo,DOP,es,DOM,214,19,-70.6667
DZ,Algeria,الجزائر,213,Africa,Algiers,DZD,ar,DZA,12,28,3
EC,Ecuador,Ecuador,593,South America,Quito,USD,"es,qu,jiv",ECU,218,-2,-77.5
EE,Estonia,Eesti,372,Europe,Tallinn,EUR,et,EST,233,59,26
EG,Egypt,مصر,20,Africa,Cairo,EGP,ar,EGY,818,27,30
EH,Western Sahara,الصحراء الغربية,212,Africa,El Aaiún,"MAD,DZD,MRU","ar,es",ESH,732,24.5,-13
ER,Eritrea,ኤርትራ,291,Africa,Asmara,ERN,"ti,ar,en",ERI,232,15,39
ES,Spain,España,34,Europe,Madrid,EUR,"es,eu,ca,gl,oc",ESP,724,40,-4
ET,Ethiopia,ኢትዮጵያ,251,Africa,Addis Ababa,ETB,am,ETH,231,8,38
FI,Finland,Suomi,358,Europe,Helsinki,EUR,"fi,sv",FIN,246,64,26
FJ,Fiji,Fiji,679,Oceania,Suva,FJD,"en,fj,hi,ur",FJI,242,-18,175
FK,Falkland Islands,Falkland Islands,500,South America,Stanley,FKP,en,FLK,238,-51.75,-59
FM,Micronesia,Micronesia,691,Oceania,Palikir,USD,"en,mh,gil,kos,na,nkr,kpg,ch,pau",FSM,583,6.9167,158.25
FO,Faroe Islands,Føroyar,298,Europe,Tórshavn,DKK,fo,FRO,234,62,-7
FR,France,France,33,Europe,Paris,EUR,"fr,br,gsw",FRA,250,46,2
GA,Gabon,Gabon,241,Africa,Libreville,XAF,"fr,fan,mdt,swj,puu,nzb",GAB,266,-1,11.75
GB,United Kingdom,United Kingdom,44,Europe,London,GBP,en,GBR,826,54,-2
GD,Grenada,Grenada,1473,North America,St. George's,XCD,"en,gcl,acf",GRD,308,12.1167,-61.6667
GE,Georgia,საქართველო,995,Asia,Tbilisi,GEL,ka,GEO,268,42,43.5
GF,French Guiana,Guyane française,594,South America,Cayenne,EUR,"fr,gcr",GUF,254,4,-53
GG,Guernsey,Guernsey,44,Europe,St. Peter Port,GBP,"en,fr",GGY,831,49.5,-2.56
GH,Ghana,Ghana,233,Africa,Accra,GHS,"en,dga,dgd,dgi,dag,ada,ee,gur,gaa,gjn,nzi,tw,gse",GHA,288,8,-2
GI,Gibraltar,Gibraltar,350,Europe,Gibraltar,GIP,"en,es",GIB,292,36.1833,-5.3667
GL,Greenland,Kalaallit Nunaat,299,North America,Nuuk,DKK,kl,GRL,304,72,-40
GM,Gambia,Gambia,220,Africa,Banjul,GMD,"en,fr,ar,wo,ff,mnk,fuc,srr,ble,mey,dyo,mfv,knf,snf,dyu,krx,kao,mlq,snk",GMB,270,13.4667,-16.5667
GN,Guinea,Guinée,224,Africa,Conakry,GNF,"fr,ff",GIN,324,11,-10
GP,Guadeloupe,Guadeloupe,590,North America,Basse-Terre,EUR,"fr,gcf",GLP,312,16.25,-61.5833
GQ,Equatorial Guinea,Guinea Ecuatorial,240,Africa,Malabo,XAF,"es,fr",GNQ,226,2,10
GR,Greece,Ελλάδα,30,Europe,Athens,EUR,el,GRC,300,39,22
GS,South Georgia and the South Sandwich Islands,South Georgia,500,Antarctica,King Edward Point,GBP,en,SGS,239,-54.5,-37
GT,Guatemala,Guatemala,502,North America,Guatemala City,GTQ,"es,quc,kek,cak",GTM,320,15.5,-90.25
GU,Guam,Guam,1671,Oceania,Hagåtña,USD,"en,ch,es",GUM,316,13.4667,144.7833
GW,Guinea-Bissau,Guiné-Bissau,245,Africa,Bissau,XOF,pt,GNB,624,12,-15
GY,Guyana,Guyana,592,South America,Georgetown,GYD,"en,gyn",GUY,328,5,-59
HK,Hong Kong,香港,852,Asia,City of Victoria,HKD,"zh,en",HKG,344,22.25,114.1667
HM,Heard Island and McDonald Islands,Heard Island and McDonald Islands,61,Antarctica,,AUD,en,HMD,334,-53.1,72.5167
HN,Honduras,Honduras,504,North America,Tegucigalpa,HNL,"es,cab,miq",HND,340,15,-86.5
HR,Croatia,Hrvatska,385,Europe,Zagreb,HRK,hr,HRV,191,45.1667,15.5
HT,Haiti,Haïti,509,North America,Port-au-Prince,"HTG,USD","fr,ht",HTI,332,19,-72.4167
HU,Hungary,Magyarország,36,Europe,Budapest,HUF,hu,HUN,348,47,20
ID,Indonesia,Indonesia,62,Asia,Jakarta,IDR,id,IDN,360,-5,120
IE,Ireland,Éire,353,Europe,Dublin,EUR,"ga,en",IRL,372,53,-8
IL,Israel,יִשְׂרָאֵל,972,Asia,Jerusalem,ILS,"he,ar",ISR,376,31.5,34.75
IM,Isle of Man,Isle of Man,44,Europe,Douglas,GBP,"en,gv",IMN,833,54.23,-4.55
IN,India,भारत,91,Asia,New Delhi,INR,"hi,en",IND,356,20,77
IO,British Indian Ocean Territory,British Indian Ocean Territory,246,Asia,Diego Garcia,USD,en,IOT,86,-6,71.5
IQ,Iraq,العراق,964,Asia,Baghdad,IQD,"ar,ku",IRQ,368,33,44
IR,Iran,ایران,98,Asia,Tehran,IRR,fa,IRN,364,32,53
IS,Iceland,Ísland,354,Europe,Reykjavik,ISK,is,ISL,352,65,-18
IT,Italy,Italia,39,Europe,Rome,EUR,it,ITA,380,42.8333,12.8333
JE,Jersey,Jersey,44,Europe,Saint Helier,GBP,"en,fr",JEY,832,49.21,-2.13
JM,Jamaica,Jamaica,1876,North America,Kingston,JMD,"en,jam",JAM,388,18.25,-77.5
JO,Jordan,الأردن,962,Asia,Amman,JOD,ar,JOR,400,31,36
JP,Japan,日本,81,Asia,Tokyo,JPY,ja,JPN,392,36,138
KE,Kenya,Kenya,254,Africa,Nairobi,KES,"en,sw",KEN,404,1,38
KG,Kyrgyzstan,Кыргызстан,996,Asia,Bishkek,KGS,"ky,ru",KGZ,417,41,75
KH,Cambodia,Kâmpŭchéa,855,Asia,Phnom Penh,KHR,km,KHM,116,13,105
KI,Kiribati,Kiribati,686,Oceania,South Tarawa,AUD,"en,gil",KIR,296,1.4167,173
KM,Comoros,Komori,269,Africa,Moroni,KMF,"ar,fr",COM,174,-12.1667,44.25
KN,Saint Kitts and Nevis,Saint Kitts and Nevis,1869,North America,Basseterre,XCD,"en,aig",KNA,659,17.3333,-62.75
KP,North Korea,북한,850,Asia,Pyongyang,KPW,ko,PRK,408,40,127
KR,South Korea,대한민국,82,Asia,Seoul,KRW,ko,KOR,410,37,127.5
KW,Kuwait,الكويت,965,Asia,Kuwait City,KWD,ar,KWT,414,29.3375,47.6581
KY,Cayman Islands,Cayman Islands,1345,North America,George Town,KYD,en,CYM,136,19.5,-80.5
KZ,Kazakhstan,Қазақстан,"76,77",Asia,Astana,KZT,"kk,ru",KAZ,398,48,68
LA,Laos,ສປປລາວ,856,Asia,Vientiane,LAK,lo,LAO,418,18,105
LB,Lebanon,لبنان,961,Asia,Beirut,LBP,"ar,fr",LBN,422,33.8333,35.8333
LC,Saint Lucia,Saint Lucia,1758,North America,Castries,XCD,"en,acf",LCA,662,13.8833,-61.1333
LI,Liechtenstein,Liechtenstein,423,Europe,Vaduz,CHF,de,LIE,438,47.1667,9.5333
LK,Sri Lanka,śrī laṃkāva,94,Asia,Colombo,LKR,"si,ta",LKA,144,7,81
LR,Liberia,Liberia,231,Africa,Monrovia,LRD,"en,kpe,bsq,lir,grb,dnj,lda,mev",LBR,430,6.5,-9.5
LS,Lesotho,Lesotho,266,Africa,Maseru,"LSL,ZAR","en,st",LSO,426,-29.5,28.5
LT,Lithuania,Lietuva,370,Europe,Vilnius,EUR,lt,LTU,440,56,24
LU,Luxembourg,Luxembourg,352,Europe,Luxembourg,EUR,"fr,de,lb",LUX,442,49.75,6.1667
LV,Latvia,Latvija,371,Europe,Riga,EUR,lv,LVA,428,57,25
LY,Libya,ليبيا,218,Africa,Tripoli,LYD,ar,LBY,434,25,17
MA,Morocco,المغرب,212,Africa,Rabat,MAD,ar,MAR,504,32,-5
MC,Monaco,Monaco,377,Europe,Monaco,EUR,"fr,lij,oc,it",MCO,492,43.7333,7.4
MD,Moldova,Moldova,373,Europe,Chișinău,MDL,ro,MDA,498,47,29
ME,Montenegro,Црна Гора,382,Europe,Podgorica,EUR,"sr,bs,sq,hr",MNE,499,42,19
MG,Madagascar,Madagasikara,261,Africa,Antananarivo,MGA,"fr,mg",MDG,450,-20,47
MH,Marshall Islands,M̧ajeļ,692,Oceania,Majuro,USD,"en,mh",MHL,584,9,168
MK,North Macedonia,Северна Македонија,389,Europe,Skopje,MKD,mk,MKD,807,41.8333,22
ML,Mali,Mali,223,Africa,Bamako,XOF,"fr,bm,ff",MLI,466,17,-4
MM,Myanmar [Burma],မြန်မာ,95,Asia,Naypyidaw,MMK,my,MMR,104,22,98
MN,Mongolia,Монгол улс,976,Asia,Ulan Bator,MNT,mn,MNG,496,46,105
MO,Macao,澳門,853,Asia,,MOP,"zh,pt",MAC,446,22.1667,113.55
MP,Northern Mariana Islands,Northern Mariana Islands,1670,Oceania,Saipan,USD,"en,ch",MNP,580,15.2,145.75
MQ,Martinique,Martinique,596,North America,Fort-de-France,EUR,"fr,acf",MTQ,474,14.6667,-61
MR,Mauritania,موريتانيا,222,Africa,Nouakchott,MRU,ar,MRT,478,20,-12
MS,Montserrat,Montserrat,1664,North America,Plymouth,XCD,"en,ga",MSR,500,16.75,-62.2
MT,Malta,Malta,356,Europe,Valletta,EUR,"mt,en",MLT,470,35.8333,14.5833
MU,Mauritius,Maurice,230,Africa,Port Louis,MUR,"en,mfe,bho",MUS,480,-20.2833,57.55
MV,Maldives,Maldives,960,Asia,Malé,MVR,dv,MDV,462,3.25,73
MW,Malawi,Malawi,265,Africa,Lilongwe,MWK,"en,ny",MWI,454,-13.5,34
MX,Mexico,México,52,North America,Mexico City,MXN,"es,yua,zap,nhe,nhw,ngu",MEX,484,23,-102
MY,Malaysia,Malaysia,60,Asia,Kuala Lumpur,MYR,ms,MYS,458,2.5,112.5
MZ,Mozambique,Moçambique,258,Africa,Maputo,MZN,pt,MOZ,508,-18.25,35
NA,Namibia,Namibia,264,Africa,Windhoek,"NAD,ZAR","en,af",NAM,516,-22,17
NC,New Caledonia,Nouvelle-Calédonie,687,Oceania,Nouméa,XPF,"fr,dhv,nen,pri,aji",NCL,540,-21.5,165.5
NE,Niger,Niger,227,Africa,Niamey,XOF,"fr,ha,dje,tmh",NER,562,16,8
NF,Norfolk Island,Norfolk Island,672,Oceania,Kingston,AUD,"en,pih",NFK,574,-29.0333,167.95
NG,Nigeria,Nigeria,234,Africa,Abuja,NGN,"en,ha,ig,yo",NGA,566,10,8
NI,Nicaragua,Nicaragua,505,North America,Managua,NIO,"es,miq",NIC,558,13,-85
NL,Netherlands,Nederland,31,Europe,Amsterdam,EUR,nl,NLD,528,52.5,5.75
NO,Norway,Norge,47,Europe,Oslo,NOK,"no,nb,nn",NOR,578,62,10
NP,Nepal,नपल,977,Asia,Kathmandu,NPR,ne,NPL,524,28,84
NR,Nauru,Nauru,674,Oceania,Yaren,AUD,"en,na",NRU,520,-0.5333,166.9167
NU,Niue,Niuē,683,Oceania,Alofi,NZD,"en,niu",NIU,570,-19.0333,-169.8667
NZ,New Zealand,New Zealand,64,Oceania,Wellington,NZD,"en,mi",NZL,554,-41,174
OM,Oman,عمان,968,Asia,Muscat,OMR,ar,OMN,512,21,57
PA,Panama,Panamá,507,North America,Panama City,"PAB,USD","es,gym",PAN,591,9,-80
PE,Peru,Perú,51,South America,Lima,PEN,"es,qu,ay",PER,604,-10,-76
PF,French Polynesia,Polynésie française,689,Oceania,Papeetē,XPF,"fr,ty,mrq,mqm",PYF,258,-15,-140
PG,Papua New Guinea,Papua Niugini,675,Oceania,Port Moresby,PGK,"en,tpi,ho,pgz",PNG,598,-6,147
PH,Philippines,Pilipinas,63,Asia,Manila,PHP,"tgl,fil,en",PHL,608,13,122
PK,Pakistan,Pakistan,92,Asia,Islamabad,PKR,"en,ur",PAK,586,30,70
PL,Poland,Polska,48,Europe,Warsaw,PLN,pl,POL,616,52,20
PM,Saint Pierre and Miquelon,Saint-Pierre-et-Miquelon,508,North America,Saint-Pierre,EUR,fr,SPM,666,46.8333,-56.3333
PN,Pitcairn Islands,Pitcairn Islands,64,Oceania,Adamstown,NZD,"en,pih",PCN,612,-24.7,-127.4
PR,Puerto Rico,Puerto Rico,"1787,1939",North America,San Juan,USD,"es,en",PRI,630,18.25,-66.5
PS,Palestine,فلسطين,970,Asia,Ramallah,ILS,ar,PSE,275,32,35.25
PT,Portugal,Portugal,351,Europe,Lisbon,EUR,pt,PRT,620,39.5,-8
PW,Palau,Palau,680,Oceania,Ngerulmud,USD,"en,pau",PLW,585,7.5,134.5
PY,Paraguay,Paraguay,595,South America,Asunción,PYG,"es,gn",PRY,600,-23,-58
QA,Qatar,قطر,974,Asia,Doha,QAR,ar,QAT,634,25.5,51.25
RE,Réunion,La Réunion,262,Africa,Saint-Denis,EUR,"fr,rcf",REU,638,-21.1,55.6
RO,Romania,România,40,Europe,Bucharest,RON,ro,ROU,642,46,25
RS,Serbia,Србија,381,Europe,Belgrade,RSD,sr,SRB,688,44,21
RU,Russia,Россия,7,Europe,Moscow,RUB,ru,RUS,643,60,100
RW,Rwanda,Rwanda,250,Africa,Kigali,RWF,"rw,en,fr",RWA,646,-2,30
SA,Saudi Arabia,العربية السعودية,966,Asia,Riyadh,SAR,ar,SAU,682,25,45
SB,Solomon Islands,Solomon Islands,677,Oceania,Honiara,SBD,"en,kwf,pis,alu",SLB,90,-8,159
SC,Seychelles,Seychelles,248,Africa,Victoria,SCR,"fr,en",SYC,690,-4.5833,55.6667
SD,Sudan,السودان,249,Africa,Khartoum,SDG,"ar,en",SDN,736,15,30
SE,Sweden,Sverige,46,Europe,Stockholm,SEK,sv,SWE,752,62,15
SG,Singapore,Singapore,65,Asia,Singapore,SGD,"en,ms,ta,zh",SGP,702,1.3667,103.8
SH,Saint Helena,Saint Helena,290,Africa,Jamestown,SHP,en,SHN,654,-15.9333,-5.7
SI,Slovenia,Slovenija,386,Europe,Ljubljana,EUR,sl,SVN,705,46,15
SJ,Svalbard and Jan Mayen,Svalbard og Jan Mayen,4779,Europe,Longyearbyen,NOK,no,SJM,744,78,20
SK,Slovakia,Slovensko,421,Europe,Bratislava,EUR,sk,SVK,703,48.6667,19.5
SL,Sierra Leone,Sierra Leone,232,Africa,Freetown,SLL,"en,kri",SLE,694,8.5,-11.5
SM,San Marino,San Marino,378,Europe,City of San Marino,EUR,it,SMR,674,43.7667,12.4167
SN,Senegal,Sénégal,221,Africa,Dakar,XOF,"fr,wo",SEN,686,14,-14
SO,Somalia,Soomaaliya,252,Africa,Mogadishu,SOS,"so,ar",SOM,706,10,49
SR,Suriname,Suriname,597,South America,Paramaribo,SRD,nl,SUR,740,4,-56
ST,São Tomé and Príncipe,São Tomé e Príncipe,239,Africa,São Tomé,STN,pt,STP,678,1,7
SV,El Salvador,El Salvador,503,North America,San Salvador,"SVC,USD","es,poc,ppl",SLV,222,13.8333,-88.9167
SY,Syria,سوريا,963,Asia,Damascus,SYP,ar,SYR,760,35,38
SZ,Swaziland,Swaziland,268,Africa,Lobamba,SZL,"en,ss",SWZ,748,-26.5,31.5
TC,Turks and Caicos Islands,Turks and Caicos Islands,1649,North America,Cockburn Town,USD,"en,tch",TCA,796,21.75,-71.5833
TD,Chad,Tchad,235,Africa,N'Djamena,XAF,"fr,ar",TCD,148,15,19
TF,French Southern Territories,Territoire des Terres australes et antarctiques fr,262,Antarctica,Port-aux-Français,EUR,fr,ATF,260,-43,67
TG,Togo,Togo,228,Africa,Lomé,XOF,"fr,ee,kbp",TGO,768,8,1.1667
TH,Thailand,ประเทศไทย,66,Asia,Bangkok,THB,th,THA,764,15,100
TJ,Tajikistan,Тоҷикистон,992,Asia,Dushanbe,TJS,"tg,ru",TJK,762,39,71
TK,Tokelau,Tokelau,690,Oceania,Fakaofo,NZD,"en,tkl",TKL,772,-9,-172
TL,East Timor,Timor-Leste,670,Oceania,Dili,USD,pt,TLS,626,-8.55,125.5167
TM,Turkmenistan,Türkmenistan,993,Asia,Ashgabat,TMT,"tk,ru",TKM,795,40,60
TN,Tunisia,تونس,216,Africa,Tunis,TND,ar,TUN,788,34,9
TO,Tonga,Tonga,676,Oceania,Nuku'alofa,TOP,"en,to",TON,776,-20,-175
TR,Turkey,Türkiye,90,Asia,Ankara,TRY,tr,TUR,792,39,35
TT,Trinidad and Tobago,Trinidad and Tobago,1868,North America,Port of Spain,TTD,"en,trf,tgh,hns",TTO,780,11,-61
TV,Tuvalu,Tuvalu,688,Oceania,Funafuti,AUD,"en,tvl",TUV,798,-8,178
TW,Taiwan,臺灣,886,Asia,Taipei,TWD,zh,TWN,158,23.5,121
TZ,Tanzania,Tanzania,255,Africa,Dodoma,TZS,"sw,en",TZA,834,-6,35
UA,Ukraine,Україна,380,Europe,Kyiv,UAH,uk,UKR,804,49,32
UG,Uganda,Uganda,256,Africa,Kampala,UGX,"en,sw",UGA,800,1,32
UM,U.S. Minor Outlying Islands,United States Minor Outlying Islands,1,Oceania,,USD,en,UMI,581,19.2833,166.6
US,United States,United States,1,North America,Washington D.C.,"USD,USN,USS",en,USA,840,38,-97
UY,Uruguay,Uruguay,598,South America,Montevideo,"UYI,UYU",es,URY,858,-33,-56
UZ,Uzbekistan,O‘zbekiston,998,Asia,Tashkent,UZS,"uz,ru",UZB,860,41,64
VA,Vatican City,Vaticano,379,Europe,Vatican City,EUR,"it,la",VAT,336,41.9,12.45
VC,Saint Vincent and the Grenadines,Saint Vincent and the Grenadines,1784,North America,Kingstown,XCD,"en,svc",VCT,670,13.25,-61.2
VE,Venezuela,Venezuela,58,South America,Caracas,VES,es,VEN,862,8,-66
VG,British Virgin Islands,British Virgin Islands,1284,North America,Road Town,USD,"en,vic",VGB,92,18.5,-64.5
VI,U.S. Virgin Islands,United States Virgin Islands,1340,North America,Charlotte Amalie,USD,"en,vic",VIR,850,18.3333,-64.8333
VN,Vietnam,Việt Nam,84,Asia,Hanoi,VND,vi,VNM,704,16,106
VU,Vanuatu,Vanuatu,678,Oceania,Port Vila,VUV,"bi,en,fr",VUT,548,-16,167
WF,Wallis and Futuna,Wallis et Futuna,681,Oceania,Mata-Utu,XPF,"fr,wls,fud",WLF,876,-13.3,-176.2
WS,Samoa,Samoa,685,Oceania,Apia,WST,"sm,en",WSM,882,-13.5833,-172.3333
YE,Yemen,اليَمَن,967,Asia,Sana'a,YER,ar,YEM,887,15,48
YT,Mayotte,Mayotte,262,Africa,Mamoudzou,EUR,"fr,swb,buc",MYT,175,-12.8333,45.1667
ZA,South Africa,South Africa,27,Africa,Pretoria,ZAR,"af,en,nr,st,ss,tn,ts,ve,xh,zu",ZAF,710,-29,24
ZM,Zambia,Zambia,260,Africa,Lusaka,ZMW,"en,bem,ny,toi",ZMB,894,-15,30
ZW,Zimbabwe,Zimbabwe,263,Africa,Harare,"USD,ZAR,BWP,GBP,AUD,CNY,INR,JPY","en,sn,nd",ZWE,716,-20,30`
};
