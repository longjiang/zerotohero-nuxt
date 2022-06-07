<template>
  <div>
    <div
      :class="{
        'annotate-wrapper': true,
        'annotate-wrapper-wide': params.lg,
        'annotate-with-translation': showTranslation && translation,
      }"
    >
      <component
        :is="tag"
        v-observe-visibility="{
          callback: visibilityChanged,
          once: true,
        }"
        :dir="dir()"
        :class="{
          annotated,
          'text-right': dir() === 'rtl',
          'add-pinyin': l2Settings && l2Settings.showPinyin,
          phonetics,
          fullscreen: fullscreenMode,
          'with-buttons': buttons,
        }"
      >
        <div class="annotator-buttons" v-if="!empty() && buttons">
          <b-dropdown
            no-caret
            toggle-class="annotator-menu-toggle"
            :dropleft="$l2.direction !== 'rtl'"
            :dropright="$l2.direction === 'rtl'"
            @hide="onMenuHide"
            variant="unstyled"
          >
            <template #button-content>
              <i class="fas fa-ellipsis-v"></i>
            </template>
            <b-dropdown-item>
              <Saved
                :item="phraseItem(text, translation)"
                store="savedPhrases"
                icon="bookmark"
                class="mr-1 annotator-button focus-exclude"
                title="Save Phrase"
              />
              <Speak
                :text="text"
                class="annotator-button ml-1 mr-1"
                title="Speak"
              />
              <span
                class="
                  annotator-button annotator-translate
                  ml-1
                  mr-1
                  focus-exclude
                "
                title="Translate Inline"
                @click="translateClick"
              >
                <i class="fas fa-language"></i>
              </span>
              <span
                class="
                  annotator-button annotator-external-translate
                  ml-1
                  mr-1
                  focus-exclude
                "
                title="Translate with External Translator"
                @click="externalTranslateClick"
              >
                <i class="fas fa-globe"></i>
              </span>
              <span
                :class="{
                  'annotator-button annotator-text-mode ml-1 mr-1 focus-exclude': true,
                  active: textMode,
                }"
                title="Edit"
                @click="textMode = !textMode"
              >
                <i class="fas fa-edit"></i>
              </span>
              <span
                @click="copyClick"
                title="Copy"
                class="annotator-button annotator-copy ml-1 mr-1 focus-exclude"
              >
                <i class="fas fa-copy"></i>
              </span>
            </b-dropdown-item>
          </b-dropdown>
        </div>
        <div
          :class="{ 'annotate-slot': true, 'd-none': annotated }"
          style="display: inline"
        >
          <slot></slot>
        </div>
        <div :class="{ 'd-none': !textMode }">
          <input
            :class="{
              'annotate-input': true,
              'd-none': !textMode || !annotated,
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
        </template>
      </component>
      <div
        class="annotate-translation"
        v-if="showTranslation && (translationLoading || translation)"
      >
        <beat-loader
          class="d-inline-block"
          v-if="translationLoading"
          color="#28a745"
          size="5px"
        ></beat-loader>
        {{ translation ? translation : "" }}
      </div>
    </div>

    <container-query :query="query" v-model="params">
      <div></div>
    </container-query>
  </div>
</template>

<script>
import wordblock from "@/components/WordBlock";
import popupnote from "@/components/PopupNote";
import booklink from "@/components/BookLink";
import VRuntimeTemplate from "v-runtime-template";
import Helper from "@/lib/helper";
import { transliterate as tr } from "transliteration";
import { mapState } from "vuex";
import { ContainerQuery } from "vue-container-query";
import { getClient } from "iframe-translator";
import SmartQuotes from "smartquotes";
import BeatLoader from "vue-spinner/src/BeatLoader.vue";

export default {
  components: {
    wordblock,
    popupnote,
    booklink,
    VRuntimeTemplate,
    ContainerQuery,
    BeatLoader,
  },
  props: {
    animationDuration: {
      default: undefined, // number of seconds to animate (highlight in sequence) each word block
    },
    emitSentenceTextAsAttr: {
      default: false,
    },
    phonetics: {
      default: true,
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
    popup: {
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
    showTranslation: {
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
      translation: undefined,
      text: undefined,
      params: {},
      query: {
        lg: {
          minWidth: 600,
        },
      },
    };
  },
  mounted() {
    let text = "";
    if (this.$slots.default) {
      for (let slot of this.$slots.default) {
        if (slot.elm) text += slot.elm.textContent + " ";
      }
    }
    text = text.replace(/[\n\s]+/g, this.$l2.continua ? "" : " ");
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
      Helper.logError(err);
    }
  },
  computed: {
    ...mapState("settings", ["l2Settings"]),
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
    $dictionaryName() {
      return this.$store.state.settings.dictionaryName;
    },
    $hanzi() {
      return this.$getHanzi();
    },
    disableAnnotation() {
      return this.$store.state.settings.l2Settings.disableAnnotation;
    },
  },
  watch: {
    async textMode() {
      if (Helper.isMobile() && this.textMode) {
        let element = this.$el.querySelector(".annotate-input");
        await Helper.timeout(30);
        element.focus();
      }
    },
  },
  methods: {
    dir() {
      return this.foreign && this.$l2?.scripts?.[0]?.direction === 'rtl' ? 'rtl' : 'ltr'
    },
    async translateClick() {
      let text = this.text;
      let iframeTranslationClient;
      try {
        // https://www.npmjs.com/package/iframe-translator
        this.translationLoading = true;
        this.$emit("translationLoading", true);
        iframeTranslationClient = await getClient();
        await Helper.timeout(1000); // Add one second wait to prevent translation from 'freezing'
        let translation = await iframeTranslationClient.translate(
          text,
          this.$l1.code
        );
        this.translationLoading = false;
        this.$emit("translationLoading", false);
        if (translation) {
          this.$emit("translation", translation);
          this.translation = translation;
        }
        iframeTranslationClient.destroy();
      } catch (err) {
        this.translation = "[Translation error, please try again.]";
        this.translationLoading = false;
        this.$emit("translation", this.translation);
        this.$emit("translationLoading", false);
        Helper.logError(err);
        try {
          iframeTranslationClient.destroy(); // Make sure to destroy the client otherwise whenever there is an error and the translation is not returned, the client is never destroyed and ios users can't scroll
        } catch (err) {
          Helper.logError(err);
        }
      }
    },
    async playAnimation(startFrom) {
      if (!this.annotated) {
        return;
      } else {
        this.animate = true;
        if (this.animationDuration) {
          let blocks = this.$el.querySelectorAll(
            ".word-block, .word-block-unknown"
          );
          let durationAlreadyPlayed = 0;
          let spans = this.$el.querySelectorAll(
            ".word-block-text, .word-block-unknown"
          );
          let aggregateText = "";
          spans.forEach(
            (span) => (aggregateText = aggregateText + span.textContent.trim())
          );
          for (let block of blocks) {
            let span = block.classList.contains("word-block")
              ? block.querySelector(".word-block-text")
              : block;
            let blockLength = span
              ? span.textContent.trim().length
              : aggregateText.length / blocks.length;
            let blockDuration =
              (blockLength / aggregateText.length) * this.animationDuration;
            if (blockDuration === 0) continue;
            durationAlreadyPlayed = durationAlreadyPlayed + blockDuration;
            // Which ones should skip
            if (durationAlreadyPlayed > startFrom) {
              if (!this.animate) return;
              block.classList.add("animate");
              await Helper.timeout(blockDuration * 1000);
            }
          }
          await Helper.timeout(2000);
          blocks.forEach((b) => b.classList.remove("animate"));
        }
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
      await Helper.timeout(300);
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
      if (url) window.open(url, Helper.isMobile() ? "_blank" : "translate");
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
      var tempInput = document.createElement("input");
      tempInput.style = "position: absolute; left: -1000px; top: -1000px";
      tempInput.value = text;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      document.body.removeChild(tempInput);
    },
    savePhraseClick() {},
    async visibilityChanged(isVisible) {
      if (this.delay) await Helper.timeout(this.delay);
      if (isVisible) {
        this.convertToSentencesAndAnnotate(this.$slots.default[0]);
      } else {
        // We unset the annotations to save memory and battery, but we set the height and width to prevent the annotated text from shifting up and down.
        // this.$el.style.minHeight = this.$el.clientHeight + "px";
        // this.$el.style.minWidth = this.$el.clientWidth + "px";
        this.annotated = false;
        this.$emit("annotated", false);
      }
    },
    async annotateInputBlur(e) {
      let newText = e.target.value;
      this.reannotate(newText);
      await Helper.timeout(200);
      this.selectedText = undefined;
      this.textMode = false;
      this.$emit("textChanged", newText);
    },
    reannotate(newText) {
      let node = this.$el.querySelector(".annotate-slot > *");
      node.innerText = newText;
      this.convertToSentencesRecursive(node);
      this.annotate(node);
    },
    convertToSentencesAndAnnotate(slot) {
      if (
        !this.annotating &&
        !this.annotated &&
        (this.$hasFeature("dictionary") || this.nonLatin())
      ) {
        if (slot) {
          this.convertToSentencesRecursive(slot.elm);
          if (!this.disableAnnotation) this.annotate(slot.elm);
          else this.$emit("annotated", true);
        }
      }
    },
    async annotate(node) {
      this.annotated = false;
      this.annotating = true;
      this.annotatedSlots = [];
      let annotatedNode = await this.annotateRecursive(node.cloneNode(true));
      let annotatedHtml = annotatedNode.outerHTML;
      this.annotatedSlots.push(annotatedHtml);
      this.annotating = false;
      this.annotated = true;
      this.$emit("annotated", true);
    },
    async annotateRecursive(node) {
      if (node && node.classList && node.classList.contains("sentence")) {
        // .sentence node
        let sentence = node.innerText;
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
          `<span class="sentence" ${dataSentenceText}>${html}</span>`
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
    breakSentences(text) {
      text = text.replace(/([!?:。！？：])/g, "$1SENTENCEENDING!!!");
      text = text.replace(/(\. )/g, "$1SENTENCEENDING!!!");
      let sentences = text.split("SENTENCEENDING!!!");
      return sentences.filter((sentence) => sentence.trim() !== "");
    },
    tokenizationType(l2) {
      let tokenizationType = "integral";
      if (l2.continua) {
        tokenizationType = "continua";
      } else if (
        (l2.scripts && l2.scripts[0] && l2.scripts[0].script === "Arab") ||
        ["hu"].includes(l2.code)
      ) {
        tokenizationType = "integral";
      } else if (["de", "gsw", "no", "en", "hy", "vi"].includes(l2.code)) {
        tokenizationType = "agglutenative";
      } else if (
        (l2.agglutinative || l2.indo) &&
        l2.wiktionary &&
        l2.wiktionary > 2000
      ) {
        tokenizationType = "agglutenative";
      }
      return tokenizationType;
    },
    async tokenize(text, batchId) {
      let html = text ? text : "";
      let tokenizationType = this.tokenizationType(this.$l2);
      // for (let code of ["en", "zh", "es", "fr", "ar", "ru", "it", "de", "hy"]) {
      //   let l2 = this.$languages.getSmart(code);
      //   console.log(l2.name, this.tokenizationType(l2));
      // }
      // console.log({ tokenizationType });
      switch (tokenizationType) {
        case "integral":
          html = await this.tokenizeIntegral(text);
          break;
        case "agglutenative":
          html = await this.tokenizeAgglutenative(text, batchId);
          break;
        case "continua":
          html = await this.tokenizeContinua(text, batchId);
          break;
        default:
        // code block
      }
      return html;
    },
    async tokenizeContinua(text, batchId) {
      let html = "";
      this.tokenized[batchId] = await (
        await this.$getDictionary()
      ).tokenize(text);
      for (let index in this.tokenized[batchId]) {
        let token = this.tokenized[batchId][index];
        if (token && typeof token === "object") {
          html += `<WordBlock v-bind="wordBlockTokenAttrs(${batchId},${index})">${token.text}</WordBlock>`;
        } else {
          html += `<span class="word-block-unknown">${token.replace(
            /\s+/,
            "&nbsp;"
          )}</span>`;
        }
      }
      return html;
    },
    wordBlockIntegralAttrs(p1) {
      let attrs = {
        transliterationprop: tr(p1).replace(/"/g, ""),
        checkSaved: this.checkSaved,
        ref: "word-block",
        popup: this.popup,
        phonetics: this.phonetics,
        sticky: this.sticky,
        explore: this.explore,
      };
      return attrs;
    },
    wordBlockTokenAttrs(batchId, index) {
      let token = this.tokenized[batchId][index];
      let attrs = this.wordBlockIntegralAttrs(token.text);
      if (token.candidates && token.candidates.length > 0) attrs.token = token;
      return attrs;
    },
    async tokenizeAgglutenative(text, batchId) {
      let html = "";
      this.tokenized[batchId] = await (
        await this.$getDictionary()
      ).tokenize(text);
      for (let index in this.tokenized[batchId]) {
        let token = this.tokenized[batchId][index];
        if (typeof token === "object") {
          html += `<WordBlock v-bind="wordBlockTokenAttrs(${batchId},${index})">${token.text}</WordBlock>`;
        } else {
          html += `<span class="word-block-unknown">${(token || "")
            .replace(/\s+([,.!?])/, "$1")
            .replace(/\s+/g, "&nbsp;")}</span>`;
        }
      }
      return html;
    },
    async tokenizeIntegral(text) {
      let regex = `(((?![?])[${
        this.$l2.apostrophe ? "'ʼ" : ""
      }${Helper.characterClass("L")}])+)`;
      // Additional characters removed so the spanish question mark (¿) gets excluded
      // \u10000-\u1007F\u10080-\u100FF\u10140-\u1018F\u10190-\u101CF\u101D0-\u101FF\u10280-\u1029F\u102A0-\u102DF\u102E0-\u102FF\u10300-\u1032F\u10330-\u1034F\u10350-\u1037F\u10380-\u1039F\u103A0-\u103DF\u10400-\u1044F\u10450-\u1047F\u10480-\u104AF\u104B0-\u104FF\u10500-\u1052F\u10530-\u1056F\u10600-\u1077F\u10800-\u1083F\u10840-\u1085F\u10860-\u1087F\u10880-\u108AF\u108E0-\u108FF\u10900-\u1091F\u10920-\u1093F\u10980-\u1099F\u109A0-\u109FF\u10A00-\u10A5F\u10A60-\u10A7F\u10A80-\u10A9F\u10AC0-\u10AFF\u10B00-\u10B3F\u10B40-\u10B5F\u10B60-\u10B7F\u10B80-\u10BAF\u10C00-\u10C4F\u10C80-\u10CFF\u10D00-\u10D3F\u10E60-\u10E7F\u10F00-\u10F2F\u10F30-\u10F6F\u10FE0-\u10FFF\u11000-\u1107F\u11080-\u110CF\u110D0-\u110FF\u11100-\u1114F\u11150-\u1117F\u11180-\u111DF\u111E0-\u111FF\u11200-\u1124F\u11280-\u112AF\u112B0-\u112FF\u11300-\u1137F\u11400-\u1147F\u11480-\u114DF\u11580-\u115FF\u11600-\u1165F\u11660-\u1167F\u11680-\u116CF\u11700-\u1173F\u11800-\u1184F\u118A0-\u118FF\u119A0-\u119FF\u11A00-\u11A4F\u11A50-\u11AAF\u11AC0-\u11AFF\u11C00-\u11C6F\u11C70-\u11CBF\u11D00-\u11D5F\u11D60-\u11DAF\u11EE0-\u11EFF\u11FC0-\u11FFF\u12000-\u123FF\u12480-\u1254F\u13000-\u1342F\u13430-\u1343F\u14400-\u1467F\u16800-\u16A3F\u16A40-\u16A6F\u16AD0-\u16AFF\u16B00-\u16B8F\u16E40-\u16E9F\u16F00-\u16F9F\u17000-\u187FF\u18800-\u18AFF\u1B000-\u1B0FF\u1B100-\u1B12F\u1B130-\u1B16F\u1B170-\u1B2FF\u1BC00-\u1BC9F\u1D200-\u1D24F\u1D800-\u1DAAF\u1E000-\u1E02F\u1E100-\u1E14F\u1E2C0-\u1E2FF\u1E800-\u1E8DF\u1E900-\u1E95F\u1EE00-\u1EEFF\u1F200-\u1F2FF\u1F300-\u1F5FF\u20000-\u2A6DF\u2A700-\u2B73F\u2B740-\u2B81F\u2B820-\u2CEAF\u2CEB0-\u2EBEF\u2F800-\u2FA1F\uE0100-\uE01EF\uF0000-\uFFFFF\u100000-\u10FFFF
      let reg = new RegExp(regex, "gi");
      let html = text
        .replace(/\s+/gi, "!!!###!!!")
        .replace(
          reg,
          (match, p1) =>
            `<WordBlock v-bind="wordBlockIntegralAttrs('${p1}')">${p1}</WordBlock>`
        )
        .replace(
          /!!!###!!!/gi,
          `<span class="${
            this.$l2.code === "tlh" ? "klingon" : ""
          } word-block-unknown">&nbsp;</span>`
        );
      return html;
    },
    convertToSentencesRecursive(node) {
      if (node.nodeType === 3) {
        // textNode
        // break setnences
        let text = node.nodeValue;
        text = text.replace(/\n\u200e/g, "\n"); // Fix error when \n and a left-to-right mark are found together and mess up with the order of words.
        let sentences = this.breakSentences(text);
        for (let sentence of sentences) {
          // $(node).before(`<span id="sentence-placeholder-${this.batchId}">${sentence}</span>`)
          let dataSentenceText = this.emitSentenceTextAsAttr
            ? `data-sentence-text="${sentence.trim()}"`
            : "";
          let sentenceSpan = $(
            `<span class="sentence" ${dataSentenceText}>${sentence}</span>`
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
  },
};
</script>

<style lang="scss">
.annotate-wrapper.annotate-wrapper-wide.annotate-with-translation {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
  .annotated {
    width: 61.8%;
  }
  .annotated-translation {
    min-width: 38.2%;
  }
}

.annotate-translation {
  font-size: 0.8em;
  opacity: 0.7;
}

/* IF annotation flickering occurs, try to turn this line off, or check if v-observe-visiblility has the correct settings (e.g. 'once') */
.annotated.add-pinyin {
  line-height: 2.2;
}

#reader-annotated p {
  margin-bottom: 0;
}

.word-block.saved {
  color: #28a745;
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
  overflow: scroll;
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

.annotated.with-buttons {
  min-width: 61.8%;
  width: 100%;
  display: flex;
  align-items: stretch;
  flex-direction: row;

  .annotate-template {
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
  color: #ddd;
}

.show > .annotator-menu-toggle {
  background-color: #545b62;
  color: white;
}

.main-dark,
.widget-dark {
  .annotator-menu-toggle {
    color: #ffffff55;
  }
}

.annotator-buttons .dropdown-item {
  padding: 0 0.75rem;
  &:hover {
    background: none;
  }

  span {
    color: #888;

    &:hover {
      color: #666;
    }
  }

  .annotator-button {
    padding: 0.3rem 0.3rem;
    border-radius: 0.2rem;
    line-height: 16px;
    height: 1.6rem;
    display: inline-block;
  }

  .annotator-button.active {
    background-color: #fd4f1c;
    color: white;
  }
}

.annotate-input {
  border: 1px solid #ccc;
  padding: 0.5rem 0.7rem;
  border-radius: 0.2rem;
}
</style>
