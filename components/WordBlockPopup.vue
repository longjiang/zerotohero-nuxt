<template>
  <div>
    <div
      class="tooltip-images"
      :key="`tooltip-images-${text}`"
      v-if="images && images.length > 0"
    >
      <img
        alt
        class="image-wall-image"
        v-for="(image, index) in images"
        :key="`web-images-${text}-${index}`"
        :src="`${imageProxy}?${image.src}`"
      />
    </div>
    <button
      class="word-block-tool-tip-close"
      @click="$nuxt.$emit('popupClosed')"
      v-close-popover
    >
      <i class="fa fa-times"></i>
    </button>
    <div v-if="loading === true">
      <Loader :sticky="true" message="Looking up the dictionary..." />
    </div>
    <div
      v-for="word in words"
      :key="`word-block-word-${word.id}`"
      :class="entryClasses"
    >
      <div v-if="word">
        <div
          v-for="(match, index) in word.matches"
          style="color: #999"
          :key="`match-${index}`"
        >
          <b>{{ match.field }} {{ match.number }}</b>
          {{ match.table !== "declension" ? match.table : "" }}
          of
        </div>
        <div
          v-if="word.morphology"
          style="color: #999"
          :key="`word-block-word-morphology-${word.id}`"
        >
          {{ word.morphology }} of
        </div>
        <div>
          <Speak
            :text="word.kana || word.head"
            :mp3="word.audio"
            :wiktionary="word.wiktionary"
            class="mr-1"
            ref="speak"
          />
          <span class="word-pronunciation">{{ pronunciation(word) }}</span>
          <Star
            :word="word"
            :text="text"
            :context="context"
            class="ml-1"
            style="font-size: 0.8rem"
          ></Star>
        </div>

        <router-link
          :to="`/${$l1.code}/${$l2.code}/dictionary/${$dictionaryName}/${word.id}`"
          class="text-success"
        >
          <b
            :data-level="word.level || 'outside'"
            style="font-size: 1.5rem"
            :class="{
              klingon: $l2.code === 'tlh',
            }"
          >
            <span v-if="$l2.code === 'de' && word.gender">
              {{ { n: "das", m: "der", f: "die" }[word.gender] }}
            </span>
            <span>{{ transform(word.accented || word.head) }}</span>
          </b>
        </router-link>
        <i class="fas fa-chevron-right text-success"></i>
        <span
          v-if="word.traditional && word.traditional !== word.simplified"
          class="ml-1"
          style="font-size: 1.2em; color: #999"
        >
          {{ word.traditional }}
        </span>
        <span
          v-if="
            ['ko', 'vi'].includes($l2.code) && word.cjk && word.cjk.canonical
          "
          class="ml-1"
          style="font-size: 1.2em; color: #999"
        >
          [{{ word.cjk.canonical }}]
        </span>
        <span
          v-if="word.level && word.level !== 'outside'"
          :data-bg-level="word.level"
          class="pl-1 pr-1 ml-1 rounded d-inline-block"
          style="font-size: 0.8em; position: relative; bottom: 0.1rem"
        >
          {{ $dictionaryName === "hsk-cedict" ? "HSK " : "" }}{{ word.level }}
        </span>
        <span
          v-if="word.newHSK"
          class="ml-1"
          :style="`position: relative; bottom: 0.2em; font-size: 0.8em; color: ${
            word.newHSK === '7-9' ? '#00716B' : 'inherit'
          }`"
        >
          <i class="fa fa-arrow-right mr-1" />
          新 HSK {{ word.newHSK }}
        </span>
        <span v-if="word.unit" style="font-size: 0.8em" class="ml-1">
          Unit {{ word.unit }}
        </span>
      </div>
      <div>
        <span
          class="word-type"
          v-if="word.type !== 'other'"
          style="color: #999"
        >
          {{ word.verbs ? abbreviate(word.verbs.aspect) : "" }}
          {{ abbreviate(word.type) }}
        </span>
        <span class="word-type" v-if="word.pos" style="color: #999">
          {{
            word.gender
              ? { m: "masculine", f: "feminine", n: "neuter" }[word.gender]
              : ""
          }}
          {{ word.pos }}
          {{
            word.heads && word.heads[0] && word.heads[0][1]
              ? word.heads[0][1]
              : ""
          }}
        </span>
        <span
          v-if="word.supplementalLang"
          class="pl-1 pr-1 ml-1 rounded d-inline-block bg-warning text-white"
          style="font-size: 0.8em; position: relative; bottom: 0.1rem"
        >
          {{ getSupplementalLang(word) }}
        </span>
        <DefinitionsList
          v-if="word.definitions"
          class="word-translation"
          :entry="word"
          :definitions="word.definitions"
          :singleColumn="true"
          :alwaysShowAsList="true"
        />
      </div>

      <Annotate
        v-if="word.counters"
        tag="span"
        class="word-counters"
        :buttons="false"
        :popup="false"
      >
        <span>
          {{
            word.counters
              .map((counter) => "一" + counter.simplified)
              .join(word.simplified + "、") + word.simplified
          }}
        </span>
      </Annotate>
      <div class="phrases mt-2" v-if="word.phrases">
        <WordList
          :words="word.phrases.slice(0, 6).filter((p) => typeof p === 'object')"
          :showSpeak="false"
        />
      </div>
    </div>
    <div
      v-if="words && words.length === 0 && loading === false"
      class="no-entry"
    >
      <span
        style="color: #999"
        v-if="$hasFeature('transliteration') && $l2.code !== 'ja'"
      >
        <span>{{ transliterate(text) }}</span>
        <Speak :text="text" class="ml-1" ref="speak" />
      </span>
      <div style="font-size: 1.5rem; font-weight: bold">
        <router-link data-level="outside" :to="{name: 'phrase', params: {term: text}}">{{ text }} <i class="fa fa-chevron-right"></i></router-link>
        <span class="copy-button">
          <i class="ml-1 fa-regular fa-copy" @click="copyClick"></i>
        </span>
      </div>
      <span style="color: #999">
        {{ $t("Sorry, no definition found.") }}
      </span>
      <Saved
        :item="phraseObj"
        store="savedPhrases"
        icon="bookmark"
        class="annotator-button focus-exclude"
        title="Save Phrase"
        ref="savePhrase"
        :saveText="$t('Save as Phrase')"
        :removeText="$t('Saved')"
      />
    </div>
    <hr class="mt-2 mb-0" />
    <TranslatorLinks v-bind="{ text }" class="mt-2" />
    <LookUpIn
      v-if="text || token"
      :term="text ? text : token.candidates[0].head"
      :sticky="false"
      class="mt-2"
    />
  </div>
</template>

<script>
import { imageProxy } from "@/lib/config";
import Klingon from "@/lib/klingon";
import pinyin2ipa from "@/lib/pinyin2ipa/lib";

export default {
  props: {
    text: String,
    words: Array,
    images: Array,
    transliterationprop: String,
    phraseObj: Object,
    loading: {
      default: false
    },
    context: {
      type: Object,
      default() {
        return {
          text: undefined,
          youtube_id: undefined,
          starttime: undefined,
        };
      },
    },
  },
  data() {
    return {
      imageProxy,
      entryClasses: { "tooltip-entry": true }, // Other classes are added upon update
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
    $dictionaryName() {
      return this.$store.state.settings.dictionaryName;
    },
  },
  mounted() {
    if (this.$l1) this.entryClasses[`l1-${this.$l1.code}`] = true;
    if (this.$l2) this.entryClasses[`l2-${this.$l2.code}`] = true;
    if (this.$l2.han) this.entryClasses["l2-zh"] = true;
  },
  methods: {
    transliterate(text) {
      return this.transliterationprop && this.transliterationprop !== text
        ? this.transliterationprop
        : "";
    },
    segment(text) {
      return text
        .replace(
          /([́ёеуюйыаоэяицкнгшщзхъфвпрлджчсмтьб])([цкнгшщзхъфвпрлджчсмтб])/gi,
          "$1·$2"
        )
        .replace(
          /·([цкнгшщзхъфвпрлджчсмтб])([цкнгшщзхъфвпрлджчсмтб])/gi,
          "$1·$2"
        )
        .replace(/·([цкнгшщзхъфвпрлджчсмтб])ь/gi, "$1ь")
        .replace(/·([цкнгшщзхъфвпрлджчсмтб])·/gi, "·$1")
        .replace(/^(.)·/, "$1")
        .replace(/·(.)$/, "$1");
    },
    transform(text, removeSpacing = false) {
      if (typeof text === "undefined") {
        text = "";
      }
      if (this.$l2.code === "ru" && text.length > 9) text = this.segment(text);
      if (this.$l2.code === "tlh" && text.trim() !== "") {
        text = Klingon.latinToConScript(text);
      }
      if (removeSpacing) {
        text = text.replace(/ /gi, "");
      }
      return text;
    },
    getSupplementalLang(word) {
      return this.$languages.getSmart(word.supplementalLang).name;
    },
    klingonIPA(text) {
      return Klingon.latinToIPA(text);
    },
    pronunciation(word) {
      let pronunciation = word.pronunciation;
      if (this.$l2.code === "vi") {
        pronunciation = pronunciation.replace(
          /\[\[(.+?)#Vietnamese\|.+?]]/g,
          "$1"
        );
      } else if (this.$l2.code === "tlh")
        pronunciation = this.klingonIPA(word.head);
      else if (word.kana && word.kana !== word.head) pronunciation = word.kana;
      else if (this.$l2.code === "fa")
        pronunciation = this.farsiRomanizations[word.head];
      else if (word.jyutping && word.pinyin)
        pronunciation = [word.jyutping, word.pinyin].join(", ");
      else if (
        !pronunciation &&
        this.$hasFeature("transliteration") &&
        !["tlh", "fa", "ja"].includes(this.$l2.code)
      )
        pronunciation = this.transliterate(word.head);
      let formattedPronunciation = pronunciation ? `[${pronunciation}]` : "";
      if (this.$l2.code === "tlh")
        formattedPronunciation = word.head + " " + formattedPronunciation;
      if (this.$l2.code === "zh")
        formattedPronunciation =
          word.pronunciation +
          " [" +
          pinyin2ipa(word.pronunciation, { toneMarker: "chaoletter" }) +
          "]";
      return formattedPronunciation;
    },
    copyClick() {
      let text = this.text;
      let tempInput = document.createElement("input");
      let popover = document.querySelector(".popover");
      tempInput.style = "position: absolute; left: -1000px; top: -1000px";
      tempInput.value = text;
      popover.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      popover.removeChild(tempInput);
      this.$toast.success("Copied!", {
        duration: 2000,
      });
    },
    abbreviate(type) {
      let abb = {
        noun: "n.",
        adjective: "adj.",
        verb: "v.",
        pronoun: "pron.",
        perfective: "perf.",
        imperfective: "imperf.",
      };
      return abb[type] || type;
    },
  },
};
</script>

<style lang="scss">

.tooltip-inner {
  .word-block-pinyin,
  .word-block-simplified,
  .word-block-traditional {
    display: block !important;
  }
}

.word-translation {
  padding-left: 1rem;
  margin-bottom: 0;
}

.word-translation-item {
  font-style: italic;
}

.word-translation-item::marker {
  margin-right: 0;
}

:deep(.definition-list-item) {
  font-size: 1rem;
}

.tooltip {
  display: block !important;
  $color: white;
  $height: 20rem;
  $width: 20rem;
  border: none;
  max-height: $height;
  max-width: $width;
  border-radius: 1rem;

  &[x-placement^="top"] {
    margin-bottom: 1rem;

    .tooltip-arrow {
      border-width: 5px 5px 0 5px;
      border-left-color: transparent !important;
      border-right-color: transparent !important;
      border-bottom-color: transparent !important;
      bottom: -5px;
      left: calc(50% - 5px);
      margin-top: 0;
      margin-bottom: 0;
    }
  }

  &[x-placement^="bottom"] {
    margin-top: 5px;

    .tooltip-arrow {
      border-width: 0 5px 5px 5px;
      border-left-color: transparent !important;
      border-right-color: transparent !important;
      border-top-color: transparent !important;
      top: -5px;
      left: calc(50% - 5px);
      margin-top: 0;
      margin-bottom: 0;
    }
  }

  &[x-placement^="right"] {
    margin-left: 5px;

    .tooltip-arrow {
      border-width: 5px 5px 5px 0;
      border-left-color: transparent !important;
      border-top-color: transparent !important;
      border-bottom-color: transparent !important;
      left: -5px;
      top: calc(50% - 5px);
      margin-left: 0;
      margin-right: 0;
    }
  }

  &[x-placement^="left"] {
    margin-right: 5px;

    .tooltip-arrow {
      border-width: 5px 0 5px 5px;
      border-top-color: transparent !important;
      border-right-color: transparent !important;
      border-bottom-color: transparent !important;
      right: -5px;
      top: calc(50% - 5px);
      margin-left: 0;
      margin-right: 0;
    }
  }

  &[aria-hidden="true"] {
    visibility: hidden;
    opacity: 0;
    transition: opacity 0.15s, visibility 0.15s;
  }

  &[aria-hidden="false"] {
    visibility: visible;
    opacity: 1;
    transition: opacity 0.15s;
  }

  .word-block-tool-tip-close {
    border-radius: 100%;
    background: #28a745;
    color: white;
    border: none;
    position: fixed;
    top: 0.5rem;
    right: 0.5rem;
    height: 1.5rem;
    width: 1.5rem;
    padding: 0;
    z-index: 10;
  }

  .tooltip-arrow {
    width: 0;
    height: 0;
    border-style: solid;
    position: absolute;
    margin: 5px;
    border-color: $color;
  }

  .tooltip-inner {
    border-radius: 1rem;
    text-align: left;
    overflow-y: auto;
    overflow-x: hidden;
    background: $color;
    color: black;
    box-shadow: 0 5px 20px rgba(black, 0.2);
    max-width: $width;
    max-height: $height;

    .popover-inner-hover-area {
      padding: 0.75rem;
      position: relative;
    }

    .tooltip-images {
      margin-bottom: 0.5rem;
      width: $width;
      overflow-x: auto;
      display: flex;
      height: 4rem;

      img {
        flex: 1;
        height: 4rem;
        width: auto;
        margin: 0 0.2rem;
      }
    }

    .tooltip-entry {
      color: #666;
    }

    .tooltip-entry + .tooltip-entry {
      margin-top: 1rem;
      border-top: 1px solid #ccc;
      padding-top: 1rem;
    }

    .word-pronunciation,
    .word-pronunciation span {
      color: #779bb5;
      font-family: AndikaW, Andika, Arial, sans-serif;
    }

    .wordlist-item {
      .toggle-saved-word {
        padding-right: 0 !important;
      }
      .wordlist-item-word {
        font-size: 1rem !important;
      }
      .btn-toggle-saved-word {
        font-size: 0.8em !important;
      }
    }

    .copy-button {
      font-size: 0.8em;
      position: relative;
      bottom: 0.1em;
      color: #999;
      cursor: pointer;
      &:hover {
        color: #28a745;
      }
    }
  }
}
</style>