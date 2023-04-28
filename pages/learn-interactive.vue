<router>
  {
    path: '/:l1/:l2/learn-interactive/:method?/:args?',
    props: true,
  }
</router>
<template>
  <div class="main">
    <div class="pt-5 pb-5 container" v-cloak>
      <div class="row">
        <div class="col-sm-12">
          <h4 class="page-title mb-4" v-if="method === 'saved'">
            Learning saved words
          </h4>
          <h4 class="page-title mb-4" v-if="method === 'hsk'">
            <b :data-level="args[0]" class="mr-1">HSK {{ args[0] }}</b>
            <b>Learning Lesson {{ args[1] }}</b>
            (Part {{ args[2] }}) Vocabulary
          </h4>
          <Loader class="mt-5" />
          <div v-if="words.length > 0">
            <Questions
              :words="words"
              :collapsed="false"
              :book="args[0] ? args[0] : words[0].hsk"
            ></Questions>
          </div>
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
  },
  watch: {
    $route() {
      if (this.$route.name === "learn") {
        this.route();
      }
    },
  },
  mounted() {
    this.route();
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type.startsWith("savedWords")) {
        this.updateWords();
      }
    });
  },
  beforeDestroy() {
    // you may call unsubscribe to stop the subscription
    this.unsubscribe();
  },
  methods: {
    async updateWords() {
      let sW = [];
      if (
        this.$store.state.savedWords.savedWords &&
        this.$store.state.savedWords.savedWords[this.$l2.code]
      ) {
        const dictionary = await this.$getDictionary();
        for (let savedWord of this.$store.state.savedWords.savedWords[
          this.$l2.code
        ]) {
          let word = await dictionary.get(savedWord.id);
          if (word) {
            sW.push(word);
          }
        }
      }
      this.savedWords = sW;
      this.words = sW;
    },
    async route() {
      if (this.$route.params.method) {
        this.method = this.$route.params.method;
        if (this.method == "saved") {
          this.updateWords();
          return;
        } else if (this.method == "hsk" && this.$route.params.args) {
          this.args = this.$route.params.args.split(",");
          const dictionary = await this.$getDictionary();
          this.words = await dictionary.getByBookLessonDialog(this.args[0], this.args[1], this.args[2]);
          return;
        }
      } else {
        if (this.method) return;
        this.$router.push({
          path: `/${this.$l1.code}/${this.$l2.code}/learn/saved`,
        });
      }
    },
  },
};
</script>
