<template>
  <a
    :href="language.enURL"
    target="_blank"
    class="mr-4 mb-4 d-inline-block link-unstyled"
  >
    <div class="logo-constructed">
      <div class="logo-circle" :style="`background-image:url(${Config.server}img/logo-square/en.png)`">
        <div
          class="logo-speech-bubble"
          :style="`background-image: url(${Config.server}img/speech-light.png)`"
        >
          <b>En</b>
        </div>
      </div>
      <div class="logo-text text-white">
        <div class="logo-text-language">{{ language.translations ? language.translations['english'] : 'English' }}</div>
        <div class="logo-text-zth">{{ language.translations ? language.translations['zerotohero'] : 'Zero to Hero' }}</div>
      </div>
    </div>
  </a>
</template>

<script>
import Config from '@/lib/config'

export default {
  props: ['language'],
  data() {
    return {
      Config
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
.logo-circle {
  height: 2.75rem;
  width: 2.75rem;
  background: #ccc;
  border-radius: 100%;
  position: relative;
  margin-right: 0.7rem;
  background-size: cover;
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
  right: -0.4rem;
  top: -0.8rem;
}
.logo-speech-bubble b {
  display: block;
  position: relative;
  bottom: 0.1em;
}
.logo-text-language {
  font-weight: 200;
  margin-bottom: -0.3em;
  text-transform: uppercase;
}
.logo-text-zth {
  font-weight: bold;
  text-transform: uppercase;
}
</style>