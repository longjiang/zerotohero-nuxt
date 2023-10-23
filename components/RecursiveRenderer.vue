<template>
  <!-- Base case: if node is a text node, render it -->
  <span v-if="node.type === 'text'">
    <TokenizedText v-for="(sentence, index) in tokenizeText(node.text)" :key="index" :text="sentence" @="forwardEvent" />
  </span>
  <!-- If node is a non-text node, render it recursively -->
  <span v-else-if="['span', 'p', 'em', 'strong', 'div'].includes(node.type)">
    <div :is="node.type">
      <RecursiveRenderer v-for="(child, index) in node.children" :node="child" :key="index" @="forwardEvent" />
    </div>
  </span>
</template>

<script>
import TokenizedText from "./TokenizedText.vue";
import sbd from "sbd";

export default {
  props: {
    node: Object
  },
  components: {
    RecursiveRenderer: () => import('./RecursiveRenderer.vue'),
    TokenizedText
  },
  methods: {
    forwardEvent(event) {
      if (event && event.name) {
        this.$emit(event.name, event.payload);
      }
    },
    tokenizeText(text) {
      // Use sbd library to tokenize the text into sentences
      return sbd.sentences(text);
    }
  }
};
</script>
