<template>
  <span>
    <span @click="showModal = true" class="add-to-playlist-button cursor-pointer"><slot>{{ $t('Add to Playlist') }}</slot></span>
    <b-modal v-model="showModal" :title="$t('Add to Playlist')" modal-class="safe-padding-top mt-4">
      <b-form-checkbox
        v-for="(playlist, index) in playlistsByLanguage"
        :key="index"
        :value="playlist.id"
        v-model="selectedPlaylists"
        class="playlist-checklist-item"
        inline
      >
        {{ playlist.title }} ({{ playlist.videos?.length }})
      </b-form-checkbox>
      <b-form-checkbox inline value="new" v-model="selectedPlaylists" 
        class="playlist-checklist-item">
        <template v-if="!selectedPlaylists.includes('new')">
          {{ $t('New Playlist ...') }}
        </template>
        <template v-else>
          <b-form-input
            v-model="newPlaylistName"
            :placeholder="$t('Enter a name for the playlist')"
          ></b-form-input>
        </template>
      </b-form-checkbox>

      <template v-slot:modal-footer>
        <b-button @click="addToPlaylists" variant="primary"><b-spinner small v-if="adding" /><span v-else>{{ $t('Add') }}</span></b-button>
        <b-button @click="showModal = false" variant="secondary"
          >{{ $t('Cancel') }}</b-button
        >
      </template>
    </b-modal>
  </span>
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
      adding: false
    };
  },
  computed: {
    ...mapState("playlists", {
      playlistsByLanguage(state) {
        return state.playlists[this.$l2.code] || [];
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
          const oldPlaylist = this.playlistsByLanguage.find(
            (playlist) => playlist.id === id
          );
          const playlist = {
            id,
            videos: [...oldPlaylist.videos, videoData],
          };
          this.adding = true;
          await this.updatePlaylist({ l2: this.$l2, playlist });
          this.$toast.success(
            this.$tb("Playlist added."),
            {
              position: "top-center",
              duration: 5000,
            }
          );
          this.adding = false;
        }
      }
      this.showModal = false;
      this.selectedPlaylists = [];
    },
  },
};
</script>

<style scoped>
.playlist-checklist-item {
  display: block;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}
</style>
