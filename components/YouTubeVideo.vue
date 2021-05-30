<template>
  <div class="youtube" :key="youtube">
    <div
      v-if="youtubeIframeID"
      v-bind:style="{
        backgroundImage:
          'url(' + '//img.youtube.com/vi/' + youtube + '/hqdefault.jpg' + ')',
      }"
      class="youtube-screen"
      v-on:click="loadYouTubeiFrame()"
    >
      <div :id="youtubeIframeID()" ref="youtubeIframe"></div>
    </div>
  </div>
</template>

<script>
import Helper from "@/lib/helper";
import $ from "jquery";

export default {
  data() {
    return {
      time: 0,
      neverPlayed: true,
      player: undefined,
      currentTime: 0,
    };
  },
  props: {
    youtube: {
      type: String,
    },
    starttime: {
      type: Number,
      default: 0,
    },
    stoptime: {
      type: Number,
      default: -1,
    },
    autoload: {
      default: false,
    },
    autoplay: {
      default: false,
    },
    speed: {
      type: Number,
      default: 1,
    },
  },
  mounted() {
    if (this.autoload) {
      this.loadYouTubeiFrame();
    }
    this.time = this.starttime;
  },
  destroyed() {
    if (this.player) {
      this.player.destroy();
      this.player = undefined;
    }
  },
  updated() {
    if (this.autoload) {
      this.loadYouTubeiFrame();
    }
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
    paused() {
      return this.player && this.player.getPlayerState
        ? this.player.getPlayerState() !== 1
        : true;
    },
  },
  methods: {
    youtubeIframeID() {
      return "youtube-" + Helper.uniqueId()
    },
    updateCurrentTime() {
      // This cannot be a computed property because the player is not monitored by Vue
      let newTime = this.player && this.player.getCurrentTime
          ? this.player.getCurrentTime()
          : 0;
      if (newTime !== this.currentTime) {
        this.currentTime = newTime
        this.$emit('currentTime', this.currentTime)
      }
    },
    loadYouTubeiFrame() {
      let elementId = this.$refs.youtubeIframe.getAttribute('id')
      console.log(elementId)
      let that = this;
      // $('.youtube iframe').remove();
      this.removeYouTubeAPIVars();
      window.onYouTubePlayerAPIReady = () => {
        // eslint-disable-next-line no-undef
        that.player = new YT.Player(elementId, {
          height: "390",
          width: "640",
          videoId: this.youtube,
          playerVars: {
            start: parseInt(this.starttime),
            autoplay: 1,
            cc_load_policy: 1,
            cc_lang_pref: this.$l1.code,
            showinfo: 0,
            playsinline: 1,
            rel: 0,
            fs: 0,
            hl: this.$l1.code,
            iv_load_policy: 3,
            modestbranding: 1,
          },
          onReady: () => {
          },
          events: {
            onStateChange: () => {
              if (this.player && this.player.getPlayerState) {
                this.player.setPlaybackRate(this.speed);
                this.$emit('paused', [-1, 0, 2].includes(this.player.getPlayerState()))
              }
              if (
                !Helper.iOS() &&
                !this.autoplay &&
                this.autoload &&
                this.neverPlayed
              ) {
                this.pause();
                this.neverPlayed = false;
              }
            },
          },
        });
      };
      $.getScript("//www.youtube.com/iframe_api");
      setInterval(() => {
        this.updateCurrentTime();
      }, 100);
    },
    removeYouTubeAPIVars() {
      if (window["YT"]) {
        let vars = [
          "YT",
          "YTConfig",
          "onYTReady",
          "yt",
          "ytDomDomGetNextId",
          "ytEventsEventsListeners",
          "ytEventsEventsCounter",
        ];
        vars.forEach(function (key) {
          window[key] = undefined;
        });
      }
    },
    seek(starttime) {
      if (this.player && this.player.seekTo) {
        this.player.seekTo(starttime);
      }
    },
    play() {
      if (this.player && this.player.playVideo) {
        this.player.playVideo();
      }
    },
    pause() {
      if (this.player && this.player.pauseVideo) {
        this.player.pauseVideo();
      }
    },
    setSpeed(speed) {
      this.speed = speed;
      if (this.player) this.player.setPlaybackRate(this.speed);
    },
    togglePaused() {
      if (this.player && this.player.getPlayerState) {
        this.player.getPlayerState() !== 1
          ? this.player.playVideo()
          : this.player.pauseVideo();
      } else {
        this.loadYouTubeiFrame();
      }
    },
  },
  watch: {
    speed() {
      this.setSpeed(this.speed);
    },
  },
};
</script>

<style>
.youtube {
  padding-bottom: 56.25%;
  position: relative;
}

.youtube iframe,
.youtube-screen {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.youtube-screen {
  background-size: cover;
  background-position: center;
  color: white;
  font-size: 1.3rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.youtube-screen::after {
  content: "";
  background: url("/img/youtube-red.svg");
  width: 100px;
  height: 100px;
}
</style>
