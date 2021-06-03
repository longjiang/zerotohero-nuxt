export const state = () => {
  return {
    l1: undefined,
    l2: undefined,
    dictionary: undefined,
    dictionaryName: undefined,
    adminMode: false,
    settingsLoaded: {},
    l2Settings: {
      showDefinition: false,
      showPinyin: true,
      useTraditional: false,
      showTranslation: false,
      showQuiz: true
    }
  }
}

export const mutations = {
  SET_L1(state, l1) {
    state.l1 = l1
  },
  SET_L2(state, l2) {
    state.l2 = l2
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
      state.adminMode = settings.adminMode
      state.l2Settings = settings[state.l2.code] || state.l2Settings
    }
    console.log('😄 settings loaded', state.l2Settings)
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
  SET_L2_SETTINGS(state, l2Settings) {
    state.l2Settings = Object.assign(state.l2Settings, l2Settings)
    if (typeof localStorage !== 'undefined') {
      let settings = JSON.parse(localStorage.getItem('zthSettings') || '{}')
      settings[state.l2.code] = state.l2Settings
      localStorage.setItem('zthSettings', JSON.stringify(settings))
    }
  }
}
