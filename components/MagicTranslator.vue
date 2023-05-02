<template>
  <div>
    <div class="bing-clipping">
      <div
        :class="`blocking-div ${clickthrough ? 'clickthrough' : ''}`"
        @mouseover="futurePaste()"
      >
        <i class="fas fa-language" v-if="!pasted"></i>
        <i class="fas fa-check" v-if="pasted"></i>
      </div>
      <iframe
        class="bing-iframe"
        :src="`https://www.bing.com/translator/?from=auto&to=en&text=${
          text + emojis
        }`"
        :key="`text-${text + emojis}`"
        frameborder="0"
      ></iframe>
    </div>
    <div
      class="bing-source-text"
      ref="mockBingSourceText"
      v-html="this.text.trim()"
    ></div>
  </div>
</template>

<script>
// Each Smiley height is 21.0505px
// Client height WAS 226px
// Target height is 801px

import { timeout } from "@/lib/utils";

export default {
  props: {
    text: {
      type: String,
    },
  },
  mounted() {
    this.padMojis();
    console.log(this.text)
    // console.log(this.$refs.mockBingSourceText.clientHeight);
  },
  data() {
    return {
      pasted: undefined,
      clickthrough: false,
      emojis: "",
    };
  },
  watch: {
    text() {
      this.padMojis();
    },
  },
  methods: {
    padMojis() {
      this.eomjis = "";
      let desiredTextHeight = 750;
      let sourceTextHeight = Math.max(70, this.$refs.mockBingSourceText.clientHeight);
      let emojiHeight = 21;
      let numEmojis = parseInt(
        (desiredTextHeight - sourceTextHeight) / emojiHeight
      );
      let emojis = "";
      for (let i = 0; i < numEmojis; i++) {
        emojis += "%0A😊";
      }
      this.emojis = emojis;
    },
    async testMojis() {
      for (let i = 0; i < 100; i++) {
        await timeout(100);
        let sourceTextHeight = this.$refs.mockBingSourceText.clientHeight;
        sourceTextHeight = Math.max(120, sourceTextHeight);
        this.emojis += "😊<br/>";
      }
    },
    async paste() {
      let pasted = await navigator.clipboard.readText();
      pasted = pasted.replace(/\n😊/g, '')
      this.$emit("translation", pasted);
      console.log(pasted)
      this.pasted;
    },
    async futurePaste() {
      if (!this.pasted) {
        navigator.clipboard.writeText("");
        this.clickthrough = true;
        await timeout(1000);
        this.paste();
        this.clickthrough = false;
      }
    },
  },
};
</script>


<style lang="scss" scoped>
.bing-clipping {
  width: 50px;
  height: 50px;
  overflow: hidden;
  position: relative;
  border: 1px solid chocolate;
  .blocking-div {
    background: #ff0000;
    width: 50px;
    height: 50px;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 1;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    // opacity: 0.5;
    // left: 617px;
    // top: 1053px;
    &.clickthrough {
      pointer-events: none;
    }
  }
  .bing-iframe {
    overflow: hidden;
    width: 1000px;
    height: 2000px;
    position: absolute;
    left: -617px;
    top: -1053px;
  }
}

.bing-source-text {
  color: red;
  position: absolute;
  visibility: hidden;
  left: -9999px;
  width: 242.8px;
  direction: ltr;
  font-family: Roboto, sans-serif;
  font-size: 18px;
  font-stretch: 100%;
  font-style: normal;
  font-variant-caps: normal;
  font-variant-east-asian: normal;
  font-variant-ligatures: normal;
  font-variant-numeric: normal;
  font-weight: 400;
  letter-spacing: normal;
  line-height: 21.1px;
  text-align: start;
  text-indent: 0px;
  text-shadow: none;
  text-transform: none;
  white-space: pre-wrap;
  word-spacing: 0px;
}
</style>