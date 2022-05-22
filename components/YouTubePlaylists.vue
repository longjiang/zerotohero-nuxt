<template>
  <div class="youtube-playlists">
    <div
      v-for="(playlist, index) in playlists"
      :class="`youtube-playlist-card youtube-playlist-card-${skin} media rounded shadow`"
      :key="`youtube-playlist-item-${index}`"
    >
      <router-link
        :to="`/${$l1.code}/${$l2.code}/youtube/playlist/${
          playlist.id
        }/${encodeURIComponent(playlist.title)}`"
        class="playlist-link"
      >
        <div class="youtube-thumbnail-wrapper aspect-wrapper">
          <img
            v-lazy-load
            :src="playlist.thumbnail"
            class="youtube-thumbnail aspect"
          />
        </div>
        <div class="media-body">
          <div class="playlist-title">{{ playlist.title }}</div>
          <div class="playlist-video-count" v-if="playlist.count">
            {{ playlist.count }} video{{ playlist.count > 1 ? "s" : "" }}
          </div>
          <div class="playlist-description" v-if="playlist.description">
            {{
              playlist.description.substring(0, 50) +
              (playlist.description.length > 50 ? "..." : "")
            }}
          </div>
        </div>
      </router-link>
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
      default: "light", // or 'dark'
    },
  },
  computed: {
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
  },
};
</script>

<style lang="scss" scoped>
.youtube-playlists {
  display: flex;
  flex-wrap: wrap;
}
.youtube-playlist-card {
  min-width: 15rem;
  flex: 1;
  margin: 1rem;
  a.playlist-link,
  a.playlist-link:hover {
    color: #666;
    text-decoration: none;
    .playlist-title {
      font-weight: bold;
    }
    .playlist-video-count {
      color: #999;
      text-decoration: none;
      margin: 0.5rem 0;
    }
    .playlist-description {
      color: #999;
      font-size: 0.8em;
      text-decoration: none;
    }
  }
  &.youtube-playlist-card-dark {
    .media-body {
      padding: 1rem 0 0 0;
      color: white;
    }
  }
}


</style>
