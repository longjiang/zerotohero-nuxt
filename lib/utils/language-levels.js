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
    0.00114904, 0.00183216, 0.00288958, 0.00515397, 0.011004, 0.0207027,
    0.171682,
  ],
  bg: [
    0.00128777, 0.00197752, 0.0026139, 0.00384804, 0.00602407, 0.0104164,
    0.0752359,
  ],
  ca: [
    0.00285595, 0.00363661, 0.00434268, 0.00509712, 0.00585352, 0.00666812,
    0.0276826,
  ],
  cs: [
    0.00210521, 0.00295334, 0.00415595, 0.00557816, 0.00769687, 0.0101462,
    0.0544404,
  ],
  da: [
    0.00274395, 0.00348852, 0.00432875, 0.00500551, 0.0059263, 0.00725851,
    0.0578485,
  ],
  de: [
    0.00184619, 0.00249735, 0.00334461, 0.00453175, 0.00582478, 0.00748011,
    0.0580363,
  ],
  el: [
    0.00221436, 0.00304155, 0.00378274, 0.00474726, 0.00571689, 0.00701572,
    0.0388784,
  ],
  en: [
    0.00199527, 0.00268312, 0.00341924, 0.00410797, 0.0053583, 0.00717193,
    0.0681122,
  ],
  es: [
    0.00172227, 0.00224319, 0.00288803, 0.00438319, 0.00662498, 0.00917137,
    0.0555893,
  ],
  fa: [
    0.00236829, 0.0030494, 0.00410156, 0.00580234, 0.00814752, 0.0119309,
    0.0669227,
  ],
  fi: [
    0.00203036, 0.00287576, 0.00449615, 0.00601611, 0.00705772, 0.00910777,
    0.0669721,
  ],
  fr: [
    0.00268362, 0.00383837, 0.00514611, 0.00626404, 0.00718551, 0.00851921,
    0.0782123,
  ],
  hr: [
    0.00196762, 0.00251753, 0.00362795, 0.00472692, 0.00674183, 0.00878564,
    0.029034,
  ],
  hu: [
    0.00141176, 0.00221897, 0.00332464, 0.00487869, 0.00733945, 0.00986483,
    0.0495618,
  ],
  id: [
    0.0015315, 0.00235429, 0.00339462, 0.00497808, 0.00714734, 0.00991292,
    0.0879338,
  ],
  is: [
    0.00150824, 0.00245536, 0.00394832, 0.00595632, 0.00753631, 0.01, 0.0589189,
  ],
  it: [
    0.00214208, 0.00317191, 0.00420009, 0.0055589, 0.00700477, 0.00897226,
    0.0645217,
  ],
  ja: [
    0.00146393, 0.00225361, 0.00345455, 0.00457125, 0.00665027, 0.00926412,
    0.106709,
  ],
  ko: [
    0.00186328, 0.00208322, 0.00237186, 0.00271008, 0.00333086, 0.00977689,
    0.218818,
  ],
  lt: [
    0.00212459, 0.0027456, 0.00371014, 0.00488889, 0.00709096, 0.0103424,
    0.0428376,
  ],
  lv: [
    0.00147422, 0.0017784, 0.002378, 0.00392885, 0.00714136, 0.0100221,
    0.0639706,
  ],
  mk: [
    0.0004, 0.00169971, 0.00279801, 0.0042349, 0.00629706, 0.0100669, 0.0305686,
  ],
  ms: [
    0.00229677, 0.00363943, 0.00503496, 0.00602081, 0.00695203, 0.00854884,
    0.0523221,
  ],
  nl: [
    0.00242436, 0.00341163, 0.00445757, 0.00554803, 0.00658605, 0.00803507,
    0.0383608,
  ],
  no: [
    0.0019943, 0.00316281, 0.00450309, 0.00598444, 0.00753288, 0.00984918,
    0.0636888,
  ],
  pl: [
    0.00187131, 0.00292021, 0.00436797, 0.00603998, 0.00764836, 0.010322,
    0.101939,
  ],
  pt: [
    0.00256276, 0.00350191, 0.00445526, 0.00532216, 0.00646661, 0.00892904,
    0.0686865,
  ],
  ro: [
    0.0017281, 0.00230726, 0.00300452, 0.00404722, 0.00544377, 0.00741002,
    0.0361079,
  ],
  ru: [
    0.00144364, 0.00248695, 0.00422874, 0.00803036, 0.0133302, 0.0240406,
    0.384615,
  ],
  sk: [
    0.0018724, 0.00275484, 0.00349214, 0.00508323, 0.00711021, 0.0102616,
    0.0818686,
  ],
  sl: [
    0.00259185, 0.00357033, 0.00475684, 0.00624578, 0.00761983, 0.0100668,
    0.0355824,
  ],
  sv: [
    0.00151663, 0.00217987, 0.00291257, 0.0044154, 0.00598232, 0.00761311,
    0.0337584,
  ],
  tr: [
    0.000951366, 0.00142658, 0.00197543, 0.00291133, 0.00496159, 0.00808511,
    0.0574558,
  ],
  uk: [
    0.00175658, 0.00193011, 0.00500306, 0.00692154, 0.00833595, 0.0109694,
    0.0630899,
  ],
  vi: [
    0.0004, 0.00104712, 0.00126354, 0.00233767, 0.00768748, 0.0122876, 0.18421,
  ],
  zh: [
    0.0028021, 0.00460175, 0.00655769, 0.00839695, 0.0107929, 0.0152994,
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
  let l = levels[level];
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
};

export const minDifficultyByLevel = (level, l2Code) => {
  const difficultyLevels = MAX_DIFFICULTY_BY_LEVEL[l2Code];
  return level > 1 ? difficultyLevels[level - 2] : 0;
};

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
