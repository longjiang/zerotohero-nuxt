<template>
  <span>
    <b-button
      @click="showModal"
      variant="unstyled"
      style="
        color: rgba(255, 255, 255, 0.77255);
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
      title="Search in ..."
      body-class="show-filter-modal"
      @hide="onModalHide"
    >
      <b-form-checkbox v-model="allVideosChecked">
        <i class="fa fa-play"></i>
        <b>All Videos</b>
      </b-form-checkbox>
      <template v-if="!allVideosChecked">
        <hr />
        <b-form-checkbox v-if="musicShow" v-model="musicChecked">
          <i class="fa fa-music"></i>
          <b>Music</b>
        </b-form-checkbox>
        <b-form-checkbox v-if="moviesShow" v-model="moviesChecked">
          <i class="fa fa-film"></i>
          <b>Movies</b>
        </b-form-checkbox>
        <b-form-checkbox v-if="newsShow" v-model="newsChecked">
          <i class="fa fa-newspaper"></i>
          <b>News</b>
        </b-form-checkbox>
        <template v-if="tvShows">
          <hr />
          <b-form-checkbox
            v-model="allTVShowsChecked"
            :class="{ 'mb-2': !allTVShowsChecked }"
          >
            <i class="fa fa-tv"></i>
            <b>All TV Shows</b>
            <template v-if="!allTVShowsChecked">
              <a
                class="ml-2 quick-link"
                @click.stop.prevent="checkAll('tvShows')"
                v-if="tvShowChecked.length < tvShowsFiltered.length"
              >
                Check All
              </a>
              <a
                class="ml-2 quick-link"
                v-if="tvShowChecked.length > 0"
                @click.stop.prevent="uncheckAll('tvShows')"
              >
                Uncheck All
              </a>
            </template>
          </b-form-checkbox>
          <template v-if="!allTVShowsChecked">
            <b-form-checkbox-group
              id="tv-shows-checkbox-group"
              v-model="tvShowChecked"
            >
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
        </template>
        <template v-if="talks">
          <hr />
          <b-form-checkbox
            v-model="allTalksChecked"
            :class="{ 'mb-2': !allTalksChecked }"
          >
            <i class="fas fa-graduation-cap"></i>
            <b>All Talks</b>
            <template v-if="!allTalksChecked">
              <a
                class="ml-2 quick-link"
                @click.stop.prevent="checkAll('talks')"
                v-if="talkChecked.length < talksFiltered.length"
              >
                Check All
              </a>
              <a
                class="ml-2 quick-link"
                v-if="talkChecked.length > 0"
                @click.stop.prevent="uncheckAll('talks')"
              >
                Uncheck All
              </a>
            </template>
          </b-form-checkbox>
          <template v-if="!allTalksChecked">
            <b-form-checkbox-group
              id="tv-shows-checkbox-group"
              v-model="talkChecked"
            >
              <b-form-checkbox
                v-for="talk in talksFiltered"
                :key="`tv-show-${talk.id}`"
                :value="talk.id"
                class="d-block mb-1"
              >
                <img
                  class="show-thumb"
                  :src="`https://img.youtube.com/vi/${talk.youtube_id}/hqdefault.jpg`"
                />
                {{ talk.title }}
              </b-form-checkbox>
            </b-form-checkbox-group>
          </template>
        </template>
      </template>
    </b-modal>
  </span>
</template>

<script>
import Helper from "@/lib/helper";

export default {
  data() {
    return {
      tvShows: undefined,
      talks: undefined,
      musicShow: undefined,
      moviesShow: undefined,
      newsShow: undefined,
      allVideosChecked: false,
      allTVShowsChecked: false,
      allTalksChecked: false,
      tvShowFilter: "all",
      talkFilter: "all",
      musicChecked: false,
      newsChecked: false,
      moviesChecked: false,
      tvShowChecked: [],
      talkChecked: [],
      allTVShows: [],
      allTalks: [],
    };
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
    tvShowsFiltered() {
      if (this.tvShows)
        return this.tvShows.filter(
          (s) => !["Movies", "Music"].includes(s.title)
        );
    },
    talksFiltered() {
      if (this.talks)
        return this.talks.filter((s) => !["News"].includes(s.title));
    },
    title() {
      let titles = [];
      if (this.allVideosChecked) titles.push("All Videos");
      else {
        if (this.allTVShowsChecked) titles.push("All TV Shows");
        else if (this.tvShowChecked && this.tvShowChecked.length > 0)
          titles.push(`${this.tvShowChecked.length} TV Show(s)`);
        if (this.musicChecked) titles.push("Music");
        if (this.moviesChecked) titles.push("Movies");
        if (this.newsChecked) titles.push("News");
        if (this.allTalksChecked) titles.push("All Talks");
        else if (this.talkChecked && this.talkChecked.length > 0)
          titles.push(`${this.talkChecked.length} Talk(s)`);
      }
      if (titles.length > 1) return titles[0] + " & Other Videos";
      if (titles.length === 1) return titles[0];
      if (titles.length === 0) return "Videos";
    },
  },
  mounted() {
    if (typeof this.$store.state.settings !== "undefined") {
      this.loadSettings();
    }
    this.unsubscribeSettings = this.$store.subscribe((mutation, state) => {
      if (mutation.type === "settings/LOAD_SETTINGS") {
        this.loadSettings();
      }
    });
    this.loadShows();
    this.unsubscribeShows = this.$store.subscribe((mutation, state) => {
      if (mutation.type.startsWith("shows")) {
        this.loadShows();
      }
    });
  },
  beforeDestroy() {
    this.unsubscribeSettings();
    this.unsubscribeShows();
  },
  watch: {
    allVideosChecked() {
      this.updateSettings();
    },
    allTVShowsChecked() {
      this.updateSettings();
    },
    allTalksChecked() {
      this.updateSettings();
    },
    newsChecked() {
      this.updateSettings();
    },
    moviesChecked() {
      this.updateSettings();
    },
    musicChecked() {
      this.updateSettings();
    },
    talkChecked() {
      this.updateSettings();
    },
    tvShowChecked() {
      this.updateSettings();
    },
  },
  methods: {
    checkAll(type) {
      if (type === "tvShows") {
        this.tvShowChecked = this.tvShows
          .filter((s) => !["Movies", "Music"].includes(s.title))
          .map((s) => Number(s.id));
      }
      if (type === "talks") {
        this.talkChecked = this.talks
          .filter((s) => !["News"].includes(s.title))
          .map((s) => Number(s.id));
      }
    },
    uncheckAll(type) {
      if (type === "tvShows") {
        this.tvShowChecked = [];
      }
      if (type === "talks") {
        this.talkChecked = [];
      }
    },
    onModalHide() {
      this.$emit("showFilter", {
        tvShowFilter: this.tvShowFilter,
        talkFilter: this.talkFilter,
      });
    },
    loadSettings() {
      this.tvShowFilter = this.$store.state.settings.l2Settings.tvShowFilter;
      this.talkFilter = this.$store.state.settings.l2Settings.talkFilter;
      this.allVideosChecked =
        this.tvShowFilter === "all" && this.talkFilter === "all";
      if (!this.allVideosChecked) {
        this.allTVShowsChecked = this.tvShowFilter === "all";
        this.allTalksChecked = this.talkFilter === "all";
        if (!this.allTVShowsChecked) {
          this.checkSpecials();
          this.tvShowChecked = this.tvShowFilter;
        }
        if (!this.allTalksChecked) {
          this.checkSpecials();
          this.talkChecked = this.talkFilter;
        }
      }
    },
    /**
     * Check if there are special shows like 'music', 'movies' or 'news'. If there are, we tick the checkboxes accordingly.
     */
    checkSpecials() {
      if (this.musicShow) {
        let musicId = Number(this.musicShow.id);
        this.musicChecked = this.tvShowFilter.includes(musicId);
        this.tvShowChecked = this.tvShowChecked.filter((id) => id !== musicId);
      }
      if (this.moviesShow) {
        let moviesId = Number(this.moviesShow.id);
        this.moviesChecked = this.tvShowFilter.includes(moviesId);
        this.tvShowChecked = this.tvShowChecked.filter((id) => id !== moviesId);
      }
      if (this.newsShow) {
        let newsId = Number(this.newsShow.id);
        this.newsChecked = this.talkFilter.includes(Number(this.newsShow.id));
        this.talkChecked = this.talkChecked.filter((id) => id !== newsId);
      }
    },
    updateSettings() {
      let tvShowFilter = this.getTvShowFilter();
      let talkFilter = this.getTalkFilter();

      this.tvShowFilter = tvShowFilter;
      this.$store.dispatch("settings/setL2Settings", {
        tvShowFilter: this.tvShowFilter,
      });

      this.talkFilter = talkFilter;
      this.$store.dispatch("settings/setL2Settings", {
        talkFilter: this.talkFilter,
      });
    },
    getTvShowFilter() {
      if (this.allVideosChecked) return "all";
      if (this.allTVShowsChecked) {
        let all = true;
        if (this.musicShow && !this.musicChecked) all = false;
        if (this.moviesShow && !this.moviesChecked) all = false;
        if (all) return "all";
        else {
          let tvShowIDs = this.tvShows.map((s) => s.id);
          if (!this.musicChecked) {
            tvShowIDs = tvShowIDs.filter((id) => id !== this.musicShow.id);
          }
          if (!this.musicChecked) {
            tvShowIDs = tvShowIDs.filter((id) => id !== this.moviesShow.id);
          }
          return tvShowIDs;
        }
      } else {
        let tvShowFilter = [].concat(this.tvShowChecked);
        if (this.musicChecked) {
          if (this.musicShow) tvShowFilter.push(this.musicShow.id);
        }
        if (this.moviesChecked) {
          if (this.moviesShow) tvShowFilter.push(this.moviesShow.id);
        }
        return Helper.unique(tvShowFilter);
      }
    },
    getTalkFilter() {
      if (this.allVideosChecked) return "all";
      if (this.allTalksChecked) {
        let all = true;
        if (this.newsShow && !this.newsChecked) all = false;
        if (all) return "all";
        else {
          let talkShowIDs = this.talks.map((s) => s.id);
          if (!this.newsChecked) {
            talkShowIDs = talkShowIDs.filter((id) => id !== this.newsShow.id);
          }
          return talkShowIDs
        }
      }
      let talkFilter = [].concat(this.talkChecked);
      if (this.newsChecked) {
        if (this.newsShow) talkFilter.push(this.newsShow.id);
      }
      return Helper.unique(talkFilter);
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
      if (this.tvShows) {
        this.musicShow = this.tvShows.find((s) => s.title === "Music");
        this.moviesShow = this.tvShows.find((s) => s.title === "Movies");
      }
      if (this.talks) {
        this.newsShow = this.talks.find((s) => s.title === "News");
      }
      this.checkSpecials();
    },
  },
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
    height: calc(0.2rem * 9);
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
</style>