export const state = () => {
  return {
    l1: undefined,
    l2: undefined,
    dictionary: undefined,
    dictionaryName: undefined,
    adminMode: false,
    hideWord: false,
    hidePhonetics: false,
    hideDefinitions: false,
    subsSearchLimit: true,
    settingsLoaded: {},
    l2Settings: {
      showDefinition: false,
      showPinyin: true,
      useTraditional: false,
      showTranslation: true,
      useSerif: false,
      showQuiz: true,
      showByeonggi: true,
      tvShowFilter: "all",
      talkFilter: "all",
      disableAnnotation: false
    },
    romanizationOffByDefault: ['ko', 'bo', 'dz', 'th', 'my', 'hy', 'vi']
  }
}

export const mutations = {
  SET_L1(state, l1) {
    state.l1 = l1

  },
  SET_L2(state, l2) {
    if (typeof l2 === 'undefined') return
    state.l2 = l2
    if ((l2.scripts && l2.scripts[0] && ['Cyrl', 'Latn'].includes(l2.scripts[0].script)) || state.romanizationOffByDefault.includes(l2.code)) {
      state.l2Settings.showPinyin = false
    }
  },
  SET_DICTIONARY(state, dictionary) {
    state.dictionary = dictionary
  },
  SET_DICTIONARY_NAME(state, dictionaryName) {
    state.dictionaryName = dictionaryName
  },
  LOAD_SETTINGS(state) {
    if (typeof localStorage !== 'undefined') {
      let settings = JSON.parse(localStorage.getItem('zthSettings') || '{}')
      if (typeof settings.adminMode !== 'undefined') state.adminMode = settings.adminMode
      if (typeof settings.subsSearchLimit !== 'undefined') state.subsSearchLimit = settings.subsSearchLimit
      state.l2Settings = Object.assign(state.l2Settings, settings[state.l2.code])
    }
    state.settingsLoaded[state.l2.code] = true
  },
  SET_ADMIN_MODE(state, adminMode) {
    state.adminMode = adminMode
    if (typeof localStorage !== 'undefined') {
      let settings = JSON.parse(localStorage.getItem('zthSettings') || '{}')
      settings.adminMode = adminMode
      localStorage.setItem('zthSettings', JSON.stringify(settings))
    }
  },
  SET_HIDE_WORD(state, hideWord) {
    state.hideWord = hideWord
    if (typeof localStorage !== 'undefined') {
      let settings = JSON.parse(localStorage.getItem('zthSettings') || '{}')
      settings.hideWord = hideWord
      localStorage.setItem('zthSettings', JSON.stringify(settings))
    }
  },
  SET_HIDE_PHONETICS(state, hidePhonetics) {
    state.hidePhonetics = hidePhonetics
    if (typeof localStorage !== 'undefined') {
      let settings = JSON.parse(localStorage.getItem('zthSettings') || '{}')
      settings.hidePhonetics = hidePhonetics
      localStorage.setItem('zthSettings', JSON.stringify(settings))
    }
  },
  SET_HIDE_DEFINITIONS(state, hideDefinitions) {
    state.hideDefinitions = hideDefinitions
    if (typeof localStorage !== 'undefined') {
      let settings = JSON.parse(localStorage.getItem('zthSettings') || '{}')
      settings.hideDefinitions = hideDefinitions
      localStorage.setItem('zthSettings', JSON.stringify(settings))
    }
  },
  SET_SUBS_SEARCH_LIMIT(state, subsSearchLimit) {
    state.subsSearchLimit = subsSearchLimit
    if (typeof localStorage !== 'undefined') {
      let settings = JSON.parse(localStorage.getItem('zthSettings') || '{}')
      settings.subsSearchLimit = subsSearchLimit
      localStorage.setItem('zthSettings', JSON.stringify(settings))
    }
  },
  SET_L2_SETTINGS(state, l2Settings) {
    state.l2Settings = Object.assign(state.l2Settings, l2Settings)
    if (typeof localStorage !== 'undefined') {
      let settings = JSON.parse(localStorage.getItem('zthSettings') || '{}')
      settings[state.l2.code] = state.l2Settings
      localStorage.setItem('zthSettings', JSON.stringify(settings))
    }
  }
}
