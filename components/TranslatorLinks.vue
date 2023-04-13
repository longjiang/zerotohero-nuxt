<template>
  <div>
    <span v-if="translators && translators.length > 0" class="text-secondary">
      {{ $t("Translate with:") }}
    </span>
    <span v-for="translator of translators" :key="`trans-${translator.id}`">
      <a :href="translator.url" target="_blank" class="mr-2 translator-link">
        {{ $t(translator.name) }}
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
.translator-link {
  white-space: nowrap;
  display: inline-block;
  color: #28a745;
}
</style>