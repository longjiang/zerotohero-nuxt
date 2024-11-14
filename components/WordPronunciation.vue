<template>
  <span class="word-pronunciation" v-html="formattedPronunciation"></span>
</template>

<script>
import { transliterate as tr} from "transliteration";
import { convertPinyinToIPA } from "@/lib/utils";
import { addPitchAccent, convertPitchToUnderline, STYLIZED_NUMBERS } from "@/lib/utils";

export default {
  props: {
    word: {
      type: Object,
      required: true,
    },
  },
  computed: {
    formattedPronunciation() {
      let pronunciation = this.word.pronunciation;
      if (this.$l2.code === "vi") {
        pronunciation = pronunciation.replace(/\[\[(.+?)#Vietnamese\|.+?]]/g, "$1");
      } else if (this.$l2.code === "tlh") {
        pronunciation = Klingon.latinToIPA(this.word.head);
      } else if (this.word.kana) {
        pronunciation = this.word.kana;
      } else if (this.word.jyutping && this.word.pinyin) {
        pronunciation = [this.word.jyutping, this.word.pinyin].join(", ");
      } else if (
        !pronunciation &&
        this.$hasFeature("transliteration") &&
        !["tlh", "fa", "ja"].includes(this.$l2.code)
      ) {
        pronunciation = tr(this.word.head);
      }

      if (this.$l2.code === "ja" && this.word.accentPatterns?.length) {
        const accentedPronunciations = addPitchAccent(pronunciation, this.word.accentPatterns);
        const pronunciations = accentedPronunciations.map(p => p.replace(/↑/g, "").replace(/↓/g, "ꜜ")) // Alternatively ⌝
        // Make unique
        pronunciation = [...new Set(pronunciations)].join(', ');
      }

      let formattedPronunciation = pronunciation ? `[${pronunciation}]` : "";
      if (this.$l2.code === "tlh") {
        formattedPronunciation = this.word.head + " " + formattedPronunciation;
      }
      if (this.$l2.code === "zh") {
        formattedPronunciation =
          this.word.pronunciation +
          " [" + convertPinyinToIPA(this.word.pronunciation) + "]";
      }
      if (this.$l2.code === "ja" && this.word.accentPatterns?.length) {
        formattedPronunciation += this.word.accentPatterns.map(p => STYLIZED_NUMBERS[0][p]).join(", ");
      }
      return formattedPronunciation;
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
