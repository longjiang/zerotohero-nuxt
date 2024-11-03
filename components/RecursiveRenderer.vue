<template>
  <!-- Base case: if node is a text node, render it -->
  <span v-if="node.type === 'text'">
    <TokenizedText
      v-for="(sentence, index) in sentences"
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
  <span v-else-if="['a'].includes(node.type)">
    <ReaderLink v-once v-bind="attributesObject">
      <RecursiveRenderer
        v-for="(child, index) in node.children"
        :node="child"
        :key="index"
        v-on="$listeners"
        ref="recursiveRenderers"
      />
    </ReaderLink>
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
    sentences() {
      const text = this.node.text;
      // 句点に加え、行末や特定の言語の文区切りに対応
      const sentences = text.match(/[^.!?。！？\n]+[.!?。！？\n]*/g) || [text];
      return sentences;
    },
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
    /**
     * Check if an attribute name is valid and should be preserved.
     * This function can be modified to allow more or block certain attributes as needed.
     * @param {String} attrName The name of the attribute to check.
     * @return {Boolean} Returns true if the attribute should be preserved.
     */
    isValidAttrName(attrName) {
      // List of attributes to exclude (commonly event handlers or potentially unsafe attributes)
      const excludedAttributes = [
        'onclick', 'onerror', 'onload', 'onmouseover', 'onfocus', 'onblur',
        'onsubmit', 'onreset', 'onresize', 'onkeydown', 'onkeypress', 'onkeyup',
        'oncontextmenu'
      ];

      // Check if the attribute is in the excluded list
      if (excludedAttributes.includes(attrName.toLowerCase())) {
        return false;
      }

      // Further checks can be added here to customize which attributes are allowed
      // For example, you might want to allow only 'class', 'id', 'data-*', etc.

      // Allow all attributes not explicitly excluded
      return true;
    },
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
  },
};
</script>
