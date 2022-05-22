<router>
  {
    path: '/:l1/:l2/youtube/browse/:topic?/:level?/:start?/:keyword?',
    props: true,
    meta: {
      skin: 'dark'
    }
  }
</router>
<template>
  <div class="main-dark">
    <VideoHero
      v-if="heroVideo"
      :video="heroVideo"
      @videoUnavailable="onVideoUnavailable"
    />
    <div class="youtube-browse container pb-5">
      <SocialHead
        :title="`Study ${$l2.name} videos with subs | ${$l2.name} Zero to Hero`"
        :description="`Watch ${$l2.name} videos and study the ${
          $l2.code === 'zh' ? 'Pinyin' : $l2.name
        } subtitles.`"
      />
      <MediaSearchResults
        :topic="topic"
        :level="level"
        :keyword="keyword"
        :start="start"
        :showLatestIfKeywordMissing="true"
        :showNoVideosMessage="true"
        :showSearchBar="true"
        @videosLoaded="onVideosLoaded"
      />
      <div class="row"></div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    topic: {
      default: "all",
    },
    level: {
      default: "all",
    },
    keyword: {
      default: "",
    },
    start: {
      default: 0,
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
    $adminMode() {
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
    },
    heroVideo() {
      if (this.videos.length > 0)
        return this.videos[Math.floor(Math.random() * this.videos.length)];
    },
  },
  data() {
    return {
      videos: [],
    };
  },
  methods: {
    onVideoUnavailable() {
      this.videoUnavailable = true;
      this.videos = this.videos.filter(
        (v) => v.youtube_id !== this.heroVideo.youtube_id
      );
      this.loadHeroVideo();
    },
    onVideosLoaded(videos) {
      this.videos = videos || [];
    },
  },
};
</script>
<style>
</style>