<template>
  <div class="live-video">
    <client-only>
      <d-player
        @play="play"
        ref="player"
        class="video-player-box"
        :options="{
          video: {
            url,
            type: 'hls',
          },
          autoplay: true
        }"
      ></d-player>
    </client-only>
  </div>
</template>

<script>
export default {
  props: {
    url: {
      type: String,
    },
  },
  data() {
    return {};
  },
  mounted() {
    const player = this.$refs.player?.dp;
    if (player) {
      player.play();
      setTimeout(() => {
        player.pause();
      }, 2000);
    }
  },
  methods: {
    play() {
      console.log("play callback");
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