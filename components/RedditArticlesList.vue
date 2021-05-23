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
import Config from "@/lib/config";
import Helper from "@/lib/helper";
import RedditArticleCard from "@/components/RedditArticleCard";

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
  async created() {
    let cacheLife = 3600; // clear cache every hour
    let response = await axios.get(
      `${Config.jsonProxy}?cache_life=${cacheLife}&url=https://www.reddit.com/${this.path}.json`
    );
    response = response.data
    this.articles = response.data.data.children.map((item) => item.data);
  },
  data() {
    return {
      Config,
      Helper,
      articles: [],
    };
  },
};
</script>

<style scoped></style>
