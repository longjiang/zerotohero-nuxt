<template>
  <container-query :query="query" v-model="params">
    <div
      :class="{
        [`skin-${$skin}`]: true,
        'transcript-line': true,
        'transcript-line-abnormal': abnormal,
        'transcript-line-current': current,
        'transcript-line-wide': !single && params.lg,
        'transcript-line-with-translation': showParallelLine,
      }"
      ref="lines"
      :data-line-index="lineIndex"
      @click="$emit('click')"
      :style="textSize !== 1 ? `font-size: ${textSize}em` : ''"
    >
      <div v-if="!single && showSubsEditing" class="transcript-line-edit mr-3">
        <div class="transcript-line-edit-time">{{ Math.round(line.starttime * 100) / 100 }}</div>
        <b-button class="btn btn-small bg-danger text-white" @click="removeLineClick">
          <i class="fa fa-trash"></i>
        </b-button>
      </div>
      <div :class="{'transcript-line-both': true, transparent: hideWhileAnnotating && !annotated}" >
        <div
          class="transcript-line-l2-wrapper"
        >
          <div class="dot-wrapper-ltr" v-if="!single && $l2.direction !== 'rtl'">
            <div class="dot" v-if="current"></div>
          </div>
          <Annotate
            tag="div"
            ref="annotate"
            v-bind="{
              animationSpeed: speed,
              animationDuration: duration,
              sticky,
              buttons: true,
              translation: parallelLine,
              delay: single ? false : 123,
              showTranslation: false,
              showLoading: false,
              showGrammar: true,
              youtube_id: this.video.youtube_id,
              starttime: this.line.starttime,
              useZoom: true,
              breakSentences: false
            }"
            :class="{
              'transcript-line-l2': true,
              'transcript-line-l2-single': single,
              'transcript-line-l2-rtl': $l2.direction === 'rtl',
              annotated: annotated,
            }"
            v-if="!showSubsEditing"
            style="flex: 1"
            @translation="onTranslation"
            @translationLoading="translationLoading = true"
            @textChanged="lineChanged(line, ...arguments)"
            @annotated="updateAnnotated"
          >
            <span v-html="lineHtml(line).trim()" />
          </Annotate>
          <div v-else v-html="lineHtml(line)" />
          <div class="dot-wrapper-rtl" v-if="!single && $l2.direction === 'rtl'">
            <div class="dot" v-if="current"></div>
          </div>
        </div>
        <div
          :class="{
            'transcript-line-l1': true,
            'transcript-line-l1-rtl': !single && $l2.direction === 'rtl',
            'transcript-line-l1-single': single,
          }"
        >
          <beat-loader v-if="translationLoading" class="d-inline-block" color="#28a745" size="5px"></beat-loader>
          <span
            v-else-if="showParallelLine && line.line.length > 0 && (parallelLine || translation)"
            :data-line-index="lineIndex"
            v-html="translation || parallelLine"
            :contenteditable="enableTranslationEditing"
            @blur.capture="trasnlationLineBlur"
            @keydown.capture="trasnlationLineKeydown"
          ></span>
        </div>
      </div>
    </div>
  </container-query>
</template>

<script>
import { ContainerQuery } from "vue-container-query";
import BeatLoader from "vue-spinner/src/BeatLoader.vue";
import { highlightMultiple } from "@/lib/utils";

export default {
  components: {
    ContainerQuery,
    BeatLoader
  },
  props: {
    line: {
      type: Object
    },
    lineIndex: {
      type: Number
    },
    abnormal: {
      type: Boolean
    },
    current: {
      type: Boolean
    },
    currentTime: {
      type: Number
    },
    sticky: {
      type: Boolean
    },
    single: {
      type: Boolean
    },
    hsk: {
      type: String
    },
    notes: {
      type: Array
    },
    duration: {
      default: undefined
    },
    parallelLine: {
      type: String
    },
    showParallelLine: {
      default: false // The user can hide the line via settings/css, but if the transcript has no parallel line we control how the component is rendered
    },
    showSubsEditing: {
      type: Boolean
    },
    showAnimation: {
      default: true
    },
    speed: {
      default: 1
    },
    enableTranslationEditing: {
      type: Boolean
    },
    hideWhileAnnotating: {
      // Whether to hide the line before annotation is complete (for reducing flickering in single-line mode)
      type: Boolean,
      default: false
    },
    textSize: {
      default: 1
    },
    video: {
      type: Object
    },
    paused: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      annotated: false,
      lineStarted: false,
      height: undefined,
      width: undefined,
      durationPlayed: 0,
      animateOnceAnnotated: undefined,
      translationLoading: false,
      translation: undefined, // From user's clicking the translate button inside <Anntoate>
      params: {},
      query: {
        lg: {
          minWidth: 600
        }
      }
    };
  },
  mounted() {
    this.height = this.$el.clientHeight;
    this.width = this.$el.clientWidth;
    if (this.current && !this.paused) this.playAnimation();
  },
  watch: {
    current() {
      if (this.current) {
        if (!this.paused) {
          this.playAnimation();
        } else {
          this.pauseAnimation();
        }
      }
    },
    paused() {
      if (this.current) {
        if (this.paused) {
          this.pauseAnimation();
        } else {
          this.playAnimation();
        }
      }
    },
  },
  methods: {
    getSavedWords() {
      return this.$refs.annotate?.getSavedWords() || [];
    },
    onTranslation(translation) {
      this.translation = translation;
      this.translationLoading = false;
    },
    updateAnnotated(annotated) {
      this.annotated = annotated;
    },
    playAnimation() {
      if (!this.showAnimation) return
      const startFrom = Math.max(this.currentTime - this.line.starttime, 0)
      if (this.$refs["annotate"]) {
        this.$refs["annotate"].playAnimation(startFrom);
      }
    },
    pauseAnimation() {
      if (this.$refs["annotate"]) this.$refs["annotate"].pauseAnimation();
    },
    trasnlationLineKeydown(e) {
      this.$emit("trasnlationLineKeydown", e);
    },
    trasnlationLineBlur(e) {
      this.$emit("trasnlationLineBlur", e);
    },
    removeLineClick() {
      this.$emit("removeLineClick");
    },
    lineChanged(line, newText) {
      line.line = newText;
    },
    decodeHtmlEntities(text) {
      let HTMLEntities = require("html-entities");
      const allEntities = new HTMLEntities.AllHtmlEntities();
      return allEntities.decode(text);
    },
    lineHtml(line) {
      let html = line.line;
      html = this.decodeHtmlEntities(html);
      if (this.notes) {
        html = html.replace(/\[(\d+)\]/g, (_, num) => {
          let note;
          if (this.notes) {
            note = this.notes.find(note => note.id === Number(num));
          }
          return `<PopupNote :number="${num}" content="${
            note ? note.note : ""
          }"></PopupNote>`;
        });
      }
      html = html.replace(/\n/g, " ");
      return html;
    },
    highlightMultiple() {
      return highlightMultiple(...arguments);
    }
  }
};
</script>

<style lang="scss" scoped>


.skin-dark {
  .dot,
  .dot:before,
  .dot:after {
    background: #54ff7c;
  }
}
.skin-light {
  .dot,
  .dot:before,
  .dot:after {
    background: #0cac31;
  }
}

.dot-wrapper-ltr {
  width: 1.5rem;
  min-width: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.dot-wrapper-rtl {
  width: 1.5rem;
  min-width: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.synced-transcript-single-line {
  .transcript-line-both {
    text-align: center;
    padding: 0 1rem;
    margin: 0 auto;
    .transcript-line-l2 {
      padding-left: 1.5rem;
      line-height: 1.25;
      :deep(.annotated) {
        text-align: center !important;
      }
    }
    .transcript-line-l2-rtl {
      padding-left: 0;
      padding-right: 1.5rem;
    }
    .transcript-line-l1 {
      padding: 0;
    }
  }
}

.show-translation {
  .transcript-line-wide.transcript-line-with-translation {
    .transcript-line-both {
      display: flex;
      align-items: flex-start;
      .transcript-line-l2-wrapper {
        width: 61.8%;
      }
      .transcript-line-l1 {
        width: 38.2%;
      }
    }
  }
}

.transcript.single-line .transcript-line:not(.transcript-line-current) {
  display: none;
}

.transcript-line-l2-wrapper {
  display: flex;
}

.transcript-line-both {
  flex: 1;
}

.transcript-line {
  cursor: pointer;
  position: relative;
  font-size: 1.2rem;
  padding: 0.5rem 0;
  display: flex;
  &.transcript-line-abnormal {
    background-color: lightpink;
  }
  .transcript-line-l2 {
    transition: 0.2s linear all;
  }
  .transcript-line-l1 {
    opacity: 0.7;
    font-size: 66.7%;
    display: none;
    line-height: 1.5;
    margin-top: 0.1rem;
    padding-left: 1.5rem;
    &.transcript-line-l1-rtl {
      padding-right: 1.5rem;
    }
  }
}

.synced-transcript-single-line {
  .transcript-line {
    padding: 0;
    .transcript-line-current {
      box-shadow: none;
    }
  }
}

.show-translation {
  .transcript-line-l1 {
    display: inherit;
  }
}

/* https://codepen.io/availchet/pen/rNMRvZB */
.dot {
  /* Vector */
  height: 0.66rem;
  width: 0.66rem;
  border-radius: 50%;
  opacity: 0.5;
}



.dot:after {
  content: "";
  position: absolute;
  height: 0.66rem;
  width: 0.66rem;
  border-radius: 50%;
  display: block;
  animation: pulse 2s ease 0s infinite;
}

.dot:before {
  content: "";
  position: absolute;
  height: 0.66rem;
  width: 0.66rem;
  border-radius: 50%;
  display: block;
  animation: pulse2 2s ease 0s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  80% {
    opacity: 0;
    transform: scale(2.5);
  }
  100% {
    opacity: 0;
    transform: scale(3);
  }
}

@keyframes pulse2 {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  30% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(2.5);
  }
}

.transcript-line-edit-time {
  font-size: 0.5em;
  color: #ccc
}
</style>