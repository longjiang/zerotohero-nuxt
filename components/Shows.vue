<template>
  <div class="main-dark shows">
    <div class="container">
      <SocialHead
        v-if="shows && shows[0]"
        :title="`Learn ${$l2.name} with ${
          routeType === 'tv-shows' ? 'TV Shows' : 'Talks'
        } | ${$l2.name} Zero to Hero`"
        :description="`Learn ${$l2.name} with ${
          routeType === 'tv-shows' ? 'TV Shows' : 'Talks'
        }.`"
        :image="
          routeType === 'tv-shows' && $l2.code === 'zh'
            ? '/img/tv-shows.jpg'
            : `https://img.youtube.com/vi/${shows[0].youtube_id}/hqdefault.jpg`
        "
      />
      <div class="row">
        <div class="col-sm-12">
          <h3 class="text-center mt-5">
            Study {{ $l2.name }} with
            {{ routeType === "tv-shows" ? "TV Shows" : "Talks" }}
          </h3>
          <p class="text-center mb-5" v-if="shows && shows.length">
            ({{ filteredShows && filteredShows.length }} show{{
              filteredShows.length > 1 ? "s" : ""
            }})
          </p>
          <div
            class="widget widget-dark mb-5"
            style="max-width: 70vh; margin: 0 auto"
          >
            <div class="widget-title">
              Discover {{ $l2.name }}
              {{ routeType === "tv-shows" ? "TV Shows" : "Talks" }}
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
                    youtube_id: randomShowFirstEpisode.youtube_id,
                  },
                  query: {
                    t: currentTime,
                  },
                }"
                class="btn btn-ghost-dark-no-bg"
              >
                <i class="fas fa-align-left mr-1"></i>
                Transcript
              </router-link>
              <b-button
                variant="ghost-dark-no-bg"
                v-if="filteredShows && filteredShows.length > 1"
                @click="loadRandomShow"
              >
                <i class="fas fa-step-forward mr-1"></i>
                Another One
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
          <div class="show-list-wrapper">
            <b-input-group class="mb-5 input-group-ghost-dark">
              <b-form-input
                v-model="keyword"
                @compositionend.prevent.stop="() => false"
                placeholder="Filter by show title..."
                class="input-ghost-dark"
              />
              <b-input-group-append>
                <b-button variant="ghost-dark">
                  <i class="fas fa-filter"></i>
                </b-button>
              </b-input-group-append>
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
                {{ routeType === "tv-shows" ? "TV shows" : "talks" }} in
                {{ $l2.name }} 😭.
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
    </div>
  </div>
</template>

<script>
import Config from "@/lib/config";
import axios from "axios";
import { tify } from "chinese-conv";

export default {
  props: {
    routeType: String,
  },
  data() {
    return {
      type: this.routeType === "tv-shows" ? "tvShows" : "talks",
      shows: undefined,
      randomShowId: undefined,
      randomShowFirstEpisode: undefined,
      keyword: "",
      currentTime: 0,
    };
  },
  async fetch() {
    let shows = this.$store.state.shows[this.type][this.$l2.code];
    if (shows) {
      this.shows = shows;
    } else {
      let url = `${Config.wiki}items/${this.routeType.replace(
        "-",
        "_"
      )}?filter[l2][eq]=${this.$l2.id}${
        this.$adminMode ? "" : "&filter[hidden][empty]=true"
      }&limit=500&timestamp=${this.$adminMode ? Date.now() : 0}`;
      let response = await axios.get(url);
      if (response && response.data) this.shows = response.data.data;
    }
  },
  async mounted() {
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type.startsWith("shows")) {
        this.loadShows();
      }
    });
    this.loadRandomShow();
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
        if (this.keyword) {
          let k = this.$l2.han ? tify(this.keyword) : this.keyword;
          return this.shows.filter((s) => {
            let title = this.$l2.han ? tify(s.title) : s.title;
            return title.includes(k);
          });
        } else {
          return this.shows.filter(
            (show) => !["News", "Music", "Movies"].includes(show.title)
          );
        }
      }
    },
  },
  methods: {
    async removeEpisode(randomShowFirstEpisode) {
      let response = await axios.delete(
        `${Config.wiki}items/youtube_videos/${randomShowFirstEpisode.id}`
      );
      if (response) {
        this.loadRandomShow();
      }
    },
    updateCurrentTime(currentTime) {
      if (typeof window !== "undefined") {
        this.currentTime = currentTime;
      }
    },
    async loadRandomShow() {
      let randomShow = await this.getRandomShow();
      if (randomShow) {
        let randomShowFirstEpisode = await this.getFirstEpisodeOfShow(
          randomShow.id,
          this.routeType.replace(/s$/, "").replace("-", "_")
        );
        this.randomShow = randomShow;
        this.randomShowFirstEpisode = randomShowFirstEpisode;
      }
    },
    async getFirstEpisodeOfShow(showId, showType) {
      let url = `${Config.wiki}items/youtube_videos?filter[l2][eq]=${this.$l2.id}&filter[${showType}][eq]=${showId}&fields=youtube_id,id`;
      let response = await axios.get(url);

      if (response.data && response.data.data.length > 0) {
        let videos = response.data.data;
        let firstEpisode = videos[0];
        return firstEpisode;
      }
    },
    async getRandomShow() {
      let langId = this.$l2.id;
      let type = this.routeType.replace("-", "_");
      let url = `${Config.wiki}items/${type}?filter[l2][eq]=${langId}&fields=id,title`;
      let response = await axios.get(url);
      if (response.data && response.data.data.length > 0) {
        let shows = response.data.data;
        shows = shows.filter((s) => {
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
    sortShows(shows) {
      shows =
        shows.sort((x, y) => x.title.localeCompare(y.title, this.$l2.code)) ||
        [];
      return shows;
    },
    loadShows() {
      let shows = this.$store.state.shows[this.type][this.$l2.code]
        ? this.$store.state.shows[this.type][this.$l2.code]
        : undefined;
      if (shows) {
        this.shows = this.sortShows(shows);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.zerotohero-wide {
  .shows {
    padding-left: 2rem;
    padding-right: 2rem;
  }
}
@media (max-width: 576px) {
  .show-list-wrapper {
    max-width: 423px;
    margin: 0 auto;
  }
}

::v-deep .synced-transcript {
  height: 5rem;
  overflow: hidden;
}
</style>