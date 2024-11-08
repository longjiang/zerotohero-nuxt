<!-- TokenizedRichText.vue -->
<template>
  <div>
    <!-- Conditionally render tokenized text -->
    <span class="annotate-text-wrapper" :dir="$l2.direction">
      <!-- When the user wants to edit the text, show a textarea -->

      <textarea
        v-if="editMode"
        class="annotate-input"
        @blur="editBlur"
        @click.stop="dummyFunction"
        ref="textarea"
        :value="sanitizedText"
      ></textarea>
      <div
        class="flex-1 w-100"
        :class="{ 'annotate-with-translation': translationData }"
        v-else
      >
        <!-- If there's text or a text node -->
        <div
          class="annotate-text"
          style="flex: 1"
          v-if="
            editedText ||
            text ||
            (processedNode && processedNode.type === 'text')
          "
          v-bind="processedNode ? processedNode.attributes : {}"
          :dir="$l2.direction"
        >
          <TokenizedText
            :text="editedText || text || (processedNode && processedNode.text)"
            :context="context"
            :animationDuration="animationDuration"
            :animationSpeed="animationSpeed"
            :useZoom="useZoom"
            v-on="$listeners"
            @annotated="annotated = true"
            ref="tokenizedText"
          />
        </div>

        <!-- If processedNode is a non-text node, render it -->
        <div
          v-else-if="processedNode && processedNode.type !== 'text'"
          class="annotate-text"
          v-bind="processedNode.attributes"
          :dir="$l2.direction"
        >
          <RecursiveRenderer
            :node="processedNode"
            v-on="$listeners"
            ref="recursiveRenderer"
          />
        </div>

        <!-- Default case: render the slot content -->
        <div v-else class="annotate-text" :dir="$l2.direction">
          <slot></slot>
        </div>
        <!-- the translation -->
        <div
          class="annotate-translation"
          v-if="showTranslation && translationData"
        >
          {{ translationData }}
        </div>
      </div>

      <!-- Action Button -->
      <div class="annotate-action-button" v-if="showMenu">
        <SimpleButton
          iconClass="fa fa-ellipsis-v"
          @click="showModal"
          :title="$t('Actions')"
        />
      </div>
    </span>
  </div>
</template>

<script>
import { stripTags, timeout } from "../lib/utils";
import { mapState } from "vuex";

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
    animationDuration: {
      type: Number,
      required: false,
    },
    animationSpeed: {
      type: Number,
      required: false,
      default: 1,
    },
    useZoom: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      editMode: false, // Whether the user is editing the text
      processedNode: null,
      slotText: "", // this will store the text extracted from the slot
      editedText: "", // this will store the text edited by the user
      translationData: this.translation, // For translation
      annotated: false,
    };
  },
  // Provide/Inject: Vue provides a provide and inject mechanism which is
  // aimed at deep component nesting. A parent component can "provide" properties,
  // and any nested child component can "inject" those properties without them
  // being passed through each level of the component tree.
  provide() {
    return {
      context: this.context,
      animationDuration: this.animationDuration,
      animationSpeed: this.animationSpeed,
    };
  },
  computed: {
    // 再帰的にTokenizedTextコンポーネントのみを取得
    allTokenizedTextDescendants(component) {
      let tokenizedTextComponents = [];

      function getDescendantsRecursive(comp) {
        // 子コンポーネントがTokenizedTextの場合、追加
        if (comp.$options.name === 'TokenizedText') {
          tokenizedTextComponents.push(comp);
        }

        // 各子コンポーネントの子孫も探索
        if (comp.$children && comp.$children.length > 0) {
          comp.$children.forEach((child) => {
            getDescendantsRecursive(child);
          });
        }
      }

      getDescendantsRecursive(component);

      return tokenizedTextComponents;
    },
    sanitizedText() {
      // combine the text from the prop and from the slot, then sanitize
      let textFromPropOrSlot = (this.text || "") + this.slotText; // this.text is a prop, this.slotText is from the slot
      // If the user has edited the text, use that instead
      return stripTags(this.editedText || textFromPropOrSlot).trim();
    },
    phraseSaved() {
      return this.$refs["savePhrase"] && this.$refs["savePhrase"].saved;
    },
    ...mapState({
      savedWords: (state) => state.savedWords,
    }),
  },
  watch: {
    // Watch for editMode changes
    editMode(newValue) {
      if (newValue) {
        this.$nextTick(() => {
          this.adjustTextareaHeight();
        });
      }
    },
    savedWords: {
      handler: function () {
        this.checkSavedWords();
      },
      deep: true,
    },
    translationData(translation) {
      if (translation) this.$emit("translation", translation);
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
        // Extract the text content from the slot
        this.slotText = node.textContent || ""; 
      }
    }
  },
  methods: {
    highlightFirstSentence() {
      const comp = this.$refs.recursiveRenderer;
      if (comp) {
        comp.highlightFirstSentence();
      }
    },
    removeHighlight() {
      const comp = this.$refs.recursiveRenderer;
      if (comp) {
        comp.removeHighlight();
      }
    },
    async speak() {
      // If we have a <TokenizedText /> speak it
      if (this.$refs.tokenizedText) {
        await this.$refs.tokenizedText.speak();
      }
      // If we have a <RecursiveRenderer /> speak it
      else if (this.$refs.recursiveRenderer) {
        await this.$refs.recursiveRenderer.speak();
      }
      return true;
    },
    dummyFunction(target) {},
    // captures the event name and payload, then re-emits the same event
    forwardEvent(event) {
      if (event && event.name) {
        this.$emit(event.name, event.payload);
      }
    },
    getTokenizedTextComponent() {
      return this.$children.find(
        (child) => child.$options.name === "TokenizedText"
      );
    },

    async delegateToTokenizedText(methodName, ...args) {

      const tokenizedTextComponent = this.getTokenizedTextComponent();

      if (tokenizedTextComponent && tokenizedTextComponent[methodName]) {
        await tokenizedTextComponent[methodName](...args);
      }
    },

    /**
     * @param {Number} startFrom Starting time in seconds
     */
    async playAnimation(startFrom = 0) {
      await timeout(50); // Give a brief delay to allow the WordBlocks components to render fully.
      await this.delegateToTokenizedText("playAnimation", startFrom);
    },

    async pauseAnimation() {
      await this.delegateToTokenizedText("pauseAnimation");
    },

    async checkSavedWords() {
      await this.delegateToTokenizedText("checkSavedWords");
    },
    async editBlur(e) {
      let newText = e.target.value;
      if (newText) {
        this.editedText = newText;
        this.editMode = false;
        this.$emit("textChanged", newText);
      }
    },
    adjustTextareaHeight() {
      const textarea = this.$refs["textarea"];
      textarea.style.height = "auto"; // Reset height
      textarea.style.height = textarea.scrollHeight + "px"; // Set to scrollHeight
    },
    processNode(node) {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== "") {
        return {
          type: "text",
          text: node.textContent.trim(),
        };
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        let attributes = {};
        node.getAttributeNames().forEach(attr => {
          attributes[attr] = node.getAttribute(attr);
        });

        let children = [];
        node.childNodes.forEach((childNode) => {
          const processedChild = this.processNode(childNode);
          if (processedChild) {
            children.push(processedChild);
          }
        });

        return {
          type: node.nodeName.toLowerCase(),
          attributes: attributes,
          children: children,
          element: node,
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
<style lang="scss">
.annotate-translation {
  opacity: 0.7;
  font-size: 0.8rem;
}
.annotate-text[dir="rtl"] {
  direction: rtl;
  text-align: right;
}
.annotate-text-wrapper {
  display: flex;
  justify-content: space-between;
  flex-direction: row;

  // Ensure the order is applied for RTL languages
  &[dir="rtl"] .annotate-action-button {
    order: 1;
  }

  // Ensure the order is correct for LTR languages
  &[dir="ltr"] .annotate-action-button {
    order: -1;
  }
}
</style>
