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
    this.wordKey = "lemma";
    this.frequencyKey = "frequency";
    this.name = "FrequencyAssigner";
    this.levelThresholds = {
      1: 5.79,
      2: 5.35,
      3: 4.99,
      4: 4.56,
      5: 4.09,
      6: 3.57,
      7: 3.01,
    };
  }

  static hasFrequencyData(l2) {
    const langsWithFrequencyData = [
      "ar",
      "bn",
      "bs",
      "bg",
      "ca",
      "zh",
      "hr",
      "cs",
      "da",
      "nl",
      "en",
      "fi",
      "fr",
      "de",
      "el",
      "he",
      "hi",
      "hu",
      "is",
      "id",
      "it",
      "ja",
      "ko",
      "lv",
      "lt",
      "mk",
      "ms",
      "no",
      "nn",
      "nb",
      "fa",
      "pl",
      "pt",
      "ro",
      "ru",
      "sl",
      "sk",
      "sr",
      "es",
      "sv",
      "fi",
      "ta",
      "tr",
      "uk",
      "ur",
      "vi",
    ];
    return langsWithFrequencyData.includes(l2.code);
  }

  static async load({ l1, l2 }) {
    const instance = new this({ l1, l2 });
    await instance.loadData();
    return instance;
  }

  async loadData() {
    let code = this.l2.code;
    if (["no", "nb", "nn"].includes(code)) code = "nb"; // Use Norwegian Bokmål frequency list for all Norwegian variants
    const file = "/data/frequency-lists/zipf_frequency_list_" + code + ".csv";
    let data = await this.loadFrequencyData({
      name: "zipf_frequency_list_" + this.l2.code,
      file,
    });
    if (data?.[0]?.lemma) this.lemmatized = true;
    this.wordKey = this.lemmatized ? "lemma" : "word";
    this.frequencyKey = this.lemmatized ? "folded_frequency" : "frequency";
    data = data.filter((word) => word[this.frequencyKey] > 3); // Remove words with frequency <= 3
    this.createIndices(data);
    this.levelThresholds = this.determineLevelThresholds(data);
    data = null;
    return this;
  }

  createIndices(data) {
    console.log(`${this.name}: Indexing...`);
    for (let word of data) {
      let frequency = word[this.frequencyKey];
      this.searchIndex[word[this.wordKey]] = Number(frequency);
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

  // Determine the minimum Zipf frequency for each level
  determineLevelThresholds(data) {
    // Calculate the number of words for each level
    const totalWords = data.length;
    let level1Words = Math.floor(totalWords / 127); // 2^0 + 2^1 + 2^2 + ... + 2^6 = 127

    let levelThresholds = {};
    let wordsSoFar = 0;

    for (let i = 0; i < 7; i++) {
      wordsSoFar += level1Words * Math.pow(2, i);
      let threashold =
        data[wordsSoFar]?.[this.frequencyKey] ||
        data[data.length - 1]?.[this.frequencyKey];
      levelThresholds[i + 1] = Number(threashold);
    }

    return levelThresholds;
  }

  addFrequencyAndLevel(item) {
    item.frequency = this.getFrequency(item.head);
    if (!item.frequency) {
      item.frequency = this.getFrequency(item.search);
    }
    if (!item.level) item.level = this.getLevelByFrequency(item.frequency); // Sometimes the dictionary already has level info
  }
  addFrequencyAndLevelToItems(items) {
    for (let item of items) {
      this.addFrequencyAndLevel(item); // Assuming this function assigns both frequency and level to the item
    }
    let filteredItems = items.filter((item) => item.level && item.level !== 'outside'); // Remove items without level info
    filteredItems = filteredItems.sort((a, b) => {
      return b.frequency - a.frequency; // Sorting in descending order.
    });

    let wordsByLevel = {};

    // Initialize wordsByLevel
    for (let level = 1; level <= 7; level++) {
      wordsByLevel[level] = [];
    }

    for (let item of filteredItems) {
      wordsByLevel[item.level].push(item);
    }

    for (let level = 1; level <= 7; level++) {
      // Assign every 30 words in this level to a lesson
      // In each lesson, every 10 words into a dialog
      let lesson = 0;
      let dialog = 0;
      for (let i = 0; i < wordsByLevel[level].length; i++) {
        if (i % 10 === 0) dialog++; // This condition should be checked first
        if (i % 30 === 0) {
          lesson++;
          dialog = 1; // Reset dialog for the start of a new lesson
        }
        let item = wordsByLevel[level][i];
        item.lesson = lesson;
        item.dialog = dialog;
      }
    }
  }

  getFrequency(word) {
    return this.searchIndex[word];
  }

  getLevelByFrequency(frequency) {
    return Object.keys(this.levelThresholds).find((level) => {
      return frequency >= this.levelThresholds[level];
    });
  }
}
