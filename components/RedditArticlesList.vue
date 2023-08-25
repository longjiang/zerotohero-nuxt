<template>
  <ul class="articles list-unstyled">
    <li v-for="article in articles" class="article-list-item collapsed">
      <a
        class="link-unstyled"
        :href="`/${$l1.code}/${$l2.code}/articles/reddit/view/${
          article.id
        },${encodeURIComponent(article.title)}`"
      >
        <RedditArticleCard :article="article" />
      </a>
    </li>
  </ul>
</template>

<script>
import { jsonProxy } from "@/lib/utils";
import RedditArticleCard from "@/components/RedditArticleCard";
import axios from 'axios'

export default {
  components: {
    RedditArticleCard,
  },
  props: {
    path: {
      type: String,
    },
    edit: {
      default: false,
    },
  },
  async created() {
    let cacheLife = 3600; // clear cache every hour
    let response = await axios.get(
      `${jsonProxy}?cache_life=${cacheLife}&url=https://www.reddit.com/${this.path}.json`
    );
    response = response.data
    this.articles = response.data.data.children.map((item) => item.data);
  },
  data() {
    return {
      articles: [],
    };
  },
};
</script>

<style scoped></style>
