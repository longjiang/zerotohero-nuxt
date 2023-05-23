<template>
  <div>
    <h3 class="mb-4" v-if="playlist">{{ playlist.title }}</h3>
    <div class="text-center" v-if="!playlist">
      <Loader :sticky="true" message="Loading playlist..." />
    </div>
    <div class="text-center" v-if="playlist && playlist.videos.length === 0">
      {{ $t("Sorry, this playlist is empty.") }}
    </div>
    <YouTubeVideoList
      class="mt-3"
      v-if="playlist?.videos"
      :videos="playlist.videos"
    />
    <div class="playlist-actions">
      <b-button
        size="sm"
        @click="deletePlaylist"
        variant="danger"
        v-if="userIsOwner"
      >
        <i class="fas fa-trash"></i>
        {{ $t("Delete Playlist") }}
      </b-button>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";

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
    userIsOwner() {
      return this.playlist?.owner === Number(this.$auth.user?.id);
    },
  },
  asyncComputed: {
    async playlist() {
      let playlist = this.playlistsByLanguage.find(
        (pl) => pl.id === parseInt(this.id)
      );
      if (!playlist) {
        playlist = await this.fetchPlaylist({ id: this.id });
      }
      return playlist;
    },
  },
  methods: {
    ...mapActions("playlists", ["fetchPlaylist"]),
    async deletePlaylist() {
      // Get confirmation
      if (!confirm(this.$t("Are you sure you want to delete this playlist?"))) {
        return;
      }
      // Delete the playlist
      this.$store.dispatch("playlists/deletePlaylist", { l2: this.$l2, playlist: this.playlist })  .then(() => {
        // Show a toast
        this.$toast.success(
          this.$t("Playlist deleted.", {
            position: "top-center",
            duration: 5000,
          })
        );
      })
      .catch((error) => {
        this.$toast.error(
          this.$t("Sorry, there was an error deleting the playlist.", {
            position: "top-center",
            duration: 5000,
          })
        );
      });;
      // Redirect to the playlists page
      this.$router.push({ name: "my-playlists" });
    },
  },
};
</script>
