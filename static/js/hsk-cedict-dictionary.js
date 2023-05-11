importScripts("../vendor/localforage/localforage.js");
importScripts("../js/base-dictionary.js");

class HskCedictDictionary extends BaseDictionary {
  constructor({ l1 = undefined, l2 = undefined } = {}) {
    super({ l1, l2 });
    this.cedictFile = `${SERVER}/data/hsk-cedict/hsk_cedict.csv.txt`;
    this.characterFile = `${SERVER}/data/hsk-cedict/hsk_characters.csv.txt`;
    this.newHSKFile = `${SERVER}/data/hsk-cedict/new_hsk.csv.txt`;
    this.version = "1.1.11";
    this.hskStandardCourseWords = {}; // a tree structure by book, lesson, and dialog
    this.characters = [];
    this.newHSK = [];
    this.maxWeight = 0;
    this.traditionalIndex = {};
  }

  credit() {
    return 'The Chinese dictionary is provided by <a href="https://www.mdbg.net/chinese/dictionary?page=cedict">CC-CEDICT</a>, open-source and distribtued under a <a href="https://creativecommons.org/licenses/by-sa/4.0/">Creative Commons Attribution-ShareAlike 4.0 International License</a>. We also added HSK information on top.';
  }

  async loadData() {
    // const server =  `${process.env.baseUrl}/`
    let [words, characters, newHSK] = await Promise.all([
      this.loadAndNormalizeDictionaryData({
        name: "hsk_cedict",
        file: this.cedictFile,
      }),
      this.loadDictionaryData({
        name: "hsk_characters",
        file: this.characterFile,
      }),
      this.loadDictionaryData({
        name: "new_hsk",
        file: this.newHSKFile,
      }),
    ]);
    for (let row of words) {
      row.rank = row.weight / this.maxWeight;
      this.compileHSKStandardCourseWords(row);
    }
    this.words = words;
    this.characters = characters;
    this.newHSK = newHSK;
    this.createIndices();
  }


  createSearcher() {
    this.searcher = new Fuse(this.words, {
      keys: ["simplified", "traditional"],
      includeScore: true,
      threshold: 0.3
    });
  }

  fuzzySearch(query, limit = 10) {
    let results = this.words.filter((word) => query.includes(word.simplified) || query.includes(word.traditional));
    results.sort((a, b) => { return query.indexOf(a.head) - query.indexOf(b.head) });
    results.sort((a, b) => { return b.head.length - a.head.length });
    results = results.slice(0, limit);
    return results
  }

  lookupBySearch(text, limit = 10) {
    let words = this.words.filter(w => w.search.includes(text) || w.simplified.includes(text) || w.traditional.includes(text))
    words = words.sort((a, b) => a.search.length - b.search.length).slice(0, limit)
    words = words.map(word => Object.assign({ score: 1 / (text.length + 1) }, word))
    return words
  }

  compileHSKStandardCourseWords(word) {
    let { book, lesson, dialog } = word;
    if (book && lesson && dialog) {
      this.hskStandardCourseWords[book] =
        this.hskStandardCourseWords[book] || {};
      this.hskStandardCourseWords[book][lesson] =
        this.hskStandardCourseWords[book][lesson] || {};
      this.hskStandardCourseWords[book][lesson][dialog] =
        this.hskStandardCourseWords[book][lesson][dialog] || [];
      this.hskStandardCourseWords[book][lesson][dialog].push(word);
    }
  }

  getHSKStandardCourseWords() {
    const hskStandardCourseWords = this.hskStandardCourseWords
    return hskStandardCourseWords;
  }

  createIndices() {
    console.log(`${this.name}: Indexing...`);
    for (let word of this.words) {
      // Handle simplified
      if (!Array.isArray(this.searchIndex[word.simplified])) {
        this.searchIndex[word.simplified] = [];
      }
      if (!this.searchIndex[word.simplified].includes(word)) {
        this.searchIndex[word.simplified].push(word);
      }
  
      // Handle traditional
      if (word.simplified !== word.traditional) {
        if (!Array.isArray(this.searchIndex[word.traditional])) {
          this.searchIndex[word.traditional] = [];
        }
        if (!this.searchIndex[word.traditional].includes(word)) {
          this.searchIndex[word.traditional].push(word);
        }
      }
    }
  }
  

  getNewHSK() {
    if (this.newHSKCrunched) return this.newHSKCrunched;
    else {
      let newHSK = this.newHSK;
      let newHSKWordsFlattened = newHSK
        .map((row) => row.simplified)
        .reduce((a, b) => a + b, "");
      let words = this.words.filter(row => newHSKWordsFlattened.includes(row.simplified) || newHSKWordsFlattened.includes(row.traditional));
      for (let newHSKWord of newHSK) {
        let matchedWords = words.filter(word => newHSKWord.simplified === word.simplified || newHSKWord.pinyin === word.pinyin);
        if (matchedWords && matchedWords[0]) {
          let { hsk, pinyin, id, definitions } = matchedWords[0];
          newHSKWord = Object.assign(newHSKWord, { hsk, id });
        }
      }
      this.newHSKCrunched = newHSK; // Cache this
      words = null;
      newHSKWordsFlattened = null;
      return this.newHSKCrunched;
    }
  }

  get(id, head) {
    let word = super.get(id, head);
    this.addNewHSK(word);
    return word
  }

  getByNewHSK(level, num) {
    let match = this.newHSK.find(
      (word) => word.level === level && Number(word.num) === num
    );
    let words = this.lookupSimplified(
      match.simplified,
      match.pinyin,
      match.definitions
    );
    if (words.length === 0)
      words = this.lookupSimplified(match.simplified, match.pinyin);
    if (words.length === 0) words = this.lookupSimplified(match.simplified);
    if (words && words.length > 0) {
      return words[0];
    }
  }

  getNewLevel(word) {
    return this.newHSK.filter(
      (row) =>
        row.simplified === word.simplified &&
        row.pinyin == word.pinyin &&
        row.definitions.includes(word.definitions[0])
    );
  }

  addNewHSK(word) {
    let newHSKMatches = this.getNewLevel(word) || [];
    let newHSK = unique(newHSKMatches.map((word) => word.level)).join("/");
    return Object.assign(word, {
      newHSKMatches,
      newHSK,
    });
  }

  getByHSKId(hskId) {
    let word = this.words.find((row) => row.hskId === hskId);
    return this.addNewHSK(word);
  }

  getByBookLessonDialog(book, lesson, dialog) {
    let words = this.words.filter(
      (row) =>
        parseInt(row.book) === parseInt(book) &&
        parseInt(row.lesson) === parseInt(lesson)
    );
    if (dialog)
      words = words.filter(
        (row) => row.dialog.toString() === dialog.toString()
      );
    return words;
  }

  lookupByLesson(level, lesson) {
    level = String(level);
    lesson = String(lesson);
    return this.words.filter(
      (row) => row.hsk === level && row.lesson === lesson
    );
  }

  lookupByCharacter(char) {
    return this.words.filter((row) => row.simplified.includes(char));
  }

  lookupByPronunciation(pinyin) {
    return this.words.filter(
      (row) =>
        removeTonesMarks(row.search).replace(/ /g, "") ===
        removeTonesMarks(pinyin).replace(/ /g, "")
    );
  }

  lookupSimplified(simplified, pinyin = false, definitions = false) {
    const candidates = this.words
      .filter((row) => {
        let pinyinMatch = pinyin ? row.pinyin === pinyin : true;
        let defMatch = definitions
          ? definitions.includes(row.definitions[0])
          : true;
        return pinyinMatch && defMatch && row.simplified === simplified;
      })
      .sort((a, b) => {
        return b.weight - a.weight;
      });
    return candidates.map((candidate) => this.addNewHSK(candidate));
  }

  lookupTraditional(traditional, pinyin = false) {
    const candidates = this.words
      .filter((row) => {
        let pinyinMatch = true;
        if (pinyin.length > 0) {
          pinyinMatch = row.pinyin === pinyin;
        }
        return pinyinMatch && row.traditional === traditional;
      })
      .sort((a, b) => {
        return b.weight - a.weight;
      });
    return candidates.map((candidate) => this.addNewHSK(candidate));
  }

  lookupByPattern(pattern) {
    // pattern like '～体'
    var results = [];
    if (pattern.includes("～")) {
      const regexPattern = "^" + pattern.replace(/～/gi, ".+") + "$";
      const regex = new RegExp(regexPattern);
      results = this.words.filter(
        (word) =>
          regex.test(word.simplified) &&
          word.oofc === "" &&
          word.hsk != "outside"
      );
    } else {
      results = this.words.filter(
        (word) =>
          word.simplified.includes(pattern) &&
          word.oofc === "" &&
          word.hsk != "outside"
      );
    }
    return results;
  }

  processCounters(definitions) {
    let counters = [];
    definitions.forEach((definition, index) => {
      if (definition.startsWith("CL")) {
        definition
          .replace("CL:", "")
          .split(",")
          .forEach((counter) => {
            let c = {
              pinyin: counter.replace(/.*\[(.*)\]/, "$1"),
            };
            let t = counter.replace(/\[(.*)\]/, "").split("|");
            c.simplified = t[t.length - 1];
            c.traditional = t[0];
            counters.push(c);
          });
        definitions[index] = null;
      }
    });
    return [counters, definitions.filter((def) => def)];
  }

  determinePos(definition) {
    if (definition.startsWith("to ")) return "verb";
    if (definition.startsWith("a ") || definition.startsWith("the "))
      return "noun";
    if (definition.startsWith("surname ") || /^[A-Z].*/.test(definition))
      return "proper noun";
    return undefined;
  }

  normalizeWord(row) {
    if (
      row.definitions.includes("surname ") ||
      row.definitions.startsWith("variant") ||
      row.definitions.startsWith("old variant") ||
      row.traditional.startsWith("妳")
    ) {
      row.weight = -1;
    }

    let definitions = row.definitions.split("/");
    let pos = definitions[0] ? this.determinePos(definitions[0]) : undefined;

    Object.assign(row, {
      id: `${row.traditional},${row.pinyin.replace(/ /g, "_")},${row.index}`,
      bare: row.simplified,
      head: row.simplified,
      accented: row.simplified,
      weight: Number(row.weight),
      cjk: {
        canonical:
          row.traditional && row.traditional !== "NULL"
            ? row.traditional
            : undefined,
        phonetics: row.pinyin,
      },
      pronunciation: row.pinyin,
      definitions,
      search: removeToneMarks(row.pinyin.replace(/ /g, "")),
      level: row.hsk,
      pos,
    });

    const [counters, remainingDefinitions] = this.processCounters(
      row.definitions
    );
    if (counters.length > 0) {
      row.counters = counters;
      if (!row.pos) row.pos = "noun";
    }

    row.definitions = remainingDefinitions;
    this.maxWeight = Math.max(row.weight, this.maxWeight);
  }

  lookupHSKChar(simplified) {
    return this.characters.find((row) => row.word === simplified);
  }

  listCharacters() {
    return this.characters;
  }
}
