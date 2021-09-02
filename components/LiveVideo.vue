<template>
  <div class="live-video">
    <div
      class="video-player-box"
      :playsinline="playsinline"
      @play="onPlayerPlay($event)"
      @pause="onPlayerPause($event)"
      @ended="onPlayerEnded($event)"
      @loadeddata="onPlayerLoadeddata($event)"
      @waiting="onPlayerWaiting($event)"
      @playing="onPlayerPlaying($event)"
      @timeupdate="onPlayerTimeupdate($event)"
      @canplay="onPlayerCanplay($event)"
      @canplaythrough="onPlayerCanplaythrough($event)"
      @ready="playerReadied"
      @statechanged="playerStateChanged($event)"
      v-video-player:myVideoPlayer="playerOptions"
    ></div>
  </div>
</template>

<script>
import Vue from 'vue'
import VueVideoPlayer from 'vue-video-player/dist/ssr'
import '@videojs/http-streaming'

Vue.use(VueVideoPlayer)

export default {
  props: {
    url: {
      type: String
    }
  },
  data() {
    return {
      // component options
      playsinline: true,

      // videojs options
      playerOptions: {
        language: "en",
        playbackRates: [0.7, 1.0, 1.5, 2.0],
        responsive: true,
        aspectRatio: '16:9',
        autoplay: true,
        sources: [
          {
            type: 'application/x-mpegURL',
            src: this.url,
          },
        ],
        // poster: "/static/images/author.jpg",
      },

      myVideoPlayer: undefined
    };
  },
  mounted() {

  },
  methods: {
    // listen event
    onPlayerPlay(player) {
      // console.log('player play!', player)
    },
    onPlayerPause(player) {
      // console.log('player pause!', player)
    },
    onPlayerEnded(player) {
      // console.log('player ended!', player)
    },
    onPlayerLoadeddata(player) {
      // console.log('player Loadeddata!', player)
    },
    onPlayerWaiting(player) {
      // console.log('player Waiting!', player)
    },
    onPlayerPlaying(player) {
      // console.log('player Playing!', player)
    },
    onPlayerTimeupdate(player) {
      // console.log('player Timeupdate!', player.currentTime())
    },
    onPlayerCanplay(player) {
      // console.log('player Canplay!', player)
    },
    onPlayerCanplaythrough(player) {
      // console.log('player Canplaythrough!', player)
    },
    // or listen state event
    playerStateChanged(playerCurrentState) {
      
    },
    // player is ready
    playerReadied(player) {

    },
    play() {
      this.myVideoPlayer.play()
    }
  },
};
</script>

<style lang="scss" scoped>
.live-video {
  width: 100%;
}
.video-player-box {
  width: 100%;
}
</style>