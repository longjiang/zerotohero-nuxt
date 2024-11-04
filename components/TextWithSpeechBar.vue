<template>
  <container-query :query="query" v-model="params">
    <div id="speech-container" :class="`skin-${$skin}`">
      <div class="speech-nav text-center d-flex mb-4 rounded p-2 shadow">
        <client-only>
            <template
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
                class="mr-1"
              >
                <i class="fas fa-arrow-left"></i>
              </b-button>
              <b-button
                :variant="$skin"
                @click="$emit('showTOC')"
                v-if="showTocButton"
                :title="$t('Table of Contents') + ' (C)'"
                class="mr-1"
              >
                <i class="fas fa-bars"></i>
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
                class="mr-1"
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
              <!--
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

              <b-button
                :variant="$skin"
                @click="speakPreviousSentence()"
                :title="$t('Previous Sentence') + ' (↑)'"
              >
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
              <b-button
                :variant="$skin"
                @click="speakNextSentence()"
                :title="$t('Next Sentence') + ' (↓)'"
              >
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
              <b-button
                :variant="$skin"
                @click="toggleSpeed"
                :title="$t('Playback Speed: {speed}x', { speed }) + ' (M)'"
              >
                <span>{{ speed }}x</span>
              </b-button>
              -->
            </template>
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
          :key="`chapter-line-${page}-${lineIndex}`"
        >
          <TokenizedRichText
            :showTranslation="translation ? false : true"
            ref="tokenizedRichTexts"
            class="w-100"
            @click="this.focusLineIndex = lineIndex"
            @translation="onTranslation($event, lineIndex)"
            @translationLoading="onTranslationLoading($event, lineIndex)"
            ><span v-html="line"></span>
          </TokenizedRichText>
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
        class="speech-nav my-5 text-center d-flex rounded p-2 shadow"
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
            class="mr-1"
          >
            <i class="fas fa-arrow-left"></i>
          </b-button>
          <b-button
            :variant="$skin"
            @click="$emit('showTOC')"
            v-if="showTocButton"
            :title="$t('Table of Contents') + ' (C)'"
            class="mr-1"
          >
            <i class="fas fa-bars"></i>
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
            class="mr-1"
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
import { timeout } from "../lib/utils/timeout";
import { breakSentences, stripTags } from "../lib/utils/string";
import { SpeechSingleton } from "../lib/utils";
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
      translationOffset: 0, // When translation and content is out of sync, the user can click on the translation to put them in sync.
      voice: 0,
      speed: 1,
      focusLineIndex: 0,
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
    linesPerPage() {
      // Get the default
      let linesPerPage = 15;

      // If the text is longer than 1000 characters, adjust the number of lines per page
      const maxCharCountPerPage = 2000;
      let text = this.allLines.join("\n");
      let idealPageCount = text.length / maxCharCountPerPage
      if (idealPageCount > 1) {
        linesPerPage = Math.ceil(this.allLines.length / idealPageCount);
      }
      return linesPerPage;
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
      // Trim leading and trailing whitespace from the HTML
      let html = this.html.trim();

      // Create a temporary div element to parse the HTML
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;

      // Extract top-level elements
      const topLevelElements = Array.from(tempDiv.children);

      // Get the augmented html of each top-level element
      let lines = topLevelElements.map((element) =>
        this.augmentedHtmlFromDomNode(element)
      );

      // Filter out lines that are empty or contain only whitespace
      lines = lines.filter((l) => l.trim() !== "");

      // Return the resulting lines as an array
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
    this.voices = SpeechSingleton.instance.getVoices(this.$l2.code);
    this.bindKeys();
  },
  beforeDestroy() {
    this.unbindKeys();
  },
  watch: {
    page() {
      this.focusLineIndex = 0;
      this.translationOffset = 0; // When translation and content is out of sync, the user can click on the translation to put them in sync.
      this.translationLoading = {};
      this.goToPage = this.page;
    },
    goToPage() {
      this.$emit("goToPage", this.goToPage);
    },
  },
  methods: {
    stripTags,

    // Other methods below
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
          // if (["ArrowUp"].includes(e.code)) {
          //   this.speakPreviousSentence();
          //   e.preventDefault();
          //   return false;
          // }
          // if (e.code === "Space") {
          //   this.togglePlay();
          //   e.preventDefault(); // Prevent the default spacebar behavior
          //   return false;
          // }
          if (["KeyM"].includes(e.code)) {
            this.toggleSpeed();
            return false;
          }
          // if (["KeyT"].includes(e.code)) {
          //   this.translateAll();
          //   return false;
          // }
        }
      }
    },
    onTranslationSentenceClick(e) {
      if (this.focusLineIndex > 0) {
        let translationSentences = Array.from(
          this.$el.querySelectorAll(".translation-sentence")
        );
        let translationIndex = translationSentences.findIndex(
          (el) => el === e.target
        );
        let translationOffset = translationIndex - this.focusLineIndex;
        this.translationOffset = translationOffset;
      }
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
    normalizeUrl(baseUrl, src) {
      // Ensure there's exactly one slash between the base URL and src
      return `${baseUrl.replace(/\/+$/, '')}/${src.replace(/^\/+/, '')}`;
    },
    augmentedHtmlFromDomNode(dom) {
      // Remove ruby tags
      let rtTags = dom.querySelectorAll("rt");
      rtTags.forEach((rt) => rt.remove());
      let elms = dom.querySelectorAll("[src]");
      elms.forEach((elm) => {
        let src = elm.getAttribute("src");
        if (src && !src.startsWith("http") && !src.startsWith("//") && !src.startsWith("blob:")) {
          elm.setAttribute("src", this.normalizeUrl(this.baseUrl, src));
        }
      });
      const html = dom.outerHTML;
      return html;
    },
    browser() {
      return typeof document !== "undefined";
    },
    setvoice(index) {
      this.voice = index;
    },
    sentenceText(sentence) {
      let textAttr = sentence.getAttribute("data-sentence-text");
      return textAttr || "";
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
  },
};
</script>

<style lang="scss" scoped>
@import "../assets/scss/variables.scss";
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
  opacity: 0.8;
  line-height: 2;
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
      display: block;
    }
  }
}
</style>
