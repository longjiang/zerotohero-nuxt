<template>
  <button
    :class="reviewAnswerClasses"
    style="position: relative"
    @click="answered()"
  >
    <template v-if="$l2.code === 'ja' || !$l2.han">
      {{ answer.text }}
    </template>
    <template v-else-if="$l2.han && $useTraditional">
      {{ answer.traditional || answer.simplified }}
    </template>
    <template v-else-if="$l2.han && !$useTraditional">
      {{ answer.simplified || answer.traditional }}
    </template>
    <div v-if="checked && answer.correct" class="sparkles" style="position: relative;">
      <div style="position: absolute; width: 5rem; height: 4rem; left: calc(50% - 2.5rem); top: -3rem;">
        <img
          src="/img/sparkle.svg"
          class="sparkle sparkle-1"
          style="position: absolute; height: 38px; left: 50%; top: 0"
        />
        <img
          src="/img/sparkle.svg"
          class="sparkle sparkle-2"
          style="position: absolute; height: 30px; right: 0; bottom: 0"
        />
        <img
          src="/img/sparkle.svg"
          class="sparkle sparkle-3"
          style="position: absolute; height: 60px; left: 0%; top: 10%"
        />
      </div>
    </div>
  </button>
</template>

        
<script>

export default {
  props: {
    answer: {
      type: Object,
    },
    skin: {
      default: "light",
    },
  },
  data() {
    return {
      checked: false,
    };
  },
  methods: {
    answered() {
      this.checked = true;
      this.$emit("answered");
    },
  },
  computed: {
    $useTraditional() {
      if (typeof this.$l2Settings !== "undefined")
        return this.$l2Settings.useTraditional;
    },
    reviewAnswerClasses() {
      return {
        'btn': true,
        'review-answer': true,
        'checked': this.checked,
        'review-answer-light': this.$skin === 'light',
        'review-answer-dark': this.$skin === 'dark',
        'btn-ghost-dark': this.$skin === 'dark',
        'review-answer-correct': this.answer.correct,
      }
    }
  },
};
</script>
        
<style lang="scss" scoped>
.review-answer,
.review-answer:hover {
  &.review-answer-light {
    border: 1px solid #c6c6c6;
    background-color: white;
  }
  padding: 0.1rem 0.3rem;
  font-size: 0.9em;
  min-width: 5rem;
  margin-right: 0.5rem;
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

.sparkles {
  pointer-events: one;
  .sparkle {
    opacity: 0;
  }
}

.sparkle {
  animation-name: sparkle;
  animation-iteration-count: 1;
  animation-duration: 1s;
  animation-timing-function: ease-in-out;
  &.sparkle-1 {
    animation-delay: 0;
  }
  &.sparkle-2 {
    animation-delay: 0.2s;
  }
  &.sparkle-3 {
    animation-delay: 0.4s;
  }
}

@keyframes sparkle {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0);
  }
}
</style>