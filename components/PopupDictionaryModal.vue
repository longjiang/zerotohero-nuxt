<template>
  <b-modal
    ref="popup-dictionary-modal"
    size="sm"
    centered
    hide-footer
    modal-class="safe-padding-top mt-4"
    :title="$tb(info ? 'Note' : 'Dictionary')"
    :body-class="`popup-dictionary-modal-wrapper l2-${$l2?.code}`"
    @show="$nuxt.$emit('popupOpened')"
    @hide="$nuxt.$emit('popupClosed')"
  >
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
      <WordBlockPopup
        v-bind="{
          words,
          images,
          text,
          token,
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
      info: false,
      lookupInProgress: false,
      loadingImages: false,
      info: null,
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
    update({ token, text, context, phraseObj, words, images, info }) {
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
      this.info = info;
    },
    show({ token, text, context, phraseObj, words, images, info }) {
      this.update({ token, text, context, phraseObj, words, images, info });
      this.$refs["popup-dictionary-modal"].show();
    },
    hide() {
      this.$refs["popup-dictionary-modal"].hide();
    },
  },
}
</script>