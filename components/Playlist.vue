<template>
  <div v-if="playlist">
    <h3 class="mb-5">{{ playlist.title }}</h3>
    <YouTubeVideoList :videos="playlist.videos" />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  data() {
    return {
      id: this.$route.params.id,
    };
  },
  computed: {
    ...mapState("playlists", {
      playlistsByLanguage(state) {
        return state.playlists[this.$l2.code] || [];
      },
    }),
    playlist() {
      return this.playlistsByLanguage.find((pl) => pl.id === parseInt(this.id));
    },
  },
  methods: {
    ...mapActions('playlists', ['fetchPlaylist']),
  },
  async created() {
    if (!this.playlist) {
      // If playlist isn't in state, fetch it
      await this.fetchPlaylist(this.id);
    }
  },
};
</script>
