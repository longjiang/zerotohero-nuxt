<template>
  <span :class="wordBlockClasses">
    <template v-if="!mappedPronunciation">
      <span class="word-block-segment" :class="{ 'use-zoom': useZoom }">
        <span class="word-block-pinyin" v-if="phonetics">
          {{ phonetics }}
        </span>
        <span
          class="word-block-definition"
          v-if="showDefinition"
          v-html="definition || '...'"
        ></span>
        <span :class="wordBlockTextClasses">
          {{ text }}
        </span> </span
      ><span class="word-block-text-byeonggi-wrapper">
        <span
          v-if="hanja"
          class="word-block-text-byeonggi d-inline-block"
          v-html="hanja"
        />
        <span v-if="saved && definition" class="word-block-text-quick-gloss">
          {{ definition }}
        </span>
      </span>
    </template>
    <template v-else>
      <span
        class="word-block-segment"
        :class="{ 'use-zoom': useZoom }"
        v-for="(segment, index) in mappedPronunciation"
        :key="`word-block-segment-${segment.surface}-${index}`"
        ><span
          class="word-block-pinyin"
          v-if="segment.type === 'kanji' && phonetics"
          >{{ segment.reading }}</span
        ><span
          class="word-block-definition"
          v-if="showDefinition && index === 0"
          v-html="definition || '...'"
        ></span
        ><span :class="wordBlockTextClasses">
          {{ segment.surface }}</span
        > </span
      ><span class="word-block-text-byeonggi-wrapper">
        <span
          v-if="hanja"
          class="word-block-text-byeonggi d-inline-block"
          v-html="hanja"
        />
        <span v-if="saved && definition" class="word-block-text-quick-gloss">
          {{ definition }}
        </span>
      </span>
    </template>
  </span>
</template>

<script>
import { mapState } from "vuex";
export default {
  props: {
    pos: String,
    popup: {
      default: true,
    },
    sticky: {
      default: false, // whether or not to show each word's level color by default (without hovering)
    },
    common: {
      default: false,
    },
    seen: {
      default: false, // whether this word has already been annotated ('seen') before
    },
    saved: {
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
    hanja: {
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
        "word-block": true,
        "with-popup": this.popup,
        "with-quick-gloss": this.saved && this.definition,
        sticky: this.sticky,
        common: this.common,
        seen: this.seen,
        saved: this.saved,
        obscure: this.obscure,
      };
      if (this.pos) classes[`pos-${this.pos}`] = true;
      return classes;
    },
    showDefinition() {
      return this.$l2Settings.showDefinition;
    },
  },
};
</script>

<style lang="scss" scoped>
.zerotohero-dark {

  .word-block,
  .word-block-unknown {
    &.animate {
      animation-name: shinedark;
    }
  }
}

.zerotohero-light {

  .word-block,
  .word-block-unknown {
    &.animate {
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
  &.animate {
    animation-iteration-count: 1;
    animation-duration: 2s;
    animation-timing-function: ease-in-out;
  }

  &.saved.animate {
    animation-name: shinesaved;
  }
}

.word-block.obscure {
  opacity: 0;
}

@keyframes shinedark {
  0% {
    color: inherit;
  }

  10% {
    color: #54ff7c;
  }

  100% {
    color: inherit;
  }
}

@keyframes shinelight {
  0% {
    color: inherit;
  }

  10% {
    color: #00d031;
  }

  100% {
    color: inherit;
  }
}


.word-block.with-popup {
  cursor: pointer;

  &.saved {
    font-weight: bold;
  }
}

.word-block-text-quick-gloss {
  font-size: 0.8rem;
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

.word-block {
  text-align: center;
}

.add-pinyin {
  .word-block {
    display: inline-block;
    margin: 0;
    position: relative;
    text-indent: 0;

    .word-block-segment {
      display: inline-block;
    }

    .word-block-pinyin,
    .word-block-text-byeonggi-wrapper {
      line-height: 1;
      text-indent: 0;
    }

    .word-block-pinyin {
      position: relative;
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

.word-block-text-byeonggi,
.word-block-text-quick-gloss {
  display: none;
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

.word-block-pinyin,
.word-block-definition {
  line-height: 1;
  opacity: 0.7;
  margin: 0 0.1rem 0 0.1rem;
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: none;
}

.word-block.saved {
  .word-block-pinyin {
    opacity: 1;
    font-weight: normal;
  }
}

// Turn this off until we can have this set in options
// .pos-v,
// .pos-verb,
// .pos-Verb,
// .pos-動詞 {
//   border-bottom: 1px solid #888;
// }

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
