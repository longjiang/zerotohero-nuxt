// @/static/js/wiktionary-csv.js
importScripts("../vendor/fastest-levenshtein/fastest-levenshtein.js");
importScripts("../vendor/localforage/localforage.js");
importScripts("../vendor/hash-string/hash-string.min.js");
importScripts("../vendor/fuzzy-search/FuzzySearch.js");
importScripts("../js/base-dictionary.js");

class WiktionaryCsvDictionary extends BaseDictionary {

  constructor({ l1 = undefined, l2 = undefined } = {}) {
    super({ l1, l2 });

    this.version = "2.17.1";
    this.dictionary = undefined;

    this.headIndex = {};
    this.searchIndex = {};
    this.phraseIndex = {};
    this.cache = {};
    this.tables = [];
    this.searcher = null;
    this.indexDbVerByLang = {
      fra: 2,
      eng: 5,
      spa: 2,
      est: 3,
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
      let filename = `${SERVER}data/wiktionary-csv/${l2Code}-${l1Code}.csv.txt`;
      return filename;
    }
  }

  async loadData() {
    const l1Code = this.l1['iso639-3']
    const l2Code = this.l2['iso639-3']
    const file = this.dictionaryFile({ l1Code, l2Code });
    let words = await this.loadWords(file);
    words = await this.loadSupplementalWords(words);
    words = words.sort((a, b) => {
      if (a.head && b.head) {
        return b.head.length - a.head.length;
      }
    });
    this.words = words;
    this.createIndices();
    this.searcher = new FuzzySearch(this.words, ["search"], {
      caseSensitive: false,
      sort: true,
    });
    // this.tokenizer = TokenizerFactory.createTokenizer(this.l2, this.words)
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
      let supplWords = await this.loadWords(file);
      for (let w of supplWords) {
        w.id = supplementalLangCode + "-" + w.id;
        w.supplementalLang = supplementalLangCode;
      }
      words = [...words, ...supplWords];
    }
    return words;
  }

  async loadWords(file) {
    let data;
    const l1Code = this.l1['iso639-3']
    const l2Code = this.l2['iso639-3']
    let indexedDBKey = `wiktionary-${l2Code}-${l1Code}`;
    if (this.indexDbVerByLang[l2Code])
      indexedDBKey += "-v" + this.indexDbVerByLang[l2Code]; // Force refresh a dictionary when it's outdated
    data = await localforage.getItem(indexedDBKey);
    if (data) {
      console.log(
        `Wiktionary: data loaded from local indexedDB via localforage, key '${indexedDBKey}'`
      );
    } else {
      console.log(`Wiktionary: loading ${file}`);
      let res = await axios.get(file);
      data = res.data;
      res = null;
    }
    if (!data) return [];
    localforage.setItem(indexedDBKey, data);
    let words = this.parseDictionaryCSV(data);
    words.forEach((word) => {
      word.id = "w" + hash(word.head + word.definitions[0]);
    });
    console.log(`Wiktionary: ${file} loaded.`);
    return words;
  }

  createIndices() {
    console.log("Wiktionary: Indexing...");
    const l1Code = this.l1['iso639-3']
    for (let word of this.words) {
      for (let indexType of ["head", "search"]) {
        if (!Array.isArray(this[indexType + "Index"][word[indexType]]))
          this[indexType + "Index"][word[indexType]] = [];
        this[indexType + "Index"][word[indexType]] =
          this[indexType + "Index"][word[indexType]].concat(word);
      }
      if (/[\s'.\-]/.test(word.head)) {
        let words = word.head.split(/[\s'.\-]/);
        // We don't want to index phrases that are too long
        if (words.length < 4) {
          for (let w of words) {
            this.addToPhraseIndex(w, word);
          }
        }
      }
    }
    for (let key in this.phraseIndex) {
      this.phraseIndex[key] = this.phraseIndex[key].sort(
        (a, b) => a.head.length - b.head.length
      );
    }
  }

  addToPhraseIndex(head, word) {
    let w = "@" + head;
    if (!this.phraseIndex[w]) this.phraseIndex[w] = [];
    this.phraseIndex[w].push(word);
  }

  getPhraseIndex(head) {
    let w = "@" + head;
    if (!this.phraseIndex[w]) this.phraseIndex[w] = [];
    return this.phraseIndex[w];
  }

  parseDictionaryCSV(data) {
    console.log("Wiktionary: parsing words from CSV...");
    let parsed = Papa.parse(data, { header: true, delimiter: "," });
    let words = parsed.data;
    let hasStems = parsed.meta.fields.includes("stems");
    let hasPhrases = parsed.meta.fields.includes("phrases");
    words = words
      .filter((w) => w.word?.length > 0) // filter empty rows
      .map((item) => this.augmentCSVRow(item, !hasStems, !hasPhrases));
    return words;
  }

  augmentCSVRow(item, findStems = false, findPhrases = false) {
    let bare = !isAccentCritical(this.l2) ? stripAccents(item.word) : item.word;
    item.search = bare.toLowerCase();
    if (this.l2.agglutinative) item.search = item.search.replace(/^-/, "");
    item.head = item.word;
    delete item.word;
    delete item.stems;
    delete item.phrases;
    item.wiktionary = true;
    item.definitions = item.definitions ? item.definitions.split("|") : [];

    if (item.han) {
      item.cjk = {
        canonical: item.han,
        pronunciation: item.head,
      };
      item.hanja = item.han;
    }
    return item;
  }

  findPhrases(word, limit = 50) {
    if (word) {
      if (!word.phrases || word.phrases.length === 0) {
        const phrases = this.getPhraseIndex(word.head) || [];
        return phrases.slice(0, limit);
      } else {
        return word.phrases.slice(0, limit);
      }
    }
  }  

  lookup(text) {
    let words = this.searchIndex[text.toLowerCase()];
    if (words && words[0]) return words[0];
  }

  lookupMultiple(text, ignoreAccents = false) {
    if (ignoreAccents && !isAccentCritical(this.l2)) text = stripAccents(text);
    let type = ignoreAccents ? "search" : "head";
    let words = this[type + "Index"][text.toLowerCase()];
    return words || [];
  }

  lookupByDef(text, limit = 30) {
    text = text.toLowerCase();
    let results = [];
    for (let word of this.words) {
      for (let d of word.definitions) {
        let found = d.toLowerCase().includes(text);
        if (found) {
          results.push(
            Object.assign({ score: 1 / (d.length - text.length + 1) }, word)
          );
        }
      }
    }
    results = results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  }

  lookupFuzzy(text, limit = 30, quick = false) {
    if (!isAccentCritical(this.l2)) text = stripAccents(text);
    text = text.toLowerCase();
    let uniqueWords = new Set();

    (this.searchIndex[text] || []).forEach((word) => {
      uniqueWords.add(word);
    });

    let words = Array.from(uniqueWords).map((word) => {
      return { score: 1, w: word };
    });

    if (!quick) {

      // Perform a fuzzy search.
      let wordsFromFuzzySearch = this.searcher.search(text).slice(0, limit);
      words = words.concat(
        wordsFromFuzzySearch.map((w) => {
          return { w, score: 0.5 };
        })
      );

      words = words.sort((a, b) => b.score - a.score);
    }
    words = words.slice(0, limit);
    return words.map((w) => w.w);
  }
  
};
