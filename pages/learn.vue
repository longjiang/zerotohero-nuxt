<router>
  {
    path: '/:l1/:l2/learn/:method?/:args?',
    props: true,
  }
</router>
<template>
  <div class="main pt-5 pb-5 container" v-cloak>
    <div class="row">
      <div class="col-sm-12">
        <h4 class="page-title mb-4" v-if="method === 'hsk'">
          <b :data-level="args[0]" class="mr-1">HSK {{ args[0] }}</b>
          <b>Lesson {{ args[1] }}</b>
          (Part {{ args[2] }}) Vocabulary
        </h4>
        <Loader class="mt-5" />
        <div v-if="words.length > 0">
          <p>Tap on any of the words below, and page through the words:</p>
          <WordList :words="words" style="column-count: 2"></WordList>
          <router-link
            v-if="words.length > 0"
            class="btn btn-gray btn-sm mt-2"
            :to="`/${$l1.code}/${$l2.code}/learn-interactive/${method}/${args}`"
          >
            <i class="fa fa-chalkboard"></i> Learn These Words (Legacy)
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import WordList from "@/components/WordList.vue";
import Questions from "@/components/Questions.vue";

export default {
  components: {
    WordList,
    Questions,
  },
  data() {
    return {
      started: false,
      words: [],
      method: false,
      args: [],
      savedWords: [],
      questionTypes: [
        "fill-in-the-blank",
        "make-a-sentence",
        "collocation",
        "decomposition",
      ],
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
  created() {
    this.route();
  },
  methods: {
    async route() {
      if (this.$route.params.method) {
        this.method = this.$route.params.method;
        if (this.method == "hsk" && this.$route.params.args) {
          this.args = this.$route.params.args.split(",");
          this.words = await (
            await this.$getDictionary()
          ).getByBookLessonDialog(this.args[0], this.args[1], this.args[2]);
          return;
        }
      }
    },
  },
};
</script>
