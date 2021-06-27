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
    }"
  >
    <div class="annotator-buttons" v-if="!empty() && buttons">
      <b-dropdown no-caret toggle-class="annotator-menu-toggle" dropleft>
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
      :class="{ 'annotate-slot': true, 'd-none': annotated }"
      style="display: inline"
    >
      <slot></slot>
    </div>
    <div :class="{ 'd-none': !textMode }">
      <input
        :class="{ 'annotate-input': true, 'd-none': !textMode || !annotated }"
        @select="select"
        @blur="reannotate"
        @click.stop="dummyFunction"
        :value="text"
        style="width: calc(100% - 2rem)"
      />
      <div
        class="selection-lookup-popover d-block mt-1 text-center"
        style="font-size: 0.8em"
        v-if="textMode"
      >
        <router-link
          :to="`/${$l1.code}/${$l2.code}/phrase/search/${
            selectedText ? selectedText : ''
          }`"
          class="link-unstyled"
        >
          <i class="fas fa-quote-left"></i>
          Look up {{ selectedText ? `“${selectedText}” as` : "" }} a phrase
        </router-link>
      </div>
    </div>
    <v-runtime-template
      v-if="annotated && !textMode"
      v-for="(template, index) of annotatedSlots"
      :key="`annotate-template-${index}`"
      :template="template"
    />
    <div v-if="translation">{{ translation }}</div>
  </component>
</template>

<script>
import wordblock from "@/components/WordBlock";
import VRuntimeTemplate from "v-runtime-template";
import Helper from "@/lib/helper";

export default {
  components: {
    wordblock,
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
      textMode: false,
      tokenized: [],
      dictionary: undefined,
    };
  },
  mounted() {
    if (this.$slots.default) {
      for (let slot of this.$slots.default) {
        this.text += $(slot.elm).text();
      }
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
    textMode() {
      if (this.textMode) {
        let element = this.$el.querySelector(".annotate-input");
        setTimeout(() => {
          element.focus();
        }, 0);
      }
    },
  },
  methods: {
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

      let url = undefined;
      if ([this.$l2.code, this.$l1.code].includes("zh") || this.$l2.han) {
        url = `https://fanyi.baidu.com/#${this.$l2.code}/${this.$l1.code}/${text}`;
      } else if (["ko", "ja"].includes(this.$l2.code)) {
        url = `https://papago.naver.com/?sk=auto&st=${encodeURIComponent(
          text
        )}`;
      } else if (this.hasTranslate(this.$l2)) {
        url = `https://translate.google.com/#view=home&op=translate&sl=${
          this.$l2.code === "zh" ? "zh-CN" : this.$l2.code
        }&tl=${this.$l1.code}&text=${encodeURIComponent(text)}`;
      } else {
        url = `https://translate.panlex.org/?langDe=${
          this.$l2["iso639-3"]
        }-000&langAl=${this.$l1["iso639-3"]}-000&txt=${encodeURIComponent(
          text
        )}`;
      }
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
    visibilityChanged(isVisible) {
      if (isVisible) {
        this.convertToSentencesAndAnnotate(this.$slots.default[0]);
      }
    },
    async reannotate(e) {
      let node = this.$el.querySelector(".annotate-slot > *");
      node.innerText = e.target.value;
      this.convertToSentencesRecursive(node);
      this.annotate(node);
      await Helper.timeout(200);
      this.selectedText = undefined;
      this.textMode = false;
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
        html = "";
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
      } else if (["en", "ko", "fr"].includes(this.$l2.code)) {
        html = "";
        this.tokenized[batchId] = await (
          await this.$getDictionary()
        ).tokenize(text);
        for (let index in this.tokenized[batchId]) {
          let item = this.tokenized[batchId][index];
          if (typeof item === "object") {
            let text = item.text.toLowerCase();
            html += `<WordBlock :checkSaved="${this.checkSaved}" :phonetics="${this.phonetics}" :popup="${this.popup}" :sticky="${this.sticky}" :explore="${this.explore}" :token="tokenized[${batchId}][${index}]">${item.text}</WordBlock>`;
          } else {
            html += `<span>${item
              .replace(/\s+([,.!?])/, "$1")
              .replace(/\s+/g, "&nbsp;")}</span>`;
          }
        }
      } else {
        let regex = `(((?![?])[${
          this.$l2.apostrophe ? "'ʼ" : ""
        }\u0041-\u005A\u0061-\u007A\u00AA\u00B5\u00BA\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u0527\u0530-\u058F\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\u0750-\u077F\u0780-\u07BF\u07C0-\u07FF\u0800-\u083F\u0840-\u085F\u0860-\u086F\u08A0-\u08FF\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F\u0D80-\u0DFF\u0E00-\u0E7F\u0E80-\u0EFF\u0F00-\u0FFF\u1000-\u109F\u10A0-\u10FF\u1100-\u11FF\u1200-\u137F\u1380-\u139F\u13A0-\u13FF\u1400-\u167F\u1680-\u169F\u16A0-\u16FF\u1700-\u171F\u1720-\u173F\u1740-\u175F\u1760-\u177F\u1780-\u17FF\u1800-\u18AF\u18B0-\u18FF\u1900-\u194F\u1950-\u197F\u1980-\u19DF\u19E0-\u19FF\u1A00-\u1A1F\u1A20-\u1AAF\u1AB0-\u1AFF\u1B00-\u1B7F\u1B80-\u1BBF\u1BC0-\u1BFF\u1C00-\u1C4F\u1C50-\u1C7F\u1C80-\u1C8F\u1C90-\u1CBF\u1CC0-\u1CCF\u1CD0-\u1CFF\u1D00-\u1D7F\u1D80-\u1DBF\u1DC0-\u1DFF\u1E00-\u1EFF\u1F00-\u1FFF\u2070-\u209F\u20D0-\u20FF\u2100-\u214F\u2150-\u218F\u2800-\u28FF\u2C00-\u2C5F\u2C60-\u2C7F\u2C80-\u2CFF\u2D00-\u2D2F\u2D30-\u2D7F\u2D80-\u2DDF\u2DE0-\u2DFF\u2E80-\u2EFF\u2F00-\u2FDF\u3040-\u309F\u30A0-\u30FF\u3100-\u312F\u3130-\u318F\u31A0-\u31BF\u31F0-\u31FF\u3200-\u32FF\u3300-\u33FF\u3400-\u4DBF\u4E00-\u9FFF\uA000-\uA48F\uA490-\uA4CF\uA4D0-\uA4FF\uA500-\uA63F\uA640-\uA69F\uA6A0-\uA6FF\uA720-\uA7FF\uA800-\uA82F\uA840-\uA87F\uA880-\uA8DF\uA8E0-\uA8FF\uA900-\uA92F\uA930-\uA95F\uA960-\uA97F\uA980-\uA9DF\uA9E0-\uA9FF\uAA00-\uAA5F\uAA60-\uAA7F\uAA80-\uAADF\uAAE0-\uAAFF\uAB00-\uAB2F\uAB30-\uAB6F\uAB70-\uABBF\uABC0-\uABFF\uAC00-\uD7AF\uD7B0-\uD7FF\uD800-\uDB7F\uDB80-\uDBFF\uDC00-\uDFFF\uE000-\uF8FF\uF900-\uFAFF\uFB00-\uFB4F\uFB50-\uFDFF\uFE00-\uFE0F\uFE20-\uFE2F\uFE70-\uFEFF\uFF00-\uFFEF])+)`;
        // Additional characters removed so the spanish question mark (¿) gets excluded
        // \u10000-\u1007F\u10080-\u100FF\u10140-\u1018F\u10190-\u101CF\u101D0-\u101FF\u10280-\u1029F\u102A0-\u102DF\u102E0-\u102FF\u10300-\u1032F\u10330-\u1034F\u10350-\u1037F\u10380-\u1039F\u103A0-\u103DF\u10400-\u1044F\u10450-\u1047F\u10480-\u104AF\u104B0-\u104FF\u10500-\u1052F\u10530-\u1056F\u10600-\u1077F\u10800-\u1083F\u10840-\u1085F\u10860-\u1087F\u10880-\u108AF\u108E0-\u108FF\u10900-\u1091F\u10920-\u1093F\u10980-\u1099F\u109A0-\u109FF\u10A00-\u10A5F\u10A60-\u10A7F\u10A80-\u10A9F\u10AC0-\u10AFF\u10B00-\u10B3F\u10B40-\u10B5F\u10B60-\u10B7F\u10B80-\u10BAF\u10C00-\u10C4F\u10C80-\u10CFF\u10D00-\u10D3F\u10E60-\u10E7F\u10F00-\u10F2F\u10F30-\u10F6F\u10FE0-\u10FFF\u11000-\u1107F\u11080-\u110CF\u110D0-\u110FF\u11100-\u1114F\u11150-\u1117F\u11180-\u111DF\u111E0-\u111FF\u11200-\u1124F\u11280-\u112AF\u112B0-\u112FF\u11300-\u1137F\u11400-\u1147F\u11480-\u114DF\u11580-\u115FF\u11600-\u1165F\u11660-\u1167F\u11680-\u116CF\u11700-\u1173F\u11800-\u1184F\u118A0-\u118FF\u119A0-\u119FF\u11A00-\u11A4F\u11A50-\u11AAF\u11AC0-\u11AFF\u11C00-\u11C6F\u11C70-\u11CBF\u11D00-\u11D5F\u11D60-\u11DAF\u11EE0-\u11EFF\u11FC0-\u11FFF\u12000-\u123FF\u12480-\u1254F\u13000-\u1342F\u13430-\u1343F\u14400-\u1467F\u16800-\u16A3F\u16A40-\u16A6F\u16AD0-\u16AFF\u16B00-\u16B8F\u16E40-\u16E9F\u16F00-\u16F9F\u17000-\u187FF\u18800-\u18AFF\u1B000-\u1B0FF\u1B100-\u1B12F\u1B130-\u1B16F\u1B170-\u1B2FF\u1BC00-\u1BC9F\u1D200-\u1D24F\u1D800-\u1DAAF\u1E000-\u1E02F\u1E100-\u1E14F\u1E2C0-\u1E2FF\u1E800-\u1E8DF\u1E900-\u1E95F\u1EE00-\u1EEFF\u1F200-\u1F2FF\u1F300-\u1F5FF\u20000-\u2A6DF\u2A700-\u2B73F\u2B740-\u2B81F\u2B820-\u2CEAF\u2CEB0-\u2EBEF\u2F800-\u2FA1F\uE0100-\uE01EF\uF0000-\uFFFFF\u100000-\u10FFFF
        let reg = new RegExp(regex, "gi");
        html = text
          .replace(/\s+/gi, "!!!###!!!")
          .replace(
            reg,
            `<WordBlock :checkSaved="${this.checkSaved}" :phonetics="${this.phonetics}" :popup="${this.popup}" :sticky="${this.sticky}" :explore="${this.explore}">` +
              "$1</WordBlock>"
          )
          .replace(/!!!###!!!/gi, "<span>&nbsp;</span>");
      }
      // html = text.replace(/([\S]+)/gi, '<WordBlock>$1</WordBlock>')
      // $(`#sentence-placeholder-${batchId}`).remove()
      return html;
    },
    convertToSentencesRecursive(node) {
      if (node.nodeType === 3) {
        // textNode
        // break setnences
        let text = node.nodeValue;
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
  line-height: 2.6;
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
