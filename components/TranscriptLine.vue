<template>
  <div
    :class="{
      'transcript-line': true,
      'transcript-line-abnormal': abnormal,
      'transcript-line-matched': matched,
      'pl-4': !single && $l2.direction !== 'rtl',
      'pr-4': !single && $l2.direction === 'rtl',
    }"
    style="display: flex"
    ref="lines"
    :data-line-index="lineIndex"
    @click="$emit('click')"
  >
    <div v-if="!single && showSubsEditing" class="mr-3">
      <div style="font-size: 0.7em; color: #ccc">
        {{ Math.round(line.starttime * 100) / 100 }}
      </div>
      <b-button
        class="btn btn-small bg-danger text-white"
        @click="removeLineClick"
      >
        <i class="fa fa-trash"></i>
      </b-button>
    </div>
    <div style="flex: 1">
      <Annotate
        tag="div"
        :sticky="sticky"
        :class="{
          'transcript-line-chinese': true,
          'text-center': single,
          'pr-3': single && $l2.direction === 'rtl',
          'pl-3': single && $l2.direction !== 'rtl',
        }"
        :buttons="true"
        v-if="!showSubsEditing"
        @textChanged="lineChanged(line, ...arguments)"
      >
        <span v-html="lineHtml(line)" />
      </Annotate>
      <div v-else v-html="lineHtml(line)" />
      <div
        v-if="parallelLine"
        :class="{
          'transcript-line-l1': true,
          'pl-3': !single && $l2.direction === 'ltr',
          'pr-3': !single && $l2.direction === 'rtl',
          'text-right':
            $l2.scripts &&
            $l2.scripts.length > 0 &&
            $l2.scripts[0].direction === 'rtl',
          'text-center': single,
        }"
        v-html="parallelLine"
        :contenteditable="enableTranslationEditing"
        :data-line-index="lineIndex"
        @blur.capture="trasnlationLineBlur"
        @keydown.capture="trasnlationLineKeydown"
      ></div>
    </div>
  </div>
</template>

<script>
import SmartQuotes from "smartquotes";
import Helper from "@/lib/helper";

export default {
  props: {
    line: {
      type: Object,
    },
    lineIndex: {
      type: Number,
    },
    abnormal: {
      type: Boolean,
    },
    matched: {
      type: Boolean,
    },
    showSubsEditing: {
      type: Boolean,
    },
    sticky: {
      type: Boolean,
    },
    single: {
      type: Boolean,
    },
    highlight: {
      type: Array,
    },
    hsk: {
      type: String,
    },
    notes: {
      type: Array,
    },
    parallelLine: {
      type: String,
    },
    enableTranslationEditing: {
      type: Boolean,
    },
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
  methods: {
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
    smartquotes(text) {
      return SmartQuotes.string(text);
    },
    lineHtml(line) {
      let html = line.line;
      if (!this.$l2.code === "tlh") html = this.smartquotes(html);
      if (this.highlight)
        html = this.highlightMultiple(
          html,
          this.highlight,
          this.hsk || "outside"
        );
      if (this.notes) {
        html = html.replace(/\[(\d+)\]/g, (_, num) => {
          let note;
          if (this.notes) {
            note = this.notes.find((note) => note.id === Number(num));
          }
          return `<PopupNote :number="${num}" content="${
            note ? note.note : ""
          }"></PopupNote>`;
        });
      }
      return html;
    },
    highlightMultiple() {
      return Helper.highlightMultiple(...arguments);
    },
  },
};
</script>

<style lang="scss" scoped>
.transcript.single-line .transcript-line:not(.transcript-line-current) {
  display: none;
}

.transcript-line {
  cursor: pointer;
  position: relative;
  font-size: 1.2rem;
  padding: 0.5rem;
  &.transcript-line-current {
    box-shadow: 0 0 15px 2px #fd511299;
    border-radius: 0.25rem;
  }
  &.transcript-line-abnormal {
    background-color: lightpink;
  }
  &.transcript-line-matched {
    color: #616161;
    font-weight: bold;
  }
  .transcript-line-l1 {
    color: rgb(173, 159, 153);
    font-size: 0.75em;
    display: none;
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
</style>