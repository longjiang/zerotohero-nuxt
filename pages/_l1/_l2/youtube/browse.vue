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
            :key="'hero-video' + heroVideo.youtube_id"
            class="mb-5"
            @unavailable="onVideoUnavailable"
          />
        </div>
      </div>
      <!-- <div
        v-show="
          $refs['talks'] &&
          $refs['talks'].filteredShows &&
          $refs['talks'].filteredShows.length > 0
        "
        class="mb-5"
      >
        <h5>
          {{ $t("YouTube Channels") }}
        </h5>
        <hr />
        <Shows
          v-bind="{
            kidsOnly,
            category,
            level,
            showFilter: false,
            showHero: false,
            routeType: 'talks',
            tag: 'all',
            limit: 12,
          }"
          ref="talks"
        />
      </div>
      <div
        v-show="
          (category !== 'all' || level !== 'all' || kidsOnly) &&
          $refs['tv-shows'] &&
          $refs['tv-shows'].filteredShows &&
          $refs['tv-shows'].filteredShows.length > 0
        "
        class="mb-5"
      >
        <h5>
          {{ $t("TV Shows") }}
        </h5>
        <hr />
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
      </div> -->
      <!-- Add a search field -->

      <!-- <div class="row mb-4">
        <div class="col-sm-12">
          <ChannelList :channels="channels.filter(c => c.l2 === this.$l2.id)" />
        </div>
      </div> -->
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
        </div>
      </div>
      <!-- <b-form-input
        :lazy="true"
        :placeholder="$tb('Search')"
        class="mb-5"
        @keyup.enter="handleSearch"
        :value="keyword"
      /> -->
      <MediaSearchResults
        v-bind="{
          params: mediaSearchParams,
          noVideosMessage: 'No videos found meeting your filter criteria.',
          limit: 12,
          showSearchBar: false,
        }"
        @videosLoaded="onVideosLoaded"
        ref="videos"
        class="mt-3"
        :key="`${category}-${level}-${keyword}-${start}-${kidsOnly}-${sort}`"
      />
      <client-only>
        <NavPage
          :l1="$l1"
          :l2="$l2"
          class="youtube-browse-nav mt-5"
          :showOnly="['Listening']"
        />
      </client-only>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import { languageLevels, LANGS_WITH_LEVELS, maxDifficultyByLevel, minDifficultyByLevel } from "../../../../lib/utils";

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
  data() {
    return {
      videos: [],
      LANGS_WITH_LEVELS,
      sort: "-views",
      selectedHeroVideo: null,
      sortOptions: [
        { value: "-id", text: "Sort by Date Added" },
        { value: "-date", text: "Sort by Date Uploaded" },
        { value: "-views", text: "Sort by Views" },
        { value: "title", text: "Sort by Title" },
        { value: "difficulty", text: "Sort by Difficulty" },
      ],
    };
  },
  computed: {
    ...mapState("shows", ["categories"]),
    ...mapState("channels", ["channels"]),
    mediaSearchParams() {
      let params = {};

      params["filter[tv_show][null]"] = 1 // Exclude TV Shows
      if (this.category !== "all") {
        params["filter[category][eq]"] = this.category;
      }
      if (this.level !== "all") {
        params["filter[difficulty][between]"] = minDifficultyByLevel(this.level, this.$l2.code) + ',' + maxDifficultyByLevel(this.level, this.$l2.code);
      }
      if (this.keyword) {
        const words = this.keyword.split(" ");
        let titleKeywords = []
        for (const word of words) {
          if (word.startsWith("channel:")) {
            params["filter[channel_id][eq]="] = word.replace("channel:", "")
          } else if (word.startsWith("locale:")) {
            params["filter[locale][contains]="] = word.replace("locale:", "")
          } else {
            titleKeywords.push(word);
          }
        }
        params["filter[title][contains]"] = titleKeywords.join(' ');
      }
      if (this.kidsOnly) {
        params["filter[made_for_kids][eq]"] = 1;
      }
      if (this.category === 'all' && !this.keyword) {
        params["filter[category][nin]"] = 10 // Exclude music videos
        params["filter[type][neq]"] = "music" // Exclude music videos
      }
      if (this.sort && this.sort !== "-views") {
        params.sort = this.sort // The table is mostly already sorted by views, so we don't need to sort by views
      }
      params.start = this.start;
      return params;
    },
    heroVideo() {
      if (this.selectedHeroVideo === null && this.videos.length > 0) {
        this.selectedHeroVideo = this.videos[Math.floor(Math.random() * this.videos.length)];
      }
      return this.selectedHeroVideo;
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
  watch: {
    sort() {
      this.$refs["sortModal"]?.hide();
    },
  },
  methods: {
    filterChannel(channels) {
      return channels.filter(channel => channel.l2 === this.$l2.code);
    },
    handleSearch($event) {
      this.$router.push({
        name: "l1-l2-youtube-browse",
        params: {
          category: this.category,
          level: this.level,
          start: this.start,
          keyword: $event.target.value || null,
          kidsOnly: this.kidsOnly,
        },
      });
    },
    handleCategoryFilter(value) {
      this.$router.push({
        name: "l1-l2-youtube-browse",
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
        name: "l1-l2-youtube-browse",
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
