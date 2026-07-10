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
  async loadChannelPreferences({ commit, rootState }, l2) {
    if (!$nuxt.$auth.loggedIn) return;

    const user = rootState.auth?.user;
    const token = $nuxt.$auth.strategy.token.get();

    if (!user?.id || !token) return;

    const languageCode = typeof l2 === 'string' ? l2 : l2?.code;
    if (!languageCode) return;

    try {
      const response = await axios.post(`${PYTHON_SERVER}user-channel-preferences`, {
        user_id: user.id,
        l2: languageCode,
      });

      if (response?.status !== 200) {
        logError('Error loading channel preferences', response);
        return null;
      }

      const preferences = response.data || [];
      const subscribed = [];
      const notInterested = [];

      preferences.forEach((item) => {
        if (item?.status === 'subscribed') subscribed.push(item.channel_id);
        if (item?.status === 'not_interested') notInterested.push(item.channel_id);
      });

      commit('SET_SUBSCRIBED_CHANNELS', subscribed);
      commit('SET_NOT_INTERESTED_CHANNELS', notInterested);
      return preferences;
    } catch (error) {
      logError('Error loading channel preferences', error);
      return null;
    }
  },
  async saveChannelPreference({ commit, rootState }, { channelId, l2, status }) {
    if (!channelId) return null;

    if (!status || status === 'neutral') {
      if (!$nuxt.$auth.loggedIn) {
        commit('REMOVE_CHANNEL_PREFERENCE', { channelId, status: 'subscribed' });
        commit('REMOVE_CHANNEL_PREFERENCE', { channelId, status: 'not_interested' });
        return true;
      }

      const user = rootState.auth?.user;
      const token = $nuxt.$auth.strategy.token.get();

      if (!user?.id || !token) return null;
      if (!l2) return null;

      const languageCode = typeof l2 === 'string' ? l2 : l2?.code;
      if (!languageCode) return null;

      try {
        const response = await axios.post(`${PYTHON_SERVER}save-channel-preference`, {
          user_id: user.id,
          channel_id: channelId,
          l2: languageCode,
          status: 'neutral',
        });

        if (response?.status !== 200 && response?.status !== 201) {
          logError('Error clearing channel preference', response);
          return null;
        }

        commit('REMOVE_CHANNEL_PREFERENCE', { channelId, status: 'subscribed' });
        commit('REMOVE_CHANNEL_PREFERENCE', { channelId, status: 'not_interested' });
        return response.data;
      } catch (error) {
        logError('Error clearing channel preference', error);
        return null;
      }
    }

    if (!$nuxt.$auth.loggedIn) return null;

    const user = rootState.auth?.user;
    const token = $nuxt.$auth.strategy.token.get();

    if (!user?.id || !token) return null;
    if (!l2) return null;

    const languageCode = typeof l2 === 'string' ? l2 : l2?.code;
    if (!languageCode) return null;

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
  preferenceStatus: (state) => (channelId) => {
    if (state.subscribedChannels.includes(channelId)) return 'subscribed';
    if (state.notInterestedChannels.includes(channelId)) return 'not_interested';
    return null;
  },
};
