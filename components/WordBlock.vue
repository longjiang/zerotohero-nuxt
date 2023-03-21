<template>
  <v-popover
    :open="popup && open"
    :open-group="`id${_uid}`"
    placement="top"
    ref="popover"
  >
    <span
      :class="{
        'word-block': true,
        'with-popup': popup,
        'with-quick-gloss': quickGloss,
        sticky,
        common,
        seen,
        saved: savedWord,
        transparent: savedWord && quizeMode
      }"
      v-bind="attributes"
      v-on="popup ? { click: wordBlockClick } : {}"
      @mouseenter="wordBlockMouseEnter"
      @mouseleave="wordBlockMouseLeave"
      v-observe-visibility="visibilityChanged"
    >
      <template
        v-if="token && token.candidates && token.candidates.length > 0"
      ></template>
      <template>
        <span
          class="word-block-definition"
          v-if="
            l2SettingsOfL2.showDefinition &&
            words[0] &&
            words[0].definitions &&
            words[0].definitions[0]
          "
          v-html="words[0].definitions[0]"
        ></span>
        <span
          class="word-block-pinyin"
          v-if="l2SettingsOfL2.showPinyin && phonetics && transliteration"
        >
          {{ savedTransliteration || transliteration }}
        </span>
        <span class="word-block-text-byeonggi-wrapper">
          <span
            :class="`word-block-text d-inline-block ${
              $l2.code === 'tlh' ? 'klingon' : ''
            } ${hard ? 'word-block-hard' : ''}  ${pos ? 'pos-' + pos : ''}`"
          >
            <template v-if="$l2.han && words[0]">
              {{
                l2SettingsOfL2.useTraditional
                  ? words[0].traditional
                  : words[0].simplified
              }}
            </template>
            <template v-else>{{ transform(text, false) }}</template>
          </span>
          <span
            v-if="l2SettingsOfL2.showByeonggi && hanja"
            class="word-block-text-byeonggi d-inline-block"
            v-html="hanja"
          />
          <span v-if="quickGloss" class="word-block-text-quick-gloss">
            {{ quickGloss }}
          </span>
        </span>
      </template>
    </span>

    <template slot="popover">
      <div
        @mouseenter="tooltipMouseEnter"
        @mouseleave="tooltipMouseLeave"
        v-if="open"
        class="popover-inner-hover-area"
      >
        <div
          class="tooltip-images"
          :key="`tooltip-images-${text}`"
          v-if="loadingImages"
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
          :class="classes"
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
                ['ko', 'vi'].includes($l2.code) &&
                word.cjk &&
                word.cjk.canonical
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
              {{ $dictionaryName === "hsk-cedict" ? "HSK " : ""
              }}{{ word.level }}
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
              {{ $languages.getSmart(word.supplementalLang).name }}
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
              :words="
                word.phrases.slice(0, 6).filter((p) => typeof p === 'object')
              "
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
            <span data-level="outside">{{ text }}</span>
            <span class="copy-button">
              <i class="ml-1 fa-regular fa-copy" @click="copyClick"></i>
            </span>
          </div>
          <span style="color: #999">
            {{ $t("Sorry, no definition found.") }}
          </span>
          <Saved
            :item="phraseItem(text)"
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
  </v-popover>
</template>

<script>
import {
  timeout,
  unique,
  uniqueByValue,
  isMobile,
  ucFirst,
  speak,
} from "@/lib/helper";
import { imageProxy } from "@/lib/config";
import WordPhotos from "@/lib/word-photos";
import Klingon from "@/lib/klingon";
import { mapState } from "vuex";
import Vue from "vue";
import pinyin2ipa from '@/lib/pinyin2ipa/lib'

export default {
  props: {
    token: {
      type: Object,
    },
    explore: {
      default: false,
    },
    phonetics: {
      default: true,
    },
    sticky: {
      default: false, // whether or not to show each word's level color by default (without hovering)
    },
    seen: {
      default: false, // whether this word has already been annotated ('seen') before
    },
    popup: {
      default: true,
    },
    transliterationprop: {
      type: String,
    },
    quizeMode: {
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
      open: false,
      showPhrase: {},
      loading: false,
      loaded: false,
      text: this.$slots.default ? this.$slots.default[0].text : undefined,
      images: [],
      words: [],
      savedWord: undefined,
      classes: {
        "tooltip-entry": true,
      },
      checkSaved: true,
      wordblockHover: false,
      tooltipHover: false,
      highlightHardWords: true,
      transliteration: undefined,
      farsiRomanizations: {},
      lastLookupWasQuick: false,
      loadingImages: false,
      t: 0,
      imageProxy,
    };
  },
  computed: {
    ...mapState("settings", ["l2Settings"]),
    ...mapState("savedWords", ["savedWords"]),
    l2SettingsOfL2() {
      let l2SettingsOfL2 = {};
      if (this.l2Settings && this.l2Settings[this.$l2.code])
        l2SettingsOfL2 = this.l2Settings[this.$l2.code];
      return l2SettingsOfL2;
    },
    quickGloss() {
      let quickGloss = this.savedWord?.definitions?.[0]
        ?.replace(/\s*\(.*\)/, "")
        ?.split(/[,;]\s*/)[0];
      if (quickGloss && quickGloss.length < 20) return quickGloss;
    },
    savedTransliteration() {
      if (this.savedWord) {
        return (
          this.savedWord.jyutping ||
          this.savedWord.pinyin ||
          this.savedWord.kana ||
          (this.savedWord.pronunciation || "").split(", ")[0]
        );
      }
    },
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
    $dictionary() {
      return this.$getDictionary();
    },
    $dictionaryName() {
      return this.$store.state.settings.dictionaryName;
    },
    $hanzi() {
      return this.$getHanzi();
    },
    common() {
      return (
        this.words &&
        this.words.length > 0 &&
        this.words[0].weight &&
        this.words[0].weight > 750
      );
    },
    pos() {
      let pos;
      if (this.token && this.token.pos) {
        pos = this.token.pos.replace(/\s/g, "-");
      }
      if (!pos && this.words && this.words[0]) {
        pos = this.words[0].pos;
      }
      if (pos) return pos.replace(/\s/g, "-");
    },
    hanja() {
      if (["ko", "vi"].includes(this.$l2.code)) {
        let hanja = "";
        if (this.saved) hanja = this.saved.firstWord?.hanja;
        else if (
          this.token &&
          this.token.candidates &&
          this.token.candidates[0]
        ) {
          let head = this.token.candidates[0].head;
          let bannedEndings = "이히하고가기는은도의로";
          let bannedWords = ["지난", "진자", "가야", "주시", "거야", "위해"];
          if (
            !bannedWords.includes(head) &&
            !bannedEndings.includes(head.charAt(head.length - 1))
          ) {
            let hanjas = this.token.candidates.map((c) => c.hanja);
            if (this.$l2.code !== "vi") hanjas = unique(hanjas || []); // Vietnamese Han Tu is wiktionary CSV file has incorrect homophones
            if (hanjas.length === 1 && hanjas[0] && !hanjas[0].includes(",")) {
              hanja = hanjas[0];
            } else if (this.$l2.code === "vi") {
              if (hanjas[0] && hanjas[0].length > 1) {
                hanja = hanjas[0];
              }
            }
          }
        }
        return hanja ? hanja.split(/[,\-]/)[0] : "";
      }
    },
    bestCandidate() {
      if (this.token && this.token.candidates && this.token.candidates[0]) {
        let saved = this.token.candidates.find((c) => c.saved);
        if (saved) {
          return saved;
        } else return this.token.candidates[0];
      }
    },
    attributes() {
      let attributes = {};
      if (this.words && this.words.length > 0) {
        if (this.popup) {
          attributes["data-hover-level"] = "outside";
        }
        if (this.words[0].rank) attributes["data-rank"] = this.words[0].rank;
        if (this.words[0].weight)
          attributes["data-weight"] = this.words[0].weight;
      }
      return attributes;
    },
    hard() {
      if (this.highlightHardWords) {
        if (
          this.$l2.code === "zh" &&
          this.token &&
          this.token.candidates &&
          this.token.candidates.length > 0
        ) {
          if (this.token.candidates[0].head.length < 4) return false; // Only highlight chengyu
        } else if (
          this.$l2.code === "en" &&
          this.token &&
          this.token.candidates &&
          this.token.candidates.length > 0
        ) {
          if (this.token.candidates[0].level === "C2") {
            return "C2";
          } else {
            return false;
          }
        }
      }
    },
  },
  mounted() {
    if (this.sticky) {
      this.lookup();
    }
    this.update();
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type.startsWith("savedWords")) {
        this.update();
      }
    });
  },
  beforeDestroy() {
    this.words = [];
    // you may call unsubscribe to stop the subscription
    this.unsubscribe();
  },
  watch: {
    async wordblockHover() {
      if (!this.loaded || this.lastLookupWasQuick) {
        this.lookup();
      }
      await timeout(300);
      this.updateOpen();
    },
    async tooltipHover() {
      await timeout(123);
      this.updateOpen();
    },
  },
  methods: {
    pinyin2ipa(...args) {
      return pinyin2ipa(...args)
    },
    checkSavedWord() {
      if (!this.checkSaved) return false;
      let saved;
      let firstWord = this.words[0] || this.tokens?.[0];
      let text = this.text;
      if (firstWord) {
        saved = this.$store.getters["savedWords/has"]({
          id: firstWord.id,
          l2: this.$l2.code,
        });
        if (saved) {
          saved = Object.assign({ firstWord }, saved);
        }
      }
      if (!saved && text) {
        saved = this.$store.getters["savedWords/has"]({
          text: text.toLowerCase(),
          l2: this.$l2.code,
        });
      }
      if (saved) {
        this.appendSavedWord(saved.id, saved.forms[0]);
      } else {
        this.savedWord = undefined;
      }
      return saved;
    },
    phraseItem(phrase, translation = undefined) {
      if (typeof phrase !== "undefined") {
        let phraseItem = {
          l2: this.$l2.code,
          phrase,
          translations: {},
        };
        if (translation) phraseItem.translations[this.$l1.code] = translation;
        return phraseItem;
      }
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
    async appendSavedWord(id, head) {
      let dictionary = await this.$getDictionary();
      let savedWord = await dictionary.get(id, head);
      this.words = uniqueByValue([savedWord, ...this.words], "id");
      this.savedWord = savedWord;
    },
    togglePhrase(id) {
      Vue.set(this.showPhrase, id, !this.showPhrase[id]);
    },
    stripAccents(str) {
      str = str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Accents
        .replace(/[\u0600-\u0620\u064b-\u0655]/g, "") // Arabic diacritics
        .replace(/[\u0559-\u055F]/g, ""); // Armenian diacritics
      if (["he", "hbo", "iw"].includes(this.l2))
        str = this.stripHebrewVowels(str);
      return str;
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
      if (this.$l2.code === 'zh')
        formattedPronunciation = word.pronunciation + " [" + pinyin2ipa(word.pronunciation, {toneMarker: 'chaoletter'}) + "]"
      return formattedPronunciation;
    },
    test(arg) {
      console.log(`Evaluated`, arg);
    },
    async visibilityChanged(isVisible) {
      await timeout(123);
      if (isVisible && (!this.words || this.words.length === 0)) {
        if (this.$l2.code !== "fa") {
          let quick = true;
          if (this.l2SettingsOfL2.showPinyin && !this.transliteration)
            quick = false; // If the user wants to see IPA, we get all the words from the get go by setting quick to false, which can take a performance hit
          await this.lookup(quick);
        }
      }
    },
    async getFarsiRomanization(text) {
      if (this.$l2.code === "fa") {
        let dictionary = await this.$getDictionary();
        let roman = await (await dictionary).romanizePersian(text);
        return roman || this.transliterate(text);
      }
    },
    async getTransliteration() {
      let transliteration;
      if (this.$l2.code === "tlh") {
        return this.fixKlingonTypos(this.text);
      } else if (this.$l2.code === "fa") {
        this.text = this.text.replace(/\u064a/g, "\u06cc"); // Arabic YEH to Farsi YEH
        let roman = await this.getFarsiRomanization(this.text);
        transliteration = roman.replace(/\^/g, "");
      } else if (this.token && this.token.candidates.length > 0) {
        if (this.$l2.code !== "ja" && this.token.candidates[0].pronunciation) {
          transliteration =
            this.token.candidates[0].pronunciation.split(",")[
              this.$l2.code === "vi" ? 1 : 0
            ];
        }
        transliteration =
          transliteration ||
          this.token.candidates[0].kana ||
          this.token.candidates[0].jyutping ||
          this.token.candidates[0].pinyin;
      }
      if (!transliteration && this.$hasFeature("transliteration")) {
        if (!["ja", "zh", "nan", "hak"].includes(this.$l2.code)) {
          transliteration = this.transliterate(this.text);
        }
      }
      if (transliteration !== this.text) return transliteration;
    },
    klingonIPA(text) {
      return Klingon.latinToIPA(text);
    },
    fixKlingonTypos(text) {
      return Klingon.fixTypos(text);
    },
    transform(text, removeSpacing = false) {
      if (typeof text === "undefined") {
        text = "";
      }
      // if (this.$l2.code === "ru" && text.length > 9) text = this.segment(text);
      if (this.$l2.code === "ru" && this.savedWord) {
        let accentText = this.getRussianAccentText();
        if (accentText) return accentText;
      }
      if (this.$l2.code === "tlh" && text.trim() !== "") {
        text = Klingon.latinToConScript(text);
      }
      if (removeSpacing) {
        text = text.replace(/ /gi, "");
      }
      return text;
    },
    getRussianAccentText() {
      let forms = this.savedWord.forms.map((f) => f.form);
      let accentLessForms = forms.map((f) => f.replace("'", ""));
      let search = this.text.toLowerCase();
      let matchedIndex = accentLessForms.findIndex((f) => search === f);
      if (matchedIndex) {
        let matchedForm = forms[matchedIndex];
        if (matchedForm) {
          let accentIndex = matchedForm.indexOf("'");
          if (accentIndex >= 0) {
            let accentText =
              this.text.substring(0, accentIndex) +
              "'" +
              this.text.substring(accentIndex);
            accentText = accentText.replace(/'/g, "́");
            return accentText;
          }
        }
      }
    },
    wordBlockMouseEnter(event) {
      this.wordblockHover = true;
    },
    async wordBlockMouseLeave(event) {
      this.wordblockHover = false;
    },
    tooltipMouseEnter(event) {
      this.tooltipHover = true;
    },
    tooltipMouseLeave(event) {
      this.tooltipHover = false;
    },
    wordBlockClick(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      if (
        this.explore &&
        this.token &&
        this.token.candidates &&
        this.token.candidates.length > 0
      ) {
        this.$router.push({
          path: `/${this.$l1.code}/${this.$l2.code}/explore/related/${this.token.candidates[0].id}`,
        });
      } else {
        if (!isMobile()) this.togglePopup();
      }
    },
    transliterate(text) {
      return this.transliterationprop && this.transliterationprop !== text
        ? this.transliterationprop
        : "";
      // return tr(text);
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
      //([ёеуюйыаоэяи])
    },
    async update() {
      if (!this.transliteration || this.transliteration === "")
        this.transliteration = await this.getTransliteration();
      if (this.$l1) this.classes[`l1-${this.$l1.code}`] = true;
      if (this.$l2) this.classes[`l2-${this.$l2.code}`] = true;
      if (this.$l2.han) this.classes["l2-zh"] = true;
      this.checkSavedWord()
    },
    matchCase(text) {
      if (this.text.match(/^[\wА-ЯЁ]/)) {
        if (this.text.match(/^.[\wА-ЯЁ]/)) {
          return text.toUpperCase();
        } else {
          return ucFirst(text);
        }
      } else {
        return text;
      }
    },
    async loadImages() {
      this.loadingImages = true;
      if (this.images.length === 0) {
        this.images = (
          await WordPhotos.getGoogleImages({
            term: this.token ? this.token.text : this.text,
            lang: this.$l2.code,
          })
        ).slice(0, 5);
      }
    },
    togglePopup() {
      if (this.popup) {
        if (this.open) this.closePopup();
        else this.openPopup();
      }
    },
    updateOpen() {
      // alert(`w: ${this.wordblockHover}, t: ${this.tooltipHover}`);
      if (this.wordblockHover || this.tooltipHover) {
        this.openPopup();
      } else {
        this.closePopup();
      }
    },
    updateIPA() {
      if (this.$l2.code === "ja") return;
      if (!this.transliteration && this.words && this.words[0]) {
        // let search = this.stripAccents(this.text.toLowerCase());
        let word = this.words.find(
          (w) => w.pronunciation && w.pronunciation !== ""
        );
        this.transliteration =
          word && word.pronunciation
            ? word.pronunciation.split(",")[0]
            : this.transliteration;
      }
    },
    async openPopup() {
      if (this.open) return;
      if (this.popup && (await this.$getDictionary())) {
        if (this.loading === true) {
          if (
            (this.words && this.words.length === 0) ||
            this.lastLookupWasQuick
          ) {
            this.lookup();
          }
        }
        if (
          this.words &&
          this.words.find(
            (w) =>
              w.pos &&
              ["proper noun", "noun", "Noun", "name", "n"].includes(w.pos)
          )
        )
          this.loadImages();
        this.open = true;
        await timeout(123);
        if (this.open && this.l2SettingsOfL2.autoPronounce) {
          let speed = 0.75;
          let volume = 0.5;
          // Only wiktionary has real human audio
          if (
            this.$dictionaryName === "wiktionary" &&
            this.$refs.speak &&
            this.$refs.speak[0]
          ) {
            this.$refs.speak[0].speak(speed, volume);
          } else {
            speak(this.text, this.$l2, speed, volume);
          }
        }
      }
      this.$nuxt.$emit("popupOpened");
    },
    async closePopup() {
      this.open = false;
      this.$nuxt.$emit("popupClosed");
    },
    async lookup(quick = false) {
      this.loading = true;
      let dictionary = await this.$getDictionary();
      if (this.loaded) {
        if (quick) return;
        else if (!this.lastLookupWasQuick) return;
      }
      this.lastLookupWasQuick = quick;
      let words = [];
      if (
        this.token &&
        this.token.candidates &&
        this.token.candidates.length > 0
      ) {
        words = this.token.candidates;
      } else if (this.text) {
        if (!this.text && this.token) this.text = this.token.candidates[0].head;
        words = await dictionary.lookupFuzzy(this.text, 20, quick);
        if (words && !quick) {
          for (let word of words) {
            if (this.$l2.code === "fa") {
              this.farsiRomanizations[word.head] =
                await this.getFarsiRomanization(word.head);
            }
            // Russian
            if (word && word.matches) {
              for (let match of word.matches) {
                match.form = await dictionary.accent(match.form);
                match.field = await dictionary.stylize(match.field);
                match.number = await dictionary.stylize(match.number);
                match.table = await dictionary.stylize(match.table);
              }
            }
          }
        }
      }
      if (!quick) {
        words = words
          ? words.sort((a, b) => {
              let asaved = this.$store.getters["savedWords/has"]({
                id: a.id,
                l2: this.$l2.code,
              });
              let bsaved = this.$store.getters["savedWords/has"]({
                id: b.id,
                l2: this.$l2.code,
              });
              return asaved === bsaved ? 0 : asaved ? -1 : 1;
            })
          : [];
        if (dictionary.getLemmas) {
          let allLemmas = [];
          for (let word of words) {
            let lemmas = await dictionary.getLemmas(word.traditional);
            if (lemmas) allLemmas = allLemmas.concat(lemmas);
          }
          if (allLemmas.length > 0) words = words.concat(allLemmas);
        }
        if (dictionary.findPhrases) {
          for (let word of words) {
            word.phrases = await dictionary.findPhrases(word);
          }
        }
        if (dictionary.addNewHSK) {
          for (let word of words) {
            word = await dictionary.addNewHSK(word);
          }
        }
      }

      words = uniqueByValue(words, "id");
      words = uniqueByValue([...words, ...this.words], "id");
      this.words = words
      this.checkSavedWord()

      this.updateIPA();
      this.loading = false;
      this.loaded = true;
    },
    unique(a) {
      return a.filter((item, i, ar) => ar.indexOf(item) === i);
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
    speak(text) {
      let speechSynthesis = window?.speechSynthesis;
      if (!speechSynthesis) return;
      if (this.$hasFeature("speech")) {
        if (!speechSynthesis.speaking) {
          this.utterance = new SpeechSynthesisUtterance(text);
          this.utterance.lang = this.$l2.code;
          speechSynthesis.speak(this.utterance);
        }
      }
    },
  },
};
</script>

<style lang="scss">
.v-popover {
  display: inline-block;
}
.main-dark {
  .word-block,
  .word-block-unknown {
    color: #ccc;
    &.animate {
      animation-name: shine;
      animation-iteration-count: 1;
      animation-duration: 2s;
      animation-timing-function: ease-in-out;
    }
    &.saved.animate {
      animation-name: shinesaved;
    }
  }
}

@keyframes shine {
  0% {
    color: #ccc;
  }
  10% {
    color: #54ff7c;
  }
  100% {
    color: #ccc;
  }
}

@keyframes shinesaved {
  0% {
    color: #28a745;
  }
  10% {
    color: #54ff7c;
  }
  100% {
    color: #28a745;
  }
}

.word-block.with-popup {
  cursor: pointer;

  &.saved {
    font-weight: bold;
  }

  &:hover {
    background-color: rgba(250, 248, 195, 0.5);
    border-radius: 0.25rem;
  }
}

.widget-dark .word-block.with-popup:hover,
.main-dark .word-block.with-popup:hover {
  background-color: #00000066;
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

  .word-block-text-byeonggi {
    color: rgba(143, 158, 172, 0.8);
    font-size: 6em;
  }
}

.show-quick-gloss {
  [dir="ltr"] .word-block.saved.with-quick-gloss {
    text-align: left;
  }

  [dir="rtl"] .word-block.saved.with-quick-gloss {
    text-align: right;
  }
}

.add-pinyin {
  .word-block {
    display: inline-block;
    text-align: center;
    margin: 0;
    position: relative;
    text-indent: 0;

    .word-block-pinyin,
    .word-block-text-byeonggi-wrapper {
      display: block;
      line-height: 1.3;
      text-indent: 0;
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

.tooltip-inner {
  .word-block-pinyin,
  .word-block-simplified,
  .word-block-traditional {
    display: block !important;
  }
}

/* Shown on demand */

.show-pinyin .word-block .word-block-pinyin,
.show-simplified .word-block .word-block-simplified,
.show-traditional .word-block .word-block-traditional,
.show-definition .word-block .word-block-definition {
  display: block;
}

.show-pinyin .word-block .word-block-hard {
  // text-decoration: underline;
  background-color: rgba(255, 226, 129, 0.137);
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

.word-block-pinyin {
  font-size: 0.7em;
  margin: 0 0.2rem;
  opacity: 0.7;
}

[dir="rtl"] .annotate-template {
  font-size: 1.33em;
  .word-block-pinyin {
    font-size: 0.7em;
  }
}

.word-block.saved {
  .word-block-pinyin {
    opacity: 1;
    font-weight: normal;
  }
}

.word-block-definition {
  display: none;
  color: #aaa;
  font-size: 0.7em;
  font-style: italic;
  margin-top: 0.5em;
  max-width: 6rem;
  margin: 0 0.5em 0.2em 0.5em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.word-block-simplified,
.word-block-traditional,
.word-block-text {
  &.pos-verb,
  &.pos-Verb,
  &.pos-動詞 {
    border-bottom: 1px solid rgba(204, 204, 204, 0.5);
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
