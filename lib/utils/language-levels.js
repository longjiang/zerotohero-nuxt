import EXAMS from './exams'

export const LEVELS = {
  1: {
    hsk: "1",
    cefr: "PreA1",
    jlpt: "Pre-N5",
    topik: "Pre-1",
    category: "Beginner",
    hoursMultiplier: 1 / 16
  },
  2: {
    hsk: "2",
    cefr: "A1",
    jlpt: "N5",
    topik: "1",
    category: "Beginner",
    hoursMultiplier: 1 / 16
  },
  3: {
    hsk: "3",
    cefr: "A2",
    jlpt: "N4",
    topik: "2",
    category: "Beginner",
    hoursMultiplier: 1 / 8
  },
  4: {
    hsk: "4",
    cefr: "B1",
    jlpt: "N3",
    topik: "3",
    category: "Intermediate",
    hoursMultiplier: 1 / 4
  },
  5: {
    hsk: "5",
    cefr: "B2",
    jlpt: "N2",
    topik: "4",
    category: "Intermediate",
    hoursMultiplier: 1 / 2
  },
  6: {
    hsk: "6",
    cefr: "C1",
    jlpt: "N1",
    topik: "5",
    category: "Advanced",
    hoursMultiplier: 1
  },
  7: {
    hsk: "7-9",
    cefr: "C2",
    topik: "6",
    category: "Advanced",
    hoursMultiplier: 2
  },
}

export const topics = {
  animation: 'Animation',
  art: 'Art',
  engineering: 'Engineering',
  education: 'Education',
  entertainment: 'Entertainment',
  food: 'Food',
  geography: 'Geography',
  history: 'History',
  kids: 'Kids',
  language: 'Language',
  literature: 'Literature',
  music: 'Music',
  news: 'News',
  religion: 'Religion',
  science: 'Science',
  society: 'Society'
}

export const HSK_WORD_COUNT = {
  1: 150,
  2: 150,
  3: 300,
  4: 600,
  5: 1300,
  6: 2500
}

export const HSK_COLORS = {
  1: '#f8b51e',
  2: '#267f94',
  3: '#fd4f1c',
  4: '#bb1718',
  5: '#1b3e76',
  6: '#6a3669',
  outside: '#28a745'
}

/**
 * Gets level information for a language
 * @param Object language 
 * @returns { 1: { exam: {lang: 'zh', slug: 'hsk', name: 'HSK'}, level: 1 }, 2: { ... }, ...}
 */
 export const languageLevels = (language) => {
  let levels = {};
  for (let level in LEVELS) {
    let exam = EXAMS.find(e => e.lang === language.code && LEVELS[level][e.slug]) || EXAMS.find(e => e.slug === 'cefr')
    let key = exam.slug
    let levelNum = LEVELS[level][key] || LEVELS[level].cefr
    levels[level] = {
      numeric: level,
      exam,
      name: exam.name + " " + levelNum,
      level: levelNum,
    }
  }
  return levels;
}

export const level = (level, l2 = undefined) => {
  let levels = languageLevels(l2)
  return levels[level]
}

export const languageHours = (language) => {
  let baseHours = language.hours || 1100
  let levels = Object.assign({}, LEVELS)
  let hours = {}
  for (let level in levels) {
    hours[level] = baseHours * levels[level].hoursMultiplier
  }
  return hours
}

export const l1Code = (l2Code) => {
  let l1 = "en";
  let special = SPECIAL_LANGUAGES[l2Code];
  if (special) l1 = special.l1;
  return l1
}

export const reject = {
  en: ['m', 's', 't', 'll', 'd', 're', 'ain', 'don']
}


export const dictionaryTooLargeAndWillCauseServerCrash = (l2) => {
  let tooLarge = ['lat', 'spa', 'deu', 'ita', 'fra', 'por'].includes(l2)
  return tooLarge
}