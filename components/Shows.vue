<template>
  <div class="main-dark pt-5">
    <VideoHero
      v-if="featureEpisode"
      :video="featureEpisode"
      @videoUnavailable="onVideoUnavailable"
    />
    <div class="shows">
      <div class="container">
        <SocialHead
          v-if="shows && shows[0]"
          :title="`Learn ${$l2.name} with ${routeTitles[routeType]} | ${$l2.name} Zero to Hero`"
          :description="`Learn ${$l2.name} with ${routeTitles[routeType]}.`"
          :image="
            routeType === 'tv-shows' && $l2.code === 'zh'
              ? '/img/tv-shows.jpg'
              : `https://img.youtube.com/vi/${shows[0].youtube_id}/hqdefault.jpg`
          "
        />

        <div class="row">
          <div class="col-sm-12">
            <!-- <Sale class="mt-5 mb-5" v-if="$l2.code === 'zh'" /> -->
            <div class="show-list-wrapper">
              <b-input-group class="mb-5 input-group-ghost-dark">
                <b-form-input
                  v-model="keyword"
                  @compositionend.prevent.stop="() => false"
                  :placeholder="`Filter ${
                    filteredShows ? filteredShows.length : ''
                  } ${$l2.name} ${routeTitles[routeType]}`"
                  class="input-ghost-dark"
                />
              </b-input-group>
              <div class="mb-5">
                <div
                  :class="{
                    'loader text-center': true,
                    'd-none': shows,
                  }"
                  style="flex: 1"
                >
                  <Loader :sticky="true" message="Getting shows..." />
                </div>
                <div class="text-center" v-if="shows && shows.length === 0">
                  Sorry, we could not find any
                  {{ routeTitles[routeType] }}
                  in {{ $l2.name }}.
                </div>
                <ShowList
                  v-if="shows && shows.length > 0"
                  :shows="filteredShows"
                  :type="type"
                  :key="`shows-filtered-${this.keyword}`"
                />
                <LazyIdenticalLanguages class="mt-3" :routeName="routeType" />
              </div>
            </div>
          </div>
        </div>
        <FeedbackPrompt class="mb-5" :skin="$route.meta ? $route.meta.skin : 'light'"/>
      </div>
    </div>
  </div>
</template>

<script>
import Config from "@/lib/config";
import { tify } from "chinese-conv";

export default {
  props: {
    routeType: String, // "tv-shows" or "talks"
  },
  data() {
    return {
      type: {
        "tv-shows": "tvShows",
        talks: "talks",
        audiobooks: "talks",
      }[this.routeType],
      shows: undefined,
      keyword: "",
      showDiscover: false,
      featureShow: undefined,
      featureEpisode: undefined,
      routeTitles: {
        "tv-shows": "TV Shows",
        talks: "YouTube Channels",
        audiobooks: "Audiobooks",
      },
    };
  },
  async fetch() {
    let shows = this.$store.state.shows[this.type][this.$l2.code];
    if (shows) {
      this.loadShows();
    }
  },
  async mounted() {
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type.startsWith("shows")) {
        this.loadShows();
      }
    });
  },
  beforeDestroy() {
    // you may call unsubscribe to stop the subscription
    this.unsubscribe();
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
    filteredShows() {
      if (this.shows) {
        let shows = this.shows;
        if (this.routeType === "audiobooks") {
          shows = shows.filter((s) => s.audiobook);
        } else {
          shows = shows.filter((s) => !s.audiobook);
        }
        if (this.keyword) {
          let k = this.$l2.han ? tify(this.keyword) : this.keyword;
          return shows.filter((s) => {
            let title = this.$l2.han ? tify(s.title) : s.title;
            return title.toLowerCase().includes(k.toLowerCase());
          });
        } else {
          return shows.filter(
            (show) => !["News", "Music", "Movies"].includes(show.title)
          );
        }
      }
    },
  },
  methods: {
    onVideoUnavailable(youtube_id) {
      if (youtube_id === this.featureEpisode.youtube_id)
        this.loadFeatureShowAndEpisode();
    },
    async getShowsOverNetwork() {
      let langId = this.$l2.id;
      let type = this.routeType.replace("-", "_");
      let url = `${Config.wiki}items/${type}?filter[l2][eq]=${langId}&fields=id,title`;
      let response = await this.$authios.get(url);
      if (response.data && response.data.data.length > 0) {
        let shows = response.data.data;
        return shows;
      }
    },
    sortShows(shows) {
      shows =
        shows.sort((x, y) =>
          x.title.localeCompare(y.title, this.$l2.locales[0])
        ) || [];
      return shows;
    },
    async loadShows() {
      let shows = this.$store.state.shows[this.type][this.$l2.code]
        ? this.$store.state.shows[this.type][this.$l2.code]
        : undefined;
      if (shows) {
        this.shows = this.sortShows(shows);
        this.loadFeatureShowAndEpisode();
      }
    },
    async loadFeatureShowAndEpisode() {
      this.featureShow = this.getRandomShow();
      this.featureEpisode = await this.getFirstEpisodeOfShow(
        this.featureShow,
        this.routeType === "tv-shows" ? "tv_show" : "talk",
        this.$l2.id
      );
    },
    async getFirstEpisodeOfShow(show, showType, l2Id) {
      let sort = "-date";
      if (show.audiobook || showType === "tv_show") {
        sort = "title";
      }
      let url = `${Config.youtubeVideosTableName(
        l2Id
      )}?filter[${showType}][eq]=${
        show.id
      }&limit=1&fields=youtube_id,id,l2,tv_show,talk,title&sort=${sort}`;
      let response = await this.$authios.get(url);

      if (response.data && response.data.data.length > 0) {
        let videos = response.data.data;
        let firstEpisode = videos[0];
        return firstEpisode;
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
          if (this.routeType === "talks" && (["News"].includes(s.title) || s.audiobook))
            return false;
          if (this.routeType === "audiobooks") return s.audiobook;
          return true;
        });
        let randomShow = shows[Math.floor(Math.random() * shows.length)];
        return randomShow;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep .synced-transcript {
  height: 5rem;
  overflow: hidden;
}
</style>