<!-- /pages/_l1/_l2/saved-words-games.vue -->
<template>
  <div class="main pb-5" v-cloak>
    <div class="container">
      <div class="row">
        <div class="col-sm-12">

          <!-- Loading state -->
          <div v-if="loading" class="text-center my-5">
            <Loader :sticky="true" :message="$t('Loading your saved words...')" />
          </div>

          <div v-else>
            <!-- Word pool info -->
            <div class="mb-4 text-muted text-center" v-if="words.length">
              <i class="fas fa-database mr-2"></i>
              {{ $t("You have {count} saved words ready to practice.", { count: words.length }) }}
            </div>

            <!-- Game mode selection & controls -->
            <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
              <b-button-group>
                <b-button
                  v-for="mode in gameModes"
                  :key="mode.key"
                  :variant="currentGameMode === mode.key ? 'success' : 'outline-secondary'"
                  @click="setGameMode(mode.key)"
                  class="mr-1 mb-1"
                >
                  <i :class="mode.icon" class="mr-1"></i>
                  {{ $t(mode.label) }}
                </b-button>
              </b-button-group>

              <div>
                <b-button variant="primary" @click="startNewGame" class="mr-2">
                  <i class="fas fa-sync-alt mr-1"></i>
                  {{ $t("New Game") }}
                </b-button>
                <b-button variant="outline-danger" @click="resetProgress" v-if="hasGameProgress">
                  <i class="fas fa-trash-alt mr-1"></i>
                  {{ $t("Reset Progress") }}
                </b-button>
              </div>
            </div>

            <!-- Game specific UI -->
            <div class="game-card card p-4 shadow-sm">
              <!-- Flashcard game -->
              <div v-if="currentGameMode === 'flashcard'">
                <div class="text-center">
                  <div class="flashcard mb-4" :class="{ flipped: showAnswer }" @click="toggleAnswer">
                    <div class="flashcard-front">
                      <h2 class="mb-3">{{ displayWord(currentWord) }}</h2>
                      <small class="text-muted">{{ $t("Tap to reveal answer") }}</small>
                    </div>
                    <div class="flashcard-back">
                      <div class="pronunciation mb-2" v-if="displayPronunciation(currentWord)">
                        <i class="fas fa-volume-up"></i> {{ displayPronunciation(currentWord) }}
                      </div>
                      <div class="definitions mb-2">
                        <div v-for="def in currentWord.definitions" :key="def" class="def-item">
                          {{ def }}
                        </div>
                      </div>
                      <div v-if="currentWord.gender" class="gender small">
                        {{ $t("Gender") }}: {{ currentWord.gender }}
                      </div>
                      <div v-if="currentWord.saved?.context?.text" class="context small text-muted mt-2">
                        <i class="fas fa-quote-left mr-1"></i> {{ currentWord.saved.context.text }}
                      </div>
                    </div>
                  </div>

                  <div class="button-group">
                    <b-button variant="danger" @click="markKnown(false)" class="mr-2">
                      <i class="fas fa-times mr-1"></i> {{ $t("Forgot") }}
                    </b-button>
                    <b-button variant="success" @click="markKnown(true)">
                      <i class="fas fa-check mr-1"></i> {{ $t("Remembered") }}
                    </b-button>
                  </div>

                  <div class="progress mt-4">
                    <div class="progress-bar bg-success" role="progressbar" :style="{ width: completionPercentage + '%' }">
                      {{ completionPercentage }}%
                    </div>
                  </div>
                </div>
              </div>

              <!-- Multiple Choice game -->
              <div v-if="currentGameMode === 'multiple-choice'">
                <div class="text-center">
                  <div class="question mb-4">
                    <h4>{{ $t("What is the meaning of:") }}</h4>
                    <h2 class="word-display">{{ displayWord(currentWord) }}</h2>
                    <div v-if="currentWord.saved?.context?.text" class="context-sentence text-muted mt-2">
                      <i class="fas fa-quote-left mr-1"></i> {{ currentWord.saved.context.text }}
                    </div>
                  </div>

                  <div class="options-grid">
                    <b-button
                      v-for="(option, idx) in currentOptions"
                      :key="idx"
                      variant="outline-primary"
                      class="option-btn mb-2"
                      @click="submitAnswer(option)"
                      :disabled="answerLocked"
                    >
                      {{ option }}
                    </b-button>
                  </div>

                  <div v-if="answerFeedback" class="mt-3 alert" :class="answerIsCorrect ? 'alert-success' : 'alert-danger'">
                    <i :class="answerIsCorrect ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                    {{ answerFeedback }}
                  </div>

                  <div class="next-btn mt-3" v-if="answerLocked">
                    <b-button variant="primary" @click="nextQuestion">
                      {{ $t("Next Word") }}
                    </b-button>
                  </div>

                  <div class="progress mt-4">
                    <div class="progress-bar bg-info" role="progressbar" :style="{ width: (answeredCount / words.length) * 100 + '%' }">
                      {{ answeredCount }} / {{ words.length }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Typing / Spelling game with blank sentence -->
              <div v-if="currentGameMode === 'spelling'">
                <div class="text-center">
                  <div class="question mb-4">
                    <h4>{{ $t("Type the word for:") }}</h4>
                    <div class="definition-prompt p-3 bg-light rounded">
                      <div v-for="def in currentWord.definitions" :key="def" class="def-item">
                        {{ def }}
                      </div>
                    </div>

                    <!-- Improved context sentence with blank instead of missing word -->
                    <div v-if="sentenceWithBlank" class="context-sentence text-muted mt-3">
                      <i class="fas fa-quote-left mr-1"></i> 
                      <span v-html="sentenceWithBlank"></span>
                      <div class="small text-info mt-2">
                        <i class="fas fa-lightbulb"></i> 
                        {{ $t("Missing word has {n} characters", { n: wordLengthHint }) }}
                      </div>
                    </div>
                    <div v-else-if="currentWord.saved?.context?.text" class="context-sentence text-muted mt-3">
                      <i class="fas fa-quote-left mr-1"></i> {{ currentWord.saved.context.text }}
                      <div class="small text-warning mt-1">{{ $t("(Target word not found in sentence – type the word above)") }}</div>
                    </div>

                    <b-button variant="link" @click="speakWord" v-if="hasTTS" class="mt-2">
                      <i class="fas fa-volume-up"></i> {{ $t("Listen") }}
                    </b-button>
                    <b-button variant="link" @click="revealLetter" class="mt-2 ml-2" v-if="!answerLocked">
                      <i class="fas fa-font"></i> {{ $t("Reveal First Letter") }}
                    </b-button>
                  </div>

                  <b-form-input
                    id="typed-answer"
                    v-model="userTypedAnswer"
                    :placeholder="$t('Type the word...')"
                    class="mb-3 text-center"
                    @keyup.enter="submitTypedAnswer"
                    :disabled="answerLocked"
                    autocomplete="off"
                  ></b-form-input>

                  <b-button variant="success" @click="submitTypedAnswer" :disabled="answerLocked">
                    {{ $t("Check") }}
                  </b-button>

                  <div v-if="answerFeedback" class="mt-3 alert" :class="answerIsCorrect ? 'alert-success' : 'alert-danger'">
                    <i :class="answerIsCorrect ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                    {{ answerFeedback }}
                    <div v-if="!answerIsCorrect" class="mt-1">
                      {{ $t("Correct answer: {word}", { word: displayWord(currentWord) }) }}
                    </div>
                  </div>

                  <div class="next-btn mt-3" v-if="answerLocked">
                    <b-button variant="primary" @click="nextQuestion">
                      {{ $t("Next Word") }}
                    </b-button>
                  </div>

                  <div class="progress mt-4">
                    <div class="progress-bar bg-info" role="progressbar" :style="{ width: (answeredCount / words.length) * 100 + '%' }">
                      {{ answeredCount }} / {{ words.length }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- End of game summary -->
              <div v-if="gameFinished" class="text-center">
                <h3 class="text-success mb-3">{{ $t("Game Completed!") }}</h3>
                <p>{{ $t("You scored {score} out of {total}", { score: correctCount, total: words.length }) }}</p>
                <div class="mt-4">
                  <b-button variant="primary" @click="startNewGame">
                    {{ $t("Play Again") }}
                  </b-button>
                  <b-button variant="outline-secondary" @click="reshuffleAndRestart" class="ml-2">
                    {{ $t("Same Mode, New Order") }}
                  </b-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { timeout, SpeechSingleton } from "../../../lib/utils";
import Loader from "../../../components/Loader";

export default {
  components: { Loader },
  data() {
    return {
      loading: true,            // true while building words array
      dictionaryLoaded: false,  // true after $getDictionary() resolves
      words: [],
      gameModes: [
        { key: "flashcard", label: "Flashcards", icon: "fas fa-layer-group" },
        { key: "multiple-choice", label: "Multiple Choice", icon: "fas fa-tasks" },
        { key: "spelling", label: "Spelling / Typing", icon: "fas fa-keyboard" },
      ],
      currentGameMode: "flashcard",
      currentIndex: 0,
      wordOrder: [],
      showAnswer: false,
      answerLocked: false,
      answerFeedback: "",
      answerIsCorrect: false,
      userTypedAnswer: "",
      currentOptions: [],
      correctCount: 0,
      answeredCount: 0,
      gameFinished: false,
      hasTTS: false,
      savedWordsReady: false,   // internal flag to avoid duplicate loads
    };
  },
  computed: {
    savedWordsLoaded() {
      return this.$store.state.savedWords.savedWordsLoaded;
    },
    currentWord() {
      if (!this.wordOrder.length) return {};
      const idx = this.wordOrder[this.currentIndex];
      return this.words[idx] || {};
    },
    completionPercentage() {
      if (!this.wordOrder.length) return 0;
      return Math.floor((this.currentIndex / this.wordOrder.length) * 100);
    },
    hasGameProgress() {
      return localStorage.getItem(`gameProgress_${this.$l2?.code}`) !== null;
    },
    sentenceWithBlank() {
      const context = this.currentWord.saved?.context;
      if (!context || !context.text) return null;
      let sentence = context.text;
      const targetForm = context.form || this.displayWord(this.currentWord);
      if (!targetForm) return null;
      const escapedForm = targetForm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedForm})`, 'i');
      const blankHtml = `<span class="blank-word" title="${this.$t('Type the missing word')}">__________</span>`;
      const replaced = sentence.replace(regex, blankHtml);
      if (replaced === sentence) return null;
      return replaced;
    },
    wordLengthHint() {
      const target = this.currentWord.saved?.context?.form || this.displayWord(this.currentWord);
      return target ? target.length : 0;
    },
  },
  async mounted() {
    // 1. Wait for dictionary to be ready
    await this.$getDictionary();
    this.dictionaryLoaded = true;

    // 2. Ensure saved words are loaded into Vuex
    if (!this.savedWordsLoaded) {
      await this.$store.dispatch('savedWords/load');
    }
    // 3. Now load the enriched word list
    await this.loadSavedWords();
    this.checkTTS();
    // 4. Start game only if we have words
    if (this.words.length) {
      this.startNewGame();
    }
  },
  methods: {
    displayWord(word) {
      if (!word) return "";
      if (this.$l2?.code === "ja") {
        return word.kanji || word.kana || word.head || word.word;
      }
      if (this.$l2?.code === "zh") {
        return word.simplified || word.head || word.word;
      }
      if (this.$l2?.code === "ko") {
        return word.hangul || word.head || word.word;
      }
      return word.head || word.word;
    },

    displayPronunciation(word) {
      if (!word) return "";
      if (this.$l2?.code === "ja") {
        return word.romaji || word.kana || word.pronunciation;
      }
      if (this.$l2?.code === "zh") {
        return word.pinyin || word.pronunciation;
      }
      if (this.$l2?.code === "ko") {
        return word.romaja || word.pronunciation;
      }
      return word.pronunciation || "";
    },

    async loadSavedWords() {
      this.loading = true;
      const savedWordsStore = this.$store.state.savedWords.savedWords[this.$l2?.code];
      if (!savedWordsStore || savedWordsStore.length === 0) {
        this.words = [];
        this.loading = false;
        return;
      }

      const dictionary = await this.$getDictionary();
      const enriched = [];
      for (const saved of savedWordsStore) {
        let word = await dictionary.get(saved.id, saved.forms?.[0]);
        if (!word && saved.forms?.[0]) {
          word = await dictionary.lookup(saved.forms[0]);
        }
        if (word) {
          word.saved = saved;
          enriched.push(word);
        }
      }
      this.words = enriched;
      this.loading = false;
    },

    checkTTS() {
      const voices = SpeechSingleton.instance?.getVoices(this.$l2?.code);
      this.hasTTS = voices && voices.length > 0;
    },

    startNewGame() {
      if (!this.words.length) return;
      this.wordOrder = this.words.map((_, idx) => idx);
      this.shuffleArray(this.wordOrder);
      this.currentIndex = 0;
      this.correctCount = 0;
      this.answeredCount = 0;
      this.gameFinished = false;
      this.resetQuestionState();
      if (this.currentGameMode === "multiple-choice") {
        this.currentOptions = this.generateOptions();
      }
    },

    reshuffleAndRestart() {
      if (!this.words.length) return;
      this.shuffleArray(this.wordOrder);
      this.currentIndex = 0;
      this.correctCount = 0;
      this.answeredCount = 0;
      this.gameFinished = false;
      this.resetQuestionState();
      if (this.currentGameMode === "multiple-choice") {
        this.currentOptions = this.generateOptions();
      }
    },

    shuffleArray(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    },

    setGameMode(mode) {
      this.currentGameMode = mode;
      this.startNewGame();
    },

    resetQuestionState() {
      this.showAnswer = false;
      this.answerLocked = false;
      this.answerFeedback = "";
      this.answerIsCorrect = false;
      this.userTypedAnswer = "";
      this.currentOptions = [];
    },

    // Flashcard
    toggleAnswer() {
      if (!this.answerLocked) this.showAnswer = !this.showAnswer;
    },

    markKnown(remembered) {
      if (this.answerLocked) return;
      this.answerLocked = true;
      if (remembered) {
        this.correctCount++;
        this.answerFeedback = this.$t("Great! You remembered this word.");
        this.answerIsCorrect = true;
      } else {
        this.answerFeedback = this.$t("Keep practicing! We'll show this word again.");
        this.answerIsCorrect = false;
      }
      this.answeredCount++;
      this.advanceAfterDelay();
    },

    // Multiple Choice
    generateOptions() {
      const otherWords = this.words.filter((_, idx) => idx !== this.wordOrder[this.currentIndex]);
      const shuffledOthers = [...otherWords];
      this.shuffleArray(shuffledOthers);
      const options = shuffledOthers.slice(0, 3).map(w => this.displayDefinitionPreview(w));
      const correctAnswer = this.displayDefinitionPreview(this.currentWord);
      options.push(correctAnswer);
      this.shuffleArray(options);
      return options;
    },

    displayDefinitionPreview(word) {
      if (word.definitions && word.definitions.length) {
        return word.definitions[0];
      }
      return this.displayWord(word);
    },

    submitAnswer(selectedOption) {
      if (this.answerLocked) return;
      const correct = this.displayDefinitionPreview(this.currentWord);
      this.answerIsCorrect = (selectedOption === correct);
      this.answerLocked = true;
      this.answeredCount++;
      if (this.answerIsCorrect) {
        this.correctCount++;
        this.answerFeedback = this.$t("Correct! +1 point");
      } else {
        this.answerFeedback = this.$t("Wrong! The correct meaning is: {meaning}", { meaning: correct });
      }
      this.advanceAfterDelay();
    },

    // Spelling game
    speakWord() {
      if (!this.hasTTS) return;
      const text = this.displayWord(this.currentWord);
      SpeechSingleton.instance.speak({ l2: this.$l2, text });
    },

    revealLetter() {
      const target = this.currentWord.saved?.context?.form || this.displayWord(this.currentWord);
      if (!target) return;
      const firstLetter = target.charAt(0);
      if (this.$toast) {
        this.$toast.info(this.$t("First letter: {letter}", { letter: firstLetter }), { duration: 2000 });
      } else {
        alert(this.$t("First letter: {letter}", { letter: firstLetter }));
      }
    },

    submitTypedAnswer() {
      if (this.answerLocked) return;
      const userAnswer = this.userTypedAnswer.trim().toLowerCase();
      const targetForm = this.currentWord.saved?.context?.form || this.displayWord(this.currentWord);
      const correct = targetForm.toLowerCase();
      const isCorrect = userAnswer === correct;
      this.answerIsCorrect = isCorrect;
      this.answerLocked = true;
      this.answeredCount++;
      if (isCorrect) {
        this.correctCount++;
        this.answerFeedback = this.$t("Perfect! You spelled it right.");
      } else {
        this.answerFeedback = this.$t("Incorrect spelling.");
      }
      this.advanceAfterDelay();
    },

    advanceAfterDelay() {
      setTimeout(() => {
        this.nextQuestion();
      }, 1500);
    },

    nextQuestion() {
      if (this.currentIndex + 1 < this.wordOrder.length) {
        this.currentIndex++;
        this.resetQuestionState();
        if (this.currentGameMode === "multiple-choice") {
          this.currentOptions = this.generateOptions();
        }
      } else {
        this.gameFinished = true;
        this.storeProgress();
      }
    },

    storeProgress() {
      const progress = {
        lastPlayed: Date.now(),
        mode: this.currentGameMode,
        score: this.correctCount,
        total: this.words.length,
      };
      localStorage.setItem(`gameProgress_${this.$l2?.code}`, JSON.stringify(progress));
    },

    resetProgress() {
      localStorage.removeItem(`gameProgress_${this.$l2?.code}`);
      if (this.$toast) this.$toast.success(this.$t("Game progress reset"), { duration: 2000 });
      this.startNewGame();
    },
  },
  watch: {
    currentGameMode() {
      if (this.currentGameMode === "multiple-choice" && this.currentWord && Object.keys(this.currentWord).length) {
        this.currentOptions = this.generateOptions();
      }
    },
    currentWord: {
      immediate: true,
      handler(newWord) {
        if (this.currentGameMode === "multiple-choice" && newWord && Object.keys(newWord).length) {
          this.currentOptions = this.generateOptions();
        }
      },
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/variables.scss";

// Shared variables / overrides
$card-radius: 1rem;
$transition-speed: 0.2s;

.gap-2 {
  gap: 0.5rem;
}

.game-card {
  min-height: 450px;
  transition: all $transition-speed ease;
  border-radius: $card-radius;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.05);
  border: 1px solid transparent;
}

// Light mode card styling
.skin-light .game-card {
  background-color: $bg-color-light-1;
  border-color: $bg-color-light-3;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.05);
}

// Dark mode card styling
.skin-dark .game-card {
  background-color: $bg-color-dark-2;
  border-color: $bg-color-dark-4;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.3);
}

// Flashcard improvements
.flashcard {
  perspective: 1000px;
  height: 320px;
  cursor: pointer;
  position: relative;
  width: 100%;
  max-width: 550px;
  margin: 1rem auto;

  .flashcard-front,
  .flashcard-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    border-radius: $card-radius;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    transition: transform 0.5s ease;
    box-shadow: 0 0.8rem 1.5rem rgba(0, 0, 0, 0.15);
  }

  .flashcard-front {
    background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
    transform: rotateY(0deg);
    border: 1px solid rgba(0, 0, 0, 0.05);
  }

  .flashcard-back {
    background: linear-gradient(145deg, $primary-color 0%, darken($primary-color, 8%) 100%);
    color: white;
    transform: rotateY(180deg);
  }

  &.flipped .flashcard-front {
    transform: rotateY(180deg);
  }

  &.flipped .flashcard-back {
    transform: rotateY(0deg);
  }
}

// Dark mode flashcard
.skin-dark .flashcard .flashcard-front {
  background: linear-gradient(145deg, #2c2c2e 0%, #1c1c1e 100%);
  color: #eee;
  border-color: rgba(255, 255, 255, 0.1);
}

// Word display
.word-display {
  font-size: 2.2rem;
  font-weight: 700;
  background: rgba($primary-color, 0.1);
  display: inline-block;
  padding: 0.5rem 1.8rem;
  border-radius: 3rem;
  letter-spacing: 0.02em;
}

.skin-dark .word-display {
  background: rgba($primary-color, 0.25);
  color: #fff;
}

// Context sentence styling
.context-sentence {
  font-style: italic;
  font-size: 0.9rem;
  background: rgba(0, 0, 0, 0.03);
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  max-width: 90%;
  margin: 0.5rem auto;
}

.skin-dark .context-sentence {
  background: rgba(255, 255, 255, 0.05);
}

// Blank word styling (spelling game)
.blank-word {
  display: inline-block;
  min-width: 120px;
  border-bottom: 2px dashed currentColor;
  background: repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(0,0,0,0.05) 8px, rgba(0,0,0,0.05) 16px);
  letter-spacing: 1px;
  font-weight: bold;
  text-align: center;
  color: $primary-color;
}

.skin-dark .blank-word {
  background: repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.1) 8px, rgba(255,255,255,0.1) 16px);
  color: lighten($primary-color, 20%);
}

// Definition prompt (spelling game)
.definition-prompt {
  font-size: 1.1rem;
  line-height: 1.5;
  background: $bg-color-light-2 !important;
  padding: 1rem;
  border-radius: 1rem;
  text-align: left;
}

.skin-dark .definition-prompt {
  background: $bg-color-dark-3 !important;
  color: #ddd;
}

// Multiple choice options grid
.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  max-width: 700px;
  margin: 1rem auto;
}

.option-btn {
  white-space: normal;
  word-break: break-word;
  text-align: center;
  padding: 0.75rem 1rem;
  border-radius: 2rem;
  font-weight: 500;
  transition: all 0.15s ease;
  border-width: 1px;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1);
  }
  
  &:active:not(:disabled) {
    transform: translateY(1px);
  }
}

// Typing input
#typed-answer {
  font-size: 1.2rem;
  text-align: center;
  border-radius: 2rem;
  padding: 0.75rem 1.5rem;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
  
  &:focus {
    border-color: $primary-color;
    box-shadow: 0 0 0 0.2rem rgba($primary-color, 0.25);
  }
}

.skin-dark #typed-answer {
  background-color: $bg-color-dark-3;
  border-color: $bg-color-dark-4;
  color: white;
}

// Progress bar customization
.progress {
  height: 0.6rem;
  border-radius: 1rem;
  background-color: rgba(0, 0, 0, 0.1);
  
  .progress-bar {
    border-radius: 1rem;
    background-color: $primary-color;
    transition: width 0.3s ease;
  }
}

.skin-dark .progress {
  background-color: rgba(255, 255, 255, 0.15);
}

// Alert feedback styling
.alert {
  border-radius: 2rem;
  padding: 0.75rem 1.25rem;
  font-weight: 500;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  
  i {
    margin-right: 0.5rem;
  }
}

.alert-success {
  background-color: rgba($primary-color, 0.15);
  border-color: rgba($primary-color, 0.3);
  color: $primary-color;
}

.skin-dark .alert-success {
  background-color: rgba($primary-color, 0.25);
  color: lighten($primary-color, 15%);
}

.alert-danger {
  background-color: rgba(220, 53, 69, 0.15);
  border-color: rgba(220, 53, 69, 0.3);
  color: #dc3545;
}

// Pronunciations & gender badges
.pronunciation {
  font-family: monospace;
  font-size: 0.9rem;
  background: rgba(0, 0, 0, 0.05);
  display: inline-block;
  padding: 0.2rem 0.8rem;
  border-radius: 2rem;
}

.skin-dark .pronunciation {
  background: rgba(255, 255, 255, 0.1);
}

.gender {
  font-size: 0.8rem;
  text-transform: uppercase;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.2rem 0.6rem;
  border-radius: 1rem;
  display: inline-block;
}

// Responsive adjustments
@media (max-width: 768px) {
  .flashcard {
    height: 280px;
    
    .flashcard-front, .flashcard-back {
      padding: 1rem;
    }
  }
  
  .word-display {
    font-size: 1.5rem;
    padding: 0.3rem 1rem;
  }
  
  .options-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .button-group .btn {
    min-width: 100px;
    padding: 0.4rem 0.8rem;
  }
  
  .game-card {
    padding: 1rem !important;
  }
  
  .blank-word {
    min-width: 80px;
  }
}

// Animation for wrong answer (shake)
.wrong {
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes shake {
  10%, 90% { transform: translate3d(-2px, 0, 0); }
  20%, 80% { transform: translate3d(3px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-5px, 0, 0); }
  40%, 60% { transform: translate3d(5px, 0, 0); }
}

// Pulse effect on correct answer (optional, can be added when needed)
.correct-pulse {
  animation: pulse 0.4s ease-in-out;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); background-color: rgba($primary-color, 0.2); }
  100% { transform: scale(1); }
}
</style>