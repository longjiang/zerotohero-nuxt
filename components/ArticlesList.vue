<template>
  <ul class="articles list-unstyled">
    <li
      v-for="(article, index) in articles"
      :key="`article-list-item-${index}`"
      class="article-list-item collapsed"
    >
      <router-link :to="article.url">
        <ArticleCard :article="article" :edit="edit" />
      </router-link>
    </li>
  </ul>
</template>

<script>
import ArticleCard from "@/components/ArticleCard";

export default {
  components: {
    ArticleCard,
  },
  props: {
    articles: {
      default: [],
    },
    edit: {
      default: false,
    },
  },
  data() {
    return {
    };
  },
};
</script>

<style scoped>
</style>
