importScripts("../vendor/fastest-levenshtein/fastest-levenshtein.js");
importScripts("../vendor/localforage/localforage.js")
importScripts("../vendor/hash-string/hash-string.min.js")

const PYTHON_SERVER = 'https://python.zerotohero.ca/'

const PROXY_SERVER = 'https://server.chinesezerotohero.com/'

const Dictionary = {
  name: "wiktionary-json",
  version: '2.2.4.2',
  file: undefined,
  dictionary: undefined,
  words: [],
  headIndex: {},
  searchIndex: {},
  phraseIndex: {},
  inflectionIndex: {},
  lemmaIndex: {},
  cache: {},
  tables: [],
  frequency: undefined,
  useJSON: [],
  hasFrequency: [],
  indexDbVerByLang: {
    fra: 2,
    eng: 5,
    spa: 2,
    est: 3
  },
  tokenizationCache: {},
  server: "https://server.chinesezerotohero.com/",
  l1: undefined,
  l2: undefined,
  lemmatizationLangs: { // Languages that can be lemmatized by https://github.com/michmech/lemmatization-lists
    ast: "ast",
    bul: "bg",
    // cat: 'ca', // Large ones are disabled because they are not necessary
    ces: "cs",
    cym: "cy",
    // deu: 'de',
    // eng: 'en',
    spa: 'es',
    est: "et",
    fas: "fa",
    // fra: 'fr',
    gle: "ga",
    gla: "gd",
    glg: "gl",
    glv: "gv",
    hun: "hu",
    // ita: 'it',
    // por: 'pt',
    ron: "ro",
    // rus: 'ru',
    slk: "sk",
    slv: "sl",
    swe: 'sv', // Swedish is enabled because Swedish wiktionary has difficulty getting lemma
    ukr: "uk"
  },
  supplementalLangs: {
    arz: "ara",
    ceb: "tgl",
    csb: "pol",
    cmn: "zho",
    goh: "gsw",
    gsw: "deu",
    ind: "msa",
    ins: "eng",
    jam: "eng",
    kok: "mar",
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
    vec: "ita"
  },
  lemmatization: undefined,
  accentCritical: false,
  accentCriticalLangs: ["tur", "vie", "fra"], // Languages that should not strip accents when searching
  credit() {
    let credit = `The dictionary is provided by <a href="https://en.wiktionary.org/wiki/Wiktionary:Main_Page">Wiktionary</a>, which is freely distribtued under the <a href="https://creativecommons.org/licenses/by-sa/3.0/">Creative Commons Attribution-ShareAlike License</a>. The dictionary is parsed by <a href="https://github.com/tatuylonen/wiktextract">wiktextract</a>.`;
    if (this.l2 === "fas")
      credit =
        credit +
        ` Persian transliteration is made possible with <a href="https://github.com/PasaOpasen/PersianG2P/tree/master/transform%20dict">PasaOpasen/PersianG2P</a>.`;
    return credit;
  },
  dictionaryFile({ l1 = undefined, l2 = undefined } = {}) {
    if (l1 && l2) {
      l2 = l2
        .replace("hrv", "hbs") // Serbian uses Serbo-Croatian
        .replace("nor", "nob") // Default Norwegian to Bokmål (which is supplemented with Nynorsk)
        .replace("srp", "hbs") // Croatian uses Serbo-Croatian
        .replace("bos", "hbs") // Bosnian uses Serbo-Croatian
        .replace("cnr", "hbs") // Montenegrin uses Serbo-Croatian
        .replace("run", "kin") // Rundi uses Rwanda-Rundi
        .replace("hbo", "heb") // Ancient Hebrew uses Hebrew
        .replace("grc", "ell") // Ancient Greek uses Greek
        .replace("hmn", "mww") // Hmong uses white Hmong
        .replace("prs", "fas") // Dari uses Persian
        .replace("arb", "ara") // Modern Standard Arabic uses Arabic
        .replace("zsm", "msa") // Standard Malaysian uses Malaysian
        .replace("lvs", "lav") // Standard Latvian uses Latvian
        .replace("ekk", "est"); // Standard Estonian uses Estonian
      let csv = !this.useJSON.includes(this.l2);
      let filename = `${this.server}data/wiktionary${csv ? "-csv" : ""
        }/${l2}-${l1}.${csv ? "csv" : "json"}.txt`;
      return filename;
    }
  },
  isAccentCritical() {
    return this.accentCriticalLangs.includes(this.l2);
  },
  async load({ l1 = undefined, l2 = undefined } = {}) {
    if (l1 && l2) {
      this.l1 = l1;
      this.l2 = l2;
      this.accentCritical = this.isAccentCritical();
      this.file = this.dictionaryFile({ l1, l2 });
      if (this.hasFrequency.includes(this.l2) && this.useJSON.includes(this.l2))
        await this.loadFrequency();
      let words = await this.loadWords(this.file);
      if (this.lemmatizationLangs[this.l2]) {
        this.lemmatization = await this.loadLemmatizationTable(
          this.lemmatizationLangs[this.l2]
        );
      }
      let supplementalLang = this.supplementalLangs[l2];
      if (l1 === "eng" && supplementalLang) {
        // Append indonesian words to malay dictionary so we get more words
        let supplWords = await this.loadWords(
          this.dictionaryFile({ l1, l2: supplementalLang })
        );
        for (let w of supplWords) {
          w.id = supplementalLang + "-" + w.id;
          w.supplementalLang = supplementalLang;
        }
        words = words.concat(supplWords);
        words = words.sort((a, b) => {
          if (a.head && b.head) {
            return b.head.length - a.head.length;
          }
        });
      }
      this.words = words;
      this.createIndices();
      console.log("Wiktionary: loaded.");
      return this;
    }
  },
  async loadFrequency() {
    console.log(`Wiktionary: loading frequency...`);
    let res = await axios.get(
      `${this.server}data/frequency/frequency-${this.l2}.csv.txt`
    );
    if (res && res.data) {
      let parsed = Papa.parse(res.data, { header: true });
      this.frequency = {};
      for (let row of parsed.data) {
        let search = row.word.toLowerCase();
        this.frequency[search] = Math.max(
          this.frequency[search] || 0,
          Number(row.count)
        );
      }
    }
  },
  /**
   * Get a word by ID. This is called from various components.
   * @param {*} id the word's id
   * @param {*} head (optional) the head of the word to check if matches the word retrieved; if mismatched, we'll look for a matching word instead.
   * @returns 
   */
  get(id, head) {
    let word
    word = this.words.find(w => w.id === id);
    if (head && word && word.head !== head) {
      word = this.lookup(head)
    }
    this.addPhrasesToWord(word)
    return word
  },
  getWordsWithFrequencyGreaterThan(frequency) {
    let count = this.words.filter(w => w.frequency > frequency).length;
    console.log(
      `There are ${count} words (${(count / this.words.length) *
      100}% total) with frequency > ${frequency}`
    );
    return count;
  },
  async loadWords(file) {
    let data
    let indexedDBKey = `wiktionary-${this.l2}-${this.l1}`
    if (this.indexDbVerByLang[this.l2]) indexedDBKey += '-v' + this.indexDbVerByLang[this.l2] // Force refresh a dictionary when it's outdated
    if (!this.useJSON.includes(this.l2)) {
      data = await localforage.getItem(indexedDBKey)
    }
    if (data) {
      console.log(`Wiktionary: data loaded from local indexedDB via localforage, key '${indexedDBKey}'`);
    } else {
      console.log(`Wiktionary: loading ${file}`);
      let res = await axios.get(file);
      data = res.data
      res = null;
    }
    if (!data) return
    if (!this.useJSON.includes(this.l2)) localforage.setItem(indexedDBKey, data)
    let words = !this.useJSON.includes(this.l2)
      ? this.parseDictionaryCSV(data)
      : this.parseDictionaryJSON(data);
    words = words.sort((a, b) => {
      if (a.head && b.head) {
        return b.head.length - a.head.length;
      }
    });
    words = words.map((word, index) => {
      word.id = 'w' + hash(word.head + word.definitions[0]);
      return word;
    });
    console.log(`Wiktionary: ${file} loaded.`);
    return words;
  },
  createIndices() {
    console.log("Wiktionary: Indexing...");
    for (let word of this.words) {
      for (let indexType of ["head", "search"]) {
        if (!Array.isArray(this[indexType + "Index"][word[indexType]]))
          this[indexType + "Index"][word[indexType]] = [];
        this[indexType + "Index"][word[indexType]] = this[indexType + "Index"][
          word[indexType]
        ].concat(word);
      }
      if (/[\s'.\-]/.test(word.head)) {
        for (let w of word.head.split(/[\s']/)) {
          this.addToPhraseIndex(w, word)
        }
      }
    }
    this.buildInflectionIndex()
    for (let key in this.phraseIndex) {
      this.phraseIndex[key] = this.phraseIndex[key].sort((a, b) => a.head.length - b.head.length)
    }
  },
  addToPhraseIndex(head, word) {
    let w = '@' + head
    if (!this.phraseIndex[w]) this.phraseIndex[w] = []
    this.phraseIndex[w].push(word)
  },
  getPhraseIndex(head) {
    let w = '@' + head
    if (!this.phraseIndex[w]) this.phraseIndex[w] = []
    return this.phraseIndex[w]
  },
  lemmaKey(lemma) {
    return 'l' + lemma
  },
  buildInflectionIndex() {
    for (let word of this.words) {
      for (let definition of word.definitions) {
        let lemma = this.lemmaFromDefinition(definition)
        if (lemma) {
          let lemmaWords = this.searchIndex[lemma.lemma.toLowerCase()]
          if (lemmaWords) {
            let lemmaKey = this.lemmaKey(lemma.lemma)
            this.inflectionIndex[word.head] = this.inflectionIndex[word.head] || []
            this.inflectionIndex[word.head] = this.inflectionIndex[word.head].concat(lemmaWords)
            this.lemmaIndex[lemmaKey] = this.lemmaIndex[lemmaKey] || []
            this.lemmaIndex[lemmaKey].push(word)
          }
        }
      }
    }
    for (let form in this.inflectionIndex) {
      this.inflectionIndex[form] = this.uniqueByValue(this.inflectionIndex[form], 'id')
    }

    for (let lemmaKey in this.lemmaIndex) {
      this.lemmaIndex[lemmaKey] = this.uniqueByValue(this.lemmaIndex[lemmaKey], 'id')
    }
  },
  parseDictionaryCSV(data) {
    console.log("Wiktionary: parsing words from CSV...");
    let parsed = Papa.parse(data, { header: true });
    let words = parsed.data;
    let hasStems = parsed.meta.fields.includes('stems')
    let hasPhrases = parsed.meta.fields.includes('phrases')
    words = words
      .filter(w => w.word.length > 0) // filter empty rows
      .map(item => this.augmentCSVRow(item, !hasStems, !hasPhrases));
    return words;
  },
  augmentCSVRow(item, findStems = false, findPhrases = false) {
    let bare = !this.accentCritical ? this.stripAccents(item.word) : item.word;
    item.search = bare.toLowerCase();
    if (this.l2.agglutinative) item.search = item.search.replace(/^-/, "");
    item.head = item.word;
    delete item.word;
    delete item.stems;
    delete item.phrases;
    item.wiktionary = true;
    item.definitions = item.definitions ? item.definitions.split("|") : [];
    // item.phrases = item.phrases ? item.phrases.split("|") : [];

    if (this.frequency && !item.frequency)
      item.frequency = this.frequency[item.search];
    if (item.han) {
      item.cjk = {
        canonical: item.han,
        pronunciation: item.head
      };
      item.hanja = item.han;
    }
    return item;
  },
  parseDictionaryJSON(data) {
    console.log("Wiktionary: parsing words from JSON...");
    this.words = data;
    let words = [];
    for (let item of this.words) {
      if (item.word && !item.redirect) {
        let definitions = [];
        let stems = [];
        let gender;
        if (
          item.head_templates &&
          item.head_templates[0] &&
          item.head_templates[0].args &&
          item.head_templates[0].args.g
        ) {
          gender = item.head_templates[0].args.g;
        }
        if (item.senses && item.senses[0]) {
          if (
            item.senses[0].tags &&
            ["feminine", "masculine", "neuter"].includes(item.senses[0].tags[0])
          ) {
            gender = { masculine: "m", feminine: "f", neuter: "n" }[
              item.senses[0].tags[0]
            ];
          }
          for (let sense of item.senses) {
            if (sense.glosses) {
              if (!sense.complex_inflection_of) {
                let definition = sense.glosses[0];
                if (sense.form_of && sense.form_of[0]) {
                  let stemStr = sense.form_of[0];
                  if (typeof stemStr === "object" && stemStr.word)
                    stemStr = stemStr.word;
                  if (typeof stemStr === "string") {
                    let stem = this.normalizeStem(stemStr);
                    stems.push(stem);
                    if (!definition.includes(" of ")) {
                      definition = definition + " of " + stem;
                    }
                  }
                }
                definitions.push(definition);
              } else {
                // definitions.concat(this.inflections(sense)) // Probably not that useful in practice.
              }
            }
          }
        }
        if (definitions.length > 0) {
          let audio = undefined;
          if (item.sounds) {
            for (let pronunciation of item.sounds) {
              if (pronunciation.audio) {
                audio = pronunciation.audio;
              }
            }
          }
          let bare = this.accentCritical
            ? this.stripAccents(item.word)
            : item.word;
          let sounds = item.sounds && item.sounds.length > 0 ? item.sounds : []
          if (this.l2 !== 'jpn') sounds = sounds.filter(s => s['ipa'])
          let pronunciations = sounds.map(s => {
            let t = []
            // Each sound has unknown keys like 'ipa', 'other', etc, so we loop through all keys and join them with ', '
            for (let key in s) {
              if (s[key] && typeof s[key] === 'string') t.push(s[key].replace(/[/\[\]]/g, ""))
            }
            return t.join(', ')
          })
          if (item.heads)
            pronunciations = pronunciations.concat(
              item.heads.filter(h => h.tr).map(h => h.tr)
            );
          pronunciations = this.unique(pronunciations);
          let search = bare.toLowerCase();
          if (this.l2.agglutinative) search = search.replace(/^-/, "");
          let word = {
            bare,
            search,
            head: item.word,
            pronunciation:
              pronunciations.length > 0 ? pronunciations.join(", ") : undefined,
            audio: audio,
            definitions: definitions,
            pos: item.pos,
            gender: gender,
            stems: stems.filter(s => s !== item.word),
            phrases: item.derived ? item.derived.map(d => d.word) : [],
            wiktionary: true
          };
          if (["vie", "kor"].includes(this.l2)) {
            let sino;
            if (this.l2 === "vie") sino = this.getVietnameseHanTu(item);
            if (this.l2 === "kor") sino = this.getKoreanHanja(item);
            word.cjk = {
              canonical: sino,
              phonetics: head
            };
            word.hanja = sino;
          }
          if (this.frequency && !word.frequency)
            word.frequency = this.frequency[word.search];
          words.push(Object.assign(item, word));
        }
      }
    }
    return words;
  },
  async loadLemmatizationTable(langCode) {
    let res = await axios.get(
      `${this.server}data/lemmatization-lists/lemmatization-${langCode}.txt`
    );
    if (res && res.data) {
      let parsed = Papa.parse(res.data, { header: false });
      let table = {};
      for (let row of parsed.data) {
        let lemma = row[0];
        let surface = row[1];
        if (surface && lemma) {
          if (!table[surface]) table[surface] = [];
          table[surface].push(lemma);
        }
      }
      return table;
    }
  },
  /**
   * Romanize Persian text
   * @param {String} text
   */
  async romanizePersian(text) {
    if (this.l2 !== "fas") return;
    text = text.trim();
    let row = this.romanizations.find(r => r.persian === text);
    if (row) return row.roman;
    else {
      let url = `${PYTHON_SERVER}transliterate-persian?text=${encodeURIComponent(
        text
      )}`;
      let transliteration = await this.proxy(url, -1);
      return transliteration;
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
  getKoreanHanja(item) {
    if (!item["etymology_text"]) return;
    let hanja = item["etymology_text"].replace("Sino-Korean word from ", "");
    hanja = hanja.replace("From Middle Chinese ", "");
    hanja = hanja.replace(".", "");
    hanja = hanja.replace(/\(.*\)/, "");
    hanja = hanja.replace(/,.*/, "");
    hanja = hanja.trim();
    
    if (this.isHan(hanja)) {
      return hanja;
    }
  },
  getVietnameseHanTu(item) {
    if (!item["etymology-templates"]) return;
    let etymologyItems = item["etymology-templates"].filter(
      t =>
        t.args &&
        t.name &&
        t.name === "der" &&
        t.args &&
        t.args[2] &&
        t.args[2] === "zh" &&
        t.args[3] &&
        this.isHan(t.args[3])
    );
    if (etymologyItems.length === 0) {
      etymologyItems = item["etymology-templates"].filter(
        t =>
          t.args &&
          t.name &&
          t.name === "m" &&
          t.args &&
          t.args[1] &&
          t.args[1] === "vi" &&
          t.args[2] &&
          this.isHan(t.args[2])
      );
    } else {
      etymologyItems.map(i => (i.args[2] = i.args[3]));
    }
    let etymologyText = etymologyItems.map(i => i.args[2]);
    if (etymologyText.length > 0) {
      if (etymologyText[0].length > 1) {
        etymologyText = etymologyText[0];
      } else {
        etymologyText = etymologyText.join("");
      }
    } else {
      etymologyText = undefined;
    }
    return etymologyText;
  },
  hasHan(text) {
    return text.match(/[\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u3005\u3007\u3021-\u3029\u3038-\u303B‌​\u3400-\u4DB5\u4E00-\u9FCC\uF900-\uFA6D\uFA70-\uFAD9]+/g);
  },
  isHan(text) {
    return /^[\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u3005\u3007\u3021-\u3029\u3038-\u303B‌​\u3400-\u4DB5\u4E00-\u9FCC\uF900-\uFA6D\uFA70-\uFAD9]+$/.test(text);
  },
  inflections(sense) {
    let definitions = [];
    for (let inflection of sense.complex_inflection_of) {
      let head = inflection["1"] || inflection["2"];
      if (head) {
        definitions.push(
          `${inflection["3"]} ${inflection["4"]} ${inflection["5"]} inflection of <a href="https://en.wiktionary.org/wiki/${head}" target="_blank">${head}</a>`
        );
      }
    }
    return definitions;
  },
  exportCSV() {
    console.log("Wiktionary: Exporting CSV...");
    let words = this.words;
    let maxFrequency = 0;
    if (this.frequency) {
      for (let word of words) {
        if (word.frequency > maxFrequency) maxFrequency = word.frequency;
      }
    }
    words = words.map(item => {
      let word = {
        word: item.head,
        pronunciation: item.pronunciation,
        audio: item.audio,
        definitions: item.definitions.join("|"),
        pos: item.pos,
        gender: item.gender
      };
      if (["vie", "kor"].includes(this.l2)) {
        word.han =
          item.cjk && item.cjk.canonical ? item.cjk.canonical : undefined;
      }
      if (this.frequency)
        word.frequency = Math.round((item.frequency / maxFrequency) * 1000);
      return word;
    });
    let csv = Papa.unparse(words);
    console.log("CSV exported.");
    return csv;
  },
  normalizeStem(stemStr) {
    stemStr = stemStr.replace(/ \(.*\)/, "").replace(/ \[\[.*\]\]/g, "");
    if (this.l2 === "heb") {
      stemStr = stemStr.split(/ \u000092 /)[0];
      stemStr = this.stripHebrewVowels(stemStr.replace(/\u200e/gi, ""));
    }
    return stemStr.trim();
  },
  /**
   * Get a word by ID.
   * @param {*} id the word's id
   * @param {*} head (optional) the head of the word to check if matches the word retrieved; if mismatched, we'll look for a matching word instead.
   * @returns 
   */
  get(id, head) {
    let word
    word = this.words.find(w => w.id === id);
    if (head && word && word.head !== head) {
      word = this.lookup(head)
    }
    this.addPhrasesToWord(word)
    return word
  },
  addPhrasesToWord(word) {
    if (word) {
      if (!word.phrases || word.phrases.length === 0) {
        word.phrases = this.getPhraseIndex(word.head) || []
      }
    }
  },
  lookup(text) {
    let words = this.searchIndex[text.toLowerCase()];
    if (words && words[0]) return words[0];
  },
  lookupMultiple(text, ignoreAccents = false) {
    if (ignoreAccents && !this.accentCritical) text = this.stripAccents(text);
    let type = ignoreAccents ? "search" : "head";
    let words = this[type + "Index"][text.toLowerCase()];
    return words || [];
  },
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
  },
  /**
   * Lemmatizes some languages (languages in this.lemmatizationLangs)
   */
  lemmatizeIfAble(text) {
    let lemmaWords = [];
    let lemmas
    if (this.lemmatizationLangs[this.l2]) lemmas = this.lemmatization[text];
    if (lemmas) {
      for (let lemma of lemmas) {
        lemmaWords = lemmaWords.concat(
          this.lookupMultiple(lemma)
        );
      }
      lemmaWords = lemmaWords.map(w => {
        return {
          score: 1,
          w: Object.assign({ morphology: "Inflected form" }, w)
        };
      });
    }
    return lemmaWords
  },
  lookupFuzzy(text, limit = 30, quick = false) {
    // text = 'abcde'
    if (!this.accentCritical) text = this.stripAccents(text);
    text = text.toLowerCase();
    let words = [];
    words = (this.searchIndex[text] || []).map(w => {
      return { score: 1, w };
    });
    words = words.concat(this.lemmatizeIfAble(text))
    if (!quick) {
      if (words.length === 0 && this.words.length < 200000) {
        for (let word of this.words) {
          let search = word.search ? word.search : undefined;
          if (search) {
            let distance = FastestLevenshtein.distance(search, text);
            if (this.l2 === "tur" && text.startsWith(search))
              distance = distance / 2;
            let max = Math.max(text.length, search.length);
            let similarity = (max - distance) / max;
            words.push({ score: similarity, w: word });
          }
        }
      }

      let lemmaWords = []

      for (let word of words.slice(0, 10)) {
        let lemmas = this.inflectionIndex[word.w.head.toLowerCase()]
        if (lemmas) lemmaWords = lemmaWords.concat(lemmas.map(w => { return { w, score: 1 } }))
      }
      words = [...lemmaWords, ...words]

      words.forEach(w => {
        this.addPhrasesToWord(w.w)
      })
      words = words.sort((a, b) => b.score - a.score);
    }
    words = words.slice(0, limit);
    return words.map(w => w.w);
  },
  /**
   *  https://blog.adriaan.io/make-a-javascript-array-with-objects-unique-by-its-nested-key.html
   *  Property can be the name of a propterty or a compare function
   */
  uniqueByFunction(array, property) {
    const compare =
      typeof property === "function"
        ? property
        : (left, right) => left[property] == right[property];

    const newArray = [];

    array.forEach((right) => {
      const run = (left) => compare.call(this, left, right);
      var i = newArray.findIndex(run);
      if (i === -1) newArray.push(right);
    });

    return newArray;
  },
  getWords() {
    return this.words;
  },
  getWordsThatContain(text) {
    let words = this.words.filter(
      w => w.head.includes(text) || w.search.includes(text)
    );
    let strings = words
      .map(word => word.search)
      .concat(words.map(word => word.head));
    return this.unique(strings);
  },
  formTable() {
    return this.tables;
  },
  stylize(name) {
    return name;
  },
  // https://stackoverflow.com/questions/38613654/javascript-find-unique-objects-in-array-based-on-multiple-properties
  uniqueByValues(arr, keyProps) {
    const kvArray = arr.map(entry => {
      const key = keyProps.map(k => entry[k]).join("|");
      return [key, entry];
    });
    const map = new Map(kvArray);
    return Array.from(map.values());
  },
  wordForms(word) {
    let forms = [
      {
        table: "head",
        field: "head",
        form: word.head
      }
    ];
    if (this.l2 !== "vie") forms = forms.concat(this.findForms(word));
    forms = this.uniqueByValues(forms, ["table", "field", "form"]);
    return forms;
  },
  lemmaFromDefinition(definition) {
    definition = definition.replace(/\(.*\)/g, "").trim();
    let m = definition.match(/(.* of )([^\s\.]+)$/);
    if (m) {
      let lemma = m[2].replace(/\u200e/g, ""); // Left-to-Right Mark
      if (this.l2 === "lat") lemma = this.stripAccents(lemma);
      return {
        lemma,
        morphology: m
      };
    }
  },
  findForms(word) {
    let forms = [];
    let lemmaWords = this.inflectionIndex[word.search]
    if (lemmaWords) {
      forms = forms.concat(
        lemmaWords.map(s => {
          return {
            table: "lemma",
            field: "lemma",
            form: s.head
          };
        })
      );
    }
    // Find all forms of the word, that is, words whose stem matches word.head
    let words = this.lemmaIndex[this.lemmaKey(word.head)] || []
    let moreForms = [];
    let heads = [word.head];
    for (let w of words) {
      for (let d of w.definitions) {
        let lemma = this.lemmaFromDefinition(d);
        if (lemma && lemma.lemma) {
          for (let head of heads) {
            if (head === lemma.lemma) {
              field = d.replace(new RegExp(`of ${head}.*`), "").trim();
              field = field.replace(/form$/, "").trim();
              let table = field.replace(/.*?([^\s]+)$/, "$1").trim();
              if (table.includes(")")) table = "";
              if (table === "A") table = "";
              if (table === "") {
                table = "inflected";
                field =
                  field.replace("A(n) ", "").replace("A", "inflected") + " form";
              } else field = field.replace(table, "");
              if (field === "A") field = "inflected";
              let form = {
                table,
                field: field ? field : table,
                form: w.head
              };
              moreForms.push(form);
            }
          }

        }
      }
    }
    forms = forms.concat(moreForms);
    return forms;
  },
  getSize() {
    return this.words.length;
  },
  uniqueByValue(array, key) {
    let flags = [];
    let unique = [];
    let l = array.length;
    for (let i = 0; i < l; i++) {
      if (flags[array[i][key]]) continue;
      flags[array[i][key]] = true;
      unique.push(array[i]);
    }
    return unique;
  },
  subdict(data) {
    let newDict = Object.assign({}, this);
    return Object.assign(newDict, { words: data });
  },
  subdictFromText(text) {
    let search = text.toLowerCase();
    if (!this.accentCritical) search = this.stripAccents(search);
    let subdictFilterFunction = row => {
      if (this.accentCritical) {
        return text.includes(row.head) || search.includes(row.head);
      } else {
        let headMatches = text.includes(row.head);
        let searchMatches =
          row.search.length > 0 && search.includes(row.search);
        let found = headMatches || searchMatches;
        return found;
      }
    };
    let words = this.words.filter(subdictFilterFunction);
    return this.subdict(words);
  },
  isCombining(char) {
    let M =
      "\u0300-\u036F\u0483-\u0489\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u07FD\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08D3-\u08E1\u08E3-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962\u0963\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09E2\u09E3\u09FE\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2\u0AE3\u0AFA-\u0AFF\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B62\u0B63\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0C00-\u0C04\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C81-\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CE2\u0CE3\u0D00-\u0D03\u0D3B\u0D3C\u0D3E-\u0D44\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D62\u0D63\u0D82\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DF2\u0DF3\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F3E\u0F3F\u0F71-\u0F84\u0F86\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102B-\u103E\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F\u109A-\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4-\u17D3\u17DD\u180B-\u180D\u1885\u1886\u18A9\u1920-\u192B\u1930-\u193B\u1A17-\u1A1B\u1A55-\u1A5E\u1A60-\u1A7C\u1A7F\u1AB0-\u1ABE\u1B00-\u1B04\u1B34-\u1B44\u1B6B-\u1B73\u1B80-\u1B82\u1BA1-\u1BAD\u1BE6-\u1BF3\u1C24-\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CED\u1CF4\u1CF7-\u1CF9\u1DC0-\u1DF9\u1DFB-\u1DFF\u20D0-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302F\u3099\u309A\uA66F-\uA672\uA674-\uA67D\uA69E\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA823-\uA827\uA880\uA881\uA8B4-\uA8C5\uA8E0-\uA8F1\uA8FF\uA926-\uA92D\uA947-\uA953\uA980-\uA983\uA9B3-\uA9C0\uA9E5\uAA29-\uAA36\uAA43\uAA4C\uAA4D\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEB-\uAAEF\uAAF5\uAAF6\uABE3-\uABEA\uABEC\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE2F";
    let regex = new RegExp(`[${M}]+`);
    let combining = regex.test(char);
    // console.log(`👀 checking if ${char} is combinging`, combining)
    return combining;
  },
  /* Returns the longest word in the dictionary that is inside `text` */
  longest(text) {
    // Only return the *first* seen word and those the same as it
    let firstSeen = false;
    let matchedIndex, matchEndIndex, matchedText;
    let search = text.toLowerCase();
    if (!this.accentCritical) search = this.stripAccents(search);
    let matches = [];
    for (let word of this.words) {
      let matched = false;
      if (word.head.trim() === "") continue;
      if (firstSeen) {
        matched = word.search === firstSeen;
      } else {
        matchedIndex = search.indexOf(word.search);
        let matchFound = matchedIndex !== -1;
        if (matchFound) {
          matchEndIndex = matchedIndex + word.search.length;
          let nextChar = text.charAt(matchEndIndex);
          while (this.isCombining(nextChar)) {
            matchEndIndex = matchEndIndex + 1;
            nextChar = text.charAt(matchEndIndex);
          }
          firstSeen = word.search;
          matchedText = text.slice(matchedIndex, matchEndIndex);
          matched = true;
        }
      }
      if (matched) {
        this.addPhrasesToWord(word)
        matches.push({
          word,
          matchedIndex,
          matchEndIndex
        });
      }
    }
    // Turkish words should only find matches at the beginning of each word
    if (this.l2 === "tur") {
      matches = matches.sort((a, b) => {
        return a.matchedIndex - b.matchedIndex;
      });
    } else {
      matches = matches.sort((a, b) => {
        return b.word.head.length - a.word.head.length;
      });
    }
    return {
      matches: matches.map(m => m.word),
      text: matchedText
    };
  },
  tokenize(text, tokenizationType = "integral") {
    if (this.tokenizationCache[text]) return this.tokenizationCache[text];
    else {
      let tokenized = []
      if (this.l2 === "tur") tokenized = this.tokenizeTurkish(text);
      else if (this.l2 === 'ara') tokenized = this.tokenizeArabic(text);
      else {
        if (['tur', 'ara'].includes(this.l2)) tokenizationType = "server"
        switch (tokenizationType) {
          case "integral":
            tokenized = this.tokenizeIntegral(text);
            break;
          case "agglutenative":
          case "continua":
            tokenized = this.tokenizeContinua(text);
            break;
          default:
        }
      }
      this.tokenizationCache[text] = tokenized;
      return tokenized;
    }
  },
  tokenizeIntegral(text) {
    const tokens = text.match(/\p{L}+|[^\p{L}\s]+|\s+/gu);
    const labeledTokens = tokens.map(tokenString => {
      let isWord = /^\p{L}+$/u.test(tokenString)
      if (isWord) {
        return { text: tokenString };
      } else {
        return tokenString;
      }
    });
    return labeledTokens
  },
  tokenizeContinua(text) {
    let subdict = this.subdictFromText(text);
    let tokenized = this.tokenizeRecursively(text, subdict);
    return tokenized
  },
  // https://stackoverflow.com/questions/175739/how-can-i-check-if-a-string-is-a-valid-number
  isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  },
  async tokenizeArabic(text) {
    text = text.replace(/-/g, "- ");
    let url = `${PYTHON_SERVER}lemmatize-arabic?text=${encodeURIComponent(
      text
    )}`;
    let tokenized = await this.proxy(url, 0);
    let tokens = [];
    for (let lemmas of tokenized) {
      if (!lemmas[0]) {
        tokens.push(" ");
      } else if (["punc"].includes(lemmas[0].pos)) {
        tokens.push(lemmas[0].word);
        tokens.push(" ");
      } else if (["all"].includes(lemmas[0].pos) && this.isNumeric(lemmas[0].word)) {
        tokens.push(lemmas[0].word);
        tokens.push(" ");
      } else {
        let candidates = [];
        for (let lemma of lemmas) {
          candidates = candidates.concat(this.lookupMultiple(lemma.word));
          candidates = candidates.concat(
            this.lookupMultiple(lemma.lemma)
          );
        }
        candidates = this.uniqueByValue(candidates, "id");
        tokens.push({
          text: lemmas[0].word,
          lemmas,
          candidates,
          pos: lemmas[0].pos
        });
        tokens.push(" ");
      }
    }
    return tokens;
  },
  async tokenizeTurkish(text) {
    text = text.replace(/-/g, "- ");
    let url = `${PYTHON_SERVER}lemmatize-turkish?text=${encodeURIComponent(
      text
    )}`;
    let tokenized = await this.proxy(url, 0);
    let tokens = [];
    for (let lemmas of tokenized) {
      if (!lemmas[0]) {
        tokens.push(" ");
      } else if (["Punc"].includes(lemmas[0].pos)) {
        tokens.push(lemmas[0].word);
        tokens.push(" ");
      } else {
        let candidates = [];
        for (let lemma of lemmas) {
          candidates = candidates.concat(this.lookupMultiple(lemma.word));
          if (lemma !== "Unk")
            candidates = candidates.concat(
              this.lookupMultiple(lemma.lemma).map(w => {
                w.morphology = lemma.morphemes
                  .join(", ")
                  .toLowerCase();
                return w;
              })
            );
        }
        candidates = this.uniqueByValue(candidates, "id");
        tokens.push({
          text: lemmas[0].word,
          lemmas,
          candidates,
          pos: lemmas[0].pos
        });
        tokens.push(" ");
      }
    }
    return tokens;
  },
  // json or plain text only, and returns object
  async proxy(url, cacheLife = -1, encoding = false) {
    try {
      let proxyURL = `${PROXY_SERVER}scrape2.php?cache_life=${cacheLife}${encoding ? "&encoding=" + encoding : ""
        }&url=${encodeURIComponent(url)}`;
      let response = await axios.get(proxyURL);
      if (response.data) {
        return response.data;
      }
    } catch (err) {
      console.log(`Cannot get ${url}`);
    }
    return false;
  },
  splitByReg(text, reg) {
    let words = text
      .replace(reg, "!!!BREAKWORKD!!!$1!!!BREAKWORKD!!!")
      .replace(/^!!!BREAKWORKD!!!/, "")
      .replace(/!!!BREAKWORKD!!!$/, "");
    return words.split("!!!BREAKWORKD!!!");
  },
  isThai(text) {
    let match = text.match(/[\u0E00-\u0E7F]+/g);
    return match;
  },
  tokenizeRecursively(text, subdict) {
    const longest = subdict.longest(text);
    if (this.l2 === "tha") {
      const isThai = subdict.isThai(text);
      if (!isThai) {
        return [text];
      }
    }
    if (longest.matches.length > 0) {
      for (let word of longest.matches) {
        longest.matches = this.stemWordsWithScores(word, 1).map(w => w.w).concat(longest.matches);
        // longest.matches = longest.matches.concat(this.phrasesWithScores(word, 1)) // This is very slow
      }
      let result = [];
      /*
      result = [
        '我',
        {
          text: '是'
          candidates: [{...}, {...}, {...}
        ],
        '中国人。'
      ]
      */
      for (let textFragment of text.split(longest.text)) {
        result.push(textFragment); // '我'
        result.push({
          text: longest.text,
          candidates: longest.matches
        });
      }
      result = result.filter(item => {
        if (typeof item === "string") {
          return item !== "";
        } else {
          return item.text !== "";
        }
      });
      result.pop(); // last item is always useless, remove it
      var tokens = [];
      for (let item of result) {
        if (typeof item === "string" && item !== text) {
          for (let token of this.tokenizeRecursively(item, subdict)) {
            tokens.push(token);
          }
        } else {
          tokens.push(item);
        }
      }
      return tokens;
    } else {
      return [text];
    }
  },
  // https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
  stripAccents(str) {
    str = str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Accents
      .replace(/[\u0600-\u0620\u064b-\u0655]/g, "") // Arabic diacritics
      .replace(/[\u0559-\u055F]/g, ""); // Armenian diacritics
    if (["he", "hbo", "iw"].includes(this.l2))
      str = this.stripHebrewVowels(str);
    return str;
  },
  stringsToWords(strings) {
    let words = [];
    for (let s of strings) {
      words = words.concat(this.lookupMultiple(s));
    }
    return words;
  },
  stemWordsWithScores(word, score = undefined) {
    let stemWords = this.inflectionIndex[word.head];
    if (stemWords) {
      let stemWordsWithScores = stemWords.map(w => {
        return { score, w };
      });
      return stemWordsWithScores;
    } else return []
  },
  /**
   * Find phrases that contain a word
   * @param {Object} word the word
   * @param {Number} score (optional) the score
   * @returns {Array} An array of phrases each wrapped in an object { w: word, score: score }
   */
  phrasesWithScores(word, score = undefined) {
    let phraseObjs = this.getPhraseIndex(word.head)
    if (phraseObjs) {
      let mapped = phraseObjs.map(w => { return { w, score } })
      return mapped
    } else return [];
  },
  unique(a) {
    return a.filter((item, i, ar) => ar.indexOf(item) === i);
  },
  randomArrayItem(array, start = 0, length = false) {
    length = length || array.length;
    array = array.slice(start, length);
    let index = Math.floor(Math.random() * array.length);
    return array[index];
  },
  //https://stackoverflow.com/questions/2532218/pick-random-property-from-a-javascript-object
  randomProperty(obj) {
    var keys = Object.keys(obj);
    return obj[keys[(keys.length * Math.random()) << 0]];
  },
  random() {
    return this.randomProperty(this.words);
  },
  // Called from <EntryForms> and <WordBlock> components for Russian words
  accent(text) {
    return text.replace(/'/g, "́");
  },

  /*
  * https://gist.github.com/yakovsh/345a71d841871cc3d375
  /* @shimondoodkin suggested even a much shorter way to do this */
  stripHebrewVowels(rawString) {
    return rawString.replace(/[\u0591-\u05C7]/g, "");
  }
};