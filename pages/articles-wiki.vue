<router>
  {
    path: '/:l1/:l2/articles/wiki/:method?/:args?',
    meta: {
      title: 'Learning Wiki Articles | Zero to Hero',
      metaTags: [
        {
          name: 'description',
          content:
            'Read Wiki articles about grammar and language.'
        }
      ]
    }
  }
</router>
<template>
  <div class="main mt-5 mb-5">
    <div v-if="method === 'list'" class="container">
      <template v-if="articles && articles.length > 0">
        <div class="row">
          <div class="col-sm-12 col-md-8">
            <h3 class="mb-5">Wiki Articles</h3>
            <ArticlesList :articles="articles" />
          </div>
          <div class="col-sm-12 col-md-4">
            <h4 class="mb-5">About the Wiki</h4>
            <p>
              These are user-contributed articles to help you learn
              {{ $l2.name }}.
            </p>
            <hr />
            <p v-if="$l2.code === 'zh'">
              The previous version of the wiki can be viewed
              <a href="http://wiki.chinesezerotohero.com">here</a>
              .
            </p>
          </div>
        </div>
      </template>
      <template v-if="articles && articles.length === 0">
        <div class="jumbotron shadow rounded bg-white text-center">
          <h5>
            We don’t have any articles in the {{ $l2.name }} Learning Wiki yet.
          </h5>
          <p class="lead mb-3">
            To add the first article in the Wiki, please contact us so we can
            create an account for you.
          </p>
          <div class="text-center">
            <router-link
              :to="`/${$l1.code}/${$l2.code}/contact-us`"
              class="btn btn-success"
            >
              Contact Us
            </router-link>
          </div>
        </div>
      </template>
    </div>
    <div v-if="method === 'view' && article" class="container">
      <div class="row">
        <div class="col-sm-12">
          <ArticleCard :article="article" :edit="true" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import $ from "jquery";
import Config from "@/lib/config";
import ArticlesList from "@/components/ArticlesList.vue";
import ArticleCard from "@/components/ArticleCard.vue";

export default {
  components: {
    ArticlesList,
    ArticleCard,
  },
  data() {
    return {
      articles: undefined,
      article: undefined,
      method: undefined,
      args: undefined,
      Config,
    };
  },
  watch: {
    $route() {
      if (this.$route.name === "articles-wiki") {
        this.route();
      }
    },
  },
  methods: {
    route() {
      if (this.$route.params.method) {
        this.method = this.$route.params.method;
        if (this.method === "list") {
          this.articles = [];
          $.getJSON(
            `${Config.wiki}items/articles?filter[l2][eq]=${this.$l2.id}`,
            (response) => {
              this.articles = response.data.map((article) => {
                article.url = `/${this.$l1.code}/${
                  this.$l2.code
                }/articles/wiki/view/${article.id},${encodeURIComponent(
                  article.title
                )}`;
                return article;
              });
            }
          );
        } else if (this.method === "view" && this.$route.params.args) {
          this.args = this.$route.params.args.split(",");
          this.article = undefined;
          $.getJSON(
            `${Config.wiki}items/articles/${this.args[0]}`,
            (response) => {
              this.article = response.data;
            }
          );
        }
      } else {
        this.$router.push({
          path: `/${this.$l1.code}/${this.$l2.code}/articles/wiki/list`,
        });
      }
    },
  },
  created() {
    this.route();
  },
};
</script>

<style>
</style>
