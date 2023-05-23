<template>
  <div>
    <div v-for="playlist in playlistsByLanguage" :key="playlist.id">
      <div @click="viewPlaylist(playlist.id)">{{ playlist.title }}</div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  computed: {
    ...mapState('playlists', {
      playlistsByLanguage(state) {
        return state.playlists[this.$l2.code];
      },
    }),
  },
  methods: {
    ...mapActions('playlists', ['fetchPlaylists']),
    viewPlaylist(id) {
      // navigate to individual playlist view
      this.$router.push({ name: 'playlist', params: { l2: this.$l2, id } });
    },
  },
  async created() {
    // Playlists of the current l2 are already loaded from default.vue
  },
};
</script>
