<router>
  {
    path: '/:l1/:l2/youtube/browse/:category?/:level?/:start?/:keyword?',
    props: true,
    meta: {
      skin: 'dark'
    }
  }
</router>
<template>
  <div :class="`youtube-browse skin-${$skin}`">
    <div class="youtube-browse container pb-5">
      <SocialHead
        :title="`Study ${$l2.name} videos with subs | Language Player`"
        :description="`Watch ${$l2.name} videos and study the ${
          $l2.code === 'zh' ? 'Pinyin' : $l2.name
        } subtitles.`"
      />
      <div class="row">
        <div class="col-sm-12">
          <VideoHero
            v-if="heroVideo"
            :video="heroVideo"
            @videoUnavailable="onVideoUnavailable"
            class="mb-5"
          />
        </div>
      </div>
      <div class="row mb-4">
        <div class="col-sm-12 text-center">
          <div v-show="kidsOnly" class="mb-2">
            {{ $t("Only showing content made for kids.") }}
            <router-link
              :to="{
                name: 'youtube-browse',
                params: { category: 'all', level: 'all', start: 0 },
              }"
              >{{ $t("Clear") }}</router-link
            >
          </div>
          <div>
            <FilterDropdown
              v-if="categoryOptions.length > 0"
              :items="categoryOptions"
              :selected-item="category"
              type="categories"
              title="Categories"
              default-text="All Categories"
              @filter="handleCategoryFilter"
            />
            <FilterDropdown
              v-if="
                LANGS_WITH_LEVELS.includes($l2.code) && levelOptions.length > 0
              "
              :items="levelOptions"
              :selected-item="level"
              type="levels"
              title="Levels"
              default-text="All Levels"
              @filter="handleLevelFilter"
            />
            <FilterDropdown
              v-if="sortOptions.length > 0"
              :items="sortOptions"
              :selected-item="sort"
              type="sort"
              title="Sort"
              default-text="Sort"
              @filter="handleSortFilter"
            />
          </div>
          <i18n
            path="Recommendations based on your {0}."
            tag="div"
            style="font-weight: normal; font-size: 0.8em; text-align: center"
            v-if="sort === 'recommended'"
          >
            <router-link
              :to="{
                name: LANGS_WITH_LEVELS.includes(this.$l2.code)
                  ? 'set-language-level'
                  : 'set-content-preferences',
              }"
            >
              <u>{{ $t("content preferences") }}</u>
            </router-link>
          </i18n>
        </div>
      </div>
      <div
        v-if="
          $refs['tv-shows'] &&
          $refs['tv-shows'].filteredShows &&
          $refs['tv-shows'].filteredShows.length > 0
        "
      >
        <h5>
          {{ $t("TV Shows") }}
        </h5>
        <hr class="mb-5" />
      </div>
      <div
        v-if="!(category === 'all' && level === 'all' && kidsOnly === false)"
      >
        <Shows
          v-bind="{
            kidsOnly,
            category,
            level,
            showFilter: false,
            showHero: false,
            routeType: 'tv-shows',
            tag: 'all',
          }"
          ref="tv-shows"
        />
      </div>
      <div>
        <h5>
          {{ $t("Videos") }}
        </h5>
        <hr class="mb-4" />
      </div>
      <MediaSearchResults
        v-bind="{
          category,
          level,
          keyword,
          start,
          kidsOnly,
          sort,
          showLatestIfKeywordMissing: true,
          includeTVShows: true,
          showNoVideosMessage: true,
          perPage: 12,
          showSearchBar: false,
        }"
        @videosLoaded="onVideosLoaded"
        ref="videos"
        class="mt-3"
      />
      <client-only>
        <Nav
          :l1="$l1"
          :l2="$l2"
          variant="page"
          class="youtube-browse-nav mt-5"
          :showOnly="['Listening']"
        />
      </client-only>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { languageLevels, LANGS_WITH_LEVELS } from "@/lib/utils";

export default {
  props: {
    category: {
      default: "all",
    },
    level: {
      default: "all",
    },
    keyword: {
      type: String,
    },
    start: {
      default: 0,
    },
    kidsOnly: {
      default: false,
    },
  },
  computed: {
    ...mapState("shows", ["categories"]),
    heroVideo() {
      if (this.videos.length > 0)
        return this.videos[Math.floor(Math.random() * this.videos.length)];
    },
    levels() {
      let langLevels = languageLevels(this.$l2);
      return [1, 2, 3, 4, 5, 6, 7].map((l) => langLevels[l]);
    },
    categoryOptions() {
      let items = [{ value: "all", text: this.$t("All Categories") }];
      if (this.categories) {
        const moreItems = Object.entries(this.categories).map(
          ([value, text]) => ({
            text,
            value,
          })
        );
        items = items.concat(moreItems);
      }
      return items;
    },
    levelOptions() {
      let items = [{ value: "all", text: this.$t("All Levels") }];
      if (this.levels) {
        let moreItems = this.levels.map((level) => ({
          text: level.name,
          value: level.numeric,
        }));
        items = items.concat(moreItems);
      }
      return items;
    },
  },
  data() {
    return {
      videos: [],
      LANGS_WITH_LEVELS,
      sort: "recommended",
      sortOptions: [
        { value: "recommended", text: "Sort by Recommended" },
        { value: "id", text: "Sort by Date Added" },
        { value: "date", text: "Sort by Date Uploaded" },
        { value: "views", text: "Sort by Views" },
        { value: "title", text: "Sort by Title" },
      ],
    };
  },
  watch: {
    sort() {
      this.$refs["sortModal"]?.hide();
    },
  },
  methods: {
    handleCategoryFilter(value) {
      this.$router.push({
        name: "youtube-browse",
        params: {
          category: value,
          level: this.level,
          start: this.start,
          keyword: this.keyword,
          kidsOnly: this.kidsOnly,
        },
      });
    },
    handleLevelFilter(value) {
      this.$router.push({
        name: "youtube-browse",
        params: {
          category: this.category,
          level: value,
          start: this.start,
          keyword: this.keyword,
          kidsOnly: this.kidsOnly,
        },
      });
    },
    handleSortFilter(value) {
      this.sort = value;
    },
    showModal(name) {
      this.$refs[name + "Modal"]?.show();
    },
    onVideoUnavailable(youtube_id) {
      if (this.heroVideo.youtube_id === youtube_id) {
        this.videoUnavailable = true;
        this.videos = this.videos.filter(
          (v) => v.youtube_id !== this.heroVideo.youtube_id
        );
      }
    },
    onVideosLoaded(videos) {
      this.videos = videos || [];
    },
  },
};
</script>
<style lang="scss" scoped>
.filter-dropdown {
  cursor: pointer;
}

.youtube-browse.skin-dark {
  color: white;
}
</style>
