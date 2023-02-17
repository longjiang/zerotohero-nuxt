<router>
  {
    path: '/:l1/:l2/all-media',
    props: true,
    meta: {
      skin: 'dark'
    }
  }
</router>
<template>
  <div class="main-dark">
    <div class="container pb-5">
      <!-- <div class="row mb-3">
          <div class="col-sm-12">
            <b-form-input
              v-model="term"
              @compositionend.prevent.stop="() => false"
              @keyup.enter="
                $router.push({
                  name: 'youtube-search',
                  params: { term: term.trim() },
                })
              "
              placeholder="Search"
              class="input-ghost-dark"
            />
          </div>
        </div> -->
      <div
        :class="{
          'loader text-center': true,
          'd-none': showsLoaded,
        }"
        style="margin: 3rem 0 3rem 0"
      >
        <Loader :sticky="true" message="Loading categories..." />
      </div>
      <div
        class="row mt-3"
        style="padding-left: 0.75rem; padding-right: 0.75rem"
        v-if="categories && Object.keys(categories).length > 0"
      >
        <div
          v-for="(category, index) in categories"
          :key="`level-btn-category-${index}`"
          class="col-6 col-md-4 col-lg-3 category-btn-wrapper"
        >
          <router-link
            :style="`border: none;  background: linear-gradient(#00000077, #00000077), url(/img/categories/bg-category-${index}.jpg); background-size: cover; background-position: center center; padding-top: 2.5rem; padding-bottom: 0.5rem;`"
            :to="{
              name: 'youtube-browse',
              params: { category: index, level: 'all' },
            }"
            class="link-unstyled category-btn"
          >
            {{ $t(category) }}
          </router-link>
        </div>
      </div>
      <div
        class="row mt-3"
        style="padding-left: 0.75rem; padding-right: 0.75rem"
        v-if="
          LANGS_WITH_LEVELS.includes($l2.code) && levels && levels.length > 0
        "
      >
        <div
          v-for="(level, index) in levels"
          :key="`level-btn-level-${index}`"
          class="col-6 col-md-4 col-lg-3 category-btn-wrapper"
        >
          <router-link
            :data-bg-level="level.level"
            style="
              border: none;
              background: linear-gradient(#00000077, #00000077);
            "
            :to="{
              name: 'youtube-browse',
              params: { category: 'all', level: level.numeric },
            }"
            class="link-unstyled category-btn"
          >
            {{ $t(level.category) }} ({{
              $t(level.name.replace("CEFR ", "").replace("Pre", "Pre-"))
            }})
          </router-link>
        </div>
      </div>
      <div class="row mt-3" style="padding-left: 0.75rem; padding-right: 0.75rem">
        <!-- <div class="col-6 col-md-4 col-lg-3 category-btn-wrapper">
            <b-button
              variant="unstyled"
              class="category-btn text-left"
              @click="all = true"
            >
              <i class="fa-regular fa-grid-2 mr-1"></i>
              All
            </b-button>
          </div> -->
        <div class="col-6 col-md-4 col-lg-3 category-btn-wrapper">
          <router-link
            class="link-unstyled category-btn text-left"
            :to="{ name: 'watch-history' }"
          >
            <i class="fa-regular fa-history mr-1"></i>
            {{ $t('Watch History') }}
          </router-link>
        </div>
        <div
          class="col-6 col-md-4 col-lg-3 category-btn-wrapper"
          v-if="talks && talks.length > 0"
        >
          <router-link
            class="link-unstyled category-btn text-left"
            :to="{ name: 'talks' }"
          >
            <i class="fab fa-youtube mr-1"></i>
            {{ $t('YouTube Channels') }}
          </router-link>
        </div>
        <div
          class="col-6 col-md-4 col-lg-3 category-btn-wrapper"
          v-if="tvShows && tvShows.length > 0"
        >
          <router-link
            class="link-unstyled category-btn text-left"
            :to="{ name: 'tv-shows' }"
          >
            <i class="fa-regular fa-tv mr-1"></i>
            {{ $t('TV Shows') }}
          </router-link>
        </div>
        <div class="col-6 col-md-4 col-lg-3 category-btn-wrapper">
          <router-link
            class="link-unstyled category-btn text-left"
            :to="{ name: 'live-tv' }"
          >
            <i class="fa-regular fa-tv-retro mr-1"></i>
            {{ $t('Live TV') }}
          </router-link>
        </div>
        <div
          class="col-6 col-md-4 col-lg-3 category-btn-wrapper"
          v-if="moviesShow"
        >
          <router-link
            class="link-unstyled category-btn text-left"
            :to="{
              name: 'show',
              params: { type: 'tv-show', id: moviesShow.id },
            }"
          >
            <i class="fa-regular fa-film mr-1"></i>
            {{ $t('Movies') }}
          </router-link>
        </div>
        <div
          class="col-6 col-md-4 col-lg-3 category-btn-wrapper"
          v-if="musicShow"
        >
          <router-link
            class="link-unstyled category-btn text-left"
            :to="{
              name: 'show',
              params: { type: 'tv-show', id: musicShow.id },
            }"
          >
            <i class="fa-solid fa-music mr-1"></i>
            {{ $t('Music') }}
          </router-link>
        </div>
        <div
          class="col-6 col-md-4 col-lg-3 category-btn-wrapper"
          v-if="newsShow"
        >
          <router-link
            class="link-unstyled category-btn text-left"
            :to="{
              name: 'show',
              params: { type: 'talk', id: newsShow.id },
            }"
          >
            <i class="fa-solid fa-newspaper mr-1"></i>
            {{ $t('News') }}
          </router-link>
        </div>
        <div
          class="col-6 col-md-4 col-lg-3 category-btn-wrapper"
          v-if="musicShow"
        >
          <router-link
            class="link-unstyled category-btn text-left"
            :to="{
              name: 'audiobooks',
            }"
          >
            <i class="fa-solid fa-book-open mr-1"></i>
            {{ $t('Audiobooks') }}
          </router-link>
        </div>
        <div
          class="col-6 col-md-4 col-lg-3 category-btn-wrapper"
        >
          <router-link
            class="link-unstyled category-btn text-left"
            :to="{
              name: 'youtube-browse',
              params: { kidsOnly: true, category: 'all', level: 'all' },
            }"
          >
            <i class="fa-solid fa-baby mr-1"></i>
            {{ $t('Kids') }}
          </router-link>
        </div>
        <div
          class="col-6 col-md-4 col-lg-3 category-btn-wrapper"
        >
          <router-link
            class="link-unstyled category-btn text-left"
            :to="{
              name: 'explore-media',
            }"
          >
            <i class="fa-solid fa-telescope mr-1"></i>
            {{ $t('Recommended') }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { languageLevels, LANGS_WITH_LEVELS } from "@/lib/utils";
export default {
  mounted() {
    if (this.$store.state.shows.showsLoaded[this.$l2.code]) this.loadShows();
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type.startsWith("shows")) {
        this.loadShows();
      }
    });
  },
  data() {
    return {
      talks: undefined,
      tvShows: undefined,
      musicShow: undefined,
      moviesShow: undefined,
      newsShow: undefined,
      showsLoaded: false,
      LANGS_WITH_LEVELS,
    };
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
    levels() {
      let langLevels = languageLevels(this.$l2);
      return [1, 2, 3, 4, 5, 6, 7].map((l) => langLevels[l]);
    },
  },
  methods: {
    async loadShows() {
      if (this.showsLoaded) return;
      else this.showsLoaded = true;

      let tvShows = this.$store.state.shows.tvShows[this.$l2.code];
      let talks = this.$store.state.shows.talks[this.$l2.code];
      if (tvShows) {
        this.tvShows = tvShows.sort((x, y) => y.avg_views - x.avg_views) || [];
        this.musicShow = this.$store.state.shows.tvShows[this.$l2.code].find(
          (s) => s.title === "Music"
        );
        this.moviesShow = this.$store.state.shows.tvShows[this.$l2.code].find(
          (s) => s.title === "Movies"
        );
      }
      if (talks) {
        this.talks = talks.sort((x, y) => y.avg_views - x.avg_views) || [];
        this.newsShow = this.$store.state.shows.talks[this.$l2.code].find(
          (s) => s.title === "News"
        );
      }
      this.loading = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.category-btn-wrapper {
  padding: 0.25rem;
}

.category-btn {
  color: white;
  padding: 0.5rem 1rem;
  border: 1px solid #666;
  border-radius: 0.25rem;
  font-size: 0.8rem;
  width: 100%;
  height: 100%;
  display: block;
  text-align: left;
  text-shadow: 0 0 6px #000000;
}

@media screen and (min-width: 480px) {
  .category-btn {
    font-size: 1rem;
    padding: 1rem;
  }
}
</style>