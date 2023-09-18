import { logError } from "@/lib/utils";

export const romanizationOffByDefault = [
  "ko",
  "bo",
  "dz",
  "th",
  "my",
  "hy",
  "vi",
];

export const getDefaultL2Settings = (l1, l2) => {
  let l2SettingsOfL2 = Object.assign({}, defaultL2Settings);
  l2SettingsOfL2.l1 = l1.code;
  if (
    (l2.scripts &&
      l2.scripts[0] &&
      ["Cyrl", "Latn"].includes(l2.scripts[0].script)) ||
    romanizationOffByDefault.includes(l2.code)
  ) {
    l2SettingsOfL2.showPinyin = false;
  }
  return l2SettingsOfL2;
};

// These settings are language specific and saved to storage
export const defaultL2Settings = {
  l1: "en", // the L1 the user used last time when they studied this language
  showDefinition: false,
  showPinyin: true,
  useTraditional: false,
  showTranslation: true,
  showQuickGloss: true,
  useSerif: false,
  showQuiz: true,
  showByeonggi: true,
  tvShowFilter: "all", // By default we only search TV shows.
  talkFilter: [],
  autoPronounce: true, // Whether or not to play the audio automatically when opening a WordBlock popup
  quizMode: false,
  disableAnnotation: false,
  zoomLevel: 0,
};

// These settings are not saved to storage
export const defaultTransientSettings = {
  l1: undefined, // L1 language object
  l2: undefined, // L2 language object
  dictionary: undefined,
  dictionaryName: undefined,
  fullscreen: false, // Whether or not the user is in the browser's fullscreen mode
  settingsLoaded: false,
};

// These settings are saved to storage
export const defaultGeneralSettings = {
  adminMode: false,
  skin: "dark",
  preferredCategories: [],
  mode: "subtitles", // or 'transcript'
  autoPause: false,
  speed: 1,
  hideWord: false, // as used in the <HideDefs> component
  hidePhonetics: false, // as used in the <HideDefs> component
  hideDefinitions: false, // as used in the <HideDefs> component
  subsSearchLimit: true,
  openAIToken: undefined,
  muteAutoplay: false,
  karaokeAnimation: true,
  useSmoothScroll: false,
  l2Settings: {}, // keyed by language
};

export const state = () => {
  return Object.assign({}, defaultGeneralSettings, defaultTransientSettings);
};

/**
 * EMPTY (no data in localStorage) -> initializeSettings() -> INITIALIZED
 */

export const saveSettingsToStorage = (state) => {
  if (typeof localStorage !== "undefined") {
    let settingsToSave = {};
    for (let property in state) {
      if (!Object.keys(defaultTransientSettings).includes(property))
        settingsToSave[property] = state[property];
    }
    localStorage.setItem("zthSettings", JSON.stringify(settingsToSave));
  }
};

export const loadSettingsFromStorage = () => {
  let loadedSettings = {};
  if (typeof localStorage !== "undefined") {
    try {
      loadedSettings = JSON.parse(localStorage.getItem("zthSettings")) || {};
    } catch (err) {
      logError(err);
    }
  }
  return loadedSettings;
};

export const mutations = {
  IMPORT_FROM_JSON(state, json) {
    if (typeof localStorage !== "undefined") {
      let importedData;
      try {
        importedData = JSON.parse(json);
      } catch (err) {
        logError(err);
      }
      if (importedData) {
        for (let property in importedData)
          state[property] = importedData[property];
        saveSettingsToStorage(state);
      }
      state.settingsLoaded = true;
    }
  },
  // This commit cannot use localStorage because it's called from the language switch middleware
  SET_L1_L2(state, { l1, l2 }) {
    state.l1 = l1;
    if (typeof l2 === "undefined") return;
    state.l2 = l2;
    // Make sure to initialize a default l2Settings if not present
    if (!state.l2Settings[l2.code]) {
      state.l2Settings[l2.code] = getDefaultL2Settings(l1, l2);
    }
  },
  // This assumes that SET_L1_L2 has already been called
  LOAD_SETTINGS(state, { l1, l2 }) {
    if (typeof localStorage !== "undefined") {
      let loadedSettings = loadSettingsFromStorage();
      for (let property in loadedSettings) {
        state[property] = loadedSettings[property];
      }
    }
    if (!state.l2Settings[l2.code]) {
      state.l2Settings[l2.code] = getDefaultL2Settings(l1, l2);
    }
    // Remember the L1 the user picked, so next time when switching L2, this L1 is used.
    if (state.l2Settings[l2.code]) state.l2Settings[l2.code].l1 = l1.code;
    state.settingsLoaded = true;
  },
  SET_L1_L2_TO_NULL(state) {
    state.l1 = null;
    state.l2 = null;
  },
  SET_DICTIONARY_NAME(state, dictionaryName) {
    state.dictionaryName = dictionaryName;
  },
  SET_FULLSCREEN(state, fullscreen) {
    state.fullscreen = fullscreen;
  },
  SET_GENERAL_SETTINGS(state, generalSettings) {
    for (let property in generalSettings) {
      if (property in defaultGeneralSettings) {
        state[property] = generalSettings[property];
      }
    }
    saveSettingsToStorage(state);
  },
  SET_L2_SETTINGS(state, l2Settings) {
    // This method might be called (by showfilter.vue) before the settings are loaded from storage
    // Make sure this does not overwrite what's in storage!
    if (!state.l2 || !state.l2Settings[state.l2.code]) return;
    state.l2Settings[state.l2.code] = Object.assign(
      state.l2Settings[state.l2.code],
      l2Settings
    );
    if (typeof localStorage !== "undefined") {
      let loadedSettings = loadSettingsFromStorage();
      // Edge case: localStorage does not have l2Settings key
      if (!loadedSettings.l2Settings) {
        loadedSettings.l2Settings = {};
      }
      // Edge case: localStorage does not have the current l2 initialized
      if (!loadedSettings.l2Settings[state.l2.code]) {
        loadedSettings.l2Settings[state.l2.code] =
          state.l2Settings[state.l2.code];
      } else {
        // Only change the value in question from the localStorage (rather than saving the entire)
        // So we don't inadvertantly overwrite existing values in localStorage
        loadedSettings.l2Settings[state.l2.code] = Object.assign(
          loadedSettings.l2Settings[state.l2.code],
          l2Settings
        );
      }
      saveSettingsToStorage(state);
    }
  },
  RESET_SHOW_FILTERS(state) {
    if (!state.l2Settings[state.l2.code]) return;
    state.l2Settings[state.l2.code].tvShowFilter = "all";
    if (
      state.l2?.code &&
      "zh en it ko es fr ja de tr ru nl".split(" ").includes(state.l2.code)
    ) {
      state.l2Settings[state.l2.code].talkFilter = []; // For languages with lots of content, only include tv shows in dictionary video search by default so as to give the user a faster experience.
    } else {
      state.l2Settings[state.l2.code].talkFilter = "all";
    }
  },
};

export const getters = {
  l2Settings: (state) => (l2Code) => {
    let l2Settings = {};
    let loadedSettings = loadSettingsFromStorage();
    if (loadedSettings.l2Settings && loadedSettings.l2Settings[l2Code])
      l2Settings = loadedSettings.l2Settings[l2Code];
    return l2Settings;
  },
};

export const actions = {
  setL1L2({ commit }, { l1, l2 }) {
    commit("SET_L1_L2", { l1, l2 });
  },
  setDictionaryName({ commit }, dictionaryName) {
    commit("SET_DICTIONARY_NAME", dictionaryName);
  },
  setFullscreen({ dispatch, commit }, fullscreen) {
    commit("SET_FULLSCREEN", fullscreen);
  },
  setGeneralSettings({ dispatch, commit }, generalSettings) {
    commit("SET_GENERAL_SETTINGS", generalSettings);
    dispatch("push");
  },
  setL2Settings({ dispatch, commit }, l2Settings) {
    commit("SET_L2_SETTINGS", l2Settings);
    // sync changes (except adminMode)
    if (!l2Settings.adminMode) dispatch("push");
  },
  resetShowFilters({ dispatch, commit }, value) {
    commit("RESET_SHOW_FILTERS");
  },
  async importFromJSON({ commit }, json) {
    commit("IMPORT_FROM_JSON", json);
  },
  async fetchSettingsFromServer() {
    if (!$nuxt.$auth.loggedIn) return;
    let dataId = this.$auth.$storage.getUniversal("dataId");
    let path = `items/user_data/${dataId}?fields=id,settings`;
    let res = await this.$directus.get(path).catch(async (err) => {
      logError(err, "settings.js: fetchSettingsFromServer()");
    });
    if (res && res.data && res.data.data) {
      let settings = JSON.parse(res.data.data.settings);
      return settings;
    } else {
      return false;
    }
  },
  async push({ rootState }) {
    if (!$nuxt.$auth.loggedIn) return;
    let user = rootState.auth.user;
    let token = $nuxt.$auth.strategy.token.get();
    let dataId = this.$auth.$storage.getUniversal("dataId");
    if (user && user.id && dataId && token) {
      let settings = localStorage.getItem("zthSettings");
      if (settings && settings !== "undefined") {
        // For some reason sometimes settings is 'undefined', never push that to the server
        let payload = { settings };
        let path = `items/user_data/${dataId}?fields=id`;
        console.log("⚙️ Saving settings to the server...");
        await this.$directus.patch(path, payload).catch(async (err) => {
          logError(err, "settings.js: push()");
        });
      }
    }
  },
};
