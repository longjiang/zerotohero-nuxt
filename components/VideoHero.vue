<template>
  <div
    v-if="wide"
    class="video-hero-wrapper"
    v-observe-visibility="visibilityChanged"
  >
    <div
      :class="{
        'video-hero': true,
        unavailable: videoUnavailable,
        [`skin-${$skin}`]: true,
      }"
      @click="togglePaused"
    >
      <!-- <div class="top-overlay"></div> -->
      <div class="bottom-overlay"></div>
      <LazyYouTubeVideo
        ref="youtube"
        v-bind="{
          autoload: !isMobile,
          autoplay: !isMobile,
          muted,
          cc: false,
          video,
          posterOnly: isMobile,
          icon: false,
          controls: false,
        }"
        @videoUnavailable="onVideoUnavailable"
        :key="video.youtube_id"
      />
    </div>
    <div class="hero-video-info-wrapper" v-if="wide">
      <div class="container">
        <div class="row">
          <div class="col-sm-12">
            <div class="hero-video-info text-left">
              <div class="hero-video-show-type" v-if="show">
                <i :class="`${show.icon} mr-1`"></i>
                {{ $t(show.type) }}
              </div>
              <h4 class="hero-video-title">
                {{ displayTitle }}
              </h4>
              <div>
                <router-link
                  v-if="!videoUnavailable"
                  :to="to"
                  class="btn btn-success"
                >
                  <i :class="`${playButtonIcon} mr-1`"></i>
                  {{ $t(playButtonText) }}
                </router-link>
                <router-link
                  v-if="(video.tv_show || video.talk) && showEpisodes"
                  :to="{
                    name: 'l1-l2-show-type-id',
                    params: {
                      id: video.tv_show || video.talk,
                      type: video.tv_show ? 'tv-show' : 'talk',
                    },
                    id: String(video.tv_show ? video.tv_show : video.talk),
                  }"
                  class="ml-1 btn btn-ghost-dark-no-bg"
                >
                  <i :class="`${episodesButtonIcon} mr-1`"></i>
                  {{ $t(episodesButtonText) }}
                </router-link>
                <b-button
                  variant="ghost-dark-no-bg"
                  class="ml-1"
                  @click="mute()"
                >
                  <i class="fas fa-volume-mute" v-if="muted"></i>
                  <i class="fas fa-volume-up" v-else></i>
                </b-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { wide, isMobile } from "../lib/utils";
import { mapState } from "~/imports";

export default {
  props: {
    video: {
      type: Object,
      required: true,
    },
    showEpisodes: {
      type: Boolean,
      default: true,
    },
    playlistId: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      videoUnavailable: false,
      muted: false,
      wide: false,
    };
  },
  mounted() {
    this.wide = wide();
    this.loadSettings();
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type === "settings/LOAD_JSON_FROM_LOCAL") {
        this.loadSettings();
      }
    });
  },
  computed: {
    ...mapState("settings", ["muteAutoplay"]),
    to() {
      let to = {
        name: "l1-l2-video-view-type",
        params: { type: "youtube" },
        query: { v: this.video.youtube_id },
      }
      if (this.playlistId) {
        to.query.p = this.playlistId;
      }
      return to;
    },
    isMobile() {
      return isMobile();
    },
    displayTitle() {
      if (
        this.show &&
        this.show.show
      ) {
        return this.show.show.title;
      } else
        return this.video.title
          .replace(/[|【】《》]/g, "")
          .replace("ENG SUBS", "")
          .replace("MULTI SUBS", "")
          .replace("MULTISUB", "");
    },
    show() {
      if (
        (this.video.tv_show || this.video.talk) &&
        this.$store.state.shows &&
        this.$store.state.shows.showsLoaded[this.$l2.code]
      ) {
        let tvShows = this.$store.state.shows.tvShows[this.$l2.code];
        let talks = this.$store.state.shows.talks[this.$l2.code];
        let talkId = this.video.talk?.id || this.video.talk;
        let tvShowId = this.video.tv_show?.id || this.video.tv_show;
        let tvShow = tvShows.find((s) => s.id === tvShowId);
        let talk = talks.find((t) => t.id === talkId);
        if (talk) return { type: 'YouTube', icon: "fab fa-youtube", show: talk };
        if (tvShow) return { type: 'TV Show', icon: "fa fa-tv", show: tvShow };
      }
    },
    playButtonIcon() {
      return "fas fa-play";
    },
    playButtonText() {
      return "Play & Learn";
    },
    episodesButtonIcon() {
      return "fa-regular fa-rectangle-history";
    },
    episodesButtonText() {
      return "Episodes";
    },
  },
  watch: {
    muted() {
      if (!this.$refs.youtube) return false;
      if (this.muted) this.$refs.youtube.mute();
      else this.$refs.youtube.unMute();
    },
    video() {
      this.videoUnavailable = false;
    },
  },
  methods: {
    loadSettings() {
      if (this.muted !== this.muteAutoplay) {
        this.muted = this.muteAutoplay;
      }
    },
    mute() {
      this.muted = !this.muted;
      this.$store.dispatch("settings/setGeneralSettings", {
        muteAutoplay: this.muted,
      });
    },
    togglePaused() {
      this.$refs.youtube.togglePaused();
    },
    onVideoUnavailable(youtube_id) {
      if (youtube_id === this.video.youtube_id) {
        this.videoUnavailable = true;
        this.$emit("videoUnavailable", youtube_id);
      }
    },
    visibilityChanged(visible) {
      if (!this.$refs.youtube) return;
      if (!visible) this.$refs.youtube.mute();
      if (visible && !this.muted) this.$refs.youtube.unMute();
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../assets/scss/variables.scss";
.video-hero-wrapper {
  position: relative;
  border-radius: 0.25rem;
  overflow: hidden;
}

.video-hero {
  overflow: hidden;
  position: relative;
  max-height: 50vh;
  .top-overlay {
    height: 2.5%;
    width: 100%;
    position: absolute;
    z-index: 2;
    pointer-events: none;
  }
  .bottom-overlay {
    height: 20%;
    width: 100%;
    position: absolute;
    bottom: 0;
    z-index: 2;
    pointer-events: none;
  }
  &.skin-light {
    .top-overlay {
      background: linear-gradient(
        rgb(255, 255, 255) 0%,
        rgba(255, 255, 255, 0) 100%
      );
    }
    .bottom-overlay {
      background: linear-gradient(
        rgba(255, 255, 255, 0) 0%,
        rgb(255, 255, 255) 100%
      );
    }
  }
  &.skin-dark {
    .top-overlay {
      background: linear-gradient(black 0%, rgba(0, 0, 0, 0) 100%);
    }
    .bottom-overlay {
      background: linear-gradient(rgba(255, 255, 255, 0) 0%, black 100%);
    }
  }
  &.unavailable {
    .hero-video-info-wrapper .hero-video-info {
      max-width: 100%;
    }
    .hero-video-title {
      text-align: center;
    }
    .youtube {
      opacity: 0;
      padding-bottom: 7rem;
    }
  }
}

.hero-video-info-wrapper {
  z-index: 5;
  bottom: 0;
  width: 100%;
  position: absolute;
  bottom: 10%;
  .hero-video-info {
    max-width: 35rem;
    color: white;
    .hero-video-show-type {
      font-weight: bold;
      color: #ccc;
      font-size: 0.8em;
      i {
        color: $primary-color;
      }
    }
    .hero-video-title {
      line-height: 1.667;
      text-shadow: 0 0 20px black;
      margin-bottom: 1rem;
      font-size: 1.67rem;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }
}

@media screen and (max-width: 400px) {
  .hero-video-title {
    font-size: 1.2rem !important;
  }
}

@media screen and (min-width: 1280px) {
  .youtube {
    position: relative;
    :deep(.youtube-screen) {
      margin-top: calc(-1 * (56.25% - 50vh) / 2);
    }
  }
}
</style>
