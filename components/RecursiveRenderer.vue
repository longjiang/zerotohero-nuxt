<template>
  <!-- Base case: if node is a text node, render it -->
  <span v-if="node.type === 'text'">
    <TokenizedText
      v-for="(sentence, index) in tokenizeText(node.text)"
      :key="index"
      :text="sentence"
      @="forwardEvent"
      ref="tokenizedTexts"
    />
  </span>

  <!-- Base case: if the node is type 'code' or 'pre', or any of the non-text types like images, render it as is -->
  <span
    v-else-if="
      ['code', 'pre', 'image', 'video', 'audio', 'iframe', 'hr', 'br'].includes(
        node.type
      )
    "
  >
    <div :is="node.type" v-html="node.element.outerHTML" />
  </span>
  <!-- If node is a non-text node, render it recursively -->
  <span v-else>
    <div :is="node.type">
      <RecursiveRenderer
        v-for="(child, index) in node.children"
        :node="child"
        :key="index"
        @="forwardEvent"
        ref="recursiveRenderers"
      />
    </div>
  </span>
</template>

<script>
import TokenizedText from "./TokenizedText.vue";
import { SpeechSingleton } from "@/lib/utils";
import sbd from "sbd";

export default {
  props: {
    node: Object,
  },
  components: {
    RecursiveRenderer: () => import("./RecursiveRenderer.vue"),
    TokenizedText,
  },
  methods: {
    async speak() {
      // Check if we have a <TokenizedText> component
      if (this.$refs.tokenizedTexts) {
        // Speak each <TokenizedText> component in order
        for (let i = 0; i < this.$refs.tokenizedTexts.length; i++) {
          await this.$refs.tokenizedTexts[i].speak();
        }
      }
      // Otherwise speak the <RecursiveRenderer> component
      else if (
        this.$refs.recursiveRenderers?.length
      ) {
        for (let i = 0; i < this.$refs.recursiveRenderers.length; i++) {
          if (typeof this.$refs.recursiveRenderers[i].speak === "function") {
            await this.$refs.recursiveRenderers[i].speak();
          }
        }
      }
      // Otherwise just speak the sanitized text
      else {
        await SpeechSingleton.instance.speak({
          l2: this.$l2,
          text: this.node.element.textContent,
        });
      }
      return true;
    },
    forwardEvent(event) {
      if (event && event.name) {
        this.$emit(event.name, event.payload);
      }
    },
    tokenizeText(text) {
      // Use sbd library to tokenize the text into sentences
      const sentences = sbd.sentences(text);
      return sentences;
    },
  },
};
</script>
