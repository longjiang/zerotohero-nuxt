<template>
  <div id="jw-study-aid-questions-app">
    <span class="throbber-loader" v-bind:class="{ hidden: dataLoaded }">
      Loading&#8230;
    </span>
    <div class="question-card-deck">
      <div
        class="question-card revealed"
        v-for="(question, index) in questions"
        v-on:click="flip"
        :key="index"
      >
        <template v-if="question.type === 'article'">
          <div class="question-card-question front">
            <div class="question-card-question-prompt">
              'Question:'
            </div>
            <div class="question-card-question-question">
              {{ question.question }}
            </div>
          </div>
          <div class="question-card-answer back" v-html="question.answer"></div>
        </template>
        <template v-if="question.type === 'glossary'">
          <div class="question-card-term front">
            <div class="question-card-term-prompt">
              'Define this term:'
            </div>
            <div class="question-card-term-term">{{ question.term }}</div>
          </div>
          <div
            class="question-card-definition back"
            v-html="question.definition"
          ></div>
        </template>
        <template v-if="question.type === 'picture'">
          <div class="question-card-image front">
            <div class="question-card-image-prompt">
              "What can you tell about this picture?"
            </div>
            <img :src="question.image" />
          </div>
          <div
            class="question-card-caption back"
            v-html="question.caption"
          ></div>
        </template>
        <template v-if="question.type === 'scripture-front'">
          <div class="question-card-term front">
            <div class="question-card-term-prompt">
              What does this scripture say?
            </div>
            <div class="question-card-term-term">{{ question.caption }}</div>
          </div>
          <div
            class="question-card-definition back"
            v-html="question.scripture"
          ></div>
        </template>
        <template v-if="question.type === 'scripture-back'">
          <div class="question-card-question front">
            <div class="question-card-question-prompt">
              'Where does this scripture come from?'
            </div>
            <div
              class="question-card-question-scripture"
              v-html="question.scripture"
            ></div>
          </div>
          <div class="question-card-term back">
            <div class="question-card-term-term">{{ question.caption }}</div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import MixedQuestionSource from "@/lib/MixedQuestionSource";

export default {
  props: {
    questionSource: undefined,
    articles: undefined,
  },
  mounted() {
    this.getQuestions();
  },
  data() {
    return {
      questions: [],
      dataLoaded: false,
    };
  },
  methods: {
    flip: function (event) {
      if (event) {
        if ($(event.target).is(".question-card")) {
          $(event.target).toggleClass("revealed");
        } else {
          $(event.target).parents(".question-card").toggleClass("revealed");
        }
      }
    },

    getQuestions() {
      if (!this.questionSource && this.articles) {
        this.questionSource = new MixedQuestionSource(articles);
      }
      if (this.questionSource) {
        this.questionSource.getQuestions(function (questions) {
          $(selector + " .throbber-loader").remove();
          this.quizVue.questions = questions;
        });
      }
    }, // getQuestions();
    setQuestionSource(questionSource) {
      this.questionSource = questionSource;
      this.quizVue.getQuestions();
    },
    getQuizVue() {
      var selector = "#jw-study-aid-questions-app";
      return new Vue({
        el: selector,
      });
    },
  },
};
</script>

<style>
#jw-study-aid-questions-app .throbber-loader {
    margin-bottom: 2rem;
}

#jw-study-aid-questions-app .question-card {
    box-shadow: 0 0 15px rgba(0,0,0,0.2);
    padding: 2rem;
    height: calc(100vh);
    max-height: 20rem;
    overflow: hidden;
    margin-bottom: 2rem;
}

#jw-study-aid-questions-app .question-card.revealed .back {
    display: none;
}

#jw-study-aid-questions-app .question-card:not(.revealed) .front {
    display: none;
}

#jw-study-aid-questions-app .question-card-image {
    text-align: center;
    display: flex;
    flex-direction: column;
    position: relative;
    height: 100%;
    justify-content: center;
}



#jw-study-aid-questions-app .question-card-question,
#jw-study-aid-questions-app .question-card-definition {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
}

#jw-study-aid-questions-app .question-card-image .question-card-image-prompt {
    flex: 1;
    flex-grow: 0;
    margin-bottom: 0.5rem;
}

#jw-study-aid-questions-app .question-card-image img {
    flex: 1;
    object-fit: contain;
    flex-grow: 0;
    max-height: calc(100% - 1rem);
}

#jw-study-aid-questions-app .question-card-question {
    text-align: center;
    font-size: 1.15em;
}

#jw-study-aid-questions-app .question-card-question-scripture {
    max-height:calc(100% - 2rem);
    overflow-y: scroll;
}

#jw-study-aid-questions-app .question-card-term,
#jw-study-aid-questions-app .question-card-caption {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    text-align: center;
    align-items: center;
    justify-content: center;
}

#jw-study-aid-questions-app .question-card-definition {
    display: flex;
    flex-direction: column;
}

#jw-study-aid-questions-app .question-card-answer,
#jw-study-aid-questions-app .question-card-definition {
    height: 100%;
    align-items: center;
    overflow: scroll;
    justify-content: center;
}

#jw-study-aid-questions-app .question-card-term-term {
    font-size: 1.7em;
    font-weight: bold;
    line-height: 1.2;
    margin-top: 1rem;
}

#jw-study-aid-questions-app .question-card-question-prompt {
    font-weight: bold;
    margin-bottom: 1rem;
}

#jw-study-aid-questions-app #jw-study-aid-questions-app {
    margin-bottom: 3rem;
}

.question-card-question-scripture .sl {
    display: block;
}

.question.obscure {
  background: #999;
  color: #999;
}

.question {
  cursor: pointer;
  background: #f1f1f1;
  border-radius: 0.3rem;
  border: 1px solid #afafaf;
  padding-left: 2rem !important;
  margin-left: 0 !important;
}

.question.obscure::after {
  color: #d2d2d2;
  position: absolute;
  width: 100%;
  text-align: center;
  left: 0;
}


</style>