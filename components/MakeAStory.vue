<template>
  <div>
    <button v-if="showButton" @click="hideButton" class="btn btn-md btn-success text-white"><i class="fas fa-book-open mr-1"></i> {{ $t(this.btnText || 'Read a story with these words') }}</button>
    <p v-else class="text-left">
      <ChatGPT
        :initialMessage="
          $t(
            'Please write an interesting {l2} story with the following {l2} words: {words}',
            {
              l2: $t($l2.name),
              l1: $t($l1.name),
              words: words.join(', '),
            }
          )
        "
      />
    </p>
  </div>
</template>

<script>
export default {
  props: {
    words: Array,
    btnText: String
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