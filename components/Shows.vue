<template>
  <div class="main-dark shows">
    <div class="container">
      <SocialHead
        v-if="shows && shows[0]"
        :title="`Learn ${$l2.name} with ${
          routeType === 'tv-shows' ? 'TV Shows' : 'YouTube Channels'
        } | ${$l2.name} Zero to Hero`"
        :description="`Learn ${$l2.name} with ${
          routeType === 'tv-shows' ? 'TV Shows' : 'YouTube Channels'
        }.`"
        :image="
          routeType === 'tv-shows' && $l2.code === 'zh'
            ? '/img/tv-shows.jpg'
            : `https://img.youtube.com/vi/${shows[0].youtube_id}/hqdefault.jpg`
        "
      />
      <div class="row">
        <div class="col-sm-12">
          <Sale class="mt-5 mb-5" v-if="$l2.code === 'zh'" />
          <h3 class="text-center mt-5">
            Study {{ $l2.name }} with
            {{ routeType === "tv-shows" ? "TV Shows" : "YouTube Channels" }}
          </h3>
          <p class="text-center mb-5" v-if="shows && shows.length">
            ({{ filteredShows && filteredShows.length }} show{{
              filteredShows.length > 1 ? "s" : ""
            }})
          </p>
          <LazyDiscoverPlayer :routeType="routeType" :shows="shows" />
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
                {{ routeType === "tv-shows" ? "TV shows" : "YouTube Channels" }} in
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
      keyword: "",
    };
  },
  async fetch() {
    let shows = this.$store.state.shows[this.type][this.$l2.code];
    if (shows) {
      this.shows = shows;
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
        if (this.keyword) {
          let k = this.$l2.han ? tify(this.keyword) : this.keyword;
          return this.shows.filter((s) => {
            let title = this.$l2.han ? tify(s.title) : s.title;
            return title.toLowerCase().includes(k.toLowerCase());
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
    async getShowsOverNetwork() {
      let langId = this.$l2.id;
      let type = this.routeType.replace("-", "_");
      console.log("😱 Getting random show over network");
      let url = `${Config.wiki}items/${type}?filter[l2][eq]=${langId}&fields=id,title`;
      let response = await axios.get(url);
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