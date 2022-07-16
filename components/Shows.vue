<template>
  <div>
    <VideoHero
      v-if="showHero && featureEpisode"
      :video="featureEpisode"
      @videoUnavailable="onVideoUnavailable"
    />
    <div>
      <div>
        <SocialHead
          v-if="shows && shows[0]"
          :title="`Learn ${$l2.name} with ${routeTitles[routeType]} | Language Player`"
          :description="`Learn ${$l2.name} with ${routeTitles[routeType]}.`"
          :image="
            routeType === 'tv-shows' && $l2.code === 'zh'
              ? '/img/tv-shows.jpg'
              : `https://img.youtube.com/vi/${shows[0].youtube_id}/hqdefault.jpg`
          "
        />
        <div class="row" v-if="showFilter">
          <div class="col-sm-12">
            <b-input-group class="mb-3 mt-3 input-group-ghost-dark">
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
          </div>
        </div>
        <div class="row mb-3" v-if="showFilter">
          <div class="col-sm-12">
            <div class="tags mb-3" v-if="tags">
              <b
                style="
                  margin-left: 0.25rem;
                  position: relative;
                  bottom: -0.1rem;
                  color: #888;
                "
              >
                By tags:
              </b>
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
                v-if="
                  filterShowsMadeForKids && filterShowsMadeForKids.length > 0
                "
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
            <div class="tags mt-3 mb-3" v-if="levels">
              <b
                style="
                  margin-left: 0.25rem;
                  position: relative;
                  bottom: -0.1rem;
                  color: #888;
                "
              >
                By level:
              </b>
              <router-link
                :key="`tag-all`"
                :class="{ 'btn btn-sm tag text-white bg-black': true }"
                :to="{ name: routeType, params: { tag } }"
              >
                All
                <small style="color: #888">
                  ({{ filteredShowsByAudiobookAndTags.length }})
                </small>
              </router-link>
              <router-link
                :class="{ 'btn btn-sm tag text-white bg-black': true }"
                :to="{
                  name: routeType,
                  params: { tag: tag || 'all', level: level.numeric },
                }"
                v-for="(level, index) in levels"
                :key="`filter-level-${level}-${index}`"
              >
                {{
                  index === 0
                    ? level.name
                    : level.exam === "CEFR"
                    ? level.level
                    : level.name
                }}
                <small style="color: #888">
                  ({{ showCountByLevel(level.numeric) }})
                </small>
              </router-link>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-sm-12">
            <!-- <Sale class="mt-5 mb-5" v-if="$l2.code === 'zh'" /> -->
            <div class="show-list-wrapper">
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
              <div
                v-if="keyword && filteredShows && filteredShows.length === 0 && showExtraSearchResults"
              >
                <MediaSearchResults :keyword="keyword" />
                <YouTubeSearchResults
                  :term="keyword"
                  :infinite="true"
                  :showProgress="false"
                  skin="dark"
                  ref="youtubeSearchResults"
                  :cloakVideosWithoutSubs="!$adminMode"
                />
              </div>
              <LazyIdenticalLanguages class="mt-3" :routeName="routeType" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { tify } from "chinese-conv";
import { scrollToTargetAdjusted } from "@/lib/utils";
import { unique } from "@/lib/utils";
import { languageLevels } from "@/lib/utils";

export default {
  props: {
    routeType: String, // "tv-shows" or "talks"
    tag: String,
    level: String,
    showHero: {
      type: Boolean,
      default: true,
    },
    showFilter: {
      type: Boolean,
      default: true,
    },
    initialKeyword: {
      type: String,
      default: ''
    },
    showExtraSearchResults: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      type: {
        "tv-shows": "tvShows",
        talks: "talks",
        audiobooks: "talks",
      }[this.routeType],
      shows: undefined,
      keyword: this.initialKeyword,
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
    levels() {
      if (this.filteredShowsByAudiobookAndTags?.length > 0) {
        let langLevels = languageLevels(this.$l2);
        let levels = this.filteredShowsByAudiobookAndTags
          .map((s) => s.level)
          .filter((l) => l);
        levels = unique(levels);
        levels = levels.sort((a, b) => a - b);
        return levels.map((l) => langLevels[l]);
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
    filteredShowsByAudiobookAndTags() {
      if (this.shows) {
        let shows = this.filteredShowsByAudiobook;
        if (this.tag && this.tag !== "all") {
          if (this.tag === "kids") shows = this.filterShowsMadeForKids;
          else shows = shows.filter((s) => (s.tags || []).includes(this.tag));
        }
        return shows;
      }
    },
    filterShowsMadeForKids() {
      return this.filteredShowsByAudiobook.filter(
        (s) => s.made_for_kids || (s.tags || []).includes("kids")
      );
    },
    filteredShows() {
      if (this.shows) {
        let shows = this.filteredShowsByAudiobookAndTags;
        if (this.level && this.level !== "all") {
          shows = shows.filter((s) => s.level == this.level);
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
    showCountByLevel(level) {
      return this.filteredShowsByAudiobookAndTags?.filter(
        (s) => s.level == level
      ).length;
    },
    onVideoUnavailable(youtube_id) {
      if (youtube_id === this.featureEpisode.youtube_id)
        this.loadFeatureShowAndEpisode();
    },
    async getShowsOverNetwork() {
      let langId = this.$l2.id;
      let type = this.routeType.replace("-", "_");
      let path = `items/${type}?filter[l2][eq]=${langId}&fields=id,title`;
      let response = await this.$directus.get(path);
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
      if (!show) return;
      let sort = "-date";
      if (show.audiobook || showType === "tv_show") {
        sort = "title";
      }
      let query = `filter[${showType}][eq]=${show.id}&limit=1&fields=youtube_id,id,l2,tv_show,talk,title&sort=${sort}`;
      let videos = await this.$directus.getVideos({ l2Id, query });
      let firstEpisode = videos[0];
      return firstEpisode;
    },
    getRandomShow() {
      if (this.filteredShows) {
        let shows = this.filteredShows;
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