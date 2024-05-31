<template>
  <div class="main">
    <SocialHead
      title="Pronunciation List Tool | Language Player"
      :description="`Enter a list of ${$t($l2.name)} words and convert them into a list of pronunciation transcriptions.`"
    />
    <div class="container pt-5 pb-5">
      <div class="row">
        <div class="col-sm-12">
          <h3 class="text-center">{{ $t('Get pronunciation for a list of words') }}</h3>
          <p class="text-center">
            {{ $t('Paste your list of {l2} words into the text box and get a table of all pronunciation variations for each word.', {l2: $t($l2.name)}) }}
          </p>
        </div>
      </div>
      <div class="row">
        <div :class="{ 'col-sm-6': csv, 'col-sm-12': !csv }">
          <h5 class="mt-4 mb-4">{{ $t('Enter {l2} Words Here:', { l2: $t($l2.name) }) }}</h5>
          <textarea
            v-model="text"
            class="mt-2 mb-2 form-control"
            cols="30"
            rows="10"
            :placeholder="$t('Paste your list of {l2} words here to generate a pronunciation table', {l2: $t($l2.name)})"
          ></textarea>
        </div>
        <div class="col-sm-6" v-if="csv">
          <h5 class="mt-4 mb-4">{{ $t('Pronunciation:') }}</h5>
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
          <button class="btn btn-success btn-block" v-on:click="getPronunciationClick">
            {{ $t('Get Pronunciation') }}
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
  },
  mounted() {
    this.text = localStorage.getItem("zthPinyinList");
  },
  methods: {
    async getPronunciationClick() {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("zthPinyinList", this.text);
      }
      this.words = await this.lookup(this.text);
      this.csv = this.getCsv(this.words);
    },
    getCsv(words) {
      return words
        .map((candidates) => {
          return candidates.map((candidate) => this.pronunciation(candidate)).join("\t");
        })
        .join("\n");
    },
    pronunciation(candidate) {
      return candidate.pronunciation || candidate.pinyin || candidate.kana || candidate.hangul || candidate.romaji;
    },
    async lookup(text) {
      let lines = text.split("\n");
      let words = [];
      const dictionary = await this.$getDictionary();
      for (let line of lines) {
        let seen = [];
        let candidates = await dictionary.lookupMultiple(line);
        candidates = candidates.filter((candidate) => {
          const keep = !seen.includes(this.pronunciation(candidate));
          seen.push(this.pronunciation(candidate));
          return keep;
        });
        words.push(candidates);
      }
      return words;
    },
  },
};
</script>
