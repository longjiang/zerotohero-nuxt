<template>
  <div>
    <h2>{{ playlist.title }}</h2>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>YouTube ID</th>
          <th>Title</th>
          <th>Duration</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="video in playlist.videos" :key="video[0]">
          <td>{{ video[0] }}</td>
          <td>{{ video[1] }}</td>
          <td>{{ video[2] }}</td>
          <td>{{ video[3] }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  data() {
    return {
      l2: this.$route.params.l2,
      id: this.$route.params.id,
    };
  },
  computed: {
    ...mapState('playlists', ['playlists']),
    playlist() {
      return this.playlists[this.l2].find((pl) => pl.id === parseInt(this.id));
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
