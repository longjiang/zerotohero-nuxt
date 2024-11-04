<template>
  <b-modal
    ref="tokenized-text-menu-modal"
    size="sm"
    centered
    hide-footer
    :title="$t('Annotated Text')"
    body-class="annotate-menu-modal-wrapper"
    modal-class="safe-padding-top safe-padding-bottom py-5"
  >
    <div class="annotate-menu-modal">
      <div
          class="annotate-menu-modal-item"
          @click="showChatGptModal"
        >
        <!-- show a ChatGPT modal -->
        <span class="annotator-button">
          <i class="fa-solid fa-message-question"></i>
        </span>
        <span>{{ $t("Let ChatGPT Explain") }}</span>
      </div>
      <div class="annotate-menu-modal-item">
        <span
          class="annotator-button annotator-translate focus-exclude"
          title="Translate Inline"
          @click="translateClick"
          ref="translation"
        >
          <i class="fas fa-language"></i>
        </span>
        <span @click="translateClick">{{ $t("Get Translation") }}</span>
      </div>
      <div class="annotate-menu-modal-item">
        <span
          @click="copyClick"
          title="Copy"
          class="annotator-button annotator-copy focus-exclude"
        >
          <i class="fas fa-copy"></i>
        </span>
        <span @click="copyClick">{{ $t("Copy Text") }}</span>
      </div>
      <div class="annotate-menu-modal-item">
        <span
          class="annotator-button annotator-translate focus-exclude"
          title="Read Aloud"
          @click="readAloud"
          ref="translation"
        >
          <i class="fas fa-volume-up"></i>
        </span>
        <span @click="readAloud">{{ $t("Read Aloud") }}</span>
      </div>
      <div class="annotate-menu-modal-item">
        <span
          :class="{
            'annotator-button annotator-text-mode focus-exclude': true,
            active: editMode,
          }"
          title="Edit"
          @click="editClick"
        >
          <i class="fas fa-edit"></i>
        </span>
        <span @click="editClick">{{ $t("Edit Text") }}</span>
      </div>
      <div class="annotate-menu-modal-item">
        <Saved
          :item="phraseItem(text, translation)"
          store="savedPhrases"
          icon="bookmark"
          class="annotator-button focus-exclude"
          title="Save Phrase"
          ref="savePhrase"
        />
        <span @click.stop.prevent="saveAsPhraseClick">
          {{ $t(phraseSaved ? "Remove Phrase" : "Save as Phrase") }}
        </span>
      </div>
      <div class="annotate-menu-modal-item">
        <span
          :class="{
            'annotator-button annotator-text-mode focus-exclude': true,
            active: editMode,
          }"
          title="Look up as Phrase"
          @click="lookupAsPhraseClick"
        >
          <i class="fas fa-search"></i>
        </span>
        <span @click.stop.prevent="lookupAsPhraseClick">
          {{ $t("Look up as Phrase") }}
          <i class="fas fa-chevron-right ml-1" />
        </span>
      </div>
      <!-- <TranslatorLinks class="mt-2 pl-1" :text="text" /> -->
    </div>
    <b-modal
      ref="chatGptModal"
      :title="$t('Let ChatGPT Explain')"
      size="lg"
      centered
      hide-footer
      modal-class="safe-padding-top safe-padding-bottom py-5"
      @hide="hide"
    >
      <ChatGPT 
        :maxTokens="50"
        :showPrompt="false"
        :initialMessages="[$t('Please very briefly explain, in {l1}, what the {l2} ({code}) text ‘{text}’ means, give its structure breakdown.', {text, l2: $t($l2.name), l1: $t($l1.name), code: $l2.code})]"
      />
    </b-modal>
  </b-modal>
</template>

<script>
export default {
  data() {
    return {
      text: undefined,
      translation: undefined,
      editMode: false,
      phraseSaved: false,
      callerComponent: undefined, // The <TokenizedRichText /> component that called this modal
    };
  },
  computed: {
    // add your computed properties here
  },
  created() {
    this.$nuxt.$on("showTokenizedTextMenu", this.show);
    this.$nuxt.$on("hideTokenizedTextMenu", this.hide);
  },
  beforeDestroy() {
    this.$nuxt.$off("showTokenizedTextMenu", this.show);
    this.$nuxt.$off("hideTokenizedTextMenu", this.hide);
  },
  methods: {
    show({ text, translation, editMode, phraseSaved, callerComponent }) {
      this.text = text;
      this.translation = translation;
      this.editMode = editMode;
      this.phraseSaved = phraseSaved;
      this.callerComponent = callerComponent;
      this.$refs["tokenized-text-menu-modal"].show();
    },

    hide() {
      this.$refs["tokenized-text-menu-modal"].hide();
    },

    showChatGptModal() {
      this.$refs["chatGptModal"].show();
    },

    setTranslation(translation) {
      translation = translation || $t("[Please try again]");
      this.callerComponent.translationData = translation;
    },

    lookupAsPhraseClick() {
      this.$router.push({
        name: "l1-l2-phrase-search-term",
        params: {
          term: this.text,
        },
      });
      this.hide();
    },

    async translate(text) {
      let translator = this.$languages.getTranslator(this.$l1, this.$l2);
      try {
        let translation = await translator.translateWithBing({
          text,
          l1Code: this.$l1.code,
          l2Code: this.$l2.code,
        });
        return translation;
      } catch (e) {
        console.error(e);
      }
    },

    saveAsPhraseClick() {
      let s = this.$refs["savePhrase"];
      if (!s.saved) s.save();
      else s.remove();
    },

    readAloud() {
      this.callerComponent.speak();
      this.hide();
    },

    async translateClick() {
      // add your method code here
      this.hide();
      let translation = await this.translate(this.text);
      this.setTranslation(translation);
    },

    editClick() {
      this.callerComponent.editMode = !this.callerComponent.editMode;
      this.hide();
    },
    copyClick() {
      let text = this.text;
      let tempInput = document.createElement("input");
      let modal = document.querySelector(".annotate-menu-modal-wrapper");
      if (modal) {
        tempInput.style = "position: absolute; left: -1000px; top: -1000px";
        tempInput.value = text;
        modal.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        modal.removeChild(tempInput);
        this.$toast.success(this.$tb("Copied!"), {
          position: "top-center",
          duration: 5000,
        });
      }
      this.hide();
    },

    phraseItem(phrase, translation = undefined) {
      if (typeof phrase !== "undefined") {
        let phraseItem = {
          l2: this.$l2.code,
          phrase,
          translations: {},
        };
        if (translation) phraseItem.translations[this.$l1.code] = translation;
        return phraseItem;
      }
    },
  },
};
</script>
<style lang="scss" scoped>

.annotate-menu-modal {
  .annotate-menu-modal-item {
    padding: 0.15rem 0;
    cursor: pointer;

    &:hover {
      color: black;
    }

    .annotator-button {
      width: 1.5rem;
      text-align: center;
      margin-right: 0.5rem;
      display: inline-block;
    }
  }
}

</style>
