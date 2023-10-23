<template>
  <span
    class="use-zoom"
    v-observe-visibility="{
      callback: visibilityChanged,
      once: true,
    }"
  >
    <template v-if="tokenized">
      <template v-for="(token, index) in tokens">
        {{ typeof token === "string" ? token : "" }}
        <word-block
          v-if="typeof token !== 'string'"
          :key="index"
          :token="token"
          :context="context ? { ...context, text } : { text }"
          :mappedPronunciation="token.mappedPronunciation"
        />
      </template>
    </template>
    <template v-else>{{ sanitizedText }}</template>
  </span>
</template>

<script>
import { timeout, stripTags } from "@/lib/utils";

export default {
  name: "TokenizedText",
  // Provide/Inject: Vue provides a provide and inject mechanism which is
  // aimed at deep component nesting. A parent component can "provide" properties,
  // and any nested child component can "inject" those properties without them
  // being passed through each level of the component tree.
  inject: ["context", "animationDuration", "animationSpeed"],
  props: {
    text: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      tokenized: false,
      translationData: this.translation, // So we don't mutate the prop when we translate our own text
      tokens: [],
      editMode: false,
      textData: this.text, // So we don't mutate the prop when we edit our own text
    };
  },
  computed: {
    sanitizedText() {
      return stripTags(this.textData || this.text).trim();
    },
    phraseSaved() {
      return this.$refs["savePhrase"] && this.$refs["savePhrase"].saved;
    },
  },
  methods: {
    visibilityChanged(visible) {
      if (visible && !this.tokenized) {
        this.tokenize();
      }
    },
    async tokenize() {
      let dictionary = await this.$getDictionary();
      this.tokens = await dictionary.tokenizeWithCache(this.sanitizedText);
      this.tokenized = true;
      this.$emit("annotated", true);
    },
    async checkSavedWords() {
      // Give a brief delay to allow the WordBlocks components to render fully.
      await timeout(300);

      // If there are children present
      if (this.$children?.length > 0) {
        // Initialize an empty array to store saved words from all WordBlocks components
        let savedWords = [];

        // Loop through each WordBlocks component (direct child)
        for (let wordBlockComponent of this.$children) {
          // Check if the component has a savedWord property and add it to the savedWords array
          if (wordBlockComponent.savedWord) {
            savedWords.push(wordBlockComponent.savedWord);
          }
        }

        // If there are any saved words found, emit an event with the saved words
        if (savedWords.length > 0) {
          this.$emit("savedWordsFound", savedWords);
        }
      }
    },

    /**
     * @param {Number} startFrom Starting time in seconds
     */
    async playAnimation(startFrom = 0) {
      if (this.tokenized) {
        this.animate = true;
        if (this.animationDuration) {
          let wordBlockComponents = this.$children; // directly get the word block components

          if (wordBlockComponents?.length > 0) {
            let durationAlreadyPlayed = 0;
            for (const wb of wordBlockComponents) {
              let blockLength = wb.token?.text?.length || 0;
              let blockDuration =
                (blockLength / this.sanitizedText.length) *
                this.animationDuration;

              if (blockDuration === 0) continue;

              durationAlreadyPlayed = durationAlreadyPlayed + blockDuration;

              // Which ones should skip
              if (durationAlreadyPlayed > startFrom) {
                if (!this.animate) return;
                const blockAnimationDuration =
                  blockDuration / this.animationSpeed;
                wb.playAnimation(blockAnimationDuration);
                await timeout(blockAnimationDuration * 1000);
              }
            }
          }
        }
      } else {
        const timeBeforeRetry = Date.now();

        this.$on("annotated", () => {
          this.$nextTick(() => {
            const delay = (Date.now() - timeBeforeRetry) / 1000;
            this.playAnimation(startFrom + delay);
          });
        });
      }
    },
    async pauseAnimation() {
      this.animate = false;
    },
  },
};
</script>
<style>
.annotate-input {
  width: 100%;
  resize: none; /* to prevent manual resizing */
  overflow: hidden;
}
</style>
