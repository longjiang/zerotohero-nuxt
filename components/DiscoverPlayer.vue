<template>
  <Widget class="mb-5" style="max-width: 70vh; margin: 0 auto">
    <template #title>
      <i18n
        path="A Random {0} in {1}"
        tag="span"
        style="font-weight: normal"
      >
        <span>
          {{ $t(routeType === "tv-shows" ? "TV Show Episode" : "Video") }}
        </span>
        <span style="font-weight: bold; color: white">
          {{
            randomShowRandomEpisodeL2
              ? `${$t(randomShowRandomEpisodeL2.name)} (${randomShowRandomEpisodeL2.code})`
              : ""
          }}
        </span>
      </i18n>
    </template>
    <template #body>
      <div class="text-center pt-5 pb-5" v-if="!randomShowRandomEpisode">
        <Loader :sticky="true" message="Getting shows..." />
      </div>
      <LazyYouTubeVideo
        v-if="randomShowRandomEpisode"
        :key="randomShowRandomEpisode.id"
        layout="vertical"
        v-bind="{
          video: randomShowRandomEpisode,
          autoload: true,
          autoplay: true,
          startAtRandomTime: true
        }"
        ref="youtube"
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
            name: 'l1-l2-video-view-type',
            params: {
              type: 'youtube',
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
    </template>
  </Widget>
</template>

<script>
import { l1Code } from "../lib/utils";

export default {
  props: {
    routeType: {
      default: "tv-shows", // or 'talks'
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
      shows: [],
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
    if (this.routeType === "tv-shows") {
      let shows = this.$store.state.shows.tvShows[this.l2?.code || this.$l2.code];
      this.shows = shows.filter((show) => show.title !== "Music" && show.title !== "Movies");
    } else if (this.routeType === "talks") {
      let shows = this.$store.state.shows.talks[this.l2?.code || this.$l2.code];
      this.shows = shows.filter((show) => show.title !== "News");
    }
    this.loadRandomShow();
  },
  methods: {
    loadHistory() {
      let historyItem = this.history.pop();
      if (historyItem.episode === this.randomShowRandomEpisode)
        historyItem = this.history.pop();
      this.randomShow = historyItem.show;
      this.randomShowRandomEpisode = historyItem.episode;
    },
    l1Code() {
      return l1Code(...arguments);
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
        let shows = this.shows;
        // filter out shows with the title "Music" and "Movies"
        shows = shows.filter((show) => show.title !== "Music" && show.title !== "Movies");
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
      let query = `filter[${showType}][eq]=${showId}&fields=youtube_id,id,l2`;
      let videos = await this.$directus.getVideos({ l2Id, query });
      let firstEpisode = videos[0];
      return firstEpisode;
    },
    async getRandomEpisodeOfShow(showId, showType, l2Id) {
      let langFilter = l2Id ? `&filter[l2][eq]=${l2Id}` : "&filter[l2][nnull]=1";
      let showFilter = showId
        ? `filter[${showType}][eq]=${showId}`
        : `filter[tv_show][null]=1&filter[talk][null]=1${langFilter}`;
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