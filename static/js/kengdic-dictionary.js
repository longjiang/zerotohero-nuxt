importScripts("../vendor/localforage/localforage.js")
importScripts("../js/base-dictionary.js")

class KengdicDictionary extends BaseDictionary {
  
  constructor({ l1 = undefined, l2 = undefined } = {}) {
    super({l1, l2});
    this.file = "https://server.chinesezerotohero.com/data/kengdic/kengdic_2011.tsv.txt"; // Actually a CSV not TSV
    this.wiktionaryFiles = {
      eng: "https://server.chinesezerotohero.com/data/wiktionary-csv/kor-eng.csv.txt",
      zho: "https://server.chinesezerotohero.com/data/wiktionary-csv/kor-zho.csv.txt",
    };
    this.version = "2.16.1";
  }

  credit() {
    return `The Korean dictionary is provided by <a href="https://github.com/garfieldnate/kengdic">kengdic</a> created by Joe Speigle, which is freely available from its GitHub project page. Korean conjugation made possible with <a href="https://github.com/max-christian/korean_conjugation">max-christian/korean_conjugation</a>.`;
  }

  async loadData() {
    const l1Code = this.l1['iso639-3']
    let words = l1Code === 'eng' ? await this.loadDictionaryData({ name: `kengdic`, file: this.file }) : []; // If l1Code is 'eng', load kengdic data, otherwise load nothing
    let wiktionaryWords = await this.loadDictionaryData({ name: `wiktionary-kor-${l1Code}`, file: this.file })
    wiktionaryWords.forEach((item) => {
      item.id = "w" + hash(item.head + item.definitions[0]);
    });
    words.forEach(this.normalizeKengdicWord)
    wiktionaryWords.forEach(this.normalizeWiktionaryWord)
    this.words = [...words, ...wiktionaryWords];
    words = null
    wiktionaryWords = null
  }



  normalizeWiktionaryWord(item) {
    item.word = item.word.replace(/^\-/, '')
    item.bare = item.word;
    item.search = item.bare.toLowerCase();
    item.head = item.word;
    item.definitions = item.definitions ? item.definitions.split("|") : [];
    if (item.han) {
      item.cjk = {
        canonical: item.han,
        pronunciation: item.bare
      };
      item.hanja = item.han;
    }
    delete item.han;
    delete item.word;
    delete item.stems
    delete item.phrases
  }

  normalizeKengdicWord(row) {
    let hangul = row.hangul.replace(/^\-/, '')
    Object.assign(row, {
      head: hangul,
      bare: hangul,
      accented: hangul,
      search: hangul,
      definitions: [row.english],
      cjk: {
        canonical: row.hanja && row.hanja !== "NULL" ? row.hanja : undefined,
        phonetics: hangul
      }
    });
    delete row.english;
    delete row.c;
    delete row.created;
    delete row.e;
    delete row.f;
    delete row.i;
    delete row.k;
    delete row.l;
    delete row.username;
  }

  lookupByCharacter(char) {
    return this.words.filter(row => row.hanja && row.hanja.includes(char));
  }

  lookupHangul(hangul) {
    const candidates = this.words.filter(row => {
      return row.hangul === hangul;
    });
    return candidates;
  }

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
  }

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
  }
};
