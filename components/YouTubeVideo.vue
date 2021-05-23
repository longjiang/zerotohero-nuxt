<template>
  <div class="youtube" :key="youtube">
    <div
      v-bind:style="{
        backgroundImage:
          'url(' + '//img.youtube.com/vi/' + youtube + '/hqdefault.jpg' + ')',
      }"
      class="youtube-screen"
      v-on:click="loadYouTubeiFrame()"
    >
      <div :id="youtubeIframeID"></div>
    </div>
  </div>
</template>

<script>
import Helper from '@/lib/helper'
import $ from 'jquery'

export default {
  data() {
    return {
      youtubeIframeID: 'youtube-' + Helper.uniqueId(),
      time: this.starttime,
      paused: true,
      neverPlayed: true,
      player: undefined,
    }
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
    // eslint-disable-next-line no-unused-vars
    window.onYouTubePlayerAPIReady = function () {
      // This needs to be in global scope as YouTube api will call it
      // This function is overwridden from the app.loadYouTubeiFrame() function
    }

    // eslint-disable-next-line no-unused-vars
    window.onPlayerReady = function (evt) {
      // Required by YouTube API
    }
    if (this.autoload) {
      this.loadYouTubeiFrame()
    }
  },
  destroyed() {
    if (this.player) {
      this.player.destroy()
      this.player = undefined
    }
  },
  updated() {
    if (this.autoload) {
      this.loadYouTubeiFrame()
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
  },
  methods: {
    updatePaused(paused) {
      if (this.paused !== paused) {
        this.paused = paused
        this.$emit('paused', this.paused)
      }
    },
    currentTime() {
      if (this.player && this.player.getPlayerState) {
        let paused = this.player.getPlayerState() !== 1
        this.updatePaused(paused)
      }
      return this.player && this.player.getCurrentTime
        ? this.player.getCurrentTime()
        : 0
    },
    loadYouTubeiFrame() {
      let that = this
      // $('.youtube iframe').remove();
      this.removeYouTubeAPIVars()
      window.onYouTubePlayerAPIReady = () => {
        // eslint-disable-next-line no-undef
        that.player = new YT.Player(this.youtubeIframeID, {
          height: '390',
          width: '640',
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
          onReady: () => {},
          events: {
            onStateChange: () => {
              if (this.player && this.player.getPlayerState) {
                this.updatePaused(this.player.getPlayerState() !== 1)
                this.player.setPlaybackRate(this.speed)
              }
              if (
                !Helper.iOS() &&
                !this.autoplay &&
                this.autoload &&
                this.neverPlayed
              ) {
                this.pause()
                this.neverPlayed = false
              }
            }
          },
        })
      }
      $.getScript('//www.youtube.com/iframe_api')
    },
    removeYouTubeAPIVars() {
      if (window['YT']) {
        let vars = [
          'YT',
          'YTConfig',
          'onYTReady',
          'yt',
          'ytDomDomGetNextId',
          'ytEventsEventsListeners',
          'ytEventsEventsCounter',
        ]
        vars.forEach(function (key) {
          window[key] = undefined
        })
      }
    },
    seek(starttime) {
      if (this.player && this.player.seekTo) {
        this.player.seekTo(starttime)
        this.updatePaused(this.player.getPlayerState() !== 1)
      }
    },
    play() {
      if (this.player && this.player.playVideo) {
        this.player.playVideo()
        this.updatePaused(this.player.getPlayerState() !== 1)
      }
    },
    pause() {
      if (this.player && this.player.pauseVideo) {
        this.player.pauseVideo()
        this.updatePaused(this.player.getPlayerState() !== 1)
      }
    },
    setSpeed(speed) {
      this.speed = speed
      if (this.player) this.player.setPlaybackRate(this.speed)
    },
    togglePaused() {
      if (this.player && this.player.getPlayerState) {
        this.player.getPlayerState() !== 1
          ? this.player.playVideo()
          : this.player.pauseVideo()
        this.updatePaused(this.player.getPlayerState() !== 1)
      } else {
        this.loadYouTubeiFrame()
      }
    },
  },
  watch: {
    speed() {
      this.setSpeed(this.speed)
    },
  },
}
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
  content: '';
  background: url('/img/youtube-red.svg');
  width: 100px;
  height: 100px;
}
</style>
