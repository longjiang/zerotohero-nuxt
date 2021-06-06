<template>
  <button class="speak focus-exclude" @click="speak">
    <i class="fas fa-volume-up" ></i>
  </button>
</template>
<script>
import commons from 'wikimedia-commons-file-path'
import Helper from '@/lib/helper'

export default {
  props: ['text', 'mp3', 'wiktionary'],
  computed: {
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
    $dictionary() {
      return this.$getDictionary();
    },
    $dictionaryName() {
      return this.$store.state.settings.dictionaryName;
    },
    $hanzi() {
      return this.$getHanzi();
    },
  },
  methods: {
    speak() {
      if (this.mp3) {
        let url = this.wiktionary ? commons(`File:${this.mp3}`) : this.mp3
        let audio = new Audio(url)
        audio.play()
      } else if (this.text) {
        if (this.$hasFeature('speech')) {
          Helper.speak(this.text, this.$l2, 0.75)
        } else {
          window.open(`https://forvo.com/search/${this.text}/${this.$l2.code}`)
        }
      }
    },
  },
}
</script>

<style>
.speak {
  cursor: pointer;
  color: #999;
  border: none;
  background: none;
  padding: 0;
}

.speak:hover {
  color: inherit;
}
</style>
