<template>
  <div class="main container" id="main">
    <SocialHead
      v-if="shows && shows[0]"
      :title="`Learn ${$l2.name} with ${
        routeType === 'tv-shows' ? 'TV Shows' : 'Talks'
      } | ${$l2.name} Zero to Hero`"
      :description="`Learn ${$l2.name} with ${
        routeType === 'tv-shows' ? 'TV Shows' : 'Talks'
      }.`"
      :image="`https://img.youtube.com/vi/${shows[0].youtube_id}/hqdefault.jpg`"
    />
    <div class="row">
      <div class="col-sm-12">
        <h3 class="text-center mt-5">
          Study {{ $l2.name }} with
          {{ routeType === "tv-shows" ? "TV Shows" : "Talks" }}
        </h3>
        <p class="text-center mb-4" v-if="shows && shows.length">
          ({{ shows.length }} show{{ shows.length > 1 ? "s" : "" }})
        </p>
        <div class="text-center mb-5">
          <NuxtLink
            :to="`/${$l1.code}/${$l2.code}/youtube/view/${randomEpisodeYouTubeId}`"
            class="btn btn-success d-inline-block text-large pl-4 pr-4"
            style="font-size: 1.3em"
          >
            <i class="fa fa-random"></i>
            Watch in random
          </NuxtLink>
        </div>
        <div class="mb-5">
          <div
            :class="{
              'loader text-center': true,
              'd-none': shows,
            }"
            style="flex: 1"
          >
            <div class="heartbeat-loader"></div>
          </div>
          <div class="text-center" v-if="shows && shows.length === 0">
            Sorry, we could not find any
            {{ routeType === "tv-shows" ? "TV shows" : "talks" }} in
            {{ $l2.name }} 😭.
          </div>
          <ShowList
            v-if="shows && shows.length > 0"
            :shows="shows"
            :type="type"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Config from "@/lib/config";
import Helper from "@/lib/helper";
import YouTube from "@/lib/youtube";
import axios from "axios";

export default {
  props: {
    routeType: String,
  },
  data() {
    return {
      type: this.routeType === "tv-shows" ? "tvShows" : "talks",
      shows: undefined,
      randomEpisodeYouTubeId: undefined,
    };
  },
  async fetch() {
    let shows = this.$store.state.shows[this.type][this.$l2.code];
    if (shows) {
      this.shows = shows;
    } else {
      let response = await axios.get(
        `${Config.wiki}items/${this.routeType.replace(
          "-",
          "_"
        )}?filter[l2][eq]=${this.$l2.id}&limit=500&timestamp=${
          this.$adminMode ? Date.now() : 0
        }`
      );
      if (response && response.data) this.shows = response.data.data;
    }
  },
  async mounted() {
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type.startsWith("shows")) {
        this.loadShows();
      }
    });
    this.randomEpisodeYouTubeId = await YouTube.getRandomEpisodeYouTubeId(
      this.$l2.id,
      this.routeType === "tv-shows" ? "tv_show" : "talk"
    );
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
  },
  methods: {
    sortShows(shows) {
      shows =
        shows.sort((x, y) => x.title.localeCompare(y.title, this.$l2.code)) ||
        [];
      return Helper.uniqueByValue(shows, "youtube_id");
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

<style scoped>
</style>