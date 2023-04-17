<template>
  <div :class="`animated-svg-wrapper skin-${$skin}`">
    <img :src="src" class="animated-svg" />
    <b-button
      class="replay-btn mt-2 focus-exclude"
      :variant="$skin"
      @click="playSVG"
    >
      <i class="fas fa-play mr-2" /> {{ $t('Stroke Order') }}
    </b-button>
  </div>
</template>

<script>
import Hanzi from '@/lib/hanzi'

export default {
  props: ['char'],
  data: function() {
    return {
      anim: 0,
      src: this.animatedSVG()
    }
  },
  methods: {
    animatedSVG() {
      return Hanzi.animatedSvgUrl(this.char)
    },
    playSVG() {
      this.src = this.animatedSVG() + '?' + Math.random() * 10000
    }
  }
}
</script>

<style lang="scss">
.animated-svg-wrapper {
  display: flex;
  flex-direction: column;
  width: 10rem;
  margin: 0 auto;
  &.skin-dark {
    .animated-svg {
      background: #999;
      border-radius: 0.25rem;
    }
  }
}

.animated-svg {
  width: 10rem;
  height: 10rem;
}
</style>
