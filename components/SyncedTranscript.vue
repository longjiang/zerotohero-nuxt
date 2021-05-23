<template>
  <div class="synced-transcript">
    <div
      :class="{
        transcript: true,
        collapsed: collapse,
        'single-line': single,
      }"
      data-collapse-target
      :key="reviewKey"
    >
      <template v-for="(line, lineIndex) in lines">
        <div
          :key="lineIndex"
          :class="{
            'transcript-line': true,
            matched:
              !single &&
              highlight &&
              line &&
              new RegExp(highlight.join('|')).test(line.line),
            'transcript-line-current': currentLine === line,
          }"
          @click="seekVideoTo(line.starttime)"
          :id="`transcript-line-${id}-${lineIndex}`"
          v-if="!single || currentLine === line"
        >
          <b-button
            v-if="$settings.adminMode"
            class="btn btn-small bg-danger text-white"
            @click="removeLine(lineIndex)"
            style="float: right"
            ><i class="fa fa-trash"></i
          ></b-button>
          <Annotate tag="div" :sticky="sticky" class="transcript-line-chinese">
            <span
              v-html="
                highlight
                  ? Helper.highlightMultiple(
                      line.line,
                      highlight,
                      hsk || 'outside'
                    )
                  : line.line
              "
            />
          </Annotate>
          <div
            v-if="$l2.code !== $l1.code && parallellines"
            :class="{
              'transcript-line-l1': true,
              'text-right':
                $l2.scripts &&
                $l2.scripts.length > 0 &&
                $l2.scripts[0].direction === 'rtl',
            }"
          >
            <template
              v-for="parallelLine in parallellines.filter(
                (l) => l.starttime === line.starttime
              )"
            >
              <span v-html="parallelLine.line" />
            </template>
          </div>
        </div>
        <template v-if="review[lineIndex] && review[lineIndex].length > 0">
          <div class="review" v-for="reviewItem in review[lineIndex]">
            <h6>Pop Quiz</h6>
            <div class="review-item mt-2">
              <div
                v-if="$l2.code !== $l1.code && parallellines"
                :class="{
                  'transcript-line-l1': true,
                  'text-right':
                    $l2.scripts &&
                    $l2.scripts.length > 0 &&
                    $l2.scripts[0].direction === 'rtl',
                }"
              >
                <template
                  v-for="parallelLine in parallellines.filter(
                    (l) => l.starttime === reviewItem.line.starttime
                  )"
                >
                  <span v-html="parallelLine.line" />
                </template>
              </div>
              <Annotate tag="div" class="transcript-line-chinese">
                <span
                  v-if="$l2.han && $l2.code !== 'ja'"
                  v-html="
                    Helper.highlightMultiple(
                      reviewItem.line.line,
                      Helper.unique([
                        reviewItem.simplified,
                        reviewItem.traditional,
                      ]),
                      hsk
                    )
                  "
                />
                <span
                  v-else
                  v-html="
                    Helper.highlight(reviewItem.line.line, reviewItem.text, hsk)
                  "
                />
              </Annotate>
              <div class="mt-2">
                <button
                  v-for="answer in reviewItem.answers"
                  :class="{
                    btn: true,
                    'btn-small': true,
                    'bg-white': true,
                    'mr-2': true,
                    'review-answer': true,
                    checked: false,
                    'review-answer-correct': answer.correct,
                  }"
                  @click="answerClick"
                >
                  <template v-if="$l2.code === 'ja' || !$l2.han">{{
                    answer.text
                  }}</template>
                  <template v-else-if="$l2.han && $settings.useTraditional">{{
                    answer.traditional || answer.simplified
                  }}</template>
                  <template v-else-if="$l2.han && !$settings.useTraditional">{{
                    answer.simplified || answer.traditional
                  }}</template>
                </button>
              </div>
            </div>
          </div>
        </template>
      </template>
    </div>
    <ShowMoreButton v-if="collapse" :data-bg-level="hsk ? hsk : 'outside'"
      >Show More</ShowMoreButton
    >
  </div>
</template>

<script>
import Helper from '@/lib/helper'

export default {
  props: {
    quiz: {
      default: false,
    },
    sticky: {
      default: false,
    },
    single: {
      default: false,
    },
    lines: {
      type: Array,
    },
    parallellines: {
      default: false,
    },
    collapse: {
      default: false,
    },
    onSeek: {
      default: false,
    },
    onPause: {
      default: false,
    },
    highlight: {
      type: Array,
    },
    hsk: {
      default: 'outside',
    },
    highlightSavedWords: {
      default: true,
    },
    startLineIndex: {
      default: 0,
    },
    stopLineIndex: {
      default: -1,
    },
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
    $dictionary() {
      return this.$getDictionary();
    },
    $dictionaryName() {
      return this.$store.state.settings.dictionaryName;
    },
    $hanzi() {
      return this.$getHanzi();
    },
  },
  data() {
    return {
      sW: [],
      id: Helper.uniqueId(),
      Helper,
      currentTime: 0,
      currentLine: this.lines ? this.lines[this.startLineIndex] : undefined,
      review: {},
      paused: {},
      reviewKey: 0,
      neverPlayed: true,
    }
  },
  mounted() {
    if (this.highlightSavedWords) this.updateReview()
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type.startsWith("savedWords")){
        this.updateReview()
      }
    })
  },
  beforeDestroy() {
    // you may call unsubscribe to stop the subscription
    this.unsubscribe()
  },
  watch: {
    $settings() {
      if (this.highlightSavedWords) this.updateReview()
    },
    currentTime() {
      for (let lineIndex = this.lines.length - 1; lineIndex >= 0; lineIndex--) {
        let line = this.lines[lineIndex]
        if (
          parseFloat(line.starttime) <
          this.currentTime + 0.1 // current time marker passed the start time of the line
        ) {
          if (this.currentLine !== line) {
            // Pause video if passed stopLineIndex
            if (
              this.stopLineIndex > 0 &&
              lineIndex === this.stopLineIndex + 1
            ) {
              if (this.neverPlayed) {
                this.pauseVideo()
                this.neverPlayed = false
                this.seekVideoTo(this.currentTime - 0.1)
                return
              }
            }
            // Pause video if there's a pop quiz
            // if (this.review[lineIndex - 1] && this.review[lineIndex - 1].length > 0 && !this.paused[lineIndex - 1]) {
            //   this.pauseVideo()
            //   this.paused[lineIndex - 1] = true
            //   return
            // }
            this.scrollTo(lineIndex)
          }
          this.currentLine = line
          return
        }
      }
    },
  },
  methods: {
    removeLine(lineIndex) {
      this.lines.splice(lineIndex, 1)
      this.reviewKey++
    },
    answerClick(e) {
      $(e.target).addClass('checked')
      if ($(e.target).hasClass('review-answer-correct')) {
        $(e.target).parents('.review').addClass('show-answer')
      }
    },
    async findSimilarWords(text) {
      let words = await (await this.$getDictionary()).lookupFuzzy(text)
      words = words.filter((word) => word.head !== text)
      words = Helper.uniqueByValue(words, 'head')
      return words.sort(
        (a, b) =>
          Math.abs(a.head.length - text.length) -
          Math.abs(b.head.length - text.length)
      )
    },
    async updateReview() {
      let review = {}
      let lineOffset = 10 // Show review this number of lines after the first appearance of the word
      if (
        this.quiz &&
        this.$settings.showQuiz &&
        this.$root.savedWords &&
        this.$root.savedWords[this.$l2.code]
      ) {
        for (let savedWord of this.$root.savedWords[this.$l2.code]) {
          let word = await (await this.$getDictionary()).get(savedWord.id)
          if (word) {
            let seenLines = []
            for (let form of savedWord.forms
              .filter((form) => form && form !== '-')
              .sort((a, b) => b.length - a.length)) {
              for (let lineIndex in this.lines) {
                if (!seenLines.includes(lineIndex)) {
                  let line = this.lines[lineIndex]
                  if (
                    (this.$l2.continua && line.line.includes(form)) ||
                    (this.$l2.han &&
                      (line.line.includes(word.simplified) ||
                        line.line.includes(word.traditional))) ||
                    (!this.$l2.continua &&
                      (new RegExp(`[ .,:!?]${form}[ .,:!?]`, 'gi').test(
                        line.line
                      ) ||
                        new RegExp(`^${form}[ .,:!?]`, 'gi').test()))
                  ) {
                    let reviewIndex = Math.min(
                      Number(lineIndex) +
                        lineOffset +
                        Math.floor(form.length / 2),
                      this.lines.length - 1
                    )
                    let similarWords = await this.findSimilarWords(form)
                    if (similarWords.length < 2) {
                      for (let i of [1, 2]) {
                        let randomWord = await (await this.$getDictionary()).random()
                        similarWords.push(randomWord)
                      }
                    }
                    let answers = similarWords
                      .map((similarWord) => {
                        return {
                          text: similarWord.head,
                          simplified: similarWord.simplified,
                          traditional: similarWord.traditional,
                          correct: false,
                        }
                      })
                      .slice(0, 2)
                    answers.push({
                      text: form,
                      simplified: word.simplified,
                      traditional: word.traditional,
                      correct: true,
                    })
                    review[reviewIndex] = review[reviewIndex] || []
                    review[reviewIndex].push({
                      line: line,
                      text: form,
                      word: word,
                      simplified: word.simplified,
                      traditional: word.traditional,
                      answers: Helper.shuffle(answers),
                    })
                    seenLines.push(lineIndex)
                  }
                }
              }
            }
          }
        }
      }
      this.review = review
      this.reviewKey++
    },
    seekVideoTo(starttime) {
      if (this.onSeek) {
        this.onSeek(starttime)
      }
    },
    pauseVideo() {
      if (this.onPause) {
        this.onPause()
      }
    },
    scrollTo(lineIndex) {
      let el = document.getElementById(
        `transcript-line-${this.id}-${lineIndex}`
      )
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    },
    previousLine() {
      let currentLineIndex = this.lines.findIndex(
        (line) => line === this.currentLine
      )
      let previousLineIndex = Math.max(currentLineIndex - 1, 0)
      this.currentLine = this.lines[previousLineIndex]
      this.seekVideoTo(this.currentLine.starttime)
      this.scrollTo(previousLineIndex)
    },
    nextLine() {
      let currentLineIndex = this.lines.findIndex(
        (line) => line === this.currentLine
      )
      let nextLineIndex = Math.min(currentLineIndex + 1, this.lines.length - 1)
      this.currentLine = this.lines[nextLineIndex]
      this.seekVideoTo(this.currentLine.starttime)
      this.scrollTo(nextLineIndex)
    },
  },
}
</script>

<style lang="scss">
.transcript.collapsed .transcript-line:nth-child(n + 6) {
  display: none;
}

.transcript.single-line .transcript-line:not(.transcript-line-current) {
  display: none;
}

.transcript-line {
  cursor: pointer;
  position: relative;
  color: #666;
  font-size: 1.2rem;
  padding: 0.5rem;
}

.transcript-line-current {
  box-shadow: 0 0 10px rgba(255, 95, 32, 0.301);
  border-radius: 0.25rem;
}

.single-line .transcript-line-current {
  box-shadow: none;
}

.transcript-line.matched {
  color: #616161;
  font-weight: bold;
}

.transcript-title {
  font-weight: bold;
  font-size: 1.5rem;
}

.transcript-line-l1 {
  color: #aaa;
  font-style: italic;
  font-size: 0.8em;
  display: none;
}
.show-translation .transcript-line-l1 {
  display: inherit;
}

.review {
  margin: 0.5rem 0;
  padding: 1rem;
  background-color: #f3f3f3;
  border-radius: 0.5rem;
  &.show-answer {
    background-color: #d6f5d8;
  }
}

.review:not(.show-answer) {
  .highlight {
    background-color: #ccc;
    border-radius: 0.2rem;
  }
  .highlight * {
    opacity: 0;
    pointer-events: none;
  }
}

.review-answer {
  border: 1px solid #999;
}

.review-answer.checked:not(.review-answer-correct) {
  background-color: #dc3838 !important;
  border-color: #a03030 !important;
  color: white !important;
}

.review-answer.checked.review-answer-correct {
  background-color: #63ab67 !important;
  border-color: #36823b !important;
  color: white !important;
}
</style>