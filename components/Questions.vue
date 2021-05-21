<template>
  <div id="questions-wrapper">
    <div v-if="!started" class="questions-prompt">
      <p>Get familiar with these words by engaging with them.</p>
      <button
        v-on:click="startClick()"
        class="btn"
        :data-bg-level="book"
        id="another-set-btn"
      >
        Start Learning
      </button>
    </div>
    <div v-if="started" id="questions" :key="wordsKey">
      <div class="questions-prompt">
        <div class="prompt">
          <b>Keep scrolling down</b> for questions and answers
        </div>
        <i class="glyphicon glyphicon-arrow-down scroll-down-arrow"></i>
      </div>
      <div v-for="(word, index) in words">
        <DecompositionQuestion
          :text="word.simplified"
          :pinyin="word.pinyin"
          :hsk="word.hsk"
          :definitions="word.definitions"
          class="simplified"
          :id="`word-${index}-decomposition-1`"
        ></DecompositionQuestion>
        <DecompositionQuestion
          :text="word.traditional"
          :pinyin="word.pinyin"
          :hsk="word.hsk"
          :definitions="word.definitions"
          class="traditional"
          :id="`word-${index}-decomposition-1`"
        ></DecompositionQuestion>
        <FillInTheBlankQuestion
          :text="word.simplified"
          :pinyin="word.pinyin"
          :hsk="word.hsk"
          class="simplified"
          :definitions="word.definitions"
          :id="`word-${index}-fill-in-the-blank`"
        ></FillInTheBlankQuestion>
        <FillInTheBlankQuestion
          :text="word.traditional"
          :pinyin="word.pinyin"
          :hsk="word.hsk"
          class="traditional"
          :definitions="word.definitions"
          :id="`word-${index}-fill-in-the-blank`"
        ></FillInTheBlankQuestion>
        <CollocationQuestion
          :word="word"
          :id="`word-${index}-collocation`"
        ></CollocationQuestion>
        <MakeSentenceQuestion
          :word="word"
          :id="`word-${index}-make-sentence`"
        ></MakeSentenceQuestion>
      </div>
      <div class="questions-prompt">
        <div class="prompt">
          <img src="/img/trophy.svg" class="trophy" />
          <p class="mt-4 mb-4">The End!</p>
        </div>
        <button
          v-on:click="tryAnotherClick()"
          class="btn"
          :data-bg-level="book"
          id="another-set-btn"
        >
          Try Another Set
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import CollocationQuestion from '@/components/questions/CollocationQuestion.vue'
import DecompositionQuestion from '@/components/questions/DecompositionQuestion.vue'
import FillInTheBlankQuestion from '@/components/questions/FillInTheBlankQuestion.vue'
import MakeSentenceQuestion from '@/components/questions/MakeSentenceQuestion.vue'
export default {
  props: {
    words: Array,
    book: {
      default: 'outside'
    }
  },
  components: {
    CollocationQuestion,
    DecompositionQuestion,
    FillInTheBlankQuestion,
    MakeSentenceQuestion
  },
  data() {
    return {
      started: false,
      wordsKey: 0
    }
  },
  methods: {
    randomQuestionType() {
      return this.questionTypes[
        Math.floor(Math.random() * this.questionTypes.length)
      ]
    },
    startClick() {
      this.started = true
    },
    regenQuestions() {
      let words = this.words
      this.words = []
      this.wordsKey += 1
      this.words = words
      this.wordsKey += 1
    },
    tryAnotherClick() {
      this.regenQuestions()
      if (this.words.length > 0) {
        $([document.documentElement, document.body]).animate(
          {
            scrollTop: $('#questions-wrapper').offset().top
          },
          1000
        )
      }
    }
  }
}
</script>

<style>
.question-slide {
  padding: 1rem;
  position: absolute;
  left: 0;
  right: 0;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.question-slide-aspect {
  padding-bottom: calc(100vh);
  position: relative;
  margin-bottom: 1rem;
}

.question-blank {
  border-bottom: 1px solid #999;
  min-width: 1em;
  display: inline-block;
}

.question-blank-sentence {
  display: block;
  border-bottom: 1px solid #999;
  max-width: 70%;
  height: 2rem;
  width: 70%;
}

.big-word-pinyin {
  font-weight: bold;
  color: #999;
}

.trophy {
  width: 5rem;
}

.scroll-down-arrow {
  color: #ccc;
  font-size: 3rem;
  margin-top: 2rem;
}

#questions-wrapper {
  box-shadow: 5px 5px 20px rgba(0, 0, 0, 0.2);
  border-radius: 0.5rem;
}

.questions-prompt {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 5rem;
  text-align: center;
}


.part.hide {
  background: #343a4082;
}

.show-answer .part.hide {
  background: inherit;
}

.part.hide > * {
  display: none;
}

.show-answer .part.hide > * {
  display: inherit;
}

.part.hide::after {
  content: 'What is missing here?';
  font-size: 0.8rem;
  color: white;
}

.show-answer .part.hide:after {
  content: '';
}

.question-image {
  max-width: 100%;
  max-height: 40vh;
  transform: rotate(-2deg);
  box-shadow: 5px 5px 20px rgba(0, 0, 0, 0.5);
  border: 0.5rem solid white;
}
</style>
