<router>
  {
    path: '/:l1/:l2/youtube/playlist/:playlist_id?/:title?',
    props: true
  }
</router>
<template>
  <div class="main">
    <div class="youtube-browse container pt-5 pb-5">
      <div class="row">
        <div class="col-sm-12">
          <h3 class="text-center" v-if="title">
            <Annotate :phonetics="false" :buttons="true">
              <span>{{ title }}</span>
            </Annotate>
          </h3>
          <p v-if="totalResults" class="text-center">
            {{ shownResults }} of {{ totalResults }} videos shown
          </p>
          <h3 class="text-center" v-else>Playlist: {{ playlist_id }}</h3>
          <div class="text-center mt-4 mb-4">
            <b-button
              class="btn-small btn-primary d-inline-block"
              @click="enableForceRefresh"
            >
              <i class="fa fa-sync-alt mr-1"></i>
              Force Refresh
            </b-button>
            <b-button
              class="btn-small btn-secondary d-inline-block"
              v-if="$adminMode && totalResults > 500"
              @click="load500"
            >
              Load 500
            </b-button>
            <b-button
              class="btn-small btn-secondary d-inline-block"
              v-if="$adminMode && totalResults > 500"
              @click="clearVideos"
            >
              Clear Videos
            </b-button>
            <b-button
              class="btn-small btn-secondary d-inline-block"
              v-if="
                $adminMode &&
                entire === false &&
                totalResults > 50 &&
                totalResults <= 500
              "
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
            :showProgress="false"
            ref="youtubeVideoList"
          />
          <div v-if="noMoreVideos" class="text-center mt-4">
            <h6>No more videos.</h6>
            <p>{{ videos.length }} videos loaded.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import YouTubeVideoList from "@/components/YouTubeVideoList";
import YouTube from "@/lib/youtube";
import Helper from "@/lib/helper";

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
      shownResults: 0,
      totalResults: undefined,
      forceRefresh: false,
      noMoreVideos: false,
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
    load() {
      if (this.entire) {
        this.videos = [];
        this.loadEntirePlaylist();
      } else {
        this.videos = [];
        this.nextPageToken = undefined;
        this.loadPlaylistPage();
      }
    },
    visibilityChanged(isVisible) {
      if (this.nextPageToken && isVisible && !this.entire) {
        this.loadPlaylistPage({ pageToken: this.nextPageToken });
      }
    },
    enableForceRefresh() {
      this.forceRefresh = true;
      this.load();
    },
    newShow(show) {
      this.$refs.youtubeVideoList.assignShowToAll(show, show.type);
    },
    async loadEntirePlaylist() {
      let { playlistItems, totalResults } = await YouTube.playlistByApi(
        this.playlist_id,
        false,
        this.forceRefresh ? 0 : -1
      );
      let videos = playlistItems;
      if (videos && videos.length > 0) {
        videos = await this.checkShowsFunc(videos);
        this.videos = Helper.uniqueByValue(videos, "youtube_id");
      }
      this.totalResults = totalResults;
      this.shownResults = totalResults;
    },
    async loadPlaylistPage({ pageToken } = {}) {
      this.noMoreVideos = false;
      let response = await YouTube.playlistPageByApi(
        this.playlist_id,
        pageToken,
        this.forceRefresh ? 0 : -1
      );
      if (response) {
        let { playlistItems, nextPageToken, totalResults } = response;
        let videos = playlistItems;
        if (videos && videos.length > 0) {
          videos = await this.checkShowsFunc(videos);
          this.videos = Helper.uniqueByValue(
            this.videos.concat(videos),
            "youtube_id"
          );
        }
        this.nextPageToken = nextPageToken;
        this.totalResults = totalResults;
        this.shownResults = this.shownResults + videos.length;
      } else {
        this.noMoreVideos = true;
      }
    },
    async load500() {
      for (let i = 0; i < 10; i++) {
        await Helper.timeout(500);
        this.visibilityChanged(true);
      }
    },
    clearVideos() {
      this.videos = [];
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
