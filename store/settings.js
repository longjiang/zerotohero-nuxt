export const romanizationOffByDefault = ["ko", "bo", "dz", "th", "my", "hy", "vi"]

export const defaultL2Settings = {
  l1: 'en',
  showDefinition: false,
  showPinyin: true,
  useTraditional: false,
  showTranslation: true,
  useSerif: false,
  showQuiz: true,
  showByeonggi: true,
  tvShowFilter: "all", // By default we only search TV shows.
  talkFilter: "all", // By default we only search TV shows.
  disableAnnotation: false
}

export const state = () => {
  return {
    l1: undefined, // L1 language object
    l2: undefined, // L2 language object
    dictionary: undefined,
    dictionaryName: undefined,
    adminMode: false,
    hideWord: false,
    hidePhonetics: false,
    hideDefinitions: false,
    subsSearchLimit: true,
    autoPronounce: true, // Whether or not to play the audio automatically when opening a WordBlock popup
    settingsLoaded: {},
    l2Settings: {}, // keyed by language
  };
};

/**
 * EMPTY (no data in localStorage) -> initializeSettings() -> INITIALIZED
 */

export const saveSettingsToStorage = () => {

}

export const loadSettingsFromStorage = () => {
  if (typeof localStorage !== "undefined") {
    let loadedSettings;
    try {
      loadedSettings = JSON.parse(localStorage.getItem("zthSettings"));
    } catch (err) {
      Helper.logError(err);
    }
    if (!loadedSettings) loadedSettings = {};
    return loadedSettings;
  }
};


export const mutations = {
  LOAD_SETTINGS(state) {
    if (typeof localStorage !== "undefined") {
      let loadedSettings = loadSettingsFromStorage();
      for (let property of ['adminMode', 'hideWord', 'hidePhonetics', 'hideDefinitions', 'subsSearchLimit', 'autoPronounce']) {
        if (typeof loadedSettings[property] !== "undefined")
          state[property] = loadedSettings[property];
      }
      state.l2Settings = loadedSettings.l2Settings; // keyed by language
      if (!state.l2Settings[state.l2.code]) state.l2Settings[state.l2.code] = defaultL2Settings
      // Remember the L1 the user picked, so next time when switching L2, this L1 is used.
      if (state.l1) {
        state.l2Settings[state.l2.code].l1 = state.l1.code
        loadedSettings.l2Settings[state.l2.code] = state.l2Settings[state.l2.code];
        localStorage.setItem("zthSettings", JSON.stringify(settings));
      }
    }
    state.settingsLoaded[state.l2.code] = true;
  },
  SET_L1_L2(state, { l1, l2 }) {
    state.l1 = l1;
    if (typeof l2 === "undefined") return;
    state.l2 = l2;
    if (
      (l2.scripts &&
        l2.scripts[0] &&
        ["Cyrl", "Latn"].includes(l2.scripts[0].script)) ||
      romanizationOffByDefault.includes(l2.code)
    ) {
      if (state.l2Settings[l2.code]) state.l2Settings[l2.code].showPinyin = false;
    }
  },
  SET_L1_L2_TO_NULL(state) {
    state.l1 = null
    state.l2 = null
  },
  SET_DICTIONARY(state, dictionary) {
    state.dictionary = dictionary;
  },
  SET_DICTIONARY_NAME(state, dictionaryName) {
    state.dictionaryName = dictionaryName;
  },
  SET_ADMIN_MODE(state, adminMode) {
    state.adminMode = adminMode;
    if (typeof localStorage !== "undefined") {
      let settings = loadSettingsFromStorage();
      settings.adminMode = adminMode;
      localStorage.setItem("zthSettings", JSON.stringify(settings));
    }
  },
  SET_AUTO_PRONOUNCE(state, autoPronounce) {
    state.autoPronounce = autoPronounce;
    if (typeof localStorage !== "undefined") {
      let settings = loadSettingsFromStorage();
      settings.autoPronounce = autoPronounce;
      localStorage.setItem("zthSettings", JSON.stringify(settings));
    }
  },
  SET_HIDE_WORD(state, hideWord) {
    state.hideWord = hideWord;
    if (typeof localStorage !== "undefined") {
      let settings = loadSettingsFromStorage();
      settings.hideWord = hideWord;
      localStorage.setItem("zthSettings", JSON.stringify(settings));
    }
  },
  SET_HIDE_PHONETICS(state, hidePhonetics) {
    state.hidePhonetics = hidePhonetics;
    if (typeof localStorage !== "undefined") {
      let settings = loadSettingsFromStorage();
      settings.hidePhonetics = hidePhonetics;
      localStorage.setItem("zthSettings", JSON.stringify(settings));
    }
  },
  SET_HIDE_DEFINITIONS(state, hideDefinitions) {
    state.hideDefinitions = hideDefinitions;
    if (typeof localStorage !== "undefined") {
      let settings = loadSettingsFromStorage();
      settings.hideDefinitions = hideDefinitions;
      localStorage.setItem("zthSettings", JSON.stringify(settings));
    }
  },
  SET_SUBS_SEARCH_LIMIT(state, subsSearchLimit) {
    state.subsSearchLimit = subsSearchLimit;
    if (typeof localStorage !== "undefined") {
      let settings = loadSettingsFromStorage();
      settings.subsSearchLimit = subsSearchLimit;
      localStorage.setItem("zthSettings", JSON.stringify(settings));
    }
  },
  SET_L2_SETTINGS(state, l2Settings) {
    state.l2Settings[state.l2.code] = Object.assign(state.l2Settings[state.l2.code], l2Settings);
    if (typeof localStorage !== "undefined") {
      let settings = loadSettingsFromStorage();
      settings[state.l2.code] = state.l2Settings[state.l2.code];
      localStorage.setItem("zthSettings", JSON.stringify(settings));
    }
  },
  RESET_SHOW_FILTERS(state) {
    state.l2Settings[state.l2.code].tvShowFilter = "all"
    if (state.l2?.code && 'zh en it ko es fr ja de tr ru nl'.split(' ').includes(state.l2.code)) {
      state.l2Settings[state.l2.code].talkFilter = [] // For languages with lots of content, only include tv shows in dictionary video search by default so as to give the user a faster experience.
    } else {
      state.l2Settings[state.l2.code].talkFilter = "all"
    }
  }
};

export const getters = {
  l2Settings: state => (l2Code) => {
    let settings = loadSettingsFromStorage();
    return settings[l2Code]
  },
}

export const actions = {
  load({ dispatch, commit }) {
    commit("LOAD_SETTINGS");
  },
  setL2Settings({ dispatch, commit }, l2Settings) {
    commit("SET_L2_SETTINGS", l2Settings);
  },
  setAdminMode({ dispatch, commit }, value) {
    commit("SET_ADMIN_MODE", value);
  },
  setAutoPronounce({ commit }, value) {
    commit('SET_AUTO_PRONOUNCE', value)
  },
  setHideWord({ dispatch, commit }, value) {
    commit("SET_HIDE_WORD", value);
  },
  setHidePhonetics({ dispatch, commit }, value) {
    commit("SET_HIDE_PHONETICS", value);
  },
  setHideDefinitions({ dispatch, commit }, value) {
    commit("SET_HIDE_DEFINITIONS", value);
  },
  setSubsSearchLimit({ dispatch, commit }, value) {
    commit("SET_SUBS_SEARCH_LIMIT", value);
  },
  resetShowFilters({ dispatch, commit }, value) {
    commit("RESET_SHOW_FILTERS")
  }
};
