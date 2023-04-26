// base-inflector.js
class BaseInflector {
  constructor(l2) {
    this.l2 = l2;
    this.inflectionCache = {};
  }

  async inflectWithCache(lemma) {
    if (this.inflectionCache[lemma]) {
      return this.inflectionCache[lemma];
    }

    const inflectedForms = await this.inflect(lemma);
    this.inflectionCache[lemma] = inflectedForms;

    return inflectedForms;
  }

  async inflect(lemma) {
    // Implement inflection logic for the base class.
    // You can override this method in derived classes for each specific language.
    return [lemma];
  }
}

export default BaseInflector;
