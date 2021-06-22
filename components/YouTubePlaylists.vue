<template>
  <div class="youtube-playlists">
    <div
      v-for="playlist of playlists"
      class="youtube-playlist media rounded shadow"
    >
      <router-link :to="`/${$l1.code}/${$l2.code}/youtube/playlist/${playlist.id}/${encodeURIComponent(playlist.title)}`" class="playlist-link">
        <div class="youtube-thumbnail-wrapper aspect-wrapper">
          <img :src="playlist.thumbnail" class="youtube-thumbnail aspect" />
        </div>
        <div class="media-body">
          <div class="playlist-title">{{ playlist.title }}</div>
          <div class="playlist-description">
            {{ playlist.count }} video{{ playlist.count > 1 ? 's' : '' }}
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
      type: Array
    }
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
}
</script>

<style lang="scss">
.youtube-playlists {
  display: flex;
  flex-wrap: wrap;
}
.youtube-playlist {
  min-width: 15rem;
  flex: 1;
  margin: 1rem;
}
a.playlist-link,
a.playlist-link:hover {
  color: #666;
  text-decoration: none;
  .playlist-title {
    font-weight: bold;
  }
  .playlist-description {
    color: #999;
    text-decoration: none;
  }
}
</style>
