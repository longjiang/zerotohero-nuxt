<template>
  <div>
    <div class="d-none">
      <slot></slot>
    </div>
    <RecursiveRenderer :node="processedNode" v-if="processedNode" />
  </div>
</template>

<script>
import TokenizedText from "./TokenizedText.vue";

export default {
  components: {
    TokenizedText,
  },
  data() {
    return {
      processedNode: null,  // change here
    };
  },
  mounted() {
    if (this.$slots.default && this.$slots.default.length > 0) {
      const node = this.$slots.default[0].elm;
      if (node) this.processedNode = this.processNode(node);  // change here
    }
  },
  methods: {
    processNode(node) {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== "") {
        return {
          type: "text",
          text: node.textContent.trim(),
        };
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        let children = [];
        node.childNodes.forEach((childNode) => {
          const processedChild = this.processNode(childNode);
          if (processedChild) {
            children.push(processedChild);
          }
        });

        return {
          type: node.nodeName.toLowerCase(),
          children: children,
        };
      }
    },
  },
};
</script>
