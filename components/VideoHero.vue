<template>
  <div style="position: relative" :class="{ unavailable: videoUnavailable }">
    <div class="video-hero">
      <div class="top-overlay"></div>
      <div class="bottom-overlay"></div>
      <LazyYouTubeVideo
        autoload="true"
        autoplay="true"
        :cc="false"
        :youtube="video.youtube_id"
        @videoUnavailable="onVideoUnavailable"
      />
    </div>
    <div class="hero-video-info-wrapper">
      <div class="container">
        <div class="row">
          <div class="col-sm-12">
            <div class="hero-video-info">
              <h4 class="hero-video-title">
                {{ title ? title : video.title }}
              </h4>
              <div class="mt-3">
                <router-link
                  v-if="!videoUnavailable"
                  :to="{
                    name: 'youtube-view',
                    params: { youtube_id: video.youtube_id },
                  }"
                  class="btn btn-success"
                >
                  <i class="fas fa-play mr-1"></i>
                  Play
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
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
    };
  },
  methods: {
    onVideoUnavailable() {
      this.videoUnavailable = true;
      this.$emit("videoUnavailable", true);
    },
  },
  watch: {
    video() {
      this.videoUnavailable = false
    }
  }
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
    height: 20%;
    width: 100%;
    position: absolute;
    z-index: 2;
  }
  .bottom-overlay {
    background: linear-gradient(rgba(0, 0, 0, 0) 0%, black 100%);
    height: 67%;
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
      margin-bottom: 2rem;
      font-size: 1.67rem;
    }
    .btn {
      width: 8rem;
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
</style>