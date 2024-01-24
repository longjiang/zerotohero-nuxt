<template>
  <span
    v-observe-visibility="{
      callback: visibilityChanged,
      once: true,
    }"
  >
    <span v-if="translation">{{ translation }}</span>
    <span v-else style="opacity: 0">{{ text }}</span>
  </span>
</template>

<script>
import { timeout } from "../lib/utils";
export default {
  name: "Translate",
  props: {
    text: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      translation: "",
    };
  },
  methods: {
    async visibilityChanged(isVisible) {
      if (isVisible) {
        this.translate(this.text);
      }
    },
    async translate(text) {
      try {
        let translator =
          this.$languages.getTranslator(this.$l1, this.$l2) || [];
        this.translation = await translator.translateWithBing({
          text,
          l1Code: this.$l1.code,
          l2Code: this.$l2.code,
        });
      } catch (error) {
        console.error("Translation failed:", error);
        this.translation = "Translation error";
      }
    },
  },
};
</script>
