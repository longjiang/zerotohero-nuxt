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
      :title="`Reddit Posts from r/${subreddits[0].sub} | Language Player`"
    />
    <div v-if="method === 'list'" class="container" :key="`subreddits-${key}`">
      <div class="row">
        <div class="col-sm-12 col-md-8">
          <div v-if="subreddits && subreddits.length > 0">
            <h3 class="mb-5">
              <i18n path="Reddit Posts under {0}" tag="span">
                <a :href="`https://www.reddit.com/${subreddits[0].sub}`">
                  {{ subreddits[0].sub }}
                </a>
              </i18n>
            </h3>
            <RedditArticlesList :path="`${subreddits[0].sub}/hot`" />
          </div>
          <div v-if="subreddits && subreddits.length === 0">
            <div class="jumbotron shadow rounded bg-white text-center">
              <h5>
                {{
                  $t("We don’t know about a subreddit for learning {l2} yet.", {
                    l2: $t($l2.name),
                  })
                }}
              </h5>
              <p class="lead mb-3">
                {{
                  $t(
                    "If you know of a subreddit related to learning {l2}, please let us know so we can add it.",
                    { l2: $t($l2.name) }
                  )
                }}
              </p>
              <div class="text-center">
                <a
                  :href="`/${$l1.code}/${$l2.code}/contact-us`"
                  class="btn btn-success"
                >
                  {{ $t("Contact Us")}}
                </a>
              </div>
            </div>
          </div>
        </div>
        <div
          class="col-sm-12 col-md-4"
          v-if="subreddits && subreddits.length > 0"
        >
          <h4 class="mb-5">{{ $t('About Reddit') }}</h4>
          <hr />
          <i18n path="This is a community for people studying or teaching {0} - or just interested in the language. Please post interesting links, language learning advice, or questions about the {0} language. To participate and create new content, visit the community on Reddit." tag="p">
            <a :href="`https://www.reddit.com/${subreddits[0].sub}/`">
              {{ $t($l2.name) }}
            </a>
          </i18n>
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
import RedditArticlesList from "@/components/RedditArticlesList.vue";
import RedditArticle from "@/components/RedditArticle.vue";

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
      key: 0,
    };
  },
  async fetch() {
    if (this.method) {
      if (this.method === "view" && this.args) {
        this.articleId = this.args.split(",")[0];
      } else if (this.method === "list") {
        if (!this.subreddits) {
          let response = await this.$directus.get(
            `items/subreddits?filter[l2][eq]=${this.$l2.id}`
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
