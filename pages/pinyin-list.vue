<router>
  {
    path: '/:l1/:l2/pinyin-list',
  }
</router>
<template>
  <div>
    <SocialHead
      title="Pinyin List Tool | Chinese Zero to Hero"
      description="Enter a list of Chinese words and convert them into a list of pinyin transcriptions."
    />
    <div class="container main mt-4 mb-4">
      <div class="row">
        <div class="col-sm-12">
          <h4>Get pinyin for a list of words</h4>
          <p>
            Paste your list into the text box and get a table of all pinyin
            variations for each word.
          </p>
        </div>
      </div>
      <div class="row">
        <div :class="{ 'col-sm-6': csv, 'col-sm-12': !csv }">
          <h5 class="mt-4 mb-4">Enter Chinese Words Here:</h5>
          <textarea
            v-model="text"
            class="mt-2 mb-2 form-control"
            cols="30"
            rows="10"
            placeholder="Paste your list or Chinese words here to generate a pinyin table"
          ></textarea>
        </div>
        <div class="col-sm-6" v-if="csv">
          <h5 class="mt-4 mb-4">Pinyin:</h5>
          <textarea
            class="mt-2 mb-2 form-control"
            style="overflow: visible"
            cols="30"
            rows="10"
            >{{ csv }}</textarea
          >
        </div>
      </div>
      <div class="row mt-4">
        <div class="col-sm-12">
          <button class="btn btn-success btn-block" v-on:click="getPinyinClick">
            Get Pinyin
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      text: "",
      words: [],
      csv: "",
      ready: false,
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
  mounted() {
    this.text = localStorage.getItem("zthPinyinList");
  },
  methods: {
    async getPinyinClick() {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("zthPinyinList", this.text);
      }
      this.words = await this.lookup(this.text);
      this.csv = this.getCsv(this.words);
    },
    getCsv(words) {
      return words
        .map((candidates) => {
          console.log(candidates);
          return candidates.map((candidate) => candidate.pinyin).join("\t");
        })
        .join("\n");
    },
    async lookup(text) {
      let lines = text.split("\n");
      let words = [];
      for (let line of lines) {
        let seen = [];
        let candidates = await (await this.$getDictionary()).lookupSimplified(
          line
        );
        candidates = candidates.filter((candidate) => {
          const keep = !seen.includes(candidate.pinyin);
          seen.push(candidate.pinyin);
          return keep;
        });
        words.push(candidates);
      }
      return words;
    },
  },
};
</script>
