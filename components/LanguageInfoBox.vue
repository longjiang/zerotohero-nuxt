<template>
  <div class="language-info-box">
    <WebImages
      v-if="lang"
      :text="`${lang.name} people${(!lang.speakers || lang.speakers < 500000) && lang.country && lang.country[0] ? ' ' & lang.country.map(c => c.name).join(' or ') : ''}`"
      limit="3"
      ref="images"
      class="language-info-box-images"
    />
    <div class="language-info-box-wikipedia">{{ wikipediaSummary }}</div>
  </div>
</template>

<script>
import wiki from "wikijs";

export default {
  props: {
    lang: {
      type: Object,
    },
  },
  data() {
    return {
      wikipediaSummary: undefined,
    };
  },
  computed: {
    $l1() {
      return this.$store.state.settings.l1;
    },
    $l2() {
      return this.$store.state.settings.l2;
    },
  },
  async mounted() {
    if (this.lang) {
      try {
        let page = await wiki({
          apiUrl: `https://${this.$l1.code}.wikipedia.org/w/api.php`,
        }).page(`${this.lang.name} language`);
        let summary = await page.summary();
        let shortSummary = summary
          .split("\n")[0]
          .replace(/\(.*?\)/, "")
          .replace(/(.*?\. .*?\. .*?\.) .*/, "$1");
        this.wikipediaSummary = shortSummary;
      } catch (err) {}
    }
  },
};
</script>

<style lang="scss" scoped>
.language-info-box-images {
  justify-content: center;
  ::v-deep .image-wall-image {
    flex: 0;
    margin-right: 1rem;
    margin-bottom: 1rem;
    background: white;
    border-radius: 0.25rem;
  }
}
</style>