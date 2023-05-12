<template>
  <container-query :query="query" v-model="params">
    <div id="speech-container" :class="`skin-${$skin}`">
      <div class="speech-bar mb-4">
        <client-only>
          <b-button-group class="d-flex speech-bar-inner shadow rounded">
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
                :variant="$skin"
                @click="$emit('showTOC')"
                v-if="showTocButton"
                :title="$t('Table of Contents') + ' (C)'"
              >
                <i class="fas fa-bars"></i>
              </b-button>
              <b-dropdown
                :variant="$skin"
                right
                :text="$t('Voice')"
                :title="$t('Voice') + ': ' + voices[voice].name"
                style="flex: 1"
              >
                <template #button-content>
                  <i class="fa-solid fa-lips"></i>
                </template>
                <b-dropdown-item
                  v-for="(voice, index) in voices"
                  :key="`speech-bar-voice-${index}-${voice.name}`"
                  @click="setvoice(index)"
                >
                  {{ voice.name }}
                </b-dropdown-item>
              </b-dropdown>
              <b-button
                v-if="showTocButton"
                :disabled="!hasPreviousChapter"
                :variant="$skin"
                @click="$emit('prevChapter')"
                :title="$t('Previous Chapter') + ' (⇧ + ←)'"
              >
                <i class="fas fa-step-backward"></i>
              </b-button>
              <b-button :variant="$skin" @click="previous()" :title="$t('Previous Sentence') + ' (↑)'">
                <i class="fas fa-arrow-up"></i>
              </b-button>
              <b-button
                class="text-success"
                :variant="$skin"
                v-if="!speaking"
                @click="play()"
                :title="$t('Play') + ` (${$t('SPACE BAR')})`"
              >
                <i class="fas fa-play"></i>
              </b-button>
              <b-button
                class="text-success"
                :variant="$skin"
                v-if="speaking"
                @click="pause()"
                :title="$t('Pause') + ` (${$t('SPACE BAR')})`"
              >
                <i class="fas fa-pause"></i>
              </b-button>
              <b-button :variant="$skin" @click="next()" :title="$t('Next Sentence') + ' (↓)'">
                <i class="fas fa-arrow-down"></i>
              </b-button>
              <b-button
                v-if="showTocButton"
                :disabled="!hasNextChapter"
                :variant="$skin"
                @click="$emit('nextChapter')"
                :title="$t('Next Chapter') + ' (⇧ + →)'"
              >
                <i class="fas fa-step-forward"></i>
              </b-button>
              <b-button :variant="$skin" @click="toggleSpeed" :title="$t('Playback Speed: {speed}x', { speed }) + ' (M)'">
                <span>{{ speed }}x</span>
              </b-button>
            </template>
            <b-button
              :variant="$skin"
              @click="translateAll()"
              :title="$t('Translate') + ' (T)'"
            >
              <i class="fas fa-language"></i>
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
            :useZoom="true"
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
            <template v-else-if="translation && parallellines[lineIndex]">
              <span
                class="translation-sentence"
                v-for="(sentence, index) in parallellines[lineIndex]"
                :key="`parallel-line-${lineIndex}-sent-${index}`"
                @click="onTranslationSentenceClick"
              >
                {{ sentence }}
              </span>
            </template>
          </div>
        </div>
      </div>
      <div
        class="speech-nav mt-5 text-center d-flex mb-4 rounded p-2 shadow"
        v-if="pageCount > 1 || showTocButton"
      >
        <b-button
          v-if="showTocButton"
          class="mr-1"
          :disabled="!hasPreviousChapter"
          :variant="$skin"
          :title="$t('Previous Chapter') + ' (⇧ + ←)'"
          @click="$emit('previousChapter')"
        >
          <i class="fas fa-step-backward"></i>
        </b-button>
        <b-button
          v-if="Number(page) > 1"
          :variant="$skin"
          :title="$t('Previous Page') + ' (←)'"
          @click="$emit('previousPage')"
        >
          <i class="fas fa-arrow-left"></i>
        </b-button>
        <b-form-select
          size="md"
          v-model="goToPage"
          class="speech-nav-page-select text-center border-0"
          :options="pageOptions"
          :variant="$skin"
        />
        <b-button
          v-if="Number(page) < pageCount"
          :variant="$skin"
          @click="$emit('nextPage')"
          :title="$t('Next Page') + ' (→)'"
        >
          <i class="fas fa-arrow-right"></i>
        </b-button>
        <b-button
          v-if="showTocButton"
          :disabled="!hasNextChapter"
          :variant="$skin"
          @click="$emit('nextChapter')"
          :title="$t('Next Chapter') + ' (⇧ + →)'"
        >
          <i class="fas fa-step-forward"></i>
        </b-button>
      </div>
    </div>
  </container-query>
</template>

<script>
import { parse } from "node-html-parser";
import { ContainerQuery } from "vue-container-query";
import { timeout } from "@/lib/utils/timeout";
import { breakSentences } from "@/lib/utils/string";
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
    showTocButton: {
      default: false,
    },
    hasPreviousChapter: {
      default: false,
    },
    hasNextChapter: {
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
      translationOffset: 0, // When translation and content is out of sync, the user can click on the translation to put them in sync.
      voice: 0,
      speed: 1,
      linesPerPage: 15,
      utterance: undefined,
      speaking: false,
      speakingLineIndex: undefined,
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
    pageOptions() {
      let options = [];
      for (let i = 1; i <= this.pageCount; i++) {
        options.push({
          value: i,
          text: this.$t("Page {i} / {num}", { i, num: this.pageCount }),
        });
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
        return parallelLines.map((l) => breakSentences(l));
      }
    },
  },
  mounted() {
    this.getVoices();
    this.bindKeys();
  },
  beforeDestroy() {
    this.unbindKeys();
  },
  watch: {
    current() {
      this.update();
    },
    page() {
      this.current = 0;
      this.translationOffset = 0; // When translation and content is out of sync, the user can click on the translation to put them in sync.
      this.translationLoading = {};
      this.goToPage = this.page;
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
    bindKeys() {
      window.addEventListener("keydown", this.handleKeydown);
    },
    unbindKeys() {
      window.removeEventListener("keydown", this.handleKeydown);
    },
    handleKeydown(e) {
      {
        if (
          !["INPUT", "TEXTAREA"].includes(e.target.tagName.toUpperCase()) &&
          !e.metaKey &&
          !e.target.getAttribute("contenteditable")
        ) {
          if (["KeyC"].includes(e.code)) {
            this.$emit("showTOC");
            return false;
          }
          if (["ArrowLeft"].includes(e.code) && e.shiftKey) {
            this.$emit("previousChapter");
            return false;
          }
          if (["ArrowRight"].includes(e.code) && e.shiftKey) {
            this.$emit("nextChapter");
            return false;
          }
          if (["ArrowLeft"].includes(e.code)) {
            if (Number(this.page) > 1) {
              this.$emit("previousPage");
            } else {
              this.$emit("previousChapter");
            }
            return false;
          }
          if (["ArrowRight"].includes(e.code)) {
            if (Number(this.page) < this.pageCount) {
              this.$emit("nextPage");
            } else {
              this.$emit("nextChapter");
            }
            return false;
          }
          if (["ArrowUp"].includes(e.code)) {
            this.previous();
            e.preventDefault();
            return false;
          }
          if (["ArrowDown"].includes(e.code)) {
            this.next();
            e.preventDefault();
            return false;
          }
          if (e.code === "Space") {
            this.togglePlay();
            e.preventDefault(); // Prevent the default spacebar behavior
            return false;
          }
          if (["KeyM"].includes(e.code)) {
            this.toggleSpeed();
            return false;
          }
          if (["KeyT"].includes(e.code)) {
            this.translateAll();
            return false;
          }
        }
      }
    },
    togglePlay() {
      if (this.speaking) {
        this.pause();
      } else {
        this.play();
      }
    },
    onTranslationSentenceClick(e) {
      if (this.current > 0) {
        let translationSentences = Array.from(
          this.$el.querySelectorAll(".translation-sentence")
        );
        let translationIndex = translationSentences.findIndex(
          (el) => el === e.target
        );
        let translationOffset = translationIndex - this.current;
        this.translationOffset = translationOffset;
        this.update();
      }
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

      // Remove ruby tags
      let rtTags = dom.querySelectorAll("rt");
      rtTags.forEach(rt => rt.remove());

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
      let speechSynthesis = window?.speechSynthesis;
      if (!speechSynthesis) return;
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
      const translationSentence =
        translationSentences[this.current + this.translationOffset];
      $(translationSentence).addClass("current");
    },
    speak(text) {
      if (window && window.speechSynthesis) {
        let speechSynthesis = window.speechSynthesis;
        if (speechSynthesis.paused) {
          if (this.utterance) {
            this.utterance.onend = undefined;
          }
          speechSynthesis.cancel();
        }
        if (this.voices.length === 0) this.getVoices();
        this.utterance = new SpeechSynthesisUtterance(text);
        // this.utterance.lang = this.lang || this.$l2.code
        this.utterance.rate = this.speed * 0.9;
        if (this.voices[this.voice]) {
          this.utterance.voice = this.voices[this.voice];
        }
        speechSynthesis.speak(this.utterance);
        if (this.utterance) {
          this.utterance.onend = () => {
            this.next();
          };
        }
      }
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
      let speechSynthesis = window?.speechSynthesis;
      if (!speechSynthesis) return;
      this.speaking = true;
      if (speechSynthesis.paused && this.speakingLineIndex === this.current) {
        speechSynthesis.resume();
      } else {
        this.update();
        this.speakingLineIndex = this.current;
        const sentence = this.getSentences()[this.current];
        let text = this.sentenceText(sentence);
        text = text.replace(/[\n\s]+/g, " ");
        if (this.$l2.continua) text = text.replace(/\s/g, "");
        if (text.length === 0) {
          this.next();
          return;
        }
        this.speak(text);
      }
    },
    pause() {
      if (window && window.speechSynthesis) {
        let speechSynthesis = window.speechSynthesis;
        this.speaking = false;
        if (this.speakingLineIndex === this.current) {
          speechSynthesis.pause();
        } else {
          if (this.utterance) {
            this.utterance.onend = undefined;
          }
          speechSynthesis.cancel();
        }
      }
    },
    previous() {
      this.current = Math.max(0, this.current - 1);
      if (this.speaking) {
        this.pause();
        this.play();
      }
      this.scrollToCurrentSentence()
    },
    scrollToCurrentSentence() {
      this.$nextTick(() => {
        const currentSentence = this.$el.querySelector('.sentence.current');
        if (currentSentence) {
          currentSentence.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    },
    next() {
      if (this.current + 1 < this.getSentences().length) {
        this.current++;
        if (this.speaking) {
          this.pause();
          this.play();
        }
        this.scrollToCurrentSentence()
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/variables.scss";
#speech-container.skin-dark {
  .speech-bar,
  .speech-nav {
    background-color: #333;
    color: #fff;
    border: 1px solid #666;
    border-radius: 0.25rem;
  }
  .speech-nav-page-select {
    background-color: #555;
    color: #ccc;
    cursor: pointer;
  }
}

:deep(.sentence.current),
:deep(.translation-sentence.current),
:deep(.annotate-translation-sentence.current) {
  background-color: rgba($primary-color, 0.25);
}

#speech-container.skin-light {
  .speech-bar,
  .speech-nav {
    background-color: #fff;
    color: #333;
    border: 1px solid #eaeaea;
    border-radius: 0.25rem;
  }
  .speech-nav-page-select {
    background-color: #eee;
    color: #333;
    cursor: pointer;
  }
}

.speech-nav {
  justify-content: center;
  align-items: center;
  .speech-nav-page-select {
    width: auto;
    padding-right: 1.25rem !important;
    margin: auto;
  }
}

.translation-sentence {
  cursor: pointer;
}

.speech-bar {
  position: sticky;
  top: 0;
  z-index: 11;
  .btn {
    padding: 0.375rem 0.2rem;
  }
}

:deep(img) {
  max-width: 100%;
  object-fit: contain;
  height: auto;
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
