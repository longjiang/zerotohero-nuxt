import Papa from 'papaparse';

export const state = () => ({
  playlists: {},
  playlistsLoaded: {},
  playlist: {},
});

export const mutations = {
  LOAD_PLAYLISTS(state, { l2, playlists }) {
    state.playlists[l2.code] = playlists;
    state.playlistsLoaded[l2.code] = true;
  },
  SET_PLAYLIST(state, { l2, playlist }) {
    state.playlist[l2.code] = playlist;
  },
  ADD_PLAYLIST(state, { l2, playlist }) {
    state.playlists[l2.code].push(playlist);
  },
  REMOVE_PLAYLIST(state, { l2, playlist }) {
    state.playlists[l2.code] = state.playlists[l2.code].filter((p) => p !== playlist);
  },
  UPDATE_PLAYLIST(state, { l2, playlist, videos }) {
    const playlists = state.playlists[l2.code];
    const playlistToUpdate = playlists.find(pl => pl.id === playlist.id);
    if (playlistToUpdate) {
      playlistToUpdate.videos = videos;
    }
  }
};

export const actions = {
  async loadPlaylists({ commit }, { l2, forceRefresh }) {
    const response = await this.$directus.get(
      `items/playlists?sort=title&filter[l2][eq]=${l2.id
      }&fields=id,title,videos,l2&limit=500&timestamp=${forceRefresh ? Date.now() : 0}`
    );
    let playlists =
      response.data.data
    playlists = playlists.sort((x, y) =>
      (x.title || "").localeCompare(y.title, l2.locales[0])
    ) || [];
    playlists.forEach((p) => {
      p.videos = Papa.parse(p.videos, {
        header: true,
      }).data;
    });
    commit('LOAD_PLAYLISTS', { l2, playlists });
  },
  async createPlaylist({ commit }, { l2, playlist }) {
    console.log('createPlaylist', playlist);
    playlist.videos = Papa.unparse(playlist.videos);
    const { data } = await this.$directus.post('items/playlists', playlist);
    if (data?.data) {
      commit('ADD_PLAYLIST', { l2, playlist: data.data });
    }
  },
  async updatePlaylist({ commit }, { l2, playlist, videos }) {
    videos = videos.map((v, id) => {
      v.id = id;
      return v;
    });
    const payload = {
      videos: Papa.unparse(videos),
    };
    const { data } = await this.$directus.patch(`items/playlists/${playlist.id}`, payload);
    if (data?.data) {
      commit('UPDATE_PLAYLIST', { l2, playlist, videos });
    }
  },
  async deletePlaylist({ commit }, { l2, playlist }) {
    await this.$directus.delete(`items/playlists/${playlist.id}`);
    commit('REMOVE_PLAYLIST', { l2, playlist });
  },
};

export const getters = {
  playlists: (state) => (l2) => state.playlists[l2.code],
  playlist: (state) => (l2) => state.playlist[l2.code],
};
