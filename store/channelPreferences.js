import { logError } from '../lib/helper';
import { PYTHON_SERVER } from '../lib/utils';

export const state = () => ({
  subscribedChannels: [],
  notInterestedChannels: [],
});

export const mutations = {
  SET_SUBSCRIBED_CHANNELS(state, channels) {
    state.subscribedChannels = channels || [];
  },
  SET_NOT_INTERESTED_CHANNELS(state, channels) {
    state.notInterestedChannels = channels || [];
  },
  ADD_CHANNEL_PREFERENCE(state, { channelId, status }) {
    if (!channelId) return;

    if (status === 'subscribed') {
      if (!state.subscribedChannels.includes(channelId)) {
        state.subscribedChannels.push(channelId);
      }
      state.notInterestedChannels = state.notInterestedChannels.filter(
        (id) => id !== channelId
      );
    } else if (status === 'not_interested') {
      if (!state.notInterestedChannels.includes(channelId)) {
        state.notInterestedChannels.push(channelId);
      }
      state.subscribedChannels = state.subscribedChannels.filter(
        (id) => id !== channelId
      );
    }
  },
  REMOVE_CHANNEL_PREFERENCE(state, { channelId, status }) {
    if (!channelId) return;

    if (status === 'subscribed') {
      state.subscribedChannels = state.subscribedChannels.filter(
        (id) => id !== channelId
      );
    } else if (status === 'not_interested') {
      state.notInterestedChannels = state.notInterestedChannels.filter(
        (id) => id !== channelId
      );
    }
  },
};

export const actions = {
  async saveChannelPreference({ commit, rootState }, { channelId, l2, status }) {
    if (!$nuxt.$auth.loggedIn) return;

    const user = rootState.auth?.user;
    const token = $nuxt.$auth.strategy.token.get();

    if (!user?.id || !token) return;
    if (!channelId || !status || !l2) return;

    const languageCode = typeof l2 === 'string' ? l2 : l2?.code;
    if (!languageCode) return;

    try {
      const response = await axios.post(`${PYTHON_SERVER}save-channel-preference`, {
        user_id: user.id,
        channel_id: channelId,
        l2: languageCode,
        status,
      });

      if (response?.status !== 200 && response?.status !== 201) {
        logError('Error saving channel preference', response);
        return null;
      }

      commit('ADD_CHANNEL_PREFERENCE', { channelId, status });
      return response.data;
    } catch (error) {
      logError('Error saving channel preference', error);
      return null;
    }
  },
};

export const getters = {
  isSubscribed: (state) => (channelId) => {
    return state.subscribedChannels.includes(channelId);
  },
  isNotInterested: (state) => (channelId) => {
    return state.notInterestedChannels.includes(channelId);
  },
};
