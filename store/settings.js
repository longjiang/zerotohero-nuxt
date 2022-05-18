import Config from "@/lib/config";

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
    romanizationOffByDefault: ["ko", "bo", "dz", "th", "my", "hy", "vi"]
  };
};

export const loadSettingsFromLocalStorage = () => {
  if (typeof localStorage !== "undefined") {
    let settings;
    try {
      settings = JSON.parse(localStorage.getItem("zthSettings"));
    } catch (err) {
      console.log(err);
    }
    if (!settings) settings = {};
    return settings;
  }
};


export const mutations = {
  LOAD_SETTINGS(state) {
    if (typeof localStorage !== "undefined") {
      let settings = loadSettingsFromLocalStorage();
      for (let property of ['adminMode', 'hideWord', 'hidePhonetics', 'hideDefinitions', 'subsSearchLimit']) {
        if (typeof settings[property] !== "undefined")
          state[property] = settings[property];
      }
      state.l2Settings = Object.assign(
        state.l2Settings,
        settings[state.l2.code]
      );
    }
    state.settingsLoaded[state.l2.code] = true;
  },
  SET_L1(state, l1) {
    state.l1 = l1;
  },
  SET_L2(state, l2) {
    if (typeof l2 === "undefined") return;
    state.l2 = l2;
    if (
      (l2.scripts &&
        l2.scripts[0] &&
        ["Cyrl", "Latn"].includes(l2.scripts[0].script)) ||
      state.romanizationOffByDefault.includes(l2.code)
    ) {
      state.l2Settings.showPinyin = false;
    }
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
      let settings = loadSettingsFromLocalStorage();
      settings.adminMode = adminMode;
      localStorage.setItem("zthSettings", JSON.stringify(settings));
    }
  },
  SET_HIDE_WORD(state, hideWord) {
    state.hideWord = hideWord;
    if (typeof localStorage !== "undefined") {
      let settings = loadSettingsFromLocalStorage();
      settings.hideWord = hideWord;
      localStorage.setItem("zthSettings", JSON.stringify(settings));
    }
  },
  SET_HIDE_PHONETICS(state, hidePhonetics) {
    state.hidePhonetics = hidePhonetics;
    if (typeof localStorage !== "undefined") {
      let settings = loadSettingsFromLocalStorage();
      settings.hidePhonetics = hidePhonetics;
      localStorage.setItem("zthSettings", JSON.stringify(settings));
    }
  },
  SET_HIDE_DEFINITIONS(state, hideDefinitions) {
    state.hideDefinitions = hideDefinitions;
    if (typeof localStorage !== "undefined") {
      let settings = loadSettingsFromLocalStorage();
      settings.hideDefinitions = hideDefinitions;
      localStorage.setItem("zthSettings", JSON.stringify(settings));
    }
  },
  SET_SUBS_SEARCH_LIMIT(state, subsSearchLimit) {
    state.subsSearchLimit = subsSearchLimit;
    if (typeof localStorage !== "undefined") {
      let settings = loadSettingsFromLocalStorage();
      settings.subsSearchLimit = subsSearchLimit;
      localStorage.setItem("zthSettings", JSON.stringify(settings));
    }
  },
  SET_L2_SETTINGS(state, l2Settings) {
    state.l2Settings = Object.assign(state.l2Settings, l2Settings);
    if (typeof localStorage !== "undefined") {
      let settings = loadSettingsFromLocalStorage();
      settings[state.l2.code] = state.l2Settings;
      localStorage.setItem("zthSettings", JSON.stringify(settings));
    }
  }
};

export const actions = {
  load({ dispatch, commit }) {
    commit("LOAD_SETTINGS");
    dispatch("pull");
  },
  setL2Settings({ dispatch, commit }, l2Settings) {
    commit("SET_L2_SETTINGS", l2Settings);
    dispatch("push");
  },
  setHideDefinitions({ dispatch, commit }, value) {
    commit("SET_HIDE_DEFINITIONS", value);
    dispatch("push");
  },
  setAdminnMode({ dispatch, commit }, value) {
    commit("SET_ADMIN_MODE", value);
    dispatch("push");
  },
  setHideWord({ dispatch, commit }, value) {
    commit("SET_HIDE_WORD", value);
    dispatch("push");
  },
  setHidePhonetics({ dispatch, commit }, value) {
    commit("SET_HIDE_PHONETICS", value);
    dispatch("push");
  },
  setHideDefinitions({ dispatch, commit }, value) {
    commit("SET_HIDE_DEFINITIONS", value);
    dispatch("push");
  },
  setSubsSearchLimit({ dispatch, commit }, value) {
    commit("SET_SUBS_SEARCH_LIMIT", value);
    dispatch("push");
  },
  async push({ commit, state, rootState }) {
    let user = rootState.auth.user;
    if (user && user.id && user.token) {
      let payload = { settings: localStorage.getItem("zthSettings") || "{}" };
      await axios
        .patch(
          `${Config.wiki}items/user_data/${user.id}?access_token=${user.token}`,
          payload
        )
        .catch(async err => {
          if (
            err.response &&
            err.response.data &&
            err.response.data.error &&
            err.response.data.error.code === 203
          ) {
            // Initialize the user data record if there isn't one
            await axios.post(
              `${Config.wiki}items/user_data?access_token=${user.token}`,
              {
                id: user.id,
                settings: localStorage.getItem("zthSettings") || "{}"
              }
            );
          }
        });
    }
  },
  async pull({ commit, state, rootState }) {
    let user = rootState.auth.user;
    if (user && user.id && user.token) {
      let res = await axios
        .get(
          `${Config.wiki}items/user_data/${user.id}?fields=settings&access_token=${user.token}`
        )
        .catch(async err => {
          if (
            err.response &&
            err.response.data &&
            err.response.data.error &&
            err.response.data.error.code === 203
          ) {
            // Initialize the user data record if there isn't one
            await axios.post(
              `${Config.wiki}items/user_data?access_token=${user.token}`,
              { id: user.id, settings: localStorage.getItem("zthSettings") || "{}" }
            );
          }
        });
      if (res && res.data && res.data.data) {
        localStorage.setItem("zthSettings", res.data.data.settings);
        commit('LOAD_SETTINGS');
      }
    }
  }
};
