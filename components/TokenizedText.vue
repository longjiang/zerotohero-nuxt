<template>
  <span class="d-inline-flex align-items-start justify-content-between">
    <!-- the tokenized text + translation -->
    <div style="flex: 1">
      <!-- the tokenized text -->
      <div
        class="use-zoom"
        v-observe-visibility="{
          callback: visibilityChanged,
          once: true,
        }"
      >
        <div v-if="editMode && tokenized">
          <textarea
            class="annotate-input"
            @blur="editBlur"
            @click.stop="dummyFunction"
            ref="textarea"
            :value="sanitizedText"
          ></textarea>
        </div>
        <template v-else-if="tokenized">
          <template v-for="(token, index) in tokens"
            >{{ typeof token === "string" ? token : ""
            }}<word-block
              v-if="typeof token !== 'string'"
              :key="index"
              :token="token"
              :context="context ? { ...context, text } : { text }"
              :mappedPronunciation="token.mappedPronunciation"
          /></template>
        </template>
        <template v-else>{{ sanitizedText }}</template>
      </div>
      <!-- the translation -->
      <div
        class="annotate-translation"
        v-if="showTranslation && translationData"
      >
        {{ translationData }}
      </div>
    </div>
    <SimpleButton
      iconClass="fa fa-ellipsis-v"
      @click="showModal"
      :title="$t('Actions')"
      v-if="showMenu"
    />
  </span>
</template>

<script>
import { timeout, stripTags } from "@/lib/utils";

export default {
  name: "TokenizedText",
  props: {
    text: {
      type: String,
      required: true,
    },
    context: {
      type: Object, // { starttime = undefined, youtube_id = undefined}
      required: false,
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
    translation: {
      // e.g. parallelLine passed from TranscriptLine
      type: String,
    },
    showTranslation: {
      type: Boolean,
      default: true,
    },
    showMenu: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      tokenized: false,
      translationData: this.translation, // So we don't mutate the prop when we translate our own text
      tokens: [],
      editMode: false,
      textData: this.text // So we don't mutate the prop when we edit our own text
    };
  },
  computed: {
    sanitizedText() {
      return stripTags(this.textData || this.text).trim();
    },
    phraseSaved() {
      return this.$refs["savePhrase"] && this.$refs["savePhrase"].saved;
    },
  },
  watch: {
    translationData(translation) {
      if (translation) this.$emit("translation", translation);
    },
    editMode(editMode) {
      if (editMode) {
        this.$nextTick(() => {
          this.adjustTextareaHeight();
        });
      }
    }
  },
  methods: {
    dummyFunction(target) {},
    async editBlur(e) {
      let newText = e.target.value;
      if (newText) {
        this.textData = newText;
        this.tokenize();
        this.editMode = false;
        this.$emit("textChanged", newText);
      }
    },
    adjustTextareaHeight() {
        const textarea = this.$refs["textarea"];
        textarea.style.height = 'auto'; // Reset height
        textarea.style.height = textarea.scrollHeight + 'px'; // Set to scrollHeight
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
    visibilityChanged(visible) {
      if (visible && !this.tokenized) {
        this.tokenize()
      }
    },
    async tokenize() {
      let dictionary = await this.$getDictionary();
      this.tokens = await dictionary.tokenizeWithCache(this.sanitizedText);
      this.tokenized = true;
      this.$emit("annotated", true);
    },
    /**
     * @param {Number} startFrom Starting time in seconds
     */
    async playAnimation(startFrom = 0) {
      if (this.tokenized) {
        this.animate = true;
        if (this.animationDuration) {
          let wordBlockComponents = this.$children; // directly get the word block components

          if (wordBlockComponents?.length > 0) {
            let durationAlreadyPlayed = 0;
            for (const wb of wordBlockComponents) {
              let blockLength = wb.token?.text?.length || 0;
              let blockDuration =
                (blockLength / this.sanitizedText.length) *
                this.animationDuration;

              if (blockDuration === 0) continue;

              durationAlreadyPlayed = durationAlreadyPlayed + blockDuration;

              // Which ones should skip
              if (durationAlreadyPlayed > startFrom) {
                if (!this.animate) return;
                const blockAnimationDuration =
                  blockDuration / this.animationSpeed;
                wb.playAnimation(blockAnimationDuration);
                await timeout(blockAnimationDuration * 1000);
              }
            }
          }
        }
      } else {
        const timeBeforeRetry = Date.now();

        this.$on("annotated", () => {
          this.$nextTick(() => {
            const delay = (Date.now() - timeBeforeRetry) / 1000;
            this.playAnimation(startFrom + delay);
          });
        });
      }
    },
    async pauseAnimation() {
      this.animate = false;
    },
  },
};
</script>
<style>
.annotate-input {
    width: 100%;
    resize: none; /* to prevent manual resizing */
    overflow: hidden;
}
</style>