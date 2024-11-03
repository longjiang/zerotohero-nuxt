<!-- WordContext.vue -->
<!-- Use:
  <WordContext
    v-if="entry?.saved?.context"
    :word="entry"
    :key="`word-context-${entry.id}`"
  />
-->
<template>
  <div>
    <hr class="my-3" />
    <TokenizedRichText
      v-if="word?.saved?.context?.text"
      :text="word.saved.context.text"
      :context="word.saved.context"
    />
  </div>
</template>
<script>
export default {
  props: {
    word: {
      type: Object,
      required: true,
    },
  },
};
</script>
