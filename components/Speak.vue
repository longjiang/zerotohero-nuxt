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
  data() {
    return {
      canSpeak: false,
    };
  },
  async mounted() {
    await this.$getDictionary();
    const hasAudioFile = this.mp3 && !this.mp3.endsWith(".flac");
    const english = this.$languages.getSmart("en");
    const l1 = this.$l1 || english;
    const l2 = this.l2 || this.$l2;
    const hasSpeechFeature = l1 && l2 ? this.$languages.hasFeature(l1, l2, "speech") : false;
    const canGenerateSpeech = this.text && hasSpeechFeature
    this.canSpeak = hasAudioFile || canGenerateSpeech;
  },
  methods: {
    // https://www.npmjs.com/package/ogv
    playWithOGV(url) {
      // Create a new player with the constructor
      var ogv = require("ogv");
      ogv.OGVLoader.base = "/vendor/ogv";
      var player = new ogv.OGVPlayer();

      // Now treat it just like a video or audio element
      if (this.$refs.player) {
        this.$refs.player.appendChild(player);
        player.src = url;
        player.play();
        player = null;
      }
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
        if (this.canSpeak) {
          const l2 = this.l2 || this.$l2
          if (l2) speak(this.text, l2, speed, volume);
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
