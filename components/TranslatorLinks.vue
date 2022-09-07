<template>
  <div>
    <span v-for="translator of translators" :key="`trans-${translator.id}`">
      <a
        :href="translator.url"
        target="_blank"
        style="
          font-size: 0.9em;
          white-space: nowrap;
          display: inline-block;
          color: black;
        "
        :class="{
          'mr-3': true,
        }"
      >
        {{ translator.name }}
        <i class="fas fa-angle-right"></i>
      </a>
    </span>
  </div>
</template>

<script>
export default {
  props: {
    text: {
      type: String,
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
    translators() {
      let translators = this.$languages.getTranslator(this.$l1, this.$l2) || [];
      let mappedTranslators = [];
      for (let t of translators.translators) {
        if (typeof t.url === "function") {
          // Wait until the function is available
          mappedTranslators.push({
            name: t.name,
            id: t.id,
            url: t.url(this.text, this.$l1.code, this.$l2.code),
          });
        }
      }
      return mappedTranslators;
    },
  },
};
</script>

<style>
</style>