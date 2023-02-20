<template>
  <div class="animated-svg-wrapper">
    <img :src="src" class="animated-svg" />
    <button
      class="replay-btn btn-medium btn-gray mt-2 focus-exclude"
      @click="playSVG"
    >
      <i class="fas fa-play mr-2" /> {{ $t('Stroke Order') }}
    </button>
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

<style>
.animated-svg-wrapper {
  display: flex;
  flex-direction: column;
  width: 10rem;
  margin: 0 auto;
}

.animated-svg {
  width: 10rem;
  height: 10rem;
}
</style>
