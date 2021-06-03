<template>
  <span>
    <i class="fas fa-volume-up focus-exclude speak" @click="speak"></i>
  </span>
</template>
<script>
import commons from 'wikimedia-commons-file-path'
export default {
  data() {
    return {
      availableLocales: [],
      preferredLocales: [],
      bestLocale: 'en',
      bestVoice: undefined
    }
  },
  props: ['text', 'mp3', 'wiktionary'],
  mounted() {
    if(this.availableLocales.length === 0) {
      this.init()
    }
  },
  updated() {
    if(this.availableLocales.length === 0) {
      this.init()
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
    init() {
      let voices = speechSynthesis.getVoices()
      this.availableLocales = voices.map((voice) => voice.lang)
      if (this.$l2.code === 'yue') this.preferredLocales.push('zh-HK')
      if (this.$l2.locales)
        this.preferredLocales = this.preferredLocales.concat(this.$l2.locales)
      for (let locale of this.preferredLocales) {
        if (this.availableLocales.includes(locale)) {
          this.bestLocale = locale
          this.bestVoice = voices.find(voice => voice.lang === locale)
          break
        }
      }
    },
    speak() {
      if(this.availableLocales.length === 0) {
        this.init()
      }
      if (this.mp3) {
        let url = this.wiktionary ? commons(`File:${this.mp3}`) : this.mp3
        let audio = new Audio(url)
        audio.play()
      } else if (this.text) {
        if (this.$hasFeature('speech')) {
          var utterance = new SpeechSynthesisUtterance(this.text)
          utterance.lang = this.bestLocale
          utterance.voice = this.bestVoice
          utterance.rate = 0.7
          speechSynthesis.speak(utterance)
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
  position: relative;
}

.speak:hover {
  color: inherit;
}
</style>
