<template>
  <div style="position: relative" v-observe-visibility="visibilityChanged">
    <div
      :class="{
        'video-hero': true,
        unavailable: videoUnavailable,
        [`skin-${$skin}`]: true,
      }"
      @click="play"
      v-if="wide"
    >
      <!-- <div class="top-overlay"></div>
      <div class="bottom-overlay"></div> -->
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
      />
    </div>
    <div class="hero-video-info-wrapper" v-if="wide">
      <div class="container">
        <div class="row">
          <div class="col-sm-12">
            <div class="hero-video-info">
              <div class="hero-video-show-type" v-if="show">
                <i :class="`${show.icon} mr-1`"></i>
                {{ $t(show.type) }}
              </div>
              <h4 class="hero-video-title">
                {{ displayTitle }}
              </h4>
              <div class="text-left">
                <router-link
                  v-if="!videoUnavailable"
                  :to="{
                    name: 'video-view',
                    params: { type: 'youtube', youtube_id: video.youtube_id },
                  }"
                  class="btn btn-success"
                >
                  <i :class="`${playButtonIcon} mr-1`"></i>
                  {{ $t(playButtonText) }}
                </router-link>
                <router-link
                  v-if="(video.tv_show || video.talk) && showEpisodes"
                  :to="{
                    name: 'show',
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
                  @click="muted = !muted"
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
import Helper from "@/lib/helper";
import { mapState } from "vuex";

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
  },
  data() {
    return {
      videoUnavailable: false,
      muted: false,
      wide: false,
    };
  },
  mounted() {
    this.wide = Helper.wide();
  },
  computed: {
    ...mapState("settings", ["l2Settings"]),
    l2SettingsOfL2() {
      let l2SettingsOfL2 = {};
      if (this.l2Settings && this.l2Settings[this.$l2.code])
        l2SettingsOfL2 = this.l2Settings[this.$l2.code];
      return l2SettingsOfL2;
    },
    isMobile() {
      return Helper.isMobile();
    },
    displayTitle() {
      if (
        this.show &&
        this.show.show &&
        !["Music", "Movies", "News"].includes(this.show.show.title)
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
        if (this.video.talk) {
          let talkId = this.video.talk.id || this.video.talk;
          let talk = talks.find((t) => t.id === talkId);
          if (talk) {
            let type =
              talk.title === "News"
                ? "News Report"
                : talk.audiobook
                ? "Audiobook"
                : "YouTube Channel";
            let icon =
              talk.title === "News"
                ? "fa fa-newspaper"
                : talk.audiobook
                ? "fa fa-book-open"
                : "fab fa-youtube";
            return { type, icon, show: talk };
          }
        } else {
          let tvShowId = this.video.tv_show.id || this.video.tv_show;
          let tvShow = tvShows.find((s) => s.id === tvShowId);
          if (tvShow) {
            let type =
              tvShow.title === "Movies"
                ? "Movie"
                : tvShow.title === "Music"
                ? "Song"
                : "TV Show";
            let icon =
              tvShow.title === "Movies"
                ? "fa fa-film"
                : tvShow.title === "Music"
                ? "fa fa-music"
                : "fa fa-tv";
            return { type, icon, show: tvShow };
          }
        }
      }
    },
    playButtonIcon() {
      if (this.show) {
        if (this.show.type === "Audiobook") return "fa fa-book-open";
        if (this.show.type === "Song") return "fas fa-headphones-alt";
      }
      return "fas fa-play";
    },
    playButtonText() {
      if (this.show) {
        if (this.show.type === "Audiobook") return "Read & Listen";
        if (this.show.type === "Song") return "Listen & Learn";
        if (this.show.type === "TV Show") return "Play & Learn";
        if (this.show.type === "YouTube Channel") return "Play & Learn";
        if (this.show.type === "News Report") return "Play & Learn";
      }
      return "Play & Learn";
    },
    episodesButtonIcon() {
      if (this.show) {
        if (this.show.type === "Audiobook") return "fa fa-list";
        if (this.show.type === "Song") return "fas fa-compact-disc";
      }
      return "fas fa-th-large";
    },
    episodesButtonText() {
      if (this.show) {
        if (this.show.type === "Audiobook") return "Chapters";
        if (this.show.type === "Song") return "Songs";
        if (this.show.type === "YouTube Channel") return "Episodes";
      }
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
    play() {
      this.$refs.youtube.play();
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
.video-hero {
  overflow: hidden;
  position: relative;
  max-height: 50vh;
  .top-overlay {
    height: 2.5%;
    width: 100%;
    position: absolute;
    z-index: 2;
  }
  .bottom-overlay {
    height: 20%;
    width: 100%;
    position: absolute;
    bottom: 0;
    z-index: 2;
  }
  &.skin-light {
    .top-overlay {
      background: linear-gradient(rgb(255, 255, 255) 0%, rgba(255, 255, 255, 0) 100%);
    }
    .bottom-overlay {
      background: linear-gradient(rgba(255, 255, 255, 0) 0%, rgb(255, 255, 255) 75%);
    }
  }
  &.skin-dark {
    .top-overlay {
      background: linear-gradient(black 0%, rgba(0, 0, 0, 0) 100%);
    }
    .bottom-overlay {
      background: linear-gradient(rgba(255, 255, 255, 0) 0%, black 75%);
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
        color: #28a745;
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
