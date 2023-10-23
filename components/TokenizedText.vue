<template>
  <span
    class="use-zoom"
    v-observe-visibility="{
      callback: visibilityChanged,
      once: true,
    }"
  >
    <template v-if="tokenized">
      <template v-for="(token, index) in tokens"
        >{{ typeof token === "string" ? token : ""
        }}<WordBlock
          v-if="typeof token !== 'string'"
          :key="index"
          v-bind="{
            token,
            context: context ? { ...context, text } : { text },
            mappedPronunciation: token.mappedPronunciation,
          }"
        />
      </template>
    </template>
    <template v-else>
      {{ text }}
    </template>
  </span>
</template>

<script>
import { timeout } from "@/lib/utils";

export default {
  name: "TokenizedText",
  props: {
    text: {
      type: String,
      required: true,
    },
    context: {
      type: Object, // { starttime = undefined, youtube_id = undefined}
      required: false,
    },
    animationDuration: {
      type: Number,
      required: false,
    },
    animationSpeed: {
      type: Number,
      required: false,
      default: 1,
    },
  },
  data() {
    return {
      tokenized: false,
      tokens: [],
    };
  },
  methods: {
    async visibilityChanged(visible) {
      if (visible && !this.tokenized) {
        let dictionary = await this.$getDictionary();
        this.tokens = await dictionary.tokenizeWithCache(this.text);
        this.tokenized = true;
        this.$emit("annotated", true);
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
            let aggregateTextLength = this.text.length; // use this.text directly

            let durationAlreadyPlayed = 0;
            for (const wb of wordBlockComponents) {
              let blockLength = wb.text?.length || 0;
              let blockDuration =
                (blockLength / aggregateTextLength) * this.animationDuration;

              if (blockDuration === 0) continue;

              durationAlreadyPlayed = durationAlreadyPlayed + blockDuration;

              // Which ones should skip
              if (durationAlreadyPlayed > startFrom) {
                if (!this.animate) return;
                const animationDuration =
                  (blockDuration * 1000) / this.animationSpeed;
                const fadeDuration = animationDuration * 2000;
                wb.playAnimation(fadeDuration);
                await timeout(animationDuration);
              }
            }
          }
        }
      } else {
        const timeBeforeRetry = Date.now();
        
        this.$on('annotated', () => {
            this.$nextTick(() => {
              const delay = (Date.now() - timeBeforeRetry) / 1000;
              this.playAnimation(startFrom + delay);
            })
        })
      }
    },
    async pauseAnimation() {
      this.animate = false;
    },
  },
};
</script>
