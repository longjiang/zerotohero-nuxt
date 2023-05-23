<template>
  <div>
    <b-button @click="showModal = true">Add to Playlist</b-button>
    <b-modal v-model="showModal">
      <h5>Select a Playlist:</h5>
      <b-form-checkbox
        v-for="(playlist, index) in playlistsByLanguage"
        :key="index"
        :value="playlist.id"
        v-model="selectedPlaylists"
        inline
      >
        {{ playlist.title }}
      </b-form-checkbox>
      <b-form-checkbox inline value="new" v-model="selectedPlaylists">
        New Playlist ...
      </b-form-checkbox>
      <b-form-group
        v-if="selectedPlaylists.includes('new')"
        label="Name your playlist:"
      >
        <b-form-input
          v-model="newPlaylistName"
          placeholder="Enter playlist name"
        ></b-form-input>
      </b-form-group>
      <template v-slot:modal-footer>
        <b-button @click="addToPlaylists" variant="primary">Add</b-button>
        <b-button @click="showModal = false" variant="secondary"
          >Cancel</b-button
        >
      </template>
    </b-modal>
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";

export default {
  props: {
    video: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      showModal: false,
      selectedPlaylists: [],
      newPlaylistName: "",
    };
  },
  computed: {
    ...mapState("playlists", {
      playlistsByLanguage(state) {
        return state.playlists[this.$l2.code];
      },
    }),
  },
  mounted() {
    // Pre-select the first playlist if the video is already in it.
    for (const playlist of this.playlistsByLanguage) {
      if (playlist.videos.some((video) => video.id === this.video.id)) {
        this.selectedPlaylists.push(playlist.id);
        break;
      }
    }
  },
  methods: {
    ...mapActions("playlists", ["createPlaylist", "updatePlaylist"]),
    async addToPlaylists() {
      const videoData = {
        id: this.video.id,
        youtube_id: this.video.youtube_id,
        title: this.video.title,
        duration: this.video.duration,
      };
      if (this.selectedPlaylists.includes("new")) {
        // If 'New Playlist ...' was selected, create a new playlist.
        const playlist = {
          l2: this.$l2.id,
          title: this.newPlaylistName,
          videos: [videoData],
        };
        await this.createPlaylist({ l2: this.$l2, playlist });
        this.newPlaylistName = "";
      } else {
        // If existing playlists were selected, add the video to them.
        for (const id of this.selectedPlaylists) {
          const oldPlaylist = this.playlists.find(
            (playlist) => playlist.id === id
          );
          const playlist = {
            id,
            videos: [...oldPlaylist.videos, videoData],
          };
          await this.updatePlaylist({ l2: this.$l2, playlist });
        }
      }
      this.showModal = false;
      this.selectedPlaylists = [];
    },
  },
};
</script>

<style scoped>
/* You can style your button and modal here */
</style>
