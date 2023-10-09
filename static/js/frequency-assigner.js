importScripts("../vendor/axios/axios.min.js");
importScripts("../vendor/localforage/localforage.js");
importScripts("../vendor/hash-string/hash-string.min.js");
importScripts("../vendor/fuse.js@6.6.2/fuse.min.js");

class FrequencyAssigner {
  constructor({ l1 = undefined, l2 = undefined } = {}) {
    this.l1 = l1;
    this.l2 = l2;
    this.searchIndex = {}; // This holds the frequency data
    this.indexDbVerByLang = {};
    this.lemmatized = false; // Whether this is a lemmatized and folded frequency list
    this.name = 'FrequencyAssigner';
  }

  static async load({ l1, l2 }) {
    const instance = new this({ l1, l2 });
    await instance.loadData();
    return instance;
  }

  async loadData() {
    const file = "/data/frequency-lists/zipf_frequency_list_" + this.l2.code + ".csv";
    this.loadFrequencyData({
      name: "zipf_frequency_list_" + this.l2.code,
      file,
    }).then((data) => {
      if (data?.[0]?.lemma) this.lemmatized = true;
      this.createIndices(data);
      data = null;
      console.log(this.searchIndex);
    });
  }

  createIndices(data) {
    console.log(`${this.name}: Indexing...`);
    let wordKey = this.lemmatized ? "lemma" : "word";
    let frequencyKey = this.lemmatized ? "folded_frequency" : "frequency";
    for (let word of data) {
      this.searchIndex[word[wordKey]] = Number(word[frequencyKey]);
    }
  }

  /**
   * This method tries to load dictionary data from local storage first.
   * If it is not available, it fetches the data from the server,
   * stores it in local storage for future use, and then returns the data.
   *
   * @param {string} name - The name of the dictionary used as a key in local storage.
   * @param {string} file - The URL of the remote file containing the dictionary data.
   * @returns {Array} - An array of dictionary entries parsed from the fetched data.
   */
  async loadFrequencyData({ name, file, delimiter = "," }) {
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
        `${this.name}: Frequency list '${name}' loaded from local indexedDB via localforage`
      );
    }

    // If data is available, parse it using Papa Parse and return the parsed data
    if (data) {
      return this.parseFrequencyData({ data, delimiter });
    }
  }

  parseFrequencyData({ data, delimiter = "," }) {
    let results = Papa.parse(data, {
      header: true,
      delimiter,
    });
    return results.data;
  }

  getFrequency(word) {
    return this.searchIndex[word];
  }
}
