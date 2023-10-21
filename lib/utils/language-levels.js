import EXAMS from "./exams";

export const LEVELS = {
  1: {
    hsk: "1",
    cefr: "Pre-A1",
    jlpt: "Pre-N5",
    topik: "Pre-1",
    ielts: "1",
    category: "Beginner I",
    hoursMultiplier: 1 / 16,
  },
  2: {
    hsk: "2",
    cefr: "A1",
    jlpt: "N5",
    topik: "1",
    ielts: "2",
    category: "Beginner II",
    hoursMultiplier: 1 / 16,
  },
  3: {
    hsk: "3",
    cefr: "A2",
    jlpt: "N4",
    topik: "2",
    ielts: "3.5",
    category: "Beginner III",
    hoursMultiplier: 1 / 8,
  },
  4: {
    hsk: "4",
    cefr: "B1",
    jlpt: "N3",
    topik: "3",
    ielts: "5",
    category: "Intermediate I",
    hoursMultiplier: 1 / 4,
  },
  5: {
    hsk: "5",
    cefr: "B2",
    jlpt: "N2",
    topik: "4",
    ielts: "6.5",
    category: "Intermediate II",
    hoursMultiplier: 1 / 2,
  },
  6: {
    hsk: "6",
    cefr: "C1",
    jlpt: "N1",
    topik: "5",
    ielts: "8",
    category: "Advanced I",
    hoursMultiplier: 1,
  },
  7: {
    hsk: "7-9",
    cefr: "C2",
    topik: "6",
    ielts: "9",
    category: "Advanced II",
    hoursMultiplier: 2,
  },
};


export const MAX_DIFFICULTY_BY_LEVEL = {
  ar: [
    0.00168681, 0.00279967, 0.00453687, 0.00779097, 0.0138839, 0.023465,
    0.183862,
  ],
  bg: [
    0.00177726, 0.0026005, 0.00351888, 0.00516078, 0.00763169, 0.0118707,
    0.0752359,
  ],
  ca: [
    0.0033869, 0.00429853, 0.0049663, 0.00562691, 0.00618485, 0.00697609,
    0.0276826,
  ],
  cs: [
    0.00226176, 0.00393957, 0.00533333, 0.0070193, 0.00893468, 0.0116931,
    0.0589474,
  ],
  da: [
    0.00334957, 0.00425345, 0.00488847, 0.00558807, 0.00644014, 0.0077838,
    0.0578485,
  ],
  de: [
    0.00234459, 0.0032763, 0.00433635, 0.00539367, 0.00649187, 0.00805098,
    0.0580363,
  ],
  el: [
    0.00258369, 0.00364094, 0.00458038, 0.00535389, 0.00620326, 0.00746875,
    0.0388784,
  ],
  en: [
    0.00229371, 0.0032655, 0.0039978, 0.00504984, 0.00627964, 0.00806981,
    0.152809,
  ],
  es: [
    0.00239631, 0.00325168, 0.00436006, 0.00551698, 0.00697674, 0.00968168,
    0.0560648,
  ],
  fa: [
    0.00281025, 0.00380435, 0.00542535, 0.00708174, 0.0094942, 0.013336,
    0.0669227,
  ],
  fi: [
    0.00264364, 0.00436041, 0.00579604, 0.00674028, 0.00768121, 0.0100097,
    0.0669721,
  ],
  fr: [
    0.00291868, 0.00435903, 0.00565189, 0.00665396, 0.00756828, 0.00894251,
    0.0782123,
  ],
  hr: [
    0.00225766, 0.00335844, 0.00445919, 0.00597106, 0.00759197, 0.00950809,
    0.029034,
  ],
  hu: [
    0.00180995, 0.00294118, 0.00434684, 0.00641854, 0.00840348, 0.0107214,
    0.0526492,
  ],
  id: [
    0.0020474, 0.00329218, 0.00462356, 0.00643004, 0.00820019, 0.0110847,
    0.0879338,
  ],
  is: [
    0.00236967, 0.00382023, 0.00575972, 0.0069426, 0.00869689, 0.0109093,
    0.0589189,
  ],
  it: [
    0.00270661, 0.00391439, 0.00508605, 0.00637981, 0.00766903, 0.00965476,
    0.0645217,
  ],
  ja: [
    0.0015625, 0.00288612, 0.00400068, 0.00582727, 0.00770642, 0.0101224,
    0.106709,
  ],
  ko: [
    0.00203075, 0.00234937, 0.00264195, 0.00307351, 0.00426646, 0.0140362,
    0.218818,
  ],
  lt: [
    0.00248563, 0.00365588, 0.00466667, 0.00623501, 0.0084465, 0.0116768,
    0.0428376,
  ],
  lv: [
    0.00173029, 0.00236907, 0.00370992, 0.00617697, 0.00833878, 0.0111516,
    0.0668602,
  ],
  mk: [
    0.00144591, 0.00276402, 0.00385151, 0.00573913, 0.00786622, 0.0112612,
    0.0305686,
  ],
  ms: [
    0.00313703, 0.00475358, 0.00581303, 0.00661548, 0.00745245, 0.00962437,
    0.0523221,
  ],
  no: [
    0.00270833, 0.00434753, 0.00571059, 0.00695724, 0.00840226, 0.0106636,
    0.0636888,
  ],
  nl: [
    0.00297134, 0.00428101, 0.00533243, 0.00622429, 0.00715002, 0.00854996,
    0.0383608,
  ],
  pl: [
    0.00258775, 0.00417059, 0.00568507, 0.00705073, 0.00857084, 0.0113442,
    0.101939,
  ],
  pt: [
    0.0032735, 0.00438619, 0.00517856, 0.00602471, 0.007316, 0.00993089,
    0.0686865,
  ],
  ro: [
    0.00218773, 0.00297191, 0.00385467, 0.00496199, 0.00628375, 0.00798299,
    0.0361079,
  ],
  ru: [
    0.00231939, 0.00414907, 0.00741472, 0.0113401, 0.017305, 0.0278373,
    0.384615,
  ],
  sk: [
    0.00260928, 0.00346136, 0.00471014, 0.00650953, 0.00824094, 0.0115263,
    0.0818686,
  ],
  sl: [
    0.00341116, 0.00465399, 0.00610334, 0.00711518, 0.00848906, 0.0112952,
    0.0478049,
  ],
  sv: [
    0.0019906, 0.00281956, 0.00413756, 0.00550928, 0.00667023, 0.0081404,
    0.0337584,
  ],
  tr: [
    0.0013152, 0.0019337, 0.00273261, 0.0041082, 0.00623881, 0.00902348,
    0.0574558,
  ],
  uk: [
    0.00188177, 0.00486081, 0.00673361, 0.00782576, 0.00923008, 0.0122395,
    0.0630899,
  ],
  vi: [
    0.00102564, 0.00126354, 0.00205479, 0.00634761, 0.00940323, 0.0143642,
    0.18421,
  ],
  zh: [
    0.00327454, 0.0055798, 0.00765939, 0.00958302, 0.0121889, 0.0172213,
    0.230341,
  ],
};

export const TOPICS = {
  animation: "Animation",
  art: "Art",
  engineering: "Engineering",
  education: "Education",
  entertainment: "Entertainment",
  food: "Food",
  geography: "Geography",
  history: "History",
  // kids: 'Kids',
  language: "Language",
  literature: "Literature",
  // music: 'Music',
  // news: 'News',
  religion: "Religion",
  science: "Science",
  society: "Society",
};

export const l2LevelKey = (l2) => {
  if (l2 === "ja") return "jlpt";
  if (l2 === "ko") return "topik";
  if (l2 === "zh") return "hsk";
  if (l2 === "en") return "ielts";
  else return "cefr";
};

export const l2LevelName = (l2) => {
  return l2LevelKey(l2).toUpperCase();
};

export const l2LevelNameByLevel = (l2Obj, level) => {
  level = Number(level);
  let levels = languageLevels(l2Obj);
  let l = levels[level]
  if (l) return l.name;
};


export const HSK_WORD_COUNT = {
  1: 150,
  2: 150,
  3: 300,
  4: 600,
  5: 1300,
  6: 2500,
};

export const HSK_COLORS = {
  1: "#f8b51e",
  2: "#267f94",
  3: "#fd4f1c",
  4: "#bb1718",
  5: "#1b3e76",
  6: "#6a3669",
  outside: "#28a745",
};

/**
 * Gets level information for a language
 * @param Object language
 * @returns { 1: { exam: {lang: 'zh', slug: 'hsk', name: 'HSK'}, level: 1 }, 2: { ... }, ...}
 */
export const languageLevels = (language) => {
  let levels = {};
  for (let level in LEVELS) {
    let exam =
      EXAMS.find((e) => e.lang === language.code && LEVELS[level][e.slug]) ||
      EXAMS.find((e) => e.slug === "cefr");
    let key = exam.slug;
    let levelNum = LEVELS[level][key] || LEVELS[level].cefr;
    levels[level] = {
      numeric: level,
      exam,
      name: exam.name + " " + levelNum,
      level: levelNum,
      category: LEVELS[level].category,
    };
  }
  return levels;
};

export const level = (level, l2 = undefined) => {
  let levels = languageLevels(l2);
  return levels[level];
};

export const levelByDifficulty = (difficulty, l2Code) => {
  const difficultyLevels = MAX_DIFFICULTY_BY_LEVEL[l2Code];
  if (!difficultyLevels) return;
  for (let index = 0; index < difficultyLevels.length; index++) {
    if (difficulty < difficultyLevels[index]) {
      return index + 1;
    }
  }
  return 7; // If difficulty is higher than the highest difficulty level, return 7
};



export const maxDifficultyByLevel = (level, l2Code) => {
  const difficultyLevels = MAX_DIFFICULTY_BY_LEVEL[l2Code];
  return level < 7 ? difficultyLevels[level - 1] : 1; // No difficulty level higher than 1
}

export const minDifficultyByLevel = (level, l2Code) => {
  const difficultyLevels = MAX_DIFFICULTY_BY_LEVEL[l2Code];
  return level > 1 ? difficultyLevels[level - 2] : 0;
}

export const levelObjByDifficultyAndLang = (difficulty) => {
  let levels = languageLevels(l2);
  return levels[levelByDifficulty(difficulty)];
};

export const languageHours = (language) => {
  let baseHours = language.hours || 1100;
  let levels = Object.assign({}, LEVELS);
  let hours = {};
  for (let level in levels) {
    hours[level] = baseHours * levels[level].hoursMultiplier;
  }
  return hours;
};

export const l1Code = (l2Code) => {
  let l1 = "en";
  let special = SPECIAL_LANGUAGES[l2Code];
  if (special) l1 = special.l1;
  return l1;
};

export const reject = {
  en: ["m", "s", "t", "ll", "d", "re", "ain", "don"],
};

export const dictionaryTooLargeAndWillCauseServerCrash = (l2) => {
  let tooLarge = ["lat", "spa", "deu", "ita", "fra", "por"].includes(l2);
  return tooLarge;
};
