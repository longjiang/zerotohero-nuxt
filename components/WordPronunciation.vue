<template>
  <span class="word-pronunciation" v-html="formattedPronunciation"></span>
</template>

<script>
import { transliterate as tr} from "transliteration";
import { convertPinyinToIPA } from "@/lib/utils";
import { addPitchAccent, formatPronunciation, STYLIZED_NUMBERS } from "@/lib/utils";

export default {
  props: {
    word: {
      type: Object,
      required: true,
    },
  },
  computed: {
    formattedPronunciation() {
      return formatPronunciation({
        word: this.word,
        langCode: this.$l2.code,
        hasFeature: (feature) => this.$hasFeature(feature)
      });
    },
  },
  methods: {
    convertPinyinToIPA(text) {
      // Convert Pinyin pronunciation to IPA format if needed
      return text;
    },
  },
};
</script>

<style lang="scss" scoped>
.word-pronunciation {
  color: #779bb5;
  font-family: AndikaW, Andika, Arial, sans-serif;
  :deep(u) {
    text-decoration: overline;
  }
}
</style>
