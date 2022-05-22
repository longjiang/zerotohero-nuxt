<template>
  <div
    :class="{
      'youtube-search-results': true,
      'cloak-videos-without-subs': cloakVideosWithoutSubs,
    }"
  >
    <LazyYouTubeVideoList
      ref="youTubeVideoList"
      :videos="videos"
      :checkSubs="true"
      :updateVideos="updateVideos"
      :checkSaved="checkSaved"
      :hideVideosWithoutSubsProp="hideVideosWithoutSubs"
      :showBadges="true"
      :showProgress="false"
      :skin="skin"
    />
    <div
      v-if="infinite && !noMoreVideos"
      v-observe-visibility="infinite ? visibilityChanged : undefined"
    ></div>
    <div v-if="term && infinite && noMoreVideos" class="text-center mt-4">
      <h6>No more videos.</h6>
      <p>{{ moreVideos }} videos loaded.</p>
    </div>
    <div class="mt-4 text-center" v-if="term && !infinite && showPaginator">
      <router-link
        v-if="start > 9"
        :to="`/${$l1.code}/${$l2.code}/youtube/search/${encodeURIComponent(
          term
        )}/${Math.max(
          0,
          Number(start) - perPage - moreVideos
        )}?long=${long}&captions=${captions}`"
        class="btn btn-primary"
      >
        <i class="fa fa-chevron-left"></i>
      </router-link>
      <span class="ml-3 mr-3">
        Page {{ Math.ceil(start / (perPage + moreVideos) + 1) }}
      </span>
      <router-link
        :to="`/${$l1.code}/${$l2.code}/youtube/search/${encodeURIComponent(
          term
        )}/${
          Number(start) + perPage + moreVideos
        }?long=${long}&captions=${captions}`"
        class="btn btn-primary"
      >
        <i class="fa fa-chevron-right"></i>
      </router-link>
    </div>
  </div>
</template>

<script>
import YouTube from "@/lib/youtube";

export default {
  props: {
    term: {
      type: String,
    },
    start: {
      default: 0,
    },
    captions: {
      type: String,
      default: "all", // or 'nocaptions' or 'all'
    },
    long: {
      type: Boolean,
      default: false,
    },
    checkSubs: {
      default: false,
    },
    checkSaved: {
      default: false,
    },
    infinite: {
      default: false,
    },
    hideVideosWithoutSubs: {
      default: false,
    },
    showPaginator: {
      default: true,
    },
    skin: {
      default: "light",
    },
    cloakVideosWithoutSubs: {
      default: "true"
    }
  },
  data() {
    return {
      videos: [],
      moreVideos: 0,
      updateVideos: 0,
      perPage: 10,
      noMoreVideos: false,
    };
  },
  async mounted() {
    this.videos = await this.getVideos();
  },
  activated() {
    this.bindKeys();
  },
  deactivated() {
    this.unbindKeys();
  },
  watch: {
    async term() {
      this.videos = await this.getVideos();
    },
    async start() {
      this.videos = await this.getVideos();
    },
    async long() {
      this.videos = await this.getVideos();
    },
    async captions() {
      this.videos = await this.getVideos();
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
  methods: {
    visibilityChanged(isVisible) {
      if (this.videos && isVisible) {
        this.loadMore();
      }
    },
    async loadMore() {
      this.moreVideos = this.moreVideos + this.perPage;
      let newVideos = await this.getVideos({
        start: Number(this.start) + this.moreVideos,
      });
      if (newVideos && newVideos.length > 0) {
        this.videos = this.videos.concat(newVideos);
        return true;
      } else {
        this.noMoreVideos = true;
        return false;
      }
    },
    prevPage() {
      this.$router.push({
        path: `/${this.$l1.code}/${
          this.$l2.code
        }/youtube/search/${encodeURIComponent(this.term)}/${
          Number(this.start) - this.perPage
        }`,
      });
    },
    nextPage() {
      this.$router.push({
        path: `/${this.$l1.code}/${
          this.$l2.code
        }/youtube/search/${encodeURIComponent(this.term)}/${
          Number(this.start) + this.perPage
        }`,
      });
    },
    unbindKeys() {
      window.onkeydown = null;
    },
    async forceRefresh() {
      this.videos = await this.getVideos({ forceRefresh: true });
    },
    async getVideos(options) {
      options = options || {};
      options = Object.assign(
        {
          term: this.term,
          start: this.start || 0,
          lang: this.$l2.code,
          forceRefresh: false,
        },
        options
      );
      if (this.captions === "nocaptions") options.captions = false;
      if (this.captions === "captions") options.captions = true;
      if (this.long) options.long = true;
      let videos = await YouTube.searchByGoogle(options);
      return videos;
    },
    addAll() {
      this.$refs.youTubeVideoList.addAll();
    },
  },
};
</script>
<style lang="scss" scoped>
.cloak-videos-without-subs {
  ::v-deep .col-no-subs {
    display: none;
  }
}
</style>