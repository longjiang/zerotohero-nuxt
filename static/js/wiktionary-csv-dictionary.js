// @/static/js/wiktionary-csv.js
importScripts("../vendor/fastest-levenshtein/fastest-levenshtein.js");
importScripts("../js/base-dictionary.js");

class WiktionaryCsvDictionary extends BaseDictionary {

  constructor({ l1 = undefined, l2 = undefined } = {}) {
    super({ l1, l2 });
    this.version = "2.18.0";
    this.headIndex = {};
    this.indexKeys = ['search', 'head'];
    this.useLocal = [ "eng-zho" ], // Load locally rather than from server
    this.indexDbVerByLang = {
      fra: '2.18.0',
      eng: '2.18.0',
      spa: '2.18.0',
      est: '2.18.0',
    };
    this.l2_mappings = {
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
    };
    this.supplementalLangs = {
      arz: "ara",
      bul: "mkd",
      ceb: "tgl",
      csb: "pol",
      cmn: "zho",
      goh: "gsw",
      gsw: "deu",
      ind: "msa",
      ins: "eng",
      jam: "eng",
      kok: "mar",
      mkd: "bul",
      msa: "ind",
      nob: "nno",
      nor: "nno",
      nsl: "nor",
      scn: "ita",
      sco: "eng",
      soa: "tha",
      tgl: "ceb",
      tsd: "ell",
      tir: "amh",
      wol: "fra",
      vec: "ita",
    };
  }

  credit() {
    let credit = `The dictionary is provided by <a href="https://en.wiktionary.org/wiki/Wiktionary:Main_Page">Wiktionary</a>, which is freely distribtued under the <a href="https://creativecommons.org/licenses/by-sa/3.0/">Creative Commons Attribution-ShareAlike License</a>. The dictionary is parsed by <a href="https://github.com/tatuylonen/wiktextract">wiktextract</a>.`;
    if (this.l2['iso639-3'] === "fas")
      credit =
        credit +
        ` Persian transliteration is made possible with <a href="https://github.com/PasaOpasen/PersianG2P/tree/master/transform%20dict">PasaOpasen/PersianG2P</a>.`;
    return credit;
  }

  dictionaryFile({ l1Code = undefined, l2Code = undefined } = {}) {
    if (l1Code && l2Code) {
      for (const key in this.l2Code_mappings) {
        if (l2Code === key) {
          l2Code = mappings[key];
          break;
        }
      }
      const baseUrl = this.useLocal.includes(`${l2Code}-${l1Code}`) ? "/" : SERVER;
      let filename = `${baseUrl}data/wiktionary-csv/${l2Code}-${l1Code}.csv.txt`;
      return filename;
    }
  }

  async loadData() {
    const l1Code = this.l1['iso639-3']
    const l2Code = this.l2['iso639-3']
    const file = this.dictionaryFile({ l1Code, l2Code });
    let words = await this.loadAndNormalizeDictionaryData({name: `wiktionary-${l2Code}-${l1Code}`, file});
    words = await this.loadSupplementalWords(words);
    words = words.filter((w) => w.head?.length > 0) // filter empty rows
    words = words.sort((a, b) => {
      if (a.head && b.head) {
        return b.head.length - a.head.length;
      }
    });
    this.words = words;
    console.log("Wiktionary: loaded.");
    return this;
  }

  async loadSupplementalWords(words) {
    const l1Code = this.l1['iso639-3']
    const l2Code = this.l2['iso639-3']
    let supplementalLangCode = this.supplementalLangs[l2Code];
    if (supplementalLangCode) {
      // Append indonesian words to malay dictionary so we get more words
      const file = this.dictionaryFile({ l1Code, l2Code: supplementalLangCode })
      let supplWords = await this.loadAndNormalizeDictionaryData({ name: `wiktionary-${supplementalLangCode}-${l1Code}`, file });
      for (let w of supplWords) {
        w.id = supplementalLangCode + "-" + w.id;
        w.supplementalLang = supplementalLangCode;
      }
      words = [...words, ...supplWords];
    }
    return words;
  }

  normalizeWord(item) {
    let bare = !isAccentCritical(this.l2) ? stripAccents(item.word) : item.word;
    item.search = bare.toLowerCase();
    if (this.l2.agglutinative) item.search = item.search.replace(/^-/, "");
    item.head = item.word;
    delete item.word;
    delete item.stems;
    delete item.phrases;
    item.wiktionary = true;
    item.definitions = item.definitions ? item.definitions.split("|") : [];
    item.id = "w" + hash(item.head + item.definitions[0]);

    if (item.han) {
      item.cjk = {
        canonical: item.han,
        pronunciation: item.head,
      };
      item.hanja = item.han;
    }
  }

  lookup(text) {
    let words = this.searchIndex[text.toLowerCase()];
    if (words && words[0]) return words[0];
  }

  lookupMultiple(text, ignoreAccents = false) {
    let textLower = text.toLowerCase();
    if (typeof ignoreAccents === "undefined") ignoreAccents = !isAccentCritical(this.l2);
    if (ignoreAccents) textLower = stripAccents(textLower);
    let words = this.searchIndex[textLower];
    return words || [];
  }
  
};
