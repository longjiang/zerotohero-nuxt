<router>
  {
    path: '/:l1/:l2/article',
    props: route => ({ url: route.query.url })
  }
</router>

<template>
  <div class="container mx-auto mt-10">
    <JWArticle :url="url" :snippet="false" />
    <h3 class="text-4xl quiz-title">Quiz</h3>
    <Quiz />
    <div>
      <p>Read another article from WOL:</p>
      <div>
        <input
          type="text"
          v-model.lazy="newUrl"
          class="article-processor-url jw-study-aid-search-controls-field"
          placeholder="http://wol.jw.org/en/..."
        />
        <button
          class="article-processor-go jw-study-aid-search-controls-button"
        >
          Read
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    url: {
      type: String,
    },
  },
  data() {
    return {
      newUrl: this.url,
      quiz: undefined,
    };
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
  watch: {
    newUrl() {
      this.$router.push({ name: "article", query: { url: this.newUrl } });
    },
  },
};
</script>

<style>
</style>