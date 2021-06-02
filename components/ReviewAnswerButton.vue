
        
<template>
  <button
    :class="{
      btn: true,
      'btn-small': true,
      'bg-white': true,
      'mr-2': true,
      'review-answer': true,
      checked: checked,
      'review-answer-correct': answer.correct,
    }"
    @click="answered()"
  >
    <template v-if="$l2.code === 'ja' || !$l2.han">
      {{ answer.text }}
    </template>
    <template v-else-if="$l2.han && $settings.useTraditional">
      {{ answer.traditional || answer.simplified }}
    </template>
    <template v-else-if="$l2.han && !$settings.useTraditional">
      {{ answer.simplified || answer.traditional }}
    </template>
  </button>
</template>

        
<script>
export default {
  props: {
    answer: {
      type: Object,
    },
  },
  data() {
    return {
      checked: false,
    };
  },
  methods: {
    answered() {
      this.checked = true
      this.$emit('answered')
    }
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
  },
};
</script>
        
<style>
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