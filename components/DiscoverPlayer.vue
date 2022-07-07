<template>
  <div class="widget widget-dark mb-5" style="max-width: 70vh; margin: 0 auto">
    <div class="widget-title">
      <span style="font-weight: normal">
        A Random {{ routeType === "tv-shows" ? "TV Show Episode" : "Video" }}
        {{ randomShowRandomEpisodeL2 ? "in " : "" }}
      </span>
      <span style="font-weight: bold; color: white">
        {{
          randomShowRandomEpisodeL2
            ? `${randomShowRandomEpisodeL2.name} (${randomShowRandomEpisodeL2.code})`
            : ""
        }}
      </span>
    </div>
    <div class="text-center pt-5 pb-5" v-if="!randomShowRandomEpisode">
      <Loader :sticky="true" message="Getting shows..." />
    </div>
    <LazyYouTubeVideo
      v-if="randomShowRandomEpisode"
      layout="vertical"
      :youtube="randomShowRandomEpisode.youtube_id"
      :ref="`youtube`"
      :autoload="true"
      :autoplay="true"
      :startAtRandomTime="true"
      @currentTime="updateCurrentTime"
    />
    <div class="text-center pt-3 pb-3" v-if="randomShowRandomEpisode">
      <b-button
        variant="ghost-dark-no-bg"
        @click="loadHistory"
        :disabled="history.length <= 1"
        :class="{ disabled: history.length <= 1, 'mr-2': true }"
      >
        <i class="fas fa-step-backward mr-1"></i>
      </b-button>

      <router-link
        :to="{
          name: 'youtube-view',
          params: {
            l1: l1 ? l1.code : l1Code(randomShowRandomEpisodeL2Code),
            l2: l2 ? l2.code : randomShowRandomEpisodeL2Code,
            youtube_id: randomShowRandomEpisode.youtube_id,
          },
          query: {
            t: currentTime,
          },
        }"
        class="btn btn-success"
      >
        <i class="fas fa-window-restore mr-1"></i>
        {{ $t("Open in Full Player") }}
      </router-link>
      <b-button variant="ghost-dark-no-bg" class="ml-2" @click="loadRandomShow">
        <i class="fas fa-step-forward mr-1"></i>
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
    l1: {
      default: undefined,
    },
    l2: {
      default: undefined,
    },
  },
  data() {
    return {
      currentTime: 0,
      randomShow: undefined,
      randomShowId: undefined,
      randomShowRandomEpisode: undefined,
      history: [],
    };
  },
  computed: {
    $adminMode() {
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
    },
    randomShowRandomEpisodeL2() {
      if (this.randomShowRandomEpisode) {
        let l2Id = this.randomShowRandomEpisode.l2;
        let l2 = this.$languages.getById(l2Id);
        return l2;
      }
    },
    randomShowRandomEpisodeL2Code() {
      if (this.randomShowRandomEpisodeL2) {
        return this.randomShowRandomEpisodeL2.code;
      }
    },
  },
  mounted() {
    this.loadRandomShow();
  },
  // watch: {
  //   shows() {
  //     this.loadRandomShow();
  //   },
  // },
  methods: {
    loadHistory() {
      let historyItem = this.history.pop();
      if (historyItem.episode === this.randomShowRandomEpisode)
        historyItem = this.history.pop();
      this.randomShow = historyItem.show;
      this.randomShowRandomEpisode = historyItem.episode;
    },
    l1Code() {
      return Helper.l1Code(...arguments);
    },
    async loadRandomShow() {
      let randomShow = this.getRandomShow();
      let randomShowRandomEpisode = await this.getRandomEpisodeOfShow(
        randomShow ? randomShow.id : undefined,
        this.routeType.replace(/s$/, "").replace("-", "_"),
        randomShow ? randomShow.l2 : this.l2 ? this.l2.id : undefined
      );
      this.randomShow = randomShow;
      this.randomShowRandomEpisode = randomShowRandomEpisode;
      this.history.push({
        show: randomShow,
        episode: randomShowRandomEpisode,
      });
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
    async getFirstEpisodeOfShow(showId, showType, l2Id) {
      let query = `filter[${showType}][_eq]=${showId}&fields=youtube_id,id,l2`;
      let videos = await this.$directus.getVideos({ l2Id, query });
      let firstEpisode = videos[0];
      return firstEpisode;
    },
    async getRandomEpisodeOfShow(showId, showType, l2Id) {
      let langFilter = l2Id ? `&filter[l2][_eq]=${l2Id}` : "&filter[l2][_nnull]=true";
      let showFilter = showId
        ? `filter[${showType}][_eq]=${showId}`
        : `filter[tv_show][_null]=true&filter[talk][_null]=true${langFilter}`;
      let query = `${showFilter}&fields=youtube_id,id,l2`;
      let videos = await this.$directus.getVideos({ l2Id, query });
      let randomEpisode = videos[Math.floor(Math.random() * videos.length)];
      return randomEpisode;
    },
  },
};
</script>

<style lang="scss" scoped>
.btn:disabled {
  opacity: 0.2;

  &:hover {
    background: none;
  }
}
</style>