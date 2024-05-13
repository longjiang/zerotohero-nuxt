import { PYTHON_SERVER } from "@/lib/utils";

export const state = () => ({
  active: false,
  checking: true,
  subscription: undefined,
});

export const mutations = {
  SET_ACTIVE(state, active) {
    state.active = active;
  },
  SET_SUBSCRIPTION(state, subscription) {
    state.subscription = subscription;
  },
  SET_CHECKING(state, checking) {
    state.checking = checking;
  },
};

export const actions = {
  async checkSubscription({ commit }, userId) {
    commit("SET_CHECKING", true);
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
      commit("SET_CHECKING", false);
    } catch (error) {
      console.error("Error checking subscription:", error.message);
      commit("SET_ACTIVE", false);
      commit("SET_CHECKING", false);
    }
  },
  async cancelSubscriptionAtEndOfPeriod({ commit }) {
    let subscription = this.state.subscriptions.subscription;
    if (!subscription) return;
    let customer_id = subscription.payment_customer_id;
    if (!customer_id) return;
    try {
      let res = await axios.post(PYTHON_SERVER + 'cancel-subscription-at-end-of-period', {
        customer_id
      });
      // dispatch the checkSubscription action to update the state
      this.dispatch("subscriptions/checkSubscription");
    } catch (error) {
      console.error("Error cancelling subscription:", error.message);
    }
  }
};

export const getters = {
  isActive: (state) => {
    return state.active;
  },
};