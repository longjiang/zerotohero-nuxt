<template>
  <!-- Base case: if node is a text node, render it -->
  <span v-if="node.type === 'text'">
    <TokenizedText v-for="(sentence, index) in tokenizeText(node.text)" :key="index" :text="sentence" @="forwardEvent" />
  </span>
  
  <!-- Base case: if the node is type 'code' or 'pre', or any of the non-text types like images, render it as is -->
  <span v-else-if="['code', 'pre', 'image', 'video', 'audio', 'iframe', 'hr', 'br'].includes(node.type)">
    <div :is="node.type" v-html="node.element.outerHTML" />
  </span>
  <!-- If node is a non-text node, render it recursively -->
  <span v-else>
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
      const sentences = sbd.sentences(text);
      return sentences
    }
  }
};
</script>
