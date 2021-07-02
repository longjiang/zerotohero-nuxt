<template>
  <div>
    <YouTubeVideoList
      ref="youTubeVideoList"
      :videos="videos"
      :checkSubs="true"
      :updateVideos="updateVideos"
      :checkSaved="checkSaved"
    />
    <div class="mt-4 text-center" v-if="term">
      <router-link
        v-if="start > 9"
        :to="`/${$l1.code}/${$l2.code}/youtube/search/${encodeURIComponent(
          term
        )}/${Number(start) - 10}?long=${long}&captions=${captions}`"
        class="btn btn-primary"
      >
        <i class="fa fa-chevron-left"></i>
      </router-link>
      <span class="ml-3 mr-3">Page {{ start / 10 + 1 }}</span>
      <router-link
        :to="`/${$l1.code}/${$l2.code}/youtube/search/${encodeURIComponent(
          term
        )}/${Number(start) + 10}?long=${long}&captions=${captions}`"
        class="btn btn-primary"
      >
        <i class="fa fa-chevron-right"></i>
      </router-link>
    </div>
  </div>
</template>

<script>
import YouTube from "@/lib/youtube";
import YouTubeVideoList from "@/components/YouTubeVideoList";

export default {
  components: {
    YouTubeVideoList,
  },
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
  },
  data() {
    return {
      videos: [],
      updateVideos: 0,
    };
  },
  mounted() {
    this.bindKeys();
    this.loadVideos();
  },
  unmounted() {
    this.unbindKeys();
  },
  activated() {
    this.bindKeys();
  },
  deactivated() {
    this.unbindKeys();
  },
  watch: {
    term() {
      this.loadVideos();
    },
    start() {
      this.loadVideos();
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
    prevPage() {
      this.$router.push({
        path: `/${this.$l1.code}/${
          this.$l2.code
        }/youtube/search/${encodeURIComponent(this.term)}/${
          Number(this.start) - 10
        }`,
      });
    },
    nextPage() {
      this.$router.push({
        path: `/${this.$l1.code}/${
          this.$l2.code
        }/youtube/search/${encodeURIComponent(this.term)}/${
          Number(this.start) + 10
        }`,
      });
    },
    unbindKeys() {
      window.onkeydown = null;
    },
    bindKeys() {
      window.onkeydown = (e) => {
        if (e.target.tagName.toUpperCase() !== "INPUT") {
          // left = 37
          if (e.keyCode == 37) {
            this.prevPage();
            return false;
          }
          // right = 39
          if (e.keyCode == 39) {
            this.nextPage();
            return false;
          }
        }
      };
    },
    forceRefresh() {
      this.loadVideos({ forceRefresh: true });
    },
    async loadVideos(options) {
      this.videos = [];
      options = options || {};
      options = Object.assign(
        {
          term: this.term,
          start: this.start || 0,
          lang: this.$l2.code,
          forceRefresh: false,
          long: this.long,
        },
        options
      );
      if (this.captions === "nocaptions") options.captions = false;
      if (this.captions === "captions") options.captions = true;
      this.videos = await YouTube.searchByGoogle(options);
      this.updateVideos++;
    },
    addAll() {
      this.$refs.youTubeVideoList.addAll();
    },
  },
};
</script>