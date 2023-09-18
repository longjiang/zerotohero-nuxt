<template>
  <div>
    <div
      :class="{
        'annotate-wrapper': true,
        'annotate-with-translation': showTranslation && translationData,
      }"
      v-observe-visibility="{
        callback: visibilityChanged,
        once: true,
      }"
    >
      <div class="text-center" v-if="showLoading && !annotated">
        <beat-loader
          class="d-inline-block"
          color="#28a745"
          size="5px"
        ></beat-loader>
      </div>
      <component
        :is="tag"
        :dir="dir()"
        :class="{
          'd-none': showLoading && !annotated,
          annotated,
          'text-right': dir() === 'rtl',
          'add-pinyin':
            $l2Settings &&
            ($l2Settings.showPinyin || $l2Settings.showDefinition),
          fullscreen: fullscreenMode,
          'with-buttons': buttons,
        }"
      >
        <div class="annotator-buttons" v-if="!empty() && buttons">
          <div class="annotator-menu-toggle" @click="showMenuModal">
            <i class="fa-regular fa-ellipsis-v"></i>
          </div>
        </div>
        <div class="annotate-except-buttons" style="width: 100%">
          <div
            :class="{ 'use-zoom': useZoom, 'annotate-slot': true }"
            v-if="!annotated"
          >
            <slot></slot>
          </div>
          <div v-if="textMode && annotated">
            <input
              :class="{
                'annotate-input': true,
              }"
              @select="select"
              @blur="annotateInputBlur"
              @click.stop="dummyFunction"
              :value="text"
              style="width: calc(100% - 2rem)"
            />
          </div>
          <template v-if="annotated && !textMode">
            <v-runtime-template
              v-for="(template, index) of annotatedSlots"
              :key="`annotate-template-${index}`"
              :template="template"
              class="annotate-template"
              ref="run-time-template"
            />
            <span
              v-if="matchedGrammar.length > 0"
              @click="showGrammarModal"
              class="annotate-grammar-button"
            >
              {{ $t("G") }}
            </span>
          </template>
        </div>
      </component>
      <div
        class="annotate-translation"
        v-if="showTranslation && (translationLoading || translationData)"
      >
        <beat-loader
          class="d-inline-block"
          v-if="translationLoading"
          color="#28a745"
          size="5px"
        ></beat-loader>
        <div
          v-else
          v-html="translationHtml(translationData ? translationData : '')"
        />
      </div>
    </div>
    <b-modal
      ref="grammar-modal"
      size="md"
      centered
      hide-footer
      :title="$t('Grammar Notes')"
      modal-class="safe-padding-top mt-4"
      :body-class="`grammar-modal-wrapper l2-${$l2.code}`"
    >
      <table
        class="table table-responsive grammar-table w-100 mb-0"
        style="font-size: 0.9em"
      >
        <tbody>
          <tr
            v-for="row in matchedGrammar"
            :key="`annotate-grammar-${row.id}`"
            class="grammar-table-row"
            @click="
              $router.push({ name: 'grammar-view', params: { id: row.id } })
            "
          >
            <td class="align-left align-middle" style="min-width: 7rem">
              {{ $t(l2LevelName) }} {{ row.code }}
            </td>
            <td
              class="align-left align-middle font-weight-bold"
              style="min-width: 6rem"
              :data-level="row.level"
            >
              <span
                v-html="highlightMultiple(row.structure, row.words, row.book)"
              />
            </td>
            <td class="align-left align-middle w-100" style="min-width: 6rem">
              <span>{{ row.english }}</span>
            </td>
            <td class="align-right align-middle text-right">
              <router-link
                class="text-success"
                v-if="row"
                :to="{ name: 'grammar-view', params: { id: row.id } }"
              >
                <i class="fas fa-chevron-right ml-1" />
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </b-modal>
    <b-modal
      ref="annotate-menu-modal"
      size="sm"
      centered
      hide-footer
      :title="$t('Annotated Text')"
      modal-class="safe-padding-top mt-4"
      body-class="annotate-menu-modal-wrapper"
    >
      <div class="annotate-menu-modal">
        <div class="annotate-menu-modal-item">
          <span
            :class="{
              'annotator-button annotator-text-mode focus-exclude': true,
              active: textMode,
            }"
            title="Look up as Phrase"
            @click="lookupAsPhraseClick"
          >
            <i class="fas fa-search"></i>
          </span>
          <span @click.stop.prevent="lookupAsPhraseClick">
            {{ $t("Look up as Phrase") }} <i class="fas fa-chevron-right ml-1" />
          </span>
        </div>
        <div class="annotate-menu-modal-item">
          <Saved
            :item="phraseItem(text, translationData)"
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
          <Speak
            :text="text"
            class="annotator-button"
            title="Speak"
            ref="speak"
          />
          <span @click="readAloud">{{ $t("Read Aloud") }}</span>
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
            :class="{
              'annotator-button annotator-text-mode focus-exclude': true,
              active: textMode,
            }"
            title="Edit"
            @click="editClick"
          >
            <i class="fas fa-edit"></i>
          </span>
          <span @click="editClick">{{ $t("Edit Text") }}</span>
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
        <TranslatorLinks class="mt-2 pl-1" :text="text" />
      </div>
    </b-modal>
  </div>
</template>

<script>
import wordblock from "@/components/WordBlock";
import popupnote from "@/components/PopupNote";
import readerlink from "@/components/ReaderLink";
import VRuntimeTemplate from "v-runtime-template";
import SmartQuotes from "smartquotes";
import BeatLoader from "vue-spinner/src/BeatLoader.vue";
import { transliterate as tr } from "transliteration";
import { getClient } from "iframe-translator";
import {
  highlightMultiple,
  isMobile,
  timeout,
  logError,
  breakSentences,
  l2LevelName,
  PYTHON_SERVER
} from "@/lib/utils";

export default {
  components: {
    wordblock, // Must be lower case for runtime template to work
    popupnote, // Must be lower case for runtime template to work
    readerlink, // Must be lower case for runtime template to work
    VRuntimeTemplate,
    BeatLoader,
  },
  props: {
    animationDuration: {
      default: undefined, // number of seconds to animate (highlight in sequence) each word block
    },
    emitSentenceTextAsAttr: {
      default: false,
    },
    delay: {
      default: 123,
    },
    sticky: {
      default: false, // whether or not to show each word's level color by default (without hovering)
    },
    speak: {
      default: false,
    },
    checkSaved: {
      default: true,
    },
    usePopup: {
      default: true,
    },
    tag: {
      default: "span",
    },
    buttons: {
      default: false,
    },
    fullscreen: {
      default: false,
    },
    foreign: {
      default: true,
    },
    explore: {
      default: false,
    },
    showGrammar: {
      default: false,
    },
    showTranslation: {
      default: false,
    },
    showLoading: {
      default: true, // Whether to show a loading animation before annotation is complete
    },
    animationSpeed: {
      default: 1,
    },
    translation: {
      type: String,
    },
    youtube_id: {
      type: String,
    },
    starttime: {
      type: Number,
    },
    useZoom: {
      type: Boolean,
      default: false,
    },
    breakSentences: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      durationPlayed: 0, // number of seconds to skip highlighting (used when a video is paused then restarts)
      annotatedSlots: [],
      annotated: false,
      annotating: false,
      translate: false,
      translationLoading: false,
      fullscreenMode: false,
      selectedText: undefined,
      batchId: 0,
      textMode: false,
      tokenized: [],
      dictionary: undefined,
      myanmarZawgyiDetector: undefined,
      myanmarZawgyiConverter: undefined,
      translationData: this.translation,
      text: undefined,
      wordblocks: [],
      matchedGrammar: [],
    };
  },
  mounted() {
    let text = "";
    if (this.$slots.default) {
      for (let slot of this.$slots.default) {
        if (slot.elm) text += slot.elm.textContent + " ";
      }
    }
    text = text.replace(/[\n\s]+/g, " ");
    this.text = text.trim(); // This cannot be a computed property because slot element is not available of the server side
    if (this.$l2.code === "my" && typeof google_myanmar_tools !== "undefined") {
      this.myanmarZawgyiDetector = new google_myanmar_tools.ZawgyiDetector();
      this.myanmarZawgyiConverter = new google_myanmar_tools.ZawgyiConverter();
    }
  },
  beforeDestroy() {
    try {
      this.tokenized = [];
      this.$refs["run-time-template"]?.[0]?.$destroy();
    } catch (err) {
      logError(err);
    }
  },
  computed: {
    quizMode() {
      return this.$l2Settings?.quizMode;
    },
    level() {
      return this.$store.state.progress.progressLoaded
        ? Number(this.$store.getters["progress/level"](this.$l2))
        : 0;
    },
    phraseSaved() {
      return this.$refs["savePhrase"] && this.$refs["savePhrase"].saved;
    },
    disableAnnotation() {
      return this.$l2Settings.disableAnnotation;
    },
    l2LevelName() {
      return l2LevelName(this.$l2.code);
    },
  },
  watch: {
    $route() {
      this.hideMenuModal();
    },
    translation() {
      this.translationData = this.translation;
    },
    async textMode() {
      if (isMobile() && this.textMode) {
        let element = this.$el.querySelector(".annotate-input");
        await timeout(30);
        element.focus();
      }
    },
  },
  methods: {
    lookupAsPhraseClick() {
      this.$router.push({
        name: "phrase",
        params: {
          term: this.text,
        },
      });
    },
    highlightMultiple(...args) {
      return highlightMultiple(...args);
    },
    showMenuModal() {
      this.$refs["annotate-menu-modal"].show();
    },
    hideMenuModal() {
      this.$refs["annotate-menu-modal"].hide();
    },
    showGrammarModal() {
      this.$refs["grammar-modal"].show();
    },
    hideGrammarModal() {
      this.$refs["grammar-modal"].hide();
    },
    saveAsPhraseClick() {
      let s = this.$refs["savePhrase"];
      if (!s.saved) s.save();
      else s.remove();
    },
    readAloud() {
      this.$refs["speak"].$el.click();
      this.hideMenuModal();
    },
    getSentences() {
      let sentences = [];
      for (let sentence of this.$el.querySelectorAll(
        ".annotate-template .sentence"
      )) {
        sentences.push(sentence);
      }
      return sentences;
    },
    getTranslationSentences() {
      let sentences = [];
      for (let sentence of this.$el.querySelectorAll(
        ".annotate-translation-sentence"
      )) {
        sentences.push(sentence);
      }
      return sentences;
    },
    translationHtml(text) {
      let sentences = this.breakSentences ? breakSentences(text) : [text];
      let html = "";
      for (let s of sentences) {
        html += `<span class="annotate-translation-sentence">${s}</span>`;
      }
      return html;
    },
    dir() {
      return this.foreign && this.$l2?.scripts?.[0]?.direction === "rtl"
        ? "rtl"
        : "ltr";
    },
    setTranslation(translation) {
      translation = translation || "[Please try again]";
      this.translationLoading = false;
      this.translationData = translation;
      this.$emit("translationLoading", false);
      this.$emit("translation", translation);
    },
    editClick() {
      this.textMode = !this.textMode;
      this.hideMenuModal();
    },
    async translateClick() {
      this.hideMenuModal();
      this.translationLoading = true;
      this.$emit("translationLoading", true);
      let translation = await this.translateWithApi(this.text)
      // let translation = await this.trnslateWithIframe(this.text)
      this.setTranslation(translation);
    },
    async translateWithApi() {
      // post to api
      let res = await axios.post(`${PYTHON_SERVER}/translate`, {
        text: this.text,
        l1: this.$l1.code,
        l2: this.$l2.code,
      })
      if (res?.data?.translated_text) return res.data.translated_text
    },
    async trnslateWithIframe(text) {
      let translation;
      let iframeTranslationClient;
      try {
        // https://www.npmjs.com/package/iframe-translator
        const timeout = setTimeout(() => {
          this.setTranslation(translation);
          clearTimeout(timeout);
        }, 10000);
        iframeTranslationClient = await getClient();
        translation = await iframeTranslationClient.translate(
          text,
          this.$l1.code === "zh" ? "zh-CN" : this.$l1.code
        );
        iframeTranslationClient.destroy();
      } catch (err) {
        try {
          iframeTranslationClient.destroy();
        } catch (err) {
          logError(err);
        }
        logError(err);
      }
      return translation;
    },
    /**
     * @param {Number} startFrom Starting time in seconds
     */
    async playAnimation(startFrom = 0) {
      if (this.annotated) {
        this.animate = true;
        if (this.animationDuration) {
          let wordBlockComponents =
            this.$refs["run-time-template"]?.[0]?.$children?.[0]?.$children;
          if (wordBlockComponents?.length > 0) {
            let aggregateText = wordBlockComponents
              .map((wb) => wb.text || "")
              .join(" ");
            let durationAlreadyPlayed = 0;
            for (const wb of wordBlockComponents) {
              let blockLength = wb.text?.length || 0;
              let blockDuration =
                blockLength / aggregateText.length * this.animationDuration;
              if (blockDuration === 0) continue;
              durationAlreadyPlayed = durationAlreadyPlayed + blockDuration;
              // Which ones should skip
              if (durationAlreadyPlayed > startFrom) {
                if (!this.animate) return;
                const animationDuration = (blockDuration * 1000) / this.animationSpeed
                const fadeDuration = animationDuration * 2000; 
                wb.playAnimation(fadeDuration);
                await timeout(animationDuration);
              }
            }
          }
        }
      } else {
        const timeBeforeRetry = Date.now();
        this.$on('annotated', (annotated) => {
          if (annotated) {
            this.$nextTick(() => {
              let wordBlockComponents =
                this.$refs["run-time-template"]?.[0]?.$children?.[0]?.$children;
              if (wordBlockComponents?.length > 0) {

            const delay = (Date.now() - timeBeforeRetry) / 1000;
            this.playAnimation(startFrom + delay);
              }
                
            });
          }
        })
      }
    },
    async pauseAnimation() {
      this.animate = false;
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
    async onMenuHide() {
      await timeout(300);
      document.activeElement.blur();
    },
    hasTranslate() {
      return this.$languages.hasGoogleTranslate(this.$l2);
    },
    dummyFunction() {
      // do nothing
    },
    select(event) {
      this.selectedText = event.target.value.substring(
        event.target.selectionStart,
        event.target.selectionEnd
      );
    },
    async externalTranslateClick() {
      let text = this.text;
      let url = this.$languages.translationURL(text, this.$l1, this.$l2);
      if (url) window.open(url, isMobile() ? "_blank" : "translate");
    },
    // https://stackoverflow.com/questions/2550951/what-regular-expression-do-i-need-to-check-for-some-non-latin-characters
    nonLatin() {
      var rforeign = /[^\u0000-\u007f]/;
      let nonLatin = rforeign.test(this.text);
      return nonLatin;
    },
    empty() {
      return !this.text || this.text.trim() === "";
    },
    fullscreenClick() {
      this.fullscreenMode = !this.fullscreenMode;
    },
    copyClick() {
      let text = this.text;
      let tempInput = document.createElement("input");
      let modal = document.querySelector(".annotate-menu-modal-wrapper");
      tempInput.style = "position: absolute; left: -1000px; top: -1000px";
      tempInput.value = text;
      modal.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      modal.removeChild(tempInput);
      this.hideMenuModal();
    },
    async visibilityChanged(isVisible) {
      if (isVisible) {
        this.convertToSentencesAndAnnotate(this.$slots.default[0]);
        if (this.showGrammar) {
          this.getGrammar();
        }
      } else {
        // We unset the annotations to save memory and battery, but we set the height and width to prevent the annotated text from shifting up and down.
        // this.$el.style.minHeight = this.$el.clientHeight + "px";
        // this.$el.style.minWidth = this.$el.clientWidth + "px";
        this.annotated = false;
        this.$emit("annotated", false);
      }
    },
    async getGrammar() {
      let grammar = await this.$getGrammar();
      if (grammar)
        this.matchedGrammar = grammar.findInText(this.text, this.level);
    },
    async annotateInputBlur(e) {
      let newText = e.target.value;
      this.reannotate(newText);
      await timeout(200);
      this.selectedText = undefined;
      this.textMode = false;
      this.$emit("textChanged", newText);
    },
    async reannotate(newText) {
      this.annotated = false;
      await timeout(200);
      let node = this.$el.querySelector(".annotate-slot > *");
      if (node) {
        node.innerText = newText;
        this.convertToSentencesRecursive(node);
        this.annotate(node);
      }
      this.annotated = true;
    },
    convertToSentencesAndAnnotate(slot) {
      if (
        !this.annotating &&
        !this.annotated &&
        this.$hasFeature("dictionary")
      ) {
        if (slot) {
          this.convertToSentencesRecursive(slot.elm);
          if (!this.disableAnnotation) this.annotate(slot.elm);
          else this.$emit("annotated", true);
        }
      }
    },
    highlightTranslation(current) {
      let translationSentences = this.getTranslationSentences();
      for (let translationSentence of translationSentences) {
        $(translationSentence).removeClass("current");
      }
      const translationSentence = translationSentences[current];
      $(translationSentence).addClass("current");
    },
    async annotate(node) {
      this.annotated = false;
      this.annotating = true;
      this.annotatedSlots = [];
      if (typeof node !== "undefined") {
        let annotatedNode = await this.annotateRecursive(node.cloneNode(true));
        let annotatedHtml = annotatedNode.outerHTML;
        this.annotatedSlots.push(annotatedHtml);
      }
      this.annotating = false;
      this.annotated = true;
      this.onAnnotated();
    },
    onAnnotated() {
      this.$emit("annotated", true);
    },
    getSavedWords() {
      if (this.$refs["run-time-template"]?.length > 0) {
        let savedWords = [];
        for (let template of this.$refs["run-time-template"]) {
          let wordblocks = template.$children?.[0]?.$children;
          let moreSavedWords = wordblocks
            .filter((wb) => wb.savedWord)
            .map((wb) => wb.savedWord);
          savedWords = [...savedWords, ...moreSavedWords];
        }
        return savedWords;
      }
    },
    async annotateRecursive(node) {
      if (node?.classList?.contains("sentence")) {
        // .sentence node
        let sentence = node.innerText.replace(/[\s\n]+/g, " ");
        // If the language is does not use apostrophes as part of the word (like Klingon)
        if (!this.$l2.apostrophe) sentence = SmartQuotes.string(sentence);
        // We MUST do that otherwise the data-sentence-text attribute (10 lines down) will mess up the markup!
        else {
          sentence = SmartQuotes.string(
            sentence.replace(/'/g, "--do-not-smart-quote-single-quotes--")
          ).replace(/--do-not-smart-quote-single-quotes--/g, "'");
        }
        if (
          this.$l2.code === "my" &&
          this.myanmarZawgyiDetector &&
          this.myanmarZawgyiConverter
        ) {
          let score = this.myanmarZawgyiDetector.getZawgyiProbability(sentence);
          if (score > 0.8)
            sentence = this.myanmarZawgyiConverter.zawgyiToUnicode(sentence);
        }
        let html = await this.tokenize(sentence, this.batchId);
        let dataSentenceText = this.emitSentenceTextAsAttr
          ? `data-sentence-text="${sentence.trim()}"`
          : "";
        let $tokenizedSentenceSpan = $(
          `<span class="sentence" @click.capture="onSentenceClick" ${dataSentenceText}>${html}</span>`
        );
        this.batchId = this.batchId + 1;
        $(node).before($tokenizedSentenceSpan);
        $(node).remove();
      } else {
        // work with child nodes
        let nodes = [];
        for (let n of node.childNodes) {
          nodes.push(n);
        }
        for (let n of nodes) {
          await this.annotateRecursive(n);
        }
      }

      return node;
    },
    async tokenize(text, batchId) {
      let html = "";
      let dictionary = await this.$getDictionary();
      let tokens = await dictionary.tokenizeWithCache(text);
      this.tokenized[batchId] = tokens;
      for (let index in this.tokenized[batchId]) {
        let token = this.tokenized[batchId][index];
        if (typeof token === "object") {
          html += `<WordBlock v-bind="wordBlockAttributes(${batchId},${index})">${token.text}</WordBlock>`;
        } else {
          html += `<span class="word-block-unknown ${
            this.useZoom ? "use-zoom" : ""
          }"><span class="word-block-segment">${token.replace(
            /\s/g,
            "&nbsp;"
          )}</span></span>`;
        }
      }
      return html;
    },

    wordBlockAttributes(batchId, index) {
      let token = this.tokenized[batchId][index];
      let text = token.text;
      let context = {
        text: this.text,
        youtube_id: this.youtube_id,
        starttime: this.starttime,
      }; // { text, starttime = undefined, youtube_id = undefined}
      let phonetics = token.pronunciation
        ? token.pronunciation
        : tr(text).replace(/"/g, "");
      let attrs = {
        phonetics,
        ref: "word-block",
        usePopup: this.usePopup,
        sticky: this.sticky,
        explore: this.explore,
        context,
        token,
        useZoom: this.useZoom,
        quizMode: this.quizMode,
      };
      if (token.mappedPronunciation)
        attrs.mappedPronunciation = token.mappedPronunciation;
      return attrs;
    },
    convertToSentencesRecursive(node) {
      if (typeof node === "undefined") return node;
      if (node.nodeType === 3) {
        // textNode
        // break setnences
        let text = node.nodeValue;
        text = text.replace(/\n\u200e/g, "\n"); // Fix error when \n and a left-to-right mark are found together and mess up with the order of words.
        let sentences = this.breakSentences ? breakSentences(text) : [text];
        for (let sentence of sentences) {
          // $(node).before(`<span id="sentence-placeholder-${this.batchId}">${sentence}</span>`)
          let dataSentenceText = this.emitSentenceTextAsAttr
            ? `data-sentence-text="${sentence.trim()}"`
            : "";
          let sentenceSpan = $(
            `<span class="sentence" @click.capture="onSentenceClick" ${dataSentenceText}>${sentence}</span>`
          );
          $(node).before(sentenceSpan);
        }
        $(node).remove();
      } else {
        // work with child nodes
        let nodes = [];
        for (let n of node.childNodes) {
          nodes.push(n);
        }
        for (let n of nodes) {
          this.convertToSentencesRecursive(n);
        }
      }
      return node;
    },
    onSentenceClick(e) {
      let sentenceEl = e.currentTarget;
      let sentences = this.getSentences();
      let index = sentences.findIndex((el) => el === sentenceEl);
      let current = Math.max(index, 0); // cannot set this as a data property because reactivity makes it impossible for the parent
      this.highlightTranslation(current);
      this.$emit("sentenceClick", sentenceEl);
    },
  },
};
</script>

<style lang="scss">
@import "~/assets/scss/variables";

.annotate-translation {
  font-size: 0.8em;
  opacity: 0.7;
}

#reader-annotated p {
  margin-bottom: 0;
}

.word-block.saved {
  color: $primary-color;
}

.sentence + .sentence {
  margin-left: 0.1em;
}

.l2-zh {
  .sentence {
    margin-right: 0;
  }

  .sentence + .highlight {
    margin-left: 0;
  }

  .highlight + .sentence {
    margin-left: 0;
  }

  .sentence + .sentence {
    margin-left: 0;
  }
}

.use-serif .annotate-template * {
  font-family: "Noto Serif SC", serif;
}

.annotated.fullscreen {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  background: white;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: auto;
  font-size: 3rem;
  padding: 3rem;
  flex-direction: row-reverse;

  .annotator-close {
    opacity: 0;
    position: absolute;
    top: 0.75rem;
    right: 2.5rem;
    transition: 0.5s all ease-in-out;
  }

  .annotator-close:hover {
    opacity: 1;
  }
}

.text-center [dir="ltr"].with-buttons .annotate-template {
  padding-left: 1rem;
}

.text-center [dir="rtl"].with-buttons .annotate-template {
  padding-right: 1rem;
}

.with-buttons {
  min-width: 61.8%;
  width: 100%;
  display: flex;
  flex-direction: row;

  .annotate-template {
    flex: 1;
  }

  .annotate-slot {
    flex: 1;
  }

  .annotator-buttons {
    padding: 0 0 0 0.5rem;
    order: 2;
  }

  &[dir="rtl"] {
    .annotator-buttons {
      padding: 0 0.5rem 0 0;
    }
  }
}

.annotator-menu-toggle {
  font-size: 0.8rem;
  padding: 0.1rem 0.4rem;
  border-radius: 0.2rem;
  background: none;
  border: none;
  opacity: 0.5;
  cursor: pointer;
  &:hover {
    opacity: 1;
    background-color: #cccccc33;
  }
}

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

.annotate-input {
  border: 1px solid #ccc;
  padding: 0.5rem 0.7rem;
  border-radius: 0.2rem;
}

.grammar-example {
  margin-top: 1rem !important;
}

.annotate-grammar-button {
  font-size: 0.8rem;
  background: #888;
  color: white;
  opacity: 0.5;
  border-radius: 100%;
  width: 1.3rem;
  height: 1.3rem;
  display: inline-block;
  cursor: pointer;
  text-align: center;
  line-height: 1.3rem;
  position: relative;
  bottom: 0.1rem;
  margin-right: 0.1rem;
  &:hover {
    background: $primary-color;
    opacity: 1;
  }
}

.grammar-table-row {
  td {
    border: none;
  }

  &:hover {
    background-color: #efefef;
    cursor: pointer;
  }
}

.zerotohero-zoom-1 {
  .annotate-wrapper.use-zoom {
    .annotate-slot,
    .word-block-segment {
      font-size: calc(1rem * 1.25);
    }
  }
}

.zerotohero-zoom-2 {
  .annotate-wrapper.use-zoom {
    .annotate-slot,
    .word-block-segment {
      font-size: calc(1rem * 1.25 * 1.25);
    }
  }
}

.zerotohero-zoom-3 {
  .annotate-wrapper.use-zoom {
    .annotate-slot,
    .word-block-segment {
      font-size: calc(1rem * 1.25 * 1.25 * 1.25);
    }
  }
}

.zerotohero-zoom-4 {
  .annotate-wrapper.use-zoom {
    .annotate-slot,
    .word-block-segment {
      font-size: calc(1rem * 1.25 * 1.25 * 1.25 * 1.25);
    }
  }
}
</style>
