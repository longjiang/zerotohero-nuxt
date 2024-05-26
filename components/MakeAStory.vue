<template>
  <div>
    <b-button

      v-if="showButton"
      @click="hideButton"
      :variant="$skin"
    >
      <i class="fas fa-book-open mr-1"></i>
      {{ $t(this.btnText || "Read a story with these words") }}
    </b-button>
    <p v-else class="text-left">
      <ChatGPT
        :maxTokens="150"
        :initialMessages="[
          $t(
            'Please write an interesting {l2} story with the following {l2} word(s): {words}.',
            {
              l2: $t($l2.name),
              l1: $t($l1.name),
              words: words.map((w) => `${w.head}`).join(', '),
            }
          ),
        ]"
      />
    </p>
  </div>
</template>

<script>
export default {
  props: {
    words: Array,
    btnText: String,
  },
  data() {
    return {
      showButton: true,
    };
  },
  methods: {
    hideButton() {
      this.showButton = false;
    },
  },
};
</script>