<template>
  <div style="position: relative" :class="{ unavailable: videoUnavailable }" v-observe-visibility="visibilityChanged">
    <div class="video-hero" @click="play">
      <div class="top-overlay"></div>
      <div class="bottom-overlay"></div>
      <LazyYouTubeVideo
        autoload="!isMobile"
        autoplay="!isMobile"
        ref="youtube"
        :cc="false"
        :youtube="video.youtube_id"
        @videoUnavailable="onVideoUnavailable"
        :posterOnly="isMobile"
        :icon="false"
      />
    </div>
    <div class="hero-video-info-wrapper">
      <div class="container">
        <div class="row">
          <div class="col-sm-12">
            <div class="hero-video-info">
              <h4 class="hero-video-title">
                {{
                  title
                    ? title
                    : video.title
                        .replace(/[|【】《》]/g, "")
                        .replace("ENG SUBS", "")
                        .replace("MULTI SUBS", "")
                }}
              </h4>
              <div>
                <router-link
                  v-if="!videoUnavailable"
                  :to="{
                    name: 'youtube-view',
                    params: { youtube_id: video.youtube_id },
                  }"
                  class="btn btn-success"
                >
                  <i class="fas fa-play mr-1"></i>
                  Watch &amp; Learn
                </router-link>
                <router-link
                  v-if="(video.tv_show || video.talk) && showEpisodes"
                  :to="{
                    name: 'show',
                    params: {
                      id: video.tv_show,
                      type: video.tv_show ? 'tv-show' : 'talk',
                    },
                    id: String(video.tv_show ? video.tv_show : video.talk),
                  }"
                  class="ml-1 btn btn-secondary"
                >
                  <i class="fas fa-th-large mr-1"></i>
                  Episodes
                </router-link>
                <b-button variant="secondary" class="ml-1" @click="muted = !muted">
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
export default {
  props: {
    video: {
      type: Object,
      required: true,
    },
    title: {
      type: String,
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
    };
  },
  computed: {
    isMobile() {
      return Helper.isMobile();
    },
  },
  watch: {
    muted() {
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
    onVideoUnavailable() {
      this.videoUnavailable = true;
      this.$emit("videoUnavailable", true);
    },
    visibilityChanged(visible) {
      console.log(visible)
      if (!visible) this.$refs.youtube.mute();
      if (visible && !this.muted) this.$refs.youtube.unMute();
    }
  },
};
</script>

<style lang="scss" scoped>
.video-hero {
  overflow: hidden;
  position: relative;
  max-height: 50vh;
  padding-bottom: 10%;
  background: black;
  .top-overlay {
    background: linear-gradient(black 0%, rgba(0, 0, 0, 0) 100%);
    height: 25%;
    width: 100%;
    position: absolute;
    z-index: 2;
  }
  .bottom-overlay {
    background: linear-gradient(rgba(0, 0, 0, 0) 0%, black 75%);
    height: 75%;
    width: 100%;
    position: absolute;
    bottom: 0;
    z-index: 2;
  }
}

.hero-video-info-wrapper {
  z-index: 5;
  bottom: 0;
  width: 100%;
  position: absolute;
  bottom: -10%;
  .hero-video-info {
    max-width: 35rem;
    color: white;
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

.unavailable {
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

@media screen and (max-width: 400px) {
  .hero-video-title {
    font-size: 1.2rem !important;
  }
}

@media screen and (min-width: 1280px) {
  .youtube {
    position: relative;
    ::v-deep.youtube-screen {
      margin-top: calc(-1 * (56.25% - 50vh) / 2);
    }
  }
}
</style>