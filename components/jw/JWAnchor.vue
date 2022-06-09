<template>
  <span>
    <router-link v-if="loadable" :to="`/${$l1.code}/${$l2.code}/article?url=${href}`"><slot></slot></router-link>
    <a v-else :href="href" target="_blank"><slot></slot></a>
    <button
      class="btn btn-small text-white rounded relative bottom-0.5"
      style="font-size: 0.55em"
      @click="expand = !expand"
      v-if="loadable"
    >
      <i class="fas fa-expand"></i>
    </button>
    <div class="article-snippets mt-3 mb-3" v-if="expand">
      <ArticleSnippet :jsonUrl="htmlUrlToJsonUrl(href)" ref="articleSnippet" />
    </div>
  </span>
</template>

<script>
import Wol from "@/lib/jw/Wol";
export default {
  props: ["href"],
  data() {
    return {
      expand: false,
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
    collapsed() {
      return this.$refs.articleSnippet
        ? this.$refs.articleSnippet.collapsed
        : undefined;
    },
    loadable() {
      return this.href.startsWith('https://wol.jw.org')
    }
  },
  methods: {
    htmlUrlToJsonUrl(htmlUrl) {
      return Wol.htmlUrlToJsonUrl(htmlUrl);
    },
    maximize() {
      if (this.$refs.articleSnippet)
        this.$refs.articleSnippet.collapsed = false;
    },
    minimize() {
      if (this.$refs.articleSnippet) this.$refs.articleSnippet.collapsed = true;
    },
  },
};
</script>

<style>
</style>