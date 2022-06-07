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
      exam,
      name: exam.name + " " + levelNum,
      level: levelNum,
    }
  }
  return levels;
}