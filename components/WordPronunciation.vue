<template>
  <span class="word-pronunciation" v-html="formattedPronunciation"></span>
</template>

<script>
import { transliterate as tr} from "transliteration";
import { convertPinyinToIPA } from "@/lib/utils";
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
        const accentedPronunciations = this.addPitchAccent(pronunciation, this.word.accentPatterns);
        pronunciation = accentedPronunciations.map(p => this.convertPitchToUnderline(p)).join(', ');
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
        formattedPronunciation += ' (' + this.word.accentPatterns.join(', ') + ')';
      }
      return formattedPronunciation;
    },
  },
  methods: {
    addPitchAccent(hiragana, accentPatterns) {
      // Define small kana characters
      const smallKanaSet = new Set(["ぁ", "ぃ", "ぅ", "ぇ", "ぉ", "っ", "ゃ", "ゅ", "ょ", "ゎ", "ゕ", "ゖ"]);

      // Function to split hiragana into moras
      function splitIntoMoras(hiraganaStr) {
        const moras = [];
        let currentMora = "";
        for (let i = 0; i < hiraganaStr.length; i++) {
          const c = hiraganaStr[i];
          if (smallKanaSet.has(c)) {
            // Small kana, append to current mora
            currentMora += c;
          } else {
            // Base kana
            if (currentMora !== "") {
              moras.push(currentMora);
            }
            currentMora = c;
          }
        }
        if (currentMora !== "") {
          moras.push(currentMora);
        }
        return moras;
      }

      // Function to apply accent pattern to moras
      function applyAccentPattern(moras, accentPattern) {
        let result = "";
        for (let i = 0; i < moras.length; i++) {
          result += moras[i];
          if (accentPattern === 0 && i === 0) {
            result += "↑";
          } else if (accentPattern === 1 && i === 0) {
            result += "↓";
          } else if (accentPattern >= 2) {
            if (i === 0) {
              result += "↑";
            }
            if (i === accentPattern - 1) {
              result += "↓";
            }
          }
        }
        return result;
      }

      // Main processing
      const moras = splitIntoMoras(hiragana);
      const results = accentPatterns.map((pattern) => applyAccentPattern(moras, pattern));
      return results;
    },
    convertPitchToUnderline(text) {
      // Define the regex patterns for different cases
      const upDownPattern = /\u2191([^\u2193]*)\u2193/g; // Up arrow followed by down arrow
      const upPattern = /\u2191([^\u2193]*)/g; // Only up arrow
      const downPattern = /([^\u2191]*)\u2193/g; // Only down arrow

      // Replace up-down pattern with <u> tags
      let result = text.replace(upDownPattern, (match, p1) => {
        return `<u>${p1}</u>`;
      });

      // Replace up arrow pattern with <u> tags for all after it
      result = result.replace(upPattern, (match, p1) => {
        return `<u>${p1}</u>`;
      });

      // Replace down arrow pattern with <u> tags for all before it
      result = result.replace(downPattern, (match, p1) => {
        return `<u>${p1}</u>`;
      });

      return result;
    },
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
  u {
    text-decoration: overline;
  }
}
</style>
