export const state = () => {
  return {
    channels: [],
    fetchedL2Ids: [],
  };
};

export const mutations = {
  SET_CHANNELS(state, { channels, l2_id }) {
    state.channels = state.channels.concat(channels);
    // Make sure they are unique
    state.channels = state.channels.filter(
      (channel, index, self) =>
        index === self.findIndex((c) => c.id === channel.id)
    );
    if (!state.fetchedL2Ids.includes(l2_id)) {
      state.fetchedL2Ids.push(l2_id);
    }
  },
};

export const actions = {
  async fetchChannelsByLanguage({ commit, state }, l2_id) {
    if (state.fetchedL2Ids.includes(l2_id)) {
      return; // Don't fetch if already fetched
    }
    try {
      const channels = await this.$directus.getData(`items/youtube_channels`, {
        "fields": "id,channel_id,thumbnail,title,subscribers,video_count,l2",
        "filter[l2][eq]": l2_id,
        "sort": "-video_count",
        "timestamp": Date.now(),
        limit: 500,
      });
      if (channels?.length > 0) {
        commit("SET_CHANNELS", { channels, l2_id });
      }
    } catch (error) {
      console.error("An error occurred while fetching channels:", error);
    }
  },
};

export const getters = {
  hasFetchedForL2Id: (state) => (l2_id) => {
    return state.fetchedL2Ids.includes(l2_id);
  },

  getChannelsByL2Id: (state) => (l2Id) => {
    if (!l2Id) return state.channels; // return all channels if no l2Id provided
    return state.channels.filter((channel) => channel.l2Id === l2Id);
  },

  getChannelbyChannelId: (state) => (channelId) => {
    return state.channels.find((channel) => channel.channel_id === channelId);
  },

  getChannelsSortedBySubscribers: (state) => {
    return state.channels.slice().sort((a, b) => b.subscribers - a.subscribers); // Sort in descending order
  },
};
