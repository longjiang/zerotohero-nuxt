<template>
  <span
    @click="wordBlockClick"
    :class="wordBlockClasses"
    :style="{ 'animation-duration': animationDuration + 'ms' }"
    @animationend="resetAnimation"
  >
    <div v-if="showFillInTheBlank" class="word-block-quiz word-block-segment">
      <span class="transparent">{{ text }}</span>
    </div>
    <template v-else>
      <ruby
        v-for="(segment, index) in (attributes &&
          attributes.mappedPronunciation) || [
          {
            type: 'kanji',
            surface: text,
            reading: attributes && attributes.phonetics,
          },
        ]"
        :key="index"
        :data-hover-level="attributes.level"
      >
        <!-- <rt v-if="attributes?.showDefinition && index === 0">{{
          attributes?.definition || "&nbsp;"
        }}</rt> -->
        {{ russianAccentText || segment.surface
        }}<rt v-if="showReading(segment)">{{ segment.reading }}</rt
        ><rt v-else>&nbsp;</rt></ruby
      ><span
        v-if="attributes && attributes.hanAnnotation"
        class="word-block-text-byeonggi"
        v-html="attributes && attributes.hanAnnotation"
      /><span
        v-if="
          this.showQuickGloss &&
          attributes &&
          attributes.isSaved &&
          attributes.definition
        "
        class="word-block-text-quick-gloss"
        >‘{{ attributes.definition }}’</span
      >
    </template>

    <!-- no-fade is turned on to prevent a "ghosted" modal on iOS that blocks and disables the entire UI -->
    <b-modal
      ref="popup-dictionary-modal"
      size="sm"
      centered
      hide-footer
      no-fade
      modal-class="safe-padding-top my-5"
      :title="$tb('Dictionary')"
      :body-class="`popup-dictionary-modal-wrapper l2-${$l2.code}`"
      @show="$nuxt.$emit('popupOpened')"
      @hide="$nuxt.$emit('popupClosed')"
    >
      <template #modal-header="{ close }">
        <!-- Emulate built in modal header close button action -->
        <h5>{{ $tb("Dictionary") }}</h5>
        <b-button size="sm" variant="outline-success" @click="close()">
          <i class="fas fa-times"></i> {{ $tb("Close") }}
        </b-button>
      </template>
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
        v-else
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
            phraseObj: phraseItem(text, this.translation),
          }"
          ref="popup"
          @translation="translation = $event"
        />
      </div>
    </b-modal>
  </span>
</template>

<script>
import { SpeechSingleton, unique, uniqueByValue, hasKanji, timeout } from "../lib/utils";
import { mapState } from "vuex";
import { tify, sify } from "chinese-conv";
import { transliterate as tr } from "transliteration";
import Klingon from "../lib/klingon";

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
      images: [],
      loadingImages: true,
      showPhrase: {},
      lookupInProgress: false,
      text: this.token.text,
      words: this.token?.candidates || [],
      savedWord: undefined,
      savedPhrase: undefined,
      checkSaved: true,
      tooltipHover: false,
      lastLookupWasQuick: false,
      russianAccentText: undefined,
      reveal: false,
      t: 0,
      animate: false,
      animationDuration: undefined,
      highlighted: false,
      translation: null,
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
      let phonetics = this.$l2Settings?.showPinyin ? this.bestPhonetics : false;
      let text = this.getDisplayText(this.text);
      let pos = this.pos;
      let definition, hanAnnotation, mappedPronunciation;
      if (this.$l2Settings?.showDefinition || this.$l2Settings?.showQuickGloss)
        definition = this.shortDefinition;
      if (this.$l2Settings?.showByeonggi && ["ko", "vi"].includes(this.$l2.code))
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
        level,
        hanAnnotation,
        mappedPronunciation,
      };
      return attributes;
    },
    showFillInTheBlank() {
      (this.savedWord || this.savedPhrase) && this.quizMode && !this.reveal;
    },
    shortDefinition() {
      let shortDefinition;

      // If there's a saved phrase, get the definition in the current language
      if (this.savedPhrase) {
        shortDefinition = this.savedPhrase?.[this.$l1.code];
      }

      // If there's no saved phrase but there's a saved word, get the first definition
      else if (this.savedWord) {
        shortDefinition = this.savedWord?.definitions?.[0];
      }

      // If there's no saved phrase or word, get the first definition of the first word in the list
      else {
        shortDefinition = this.words?.[0]?.definitions?.[0];
      }

      // If there's no definition, return undefined
      if (!shortDefinition) return;

      // Define an array of regex rules to clean up the definition
      const rules = [
        /\s*\(.*?\)/, // Remove anything in parentheses
        /\s*\（.*?）/, // Remove anything in full-width parentheses
        /\s*.*?：/, // Remove anything before and including the full-width colon
        /^.*\./, // Remove anything before and including the first period
        /^to /, // Remove 'to ' at the start of the definition
        /^see .*/, // Remove 'see ' and anything after it at the start of the definition
        /^variant .*/, // Remove 'variant ' and anything after it at the start of the definition
      ];

      // Apply each rule to the definition
      rules.forEach((rule) => {
        shortDefinition = shortDefinition.replace(rule, "");
      });

      // Split the definition by commas or semicolons and take the first part
      shortDefinition = shortDefinition.split(/[，；,;]\s*/)[0];

      // If the resulting definition is less than 20 characters long, return it
      // Otherwise, return undefined
      return shortDefinition && shortDefinition.length < 20 ? shortDefinition : undefined;
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
        "with-quick-gloss":
          this.attributes?.isSaved && this.attributes?.definition,
        saved: this.attributes?.isSaved,
        obscure: this.attributes?.obscure,
        animate: this.animate,
        highlighted: this.highlighted
      };
      if (this.pos) classes[`pos-${this.pos}`] = true;
      return classes;
    },
    showQuickGloss() {
      return !this.showDefinition && this.$l2Settings?.showQuickGloss;
    },
    showDefinition() {
      return this.$l2Settings?.showDefinition;
    }
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
    showReading(segment) {
      if (!this.$l2Settings?.showPinyin) return false; // If the user doesn't want to see phonetics (pinyin), don't show it
      // If the segment's surface form and reading form are the same, don't show the reading
      if (segment.surface === segment.reading) return false;
      if (segment.type !== "kanji") return false; // segment.type is 'kanji' for all words, except those in Japanese that do not have kanji
      if (
        this.attributes?.mappedPronunciation?.length &&
        !hasKanji(segment.surface)
      )
        return false; // If this is Japanese, do not show pronunciation if there is no kanji
      return true;
    },
    async playAnimation(animationDuration) {
      const animationDurationMs = animationDuration * 1000
      this.animationDuration = animationDurationMs * 5;
      this.animate = true;
    },
    resetAnimation() {
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
        result = this.$l2Settings?.useTraditional
          ? word.traditional
          : word.simplified;
      } else {
        result = this.$l2Settings?.useTraditional ? tify(text) : sify(text);
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
      } else {
        this.savedWord = undefined;
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
      if (saved) this.savedPhrase = saved;
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
      if (this.$l2.code === "ru")
        this.russianAccentText = await this.getRussianAccentText();
    },
    async openPopup() {
      this.highlighted = true;
      if (this.$l2Settings.autoPronounce) {
        if (!this.quizMode || this.reveal) {
          this.playWordAudio();
        }
      }
      // Open it first, then load the words and images
      this.$nuxt.$emit("showPopupDictionary", {
        token: this.token,
        text: this.text,
        context: this.context,
        phraseObj: this.phraseItem(this.text),
        words: this.words,
        info: this.quizModeItem ? "Tap to show answer." : undefined,
      });
      let needToLookUp = this.lookupInProgress === false && !(this.words?.length > 0)
      if (needToLookUp) {
        await this.lookup()
      }
      this.$nuxt.$emit("updatePopupDictionary", {
        words: this.words,
      });
      this.$nuxt.$on("popupClosed", async () => {
        await timeout(300);
        this.highlighted = false;
      });
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
        SpeechSingleton.instance.speak({ text, l2: this.$l2, rate, volume });
      }
    },
    async getRussianAccentText() {
      if (this.$l2.code === "ru") {
        if (this.savedWord && this.text) {
          let dictionary = await this.$getDictionary();
          let accentText = await dictionary.getAccentForm(
            this.text,
            this.savedWord.head
          );
          if (accentText) return accentText;
        }
      }
    },
    async closePopup() {
      this.$nuxt.$emit("hidePopupDictionary");
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
      words = uniqueByValue([...words, ...this.words], "id");
      this.words = words;
      this.checkSavedItems();
      this.lookupInProgress = false;
      return words // to pass to popup as a promise
    },
  },
};
</script>

<style lang="scss">
@import "../assets/scss/variables.scss";

rt {
  font-size: 50%; /* Smaller size for phonetic annotation */
  line-height: 1.2; /* Adjust line-height if needed */
}

.word-block {
  will-change: color, transform;
  backface-visibility: hidden;
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
  font-size: 50%;
}

.word-block-unknown {
  color: #ccc;
}

.word-block,
.word-block-unknown {
  &.animate {
    animation-iteration-count: 1;
    animation-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1);
  }

  &.saved[data-hover-level="outside"].animate {
    animation-name: shinesaved;
  }
}

.word-block.obscure {
  opacity: 0;
}

@keyframes shinesaved {
  0% {
    color: $primary-color;
    bottom: 0;
  }

  10% {
    color: #54ff7c;
  }

  100% {
    color: $primary-color;
    bottom: 0;
  }
}

@keyframes shinedark {
  0% {
    transform: translate3D(0, 0, 0);
    bottom: 0;
  }
  10% {
    color: #54ff7c;
    transform: translate3D(0, -5%, 0); // Force GPU acceleration
  }
  100% {
    transform: translate3D(0, 0, 0);
    bottom: 0;
  }
}

@keyframes shinelight {
  0% {
    transform: translate3D(0, 0, 0);
    bottom: 0;
  }

  10% {
    color: #00d031;
    transform: translate3D(0, -5%, 0); // Force GPU acceleration
  }

  100% {
    transform: translate3D(0, 0, 0);
    bottom: 0;
  }
}

.word-block:not(.no-popup) {
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
  display: inline-block;
}

.show-quick-gloss .word-block .word-block-text-quick-gloss {
  display: inline;
}

.show-definition .word-block {
  position: relative;
}

/* Line style */

.show-pinyin .word-block-text,
.show-definition .word-block-text {
  position: relative;
}
.word-block-pinyin,
.word-block-definition {
  opacity: 0.7;
  margin: 0 0.1em 0.1em 0.1em;
  font-size: max(0.5em, 0.8rem);
  line-height: 1.33;
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

.word-block {
  transition: background-color 0.2s ease-in-out;
}

.word-block.highlighted {
  background-color: #88888888;
  color: white;
}
</style>
