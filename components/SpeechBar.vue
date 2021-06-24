<template>
  <div
    v-if="html"
    id="speech-container"
  >
    <div
      v-if="$hasFeature('speech') || !foreign || browser()"
      class="speech-bar mb-4 sticky bg-white pt-2 pb-2"
    >
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
    </div>
    <template
      v-for="(line, lineIndex) of html
        .trim()
        .replace(/<(div|p|h1|h2|h3|h4|h5|h6|dd)/g, 'ANNOTATORSEPARATOR!!!<$1')
        .split('ANNOTATORSEPARATOR!!!')"
    >
      <Annotate
        v-if="line.trim().length > 0"
        :key="`chapter-line-${lineIndex}`"
        :foreign="foreign"
        class="mb-4"
        tag="div"
        :buttons="true"
      >
        <div v-html="line.trim()" />
      </Annotate>
    </template>
  </div>
</template>

<script>
export default {
  props: {
    html: {
      type: String,
    },
    lang: {
      default: undefined,
    },
    foreign: {
      default: true,
    },
  },
  data() {
    return {
      current: 0,
      voice: 0,
      utterance: undefined,
      speaking: false,
      voices: [],
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
  },
  mounted() {
    this.getVoices();
  },
  methods: {
    browser() {
      return typeof document !== 'undefined'
    },
    getSentences() {
      let sentences = [];
      for (let annotate of this.$children) {
        for (let sentence of $(annotate.$el).find(".sentence")) {
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
      for (let block of $(sentence).find(".word-block, .word-block-text")) {
        if ($(block).is(".word-block-text")) {
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

<style lang="scss">
.sentence.current {
  background-color: rgba(212, 212, 255, 0.5);
}
</style>
