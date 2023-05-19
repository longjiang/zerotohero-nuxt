<template>
  <span :class="wordBlockClasses">
    <template v-if="!mappedPronunciation">
      <span class="word-block-segment" :class="{ 'use-zoom': useZoom }">
        <span
          class="word-block-definition"
          v-if="showDefinition"
          v-html="definition || '&nbsp;'"
        ></span>
        <span class="word-block-pinyin" v-if="phonetics">
          {{ phonetics }}
        </span>
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
          class="word-block-definition"
          v-if="showDefinition"
          v-html="definition || '&nbsp;'"
        ></span>
      <span
        class="word-block-segment"
        :class="{ 'use-zoom': useZoom }"
        v-for="(segment, index) in mappedPronunciation"
        :key="`word-block-segment-${segment.surface}-${index}`"
        ><span
          class="word-block-pinyin"
          v-if="phonetics"
          :class="{ transparent: segment.type !== 'kanji' || !hasKanji(segment.surface) }"
          >{{ segment.reading || "&nbsp;" }}</span
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
import { hasKanji } from '@/lib/utils'

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
  methods: {
    hasKanji(...args) {
      return hasKanji(...args);
    }
  }
};
</script>

<style lang="scss" scoped>
.word-block,
.word-block-unknown {
  text-align: center;
  display: inline-block;
}

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
    animation-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1.0);
  }

  &.saved.animate {
    animation-name: shinedark;
  }
}

.word-block.obscure {
  opacity: 0;
}

@keyframes shinedark {
  0% {
    color: inherit;
    transform: scale(1);
  }

  10% {
    color: #54ff7c;
    transform: scale(1.1);
  }

  100% {
    color: inherit;
    transform: scale(1);
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


.add-pinyin {
  .word-block {
    margin: 0;
    position: relative;
    text-indent: 0;

    .word-block-segment {
      display: inline-block;
    }

    .word-block-pinyin,
    .word-block-text-byeonggi-wrapper {
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

.show-pinyin .word-block-segment  .word-block-text,
.show-definition .word-block-segment .word-block-text {
  position: relative;
  top: -0.1em;
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
