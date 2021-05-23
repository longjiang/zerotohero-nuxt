<router>
  {
    path: '/:l1/:l2/learn/:method?/:args?',
    props: true,
    meta: {
      title: 'Learn | Zero to Hero',
      metaTags: [
        {
          name: 'description',
          content: 'Learn words interactively by seeing how they are used.'
        }
      ]
    }
  }
</router>
<template>
  <div class="main pt-5 pb-5 container" v-cloak>
    <div class="row">
      <div class="col-sm-12">
        <h4 class="page-title mb-4" v-if="method === 'saved'">
          Learn the words you saved
        </h4>
        <p
          v-if="method === 'saved' && savedWords.length === 0"
          class="alert alert-warning no-saved-words"
        >
          You don't have any words saved yet. Save words by clicking on the
          <i class="glyphicon glyphicon-star-empty"></i>
          icon next to it.
        </p>
        <h4 class="page-title mb-4" v-if="method === 'hsk'">
          <b :data-level="args[0]" class="mr-1">HSK {{ args[0] }}</b>
          <b>Lesson {{ args[1] }}</b>
          (Part {{ args[2] }}) Vocabulary
        </h4>
        <Loader class="mt-5" />
        <div v-if="words.length > 0">
          <Questions
            :words="words"
            :book="args[0] ? args[0] : words[0].hsk"
          ></Questions>
          <h5 class="mt-4 mb-2">Words to learn:</h5>
          <WordList :words="words" style="column-count: 2"></WordList>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import WordList from "@/components/WordList.vue";
import Questions from "@/components/Questions.vue";
import { mapState } from "vuex";

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
  watch: {
    $route() {
      if (this.$route.name === "learn") {
        this.route();
      }
    },
  },
  beforeMount() {
    this.route();
  },
  mounted() {
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
      this.savedWords = [];
      this.savedTexts = [];
      if (this.$root.savedWords && this.$root.savedWords[this.$l2.code]) {
        for (let wordForms of this.$root.savedWords[this.$l2.code]) {
          let word = await (await this.$getDictionary()).lookup(wordForms[0]);
          if (word) {
            this.savedWords.push(word);
          } else {
            this.savedTexts.push(wordForms[0].form);
          }
        }
      }
      this.words = this.savedWords;
    },
    async route() {
      if (this.$route.params.method) {
        this.method = this.$route.params.method;
        if (this.method == "saved") {
          this.updateWords();
          return;
        } else if (this.method == "hsk" && this.$route.params.args) {
          this.args = this.$route.params.args.split(",");
          this.words = await (await this.$getDictionary()).getByBookLessonDialog(
            this.args[0],
            this.args[1],
            this.args[2]
          );
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
