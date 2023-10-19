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
    this.version = "2.18.1";
    this.indexDbVerByLang = {
      kor: "2.18.0",
    }
  }

  credit() {
    return `The Korean dictionary is provided by <a href="https://github.com/garfieldnate/kengdic">kengdic</a> created by Joe Speigle, which is freely available from its GitHub project page. Korean conjugation made possible with <a href="https://github.com/max-christian/korean_conjugation">max-christian/korean_conjugation</a>.`;
  }

  async loadData() {
    const l1Code = this.l1['iso639-3']
    let words = l1Code === 'eng' ? await this.loadDictionaryData({ name: `kengdic`, file: this.file }) : []; // If l1Code is 'eng', load kengdic data, otherwise load nothing
    let wiktionaryWords = await this.loadDictionaryData({ name: `wiktionary-kor-${l1Code}`, file: this.wiktionaryFiles[l1Code] })
    words.forEach((item) => this.normalizeKengdicWord(item))
    wiktionaryWords.forEach((item) => this.normalizeWiktionaryWord(item))
    words = [...words, ...wiktionaryWords];
    this.words = words.filter(row => row.definitions?.length > 0)
    words = null
    wiktionaryWords = null
  }

  normalizeWiktionaryWord(item) {
    const head = item.word.replace(/^\-/, '')
    item.head = head;
    item.bare = head;
    item.search = head.toLowerCase();
    item.definitions = item.definitions ? item.definitions.split("|") : [];
    if (item.han) {
      item.cjk = {
        canonical: item.han,
        pronunciation: head
      };
      item.hanja = item.han;
    }
    let idBasis = item.head + (item.definitions.length > 0 ? item.definitions[0] : item.hanja)
    item.id = "w" + hash(idBasis);
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
