<router>
  {
    path: '/:l1/:l2/explore/related/:arg?',
    props: true,
    meta: {
      title: 'Related Words | Language Player',
      metaTags: [
        {
          name: 'description',
          content: 'For any given word, find words related ot it.'
        }
      ]
    }
  }
</router>
<template>
  <div class="main pt-5 pb-4">
    <div class="container">
      <div class="row">
        <div class="col-sm-12">
          <div>
            <h3 class="text-center">Word Explorer</h3>
            <p class="text-center mb-5">
              Explore related words. Search for any word, and see words
              associated with it.
            </p>
            <Search :hrefFunc="hrefFunc" class="mb-4" ref="search" />
          </div>
          <Loader class="mt-5 d-block" style="margin: 0 auto" />
          <div>
            <div>
              <h4 class="text-center mt-5" v-if="word">
                Words related to “
                <span class="simplified">
                  {{ word.simplified }}
                </span>

                <span class="traditional">{{ word.traditional }}</span>
                ”
              </h4>
            </div>
            <div v-if="related && related.length > 1">
              <WordListExtended
                class="focus"
                :words="related.slice(0, 30)"
                :compareWith="word"
              />
              <h4 v-if="related.length > 30" class="text-center mb-5">
                More Related Words
              </h4>
              <WordList
                v-if="related.length > 30"
                :compareWith="word"
                :words="related.slice(30)"
                class="related mb-5"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import WordListExtended from "@/components/WordListExtended.vue";
import Search from "@/components/Search.vue";
import SketchEngine from "@/lib/sketch-engine";
import Merge from "@/components/Merge";

export default {
  components: {
    WordListExtended,
    Merge,
    Search,
  },
  props: {
    arg: undefined,
  },
  data() {
    return {
      word: undefined,
      related: [],
    };
  },
  computed: {
  },
  updated() {
    if (this.word) {
      this.$refs.search.dEntry = this.word;
      this.$refs.search.text = this.word.simplified;
    }
  },
  methods: {
    hrefFunc(entry) {
      return `/${this.$store.state.settings.l1.code}/${this.$store.state.settings.l2.code}/explore/related/${entry.id}`;
    },
  },
  mounted() {
    if (this.related.length < 2) {
      this.$fetch();
    }
  },
  async fetch() {
    if (this.arg) {
      const dictionary = await this.$getDictionary();
      let word = await dictionary.get(this.arg);
      let related = [word];
      let data = await SketchEngine.thesaurus({
        l2: this.$l2,
        term: word.simplified,
      });
      if (data && data.Words) {
        for (let Word of data.Words) {
          let words = await dictionary.lookupSimplified(Word.word);
          if (words.length > 0) {
            let word = words[0];
            if (word.hsk === "") word.hsk = "outside";
            related.push(word);
          }
        }
        this.word = word;
        this.related = related;
      }
    }
  },
};
</script>
