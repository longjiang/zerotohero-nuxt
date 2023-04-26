// @/lib/inflector-factory.js
import BaseInflector from "@/lib/inflectors/base-inflector";
import JapaneseInflector from "@/lib/inflectors/japanese-inflector";
import KoreanInflector from "@/lib/inflectors/korean-inflector";
// import EnglishInflector from "@/lib/inflectors/english-inflector";
// import FrenchInflector from "@/lib/inflectors/french-inflector";

export default {
  inflectors: {
    JapaneseInflector: ["jpn"],
    KoreanInflector: ["kor"],
    // EnglishInflector: ["eng"],
    // FrenchInflector: ["fra"],
  },
  createInflector(l2) {
    const inflectorMapping = {
      JapaneseInflector,
      KoreanInflector,
      // EnglishInflector,
      // FrenchInflector,
    };
    // pick the right inflector for the language
    let languageCode = l2["iso639-3"] || l2["glottologId"];
    for (let inflector in this.inflectors) {
      if (this.inflectors[inflector].includes(languageCode)) {
        const InflectorClass = inflectorMapping[inflector];
        return new InflectorClass(l2);
      }
    }
    return new BaseInflector(l2);
  },
};
