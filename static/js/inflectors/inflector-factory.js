const InflectorFactory = {
  inflectors: {
    JapaneseInflector: ["jpn"],
    KoreanInflector: ["kor"],
    RussianInflector: ["rus"],
    FrenchInflector: ["fra"],
    // EnglishInflector: ["eng"],
  },
  async createInflector(l2) {
    // pick the right inflector for the language
    let languageCode = l2["iso639-3"] || l2["glottologId"];
    for (let inflector in this.inflectors) {
      if (this.inflectors[inflector].includes(languageCode)) {
        console.log('Initialize inflector: ', inflector);
        const inflectorFile = `../js/inflectors/${inflector.replace('Inflector', '').toLowerCase()}-inflector.js`;
        // Load the required tokenizer file using importScripts
        importScripts(inflectorFile);
        // Initialize the tokenizer class
        const InflectorClass = eval(inflector); // Access the tokenizer class from the global scope
        return await InflectorClass.load({l2});
      }
    }
    importScripts('../js/inflectors/base-inflector.js');
    const BaseInflectorClass = BaseInflector;
    return new BaseInflectorClass(l2);
  },
};
