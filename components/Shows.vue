<template>
  <div>
    <!-- <VideoHero
      v-if="showHero && featureEpisode"
      :video="featureEpisode"
      @videoUnavailable="onVideoUnavailable"
    /> -->
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
        <div class="row mt-3 mb-2" v-if="showFilter">
          <div class="col-sm-12 text-center mb-4">
            <span
              v-if="Object.keys(categoriesFiltered).length > 0"
              @click="showModal('categories')"
              class="filter-dropdown mr-2"
            >
              {{
                category && categoriesFiltered[category]
                  ? categoriesFiltered[category]
                  : "All Categories"
              }}
              <i class="fa-solid fa-caret-down"></i>
            </span>
            <span
              v-if="levels && levels.length > 0"
              @click="showModal('levels')"
              class="filter-dropdown mr-2"
            >
              {{
                level && levels.find((l) => l.numeric === level)
                  ? levels.find((l) => l.numeric === level).name
                  : "All Levels"
              }}
              <i class="fa-solid fa-caret-down"></i>
            </span>
            <span @click="showModal('sort')" class="filter-dropdown">
              Sort by {{ sort }}
              <i class="fa-solid fa-caret-down"></i>
            </span>
            <div
              v-if="sort === 'recommended'"
              style="font-weight: normal; font-size: 0.8em; margin-top: 0.5rem"
            >
              Recommendations based on your
              <router-link
                :to="{
                  name: LANGS_WITH_LEVELS.includes(this.$l2.code)
                    ? 'set-language-level'
                    : 'set-content-preferences',
                }"
              >
                <u>content preferences</u>
              </router-link>
            </div>
          </div>
        </div>
        <div class="row" v-if="showFilter">
          <div class="col-sm-12">
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
          </div>
        </div>
        <div class="row">
          <div class="col-sm-12">
            <!-- <Sale class="mt-5 mb-5" v-if="$l2.code === 'zh'" /> -->
            <div class="show-list-wrapper">
              <template v-if="showLoader">
                <div
                  :class="{
                    'loader text-center': true,
                    'd-none': shows,
                  }"
                  style="flex: 1"
                >
                  <Loader :sticky="true" message="Getting shows..." />
                </div>
                <div
                  class="text-center"
                  v-if="filteredShows && filteredShows.length === 0"
                >
                  No
                  {{ routeTitles[routeType] }}
                  found.
                  <div>
                    <router-link
                      :to="{ name: routeType, params: {} }"
                      class="btn btn-success mt-3"
                    >
                      <i class="fa-solid fa-arrows-rotate"></i>
                      Reset filters
                    </router-link>
                  </div>
                </div>
              </template>
              <ShowList
                v-if="shows && shows.length > 0"
                :shows="filteredShows"
                :type="type"
                :key="`shows-filtered-${this.keyword}`"
              />
              <div
                v-if="
                  keyword &&
                  filteredShows &&
                  filteredShows.length === 0 &&
                  showExtraSearchResults
                "
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
            </div>
          </div>
        </div>
      </div>
    </div>
    <b-modal
      ref="categoriesModal"
      size="lg"
      centered
      hide-footer
      modal-class="safe-padding-top mt-4"
      body-class="dropdown-menu-modal-wrapper"
      title="Categories"
    >
      <div class="row">
        <div class="mb-1 col-6 col-lg-4">
          <router-link
            :to="{ name: routeType, params: { category: 'all', tag, level } }"
            class="link-unstyled"
          >
            All Categories
          </router-link>
        </div>
        <div
          v-for="(category, index) in categoriesFiltered"
          :key="`dropdown-menu-item-category-${index}`"
          class="mb-1 col-6 col-lg-4"
        >
          <router-link
            :to="{ name: routeType, params: { category: index, tag, level } }"
            class="link-unstyled"
          >
            {{ category }}
          </router-link>
        </div>
      </div>
    </b-modal>
    <b-modal
      ref="sortModal"
      size="sm"
      centered
      hide-footer
      modal-class="safe-padding-top mt-4"
      body-class="dropdown-menu-modal-wrapper"
      title="Sort"
    >
      <div class="row">
        <div
          class="mb-1 col-12"
          @click="sort = 'recommended'"
          style="cursor: pointer"
        >
          Sort by Recommended
        </div>
        <div
          class="mb-1 col-12"
          @click="sort = 'views'"
          style="cursor: pointer"
        >
          Sort by Views
        </div>
        <div
          class="mb-1 col-12"
          @click="sort = 'title'"
          style="cursor: pointer"
        >
          Sort by Title
        </div>
        <!-- <div class="mb-1 col-12" @click="sort = 'date'">Sort by Date</div> -->
      </div>
    </b-modal>
    <b-modal
      ref="levelsModal"
      size="lg"
      centered
      hide-footer
      modal-class="safe-padding-top mt-4"
      body-class="dropdown-menu-modal-wrapper"
      title="Levels"
    >
      <div class="row">
        <div class="mb-1 col-6 col-lg-4">
          <router-link
            :to="{
              name: routeType,
              params: { category, tag, level: 'all' },
            }"
            class="link-unstyled"
          >
            All Levels
          </router-link>
        </div>
        <div
          v-for="(level, index) in levels"
          :key="`dropdown-menu-item-level-${index}`"
          class="mb-1 col-6 col-lg-4"
        >
          <router-link
            :to="{
              name: routeType,
              params: { category, tag, level: level.numeric },
            }"
            class="link-unstyled"
          >
            {{
              index === 0
                ? level.name
                : level.exam === "CEFR"
                ? level.level
                : level.name
            }}
            <span class="item-count">
              ({{ showCountByLevel(level.numeric) }} shows)
            </span>
          </router-link>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
import { tify } from "chinese-conv";
import { scrollToTargetAdjusted } from "@/lib/utils";
import { unique } from "@/lib/utils";
import { languageLevels, LANGS_WITH_LEVELS } from "@/lib/utils";
import { CATEGORIES } from "@/lib/youtube";
import { mapState } from "vuex";

export default {
  props: {
    routeType: String, // "tv-shows" or "talks"
    category: {
      type: String,
      default: "all",
    },
    tag: {
      type: String,
      default: "all",
    },
    level: {
      type: String,
      default: "all",
    },
    kidsOnly: {
      type: Boolean,
      default: false,
    },
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
      default: "",
    },
    showExtraSearchResults: {
      type: Boolean,
      default: false,
    },
    showLoader: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      sort: "recommended", // or 'views', 'title'
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
      LANGS_WITH_LEVELS,
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
    ...mapState("progress", ["progress"]),
    ...mapState("settings", ["preferredCategories"]),
    languageLevel() {
      if (
        this.progress &&
        this.progress[this.$l2.code] &&
        this.progress[this.$l2.code].level
      )
        return this.progress[this.$l2.code].level;
    },
    categoriesFiltered() {
      if (!this.shows) return {};
      let categories = {};
      let ids = this.filteredShowsByAudiobook
        .map((show) => show.category)
        .filter((c) => c);
      for (let id in CATEGORIES) {
        if (ids.includes(Number(id))) categories[id] = CATEGORIES[id];
      }
      return categories;
    },
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
      shows = shows.filter(
        (show) => !["News", "Music", "Movies"].includes(show.title)
      );
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
        if (this.category && this.category !== "all") {
          shows = shows.filter((s) => s.category === Number(this.category));
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
          shows = shows.filter((s) => {
            let title = this.$l2.han ? tify(s.title) : s.title;
            return title.toLowerCase().includes(k.toLowerCase());
          });
        }
        if (this.kidsOnly) shows = shows.filter((s) => s.made_for_kids);
        // shows = shows.sort((x, y) => {
        //   x = this.preferredCategories.includes(String(x.category));
        //   y = this.preferredCategories.includes(String(y.category));
        //   return x === y ? 0 : x ? -1 : 1;
        // });
        return shows;
      }
    },
  },
  watch: {
    keyword() {
      let filterElement = this.$refs.filter?.$el;
      if (filterElement) scrollToTargetAdjusted(filterElement, 60);
    },
    sort() {
      this.sortShows(this.shows);
      this.$refs["sortModal"]?.hide();
    },
  },
  methods: {
    showModal(name) {
      this.$refs[name + "Modal"]?.show();
    },
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
      shows = shows.sort((x, y) => y.avg_views - x.avg_views);
      if (this.sort === "title")
        shows = shows.sort((x, y) =>
          x.title.localeCompare(y.title, this.$l2.locales[0])
        );
      // if (this.sort === "date")
      //   shows = shows.sort((x, y) => y.date - x.date);
      if (this.sort === "recommended") {
        shows = shows
          .sort((x, y) => {
            x = String(x.level) === this.languageLevel;
            y = String(y.level) === this.languageLevel;
            return x === y ? 0 : x ? -1 : 1;
          })
          .sort((x, y) => {
            x = this.preferredCategories.includes(String(x.category));
            y = this.preferredCategories.includes(String(y.category));
            return x === y ? 0 : x ? -1 : 1;
          });
      }
      return shows || [];
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
.filter-dropdown {
  color: white;
  font-size: 0.9em;
  cursor: pointer;
}
:deep(.synced-transcript) {
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

.item-count {
  font-size: 0.8rem;
  color: #888;
  font-weight: bold;
}
</style>