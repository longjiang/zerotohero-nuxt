<template>
  <!-- Base case: if node is a text node, render it -->
  <span v-if="node.type === 'text'">
    <TokenizedText :text="node.text" @="forwardEvent" />
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

export default {
  props: {
    node: Object
  },
  components: {
    RecursiveRenderer: () => import('./RecursiveRenderer.vue'),
    TokenizedText
  }
};
</script>
