<router>
  {
    path: '/:l1/:l2/youtube/import',
    props: true,
    meta: {
      skin: 'dark',
    },
  }
</router>
<template>
  <div class="main main-dark">
    <div class="container pt-5 pb-5 youtube-import">
      <div style="font-size: 1.5rem; color: white; text-align: center">
        <img
          src="/img/youtube.png"
          style="height: 4rem; margin-bottom: 1rem"
          data-not-lazy
        />
      </div>
      <h4 class="mt-3 mb-5 text-center">
        Import
        {{ $l2.name }} Videos from YouTube
      </h4>
      <b-input-group class="flex-1">
        <b-form-input
          v-model="url"
          :lazy="true"
          @compositionend.prevent.stop="() => false"
          :placeholder="'URL of a YouTube video or playlist...'"
        />
      </b-input-group>
      <div class="mt-4" style="color: #aaa">
        <p>In the input field above, type in any YouTube video URL to open that video in Language Player. Alternatively, type in a playlist URL to browse that playlist in Language Player.</p>
      </div>
    </div>
  </div>
</template>

<script>
import YouTube from "@/lib/youtube";

export default {
  data() {
    return {
      url: undefined,
    };
  },
  computed: {
    $l1() {
      return this.$store.state.settings.l1;
    },
    $l2() {
      return this.$store.state.settings.l2;
    },
  },
  watch: {
    url() {
      if (this.url && this.url.length > 0) {
        let youtubeId, playlistId;
        youtubeId = YouTube.videoIdFromURL(this.url);
        playlistId = YouTube.playlistIdFromURL(this.url);
        if (!youtubeId && !playlistId) {
          // the user may have simply entered an id
          if (this.url.startsWith("PL")) playlistId = this.url;
          else youtubeId = this.url;
        }
        if (youtubeId) {
          this.$router.push({
            name: "youtube-view",
            params: { youtube_id: youtubeId },
          });
        } else if (playlistId) {
          this.$router.push({
            name: "youtube-playlist",
            params: { playlist_id: playlistId },
          });
        } else {
          alert("We cannot recognize this URL.");
        }
      }
    },
  },
};
</script>

<style>
</style>