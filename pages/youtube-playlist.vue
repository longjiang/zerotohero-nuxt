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
        <h3 class="text-center" v-else>Playlist: {{ playlist_id }}</h3>
        <div class="text-center mt-4 mb-4">
          <b-button
            class="btn-small btn-primary d-inline-block"
            @click="forceRefresh"
          >
            <i class="fa fa-sync-alt mr-1"></i>
            Force Refresh
          </b-button>
        </div>
        <YouTubeVideoList
          :videos="videos.filter((video) => video.title !== 'Private video')"
          @newShow="newShow"
          :checkSubs="true"
          ref="youtubeVideoList"
        />
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
    };
  },
  mounted() {
    this.loadPlaylist();
  },
  methods: {
    forceRefresh() {
      this.loadPlaylist({ forceRefresh: true });
    },
    newShow(show) {
      this.$refs.youtubeVideoList.assignShowToAll(show.id, show.type);
    },
    async loadPlaylist({ forceRefresh = false } = {}) {
      this.videos = [];
      let videos = await YouTube.playlistByApi(
        this.playlist_id,
        false,
        forceRefresh ? 0 : -1
      );
      if (videos && videos.length > 0) {
        videos = await this.checkShowsFunc(videos);
        this.videos = videos;
      }
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
    playlist_id() {
      if (this.$route.name === "youtube-playlist") {
        this.loadPlaylist();
      }
    },
  },
};
</script>
