<template>
  <div class="col-sm-12" v-if="article">
    <SocialHead
      v-if="article"
      :image="`${
        article.post_hint === 'image' ? article.url : '/img/zth-share-image.jpg'
      }`"
      :title="`Reddit Post: ${article.title} | from r/${article.subreddit} | Language Player`"
      :description="`${
        article.selftext_html
          ? stripTags(unescape(article.selftext_html))
          : 'Read article'
      }`"
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
          :href="`https://www.reddit.com/${article.subreddit_name_prefixed}/comments/cpdv8t`"
          class="btn btn-success"
        >
          Go to {{ article.subreddit_name_prefixed }}
        </a>
      </div>

      <div v-for="(comment, index) in comments" :key="`comment-item-${index}`">
        <h6>{{ comment.author }}</h6>
        <TokenizedRichText :showTranslate="true">
          <div v-html="unescape(comment.body_html)"></div>
        </TokenizedRichText>
        <hr />
      </div>
    </div>
  </div>
</template>

<script>
import { jsonProxy } from "../lib/utils";
import RedditArticleCard from "@/components/RedditArticleCard";
import axios from "axios";
import { unescape, stripTags } from "../lib/utils";

export default {
  props: ["articleId"],
  components: {
    RedditArticleCard,
  },
  data() {
    return {
      comments: [],
      article: undefined,
    };
  },

  methods: {
    unescape(escapedHTML) {
      return unescape(escapedHTML);
    },
    stripTags(html) {
      return stripTags(html);
    },
  },

  async created() {
    let cacheLife = 3600; // clear cache every hour
    let response = await axios.get(
      `${jsonProxy}?cache_life=${cacheLife}&url=https://www.reddit.com/comments/${this.articleId}/.json`
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
