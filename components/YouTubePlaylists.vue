<template>
  <div class="youtube-playlists">
    <div
      v-for="(playlist, index) in playlists"
      :class="`youtube-playlist-card youtube-playlist-card-${skin}`"
      :key="`youtube-playlist-item-${index}`"
    >
      <VideoThumbnailStack
        :thumbnail="playlist.thumbnail"
        :title="playlist.title"
        :to="{
          name: 'youtube-playlist',
          params: { playlist_id: playlist.id, title: playlist.title },
        }"
      >
        <template v-slot:belowTitle>
          <div v-if="playlist.count" style="opacity: 0.8; font-size: 0.8em;  margin-top: 0.25rem; ">
            ({{ $t("{num} Videos", { num: playlist.count }) }})
          </div>
          <div class="playlist-description" v-if="playlist.description">
            {{
              playlist.description.substring(0, 50) +
              (playlist.description.length > 50 ? "..." : "")
            }}
          </div>
        </template>
      </VideoThumbnailStack>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    playlists: {
      type: Array,
    },
    skin: {
      default: "dark", // or 'light'
    },
  },
};
</script>

<style lang="scss" scoped>
.youtube-thumbnail-wrapper {
  border-radius: 0.25rem;
  overflow: hidden;
}
.youtube-playlists {
  display: flex;
  flex-wrap: wrap;
}
.youtube-playlist-card {
  min-width: 15rem;
  flex: 1;
  margin: 1rem;
  .playlist-title {
    font-weight: bold;
  }
  .playlist-video-count {
    color: #999;
    text-decoration: none;
  }
  .playlist-description {
    opacity: 0.8;
    font-size: 0.8em;
    margin-top: 0.25rem;
  }
}
</style>
