import Papa from "papaparse";
import Vue from "vue";

export const state = () => ({
  playlists: {},
  playlistsLoaded: {},
});

export const mutations = {
  LOAD_PLAYLISTS(state, { l2, playlists }) {
    Vue.set(state.playlists, l2.code, playlists);
    Vue.set(state.playlistsLoaded, l2.code, true);
  },
  ADD_PLAYLIST(state, { l2, playlist }) {
    state.playlists[l2.code].push(playlist);
  },
  REMOVE_PLAYLIST(state, { l2, playlist }) {
    state.playlists[l2.code] = state.playlists[l2.code].filter(
      (p) => p !== playlist
    );
  },
  UPDATE_PLAYLIST(state, { l2, playlist }) {
    const playlists = state.playlists[l2.code];
    const playlistToUpdate = playlists.find((pl) => pl.id === playlist.id);
    if (playlistToUpdate) {
      if (playlist.title) Vue.set(playlistToUpdate, 'title', playlist.title);
      if (playlist.videos) Vue.set(playlistToUpdate, 'videos', playlist.videos);
    }
  },
};

export const actions = {
  async loadPlaylists({ commit }, { l2, forceRefresh }) {
    const response = await this.$directus.get(
      `items/playlists?sort=title&filter[l2][eq]=${
        l2.id
      }&fields=owner,id,title,videos,l2&limit=500&timestamp=${
        forceRefresh ? Date.now() : 0
      }`
    );
    let playlists = response?.data?.data || [];
    playlists =
      playlists.sort((x, y) =>
        (x.title || "").localeCompare(y.title, l2.locales[0])
      ) || [];
    playlists.forEach((p) => {
      p.videos = Papa.parse(p.videos, {
        header: true,
      }).data;
    });
    commit("LOAD_PLAYLISTS", { l2, playlists });
  },
  async createPlaylist({ commit }, { l2, playlist }) {
    playlist.videos = Papa.unparse(playlist.videos);
    const { data } = await this.$directus.post("items/playlists", playlist);
    if (data?.data) {
      data.data.videos = Papa.parse(data.data.videos, { header: true }).data;
      commit("ADD_PLAYLIST", { l2, playlist: data.data });
    }
  },
  async updatePlaylist({ commit }, { l2, playlist }) {
    const payload = {
      videos: Papa.unparse(playlist.videos),
    };
    const { data } = await this.$directus.patch(
      `items/playlists/${playlist.id}`,
      payload
    );
    if (data?.data) {
      commit("UPDATE_PLAYLIST", { l2, playlist });
    }
  },
  async deletePlaylist({ commit }, { l2, playlist }) {
    await this.$directus.delete(`items/playlists/${playlist.id}`);
    commit("REMOVE_PLAYLIST", { l2, playlist });
  },
  async fetchPlaylist({ commit, state }, { l2, id }) {
    const playlists = state.playlists[l2.code];
    if (playlists) {
      const playlistFromStore = playlists.find((pl) => pl.id === id);
      if (playlistFromStore) return playlistFromStore;
    }
    const playlistFromApi = await this.$directus.getData(
      `items/playlists/${id}`
    );
    console.log({playlistFromApi})
    if (playlistFromApi?.videos) {
      playlistFromApi.videos = Papa.parse(playlistFromApi.videos, {
        header: true,
      }).data;
    }
    return playlistFromApi;
  },
};

export const getters = {
  playlists: (state) => (l2) => state.playlists[l2.code],
};
