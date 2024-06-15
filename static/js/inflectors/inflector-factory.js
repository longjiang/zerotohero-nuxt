const InflectorFactory = {
  inflectors: {
    JapaneseInflector: ["jpn"],
    KoreanInflector: ["kor"],
    RussianInflector: ["rus"],
    FrenchInflector: ["fra"],
    CompromiseInflector: [ // Local and fast
      "eng",
      "deu",
      // "fra", // Handled with FrenchInflector, which shows subjonctif better
      "ita",
      "spa",
    ],
    PymorphyInflector: [
      "ukr",
    ],
    PatternInflector: [
      // "eng", // Handled with CompromiseInflector locally for faster word-saving
      // "deu", // Handled with CompromiseInflector locally for faster word-saving
      // "ita", // Handled with CompromiseInflector locally for faster word-saving
      // "spa", // Handled with CompromiseInflector locally for faster word-saving
      // "fra", // Handled with FrenchInflector locally for faster word-saving
      "nld",
    ],
    // NodeNlpInflector: [
    //   "ara",
    //   "ell",
    //   "hin",
    //   "por",
    //   "swe",
    //   "tur",
    //   "ukr",
    // ],
    // Note that some languages do not inflect, including Chinese, Vietnamese, Thai and Indonesian
  },
  async createInflector(l2) {
    // pick the right inflector for the language
    let languageCode = l2["iso639-3"] || l2["glottologId"];
    for (let inflector in this.inflectors) {
      if (this.inflectors[inflector].includes(languageCode)) {
        console.log('Initialize inflector: ', inflector);
        const inflectorFile = `../js/inflectors/${pascalToKebabCase(inflector)}.js`;
        // Load the required tokenizer file using importScripts
        importScripts(inflectorFile);
        // Initialize the tokenizer class
        const InflectorClass = eval(inflector); // Access the tokenizer class from the global scope
        return await InflectorClass.load({l2});
      }
    }
    importScripts('../js/inflectors/base-inflector.js');
    const BaseInflectorClass = BaseInflector;
    return new BaseInflectorClass({l2});
  },
};
