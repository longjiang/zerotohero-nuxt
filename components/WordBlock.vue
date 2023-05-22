<template>
  <v-popover
    :open="open"
    :popoverClass="`skin-${$skin}`"
    :popoverWrapperClass="`tooltip-wrapper skin-${$skin} l1-${$l1.code} l2-${$l2.code}`"
    :popoverInnerClass="`tooltip-inner popover-inner skin-${$skin}`"
    :popoverArrowClass="`tooltip-arrow popover-arrow skin-${$skin}`"
    placement="top"
    ref="popover"
  >
    <div
      v-on="usePopup ? { click: wordBlockClick } : {}"
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
            lookupInProgress,
            loadingImages,
            context,
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
import { timeout, unique, speak, uniqueByValue, isMobile } from "@/lib/utils";
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
    usePopup: {
      default: true,
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
      lookupInProgress: false,
      loadingImages: false,
      text: this.$slots.default ? this.$slots.default[0].text : undefined,
      images: [],
      words: [],
      savedWord: undefined,
      savedPhrase: undefined,
      checkSaved: true,
      wordblockHover: false,
      tooltipHover: false,
      lastLookupWasQuick: false,
      reveal: false,
      t: 0,
      animate: false,
    };
  },
  computed: {
    ...mapState("savedWords", ["savedWords"]),
    shortDefinition() {
      let shortDefinition =
        this.savedWord?.definitions?.[0] || this.words?.[0]?.definitions?.[0];
      if (!shortDefinition) return;

      [
        /\s*\(.*?\)/,
        /\s*\（.*?）/,
        /\s*.*?：/,
        /^.*\./,
        /^to /,
        /^see .*/,
        /^variant .*/,
      ].forEach((rule) => {
        shortDefinition = shortDefinition.replace(rule, "");
      });

      shortDefinition = shortDefinition.split(/[，；,;]\s*/)[0];

      return shortDefinition && shortDefinition.length < 20
        ? shortDefinition
        : undefined;
    },
    pos() {
      let pos = this.bestWord?.pos || this.token?.pos;
      if (pos) return pos.replace(/\-.*/, "").replace(/\s/g, "-");
    },
    bestWord() {
      let word = this.savedWord;
      if (!word) {
        word = this.token?.candidates?.[0];
      }
      if (!word) {
        word = this.words?.[0];
      }
      if (word && this.$l2.han) {
        if (!(word.simplified === this.text || word.traditional === this.text))
          word = undefined;
      }
      return word;
    },
    bestPhonetics() {
      let phonetics =
        this.token?.pronunciation || this.phoneticsFromWord(this.bestWord); // Prop
      return phonetics;
    },
  },
  asyncComputed: {
    /**
     * Asynchronously calculates the attributes object.
     *
     * The returned object has the following properties:
     *
     * - `usePopup`: A value indicating whether we are using Popup for this Word Block.
     * - `saved`: A value indicating whether the word or phrase has been saved.
     * - `phonetics`: The phonetics of the current word or phrase.
     * - `pos`: The part of speech of the current word or phrase.
     * - `definition`: The quick gloss definition of the current word or phrase.
     * - `text`: The transformed text of the word or phrase.
     * - `hanAnnotation`: For Vietnamese and Korean, the Han character form of the word, if it exists and should be shown in small print on the side.
     * - `useZoom`: A value indicating whether zoom should be used.
     * - `mappedPronunciation`: The pronunciation of the word as mapped for Japanese, if the current language is Japanese.
     * - `data-hover-level`: Set to "outside" if the usePopup is true.
     * - `data-rank`: The rank of the word, if it exists.
     * - `data-weight`: The weight of the word, if it exists.
     *
     * @async
     * @computed
     * @returns {Promise<Object>} The attributes object.
     */
    async attributes() {
      let isSaved = this.savedWord || this.savedPhrase ? true : false;
      let usePopup = this.usePopup;
      let phonetics = this.$l2Settings.showPinyin ? this.bestPhonetics : false;
      let text = await this.getDisplayText(this.text);
      let pos = this.pos;
      let definition, hanAnnotation, mappedPronunciation;
      if (this.$l2Settings.showDefinition || this.$l2Settings.showQuickGloss)
        definition = this.shortDefinition;
      if (this.$l2Settings.showByeonggi && ['ko', 'vi'].includes(this.$l2.code))
        hanAnnotation = this.getHanAnnotation(this.bestWord);
      if (this.$l2.code === "ja")
        mappedPronunciation = this.getMappedPronunciation();
      let level = this.bestWord?.level || "outside"
      let attributes = {
        usePopup,
        isSaved,
        phonetics,
        pos,
        definition,
        text,
        hanAnnotation,
        useZoom: this.useZoom,
        mappedPronunciation,
        "data-hover-level": level
      };
      return attributes;
    },
  },
  mounted() {
    if (this.token?.candidates) {
      let words = uniqueByValue(
        [...this.token.candidates, ...this.words],
        "id"
      );
      this.words = words;
    }
    this.checkSavedItems();
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (
        mutation.type.startsWith("savedWords") ||
        mutation.type.startsWith("savedPhrases")
      ) {
        this.checkSavedItems();
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
      await timeout(300);
      this.openOrClosePopup();
    },
    async tooltipHover() {
      await timeout(123);
      this.openOrClosePopup();
    },
  },
  methods: {
    unique,
    speak,
    async playAnimation(animationDuration) {
      this.animate = true;
      await timeout(animationDuration);
      this.animate = false;
    },
    getHanAnnotation(word) {
      let hanja = word?.hanja
      if (!hanja) return
      let head = word.head;
      let isValid = true;
      if (hanja.length <= 1) isValid = false;
      if (hanja.includes(',')) isValid = false;
      if (this.$l2.code === "ko") {
        let bannedEndings = "이히하해한고가기는은도의로를";
        let bannedWords = ["지난", "진자", "가야", "주시", "거야", "위해"];
        if ((new RegExp("[" + bannedEndings + "]$")).test(head)) isValid = false;
        if (bannedWords.includes(head)) isValid = false;
      }
      if (isValid) {
        return hanja ? hanja.split(/[,\-]/)[0] : ""; 
      }
    },
    async getDisplayText(text) {
      if (typeof text === "undefined" || text.trim() === "") {
        return "";
      }
      if (this.$l2.code === "ru") {
        if (this.savedWord) {
          let dictionary = await this.$getDictionary();
          let accentText = await dictionary.getAccentForm(
            this.text,
            this.savedWord.head
          );
          if (accentText) text = accentText;
        }
      }
      if (this.$l2.code === "tlh") {
        text = Klingon.latinToConScript(text);
      }
      if (this.$l2.han) {
        text = this.getSimplifiedOrTraditionalText();
      }
      return text;
    },
    getSimplifiedOrTraditionalText() {
      const word = this.bestWord;
      const text = this.text;
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
    phoneticsFromWord(word) {
      if (word) {
        return (
          word.jyutping ||
          word.pinyin ||
          word.kana ||
          (word.pronunciation || "").split(", ")[0]
        );
      }
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
    async checkSavedItems() {
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
      if (this.usePopup) {
        if (this.open) this.closePopup();
        else this.openPopup();
      }
    },
    openOrClosePopup() {
      if (this.wordblockHover || this.tooltipHover) {
        this.openPopup();
      } else {
        this.closePopup();
      }
    },
    shouldLoadImages() {
      let hasImageWorthyWords = false;
      if (this.words) {
        if (this.words.length === 0) return true;
        hasImageWorthyWords = this.words.find((w) => {
          if (this.$l2.code === "ja") return true;
          else if (
            w.pos &&
            ["proper noun", "noun", "Noun", "name", "n"].includes(w.pos)
          )
            return true;
        });
      }
      return hasImageWorthyWords;
    },
    async openPopup() {
      if (!this.usePopup) return; // Not using popup
      if (this.open) return; // Already open
      this.open = true;
      if (this.lookupInProgress === false && !(this.words?.length > 0)) {
        await this.lookup();
      }
      if (this.shouldLoadImages()) this.loadImages();
      if (this.$l2Settings.autoPronounce) {
        if (!this.quizMode || this.reveal) {
          this.playWordAudio();
        }
      }
      this.$nuxt.$emit("popupOpened");
    },
    playWordAudio() {
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
    },
    async closePopup() {
      this.open = false;
      this.$nuxt.$emit("popupClosed");
    },
    async lookup() {
      this.lookupInProgress = true;
      let dictionary = await this.$getDictionary();
      let words = uniqueByValue(
        [...( this.token.candidates || [] ), ...this.words],
        "id"
      );
      if (words.length === 0) {
        // addCandidatesToToken is already done by the tokenizer, but sometimes this doesn't happen in time. Let's do it again so we don't override the candidates.
        if (this.token && ! this.token.candidates?.length > 0) {
          let token = await dictionary.addCandidatesToToken(this.token);
          words = token?.candidates || [];
          if (!words.length) words = (await dictionary.lookupFuzzy(this.text, 20)) || [];
        }
      }
      // if (this.$l2.code === "ru") this.stylizeRussian(words)
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
      this.words = uniqueByValue([...words, ...this.words], "id");
      this.checkSavedItems();
      this.lookupInProgress = false;
    },
  },
};
</script>

<style lang="scss">
.v-popover {
  display: inline-block;
}
</style>
