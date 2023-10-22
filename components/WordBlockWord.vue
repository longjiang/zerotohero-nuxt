<template>
  <span>
    <ruby
      :class="wordBlockClasses"
      v-for="(segment, index) in mappedPronunciation || [
        { type: 'kanji', surface: text, reading: phonetics },
      ]"
      :key="index"
    >
      <rt v-if="showDefinition && index === 0">{{ definition || "&nbsp;" }}</rt>
      <rt v-if="segment.type === 'kanji' && hasKanji(segment.surface)">{{
        segment.reading
      }}</rt
      >{{ segment.surface }}</ruby
    ><span
      v-if="hanAnnotation"
      class="word-block-text-byeonggi d-inline-block"
      v-html="hanAnnotation"
    /><span
      v-if="showQuickGloss && isSaved && definition"
      class="word-block-text-quick-gloss"
    >{{ definition }}</span>
  </span>
</template>

<script>
import { hasKanji } from "@/lib/utils";

export default {
  props: {
    pos: String,
    usePopup: {
      default: true,
    },
    isSaved: {
      default: false,
    },
    obscure: {
      default: false,
    },
    definition: {
      default: undefined,
    },
    text: {
      default: "",
    },
    hanAnnotation: {
      default: undefined,
    },
    phonetics: {
      default: undefined,
    },
    mappedPronunciation: {
      type: Array, //  e.g. [{ "type": "kanji", "surface": "食", "reading": "しょく" }, { "type": "non-kanji", "surface": "パン", "reading": "ぱん" }]
    },
    useZoom: {
      default: false,
    },
    animate: {
      default: false,
    },
  },
  computed: {
    wordBlockTextClasses() {
      let classes = {
        "word-block-text d-inline-block": true,
        klingon: this.$l2.code === "tlh",
        "word-block-hard": this.hard,
      };
      return classes;
    },
    wordBlockClasses() {
      let classes = {
        "use-zoom": this.useZoom,
        "word-block": true,
        "with-popup": this.usePopup,
        "with-quick-gloss": this.isSaved && this.definition,
        saved: this.isSaved,
        obscure: this.obscure,
        animate: this.animate,
      };
      if (this.pos) classes[`pos-${this.pos}`] = true;
      return classes;
    },
    showQuickGloss() {
      return !this.showDefinition && this.$l2Settings.showQuickGloss;
    },
    showDefinition() {
      return this.$l2Settings.showDefinition;
    },
  },
  methods: {
    hasKanji(...args) {
      return hasKanji(...args);
    },
  },
};
</script>

<style lang="scss">
@import "@/assets/scss/variables.scss";
// [data-hover-level=outside].saved {
//   color: white !important;
// }

.word-block,
.word-block-unknown {
  text-align: center;
  display: inline-block;
}

.zerotohero-dark {
  .word-block,
  .word-block-unknown {
    &.animate .word-block-segment {
      animation-name: shinedark;
    }
  }
}

.zerotohero-light {
  .word-block,
  .word-block-unknown {
    &.animate .word-block-segment {
      animation-name: shinelight;
    }
  }
}

.show-pinyin .word-block .word-block-hard {
  // text-decoration: underline;
  background-color: rgba(255, 226, 129, 0.137);
}

.word-block-text-byeonggi {
  color: rgba(143, 158, 172, 0.8);
  font-size: 6em;
}

.word-block-unknown {
  color: #ccc;
}

.word-block,
.word-block-unknown {
  .word-block-segment {
    display: inline-block;
  }

  &.animate .word-block-segment {
    animation-iteration-count: 1;
    animation-duration: 2s;
    animation-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1);
  }

  &.saved[data-hover-level="outside"].animate .word-block-segment {
    animation-name: shinesaved;
  }
}

.word-block.obscure {
  opacity: 0;
}

@keyframes shinesaved {
  0% {
    color: $primary-color;
    transform: scale(1);
  }

  10% {
    color: #54ff7c;
    transform: scale(1.1);
  }

  100% {
    color: $primary-color;
    transform: scale(1);
  }
}

@keyframes shinedark {
  0% {
    color: inherit;
  }

  10% {
    color: #54ff7c;
    transform: translateY(-0.1em);
  }

  100% {
    color: inherit;
  }
}

@keyframes shinelight {
  0% {
    color: inherit;
    transform: scale(1);
  }

  10% {
    color: #00d031;
    transform: scale(1.1);
  }

  100% {
    color: inherit;
    transform: scale(1);
  }
}

.word-block.with-popup {
  cursor: pointer;

  &.saved {
    font-weight: bold;
  }
}

.word-block-text-quick-gloss {
  font-size: 50%;
  opacity: 0.8;
  font-weight: normal;
}

.word-block-text-byeonggi-wrapper {
  font-size: 0.1em;

  .word-block-text {
    font-size: 10em;
  }
}

.show-quick-gloss:not(.l2-ja) {
  [dir="ltr"] .word-block.saved.with-quick-gloss {
    // text-align: left;
  }

  [dir="rtl"] .word-block.saved.with-quick-gloss {
    // text-align: right;
  }
}

.add-pinyin {
  .word-block {
    margin: 0;
    position: relative;
    text-indent: 0;

    .word-block-pinyin,
    .word-block-text-byeonggi-wrapper {
      text-indent: 0;
    }

    .word-block-pinyin {
      position: relative;
      bottom: -0.3em;
      font-family: AndikaW, Andika, Arial, sans-serif;
    }

    /* Hide by default */
    .word-block-pinyin,
    .word-block-simplified,
    .word-block-traditional,
    .word-block-definition {
      display: none;
    }
  }
}

/* Shown on demand */

.show-pinyin .word-block .word-block-pinyin,
.show-simplified .word-block .word-block-simplified,
.show-traditional .word-block .word-block-traditional,
.show-definition .word-block .word-block-definition {
  display: block;
}

.show-byeonggi .word-block .word-block-text-byeonggi {
  display: inline;
}

.show-quick-gloss .word-block .word-block-text-quick-gloss {
  display: inline;
}

.show-definition .word-block {
  position: relative;
}

/* Line style */

.show-pinyin .word-block-segment .word-block-text,
.show-definition .word-block-segment .word-block-text {
  position: relative;
}

.word-block-segment .word-block-pinyin,
.word-block-definition {
  opacity: 0.7;
  margin: 0 0.1rem -0 0.1rem;
  font-size: 0.8rem;
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: none;
  position: relative;
  // bottom: -0.25em;
}

.word-block.saved {
  .word-block-pinyin {
    opacity: 1;
    font-weight: normal;
  }
}

.show-pinyin-for-saved {
  .word-block:hover:not(.saved) {
    .word-block-pinyin {
      display: inherit;
      position: absolute;
      top: -1.25em;
      left: 50%;
      margin-left: -5em;
      width: 10em;
    }
  }

  .word-block.saved {
    margin-left: 0.1rem;
    margin-right: 0.1rem;

    .word-block-pinyin {
      display: block;
    }
  }
}
</style>
