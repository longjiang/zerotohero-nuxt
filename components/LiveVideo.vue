<template>
  <div class="live-video">
    <client-only>
      <template v-if="dPlayerLoaded">
        <component
          @play="play"
          ref="player"
          class="video-player-box"
          :is="DPlayer"
          :options="{
            video: {
              url,
              type: 'hls',
            },
            autoplay: true
          }"
        ></component>
      </template>
    </client-only>
  </div>
</template>

<script>
import "vue-dplayer/dist/vue-dplayer.css";

export default {
  props: {
    url: {
      type: String,
    },
  },
  data() {
    return {
      dPlayerLoaded: false,
      DPlayer: null,
    };
  },
  mounted() {
    if (process.client) {
      import('vue-dplayer').then((VueDPlayer) => {
        this.DPlayer = VueDPlayer.default;
        this.dPlayerLoaded = true;
        const player = this.$refs.player?.dp;
        if (player) {
          player.play();
          setTimeout(() => {
            player.pause();
          }, 2000);
        }
      });
    }
  },
  methods: {
    play() {
      // Callback when video is played
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
