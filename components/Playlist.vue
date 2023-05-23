<template>
  <div>
    <h2>{{ playlist.title }}</h2>
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
    ...mapState('playlists', ['playlists']),
    playlist() {
      return this.playlists[this.$l2.code].find((pl) => pl.id === parseInt(this.id));
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
