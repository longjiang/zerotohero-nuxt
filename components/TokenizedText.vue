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
            context: context || { text },
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
export default {
  name: "TokenizedText",
  props: {
    text: {
      type: String,
      required: true,
    },
    context: {
      type: Object, // { text, starttime = undefined, youtube_id = undefined}
      required: false,
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
      }
    },
  },
};
</script>

<style scoped>
/* Your component's styles here */
</style>
