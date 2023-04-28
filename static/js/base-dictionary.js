importScripts('../js/dictionary-utils.js')
importScripts("../js/tokenizers/tokenizer-factory.js");
importScripts("../js/inflectors/inflector-factory.js");

class BaseDictionary {
  
  constructor({ l1 = undefined, l2 = undefined } = {}) {
    this.l1 = l1;
    this.l2 = l2;
    this.words = [];
    this.name = this.constructor.name;
    this.version = null;
    this.tokenizer = null;
    this.indexDbVerByLang = {}
  }

  static async load({ l1 = undefined, l2 = undefined } = {}) {
    const instance = new this({ l1, l2 });
    await instance.loadData();
    instance.tokenizer = TokenizerFactory.createTokenizer(l2, instance.words);
    instance.inflector = InflectorFactory.createInflector(l2);
    return instance;
  }

  loadData() {
    throw new Error('loadData() method must be implemented in the subclass');
  }

  async tokenize(text) {
    return await this.tokenizer.tokenizeWithCache(text);
  }

  
  dictionaryFile({
    l1Code = undefined,
    l2Code = undefined
  } = {}) {
    throw new Error('dictionaryFile() method must be implemented in the subclass');
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
  async loadDictionaryData(name, file) {
    const l2Code = this.l2['iso639-3']
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
      console.log(`${this.name}: dictionary '${name}' loaded from local indexedDB via localforage`);
    }

    // If data is available, parse it using Papa Parse and return the parsed data
    if (data) {
      let results = Papa.parse(data, {
        header: true,
        delimiter: ','
      });
      return results.data;
    }
  }

  lookupMultiple(text) {
    throw new Error('lookupMultiple() method must be implemented in the subclass');
  }

  lookupFuzzy(text, limit = 30, quick = false) {
    throw new Error('lookupFuzzy() method must be implemented in the subclass');
  }

  // Override this method for CJK languages only
  lookupByCharacter(characterStr) {
    throw new Error('lookupByCharacter() method must be implemented in the subclass');
  }

  async inflect(text) {
    return await this.inflector.inflectWithCache(text)
  }

  // This method should be overridden for CJK languages
  lookupSimplified(simplifiedStr) {
    throw new Error('lookupSimplified() method must be implemented in the subclass');
  }

  lookupByDef(definitionStr) {
    throw new Error('lookupByDef() method must be implemented in the subclass');
  }

  lookupByPronunciation(pronunciationStr) {
    throw new Error('lookupByPronunciation() method must be implemented in the subclass');
  }

  credit() {
    throw new Error('credit() method must be implemented in the subclass');
  }

  random() {
    return randomProperty(this.words);
  }

  lookupByPattern(pattern) {
    throw new Error('lookupByPattern() method must be implemented in the subclass');
  }

  lookup(keyword) {
    throw new Error('lookup() method must be implemented in the subclass');
  }
  
  getWords() {
    return this.words;
  }

  getSize() {
    return this.words.length;
  }

  findPhrases(wordObj) {
    throw new Error('findPhrases() method must be implemented in the subclass');
  }

  /**
   * Get a word by ID. This is called from various components.
   * @param {*} id the word's id
   * @param {*} head (optional) the head of the word to check if matches the word retrieved; if mismatched, we'll look for a matching word instead.
   * @returns
   */
  get(id, head) {
    let word;
    word = this.words.find((w) => w.id === id);
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
}