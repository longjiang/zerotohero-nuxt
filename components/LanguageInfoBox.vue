<template>
  <div class="language-info-box">
    <client-only>
      <WebImages
        v-if="lang && showImages"
        :text="`${lang.name} people${
          (!lang.speakers || lang.speakers < 500000) &&
          lang.country &&
          lang.country[0]
            ? ' ' & lang.country.map((c) => c.name).join(' or ')
            : ''
        }`"
        limit="3"
        ref="images"
        class="language-info-box-images"
      />
    </client-only>
    <div class="language-info-box-wikipedia" v-if="page">
      {{ wikipediaSummary }}
      <div>
        <i class="fa-solid fa-arrow-right"></i>
        <i18n path="Learn more on {0}" tag="span">
          <a
            target="blank"
            :href="page.url()"
            class="link-unstyled font-weight-bold text-success"
            style="text-decoration: underline"
          >
            <i18n path="Wikipedia" tag="span" />
          </a>
        </i18n>
      </div>
      <div v-if="lang.omniglot">
        <i class="fa-solid fa-arrow-right"></i>
        <i18n path="Learn useful phrases on {0}" tag="span">
          <a
            target="blank"
            :href="`https://omniglot.com/writing/${lang.omniglot}`"
            class="link-unstyled font-weight-bold text-success"
            style="text-decoration: underline"
          >
            Omniglot
          </a>
        </i18n>
      </div>
    </div>
  </div>
</template>

<script>
import wiki from "wikijs";

export default {
  props: {
    lang: {
      type: Object,
    },
    showImages: {
      type: Boolean,
      default: true,
    },
    brief: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      wikipediaSummary: undefined,
      page: undefined,
    };
  },
  async mounted() {
    if (this.lang) {
      try {
        let page = await wiki({
          apiUrl: `https://en.wikipedia.org/w/api.php`,
        }).page(`${this.lang.name} language`);
        if (this.$l1.code !== 'en') {
          let langs = await page.langlinks();
          let translation = langs.find((l) => l.lang === this.$l1.code);
          page = await wiki({
            apiUrl: `https://${this.$l1.code}.wikipedia.org/w/api.php`,
          }).page(translation.title);
        }
        this.page = page;
        let summary = await page.summary();
        let shortSummary = summary
          .split("\n")[0]
          .replace(/\(.*?\)/g, "")
          .replace(/[()]/g, "")
          .replace(/(.*?\. .*?\. .*?\. .*?\. .*?\. .*?\.) .*/, "$1 . . .");
        if (this.brief) shortSummary = shortSummary.replace(/(.*?\. ).*/, "$1");
        this.wikipediaSummary = shortSummary;
      } catch (err) {
        console.log(err);
      }
    }
  },
};
</script>

<style lang="scss" scoped>
.language-info-box-images {
  justify-content: center;
  :deep(.image-wall-image) {
    flex: 0;
    margin-right: 1rem;
    margin-bottom: 1rem;
    background: white;
    border-radius: 0.25rem;
  }
}
</style>