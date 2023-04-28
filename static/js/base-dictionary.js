importScripts('../js/dictionary-utils.js')

class BaseDictionary {
  
  constructor({ l1 = undefined, l2 = undefined } = {}) {
    this.l1 = l1;
    this.l2 = l2;
    this.words = [];
    this.name = this.constructor.name;
    this.version = null;
  }

  static async load({ l1 = undefined, l2 = undefined } = {}) {
    throw new Error('load() method must be implemented in the subclass');
  }

  async tokenize(text) {
    return await this.tokenizer.tokenizeWithCache(text);
  }

  lookupMultiple(text) {
    throw new Error('lookupMultiple() method must be implemented in the subclass');
  }

  // Override this method for CJK languages only
  lookupByCharacter(characterStr) {
    throw new Error('lookupByCharacter() method must be implemented in the subclass');
  }

  inflect(head) {
    throw new Error('inflect() method must be implemented in the subclass');
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
    throw new Error('random() method must be implemented in the subclass');
  }

  lookupByPattern(pattern) {
    throw new Error('lookupByPattern() method must be implemented in the subclass');
  }

  lookup(keyword) {
    throw new Error('lookup() method must be implemented in the subclass');
  }

  getWords() {
    throw new Error('getWords() method must be implemented in the subclass');
  }

  getSize() {
    return this.words.length;
  }

  findPhrases(wordObj) {
    throw new Error('findPhrases() method must be implemented in the subclass');
  }

  get(wordId) {
    throw new Error('get() method must be implemented in the subclass');
  }
}