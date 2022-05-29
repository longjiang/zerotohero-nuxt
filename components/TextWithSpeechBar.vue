<template>
  <container-query :query="query" v-model="params">
    <div v-if="html" id="speech-container">
      <div
        v-if="$hasFeature('speech') || !foreign || browser()"
        class="speech-bar mb-4 bg-white pt-2 pb-2"
      >
        <client-only>
          <b-button-group class="d-flex">
            <b-button @click="previous()">
              <i class="fas fa-chevron-left"></i>
            </b-button>
            <b-button v-if="!speaking" @click="play()">
              <i class="fas fa-play"></i>
            </b-button>
            <b-button v-if="speaking" @click="pause()">
              <i class="fas fa-pause"></i>
            </b-button>
            <b-button @click="next()">
              <i class="fas fa-chevron-right"></i>
            </b-button>
            <b-dropdown right text="Switch Voice" style="flex: 1">
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
      >
        <div
          class="line w-100 mb-4"
          v-for="(line, lineIndex) of lines"
          :key="`chapter-line-${lineIndex}`"
        >
          <Annotate
            :foreign="foreign"
            class="annotated-line"
            tag="div"
            :buttons="true"
          >
            <div v-html="line.trim()" />
          </Annotate>
          <div v-if="translation" class="translation-line">
            {{ translation.split("\n")[lineIndex] }}
          </div>
        </div>
      </div>
    </div>
  </container-query>
</template>

<script>
import { parse } from "node-html-parser";
import { ContainerQuery } from "vue-container-query";

export default {
  components: {
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
      utterance: undefined,
      speaking: false,
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
    lines() {
      let html = this.html.trim();
      let lines = html
        .replace(/<(div|p|h1|h2|h3|h4|h5|h6|dd)/g, "ANNOTATORSEPARATOR!!!<$1")
        .split("ANNOTATORSEPARATOR!!!");
      lines = lines.map((line) => this.augmentHtml(line));
      lines = lines.filter((l) => l.trim() !== "");
      if (this.page) lines = lines.slice(10 * (this.page - 1), 10 * this.page);
      return lines;
    },
  },
  mounted() {
    this.getVoices();
  },
  methods: {
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
        for (let sentence of $(annotate.$el).find(
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
      let text = "";
      for (let block of $(sentence).find(
        ".word-block, .word-block-text, .word-block-unknown"
      )) {
        if (
          $(block).is(".word-block-text") ||
          $(block).is(".word-block-unknown")
        ) {
          text += $(block).text();
          if (!["zh", "ja"].includes(this.$l2.code)) {
            text += " ";
          }
        } else {
          text += $(block).find(".word-block-simplified").text();
        }
      }
      return text || $(sentence).text();
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
      console.log(text);
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
      width: 60%;
    }
    .translation-line {
      width: 40%;
      margin-left: 1rem;
    }
  }
}
</style>
