<template>
  <div class="word-block-popup skin-light">
    <div class="tooltip-images" :key="`tooltip-images-${text}`">
      <img
        alt
        class="image-wall-image"
        v-for="(image, index) in images"
        :key="`web-images-${text}-${index}`"
        :src="`${IMAGE_PROXY}?${image.src}`"
      />
    </div>
    <div
      v-if="
        token &&
        token.lemmas &&
        token.lemmas.length > 0 &&
        token.lemmas[0].lemma !== text
      "
      class="word-block-lemma"
    >
      <b>{{ $t("Lemmatized:") }}</b> {{ text }} →
      {{ token.lemmas.map((l) => l.lemma).join(", ") }}
      <template v-if="token.pos">({{ token.pos.toLowerCase() }})</template>
    </div>
    
    <div v-if="!loading && !preciseMatchFound" class="no-entry">
      <span v-if="$hasFeature('transliteration')">
        <Speak :text="text" class="mr-1" ref="speak" />
        <span class="word-pronunciation"
          >[{{ transliterationprop || (token && token.pronunciation) || tr(text) }}]</span
        >
      </span>
      <div>
        <router-link
          data-level="outside"
          :to="{ name: 'l1-l2-phrase-search-term', params: { term: text } }"
          style="font-size: 1.5rem; font-weight: bold"
          :lang="$l2.code"
          >{{ text }} <i class="fa fa-chevron-right"></i
        ></router-link>
        <span class="copy-button">
          <i class="ml-1 fa-regular fa-copy" @click="onCopyClick(text)"></i>
        </span>
        <Saved
          :item="phraseObj"
          store="savedPhrases"
          icon="bookmark"
          class="d-inline-block annotator-button focus-exclude ml-1"
          title="Save Phrase"
          ref="savePhrase"
          :saveText="$t('Save as Phrase')"
          :removeText="$t('Saved')"
          style="font-size: 0.8em; text-transform: uppercase"
        />
      </div>
      <div v-if="translation">
        {{ translation }}
        <small class="text-muted"> ({{ $t("machine translated") }}) </small>
      </div>
    </div>

    <div class="my-3">
      <b-button v-if="!showChatGPT" @click="showChatGPT = true" size="sm" variant="outline-secondary" class="w-100">
        <i class="fa fa-comment"></i>
        {{ $t('Let ChatGPT Explain') }}
      </b-button>
      <ChatGPT
        v-if="showChatGPT"
        :maxTokens="30"
        :showActions="false"
        :showPrompt="false"
        class="mt-4"
        :initialMessages="[chatGPTPrompt]"
      />
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
            :lang="$l2.code"
            :class="{
              klingon: $l2.code === 'tlh',
            }"
          >
            <span style="font-size: 1.5rem">
              <template v-if="$l2.code === 'de' && word.gender">
                {{ { n: "das", m: "der", f: "die" }[word.gender] }}
              </template>
              {{ transform(word.accented || word.head) }}
            </span>
            <small><i class="fas fa-chevron-right"></i></small>
          </b>
        </router-link>

        <span class="copy-button">
          <i
            class="ml-1 fa-regular fa-copy"
            @click="onCopyClick(word.head)"
          ></i>
        </span>
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
          {{
            levels && levels[word.level] ? levels[word.level].name : word.level
          }}
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
      <Frequency v-if="word.frequency" :entry="word" :showText="false" class="mb-1" />
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
          :translated="$store.state.settings.useMachineTranslatedDictionary"
          :singleColumn="true"
          :alwaysShowAsList="true"
        />
      </div>

      <TokenizedText
        v-if="word.counters"
        :text="word.counters
              .map((counter) => '一' + counter.simplified)
              .join(word.simplified + '、') + word.simplified"
        tag="span"
        class="word-counters"
        :buttons="false"
        :popup="false"
      />
      <div class="phrases mt-2" v-if="word.phrases">
        <WordList
          :words="word.phrases.slice(0, 6).filter((p) => typeof p === 'object')"
          :showSpeak="false"
        />
      </div>
      <div class="mt-2 mb-2" />
    </div>
    <div v-if="loading === true">
      <Loader :sticky="true" message="Looking up the dictionary..." />
    </div>
    <!-- <TranslatorLinks v-bind="{ text }" class="mt-2 small" /> -->
    <LookUpIn
      v-if="text || (token && token.candidates && token.candidates[0])"
      :term="text ? text : token.candidates[0].head"
      :sticky="false"
      class="mt-2 small"
    />
  </div>
</template>

<script>
import { transliterate as tr } from "transliteration";
import { IMAGE_PROXY } from "../lib/config";
import { timeout, LANGS_WITH_AZURE_TRANSLATE, languageLevels, breakSentences, highlight, convertPinyinToIPA } from "../lib/utils";
import WordPhotos from "../lib/word-photos";
import Klingon from "../lib/klingon";

export default {
  props: {
    text: String,
    words: Array,
    token: Object,
    transliterationprop: String,
    phraseObj: Object,
    loading: {
      default: false,
    },
    loadingImages: {
      default: false,
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
      translation: undefined,
      immediateContextTranslation: undefined,
      IMAGE_PROXY,
      entryClasses: { "tooltip-entry": true }, // Other classes are added upon update
      levels: undefined,
      showChatGPT: false,
      images: [],
    };
  },
  computed: {
    /**
     * The `context` attribute can have many sentences. This find the sentence (the immediate context) that contains the word.
     */
    immediateContext() {
      if (!this.context?.text) return undefined;
      let sentences = breakSentences(this.context.text);
      let sentencesWithText = sentences.filter((s) => s.includes(this.text));
      return sentencesWithText.length ? sentencesWithText[0] : this.context.text;
    },
    preciseMatchFound() {
      let tokenCandidatesFound = this.token && this.token.candidates && this.token.candidates.length > 0;
      if (tokenCandidatesFound) return true;
      let matchFoundInWords = this.words.find(
        (w) =>
          w.head.toLowerCase() === this.text.toLowerCase() ||
          this.token?.lemmas
            ?.map((l) => l.lemma.toLowerCase())
            .includes(w.head.toLowerCase())
      );
      if (matchFoundInWords) return true;
      return false;
    },
    chatGPTPrompt() {
      const basePrompt = this.$t('Succinctly explain using {l1}, what the {l2} ({code}) word ‘{word}’ means in the phrase ‘{text}’.', { text: this.context.text, word: this.text, l2: this.$t(this.$l2.name), l1: this.$t(this.$l1.name), code: this.$l2.code})
      const inflectionPrompt = this.$t('Give its lemma, inflection, and morphology.')
      // Languages that don't inflect dont' need the inflection prompt
      const inflectionNotNeeded = ['zh', 'vi', 'th', 'lo', 'km']
      return inflectionNotNeeded.includes(this.$l2.code) ? basePrompt : `${basePrompt} ${inflectionPrompt}`
    }
  },
  async mounted() {
    if (this.$l1) this.entryClasses[`l1-${this.$l1.code}`] = true;
    if (this.$l2) this.entryClasses[`l2-${this.$l2.code}`] = true;
    if (this.$l2.han) this.entryClasses["l2-zh"] = true;
    if (this.$l2) this.levels = languageLevels(this.$l2);
    this.loadImages();
    if (!this.preciseMatchFound) {
      await timeout(1000);
      if (!this.preciseMatchFound && LANGS_WITH_AZURE_TRANSLATE.includes(this.$l2.code)) this.translate(this.text);
    }
  },
  methods: {
    tr,
    highlight,
    async loadImages() {
      if (this.images.length === 0) {
        let images = (
          await WordPhotos.getGoogleImages({
            term: this.token ? this.token.text : this.text,
            lang: this.$l2.code,
          })
        ).slice(0, 5);
        this.images = images;
      }
      this.loadingImages = false;
      return this.images // to pass to popup as a promise
    },
    async translate(text) {
      let translator = this.$languages.getTranslator(this.$l1, this.$l2) || [];
      this.translation = await translator.translateWithBing({
        text,
        l1Code: this.$l1.code,
        l2Code: this.$l2.code,
      });
      this.$emit("translation", this.translation);
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
      const supplementalLang = this.$languages.getSmart(word.supplementalLang);
      return supplementalLang?.name || word.supplementalLang;
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
      else if (word.jyutping && word.pinyin)
        pronunciation = [word.jyutping, word.pinyin].join(", ");
      else if (
        !pronunciation &&
        this.$hasFeature("transliteration") &&
        !["tlh", "fa", "ja"].includes(this.$l2.code)
      ) {
        pronunciation = tr(word.head);
      }

      let formattedPronunciation = pronunciation ? `[${pronunciation}]` : "";
      if (this.$l2.code === "tlh")
        formattedPronunciation = word.head + " " + formattedPronunciation;
      if (this.$l2.code === "zh")
        formattedPronunciation =
          word.pronunciation +
          " [" +
          convertPinyinToIPA(word.pronunciation) +
          "]";
      return formattedPronunciation;
    },
    onCopyClick(text) {
      let tempInput = document.createElement("input");
      let popover = document.querySelector(".word-block-popup");
      tempInput.style = "position: absolute; left: -1000px; top: -1000px";
      tempInput.value = text;
      popover.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      popover.removeChild(tempInput);
      this.$toast.success(this.$t("Copied!"), {
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
@import "../assets/scss/variables.scss";

.word-block-popup {
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

.word-block-popup {
  text-align: left;
  overflow-y: auto;

  .popover-inner-hover-area {
    padding: 0.75rem;
    position: relative;
  }

  .tooltip-images {
    margin-bottom: 0.5rem;
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
      color: $primary-color;
    }
  }
}
</style>
