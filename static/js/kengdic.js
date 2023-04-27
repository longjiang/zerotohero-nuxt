importScripts("../vendor/korean_conjugation/html/korean/hangeul.js");
importScripts("../vendor/korean_conjugation/html/korean/conjugator.js");
importScripts("../vendor/fastest-levenshtein/fastest-levenshtein.js");
importScripts("../vendor/localforage/localforage.js")
importScripts("../vendor/fuzzy-search/FuzzySearch.js")
importScripts("../js/tokenizers/korean-tokenizer.js")

const Dictionary = {
  file:
    "https://server.chinesezerotohero.com/data/kengdic/kengdic_2011.tsv.txt",
  wiktionaryFiles: {
    eng: "https://server.chinesezerotohero.com/data/wiktionary-csv/kor-eng.csv.txt",
    zho: "https://server.chinesezerotohero.com/data/wiktionary-csv/kor-zho.csv.txt",
  },
  version: "2.16.1",
  words: [],
  name: "kengdic",
  hangulRegex: /[\u1100-\u11FF\u302E\u302F\u3131-\u318E\u3200-\u321E\u3260-\u327E\uA960-\uA97C\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uFFA0-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]+/,
  nonHangulRegex: /[^\u1100-\u11FF\u302E\u302F\u3131-\u318E\u3200-\u321E\u3260-\u327E\uA960-\uA97C\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uFFA0-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]+/,
  tokenizationCache: {},
  credit() {
    return `The Korean dictionary is provided by <a href="https://github.com/garfieldnate/kengdic">kengdic</a> created by Joe Speigle, which is freely available from its GitHub project page. Korean conjugation made possible with <a href="https://github.com/max-christian/korean_conjugation">max-christian/korean_conjugation</a>.`;
  },
  async load({ l1 = undefined, l2 = undefined } = {}) {
    let promises = [
      this.loadSmart(`wiktionary-kor-${l1}`, this.wiktionaryFiles[l1])
    ];
    
    if (l1 === 'eng') promises.unshift(this.loadSmart('kengdic', this.file));
    
    let results = await Promise.all(promises);
    
    // If l1 is 'eng', results will have two elements, otherwise it will have one element
    let [kengdicData, wiktionaryData] = l1 === 'eng' ? results : [undefined, results[0]];
    
    let words = kengdicData ? await this.loadKengdic(kengdicData) : [];
    let wiktionaryWords = wiktionaryData ? await this.loadWiktionary(wiktionaryData) : [];
    wiktionaryWords = wiktionaryWords.map((word, index) => {
      word.id = String(300000 + index);
      return word;
    });
    words = [...wiktionaryWords, ...words];
    this.words = words
    // this.words = this.uniqueByValues(words, ["bare", "hanja", "pos"]); // This seems to be removing too many necessary words
    // words = null
    kengdicData = null
    wiktionaryData = null
    axios.get("https://py.zerotohero.ca/start-open-korean-text.php"); // Call index.php to make sure the java open-korean-text process is running (Dreamhost kills it from time to time)
    this.tokenizer = new KoreanTokenizer();
    return this;
  },
  async loadSmart(name, file) {
    let data = await localforage.getItem(name)
    if (!data) {
      console.log(`KENGDIC: requesting '${file}' . . .`)
      let response = await axios.get(file)
      data = response.data
      localforage.setItem(name, data)
      response = null
    } else {
      console.log(`KENGDIC: dictionary '${name}' loaded from local indexedDB via localforage`)
    }
    if (data) {
      return data
    }
  },
  async loadKengdic(csv) {
    let results = await Papa.parse(csv, {
      header: true
    });
    let sorted = results.data.sort((a, b) =>
      a.hangul && b.hangul ? a.hangul.length - b.hangul.length : 0
    );
    this.rawWords = sorted;
    let data = [];
    for (let row of sorted) {
      let hangul = row.hangul.replace(/^\-/, '')
      let word = Object.assign(row, {
        head: hangul,
        bare: hangul,
        accented: hangul,
        definitions: [row.english],
        cjk: {
          canonical: row.hanja && row.hanja !== "NULL" ? row.hanja : undefined,
          phonetics: hangul
        }
      });
      data.push(word);
    }
    return data;
  },
  async loadWiktionary(csv) {
    let words = this.parseDictionaryCSV(csv);
    words = words.sort((a, b) => {
      if (a.head && b.head) {
        return b.head.length - a.head.length;
      }
    });
    return words;
  },
  parseDictionaryCSV(data) {
    console.log("Wiktionary: parsing words from CSV...");
    let parsed = Papa.parse(data, { header: true });
    let words = parsed.data;
    words = words
      .filter(w => w.word?.length > 0) // filter empty rows
      .map(item => {
        item.word = item.word.replace(/^\-/, '')
        item.bare = item.word;
        item.search = item.bare.toLowerCase();
        item.head = item.word;
        delete item.word;
        item.wiktionary = true;
        item.definitions = item.definitions ? item.definitions.split("|") : [];
        item.stems = item.stems ? item.stems.split("|") : [];
        for (let definition of item.definitions.filter(d =>
          d.includes(" of ")
        )) {
          let lemma = this.lemmaFromDefinition(definition);
          if (lemma) item.stems.push(lemma);
        }
        item.stems = this.unique(item.stems);
        item.phrases = item.phrases ? item.phrases.split("|") : [];
        if (item.han) {
          item.cjk = {
            canonical: item.han,
            pronunciation: item.bare
          };
          item.hanja = item.han;
        }
        return item;
      });
    return words;
  },
  findPhrases(word, limit = 50) {
    if (word) {
      if (!word.phrases || word.phrases.length === 0) {
        let phrases = []
        for (let i = this.words.length - 1; i >= 0; i--) {
          const w = this.words[i];
          if (w.head.length > word.head.length && w.head.includes(word.head)) phrases.push(w)
          if (phrases.length >= limit) break
        }
        phrases.sort((a, b) => a.head.length - b.head.length).sort((a, b) => b.weight - a.weight)
        return phrases
      } else {
        return word.phrases
      }
    }
  },
  lemmaFromDefinition(definition) {
    definition = definition.replace(/\(.*\)/g, "").trim();
    let m = definition.match(/(.* of )([^\s\.]+)$/);
    if (m) {
      let lemma = m[2].replace(/\u200e/g, ""); // Left-to-Right Mark
      return lemma;
    }
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
  // https://stackoverflow.com/questions/38613654/javascript-find-unique-objects-in-array-based-on-multiple-properties
  uniqueByValues(arr, keyProps) {
    const kvArray = arr.map(entry => {
      const key = keyProps.map(k => entry[k]).join("|");
      return [key, entry];
    });
    const map = new Map(kvArray);
    return Array.from(map.values());
  },
  unique(a) {
    return a.filter((item, i, ar) => ar.indexOf(item) === i);
  },
  getWords() {
    return this.words;
  },
  getWordsThatContain(text) {
    let words = this.words.filter(w => w.head && w.head.includes(text));
    let strings = words.map(word => word.head);
    return this.unique(strings);
  },
  /**
   * Get a word by ID.
   * @param {*} id the word's id
   * @param {*} head (optional) the head of the word to check if matches the word retrieved; if mismatched, we'll look for a matching word instead.
   * @returns 
   */
  get(id, head) {
    let word = this.words.find(row => row.id === id);
    if (head && word && word.head !== head) {
      word = this.lookup(head)
    }
    return word
  },
  isChinese(text) {
    if (this.matchChinese(text)) return true;
  },
  matchChinese(text) {
    return text.match(
      // eslint-disable-next-line no-irregular-whitespace
      /[\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u3005\u3007\u3021-\u3029\u3038-\u303B‌​\u3400-\u4DB5\u4E00-\u9FCC\uF900-\uFA6D\uFA70-\uFAD9]+/g
    );
  },
  randomArrayItem(array, start = 0, length = false) {
    length = length || array.length;
    array = array.slice(start, length);
    let index = Math.floor(Math.random() * array.length);
    return array[index];
  },
  wordForms(word) {
    let forms = [
      {
        table: "head",
        field: "head",
        form: word.bare
      }
    ];
    if (word.bare.endsWith("다")) {
      let krForms = this.conjugate(word.bare);
      forms = forms.concat(
        krForms.map(f => {
          return {
            table: `conjugation`,
            field: f.name,
            form: f.form
          };
        })
      );
      forms = this.uniqueByValue(forms, "form").sort(
        (a, b) => a.length - b.length
      );
    }
    return forms;
  },
  conjugate(text) {
    let forms = [];
    let infinitive = conjugator.base(text, true);
    for (let regular of conjugator.both_regular_and_irregular
      ? [false]
      : [true]) {
      conjugator.verb_type(infinitive, regular);
      for (let key in conjugator) {
        if (conjugator[key].conjugation) {
          let conjugationFunc = conjugator[key];
          forms.push({
            name: key.replace(/_/g, " "),
            form: conjugationFunc(infinitive, regular),
            regular
          });
        }
      }
    }
    return forms;
  },
  stylize(name) {
    return name;
  },
  lookup(text) {
    let word = this.words.find(word => word && word.bare === text);
    return word;
  },
  lookupByDef(text, limit = 30) {
    text = text.toLowerCase();
    let results = [];
    for (let word of this.words) {
      for (let d of word.definitions) {
        if (d) {
          let found = d.toLowerCase().includes(text);
          if (found) {
            results.push(
              Object.assign({ score: 1 / (d.length - text.length + 1) }, word)
            );
          }
        }
      }
    }
    results = results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  },
  random() {
    return this.randomArrayItem(this.words);
  },
  lookupByCharacter(char) {
    return this.words.filter(row => row.hanja && row.hanja.includes(char));
  },
  lookupHangul(hangul) {
    const candidates = this.words.filter(row => {
      return row.hangul === hangul;
    });
    return candidates;
  },
  accent(text) {
    return text;
  },
  lookupByPattern(pattern) {
    // pattern like '～体'
    var results = [];
    if (pattern.includes("～")) {
      const regexPattern = "^" + pattern.replace(/～/gi, ".+") + "$";
      const regex = new RegExp(regexPattern);
      results = this.words.filter(word => regex.test(word.hangul));
    } else {
      results = this.words.filter(word => word.hangul.includes(pattern));
    }
    return results;
  },
  logError(error, tag) {
    if (!tag) tag = 'Error'
    if (error.response) {
      let { data, status, headers } = error.response
      console.log(tag, { message: 'Request made and server responded', data, status, headers, response: error.response, error });
    } else if (error.request) {
      console.log(tag, { message: 'The request was made but no response was received', request: error.request, error });
    } else {
      console.log(tag, { message: 'Something happened in setting up the request that triggered an Error' + error.message, status: error.status, error });
    }
  },
  lookupFuzzy(text, limit = 30, quick = false) {
    let words = [];
    // Initialize a FuzzySearch instance.
    const searcher = new FuzzySearch(this.words, ['bare'], {
      caseSensitive: false,
      sort: true,
    });

    // Perform a fuzzy search.
    const searchTerm = text;
    words = searcher.search(searchTerm).slice(0, limit);
    return words.map(word => Object.assign({ score: 1 }, word));
  },
  lookupMultiple(text) {
    let lookForHadaVerbs = false
    if (!text.endsWith('다')) lookForHadaVerbs = true
    let hadaText = text + '하다'
    let words = this.words.filter(word => {
      if (word) {
        return lookForHadaVerbs ? word.bare === text || word.bare === hadaText : word.bare === text
      }
    });
    return words;
  },
  async tokenizeWithOpenKoreanText(text) {
    try {
      let res = await axios.get(
        `https://server.chinesezerotohero.com/scrape2.php?&cache_life=-1&url=${encodeURIComponent(
          "http://py.zerotohero.ca:4567/tokenize?text=" +
          text.replace(/\s/g, "%20"),
          { timeout: 5000 }
        )}`
      );
      if (res.data) {
        return res.data.tokens;
      }
    } catch (err) {
      this.logError(err);
    }
  },
  isHangul(text) {
    let isHangul = this.hangulRegex.test(text);
    return isHangul;
  },
  hasHangul(text) {
    let hasHangul = text.includes;
  },


  async tokenize(text) {
    return await this.tokenizer.tokenizeWithCache(text)
  },
  
  // async tokenize(text) {
  //   let cached = this.tokenizationCache[text]
  //   if (cached) return cached;
  //   let t = [];
  //   let lastPosition = 0;
  //   let tokenized;
  //   let isHangul = this.isHangul(text);
  //   if (isHangul) tokenized = await this.tokenizeWithOpenKoreanText(text);
  //   if (tokenized) {
  //     for (let index in tokenized) {
  //       let token = tokenized[index];
  //       if (token.offset > lastPosition) {
  //         t.push(" ");
  //         lastPosition = token.offset;
  //       }
  //       let candidates = this.lookupMultiple(token.text);
  //       if (token.stem && token.stem !== token.text) {
  //         candidates = candidates.concat(this.lookupMultiple(token.stem));
  //       }
  //       t.push({
  //         text: token.text,
  //         candidates,
  //         pos: token.pos
  //       });
  //       lastPosition = lastPosition + token.length;
  //     }
  //     if (lastPosition < text.length) t.push(" ");
  //     this.tokenizationCache[text] = t;
  //     return t;
  //   } else {
  //     return this.tokenizeBySplitting(text);
  //   }
  // },
  async tokenizeBySplitting(text) {
    let t = [];
    let segs = text.split(/\s+/);
    for (let seg of segs) {
      t.push({
        text: seg,
        candidates: []
      });
      t.push(" ");
    }
    t.pop();
    return t;
  }
};
