<template>
  <l-marker
    :lat-lng="[language.lat, language.long]"
    @click="handleClick"
  >
    <l-icon>
      <div
        :class="{
          'language-marker': true,
          'language-marker-current': language === currentLang,
          'language-marker-current-child': isDescendant(language, currentLang),
        }"
      >
        <div
          :class="`language-marker-size language-marker-size-family-${language.glottologFamilyId}`"
          :style="`width: ${diameter}px; height: ${diameter}px; left: calc(50% - ${diameter}px / 2); top: calc(50% - ${diameter}px / 2);`"
        ></div>
        <LanguageList
          v-if="!showPhrases"
          variant="icon"
          skin="dark"
          class="language-marker-language-list"
          :langs="[language]"
          :singleColumn="true"
          :showFeatures="false"
          :l1="l1"
        />
        <span class="word-count" v-if="language.wiktionary">{{ $tb('{num} word(s)', {num: formatK(language.wiktionary || 0, 1, $browserLanguage) }) }}</span>
        <div
          v-if="showPhrases"
          class="text-center language-marker-phrases"
        >
          <div
            class="language-marker-phrases-phrase"
            :direction="language.direction === 'rtl' ? 'rtl' : 'ltr'"
          >
            <span
              v-for="(phrase, index) in filteredPhrases.slice(0, maxPhrases)"
              :key="`you-in-other-langs-${index}`"
              class="d-inline-block link-unstyled mr-1 ml-1"
            >
              <span class="similar-phrase-l2">
                {{ phrase.phrase }}
                <span v-if="index < Math.min(filteredPhrases.length - 1, maxPhrases - 1)">,</span>
              </span>
            </span>
            <span v-if="filteredPhrases.length > maxPhrases">...</span>
          </div>
          <span class="language-marker-phrases-language">
            {{ $tb(language.name) }}
          </span>
        </div>
      </div>
    </l-icon>
  </l-marker>
</template>

<script>
import { formatK } from "@/lib/utils";

export default {
  name: 'LanguageMapMarker',
  components: {
    "l-marker": async () => {
      if (process.client) {
        let { LMarker } = await import("vue2-leaflet");
        return LMarker;
      }
    },
    "l-icon": async () => {
      if (process.client) {
        let { LIcon } = await import("vue2-leaflet");
        return LIcon;
      }
    },
  },
  props: {
    language: {
      type: Object,
      required: true
    },
    currentLang: {
      type: Object,
      default: null
    },
    l1: {
      type: String,
      default: 'en'
    },
    showPhrases: {
      type: Boolean,
      default: false
    },
    phrases: {
      type: Array,
      default: () => []
    },
    diameter: {
      type: Number,
      required: true
    }
  },
  computed: {
    filteredPhrases() {
      return this.uniqueByValue(
        this.phrases.filter((phrase) => phrase.l2 === this.language),
        'phrase'
      );
    },
    maxPhrases() {
      return Math.max(Math.ceil(Math.log(this.language.speakers) / 9), 1);
    }
  },
  methods: {
    formatK,
    isDescendant(lang1, lang2) {
      // Implement isDescendant logic here or emit to parent component
      this.$emit('is-descendant', lang1, lang2);
    },
    handleClick() {
      this.$emit('marker-click', this.language);
    },
    uniqueByValue(array, key) {
      return Array.from(new Set(array.map(item => item[key]))).map(value => {
        return array.find(item => item[key] === value);
      });
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../assets/scss/variables.scss";

.language-marker {
  width: 10rem;
  margin-left: -5rem;
  text-shadow: 0 1px 10px rgba(0, 0, 0, 1);
  font-size: 1.2em;
  line-height: 1;
  padding: 0.3rem 0.6rem;
  border-radius: 0.3rem;
  margin-top: -100%;
  text-align: center;
  position: relative;

  .language-marker-language-list {
    text-transform: uppercase;
    font-weight: bold;
  }

  .language-marker-phrases {
    .language-marker-phrases-language {
      color: #ddd;
      display: inline-block;
    }
    .language-marker-phrases-phrase {
      color: white;
      font-size: 1.2em;
      font-weight: bold;
      font-style: italic;
    }
  }

  .language-marker-size {
    background-color: #000000;
    opacity: 0.7;
    position: absolute;
    z-index: -1;
    border-radius: 100%;
    pointer-events: none;

    &.language-marker-size-family-atla1278 { background-color: #fd4f1c; }
    &.language-marker-size-family-aust1307 { background-color: #6a3669; }
    &.language-marker-size-family-indo1319 { background-color: #1b3e76; }
    &.language-marker-size-family-sino1245 { background-color: #bb1718; }
    &.language-marker-size-family-afro1255 { background-color: #f8b51e; }
    &.language-marker-size-family-nucl1709 { background-color: #0076ba; }
    &.language-marker-size-family-turk1311 { background-color: #005f58; }
    &.language-marker-size-family-drav1251 { background-color: $primary-color; }
    &.language-marker-size-family-aust1305 { background-color: #5b0516; }
    &.language-marker-size-family-taik1256 { background-color: #b1c751; }
  }

  :deep(.language-list-item) {
    a {
      pointer-events: none;
    }
  }

  &.language-marker-current,
  &.language-marker-current-child {
    .language-marker-size {
      background-color: #fd4f1c88;
    }
    :deep(.language-list-item) {
      a {
        color: white;
      }
      .feature-icon {
        color: white;
      }
    }
  }
}

.word-count {
  font-size: 0.8em;
  opacity: 0.5;
}
</style>