<router>
  {
    path: '/:l1/:l2/youtube/playlist/:playlist_id?/:title?',
    props: true,
  }
</router>
<template>
  <div>
    <div class="youtube-browse container pt-5 pb-5">
      <div class="row">
        <div class="col-sm-12">
          <h3 class="text-center" v-if="title">
            <Annotate :buttons="true">
              <span>{{ title.replace('All uploaded videos of ', '') }}</span>
            </Annotate>
          </h3>
          <h3 class="text-center" v-else>Playlist</h3>
          <div class="text-center mb-3" v-if="$adminMode">Playlist ID: {{ playlist_id }}</div>
          <p v-if="totalResults" class="text-center">
            {{ shownResults }} of {{ totalResults }} videos loaded. Videos without subs are dimmed.
          </p>
          <div class="text-center mt-4 mb-5">
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
              Load {{ shownResults >= 500 ? "another" : "" }} 500
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
          <div :key="videoListKey">
            <LazyYouTubeVideoList
              :videos="
                videos.filter((video) => video.title !== 'Private video')
              "
              :skin="$skin"
              :checkSubs="true"
              :showProgress="false"
              :showDate="true"
              @newShow="newShow"
              ref="youtubeVideoList"
            />
          </div>
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
import YouTube from "@/lib/youtube";
import { uniqueByValue } from "@/lib/utils";

export default {
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
      videoListKey: 0,
    };
  },
  async mounted() {
    await this.load();
    if (this.totalResults && this.totalResults <= 500) {
      this.entire = true;
    }
  },
  computed: {
  },
  methods: {
    async load() {
      if (this.entire) {
        this.videos = [];
        await this.loadEntirePlaylist();
      } else {
        this.videos = [];
        this.nextPageToken = undefined;
        await this.loadPlaylistPage();
      }
    },
    async visibilityChanged(isVisible) {
      if (this.nextPageToken && isVisible && !this.entire) {
        await this.loadPlaylistPage({ pageToken: this.nextPageToken });
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
        this.videos = uniqueByValue(videos, "youtube_id");
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
          this.videos = uniqueByValue(
            this.videos.concat(videos),
            "youtube_id"
          );
        }
        this.nextPageToken = nextPageToken;
        this.totalResults = totalResults;
        this.shownResults = Math.min(
          this.shownResults + videos.length,
          totalResults
        );
      } else {
        this.noMoreVideos = true;
      }
    },
    async load500() {
      if (this.shownResults > 50) this.clearVideos();
      this.videoListKey++;
      for (let i = 0; i < (this.shownResults > 50 ? 10 : 9); i++) {
        await this.visibilityChanged(true);
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
