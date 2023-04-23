// dictionary-utils.js

const PROXY_SERVER = "https://server.chinesezerotohero.com/";

const DictionaryUtils = {
  // https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
  stripAccents(str) {
    str = str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Accents
      .replace(/[\u0600-\u0620\u064b-\u0655]/g, "") // Arabic diacritics
      .replace(/[\u0559-\u055F]/g, ""); // Armenian diacritics
    if (["he", "hbo", "iw"].includes(this.l2)) {
      str = this.stripHebrewVowels(str);
    }
    return str;
  },

  /*
  * https://gist.github.com/yakovsh/345a71d841871cc3d375
  /* @shimondoodkin suggested even a much shorter way to do this */
  stripHebrewVowels(rawString) {
    return rawString.replace(/[\u0591-\u05C7]/g, "");
  },
  // https://stackoverflow.com/questions/38613654/javascript-find-unique-objects-in-array-based-on-multiple-properties
  uniqueByValues(arr, keyProps) {
    const kvArray = arr.map((entry) => {
      const key = keyProps.map((k) => entry[k]).join("|");
      return [key, entry];
    });
    const map = new Map(kvArray);
    return Array.from(map.values());
  },


  unique(a) {
    return a.filter((item, i, ar) => ar.indexOf(item) === i);
  },
  //https://stackoverflow.com/questions/2532218/pick-random-property-from-a-javascript-object
  randomProperty(obj) {
    var keys = Object.keys(obj);
    return obj[keys[(keys.length * Math.random()) << 0]];
  },
  // Called from <EntryForms> and <WordBlock> components for Russian words
  accent(text) {
    return text.replace(/'/g, "́");
  },

  // https://stackoverflow.com/questions/175739/how-can-i-check-if-a-string-is-a-valid-number
  isNumeric(str) {
    if (typeof str != "string") return false; // we only process strings!
    return (
      !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str))
    ); // ...and ensure strings of whitespace fail
  },
  isThai(text) {
    let match = text.match(/[\u0E00-\u0E7F]+/g);
    return match;
  },
  // json or plain text only, and returns object
  async proxy(url, cacheLife = -1, encoding = false) {
    try {
      let proxyURL = `${PROXY_SERVER}scrape2.php?cache_life=${cacheLife}${encoding ? "&encoding=" + encoding : ""
        }&url=${encodeURIComponent(url)}`;
      let response = await axios.get(proxyURL);
      if (response.data) {
        return response.data;
      }
    } catch (err) {
      console.log(`Cannot get ${url}`);
    }
    return false;
  },
}