<template>
  <ul class="articles list-unstyled">
    <li v-for="article in articles" class="article-list-item collapsed">
      <router-link :to="article.url">
        <ArticleCard :article="article" :edit="edit" />
      </router-link>
    </li>
  </ul>
</template>

<script>
import Config from "@/lib/config";
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
      Config,
    };
  },
};
</script>

<style scoped>
</style>
