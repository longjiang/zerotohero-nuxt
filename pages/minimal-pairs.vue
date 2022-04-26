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
          <p class="text-center mb-3">Enter two distinct phonetic segments:</p>
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
                Find Minimal Pairs
              </b-button>
            </b-input-group-append>
          </b-input-group>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-12 text-center mt-5 mb-5" v-if="crunching">
          <Loader :sticky="true" message="Looking for minimal pairs . . ." />
        </div>
        <table
          class="table table-responsive mt-5"
          v-if="minimalPairs && minimalPairs.length > 0"
        >
          <thead class="table-header">
            <tr><th></th></tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, index) in filteredRows"
              :key="`minimal-pairs-row-${index}`"
            >
              <td><WordList :words="[row.a.w]" /></td>
              <td><WordList :words="[row.b.w]" /></td>
              <td>
                <router-link
                  :to="{
                    name: 'compare',
                    params: {
                      method: $store.state.settings.dictionaryName,
                      args: `${row.a.w.id},${row.b.w.id}`,
                    },
                  }"
                >
                  Compare
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-observe-visibility="infiniteScroll">
          <div
            class="mt-3 mb-3 text-center"
            v-if="minimalPairs && numRowsVisible < minimalPairs.length"
          >
            <Loader :sticky="true" message="Loading . . ." />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      a: "ā",
      b: "à",
      crunching: false,
      minimalPairs: undefined,
      numRowsVisible: 10,
      perPage: 10,
    };
  },
  computed: {
    $l1() {
      return this.$store.state.settings.l1;
    },
    $l2() {
      return this.$store.state.settings.l2;
    },
    filteredRows() {
      return this.minimalPairs.slice(0, this.numRowsVisible);
    },
  },
  methods: {
    infiniteScroll(isVisible) {
      if (isVisible) {
        this.numRowsVisible = this.numRowsVisible + this.perPage;
      }
    },
    async findMinimalPairs() {
      this.crunching = true;
      let dictionary = await this.$getDictionary();
      let words = await dictionary.getWords();
      let pronunciations = words
        .filter((w) => w.pronunciation)
        .map((w) => {
          let pronunciations = w.pronunciation.split(",");
          let lastPronunciation =
            pronunciations[pronunciations.length - 1].trim();
          return { w, lastPronunciation };
        });
      let as = pronunciations.filter((p) =>
        p.lastPronunciation.includes(this.a)
      );
      let bs = pronunciations.filter((p) =>
        p.lastPronunciation.includes(this.b)
      );
      let minimalPairs = [];
      for (let a of as) {
        let aSplit = a.lastPronunciation.split(this.a);
        if (aSplit.length > 2) continue;
        let b = bs.find((b) => {
          let bSplit = b.lastPronunciation.split(this.b);
          if (bSplit.length > 2) return;
          return aSplit[0] === bSplit[0] && aSplit[1] === bSplit[1];
        });
        if (b) minimalPairs.push({ a, b });
      }
      this.crunching = false;
      minimalPairs = minimalPairs.sort(
        (a, b) => b.a.lastPronunciation.length - a.a.lastPronunciation.length
      );
      return (this.minimalPairs = minimalPairs);
    },
  },
};
</script>

<style lang="scss" scoped>
</style>