export const state = () => ({
  active: false,
  subscription: undefined,
});

export const mutations = {
  SET_ACTIVE(state, active) {
    state.active = active;
  },
  SET_SUBSCRIPTION(state, subscription) {
    state.subscription = subscription;
  },
};

export const actions = {
  async checkSubscription({ commit }, userId) {
    try {
      let active = false;
      const subscription = await this.$directus.checkSubscription()
      if (subscription) {
        if (subscription.type === 'lifetime') active = true;
        else {
          let now = new Date();
          let expiresOn = new Date(subscription.expires_on);
          active = now < expiresOn;
        }
        commit("SET_SUBSCRIPTION", subscription);
      }
      commit("SET_ACTIVE", active);
    } catch (error) {
      console.error("Error checking subscription:", error.message);
      commit("SET_ACTIVE", false);
    }
  },
};

export const getters = {
  isActive: (state) => {
    return state.active;
  },
};