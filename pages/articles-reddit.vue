<router>
  {
    path: '/:l1/:l2/articles/reddit/:method?/:args?',
    props: true,
  }
</router>
<template>
  <div class="main pt-5 pb-5">
    <SocialHead
      v-if="subreddits && subreddits.length > 0"
      :title="`Reddit Posts from r/${subreddits[0].sub} | ${$l2.name} Zero to Hero`"
    />
    <div v-if="method === 'list'" class="container" :key="`subreddits-${key}`">
      <div class="row">
        <div class="col-sm-12 col-md-8">
          <div v-if="subreddits && subreddits.length > 0">
            <h3 class="mb-5">
              Reddit Posts under
              <a :href="`https://www.reddit.com/${subreddits[0].sub}`">
                {{ subreddits[0].sub }}
              </a>
            </h3>
            <RedditArticlesList :path="`${subreddits[0].sub}/hot`" />
          </div>
          <div v-if="subreddits && subreddits.length === 0">
            <div class="jumbotron shadow rounded bg-white text-center">
              <h5>
                We don’t know about a subreddit for learning {{ $l2.name }} yet.
              </h5>
              <p class="lead mb-3">
                If you know of a subreddit related to learning {{ $l2.name }},
                pleaes let us know so we can add it.
              </p>
              <div class="text-center">
                <a
                  :href="`/${$l1.code}/${$l2.code}/contact-us`"
                  class="btn btn-success"
                >
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </div>
        <div
          class="col-sm-12 col-md-4"
          v-if="subreddits && subreddits.length > 0"
        >
          <h4 class="mb-5">About Reddit</h4>
          <hr />
          <p>
            This is a community for people studying or teaching {{ $l2.name }} -
            or just interested in the language. Please post interesting links,
            language learning advice, or questions about the
            {{ $l2.name }} language. To participate and create new content,
            <a :href="`https://www.reddit.com/${subreddits[0].sub}/`">
              visit the community on Reddit
            </a>
            .
          </p>
        </div>
      </div>
    </div>
    <div v-if="method === 'view' && articleId" class="container">
      <div class="row">
        <div class="col-sm-12">
          <RedditArticle v-if="articleId" :articleId="articleId" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Config from "@/lib/config";
import RedditArticlesList from "@/components/RedditArticlesList.vue";
import RedditArticle from "@/components/RedditArticle.vue";
import axios from "axios";

export default {
  components: {
    RedditArticlesList,
    RedditArticle,
  },
  props: ["method", "args"],
  data() {
    return {
      subreddits: undefined,
      articles: [],
      articleId: undefined,
      Config,
      key: 0,
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
  async fetch() {
    if (this.method) {
      if (this.method === "view" && this.args) {
        this.articleId = this.args.split(",")[0];
      } else if (this.method === "list") {
        if (!this.subreddits) {
          let response = await axios.get(
            `${Config.wiki}items/subreddits?filter[l2][eq]=${this.$l2.id}`
          );
          if (response.data) {
            this.subreddits = response.data.data;
          }
        }
      }
    } else {
      this.$router.push({
        path: `/${this.$l1.code}/${this.$l2.code}/articles/reddit/list`,
      });
    }
  },
};
</script>

<style></style>
