<template>
  <div>
    <div v-for="playlist in playlistsByLanguage" :key="playlist.id">
      <div @click="viewPlaylist(playlist.id)">{{ playlist.title }}</div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState('playlists', {
      playlistsByLanguage(state) {
        return state.playlists[this.$l2.code];
      },
    }),
  },
  methods: {
    viewPlaylist(id) {
      // navigate to individual playlist view
      this.$router.push({ name: 'playlist', params: { id } });
    },
  },
  async created() {
    // Playlists of the current l2 are already loaded from default.vue
  },
};
</script>
