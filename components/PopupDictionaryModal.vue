<template>
  <b-modal
    ref="popup-dictionary-modal"
    size="sm"
    centered
    hide-footer
    modal-class="safe-padding-top mt-4"
    :title="$tb('Dictionary')"
    :body-class="`popup-dictionary-modal-wrapper l2-${$l2.code}`"
    @show="$nuxt.$emit('popupOpened')"
    @hide="$nuxt.$emit('popupClosed')"
  >
    <div
      v-if="quizModeItem"
      class="popover-inner-hover-area"
    >
      {{ $t("Tap to show answer.") }}
    </div>
    <div
      v-else
      class="popover-inner-hover-area"
    >
      <WordBlockPopup
        v-bind="{
          text,
          token,
          words,
          images,
          lookupInProgress,
          loadingImages,
          context,
          phraseObj,
        }"
        ref="popup"
      />
    </div>
  </b-modal>
</template>
<script>
export default {
  props: {
  },
  data() {
    return {
      token: null,
      text: null,
      context: null,
      phraseObj: null,
      words: null,
      images: null,
      quizModeItem: false,
      lookupInProgress: false,
      loadingImages: false,
    }
  },

  created() {
    this.$nuxt.$on('showPopupDictionary', this.show);
    this.$nuxt.$on('hidePopupDictionary', this.hide);
  },
  beforeDestroy() {
    this.$nuxt.$off('showPopupDictionary', this.show);
    this.$nuxt.$off('hidePopupDictionary', this.hide);
  },
  methods: {
    show(token, text, context, phraseObj, words, images, quizModeItem) {
      this.token = token;
      this.text = text;
      this.context = context;
      this.phraseObj = phraseObj;
      this.words = words;
      this.images = images;
      this.quizModeItem = quizModeItem;
      this.$refs["popup-dictionary-modal"].show();
    },
    hide() {
      this.$refs["popup-dictionary-modal"].hide();
    },
  },
}
</script>