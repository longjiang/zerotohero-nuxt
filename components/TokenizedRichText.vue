<template>
  <div>
    <!-- Handle the case where the slot contains a text or the `text` prop is provided -->
    <TokenizedText v-if="text || (processedNode && processedNode.type === 'text')" :text="text || processedNode.text" />

    <!-- If processedNode is a non-text node, render it -->
    <div v-else-if="processedNode && processedNode.type !== 'text'">
      <RecursiveRenderer :node="processedNode" />
    </div>

    <!-- Default case: render the slot content -->
    <div v-else>
      <slot></slot>
    </div>
  </div>
</template>

<script>
import TokenizedText from "./TokenizedText.vue";

export default {
  props: {
    text: {
      type: String,
      default: null,
    },
  },
  components: {
    TokenizedText,
  },
  data() {
    return {
      processedNode: null,
    };
  },
  mounted() {
    if (this.$slots.default && this.$slots.default.length > 0) {
      const node = this.$slots.default[0].elm;
      if (node) this.processedNode = this.processNode(node);
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
