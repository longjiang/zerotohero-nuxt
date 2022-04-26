<router>
  {
    path: '/:l1/:l2/minimal-pairs',
    props: true
  }
</router>
<template>
  <div class="main">
    <div class="container pt-5 pb-5">
      <div class="row">
        <div class="col-sm-12">
          <h3 class="mb-5 text-center">Minimal Pairs</h3>
          <b-input-group>
            <b-form-input
              v-model.lazy="a"
              type="text"
              placeholder="a"
            ></b-form-input>
            <b-form-input
              v-model.lazy="b"
              type="text"
              placeholder="b"
            ></b-form-input>
            <b-input-group-append>
              <b-button
                variant="primary"
                @click="findMinimalPairs"
                :disabled="!(a && b)"
              >
                Go
              </b-button>
            </b-input-group-append>
          </b-input-group>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      a: "˧˧",
      b: "˨˩˦",
    };
  },
  computed: {
    $l1() {
      return this.$store.state.settings.l1;
    },
    $l2() {
      return this.$store.state.settings.l2;
    },
  },
  methods: {
    async findMinimalPairs() {
      let dictionary = await this.$getDictionary();
      let words = await dictionary.getWords();
      let pronunciations = words
        .filter((w) => w.pronunciation)
        .map((w) => {
          let pronunciations = w.pronunciation.split(",");
          return pronunciations[pronunciations.length - 1].trim();
        });
      let aPronunciations = pronunciations.filter((p) => p.includes(this.a));
      let bPronunciations = pronunciations.filter((p) => p.includes(this.b));
      let minimalPairs = [];
      for (let aPronunciation of aPronunciations) {
        let aSplit = aPronunciation.split(this.a);
        if (aSplit.length > 2) continue;
        let bPronunciation = bPronunciations.find((b) => {
          let bSplit = b.split(this.b);
          if (bSplit.length > 2) return;
          return aSplit[0] === bSplit[0] && aSplit[1] === bSplit[1];
        });
        if (bPronunciation)
          minimalPairs.push([aPronunciation, bPronunciation, aSplit]);
      }
      console.log(minimalPairs);
      return minimalPairs;
    },
  },
};
</script>

<style lang="scss" scoped>
</style>