<template>
  <div>
    <!-- Conditionally render tokenized text -->
    <span class="d-inline-flex align-items-start justify-content-between">
      <!-- If there's text or a text node -->
      <div style="flex: 1" v-if="text || (processedNode && processedNode.type === 'text')">
        <TokenizedText :text="text || processedNode.text" :context="context" />
        <!-- the translation -->
        <div class="annotate-translation" v-if="showTranslation && translationData">
          {{ translationData }}
        </div>
      </div>

      <!-- If processedNode is a non-text node, render it -->
      <div v-else-if="processedNode && processedNode.type !== 'text'">
        <RecursiveRenderer :node="processedNode" />
      </div>

      <!-- Default case: render the slot content -->
      <div v-else>
        <slot></slot>
      </div>

      <!-- Action Button -->
      <SimpleButton
        iconClass="fa fa-ellipsis-v"
        @click="showModal"
        :title="$t('Actions')"
        v-if="showMenu"
      />
    </span>
  </div>
</template>

<script>
import TokenizedText from "./TokenizedText.vue";
import { stripTags } from "@/lib/utils";

export default {
  props: {
    text: {
      type: String,
      default: null,
    },
    context: {
      type: Object,
      required: false,
    },
    translation: {
      type: String,
    },
    showTranslation: {
      type: Boolean,
      default: true,
    },
    showMenu: {
      type: Boolean,
      default: true,
    },
  },
  components: {
    TokenizedText,
  },
  data() {
    return {
      processedNode: null,
      translationData: this.translation, // For translation
      slotText: '', // this will store the text extracted from the slot
    };
  },
  computed: {
    sanitizedText() {
      // combine the text from the prop and from the slot, then sanitize
      return stripTags((this.text || '') + this.slotText).trim();
    },
    phraseSaved() {
      return this.$refs["savePhrase"] && this.$refs["savePhrase"].saved;
    },
  },
  mounted() {
    if (this.$slots.default && this.$slots.default.length > 0) {
      const node = this.$slots.default[0].elm;
      if (node) this.processedNode = this.processNode(node);
    }
    if (this.$slots.default && this.$slots.default.length > 0) {
      const node = this.$slots.default[0].elm;
      if (node) {
        this.processedNode = this.processNode(node);
        this.slotText = node.innerText || ''; // Extract the text content from the slot
      }
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
    showModal() {
      this.$nuxt.$emit("showTokenizedTextMenu", {
        text: this.sanitizedText,
        translation: this.translationData,
        editMode: this.editMode,
        phraseSaved: this.phraseSaved,
        callerComponent: this,
      });
    },
  },
};
</script>