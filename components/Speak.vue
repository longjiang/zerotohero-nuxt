<template>
  <client-only>
    <button class="speak focus-exclude" @click.stop.prevent="onClick">
      <i class="fas fa-volume-up" v-if="canSpeak"></i>
      <span v-else-if="forvo">
        <img
          src="/img/logo-forvo-circle.png"
          alt="Forvo"
          data-not-lazy
          style="height: 1rem; opacity: 0.5; margin-bottom: 0.2rem"
        />
      </span>
      <div ref="player" class="hidden"></div>
    </button>
  </client-only>
</template>
<script>
import commons from "wikimedia-commons-file-path";
import { speak } from "@/lib/utils/speak";

export default {
  props: {
    text: {
      type: String,
    },
    mp3: {
      type: String,
    },
    wiktionary: {
      type: Boolean,
    },
    l2: {
      type: Object,
    },
    forvo: {
      default: true,
    },
  },
  computed: {
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (this.l2) return this.l2;
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
    english() {
      return this.$languages.l1s.find((language) => language.code === "en");
    },
  },
  data() {
    return {
      canSpeak: false,
    };
  },
  async mounted() {
    await this.$getDictionary();
    this.canSpeak =
      (this.mp3 && !this.mp3.endsWith(".flac")) ||
      (this.text &&
        this.$languages.hasFeature(
          this.$l1 || this.english,
          this.$l2,
          "speech"
        ));
  },
  methods: {
    // https://www.npmjs.com/package/ogv
    playWithOGV(url) {
      // Create a new player with the constructor
      var ogv = require("ogv");
      ogv.OGVLoader.base = "/vendor/ogv";
      var player = new ogv.OGVPlayer();

      // Now treat it just like a video or audio element
      this.$refs.player.appendChild(player);
      player.src = url;
      player.play();
      player = null
    },
    playAudio(url) {
      let audio = new Audio(url);
      audio.play();
    },
    onClick() {
      if (this.canSpeak) this.speak();
      else
        window.open(`https://forvo.com/search/${this.text}/${this.$l2.code}`);
    },
    speak(speed = 0.75, volume = 1) {
      if (this.mp3) {
        let url = this.wiktionary ? commons(`File:${this.mp3}`) : this.mp3;
        if (url.endsWith(".ogg")) {
          this.playWithOGV(url);
        } else {
          this.playAudio(url);
        }
      } else if (this.text) {
        if (this.$languages.hasFeature(this.$l1, this.$l2, "speech")) {
          speak(this.text, this.$l2, speed, volume);
        }
      }
    },
  },
};
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
