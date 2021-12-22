<template>
  <div class="widget widget-dark mb-5" style="max-width: 70vh; margin: 0 auto">
    <div class="widget-title">
      <span style="font-weight: normal">
        A Random {{ routeType === "tv-shows" ? "TV Show Episode" : "Video" }}
        {{ randomShowFirstEpisodeL2 ? "in " : "" }}
      </span>
      <span style="font-weight: bold; color: white">
        {{
          randomShowFirstEpisodeL2
            ? `${randomShowFirstEpisodeL2.name} (${randomShowFirstEpisodeL2.code})`
            : ""
        }}
      </span>
    </div>
    <div class="text-center pt-5 pb-5" v-if="!randomShowFirstEpisode">
      <Loader :sticky="true" message="Getting shows..." />
    </div>
    <LazyYouTubeVideo
      v-if="randomShowFirstEpisode"
      initialLayout="vertical"
      :youtube="randomShowFirstEpisode.youtube_id"
      :ref="`youtube`"
      :autoload="true"
      :autoplay="true"
      :startAtRandomTime="true"
      @currentTime="updateCurrentTime"
    />
    <div class="text-center pt-3 pb-3" v-if="randomShowFirstEpisode">
      <router-link
        :to="{
          name: 'youtube-view',
          params: {
            l1: $l1 ? $l1.code : l1Code(randomShowFirstEpisodeL2Code),
            l2: $l2 ? $l2.code : randomShowFirstEpisodeL2Code,
            youtube_id: randomShowFirstEpisode.youtube_id,
          },
          query: {
            t: currentTime,
          },
        }"
        class="btn btn-ghost-dark-no-bg"
      >
        <i class="fas fa-play mr-1"></i>
        {{ $t('Watch Full') }}
      </router-link>
      <b-button variant="ghost-dark-no-bg" @click="loadRandomShow">
        <i class="fas fa-step-forward mr-1"></i>
        {{ $t('Another One') }}
      </b-button>
      <b-button
        variant="ghost-dark-no-bg"
        v-if="$adminMode"
        @click="removeEpisode(randomShowFirstEpisode)"
      >
        <i class="fas fa-trash"></i>
      </b-button>
    </div>
  </div>
</template>

<script>
import Helper from "@/lib/helper";
import Config from "@/lib/config";
export default {
  props: {
    routeType: {
      default: "tv-shows", // or 'talks'
    },
    shows: {
      default: undefined,
    },
  },
  data() {
    return {
      currentTime: 0,
      randomShow: undefined,
      randomShowId: undefined,
      randomShowFirstEpisode: undefined,
    };
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
    randomShowFirstEpisodeL2() {
      if (this.randomShowFirstEpisode) {
        let l2Id = this.randomShowFirstEpisode.l2;
        let l2 = this.$languages.getById(l2Id);
        return l2;
      }
    },
    randomShowFirstEpisodeL2Code() {
      if (this.randomShowFirstEpisodeL2) {
        return this.randomShowFirstEpisodeL2.code;
      }
    },
  },
  mounted() {
    this.loadRandomShow();
  },
  watch: {
    shows() {
      this.loadRandomShow();
    },
  },
  methods: {
    l1Code() {
      return Helper.l1Code(...arguments);
    },
    async removeEpisode(randomShowFirstEpisode) {
      let response = await axios.delete(
        `${Config.wiki}items/youtube_videos/${randomShowFirstEpisode.id}`
      );
      if (response) {
        this.loadRandomShow();
      }
    },
    async loadRandomShow() {
      let randomShow = this.getRandomShow();
      if (randomShow) {
        let randomShowFirstEpisode = await this.getFirstEpisodeOfShow(
          randomShow.id,
          this.routeType.replace(/s$/, "").replace("-", "_")
        );
        this.randomShow = randomShow;
        this.randomShowFirstEpisode = randomShowFirstEpisode;
      }
    },
    getRandomShow() {
      if (this.shows) {
        let shows = this.shows.filter((s) => {
          if (
            this.routeType === "tv-shows" &&
            ["Music", "Movies"].includes(s.title)
          )
            return false;
          if (this.routeType === "talks" && ["News"].includes(s.title))
            return false;
          return true;
        });
        let randomShow = shows[Math.floor(Math.random() * shows.length)];
        return randomShow;
      }
    },
    updateCurrentTime(currentTime) {
      if (typeof window !== "undefined") {
        this.currentTime = currentTime;
      }
    },
    async getFirstEpisodeOfShow(showId, showType) {
      let url = `${Config.wiki}items/youtube_videos?filter[${showType}][eq]=${showId}&fields=youtube_id,id,l2`;
      let response = await axios.get(url);

      if (response.data && response.data.data.length > 0) {
        let videos = response.data.data;
        let firstEpisode = videos[0];
        return firstEpisode;
      }
    },
  },
};
</script>

<style>
</style>