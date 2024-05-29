// base-inflector.js
class BaseInflector {
  constructor({ l2 = undefined } = {}) {
    this.l2 = l2;
    this.inflectionCache = {};
    this.serverCache = {};
  }

  static async load({ l2 = undefined } = {}) {
    const instance = new this({ l2 });
    await instance.loadData();
    return instance;
  }

  async loadData() {
    // Optional. Implement this method in derived classes if you need to load data.
  }

  async inflectWithCache(lemma) {
    if (this.inflectionCache[lemma]) {
      return this.inflectionCache[lemma];
    }

    const inflectedForms = await this.inflect(lemma);
    this.inflectionCache[lemma] = inflectedForms;

    return inflectedForms;
  }

  loadServerCache(data) {
    for (let key in data) {
      // Initialize the serverCache object if it doesn't exist
      if (!this.serverCache[this.l2.code]) {
        this.serverCache[this.l2.code] = {};
      }
      this.serverCache[this.l2.code][key] = data[key];
      // console.log("Loading server cache for", this.l2.code, key);
    }
  }

  loadFromServerCache(text) {
    const key = CryptoJS.MD5(text).toString();
    const tokens = this.serverCache[this.l2.code]?.[key];
    // console.log("Loading from server cache for", this.l2.code, key, tokens, {text});
    return tokens
  }

  async inflect(lemma) {
    // Implement inflection logic for the base class.
    // You can override this method in derived classes for each specific language.
    return [{
      table: 'head',
      field: 'head',
      form: lemma
    }];
  }

  async getAccentForm(text, head = undefined) {
    // Only for Russian.
  }
}
