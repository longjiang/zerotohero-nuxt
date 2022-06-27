<template>
  <div class="main-dark">
    <VideoHero
      v-if="!tag && featureEpisode"
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
              <div class="tags mb-3" v-if="tags">
                <b style="margin-left: 0.25rem; color: rgb(40, 167, 69)">Browse by tags:</b>
                <router-link
                  :key="`tag-all`"
                  :class="{ 'btn btn-sm tag text-white bg-black': true }"
                  :to="{ name: routeType }"
                >
                  All
                  <small style="color: #888">
                    ({{ filteredShowsByAudiobook.length }})
                  </small>
                </router-link>
                <router-link
                  v-if="filterShowsMadeForKids && filterShowsMadeForKids.length > 0"
                  :key="`tag-kids`"
                  :class="{ 'btn btn-sm tag text-white bg-black': true }"
                  :to="{ name: routeType, params: { tag: 'kids' } }"
                >
                  Kids
                  <small style="color: #888">
                    ({{ filterShowsMadeForKids.length }})
                  </small>
                </router-link>
                <router-link
                  v-for="tag of tags.slice(0, 15)"
                  :key="`tag-${tag.tag}`"
                  :class="{ 'btn btn-sm tag text-white bg-black': true }"
                  :to="{ name: routeType, params: { tag: tag.tag } }"
                >
                  {{ tag.tag.toLowerCase() }}
                  <small style="color: #888">({{ tag.count }})</small>
                </router-link>
              </div>
              <b-input-group class="mb-5 input-group-ghost-dark">
                <b-form-input
                  v-model="keyword"
                  @compositionend.prevent.stop="() => false"
                  :placeholder="`Filter ${
                    filteredShows ? filteredShows.length : ''
                  } ${$l2.name} ${routeTitles[routeType]}`"
                  ref="filter"
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
        <FeedbackPrompt
          class="mb-5"
          :skin="$route.meta ? $route.meta.skin : 'light'"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Config from "@/lib/config";
import { tify } from "chinese-conv";
import { scrollToTargetAdjusted } from "@/lib/utils";
import { uniqueByValue } from "@/lib/utils/array";

export default {
  props: {
    routeType: String, // "tv-shows" or "talks"
    tag: String,
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
    tags() {
      let tags = [];
      if (this.shows?.length > 0) {
        let allTags = [];
        for (let show of this.filteredShowsByAudiobook) {
          allTags = allTags.concat(show.tags);
        }
        allTags = allTags
          .filter((tag) => tag && !tag.startsWith("yt:"))
          .sort((a, b) =>
            typeof b === "string" ? b.localeCompare(a, this.$l2.code) : 0
          );
        for (let tag of allTags) {
          let foundTag = tags.find((t) => t.tag === tag);
          if (foundTag) foundTag.count++;
          else tags.push({ tag, count: 1 });
        }
        return tags
          .sort((a, b) => b.count - a.count)
          .filter((t) => t.count > 1);
      }
    },
    filteredShowsByAudiobook() {
      let shows = this.shows;
      if (this.routeType === "audiobooks") {
        shows = shows.filter((s) => s.audiobook);
      } else {
        shows = shows.filter((s) => !s.audiobook);
      }
      return shows;
    },
    filterShowsMadeForKids() {
      return this.filteredShowsByAudiobook.filter((s) => s.made_for_kids || (s.tags || []).includes('kids'));
    },
    filteredShows() {
      if (this.shows) {
        let shows = this.filteredShowsByAudiobook;
        if (this.tag) {
          if (this.tag === "kids")
            shows = this.filterShowsMadeForKids
          else
            shows = shows.filter((s) => (s.tags || []).includes(this.tag));
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
  watch: {
    keyword() {
      let filterElement = this.$refs.filter?.$el;
      if (filterElement) scrollToTargetAdjusted(filterElement, 60);
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
      if (response.data && response.data.data.length > 1) {
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
          if (
            this.routeType === "talks" &&
            (["News"].includes(s.title) || s.audiobook)
          )
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

.tags {
  line-height: 1;
}

.tag {
  padding: 0 0.25rem 0 0.25rem;
  color: #ccc !important;
}

.tag.nuxt-link-exact-active {
  color: rgba(40, 167, 69) !important;
}
.tag:not(.nuxt-link-exact-active):hover {
  color: rgba(40, 167, 69);
}
</style>