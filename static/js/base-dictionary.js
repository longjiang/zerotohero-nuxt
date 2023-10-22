importScripts("../vendor/papaparse/papaparse.min.js");
importScripts("../vendor/axios/axios.min.js");
importScripts("../vendor/localforage/localforage.js");
importScripts("../vendor/hash-string/hash-string.min.js");
importScripts("../vendor/fuse.js@6.6.2/fuse.min.js");
importScripts("../js/dictionary-utils.js");
importScripts("../js/tokenizers/tokenizer-factory.js");
importScripts("../js/inflectors/inflector-factory.js");
importScripts("../js/frequency-assigner.js");

class BaseDictionary {
  constructor({ l1 = undefined, l2 = undefined } = {}) {
    this.l1 = l1;
    this.l2 = l2;
    this.words = [];
    this.name = this.constructor.name;
    this.version = null;
    this.tokenizer = null;
    this.frequencyAssigner = null;
    this.indexDbVerByLang = {};
    this.indexKeys = ["search"];
    this.searchIndex = {};
    this.phraseIndex = {};
    this.searcher = null;
    this.wordGroupsByLevelLessonDialog = {}; // a tree structure by book, lesson, and dialog
  }

  static async load({ l1 = undefined, l2 = undefined } = {}) {
    const instance = new this({ l1, l2 });
    await instance.loadData(); // We must await this otherwise we have no words
    console.log(`${this.name}: Indexing...`);
    instance.createIndices();
    console.log(`${this.name}: Indexing finished.`);
    instance.createSearcher();
    instance.tokenizer = await TokenizerFactory.createTokenizer({
      l2,
      words: instance.words,
      indexKeys: instance.indexKeys,
    });
    instance.inflector = await InflectorFactory.createInflector(l2);
    if (FrequencyAssigner.hasFrequencyData(l2)) {
      instance.frequencyAssigner = await FrequencyAssigner.load({ l1, l2 });
      instance.frequencyAssigner.addFrequencyAndLevelToItems(instance.words);
      // make this.words into an array
      for (let row of Object.values(instance.words)) {
        instance.groupWordsByLevelAndLesson(row);
      }
    }
    return instance;
  }

  createSearcher() {
    this.searcher = new Fuse(this.words, {
      keys: this.indexKeys,
      includeScore: true,
      threshold: 0.3,
    });
  }

  loadData() {
    throw new Error("loadData() method must be implemented in the subclass");
  }

  async tokenizeWithCache(text) {
    const tokens = await this.tokenizer.tokenizeWithCache(text);
    if (tokens) tokens.forEach((token) => this.addCandidatesToToken(token));
    return tokens;
  }

  loadTokenizationServerCache(data) {
    this.tokenizer.loadServerCache(data);
  }

  async addCandidatesToToken(token) {
    if (typeof token !== "object") return;
    if (token.candidates) {
      return;
    }
    let candidates = await this.lookupMultiple(token.text);
    if (token.lemmas) {
      for (let lemma of token.lemmas) {
        if (lemma.lemma && lemma.lemma !== token.text) {
          const lemmaCandidates = await this.lookupMultiple(lemma.lemma);
          lemmaCandidates.forEach((c) => {
            let morphology = lemma.morphology;
            if (lemma.morphologies) morphology = lemma.morphologies.join("; ");
            c.morphology = morphology;
          });
          candidates = [...candidates, ...lemmaCandidates];
        }
      }
    }
    token.candidates = uniqueByValues(candidates, ["id"]);
    return candidates;
  }

  dictionaryFile({ l1Code = undefined, l2Code = undefined } = {}) {
    throw new Error(
      "dictionaryFile() method must be implemented in the subclass"
    );
  }

  async loadAndNormalizeDictionaryData({ name, file, delimiter = "," }) {
    let words = await this.loadDictionaryData({ name, file, delimiter });
    console.log(`${this.name}: Normalizing dictionary data...`);
    words.forEach((item) => {
      this.normalizeWord(item);
    });
    words = words.filter((w) => w.head);
    console.log(`${this.name}: ${file} loaded.`);
    return words;
  }

  /**
   * This method tries to load dictionary data from local storage first.
   * If it is not available, it fetches the data from a remote server,
   * stores it in local storage for future use, and then returns the data.
   *
   * @param {string} name - The name of the dictionary used as a key in local storage.
   * @param {string} file - The URL of the remote file containing the dictionary data.
   * @returns {Array} - An array of dictionary entries parsed from the fetched data.
   */
  async loadDictionaryData({ name, file, delimiter = "," }) {
    const l2Code = this.l2["iso639-3"];
    if (this.indexDbVerByLang[l2Code])
      name += "-v" + this.indexDbVerByLang[l2Code]; // Force refresh a dictionary when it's outdated

    // Try to get data from local storage
    let data = await localforage.getItem(name);

    if (!data) {
      // If data is not found in local storage, fetch it from the remote server
      console.log(`${this.name}: requesting '${file}' . . .`);
      let response = await axios.get(file);
      data = response.data;

      // Store the fetched data in local storage for future use
      localforage.setItem(name, data);
      response = null;
    } else {
      console.log(
        `${this.name}: dictionary '${name}' loaded from local indexedDB via localforage`
      );
    }

    // If data is available, parse it using Papa Parse and return the parsed data
    if (data) {
      return this.parseDictionaryData({ data, delimiter });
    }
  }

  parseDictionaryData({ data, delimiter = "," }) {
    let results = Papa.parse(data, {
      header: true,
      delimiter,
    });
    return results.data;
  }

  normalizeWord(item) {
    throw new Error(
      "normalizeWord() method must be implemented in the subclass"
    );
  }

  // Override this method for CJK languages only
  lookupByCharacter(characterStr) {
    throw new Error(
      "lookupByCharacter() method must be implemented in the subclass"
    );
  }

  async inflect(text) {
    return await this.inflector.inflectWithCache(text);
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

  lookupBySearch(text, limit = 10, caseSensitive = false) {
    let results = this.searcher.search(text, { limit });
    let words = results.map((result) => {
      return { ...result.item, score: 1 - result.score }; // Fuse.js returns a score from 0 to 1, so we need to invert it
    });
    return words.slice(0, limit);
  }

  lookupByPronunciation(pronunciationStr) {
    throw new Error(
      "lookupByPronunciation() method must be implemented in the subclass"
    );
  }

  credit() {
    throw new Error("credit() method must be implemented in the subclass");
  }

  random() {
    return randomProperty(this.words);
  }

  lookup(text) {
    let words = this.searchIndex[text.toLowerCase()];
    if (words && words[0]) return words[0];
  }

  lookupMultiple(text) {
    let words = [];
    if (this.searchIndex) {
      words = this.searchIndex[text.toLowerCase()] || [];
    } else {
      words = this.words.filter((w) => {
        return (
          w.search === text.toLowerCase() ||
          w.head === text.toLowerCase() ||
          w.simplified === text.toLowerCase()
        );
      });
    }
    if (this.addNewHSK) words.forEach((word) => this.addNewHSK(word));
    return words;
  }

  getWords() {
    return this.words;
  }

  getSize() {
    return this.words.length;
  }

  /**
   * Get a word by ID. This is called from various components.
   * @param {*} id the word's id
   * @param {*} head (optional) the head of the word to check if matches the word retrieved; if mismatched, we'll look for a matching word instead.
   * @returns
   */
  get(id, head) {
    let word;
    word = this.words.find((w) => w.id == id);
    if (head && word && word.head !== head) {
      word = this.lookup(head);
    }
    return word;
  }

  lookupFromTokens(tokens) {
    let final = [];
    for (let index in tokens) {
      let token = tokens[index];
      if (typeof token === "object") {
        let candidates = this.lookupMultiple(token.word);
        if (token.lemma && token.lemma !== token.word) {
          candidates = candidates.concat(this.lookupMultiple(token.lemma));
        }
        final.push({
          text: token.word,
          candidates,
          lemmas: [token.lemma],
          pos: token.pos,
          stem: token.stem,
          pronunciation: token.pronunciation,
        });
        final.push(" ");
      } else {
        final.push(token.word || token); // string
      }
    }
    return final;
  }

  createIndices() {
    for (let word of this.words) {
      for (let indexType of this.indexKeys) {
        if (!Array.isArray(this[indexType + "Index"][word[indexType]]))
          this[indexType + "Index"][word[indexType]] = [];
        const index = this[indexType + "Index"][word[indexType]];
        if (!index.includes(word)) index.push(word);
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
    if (!this.phraseIndex[w].includes(word)) this.phraseIndex[w].push(word);
  }

  getPhraseIndex(head) {
    let w = "@" + head;
    if (!this.phraseIndex[w]) this.phraseIndex[w] = [];
    return this.phraseIndex[w];
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

  // Called from <SearchSubComp> to look for exclusion terms.
  getWordsThatContain(text) {
    let words = this.words.filter(
      (w) => w.head.includes(text) || w.search.includes(text)
    );
    let strings = words
      .map((word) => word.search)
      .concat(words.map((word) => word.head));
    return unique(strings);
  }

  transliterate(text) {
    throw new Error(
      "transliterate() method must be implemented in the subclass"
    );
  }

  findSubstrings(query, minLength = 1) {
    const substrings = [];

    for (let i = 0; i < query.length; i++) {
      for (let j = i + minLength; j <= query.length; j++) {
        const substring = query.slice(i, j);
        substrings.push(substring);
      }
    }

    return substrings;
  }

  fuzzySearch(query, limit = 10) {
    return this.searcher
      .search(query, { limit })
      .sort((a, b) =>
        a.item.head && b.item.head ? a.item.head.length - b.item.head.length : 0
      )
      .map((result) => result.item);
  }

  lookupFuzzy(text, limit = 10) {
    text = stripAccents(text);
    text = text.toLowerCase();
    let uniqueWords = new Set();

    (this.searchIndex[text] || []).forEach((word) => {
      uniqueWords.add(word);
    });

    let words = Array.from(uniqueWords).map((word) => {
      return { score: 1, w: word };
    });

    // Perform a fuzzy search.
    let wordsFromFuzzySearch = this.fuzzySearch(text, limit);
    words = words.concat(
      wordsFromFuzzySearch.map((w) => {
        return { w, score: 0.5 };
      })
    );

    words = words.sort((a, b) => b.score - a.score);
    words = words.slice(0, limit);
    words = words.map((w) => w.w);
    return words;
  }

  getInflector() {
    return this.inflector;
  }

  // This method should be overridden for CJK languages
  lookupSimplified(simplifiedStr) {
    throw new Error(
      "lookupSimplified() method must be implemented in the subclass"
    );
  }

  lookupByPattern(pattern) {
    throw new Error(
      "lookupByPattern() method must be implemented in the subclass"
    );
  }

  lookupByLesson() {
    // Only implemented for Chinese
  }

  getByBookLessonDialog(book, lesson, dialog) {
    let words = this.words.filter(
      (row) =>
        (parseInt(row.book) === parseInt(book) ||
          parseInt(row.level) === parseInt(book)) &&
        parseInt(row.lesson) === parseInt(lesson)
    );
    if (dialog)
      words = words.filter(
        (row) => row.dialog.toString() === dialog.toString()
      );
    return words;
  }

  async getWordGroupsByLevelLessonDialog() {
    // Only implemented for Chinese
  }

  getNewHSK() {
    // Only implemented for Chinese
  }

  listCharacters() {
    // Only implemented for Chinese
  }

  lookupHSKChar() {
    // Only implemented for Chinese
  }

  getAccentForm() {
    // Only implemented for Russian
    if (this.inflector?.getAccentForm) {
      return this.inflector.getAccentForm(...arguments);
    }
  }

  lookupByTones() {
    // Only implemented for Chinese
  }

  getWordGroupsByLevelLessonDialog() {
    return this.wordGroupsByLevelLessonDialog;
  }

  groupWordsByLevelAndLesson(word) {
    let { book, level, lesson, dialog } = word;
    book = book || level; // Use 'level' if 'book' is not available

    if (book && lesson && dialog) {
      this.wordGroupsByLevelLessonDialog[book] =
        this.wordGroupsByLevelLessonDialog[book] || {};
      this.wordGroupsByLevelLessonDialog[book][lesson] =
        this.wordGroupsByLevelLessonDialog[book][lesson] || {};
      this.wordGroupsByLevelLessonDialog[book][lesson][dialog] =
        this.wordGroupsByLevelLessonDialog[book][lesson][dialog] || [];
      this.wordGroupsByLevelLessonDialog[book][lesson][dialog].push(word);
    }
  }
}
