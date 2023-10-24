import { logError } from "../lib/utils";
import Vue from "vue";

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
  tvShowFilter: null,
  talkFilter: null,
  autoPronounce: true, // Whether or not to play the audio automatically when opening a WordBlock popup
  quizMode: false,
  disableAnnotation: false,
  zoomLevel: 0,
  corpname: null,
};

// These settings are not saved to storage
export const defaultTransientSettings = {
  l1: undefined, // L1 language object
  l2: undefined, // L2 language object
  dictionary: undefined,
  dictionaryName: undefined,
  useMachineTranslatedDictionary: false,
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


// Default settings definitions...

export const state = () => ({
  ...defaultGeneralSettings,
  ...defaultTransientSettings
});



// Utility functions to manage localStorage...

export const saveSettingsToStorage = (settings) => {
  if (typeof localStorage !== "undefined") {
    let settingsToSave = {};
    for (let property in settings) {
      if (property in defaultGeneralSettings) {
        settingsToSave[property] = settings[property];
      }
    }
    localStorage.setItem("zthSettings", JSON.stringify(settingsToSave));
  }
};

export const loadSettingsFromStorage = () => {
  if (typeof localStorage === "undefined") return {};

  try {
    return JSON.parse(localStorage.getItem("zthSettings")) || {};
  } catch (err) {
    logError(err);
    return {};
  }
};

// Vuex mutations...

export const mutations = {
  // default.vue calls $directus to fetch user's data, including the settings, then loaded it into the store, and save to localStorage
  SAVE_JSON_FROM_SERVER_TO_LOCAL(state, json) {
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
    }
  },
  // Default.vue then calls this mutation directly, which loads settings from localstorage. This assumes that SET_L1_L2 has already been called
  LOAD_JSON_FROM_LOCAL(state, { l1, l2 }) {
    if (typeof localStorage !== "undefined") {
      let loadedSettings = loadSettingsFromStorage();
      for (let property in loadedSettings) {
        if (property in defaultGeneralSettings) // Never set L1 and L2 otherwise we go back to the last language
          state[property] = loadedSettings[property];
      }
    }
    if (!state.l2Settings[l2.code]) {
      Vue.set(state.l2Settings, l2.code, getDefaultL2Settings(l1, l2));
    }
    // Remember the L1 the user picked, so next time when switching L2, this L1 is used.
    if (state.l2Settings[l2.code]) state.l2Settings[l2.code].l1 = l1.code;
    state.settingsLoaded = true;
  },
  // This commit cannot use localStorage because it's called from the language switch middleware
  SET_L1_L2(state, { l1, l2 }) {
    state.l1 = l1;
    if (typeof l2 === "undefined") return;
    state.l2 = l2;
    // Make sure to initialize a default l2Settings if not present
    if (!state.l2Settings[l2.code]) {
      Vue.set(state.l2Settings, l2.code, getDefaultL2Settings(l1, l2));
    }
  },
  SET_L1_L2_TO_NULL(state) {
    state.l1 = null;
    state.l2 = null;
  },
  SET_USE_MACHINE_TRANSLATED_DICTIONARY(state, value) {
    state.useMachineTranslatedDictionary = value;
  },
  SET_TRANSIENT_SETTINGS(state, transientSettings) {
    for (let property in transientSettings) {
      if (property in defaultTransientSettings) {
        Vue.set(state, property, transientSettings[property]);
      }
    }
  },
  SET_GENERAL_SETTINGS(state, generalSettings) {
    for (let property in generalSettings) {
      if (property in defaultGeneralSettings) {
        Vue.set(state, property, generalSettings[property]);
      }
    }
    saveSettingsToStorage(state);
  },
  SET_L2_SETTINGS(state, l2Settings) {
    // This method might be called (by showfilter.vue) before the settings are loaded from storage
    // Make sure this does not overwrite what's in storage!
    if (!state.l2 || !state.l2Settings[state.l2.code]) return;
    for (let key in l2Settings) {
      if (key in defaultL2Settings) {
        Vue.set(state.l2Settings[state.l2.code], key, l2Settings[key]);
      }
    }
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
    state.l2Settings[state.l2.code].tvShowFilter = null;
    state.l2Settings[state.l2.code].talkFilter = null;
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
  setDictionaryName({ dispatch }, dictionaryName) {
    dispatch("setTransientSettings", { dictionaryName });
  },
  setUseMachineTranslatedDictionary({ dispatch }, useMachineTranslatedDictionary) {
    dispatch("setTransientSettings", { useMachineTranslatedDictionary });
  },
  setFullscreen({ dispatch, commit }, fullscreen) {
    dispatch("setTransientSettings", { fullscreen });
  },
  setTransientSettings({ commit }, transientSettings) {
    commit("SET_TRANSIENT_SETTINGS", transientSettings);
    // Do not push
  },
  setGeneralSettings({ dispatch, commit }, generalSettings) {
    commit("SET_GENERAL_SETTINGS", generalSettings);
    dispatch("syncSettingsToServer");
  },
  setL2Settings({ dispatch, commit }, l2Settings) {
    commit("SET_L2_SETTINGS", l2Settings);
    // sync changes (except adminMode)
    if (!l2Settings.adminMode) dispatch("syncSettingsToServer");
  },
  resetShowFilters({ dispatch, commit }, value) {
    commit("RESET_SHOW_FILTERS");
  },
  async importFromJSON({ commit }, json) {
    commit("SAVE_JSON_FROM_SERVER_TO_LOCAL", json);
  },
  // Settings are fetched from $directus.fetchOrCreateUserData from default.vue
  async syncSettingsToServer({ state }) {
    if (!$nuxt.$auth.loggedIn) return;
    let user = this.$auth.user;
    let token = $nuxt.$auth.strategy.token.get();
    let dataId = this.$auth.$storage.getUniversal("dataId");
    if (user && user.id && dataId && token) {
      let settings = state
      // For some reason sometimes settings is 'undefined', never push that to the server
      if (settings) {
        let settingsToSave = {}; 
        for (let property in settings) {
          if (property in defaultGeneralSettings) {
            settingsToSave[property] = settings[property];
          }
        }
        const payload = { settings: JSON.stringify(settingsToSave) };
        let path = `items/user_data/${dataId}?fields=id`;
        console.log("⚙️ Saving settings to the server...");
        await this.$directus.patch(path, payload).catch(async (err) => {
          logError(err, "settings.js: push()");
        });
        this.$toast.success("Settings saved.",
        {
          position: "top-center",
          duration: 1000,
        });
      }
    }
  },
};
