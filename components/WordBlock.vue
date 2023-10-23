<template>
  <span
    @click="wordBlockClick"
  >
    <component :is="tag" v-bind="attributes" :animate="animate" />
  </span>
</template>

<script>
import { timeout, unique, speak, uniqueByValue } from "@/lib/utils";
import { mapState } from "vuex";
import { tify, sify } from "chinese-conv";
import { transliterate as tr } from "transliteration";
import WordPhotos from "@/lib/word-photos";
import Klingon from "@/lib/klingon";

export default {
  props: {
    token: {
      type: Object,
    },
    quizMode: {
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
      text: this.token.text,
      images: [],
      words: this.token?.candidates || [],
      savedWord: undefined,
      savedPhrase: undefined,
      checkSaved: true,
      tooltipHover: false,
      lastLookupWasQuick: false,
      reveal: false,
      t: 0,
      animate: false,
    };
  },
  computed: {
    ...mapState("savedWords", ["savedWords"]),
    /**
     * Calculates the attributes object.
     *
     * The returned object has the following properties:
     *
     * - `saved`: A value indicating whether the word or phrase has been saved.
     * - `phonetics`: The phonetics of the current word or phrase.
     * - `pos`: The part of speech of the current word or phrase.
     * - `definition`: The quick gloss definition of the current word or phrase.
     * - `text`: The transformed text of the word or phrase.
     * - `hanAnnotation`: For Vietnamese and Korean, the Han character form of the word, if it exists and should be shown in small print on the side.
     * - `mappedPronunciation`: The pronunciation of the word as mapped for Japanese, if the current language is Japanese.
     * - `data-hover-level`: Set to "outside" by default
     * - `data-rank`: The rank of the word, if it exists.
     * - `data-weight`: The weight of the word, if it exists.
     *
     * @async
     * @computed
     * @returns {Promise<Object>} The attributes object.
     */
    attributes() {
      let isSaved = this.savedWord || this.savedPhrase ? true : false;
      let phonetics = this.$l2Settings.showPinyin ? this.bestPhonetics : false;
      let text = this.getDisplayText(this.text);
      let pos = this.pos;
      let definition, hanAnnotation, mappedPronunciation;
      if (this.$l2Settings.showDefinition || this.$l2Settings.showQuickGloss)
        definition = this.shortDefinition;
      if (this.$l2Settings.showByeonggi && ["ko", "vi"].includes(this.$l2.code))
        hanAnnotation = this.getHanAnnotation(this.bestWord);
      if (this.$l2.code === "ja")
        mappedPronunciation = this.getMappedPronunciation();
      let level = this.bestWord?.level || "outside";
      let attributes = {
        isSaved,
        phonetics,
        pos,
        definition,
        text,
        hanAnnotation,
        mappedPronunciation,
        "data-hover-level": level,
      };
      return attributes;
    },
    tag() {
      if (
        (this.savedWord || this.savedPhrase) &&
        this.quizMode &&
        !this.reveal
      ) {
        return "WordBlockQuiz";
      } else {
        return "WordBlockWord";
      }
    },
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
      if (this.savedWord) return this.savedWord;
      let firstCandidate = this.token?.candidates?.[0];
      if (firstCandidate) return firstCandidate;
      let firstFuzzyWord = this.words?.[0];
      if (firstFuzzyWord) {
        for (let key in ["head", "simplified", "traditional", "kana"]) {
          if (firstFuzzyWord[key] === this.text) {
            return firstFuzzyWord;
          }
        }
      }
    },
    bestPhonetics() {
      let phonetics;
      if (this.token?.pronunciation) {
        phonetics = this.token.pronunciation; 
      } else if (this.bestWord) {
        phonetics = this.phoneticsFromWord(this.bestWord);
      } else {
        phonetics = tr(this.text).replace(/"/g, "");
      }  
      if (phonetics) return phonetics;
    },
  },
  mounted() {
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
  // Hide the modal when we navigate to a new route
  watch: {
    $route() {
      this.closePopup();
    },
  },
  methods: {
    unique,
    speak,
    showMenuModal() {
      this.$nuxt.$emit("showPopupDictionary", {
        token: this.token,
        text: this.text,
        context: this.context,
        phraseObj: this.phraseObj,
        words: this.words,
        images: this.images,
        quizModeItem: this.quizModeItem,
      });
    },
    hideMenuModal() {
      this.$nuxt.$emit("hidePopupDictionary");
    },
    async playAnimation(animationDuration) {
      this.animate = true;
      await timeout(animationDuration);
      this.animate = false;
    },
    getHanAnnotation(word) {
      let hanja = word?.hanja;
      if (!hanja) return;
      let head = word.head;
      let isValid = true;
      if (hanja.length <= 1) isValid = false;
      if (hanja.includes(",")) isValid = false;
      if (this.$l2.code === "ko") {
        let bannedEndings = "이히하해한고가기는은도의로를";
        let bannedWords = ["지난", "진자", "가야", "주시", "거야", "위해"];
        if (new RegExp("[" + bannedEndings + "]$").test(head)) isValid = false;
        if (bannedWords.includes(head)) isValid = false;
      }
      if (isValid) {
        return hanja ? hanja.split(/[,\-]/)[0] : "";
      }
    },
    getDisplayText(text) {
      if (typeof text === "undefined" || text.trim() === "") {
        return "";
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
     * @return {Promise<void>}
     */
    async checkSavedWord() {
      if (!this.checkSaved) return false;
      let saved;
      let firstWord = this.words[0] || this.tokens?.[0];
      let text = this.text;
      if (!text) return false;
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
        await this.setSavedWord(saved.id, saved.forms[0]);
      }
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
      let saved = this.$store.getters["savedPhrases/has"](phrase);
      if (saved) this.savedPhrase = saved
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
      this.openPopup();
    },
    async checkSavedItems() {
      await this.checkSavedWord();
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
    async openPopup() {
      if (this.open) return; // Already open
      this.showMenuModal();
      if (this.lookupInProgress === false && !(this.words?.length > 0)) {
        await this.lookup();
      }
      this.loadImages();
      if (this.$l2Settings.autoPronounce) {
        if (!this.quizMode || this.reveal) {
          this.playWordAudio();
        }
      }
    },
    playWordAudio() {
      const canGenerateSpeech =
        this.$l1 && this.$l2
          ? this.$languages.hasFeature(this.$l1, this.$l2, "speech")
          : false;
      const speakComponent = this.$refs.popup?.$refs.speak?.[0];
      const hasRecordedAudio =
        speakComponent &&
        speakComponent.mp3 &&
        this.words?.[0].head?.toLowerCase() === this.text.toLowerCase();
      if (hasRecordedAudio) speakComponent.speak({ rate, volume });
      else if (canGenerateSpeech) {
        const rate = 0.75;
        const volume = 0.5;
        let text = this.text;
        if (this.$l2.code === "ja" && this.token?.pronunciation)
          text = this.token.pronunciation;
        speak({ text, l2: this.$l2, rate, volume });
      }
    },
    async closePopup() {
      this.hideMenuModal();
    },
    async lookup() {
      this.lookupInProgress = true;
      let dictionary = await this.$getDictionary();
      let words = uniqueByValue(
        [...(this.token.candidates || []), ...this.words],
        "id"
      );
      if (words.length === 0) {
        // addCandidatesToToken is already done by the tokenizer, but sometimes this doesn't happen in time. Let's do it again so we don't override the candidates.
        if (this.token && !this.token.candidates?.length > 0) {
          this.token.candidates = await dictionary.addCandidatesToToken(
            this.token
          );
          words = this.token?.candidates || [];
          if (!words.length)
            words = (await dictionary.lookupFuzzy(this.text, 20)) || [];
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
      this.words = uniqueByValue([...words, ...this.words], "id");
      this.checkSavedItems();
      this.lookupInProgress = false;
    },
  },
};
</script>
