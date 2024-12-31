<template>
  <div>
    <div class="container pb-5">
      <SocialHead
        :title="`Learn ${$l2.name} with Videos | Language Player`"
        :description="`Learn ${$l2.name} with Videos`"
        :image="'/img/tv-shows.jpg'"
      />
      <div class="row" v-if="!progressLoaded || !settingsLoaded">
        <div class="col-sm-12">
          <div class="text-center mt-4 mb-4">
            <Loader
              :sticky="true"
              :message="
                $t('Loading your learning progress and content preferences...')
              "
              class="text-white"
            />
          </div>
        </div>
      </div>
      <div class="row" v-else>
        <div class="col-sm-12">
          <Sale class="my-4" />
          <VideoHero
            v-if="heroVideo"
            :video="heroVideo"
            @videoUnavailable="onVideoUnavailable"
            playlistId="recommended_music"
            class="mb-3"
          />

          <YouTubeVideoList
            :videos="recommendedMusicVideos && recommendedMusicVideos[$l2.code]"
            playlistId="recommended_music"
          />

          <div
            v-observe-visibility="visibilityChanged"
            class="text-center"
            v-if="
              !recommendedMusicVideosLoaded[$l2.code] ||
              (recommendedMusicVideos && recommendedMusicVideos[$l2.code] && recommendedMusicVideos[$l2.code].length)
            "
          >
            <Loader
              key="rec-loader"
              :sticky="true"
              :message="
                $t('Loading more video recommendations...')
              "
              class="text-white"
            />
          </div>
          <div
            v-else-if="
              !recommendedMusicVideos?.[$l2.code]?.length
            "
          >
            <p>
              {{
                $t('We have limited content for {l2}. Below are all the videos in our library:', {
                  l2: $l2.name,
                })
              }}
            </p>
            <MediaSearchResults />
          </div>

          <client-only>
            <LazyIdenticalLanguages
              class="mt-5 mb-5"
              routeName="l1-l2-explore-media"
              v-if="!loading"
            />
          </client-only>
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
} from "../../../lib/utils";

export default {
  name: "l1-l2-explore-media",
  data() {
    return {
      videos: undefined,
      loading: true,
      heroVideo: undefined,
      hasWatchHistory: false,
      term: undefined,
      LANGS_WITH_LEVELS,
      all: false,
    };
  },
  async mounted() {
    // もしすでに recommendedMusicVideosLoaded が true なら、ロード処理を呼ぶ
    if (this.recommendedMusicVideosLoaded[this.$l2.code]) {
      this.loadRecommendedMusicVideos();
    }
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      // 「shows/ADD_RECOMMENDED_MUSIC_VIDEOS」がトリガーされたら読み込む
      if (mutation.type.startsWith("shows/ADD_RECOMMENDED_MUSIC_VIDEOS")) {
        this.loadRecommendedMusicVideos();
      }
    });
    this.redirectToContentPreferencesIfMissing();
    await timeout(5000);
    this.loading = false;
  },
  beforeDestroy() {
    this.unsubscribe();
  },
  computed: {
    ...mapState("stats", ["stats"]),
    ...mapState("shows", [
      "categories",
      "recommendedMusicVideosLoaded",
      "recommendedMusicVideos",
    ]),
    ...mapState("settings", ["preferredCategories", "settingsLoaded"]),
    ...mapState("progress", ["progress", "progressLoaded"]),

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
    visibilityChanged(isVisible, entry) {
      if (isVisible) {
        this.$store.dispatch("shows/loadRecommendedMusicVideos", {
          userId: this.$auth.user?.id,
          l2: this.$l2,
        });
      }
    },
    redirectToContentPreferencesIfMissing() {
      if (
        LANGS_WITH_LEVELS.includes(this.$l2.code) &&
        this.progressLoaded &&
        !this.languageLevel
      ) {
        this.$router.replace({
          name: "l1-l2-set-language-level",
          params: { l1: this.$l1.code, l2: this.$l2.code },
        });
      } else if (this.settingsLoaded && this.preferredCategories.length === 0) {
        this.$router.replace({
          name: "l1-l2-set-content-preferences",
          params: { l1: this.$l1.code, l2: this.$l2.code },
        });
      }
    },
    onHasWatchHistory() {
      this.hasWatchHistory = true;
    },
    async loadHeroVideo() {
      // heroVideo に、音楽動画の中からランダムで一つセット
      if (this.recommendedMusicVideos?.[this.$l2.code]?.length) {
        this.heroVideo = randomItemFromArray(
          this.recommendedMusicVideos[this.$l2.code]
        );
      }
    },
    onVideoUnavailable(youtube_id) {
      if (this.heroVideo && this.heroVideo.youtube_id === youtube_id) {
        this.videoUnavailable = true;
        if (this.videos) {
          this.videos = this.videos.filter((v) => v.youtube_id !== youtube_id);
        }
        this.loadHeroVideo();
      }
    },
    async loadRecommendedMusicVideos() {
      this.loadHeroVideo();
      this.loading = false;
    },
    randomOffset(statsKey, max) {
      if (this.stats && this.stats[this.$l2.code]) {
        let stats = this.stats[this.$l2.code][statsKey];
        if (stats < max) return 0;
        else {
          let random = this.dayOfTheYear() / 366;
          let offset = Math.floor(random * (stats - max));
          return offset;
        }
      }
      return 0;
    },
    dayOfTheYear() {
      var now = new Date();
      var start = new Date(now.getFullYear(), 0, 0);
      var diff = now - start;
      var oneDay = 1000 * 60 * 60 * 24;
      var day = Math.floor(diff / oneDay);
      return day;
    },
    random(array, max) {
      let random = this.dayOfTheYear() / 366;
      let offset = Math.min(Math.floor(array.length * random), array.length - max);
      let sliced = array.slice(offset, offset + max || 12);
      return sliced;
    },
    randBase64(length) {
      var result = "";
      var characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      var charactersLength = characters.length;
      for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/variables.scss";

.media-section {
  padding-bottom: 2rem;
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