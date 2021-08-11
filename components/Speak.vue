<template>
  <client-only>
    <button class="speak focus-exclude" @click="speak">
      <i class="fas fa-volume-up"></i>
      <span v-if="!canSpeak">
        <img
          src="/img/forvo.svg"
          alt="Forvo"
          style="
            height: 0.8rem;
            width: 4rem;
            opacity: 0.5;
            margin-bottom: 0.2rem;
          "
        />
      </span>
      <div ref="player" class="hidden"></div>
    </button>
  </client-only>
</template>
<script>
import commons from "wikimedia-commons-file-path";
import Helper from "@/lib/helper";

export default {
  props: ["text", "mp3", "wiktionary"],
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
  data() {
    return {
      canSpeak: false,
    };
  },
  async mounted() {
    await this.$getDictionary();
    this.canSpeak = this.mp3 || (this.text && this.$hasFeature("speech"));
  },
  methods: {
    // https://www.npmjs.com/package/ogv
    f(url) {
      // Create a new player with the constructor
      var ogv = require("ogv");
      ogv.OGVLoader.base = "/vendor/ogv";
      var player = new ogv.OGVPlayer();

      // Now treat it just like a video or audio element
      this.$refs.player.appendChild(player);
      player.src = url;
      player.play();
    },
    speak() {
      if (this.mp3) {
        let url = this.wiktionary ? commons(`File:${this.mp3}`) : this.mp3;
        this.f(url);
      } else if (this.text) {
        if (this.$hasFeature("speech")) {
          Helper.speak(this.text, this.$l2, 0.75);
        } else {
          window.open(`https://forvo.com/search/${this.text}/${this.$l2.code}`);
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
