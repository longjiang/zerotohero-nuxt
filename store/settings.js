export const state = () => {
  return {
    l1: undefined,
    l2: undefined,
    dictionary: undefined,
    dictionaryName: undefined,
    adminMode: false,
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
      disableAnnotation: false
    },
    romanizationOffByDefault: ['ru', 'ko', 'bo', 'dz', 'ru', 'th', 'my', 'hy', 'uk', 'tt']
  }
}

export const mutations = {
  SET_L1(state, l1) {
    state.l1 = l1

  },
  SET_L2(state, l2) {
    state.l2 = l2
    if (state.romanizationOffByDefault.includes(l2.code)) {
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
  SET_SUBS_SEARCH_LIMIT(state, subsSearchLimit) {
    console.log('SET_SUBS_SEARCH_LIMIT', subsSearchLimit)
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
