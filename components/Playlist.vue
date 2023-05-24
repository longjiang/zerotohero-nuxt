<template>
  <div>
    <h3 class="mb-4" v-if="playlist">{{ playlist.title }}</h3>
    <div class="text-center" v-if="!playlist">
      <Loader :sticky="true" message="Loading playlist..." />
    </div>
    <div class="text-center" v-if="playlist && playlist.videos.length === 0">
      {{ $t("Sorry, this playlist is empty.") }}
    </div>
    <!-- <YouTubeVideoList
      class="mt-3"
      v-if="playlist?.videos"
      :videos="playlist.videos"
      :playlist="playlist"
    >
      <template v-slot:footer="{ video }">
        <b-button size="small" @click="deleteVideo(video)" :variant="$skin">
          <i class="fas fa-trash"></i> {{ $t("Remove") }}
        </b-button>
      </template>
    </YouTubeVideoList> -->
    <draggable @end="onDragEnd" class="mt-3" v-if="playlist?.videos">
      <div v-for="video in playlist.videos" :key="video.id">
        <YouTubeVideoCard :video="video">
          <template v-slot:footer="{ video }">
            <b-button size="small" @click="deleteVideo(video)" :variant="$skin">
              <i class="fas fa-trash"></i> {{ $t("Remove") }}
            </b-button>
          </template>
        </YouTubeVideoCard>
      </div>
    </draggable>

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
import draggable from 'vuedraggable'

export default {
  components: {
    draggable
  },
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
        playlist = await this.fetchPlaylist({ id: this.id, l2: this.$l2 });
      }
      return playlist;
    },
  },
  methods: {
    ...mapActions("playlists", ["fetchPlaylist", "updatePlaylist"]),
    onDragEnd(event) {
      // Note: event.newIndex gives you the new index of the dragged item
      // event.oldIndex gives you the old index of the dragged item
      // You should copy your list, perform the swap on the copied list, and then commit that to your state
      let playlist = Object.assign({}, this.playlist);
      playlist.videos = [...this.playlist.videos];
      const movedItem = playlist.videos.splice(event.oldIndex, 1)[0];
      playlist.videos.splice(event.newIndex, 0, movedItem);
      this.updatePlaylist({ l2: this.$l2, playlist }).then(() => {
        this.$toast.success(
          this.$t("Playlist updated.", {
            position: "top-center",
            duration: 5000,
          })
        );
      });
    },
    async deleteVideo(video) {
      if (
        !confirm(
          this.$t(
            "Are you sure you want to delete this video from the playlist?"
          )
        )
      ) {
        return;
      }
      // Filter out the video
      let playlist = Object.assign({}, this.playlist);
      playlist.videos = playlist.videos.filter((v) => v !== video);
      // Update the playlist
      this.updatePlaylist({ l2: this.$l2, playlist });
    },
    async deletePlaylist() {
      // Get confirmation
      if (!confirm(this.$t("Are you sure you want to delete this playlist?"))) {
        return;
      }
      // Delete the playlist
      this.$store
        .dispatch("playlists/deletePlaylist", {
          l2: this.$l2,
          playlist: this.playlist,
        })
        .then(() => {
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
        });
      // Redirect to the playlists page
      this.$router.push({ name: "my-playlists" });
    },
  },
};
</script>
