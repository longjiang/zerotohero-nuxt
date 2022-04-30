<template>
  <component
    :is="tag"
    v-observe-visibility="visibilityChanged"
    :dir="
      foreign &&
      $l2.scripts &&
      $l2.scripts.length > 0 &&
      $l2.scripts[0].direction === 'rtl'
        ? 'rtl'
        : 'ltr'
    "
    :class="{
      annotated: annotated,
      'text-right':
        foreign &&
        $l2.scripts &&
        $l2.scripts.length > 0 &&
        $l2.scripts[0].direction === 'rtl',
      'add-pinyin': $hasFeature('transliteration'),
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
      >
        <template #button-content><i class="fas fa-ellipsis-v"></i></template>
        <b-dropdown-item>
          <Speak
            :text="text"
            class="ml-1 mr-1"
            style="position: relative; top: 0.08rem; position: relative"
          />
          <span
            class="
              annotator-button annotator-show-translate
              ml-1
              mr-1
              focus-exclude
            "
            @click="translateClick"
          >
            <i class="fas fa-language"></i>
          </span>
          <span
            :class="{
              'annotator-button annotator-fullscreen ml-1 mr-1 focus-exclude': true,
              active: fullscreenMode,
            }"
            @click="fullscreenClick"
          >
            <i class="fas fa-expand"></i>
          </span>
          <span
            :class="{
              'annotator-button annotator-text-mode ml-1 mr-1 focus-exclude': true,
              active: textMode,
            }"
            @click="textMode = !textMode"
          >
            <i class="fas fa-edit"></i>
          </span>
          <span
            @click="copyClick"
            class="annotator-button annotator-copy ml-1 mr-1 focus-exclude"
          >
            <i class="fas fa-copy"></i>
          </span>
        </b-dropdown-item>
      </b-dropdown>
    </div>
    <div
      :class="{ 'annotate-slot annotate-template': true, 'd-none': annotated }"
      style="display: inline"
    >
      <slot></slot>
    </div>
    <div :class="{ 'd-none': !textMode }">
      <input
        :class="{ 'annotate-input': true, 'd-none': !textMode || !annotated }"
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
      />
    </template>
    <div v-if="translation">{{ translation }}</div>
  </component>
</template>

<script>
import wordblock from "@/components/WordBlock";
import popupnote from "@/components/PopupNote";
import VRuntimeTemplate from "v-runtime-template";
import Helper from "@/lib/helper";

export default {
  components: {
    wordblock,
    popupnote,
    VRuntimeTemplate,
  },
  props: {
    phonetics: {
      default: true,
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
  },
  data() {
    return {
      annotatedSlots: [],
      annotated: false,
      annotating: false,
      translate: false,
      translation: undefined,
      fullscreenMode: false,
      selectedText: undefined,
      batchId: 0,
      text: "",
      Helper,
      isVisible: false,
      textMode: false,
      tokenized: [],
      dictionary: undefined,
      myanmarZawgyiDetector: undefined,
      myanmarZawgyiConverter: undefined,
    };
  },
  mounted() {
    if (this.$slots.default) {
      for (let slot of this.$slots.default) {
        this.text += $(slot.elm).text();
      }
    }
    if (this.$l2.code === "my" && typeof google_myanmar_tools !== "undefined") {
      this.myanmarZawgyiDetector = new google_myanmar_tools.ZawgyiDetector();
      this.myanmarZawgyiConverter = new google_myanmar_tools.ZawgyiConverter();
    }
  },
  computed: {
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
    async translateClick() {
      let text = this.$l2.continua ? this.text.replace(/ /g, "") : this.text;
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
      return this.text.trim() === "";
    },
    fullscreenClick() {
      this.fullscreenMode = !this.fullscreenMode;
    },
    copyClick() {
      let text = this.$l2.continua ? this.text.replace(/ /g, "") : this.text;
      var tempInput = document.createElement("input");
      tempInput.style = "position: absolute; left: -1000px; top: -1000px";
      tempInput.value = text;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      document.body.removeChild(tempInput);
    },
    async visibilityChanged(isVisible) {
      this.isVisible = isVisible;
      await Helper.delay(300);
      if (this.isVisible) {
        this.convertToSentencesAndAnnotate(this.$slots.default[0]);
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
        }
      }
    },
    async annotate(node) {
      this.annotated = false;
      this.annotating = true;
      this.annotatedSlots = [];
      this.annotatedSlots.push(
        $(await this.annotateRecursive(node.cloneNode(true)))[0].outerHTML
      );
      this.annotating = false;
      this.annotated = true;
    },
    async annotateRecursive(node) {
      if (node && node.classList && node.classList.contains("sentence")) {
        // .sentence node
        let sentence = node.innerText;
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
        let $tokenizedSentenceSpan = $(`<span class="sentence">${html}</span>`);
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
    async tokenize(text, batchId) {
      let html = text;
      if (this.$l2.continua) {
        html = await this.tokenizeContinua(text, batchId);
      } else if (
        this.$l2.scripts &&
        this.$l2.scripts[0] &&
        this.$l2.scripts[0].script === "Arab"
      ) {
        html = await this.tokenizeIntegral(text);
      } else if (
        ["de", "gsw", "no", "en", "hy", "vi", "tr"].includes(this.$l2.code)
      ) {
        html = await this.tokenizeAgglutenative(text, batchId);
      } else if (
        (this.$l2.agglutinative || this.$l2.indo) &&
        this.$l2.wiktionary &&
        this.$l2.wiktionary > 2000
      ) {
        html = await this.tokenizeAgglutenative(text, batchId);
      } else {
        html = await this.tokenizeIntegral(text);
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
        if (typeof token === "object") {
          if (token && typeof token === "object") {
            if (token.candidates.length > 0) {
              html += `<WordBlock :checkSaved="${this.checkSaved}" :phonetics="${this.phonetics}" :popup="${this.popup}" :sticky="${this.sticky}" :explore="explore" :token="tokenized[${batchId}][${index}]">${token.text}</WordBlock>`;
            } else {
              html += `<WordBlock :checkSaved="${this.checkSaved}" :phonetics="${this.phonetics}" :popup="${this.popup}" :sticky="${this.sticky}" :explore="explore">${token.text}</WordBlock>`;
            }
          }
        } else {
          html += `<span>${token.replace(/\s+/, "&nbsp;")}</span>`;
        }
      }
      return html;
    },
    async tokenizeAgglutenative(text, batchId) {
      let html = "";
      this.tokenized[batchId] = await (
        await this.$getDictionary()
      ).tokenize(text);
      for (let index in this.tokenized[batchId]) {
        let item = this.tokenized[batchId][index];
        if (typeof item === "object") {
          html += `<WordBlock :checkSaved="${this.checkSaved}" :phonetics="${this.phonetics}" :popup="${this.popup}" :sticky="${this.sticky}" :explore="${this.explore}" :token="tokenized[${batchId}][${index}]">${item.text}</WordBlock>`;
        } else {
          html += `<span>${item
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
          `<WordBlock :checkSaved="${this.checkSaved}" :phonetics="${this.phonetics}" :popup="${this.popup}" :sticky="${this.sticky}" :explore="${this.explore}">` +
            "$1</WordBlock>"
        )
        .replace(
          /!!!###!!!/gi,
          `<span class="${
            this.$l2.code === "tlh" ? "klingon" : ""
          }">&nbsp;</span>`
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
          let sentenceSpan = $(`<span class="sentence">${sentence}</span>`);
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
.show-pinyin-for-saved .add-pinyin.phonetics .sentence,
.show-pinyin .add-pinyin.phonetics:not(.annotated) .sentence {
  line-height: 2.2;
}
.sentence {
  // margin-right: 0.3em;
}
.sentence + .highlight {
  // margin-left: 0.3em;
}
.highlight + .sentence {
  // margin-left: 0.3em;
}
.sentence + .sentence {
  // margin-left: 0.3em;
}
.word-block.saved {
  color: #c59f94;
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

.use-serif .annotated .sentence * {
  font-family: serif;
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

.annotator-buttons {
  float: right;
  padding: 0 0 0 0.5rem;
}

[dir="rtl"] .annotator-buttons {
  float: left;
  padding: 0 0.5rem 0 0;
}
.annotator-menu-toggle {
  font-size: 0.8rem;
  padding: 0.1rem 0.4rem;
  border-radius: 0.2rem;
  background: none;
  border: none;
  color: #ddd;
}

.main-dark,
.widget-dark {
  .annotator-menu-toggle {
    color: #ffffff55;
  }
}

.annotator-buttons .dropdown-item {
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
