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
  <div class="main-dark">
    <VideoHero
      v-if="heroVideo"
      :video="heroVideo"
      @videoUnavailable="onVideoUnavailable"
    />
    <div class="youtube-browse container pb-5">
      <SocialHead
        :title="`Study ${$l2.name} videos with subs | Language Player`"
        :description="`Watch ${$l2.name} videos and study the ${
          $l2.code === 'zh' ? 'Pinyin' : $l2.name
        } subtitles.`"
      />
      <div class="row mb-2" v-if="!kidsOnly">
        <div class="col-sm-12 text-center mb-4">
          <span
            v-if="Object.keys(categories).length > 0"
            @click="showModal('categories')"
            class="filter-dropdown mr-2"
          >
            {{
              category && categories[category]
                ? categories[category]
                : "All Categories"
            }}
            <i class="fa-solid fa-caret-down"></i>
          </span>
          <span
            v-if="
              LANGS_WITH_LEVELS.includes($l2.code) &&
              levels &&
              levels.length > 0
            "
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
        </div>
      </div>
      <h5 v-if="$refs['tv-shows'] && $refs['tv-shows'].filteredShows && $refs['tv-shows'].filteredShows.length > 0">TV Shows</h5>
      <hr class="mb-4" />
      <Shows
        v-if="!(category === 'all' && level === 'all' && kidsOnly === false)"
        v-bind="{
          kidsOnly,
          category,
          level,
          showFilter: false,
          showHero: false,
          routeType: 'tv-shows',
          tag: 'all'
        }"
        ref="tv-shows"
      />
      <h5 v-if="$refs['talks'] && $refs['talks'].filteredShows && $refs['talks'].filteredShows.length > 0">YouTube Channels</h5>
      <hr class="mb-4" />
      <Shows
        v-if="!(category === 'all' && level === 'all' && kidsOnly === false)"
        v-bind="{
          kidsOnly,
          category,
          level,
          showFilter: false,
          showHero: false,
          routeType: 'talks',
          tag: 'all'
        }"
        ref="talks"
      />
      <h5 v-if="$refs['videos'] && $refs['videos'].videos && $refs['videos'].videos.length > 0">Videos</h5>
      <hr class="mb-4" />
      <MediaSearchResults
        v-bind="{
          category,
          level,
          keyword,
          start,
          kidsOnly,
          showLatestIfKeywordMissing: true,
          showNoVideosMessage: true,
          showSearchBar: false,
        }"
        @videosLoaded="onVideosLoaded"
        ref="videos"
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
            :to="{
              name: 'youtube-browse',
              params: { category: 'all', level, start, keyword },
            }"
            class="link-unstyled"
          >
            All Categories
          </router-link>
        </div>
        <div
          v-for="(category, index) in categories"
          :key="`dropdown-menu-item-category-${index}`"
          class="mb-1 col-6 col-lg-4"
        >
          <router-link
            :to="{
              name: 'youtube-browse',
              params: { category: index, level, start, keyword },
            }"
            class="link-unstyled"
          >
            {{ category }}
          </router-link>
        </div>
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
              name: 'youtube-browse',
              params: { category, level: 'all' },
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
              name: 'youtube-browse',
              params: { category, level: level.numeric },
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
          </router-link>
        </div>
      </div>
    </b-modal>
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
      default: false
    }
  },
  computed: {
    ...mapState("shows", ["categories"]),
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
    heroVideo() {
      if (this.videos.length > 0)
        return this.videos[Math.floor(Math.random() * this.videos.length)];
    },
    levels() {
      let langLevels = languageLevels(this.$l2);
      return [1, 2, 3, 4, 5, 6, 7].map((l) => langLevels[l]);
    },
  },
  data() {
    return {
      videos: [],
      LANGS_WITH_LEVELS,
    };
  },
  methods: {
    showModal(name) {
      this.$refs[name + "Modal"]?.show();
    },
    onVideoUnavailable(youtube_id) {
      if (this.heroVideo.youtube_id === youtube_id) {
        this.videoUnavailable = true;
        this.videos = this.videos.filter(
          (v) => v.youtube_id !== this.heroVideo.youtube_id
        );
        this.loadHeroVideo();
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
  color: white;
  cursor: pointer;
}
</style>