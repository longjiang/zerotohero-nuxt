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
import '@videojs/http-streaming'
export default {
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
        sources: [
          {
            withCredentials: false,
            type: 'application/x-mpegURL',
            src: "http://ivi.neu6.edu.cn/hls/cctv13.m3u8",
          },
        ],
        // poster: "/static/images/author.jpg",
      },
    };
  },
  mounted() {
    console.log("this is current player instance object", this.myVideoPlayer);
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
      console.log("player current update state", playerCurrentState);
    },
    // player is ready
    playerReadied(player) {
      console.log("example 01: the player is readied", player);
    },
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