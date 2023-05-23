<template>
  <div>
    <h3 class="mb-5" v-if="playlist">{{ playlist.title }}</h3>
    <YouTubeVideoList v-if="playlist?.videos" :videos="playlist.videos" />
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
  },
  asyncComputed: {
    async playlist() {
      let playlist = this.playlistsByLanguage.find((pl) => pl.id === parseInt(this.id));
      if (!playlist) {
        playlist = await this.fetchPlaylist({ id: this.id });
      }
      return playlist;
    },
  },
  methods: {
    ...mapActions("playlists", ["fetchPlaylist"]),
  },
};
</script>
