// store/chatGPTCache.js
import Vue from "vue";

export const state = () => ({
  cache: {},
});

export const mutations = {
  setChatGPTCache(state, { prompt, response }) {
    Vue.set(state.cache, prompt, response);
  },
};

export const actions = {
  cacheChatGPTResponse({ commit }, { prompt, response }) {
    commit("setChatGPTCache", { prompt, response });
  },
};
