<router>
  {
    path: '/:l1/:l2/community/:method?/:args?',
    props: true,
    meta: {
      title: 'Community | Zero to Hero',
      metaTags: [
        {
          name: 'description',
          content: 'Connect with various Chinese-learning communities.'
        }
      ]
    }
  }
</router>
<template>
  <div class="main pt-5 mb-5">
    <div v-if="method === 'list'" class="container">
      <div class="row">
        <div class="col-sm-12">
          <h3>Chinese Learning Community</h3>
          <hr />
          <p class="mb-5">
            This is a collection of Chinese-learning resources contributed by
            users over Reddit.
          </p>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-12 col-md-4">
          <div class="list-group">
            <a class="list-group-item list-group-item-action active">
              WeChat Groups
            </a>
            <a class="list-group-item">HelloTalk Groups</a>
            <a class="list-group-item">Subreddits</a>
            <a class="list-group-item">Other Communities</a>
          </div>
        </div>
        <div class="col-sm-12 col-md-8">Listings</div>
      </div>
    </div>
    <div v-if="method === 'view' && articleId" class="container">
      <div class="row">
        <div class="col-sm-12">Details</div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  components: {},
  props: ["method", "args"],
  data() {
    return {
      articles: [],
      articleId: undefined,
    };
  },
  watch: {
    $route() {
      if (this.$route.name === "resources") {
        this.route();
      }
    },
  },
  methods: {
    route() {
      if (this.method) {
        if (this.method === "view" && this.args) {
          this.articleId = this.args.split(",")[0];
        }
      } else {
        this.$router.push({
          path: `/${this.$l1.code}/${this.$l2.code}/community/list`,
        });
      }
    },
  },
  created() {
    this.route();
  },
};
</script>

<style></style>
