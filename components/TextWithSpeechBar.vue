<template>
  <container-query :query="query" v-model="params">
    <div id="speech-container">
      <div class="speech-bar mb-4 bg-white">
        <client-only>
          <b-button-group
            class="d-flex speech-bar-inner shadow rounded"
            style="border: 1px solid #dedede"
          >
            <template
              v-if="
                html &&
                voices &&
                voices.length > 0 &&
                ($hasFeature('speech') || !foreign) &&
                browser()
              "
            >
              <b-button
                variant="light text-success"
                v-if="!speaking"
                @click="play()"
              >
                <i class="fas fa-play"></i>
              </b-button>
              <b-button
                variant="light text-success"
                v-if="speaking"
                @click="pause()"
              >
                <i class="fas fa-pause"></i>
              </b-button>
              <b-button variant="light" @click="previous()">
                <i class="fas fa-arrow-up"></i>
              </b-button>
              <b-button variant="light" @click="next()">
                <i class="fas fa-arrow-down"></i>
              </b-button>
              <b-button variant="light" @click="toggleSpeed">
                <span>{{ speed }}x</span>
              </b-button>
              <b-dropdown
                variant="light"
                right
                :text="$t('Voice')"
                style="flex: 1"
              >
                <b-dropdown-item
                  v-for="(voice, index) in voices"
                  :key="`speech-bar-voice-${index}-${voice.name}`"
                  @click="setvoice(index)"
                >
                  {{ voice.name }}
                </b-dropdown-item>
              </b-dropdown>
            </template>
            <b-button variant="light" @click="translateAll()">
              {{ $t("Translate") }}
            </b-button>
          </b-button-group>
        </client-only>
      </div>
      <div
        :class="`speech-content ${params.lg ? 'speech-content-wide' : ''} ${
          translation ? 'with-translation' : ''
        }`"
        :key="`speech-content-page-${page}`"
      >
        <div
          class="line w-100 mb-4"
          v-for="(line, lineIndex) of lines"
          :key="`chapter-line-${lineIndex}`"
        >
          <Annotate
            class="annotated-line"
            tag="div"
            :foreign="foreign"
            :emitSentenceTextAsAttr="true"
            :buttons="true"
            :showTranslation="translation ? false : true"
            :showLoading="showLoading"
            ref="annotate"
            @translation="onTranslation($event, lineIndex)"
            @translationLoading="onTranslationLoading($event, lineIndex)"
            @sentenceClick="onSentenceClick"
          >
            <div v-html="line.trim()" />
          </Annotate>
          <div
            v-if="translation || translationLoading"
            class="translation-line"
          >
            <beat-loader
              v-if="translationLoading[lineIndex]"
              class="d-inline-block"
              color="#28a745"
              size="5px"
            ></beat-loader>
            <span
              v-else-if="translation"
              v-html="translationHtml(parallellines[lineIndex])"
            />
          </div>
        </div>
      </div>
      <div
        class="speech-nav mt-5 text-center d-flex mb-4 rounded p-2 shadow"
        v-if="page && pageCount > 1"
        style="
          justify-content: center;
          align-items: center;
          border: 1px solid #dedede;
        "
      >
        <button
          v-if="Number(page) > 1"
          class="btn text-success btn-sm mr-1"
          @click="$emit('previousPage')"
          style="width: 2rem"
        >
          <i class="fas fa-arrow-left"></i>
        </button>
        <b-form-select
          size="md"
          v-model="goToPage"
          :options="pageOptions"
          class="text-center border-0"
          style="width: auto; padding-right: 1.25rem !important; margin: auto" />
        <button
          v-if="Number(page) < pageCount"
          class="btn text-success btn-sm ml-1"
          @click="$emit('nextPage')"
          style="width: 2rem"
        >
          <i class="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>
  </container-query>
</template>

<script>
import { parse } from "node-html-parser";
import { ContainerQuery } from "vue-container-query";
import { timeout } from "@/lib/utils/timeout";
import Vue from "vue";
import BeatLoader from "vue-spinner/src/BeatLoader.vue";

export default {
  components: {
    BeatLoader,
    ContainerQuery,
  },
  props: {
    html: {
      type: String,
    },
    translation: {
      type: String,
    },
    showLoading: {
      default: false,
    },
    lang: {
      default: undefined,
    },
    foreign: {
      default: true,
    },
    page: {
      type: [Number, String],
    },
    baseUrl: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      goToPage: this.page, // What the user selects from the dropdown
      current: 0,
      voice: 0,
      speed: 1,
      linesPerPage: 10,
      utterance: undefined,
      speaking: false,
      translationLoading: {},
      voices: [],
      params: {},
      query: {
        lg: {
          minWidth: 600,
        },
      },
    };
  },
  computed: {
    currentSentence() {
      let sentences = this.getSentences();
      let currentSentence = sentences?.[this.current];
      return currentSentence;
    },
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
    pageOptions() {
      let options = [];
      for (let i = 1; i <= this.pageCount; i++) {
        options.push({ value: i, text: this.$t('Page') + ` ${i} / ${this.pageCount}` });
      }
      return options;
    },
    allLines() {
      let html = this.html.trim();
      let lines = html
        .replace(/<(div|p|h1|h2|h3|h4|h5|h6|dd)/g, "ANNOTATORSEPARATOR!!!<$1")
        .split("ANNOTATORSEPARATOR!!!");
      lines = lines.map((line) => this.augmentHtml(line));
      lines = lines.filter((l) => l.trim() !== "");
      return lines;
    },
    lines() {
      let lines = this.allLines;
      if (this.page)
        lines = lines.slice(
          this.linesPerPage * (this.page - 1),
          this.linesPerPage * this.page
        );
      return lines;
    },
    pageCount() {
      return Math.ceil(this.allLines.length / this.linesPerPage);
    },
    parallellines() {
      if (this.translation) {
        let parallelLines = this.translation.replace(/\n+/g, "\n").split("\n");
        if (this.page)
          parallelLines = parallelLines.slice(
            this.linesPerPage * (this.page - 1),
            this.linesPerPage * this.page
          );
        return parallelLines;
      }
    },
  },
  mounted() {
    this.getVoices();
  },
  watch: {
    current() {
      this.update();
    },
    page() {
      this.current = 0;
      this.translationLoading = {};
    },
    goToPage() {
      this.$emit("goToPage", this.goToPage);
    },
    speed() {
      if (this.speaking) {
        this.pause();
        this.play();
      }
    },
    voice() {
      if (this.speaking) {
        this.pause();
        this.play();
      }
    },
  },
  methods: {
    translationHtml(text) {
      let sentences = this.breakSentences(text);
      let html = "";
      for (let s of sentences) {
        html += `<span class="translation-sentence">${s}</span>`;
      }
      return html;
    },
    breakSentences(text) {
      text = text.replace(/([!?:。！？：])/g, "$1SENTENCEENDING!!!");
      text = text.replace(/(\. )/g, "$1SENTENCEENDING!!!");
      let sentences = text.split("SENTENCEENDING!!!");
      return sentences.filter((sentence) => sentence.trim() !== "");
    },
    onSentenceClick(sentenceEl) {
      let sentences = this.getSentences();
      let index = sentences.findIndex((el) => el === sentenceEl);
      this.current = Math.max(index, 0);
    },
    async translateAll() {
      if (this.$refs.annotate?.[0]) {
        for (let a of this.$refs.annotate) {
          if (a.text?.trim() !== "") {
            a.translateClick();
            await timeout(3000);
          }
        }
      }
    },
    onTranslationLoading(translationLoading, lineIndex) {
      Vue.set(this.translationLoading, lineIndex, translationLoading);
    },
    onTranslation(t, lineIndex) {
      let parallellines = [];
      if (this.translation) {
        parallellines = this.translation
          .replace(/\n+/g, "\n")
          .trim()
          .split("\n");
      } else {
        for (let i = 0; i < this.allLines.length; i++) {
          parallellines.push("-");
        }
      }
      if (this.page)
        lineIndex = Number(lineIndex) + (this.page - 1) * this.linesPerPage;
      parallellines[lineIndex] = t;
      let translation = parallellines.join("\n");
      this.$emit("translation", translation);
    },
    toggleSpeed() {
      let speeds = [1, 0.75, 0.5];
      let index = speeds.findIndex((s) => s === this.speed);
      if (index > -1) {
        index = index + 1;
        if (index === speeds.length) index = 0;
      }
      this.speed = speeds[index];
    },
    augmentHtml(html) {
      let dom = parse(html);
      let as = dom.querySelectorAll("a");
      as.forEach((a) => {
        let bookLinkHtml = a
          .toString()
          .replace(/^<a/, `<ReaderLink alt="${this.baseUrl}"`)
          .replace(/<\/a>$/, "</ReaderLink>");
        a.replaceWith(parse(bookLinkHtml));
      });
      let elms = dom.querySelectorAll("[src]");
      elms.forEach((elm) => {
        let src = elm.getAttribute("src");
        if (src && !src.startsWith("http")) {
          elm.setAttribute("src", this.baseUrl + src);
        }
      });
      html = dom.toString();
      return html;
    },
    browser() {
      return typeof document !== "undefined";
    },
    getVoices() {
      let voices = speechSynthesis
        .getVoices()
        .filter(
          (voice) =>
            voice.lang.startsWith(this.lang || this.$l2.code) &&
            !voice.name.includes("Siri")
        );
      this.voices = voices;
    },
    setvoice(index) {
      this.voice = index;
    },
    sentenceText(sentence) {
      let textAttr = sentence.getAttribute("data-sentence-text");
      return textAttr || "";
    },
    getSentences() {
      let sentences = [];
      for (let annotate of this.$children) {
        for (let sentence of annotate.$el.querySelectorAll(
          ".annotate-template .sentence"
        )) {
          sentences.push(sentence);
        }
      }
      return sentences;
    },
    getTranslationSentences() {
      let sentences = [];
      for (let annotate of this.$children) {
        for (let sentence of annotate.$el.querySelectorAll(
          ".translation-sentence"
        )) {
          sentences.push(sentence);
        }
      }
      return sentences;
    },
    update() {
      let sentences = this.getSentences();
      for (let sentence of sentences) {
        $(sentence).removeClass("current");
      }
      const sentence = sentences[this.current];
      $(sentence).addClass("current");
      let translationSentences = this.getTranslationSentences();
      for (let translationSentence of translationSentences) {
        $(translationSentence).removeClass("current");
      }
      const translationSentence = translationSentences[this.current];
      $(translationSentence).addClass("current");
    },
    speak(text) {
      if (this.voices.length === 0) this.getVoices();
      this.utterance = new SpeechSynthesisUtterance(text);
      // this.utterance.lang = this.lang || this.$l2.code
      this.utterance.rate = this.speed;
      if (this.voices[this.voice]) {
        this.utterance.voice = this.voices[this.voice];
      }
      speechSynthesis.speak(this.utterance);
    },
    scroll(sentence) {
      if (sentence.offsetHeight > 0) {
        sentence.scrollIntoView();
        window.scrollBy(
          0,
          document.documentElement.clientHeight / -2 +
            (sentence.offsetHeight || 0) / 2
        );
      }
    },
    play() {
      this.update();
      this.speaking = true;
      const sentence = this.getSentences()[this.current];
      let text = this.sentenceText(sentence);
      text = text.replace(/[\n\s]+/g, " ");
      if (this.$l2.continua) text = text.replace(/\s/g, "");
      if (text.length === 0) {
        this.next();
        return;
      }
      this.speak(text);
      if (this.utterance) {
        this.utterance.onend = () => {
          this.next();
        };
      }
    },
    pause() {
      speechSynthesis.cancel();
      if (this.utterance) {
        this.utterance.onend = undefined;
      }
      this.speaking = false;
    },
    previous() {
      this.current = Math.max(0, this.current - 1);
      if (this.speaking) {
        this.pause();
        this.play();
      }
    },
    next() {
      if (this.current + 1 < this.getSentences().length) {
        this.current++;
        if (this.speaking) {
          this.pause();
          this.play();
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep .sentence.current,
::v-deep .translation-sentence.current,
::v-deep .annotate-translation-sentence.current {
  background-color: rgba(212, 212, 255, 0.5);
}

.speech-bar {
  position: sticky;
  top: 0;
  z-index: 11;
}

::v-deep img {
  max-width: 100%;
  object-fit: contain;
  height: auto;
}

#zerotohero:not(.zerotohero-wide) {
  .speech-bar {
    top: calc(env(safe-area-inset-top, 0) + 7rem);
  }
}

.annotated-line {
  color: black;
  ::v-deep .annotate-translation {
    color: #444;
  }
}

.translation-line {
  font-size: 0.8em;
  color: #444;
}

.speech-content-wide.with-translation {
  .line {
    display: flex;
    align-items: flex-start;
    .annotated-line {
      width: 61.8%;
    }
    .translation-line {
      width: 38.2%;
      margin-left: 1rem;
    }
  }
}
</style>
