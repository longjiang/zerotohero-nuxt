<template>
  <router-link :to="`/${l1.code}/${l2.code}/`" class="mr-4 mb-4 d-inline-block link-unstyled">
    <div class="logo-constructed">
      <div class="logo-circle-wrapper">
        <div :class="`${randomBlendClass()} logo-circle`">
          <img :src="`/img/logo-square/${l2.code}.jpeg`" alt />
        </div>
        <div
          class="logo-speech-bubble shadowed"
          :style="`background-image: url(/img/speech-light.png)`"
        >
          <b>{{ l2.code }}</b>
        </div>
      </div>
      <div class="logo-text text-white">
        <template v-if="l2['iso639-3'] === 'eng'">
          <div
            class="logo-text-language"
          >{{ l1.translations ? l1.translations['english'] : 'English' }}</div>
          <div
            class="logo-text-zth"
          ><span v-if="!compact">{{ l1.translations ? l1.translations['zerotohero'] : 'Zero to Hero' }}</span><span v-else>&nbsp;</span></div>
        </template>
        <template v-else>
          <div class="logo-text-language">
            <span>{{ l2.name.toUpperCase() }}</span>
          </div>
          <div class="logo-text-zth"><span v-if="!compact">ZERO TO HERO</span><span v-else>&nbsp;</span></div>
        </template>
      </div>
    </div>
  </router-link>
</template>

<script>
import Config from '@/lib/config'

export default {
  props: ['l1', 'l2', 'compact'],
  data() {
    return {
      Config
    }
  },
  methods: {
    randomBlendClass() {
      let colors = ['blue-yellow', 'pink-yellow', 'red-blue']
      return !['en', 'zh', 'jp', 'ko', 'ru', 'fr', 'de'].includes(this.l2.code) ? 'blend-' + colors[this.l2.name.length % 3] : ''
    }
  }
}
</script>

<style>
.logo-image {
  height: 4rem;
}
.logo-constructed {
  display: flex;
  align-items: flex-end;
  padding-top: 0.8rem;
}
.logo-circle-wrapper {
  position: relative;
  margin-right: 0.7rem;
}
.logo-circle {
  height: 2.75rem;
  width: 2.75rem;
  border-radius: 100%;
  overflow: hidden;
  position: relative;
}
.logo-circle img {
  height: 100%;
  width: 100%;
  object-fit: cover;
  object-position: center;
}
.logo-text {
  font-family: 'Helvetica Neue', Helvetica, sans-serif;
  text-align: left;
  margin-bottom: -0.4rem;
}
.logo-speech-bubble {
  height: 2rem;
  width: 2rem;
  background-size: cover;
  line-height: 2rem;
  text-align: center;
  font-size: 0.7rem;
  color: #555;
  position: absolute;
  top: -1rem;
  right: -1rem;
}
.logo-speech-bubble b {
  display: block;
  position: relative;
  bottom: 0.1em;
}
.logo-text-language {
  font-weight: 100;
  margin-bottom: -0.2em;
  text-transform: uppercase;
  line-height: 1.15;
}
.logo-text-zth {
  font-weight: bold;
  text-transform: uppercase;
}
</style>