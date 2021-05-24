<template>
  <div class="col-sm-12" v-if="article">
    <SocialHead
      v-if="article"
      :image="`${article.post_hint === 'image' ? article.url : '/img/zth-share-image.jpg'}`"
      :title="`Reddit Post: ${article.title} | from r/${article.subreddit} | ${$l2.name} Zero to Hero`"
      :description="`${article.selftext_html ? stripTags(unescape(article.selftext_html)) : 'Read article'}`"
    />
    <RedditArticleCard :article="article" />
    <div>
      <div class="mt-5 mb-5 p-5 text-center shadow">
        <p>
          To participate, go to reddit.com/
          <a
            :href="`https://www.reddit.com/${article.subreddit_name_prefixed}/comments/cpdv8t`"
          >
            <b>{{ article.subreddit_name_prefixed }}</b>
          </a>
          directly.
        </p>
        <a
          :href="`https://www.reddit.com/r/ChineseLanguage/comments/cpdv8t`"
          class="btn btn-danger"
        >
          Go to r/ChineseLanguage
        </a>
      </div>

      <div v-for="comment in comments">
        <h6>{{ comment.author }}</h6>
        <Annotate :showTranslate="true">
          <div v-html="unescape(comment.body_html)"></div>
        </Annotate>
        <hr />
      </div>
    </div>
  </div>
</template>

<script>
import Config from "@/lib/config";
import Helper from "@/lib/helper";
import RedditArticleCard from "@/components/RedditArticleCard";
import axios from "axios";

export default {
  props: ["articleId"],
  components: {
    RedditArticleCard,
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
  data() {
    return {
      comments: [],
      article: undefined,
      Config,
    };
  },

  methods: {
    unescape(escapedHTML) {
      return Helper.unescape(escapedHTML);
    },
    stripTags(html) {
      return Helper.stripTags(html)
    }
  },

  async fetch() {
    let cacheLife = 3600; // clear cache every hour
    let response = await axios.get(
      `${Config.jsonProxy}?cache_life=${cacheLife}&url=https://www.reddit.com/comments/${this.articleId}/.json`
    );
    response = response.data;
    let article = response.data[0].data.children[0].data;
    this.article = article;
    let comments = response.data[1].data.children.map((item) => item.data);
    this.comments = comments;
  },
};
</script>

<style scoped></style>
