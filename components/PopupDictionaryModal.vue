<template>
  <!-- no-fade is turned on to prevent a "ghosted" modal on iOS that blocks and disables the entire UI -->
  <b-modal
    ref="popup-dictionary-modal"
    size="sm"
    centered
    hide-footer
    no-fade
    modal-class="safe-padding-top safe-padding-bottom py-5"
    :body-class="`popup-dictionary-modal-wrapper l2-${$l2 ? $l2.code : ''}`"
    :header-class="`popup-dictionary-modal-header l2-${$l2 ? $l2.code : ''}`"
    @show="$nuxt.$emit('popupOpened')"
    @hide="$nuxt.$emit('popupClosed')"
  >
    <template #modal-header="{ close }">
      <!-- Emulate built in modal header close button action -->
      <div class="d-flex justify-content-between w-100 align-items-center">
        <h5 class="mb-0">{{ info ? $tb('Note') : text }}</h5>
        <b-button size="sm" variant="outline-success" @click="close()">
          <i class="fas fa-times"></i> {{ $tb("Close") }}
        </b-button>
      </div>
    </template>
    <div
      v-if="info"
      class="popover-inner-hover-area"
    >
      {{ $t(info) }}
    </div>
    <div
      v-else
      class="popover-inner-hover-area"
    >
      <div
        v-if="
          (this.savedWord || this.savedPhrase) && this.quizMode && !this.reveal
        "
        class="popover-inner-hover-area"
      >
        {{ $t("Tap to show answer.") }}
      </div>
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
        @translation="translation = $event"
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
      info: false,
      lookupInProgress: false,
      loadingImages: false,
      info: null,
      savedPhrase: null,
      savedWord: null,
      quizMode: false,
      reveal: false,
    }
  },

  created() {
    this.$nuxt.$on('showPopupDictionary', this.show);
    this.$nuxt.$on('hidePopupDictionary', this.hide);
    this.$nuxt.$on('updatePopupDictionary', this.update);
  },
  beforeDestroy() {
    this.$nuxt.$off('showPopupDictionary', this.show);
    this.$nuxt.$off('hidePopupDictionary', this.hide);
    this.$nuxt.$off('updatePopupDictionary', this.update);
  },
  methods: {
    update({ token, text, context, phraseObj, words, images, info, savedPhrase, savedWord, quizMode, reveal }) {
      if (token) {
        this.token = token;
      }
      if (text) {
        this.text = text;
      }
      if (context) {
        this.context = context;
      }
      if (phraseObj) {
        this.phraseObj = phraseObj;
      }
      if (words) {
        this.words = words;
      }
      if (images) {
        this.images = images;
      }
      if (info) {
        this.info = info;
      }
      if (savedPhrase) {
        this.savedPhrase = savedPhrase;
      }
      if (savedWord) {
        this.savedWord = savedWord;
      }
      if (quizMode) {
        this.quizMode = quizMode;
      }
      if (reveal) {
        this.reveal = reveal;
      }
    },
    show({ token, text, context, phraseObj, words, images, info, savedPhrase, savedWord, quizMode, reveal }) {
      this.update({ token, text, context, phraseObj, words, images, info, savedPhrase, savedWord, quizMode, reveal });
      this.$refs["popup-dictionary-modal"].show();
    },
    hide() {
      this.$refs["popup-dictionary-modal"].hide();
    },
  },
}
</script>
<style lang="scss">
.popup-dictionary-modal-header {
  border-bottom: none;
  padding-bottom: 0;
}
</style>