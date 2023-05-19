<template>
  <v-popover
    :open="open"
    placement="top"
    ref="popover"
    :popoverClass="`skin-${$skin}`"
    :popoverWrapperClass="`tooltip-wrapper skin-${$skin} l1-${$l1.code} l2-${$l2.code}`"
    :popoverInnerClass="`tooltip-inner popover-inner skin-${$skin}`"
    :popoverArrowClass="`tooltip-arrow popover-arrow skin-${$skin}`"
  >
    <div
      v-on="popup ? { click: wordBlockClick } : {}"
      v-observe-visibility="visibilityChanged"
      @mouseenter="wordblockHover = true"
      @mouseleave="wordblockHover = false"
    >
      <WordBlockQuiz
        v-if="
          (this.savedWord || this.savedPhrase) && this.quizMode && !this.reveal
        "
        v-bind="attributes"
      />
      <WordBlockWord v-else v-bind="attributes" :animate="animate" />
    </div>

    <template slot="popover">
      <div
        v-if="
          (this.savedWord || this.savedPhrase) && this.quizMode && !this.reveal
        "
        class="popover-inner-hover-area"
      >
        {{ $t("Tap to show answer.") }}
      </div>
      <div
        @mouseenter="tooltipHover = true"
        @mouseleave="tooltipHover = false"
        v-else-if="open"
        class="popover-inner-hover-area"
      >
        <WordBlockPopup
          v-bind="{
            text,
            token,
            words,
            images,
            loading,
            loadingImages,
            context,
            transliterationprop,
            phraseObj: phraseItem(text),
          }"
          ref="popup"
          v-if="open"
        />
      </div>
    </template>
  </v-popover>
</template>

<script>
import { timeout, unique, uniqueByValue, isMobile } from "@/lib/utils";
import { speak } from "@/lib/utils/speak";
import { mapState } from "vuex";
import { tify, sify } from "chinese-conv";
import WordPhotos from "@/lib/word-photos";
import Klingon from "@/lib/klingon";

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
    quizMode: {
      default: false,
    },
    useZoom: {
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
      open: false,
      showPhrase: {},
      loading: false,
      loadingImages: false,
      loaded: false,
      text: this.$slots.default ? this.$slots.default[0].text : undefined,
      images: [],
      words: [],
      savedWord: undefined,
      savedPhrase: undefined,
      checkSaved: true,
      wordblockHover: false,
      tooltipHover: false,
      highlightHardWords: true,
      transliteration: undefined,
      lastLookupWasQuick: false,
      reveal: false,
      t: 0,
      animate: false,
    };
  },
  computed: {
    ...mapState("settings", ["l2Settings"]),
    ...mapState("savedWords", ["savedWords"]),
    $l2Settings() {
      let $l2Settings = {};
      if (this.l2Settings && this.l2Settings[this.$l2.code])
        $l2Settings = this.l2Settings[this.$l2.code];
      return $l2Settings;
    },
    quickGloss() {
      let definition =
        this.savedWord?.definitions?.[0] || this.words?.[0]?.definitions?.[0];
      let quickGloss = definition
        ?.replace(/\s*\(.*?\)/, "")
        ?.replace(/\s*\（.*?）/, "")
        ?.replace(/\s*.*?：/, "")
        ?.replace(/^.*\./, "")
        ?.replace(/^to /, "")
        ?.replace(/^see .*/, "")
        ?.replace(/^variant .*/, "")
        ?.split(/[，；,;]\s*/)[0];
      if (quickGloss && quickGloss.length < 20) return quickGloss;
    },
    savedTransliteration() {
      if (this.word) {
        return (
          this.word.jyutping ||
          this.word.pinyin ||
          this.word.kana ||
          (this.word.pronunciation || "").split(", ")[0]
        );
      }
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
      if (pos) return pos.replace(/\-.*/, "").replace(/\s/g, "-");
    },
    word() {
      let word = this.savedWord
      if (this.$l2.han) {
        if (!word) {
          word = this.words?.[0];
        }
        if (word) {
          if (!(word.simplified && word.simplified === this.text) || (word.traditional && word.traditional === this.text)) word = undefined
        }
      }
      return word
    },
    hanja() {
      if (["ko", "vi"].includes(this.$l2.code)) {
        let hanja = "";
        if (this.savedWord) hanja = this.savedWord.hanja;
        else if (this.words && this.words[0]) {
          let head = this.words[0].head;
          let bannedEndings = "이히하해한고가기는은도의로를";
          let bannedWords = ["지난", "진자", "가야", "주시", "거야", "위해"];
          if (
            !bannedWords.includes(head) &&
            !bannedEndings.includes(head.charAt(head.length - 1))
          ) {
            let hanjas = this.words.map((c) => c.hanja);
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
  asyncComputed: {
    async attributes() {
      let word = this.word;
      let definition = this.quickGloss;
      let phonetics = this.getPhonetics();
      let text = this.$l2.han ? this.getWordText(word, this.text) : this.text;
      let hanja =
        this.$l2Settings.showByeonggi && this.hanja ? this.hanja : undefined;
      let mappedPronunciation =
        this.$l2.code === "ja"
          ? this.getMappedPronunciation(word, this.text)
          : undefined;
      let attributes = {
        popup: this.popup,
        sticky: this.sticky,
        common: this.common,
        seen: this.seen,
        saved: this.savedWord || this.savedPhrase,
        phonetics,
        pos: this.pos,
        definition,
        text: await this.transform(text),
        hanja,
        useZoom: this.useZoom,
      };

      if (mappedPronunciation) {
        attributes.mappedPronunciation = mappedPronunciation;
      }

      if (this.popup) {
        attributes["data-hover-level"] = "outside";
      }

      if (word) {
        if (word.rank) attributes["data-rank"] = word.rank;
        if (word.weight) attributes["data-weight"] = word.weight;
      }

      return attributes;
    },
  },
  mounted() {
    if (this.token?.candidates) {
      let words = uniqueByValue([...this.token.candidates, ...this.words], "id");
      this.words = words
    }
    if (this.sticky) {
      this.lookup();
    }
    this.update();
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type.startsWith("savedWords")) {
        this.update();
      }
    });
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type.startsWith("savedPhrases")) {
        this.update();
      }
    });
  },
  beforeDestroy() {
    this.words = [];
    // you may call unsubscribe to stop the subscription
    this.unsubscribe();
  },
  head() {
    let head = {};
    if (this.$l2.code === "ja")
      head.script = [
        {
          hid: "wanakana",
          src: "/vendor/wanakana/wanakana.min.js",
        },
        {
          hid: "map-kana",
          src: "/js/map-kana.js",
        },
      ];
    return head;
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
    playAnimation() {
      this.animate = true
    },
    getWordText(word, text) {
      let result = "";
      if (word) {
        result = this.$l2Settings.useTraditional
          ? word.traditional
          : word.simplified;
      } else {
        result = this.$l2Settings.useTraditional ? tify(text) : sify(text);
      }
      return result;
    },
    getPhonetics() {
      let phonetics = false;
      if (
        this.$l2Settings.showPinyin &&
        this.phonetics
      ) {
        phonetics = this.savedTransliteration || this.transliterationprop || this.transliteration;
      }    
      return phonetics;
    },
    getMappedPronunciation() {
      if (
        this.token &&
        typeof mapKana !== "undefined" &&
        typeof wanakana !== "undefined"
      ) {
        // If the word is saved, use the saved pronunciation
        if (this.savedWord && this.savedWord.head === this.text) {
          return mapKana(this.text, this.savedWord.kana);
        } else {
          const pronunciation = this.token.pronunciation;
          return mapKana(this.token.text, wanakana.toHiragana(pronunciation));
        }
      }
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
    async transform(text, removeSpacing = false) {
      if (typeof text === "undefined") {
        text = "";
      }
      if (this.$l2.code === "ru" && this.savedWord) {
        let dictionary = await this.$getDictionary();
        let accentText = await dictionary.getAccentForm(this.text, this.savedWord.head);
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
    /**
     * checkSavedWord function:
     * Checks whether the first word in `this.words` array or `this.tokens` array is saved in the store.
     * If not found in `this.words` and `this.tokens`, it checks for the word in `this.text`.
     * If the word is saved, it assigns it to `this.savedWord` and returns it, else it sets `this.savedWord` as undefined.
     * @return {Object|undefined} - Returns the saved word object if found, else returns undefined.
     */
    checkSavedWord() {
      if (!this.checkSaved) return false;
      let saved;
      let firstWord = this.words[0] || this.tokens?.[0];
      let text = this.text;
      let textLowerCase = text.toLowerCase();
      if (firstWord && firstWord.search === textLowerCase) {
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
          text: textLowerCase,
          l2: this.$l2.code,
        });
      }
      if (saved) {
        this.setSavedWord(saved.id, saved.forms[0]);
      } else {
        this.savedWord = undefined;
      }
      return saved;
    },
    /**
     * setSavedWord function:
     * Finds the word with the given id in `this.words` array and sets it as `this.savedWord`.
     * If the word is not found, it retrieves the word from the dictionary and sets it as `this.savedWord`.
     * @param {string} id - The id of the word to be found.
     * @param {string} head - The head form of the word to be found.
     * @return {Promise<void>}
     */
    async setSavedWord(id, head) {
      let savedWord = this.words.find((w) => w.id === id);
      if (!savedWord) {
        let dictionary = await this.$getDictionary();
        savedWord = await dictionary.get(id, head);
      }
      if (savedWord) {
        this.words = uniqueByValue([savedWord, ...this.words], "id");
        this.savedWord = savedWord;
      }
    },
    checkSavedPhrase() {
      let phrase = this.phraseItem(this.text);
      this.savedPhrase = this.$store.getters["savedPhrases/get"](
        Object.assign({}, phrase)
      );
    },
    test(arg) {
      console.log(`Evaluated`, arg);
    },
    async visibilityChanged(isVisible) {
      await timeout(123);
      if (isVisible && (!this.words || this.words.length === 0)) {
        if (this.$l2.code !== "fa") {
          let quick = true;
          if (this.$l2Settings.showPinyin && !this.transliteration)
            quick = false; // If the user wants to see IPA, we get all the words from the get go by setting quick to false, which can take a performance hit
          await this.lookup(quick);
        }
      }
    },
    async getTransliteration() {
      let transliteration;
      if (this.$l2.code === "tlh") {
        return this.fixKlingonTypos(this.text);
      } else if (this.token && this.token.candidates?.length > 0) {
        if (this.$l2.code !== "ja") {
          if (this.token.pronunciation) {
            transliteration = this.token.pronunciation;
          } else if (this.token.candidates[0].pronunciation) {
            transliteration =
              this.token.candidates[0].pronunciation.split(",")[
                this.$l2.code === "vi" ? 1 : 0
              ];
          }
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
    fixKlingonTypos(text) {
      return Klingon.fixTypos(text);
    },
    wordBlockClick(event) {
      if (this.quizMode) {
        this.reveal = !this.reveal;
      }
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
    },
    async update() {
      if (!this.transliteration || this.transliteration === "")
        this.transliteration = await this.getTransliteration();
      this.checkSavedWord();
      this.checkSavedPhrase();
    },
    async loadImages() {
      if (this.images.length === 0) {
        this.images = (
          await WordPhotos.getGoogleImages({
            term: this.token ? this.token.text : this.text,
            lang: this.$l2.code,
          })
        ).slice(0, 5);
      }
      this.loadingImages = false;
    },
    togglePopup() {
      if (this.popup) {
        if (this.open) this.closePopup();
        else this.openPopup();
      }
    },
    updateOpen() {
      if (this.wordblockHover || this.tooltipHover) {
        this.openPopup();
      } else {
        this.closePopup();
      }
    },
    updateIPA() {
      if (this.$l2.code === "ja") return;
      if (!this.transliteration && this.words && this.words[0]) {
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
      if (!this.popup) return;
      let dictionary = await this.$getDictionary();
      if (dictionary) {
        if (this.loading === true) {
          if (
            (this.words && this.words.length === 0) ||
            this.lastLookupWasQuick
          ) {
            this.lookup(false);
          }
        }
        let hasImageWorthyWords = false;
        if (this.words) {
          hasImageWorthyWords = this.words.find((w) => {
            if (this.$l2.code === "ja") return true;
            else if (
              w.pos &&
              ["proper noun", "noun", "Noun", "name", "n"].includes(w.pos)
            )
              return true;
          });
        }
        if ((this.words && this.words.length === 0) || hasImageWorthyWords) {
          this.loadingImages = true;
          this.loadImages();
        }
        this.open = true;
        await timeout(123);
        if (this.open && this.$l2Settings.autoPronounce) {
          if (!this.quizMode || this.reveal) {
            let speed = 0.75;
            let volume = 0.5;
            // Only wiktionary has real human audio
            let speakComponent = this.$refs.popup?.$refs.speak?.[0];
            if (
              speakComponent &&
              this.$dictionaryName === "wiktionary-csv" &&
              this.words?.[0].head?.toLowerCase() === this.text.toLowerCase()
            ) {
              speakComponent.speak(speed, volume);
            } else {
              speak(this.text, this.$l2, speed, volume);
            }
          }
        }
      }
      this.$nuxt.$emit("popupOpened");
    },
    async closePopup() {
      this.open = false;
      this.$nuxt.$emit("popupClosed");
    },
    async lookup(quick = true) {
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
        // Sometimes the lemmas haven't been looked up yet, so we do that here
        if (this.token.lemmas) {
          for (let lemma of this.token.lemmas) {
            if (lemma.lemma && lemma.lemma !== this.token.text) {
              const lemmaCandidates = await dictionary.lookupMultiple(lemma.lemma)
              words = [...words, ...lemmaCandidates]
            }
          }
        }
      }
      if (!quick) {
        // Only do a fuzzy lookup if the word does not have a found lemma
        if (words.length === 0) {
          if (!this.text && this.token) this.text = this.token.candidates[0].head;
          words = await dictionary.lookupFuzzy(this.text, 20, quick);
          if (words && !quick) {
            for (let word of words) {
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
            let lemmas = await dictionary.getLemmas(
              word.traditional || word.head
            );
            if (lemmas) allLemmas = allLemmas.concat(lemmas);
          }
          if (allLemmas.length > 0) words = [...words, ...allLemmas]; // We put lemmas at the bottom because at time irrelevant words can show up as 'lemmas'
        }
      }

      words = uniqueByValue(words, "id");
      words = uniqueByValue([...words, ...this.words], "id");
      this.words = words;
      this.checkSavedWord();
      this.checkSavedPhrase();

      this.updateIPA();
      this.loading = false;
      this.loaded = true;
    },
    unique(a) {
      return a.filter((item, i, ar) => ar.indexOf(item) === i);
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
</style>
