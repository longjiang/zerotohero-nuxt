<router>
  {
    path: '/:l1/:l2/youtube/playlist/:playlist_id?/:title?',
    props: true
  }
</router>
<template>
  <div class="youtube-browse container mt-5 mb-5 main">
    <div class="row">
      <div class="col-sm-12">
        <h3 class="text-center" v-if="title">
          <Annotate :phonetics="false" :buttons="true">
            <span>{{ title }}</span>
          </Annotate>
        </h3>
        <p v-if="totalResults" class="text-center">({{ totalResults }} Videos)</p>
        <h3 class="text-center" v-else>Playlist: {{ playlist_id }}</h3>
        <div class="text-center mt-4 mb-4">
          <b-button
            class="btn-small btn-primary d-inline-block"
            @click="forceRefresh"
          >
            <i class="fa fa-sync-alt mr-1"></i>
            Force Refresh
          </b-button>
          <b-button
            class="btn-small btn-secondary d-inline-block"
            v-if="$adminMode && entire === false"
            @click="entire = true"
          >
            Load Entire List
          </b-button>
          <b-button
            class="btn-small btn-secondary d-inline-block"
            v-if="$adminMode && entire === true"
            @click="entire = false"
          >
            Load Paritially Over Infinite Scroll
          </b-button>
        </div>
        <YouTubeVideoList
          :videos="videos.filter((video) => video.title !== 'Private video')"
          @newShow="newShow"
          :checkSubs="true"
          ref="youtubeVideoList"
        />
        <div v-if="!entire" v-observe-visibility="visibilityChanged"></div>
      </div>
    </div>
  </div>
</template>

<script>
import YouTubeVideoList from "@/components/YouTubeVideoList";
import YouTube from "@/lib/youtube";

export default {
  components: {
    YouTubeVideoList,
  },
  props: {
    playlist_id: {
      type: String,
    },
    title: {
      type: String,
    },
  },
  data() {
    return {
      videos: [],
      checkSaved: false,
      checkShows: false,
      nextPageToken: undefined,
      entire: false,
      totalResults: undefined,
    };
  },
  mounted() {
    this.load();
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
    $adminMode() {
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
    },
  },
  methods: {
    load({ forceRefresh = false } = {}) {
      if (this.entire) {
        this.loadEntirePlaylist({ forceRefresh });
      } else {
        this.videos = [];
        this.nextPageToken = undefined;
        this.loadPlaylistPage({ forceRefresh });
      }
    },
    visibilityChanged(isVisible) {
      if (this.nextPageToken && isVisible && !this.entire) {
        this.loadPlaylistPage({ pageToken: this.nextPageToken });
      }
    },
    forceRefresh() {
      this.load({ forceRefresh: true });
    },
    newShow(show) {
      this.$refs.youtubeVideoList.assignShowToAll(show.id, show.type);
    },
    async loadEntirePlaylist({ forceRefresh = false } = {}) {
      let {playlistItems, totalResults} = await YouTube.playlistByApi(
        this.playlist_id,
        false,
        forceRefresh ? 0 : -1
      );
      let videos = playlistItems
      if (videos && videos.length > 0) {
        videos = await this.checkShowsFunc(videos);
        this.videos = videos;
      }
      this.totalResults = totalResults
    },
    async loadPlaylistPage({ pageToken, forceRefresh = false } = {}) {
      let { playlistItems, nextPageToken, totalResults } =
        await YouTube.playlistPageByApi(
          this.playlist_id,
          pageToken,
          forceRefresh ? 0 : -1
        );
      let videos = playlistItems;
      if (videos && videos.length > 0) {
        videos = await this.checkShowsFunc(videos);
        this.videos = this.videos.concat(videos);
      }
      this.nextPageToken = nextPageToken;
      this.totalResults = totalResults;
    },
    async checkShowsFunc(videos) {
      if (this.checkShows)
        videos = await YouTube.checkShows(videos, this.$l2.id, this.$adminMode);
      return videos;
    },
  },
  computed: {
    $adminMode() {
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
    },
  },
  watch: {
    entire() {
      this.load();
    },
    playlist_id() {
      if (this.$route.name === "youtube-playlist") {
        this.load();
      }
    },
  },
};
</script>
