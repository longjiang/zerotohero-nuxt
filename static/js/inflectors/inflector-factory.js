const InflectorFactory = {
  inflectors: {
    JapaneseInflector: ["jpn"],
    KoreanInflector: ["kor"],
    RussianInflector: ["rus"],
    // EnglishInflector: ["eng"],
    // FrenchInflector: ["fra"],
  },
  createInflector(l2) {
    // pick the right inflector for the language
    let languageCode = l2["iso639-3"] || l2["glottologId"];
    for (let inflector in this.inflectors) {
      if (this.inflectors[inflector].includes(languageCode)) {
        const inflectorFile = `../js/inflectors/${inflector.replace('Inflector', '').toLowerCase()}-inflector.js`;
        // Load the required tokenizer file using importScripts
        importScripts(inflectorFile);
        // Initialize the tokenizer class
        const InflectorClass = eval(inflector); // Access the tokenizer class from the global scope
        return new InflectorClass(l2);
      }
    }
    importScripts('../js/inflectors/base-inflector.js');
    const BaseInflectorClass = self['BaseInflector'];
    return new BaseInflectorClass(l2);
  },
};
