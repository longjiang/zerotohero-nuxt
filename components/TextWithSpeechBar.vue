<template>
  <container-query :query="query" v-model="params">
    <div id="speech-container">
      <div
        v-if="
          html &&
          voices &&
          voices.length > 0 &&
          ($hasFeature('speech') || !foreign) &&
          browser()
        "
        class="speech-bar mb-4 bg-white pt-2 pb-2"
      >
        <client-only>
          <b-button-group class="d-flex">
            <b-button v-if="!speaking" @click="play()">
              <i class="fas fa-volume-up"></i>
              {{ this.current === 0 ? "Read" : "Resume" }}
            </b-button>
            <b-button v-if="speaking" @click="pause()">
              <i class="fas fa-pause"></i>
              Pause
            </b-button>
            <b-button @click="previous()">
              <i class="fas fa-arrow-up"></i>
            </b-button>
            <b-button @click="next()">
              <i class="fas fa-arrow-down"></i>
            </b-button>
            <b-button @click="toggleSpeed">
              <span v-if="speed === 1">
                <i class="fas fa-tachometer-alt"></i>
              </span>
              <span v-else>{{ speed }}x</span>
            </b-button>
            <b-dropdown right text="Voice" style="flex: 1">
              <b-dropdown-item
                v-for="(voice, index) in voices"
                :key="`speech-bar-voice-${index}-${voice.name}`"
                @click="setvoice(index)"
              >
                {{ voice.name }}
              </b-dropdown-item>
            </b-dropdown>
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
            @translation="onTranslation($event, lineIndex)"
            @translationLoading="onTranslationLoading($event, lineIndex)"
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
            <span v-else-if="translation">{{ parallellines[lineIndex] }}</span>
          </div>
        </div>
      </div>
      <div class="speech-nav mt-5 text-center d-flex pb-4" v-if="page" style="justify-content: center; align-items: center">
        <button
          v-if="Number(page) > 1"
          class="btn btn-success btn-sm mr-1"
          @click="$emit('previousPage')"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        <div class="pl-2 pr-2">Page {{ page }} of {{ pageCount }}</div>
        <button
          v-if="Number(page) < pageCount"
          class="btn btn-success btn-sm ml-1"
          @click="$emit('nextPage')"
        >
          <i class="fas fa-chevron-right ml-1"></i>
        </button>
      </div>
    </div>
  </container-query>
</template>

<script>
import { parse } from "node-html-parser";
import { ContainerQuery } from "vue-container-query";
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
    lang: {
      default: undefined,
    },
    foreign: {
      default: true,
    },
    page: {
      type: [Number, String],
    },
  },
  data() {
    return {
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
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
    allLines() {
      let html = this.html.trim();
      let lines = html
        .replace(/<(div|p|h1|h2|h3|h4|h5|h6|dd)/g, "ANNOTATORSEPARATOR!!!<$1")
        .split("ANNOTATORSEPARATOR!!!");
      lines = lines.map((line) => this.augmentHtml(line));
      lines = lines.filter((l) => l.trim() !== "");
      return lines
    },
    lines() {
      let lines = this.allLines
      if (this.page) lines = lines.slice(this.linesPerPage * (this.page - 1), this.linesPerPage * this.page);
      return lines;
    },
    pageCount() {
      return Math.ceil(this.allLines.length / this.linesPerPage)
    },
    parallellines() {
      if (this.translation)
        return this.translation.replace(/\n+/g, "\n").split("\n");
    },
  },
  mounted() {
    this.getVoices();
  },
  watch: {
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
        for (let i = 0; i < this.lines.length; i++) {
          parallellines.push("-");
        }
      }
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
          .replace(/^<a/, "<BookLink")
          .replace(/<\/a>$/, "</BookLink>");
        a.replaceWith(parse(bookLinkHtml));
      });
      html = dom.toString();
      return html;
    },
    browser() {
      return typeof document !== "undefined";
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
    update() {
      for (let sentence of this.getSentences()) {
        $(sentence).removeClass("current");
      }
      const sentence = this.getSentences()[this.current];
      $(sentence).addClass("current");
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
      this.update();
      if (this.speaking) {
        this.pause();
        this.play();
      }
    },
    next() {
      if (this.current + 1 < this.getSentences().length) {
        this.current++;
        this.update();
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
::v-deep .sentence.current {
  background-color: rgba(212, 212, 255, 0.5);
}

.speech-bar {
  position: sticky;
  top: 0;
  z-index: 1;
}

::v-deep img {
  max-width: 100%;
}

#zerotohero:not(.zerotohero-wide) {
  .speech-bar {
    top: calc(env(safe-area-inset-top, 0) + 2.7rem);
  }
}

.translation-line {
  font-size: 0.8em;
  color: #999;
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
