<template>
  <!-- Base case: if node is a text node, render it -->
  <span v-if="node.type === 'text'">
    <TokenizedText
      v-for="(sentence, index) in breakSentencesAndTokenizeText(node.text)"
      :key="index"
      :text="sentence"
      v-on="$listeners"
      ref="tokenizedTexts"
      v-bind="attributesObject"
    />
  </span>
  
  <!-- Base case: if the node is type 'code' or 'pre', or any of the non-text types like images, render it as is -->
  <span
    v-else-if="
      ['code', 'pre', 'image', 'video', 'audio', 'iframe', 'hr', 'br', 'img'].includes(
        node.type
      )
    "
    v-html="node.element.outerHTML"
    v-bind="attributesObject"
  />
  <!-- For custom components, use vue-runtime-template -->
  <span v-else-if="['popupnote'].includes(node.type)">
    <v-runtime-template v-once :template="node.element.outerHTML" />
  </span>
  <span v-else v-bind="attributesObject">
    <div :is="node.type" v-bind="node.attributes">
      <RecursiveRenderer
        v-for="(child, index) in node.children"
        :node="child"
        :key="index"
        v-on="$listeners"
        ref="recursiveRenderers"
      />
    </div>
  </span>
</template>

<script>
import TokenizedText from "./TokenizedText.vue";
import popupnote from "./PopupNote.vue"; // Must be lower-case
import { SpeechSingleton } from "../lib/utils";
import VRuntimeTemplate from "v-runtime-template";

export default {
  props: {
    node: Object,
  },
  components: {
    RecursiveRenderer: () => import("./RecursiveRenderer.vue"),
    TokenizedText,
    popupnote,
    VRuntimeTemplate,
  },
  computed: {
    attributesObject() {
      if (this.node && this.node.element) {
        let attrs = {};
        for (let i = 0; i < this.node.element.attributes.length; i++) {
          const attrName = this.node.element.attributes[i].name;
          if (this.isValidAttrName(attrName)) {
            attrs[attrName] = this.node.element.attributes[i].value;
          }
        }
        return attrs;
      }
      return {};
    },
  },
  methods: {
    highlightFirstSentence() {
      if (this.$refs.recursiveRenderers) {
        this.$refs.recursiveRenderers[0].highlightFirstSentence();
      } else if (this.$refs.tokenizedTexts) {
        this.removeHighlight();
        this.$refs.tokenizedTexts[0].speaking = true;
      }
    },
    removeHighlight() {
      if (this.$refs.recursiveRenderers) {
        this.$refs.recursiveRenderers[0].removeHighlight();
      } else if (this.$refs.tokenizedTexts) {
        for (let i = 0; i < this.$refs.tokenizedTexts.length; i++) {
          this.$refs.tokenizedTexts[i].speaking = false;
        }
      }
    },
    async speak() {
      // Check if we have a <TokenizedText> component
      if (this.$refs.tokenizedTexts) {
        // Speak each <TokenizedText> component in order
        for (let i = 0; i < this.$refs.tokenizedTexts.length; i++) {
          await this.$refs.tokenizedTexts[i].speak();
        }
      }
      // Otherwise speak the <RecursiveRenderer> component
      else if (this.$refs.recursiveRenderers?.length) {
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
    breakSentencesAndTokenizeText(text) {
      // Sentence-breaking leads to large number of tokenization server requests, turning off for now...
      // // Use sbd library to tokenize the text into sentences
      // const sentences = sbd.sentences(text);
      // return [sentences];

      // Return the text as-is instead
      return [ text ];
    },
  },
};
</script>
