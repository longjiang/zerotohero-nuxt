<template>
  <span>
    <b-button
      @click="showModal"
      variant="unstyled"
      style="
        padding: 0;
        padding-bottom: 0.2em;
        font-weight: bold;
      "
    >
      {{ title }}
      <i class="fa fa-caret-down"></i>
    </b-button>
    <b-modal
      ref="show-filter-modal"
      centered
      hide-footer
      :title="$t('Search in...')"
      body-class="show-filter-modal"
      modal-class="safe-padding-top mt-4"
      @hide="onModalHide"
    >
      <b-form-checkbox v-model="allVideosChecked">
        <i class="fa fa-play"></i>
        <b>{{ $t('All Videos') }}</b>
      </b-form-checkbox>
      <template v-if="!allVideosChecked">
        <template>
          <hr />
          <b-form-checkbox v-model="allCategoriesChecked" :class="{ 'mb-2': !allCategoriesChecked }">
            <i class="fa fa-tags"></i>
            <b>{{ $t('All Categories') }}</b>
            <a
              class="ml-2 quick-link"
              @click.stop.prevent="categoriesChecked.length > 0 ? uncheckAll('categories') : checkAll('categories')"
            >
              {{ categoriesChecked.length > 0 ? $t('Uncheck All') : $t('Check All') }}
            </a>
          </b-form-checkbox>
          <template v-if="!allCategoriesChecked">
            <b-form-checkbox-group id="categories-checkbox-group" v-model="categoriesChecked" >
              <b-form-checkbox
                v-for="category of filteredCategories"
                :key="`category-${category.id}`"
                :value="category.id"
                class="d-block mb-1"
              >
                <i :class="'fa ' + category.icon"></i>
                {{ $t(category.title) }}
              </b-form-checkbox>
            </b-form-checkbox-group>
          </template>
        </template>
        <template v-if="tvShows">
          <hr />
          <b-form-checkbox v-model="allTVShowsChecked" :class="{ 'mb-2': !allTVShowsChecked }">
            <i class="fa fa-tv"></i>
            <b>{{ $t('All TV Shows') }}</b>
            <a
              class="ml-2 quick-link"
              @click.stop.prevent="tvShowsChecked.length > 0 ? uncheckAll('tvShows') : checkAll('tvShows')"
            >
              {{ tvShowsChecked.length > 0 ? $t('Uncheck All') : $t('Check All') }}
            </a>
          </b-form-checkbox>
          <template v-if="!allTVShowsChecked">
            <b-form-checkbox-group id="tv-shows-checkbox-group" v-model="tvShowsChecked">
              <b-form-checkbox
                v-for="tvShow in tvShowsFiltered"
                :key="`tv-show-${tvShow.id}`"
                :value="tvShow.id"
                class="d-block mb-1"
              >
                <img
                  class="show-thumb"
                  :src="`https://img.youtube.com/vi/${tvShow.youtube_id}/hqdefault.jpg`"
                />
                {{ tvShow.title }}
              </b-form-checkbox>
            </b-form-checkbox-group>
          </template>
          <!-- Filter by Category -->
        </template>
      </template>
    </b-modal>
  </span>
</template>

<script>
import { timeout } from "../lib/utils";
import { CATEGORIES, CATEGORY_ICONS } from '../lib/youtube';

export default {
  data() {
    return {
      tvShows: undefined,
      allVideosChecked: false, // Whether the checkbox next to "All Videos" is checked
      allTVShowsChecked: false, // Whether the checkbox next to "All TV Shows" is checked
      allCategoriesChecked: false, // Whether the checkbox next to "All Categories" is checked
      tvShowFilter: "all",
      categoryFilter: "all",
      tvShowsChecked: [],
      categoriesChecked: [],
      watchersActivated: false
    };
  },
  computed: {
    tvShowsFiltered() {
      if (this.tvShows)
        return this.tvShows.filter(s => !["Movies", "Music"].includes(s.title));
    },
    filteredCategories() {
      // Construct an array of { id, title } objects from the CATEGORIES object
      const categoriesArray = Object.entries(CATEGORIES)
        .map(([id, title]) => ({ id: Number(id), title, icon: CATEGORY_ICONS[id]}))
        .filter(({ id }) => id < 30);
      return categoriesArray;
    },
    title() {
      let titles = [];
      if (this.allVideosChecked) titles.push(this.$t("All Videos"));
      else {
        if (this.allTVShowsChecked) titles.push(this.$t("All TV Shows"));
        else if (this.tvShowsChecked && this.tvShowsChecked.length > 0)
          titles.push(this.$t('{num} TV Show(s)', {num: this.tvShowsChecked.length}));
        if (this.musicChecked) titles.push(this.$t("Music"));
        if (this.moviesChecked) titles.push(this.$t("Movies"));
        if (this.newsChecked) titles.push(this.$t("News"));
        if (this.allCategoriesChecked) titles.push(this.$t("All Categories"));
        else if (this.categoriesChecked && this.categoriesChecked.length > 0)
          titles.push(this.$t('{num} Categories', {num: this.categoriesChecked.length}));
      }
      if (titles.length > 1) return titles[0] + this.$t(" & Other Videos");
      if (titles.length === 1) return titles[0];
      if (titles.length === 0) return this.$t("Videos");
    }
  },
  async mounted() {
    if (typeof this.$store.state.settings !== "undefined") {
      this.loadSettings();
    }
    this.unsubscribeSettings = this.$store.subscribe((mutation, state) => {
      if (mutation.type === "settings/LOAD_JSON_FROM_LOCAL") {
        this.loadSettings();
      }
    });
    this.loadShows();
    this.unsubscribeShows = this.$store.subscribe((mutation, state) => {
      if (mutation.type.startsWith("shows")) {
        this.loadShows();
      }
    });
    await timeout(1000)
    this.watchersActivated = true  // Do not activate watchers until after a second to avoid constanting updating settings and pushing to the server
  },
  beforeDestroy() {
    if (this.unsubscribeSettings) this.unsubscribeSettings();
    if (this.unsubscribeShows) this.unsubscribeShows();
  },
  watch: {
    allVideosChecked() {
      if (this.watchersActivated) this.updateSettings();
    },
    allTVShowsChecked() {
      if (this.watchersActivated) this.updateSettings();
    },
    allCategoriesChecked() {
      if (this.watchersActivated) this.updateSettings();
    },
    categoriesChecked() {
      if (this.watchersActivated) this.updateSettings();
    },
    tvShowsChecked() {
      if (this.watchersActivated) this.updateSettings();
    }
  },
  methods: {
    checkAll(type) {
      if (type === "tvShows") {
        this.tvShowsChecked = this.tvShows.map(s => Number(s.id));
      }
      if (type === "categories") {
        this.categoriesChecked = this.filteredCategories.map(({id, title}) => Number(id));
      }
    },
    uncheckAll(type) {
      if (type === "tvShows") {
        this.tvShowsChecked = [];
      }
      if (type === "categories") {
        this.categoriesChecked = [];
      }
    },
    onModalHide() {
      this.$emit("showFilter", {
        tvShowFilter: this.tvShowFilter,
        categoryFilter: this.categoryFilter
      });
    },
    loadSettings() {
      this.tvShowFilter = this.$l2Settings.tvShowFilter || 'all';
      this.categoryFilter = this.$l2Settings.categoryFilter || 'all';
      this.allVideosChecked =
        this.tvShowFilter === "all" && this.categoryFilter === "all";
      if (!this.allVideosChecked) {
        this.allTVShowsChecked = this.tvShowFilter === "all";
        this.allCategoriesChecked = this.categoryFilter === "all";
        if (!this.allTVShowsChecked) {
          this.tvShowsChecked = this.tvShowFilter;
        }
        if (!this.allCategoriesChecked) {
          this.categoriesChecked = this.categoryFilter;
        }
      }
    },
    updateSettings() {
      let tvShowFilter = this.getTvShowFilter();
      let categoryFilter = this.getCategoryFilter();
      this.tvShowFilter = tvShowFilter;
      this.categoryFilter = categoryFilter;
      console.log("Updating settings", tvShowFilter, categoryFilter);
      this.$store.dispatch("settings/setL2Settings", {
        tvShowFilter: this.tvShowFilter,
        categoryFilter: this.categoryFilter
      });
    },
    getTvShowFilter() {
      if (this.allVideosChecked) return;
      if (this.allTVShowsChecked) {
        return "all";
      }
      return this.tvShowsChecked;
    },
    getCategoryFilter() {
      if (this.allVideosChecked) return;
      if (this.allCategoriesChecked) {
        return "all";
      }
      return this.categoriesChecked;
    },
    showModal() {
      this.$refs["show-filter-modal"].show();
    },
    loadShows() {
      this.tvShows = this.$store.state.shows.tvShows[this.$l2.code]
        ? this.$store.state.shows.tvShows[this.$l2.code]
        : undefined;
      this.talks = this.$store.state.shows.talks[this.$l2.code]
        ? this.$store.state.shows.talks[this.$l2.code]
        : undefined;
    }
  }
};
</script>

<style lang="scss" scoped>
.quick-link {
  text-decoration: underline;
  font-size: 0.8em;
  cursor: pointer;
  position: relative;
  bottom: 0.05rem;
}
.show-filter-modal {
  .fa,
  .fas {
    width: calc(0.2rem * 16);
    margin-right: 0.5rem;
    text-align: center;
  }
  .show-thumb {
    width: calc(0.2rem * 16);
    height: calc(0.2rem * 9);
    object-fit: cover;
    margin-right: 0.5rem;
  }
}

@media (min-width: 601px) {
  .categories-checkbox-group {
    columns: 2;
  }
}
</style>