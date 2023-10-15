<router>
  {
    path: '/:l1/:l2/recommended-video',
    props: true,
  }
</router>
<template>
  <div>
    <div class="container pb-5">
      <SocialHead
        :title="`Learn ${$l2.name} with Videos | Language Player`"
        :description="`Learn ${$l2.name} with Videos`"
        :image="'/img/tv-shows.jpg'"
      />
      <div
        class="row"
        v-if="
          !progressLoaded ||
          !settingsLoaded ||
          !this.recommendedVideosLoaded[this.$l2.code]
        "
      >
        <div class="col-sm-12">
          <div class="text-center mt-4 mb-4">
            <Loader
              :sticky="true"
              :message="
                $t('Loading your recommended videos...')
              "
              class="text-white"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import {
  timeout,
  uniqueByValue,
  languageLevels,
  randomItemFromArray,
  LANGS_WITH_LEVELS,
  LANGS_WITH_CONTENT,
} from "@/lib/utils";

export default {
  name: "recommended", // Added to resolve Vue warn - Invalid component name: "pages/explore-media.vue"
  data() {
    return {
      videos: undefined,
      loading: true,
      heroVideo: undefined,
      hasWatchHistory: false,
      term: undefined,
      LANGS_WITH_LEVELS,
      all: false, // If false, show users the category selection; if true, show recent videos, tv shows, youtube videos, etc.
    };
  },
  async mounted() {
    if (this.recommendedVideosLoaded[this.$l2.code])
      this.loadRecommendedVideos();
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type.startsWith("shows/ADD_RECOMMENDED_VIDEOS")) {
        this.loadRecommendedVideos();
      }
    });
    this.redirectToContentPreferencesIfMissing();
    await timeout(5000);
    this.loading = false; // In case resources fail to load, at least show them
  },
  beforeDestroy() {
    // you may call unsubscribe to stop the subscription
    this.unsubscribe();
  },
  computed: {
    ...mapState("history", ["history", "historyLoaded"]),
    ...mapState("stats", ["stats"]),
    ...mapState("shows", ["categories"]),
    ...mapState("settings", ["preferredCategories", "settingsLoaded"]),
    ...mapState("progress", ["progress", "progressLoaded"]),
    ...mapState("shows", ["recommendedVideosLoaded", "recommendedVideos"]),
    levels() {
      let langLevels = languageLevels(this.$l2);
      return [1, 2, 3, 4, 5, 6, 7].map((l) => langLevels[l]);
    },
    languageLevel() {
      if (
        this.progress &&
        this.progress[this.$l2.code] &&
        this.progress[this.$l2.code].level
      )
        return this.progress[this.$l2.code].level;
    },
  },
  methods: {
    redirectToContentPreferencesIfMissing() {
      if (
        LANGS_WITH_LEVELS.includes(this.$l2.code) &&
        this.progressLoaded &&
        !this.languageLevel
      )
        this.$router.push({
          name: "set-language-level",
          params: { l1: this.$l1.code, l2: this.$l2.code },
        });
      else if (this.settingsLoaded && this.preferredCategories.length === 0)
        this.$router.push({
          name: "set-content-preferences",
          params: { l1: this.$l1.code, l2: this.$l2.code },
        });
    },
    onHasWatchHistory() {
      this.hasWatchHistory = true;
    },
    async loadRecommendedVideos() {
      // If the previous history item was a video, redirect to 'explore-meida'
      // let previousHistoryItem = this.fullHistory[this.fullHistory.length - 2];
      // if (previousHistoryItem?.path.includes(this.$l2.code + "/video-view")) {
      //   this.$router.push({
      //     name: "explore-media",
      //     params: { l1: this.$l1.code, l2: this.$l2.code },
      //   });
      //   return;
      // }
      // Otherwise, load the recommended video
      if (this.recommendedVideos?.[this.$l2.code]?.length) {
        let firstRecommendedVideo =
          this.recommendedVideos?.[this.$l2.code]?.[0];
        if (firstRecommendedVideo && typeof firstRecommendedVideo === "object")
          this.$router.replace({
            name: "video-view",
            params: {
              type: "youtube",
            },
            query: {
              v: firstRecommendedVideo.youtube_id,
              id: firstRecommendedVideo.id,
              p: "recommended"
            },
          });
          return;
      }
      this.$router.replace({
        name: "explore-media",
        params: { l1: this.$l1.code, l2: this.$l2.code },
      });
      this.loading = false;
    },
    random(array, max) {
      let random = this.dayOfTheYear() / 366;
      let offset = Math.min(
        Math.floor(array.length * random),
        array.length - max
      );
      let sliced = array.slice(offset, offset + max || 12);
      return sliced;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/variables.scss";

.media-section {
  padding-bottom: 2rem;
  // border-bottom: 1px solid #111;
}

.media-seaction-heading {
  margin-bottom: 2rem;
}

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

:deep(.synced-transcript) {
  height: 5rem;
  overflow: hidden;
}

h3 {
  position: relative;
  font-size: 1.3rem;
}

.show-all {
  font-size: 1rem;
  margin-left: 0.5rem;
  display: inline-block;
  color: $primary-color;
}
</style>
