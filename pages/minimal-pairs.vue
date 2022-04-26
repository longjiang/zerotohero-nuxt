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
          <h3 class="mb-5 text-center">{{ $l2.name }} Minimal Pairs</h3>
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
        <div class="col-sm-12 mt-5 mb-5">
          <div class="text-center mt-5 mb-5" v-if="crunching">
            <Loader :sticky="true" message="Looking for minimal pairs . . ." />
          </div>
          <p v-if="minimalPairs && minimalPairs.length > 0" class="text-center">
            <strong>{{ minimalPairs.length }} pairs found:</strong>
          </p>
          <table
            class="table table-responsive mt-3"
            v-if="minimalPairs && minimalPairs.length > 0"
          >
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
                    class="btn btn-primary"
                  >
                    <i class="fa fa-adjust" />
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
  </div>
</template>

<script>
export default {
  data() {
    return {
      a: undefined,
      b: undefined,
      defaults: {
        ko: ["사", "싸"],
        zh: ["āng", "àng"],
        vi: ["˧˧", "˨˩"],
        ja: ["また", "まだ"],
        ru: ["ш", "щ"],
        en: ["ɪt", "iːt"],
        fr: ['ɑ̃', 'œ̃'],
        es: ['ɾo', 'ro'],
        de: ['ʏ', 'yː']
      },
      crunching: false,
      minimalPairs: undefined,
      numRowsVisible: 10,
      perPage: 10,
    };
  },
  mounted() {
    if (this.defaults[this.$l2.code]) {
      this.a = this.defaults[this.$l2.code][0];
      this.b = this.defaults[this.$l2.code][1];
    }
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
      let dictionaryName = this.$store.state.settings.dictionaryName;
      let property = "pronunciation";
      if (["kengdic", "openrussian"].includes(dictionaryName) || this.$l2.code === 'it')
        property = "head";
      if (dictionaryName === "edict") property = "kana";
      this.crunching = true;
      let dictionary = await this.$getDictionary();
      let words = await dictionary.getWords();
      let pronunciations = words
        .filter((w) => w[property])
        .map((w) => {
          let pronunciations =
            dictionaryName === "wiktionary"
              ? w[property].split(",")
              : [w[property]];
          let chosenPornunciation =
            pronunciations[
              this.$l2.code === "vi" ? pronunciations.length - 1 : 0
            ].trim();
          return { w, chosenPornunciation };
        });
      let as = pronunciations.filter(
        (p) => p.chosenPornunciation.split(this.a).length === 2
      );
      let bs = pronunciations.filter(
        (p) => p.chosenPornunciation.split(this.b).length === 2
      );
      console.log(as, bs)
      let minimalPairs = [];
      for (let a of as) {
        let aSplit = a.chosenPornunciation.split(this.a);
        if (aSplit.length > 2) continue;
        let b = bs.find((b) => {
          let bSplit = b.chosenPornunciation.split(this.b);
          if (bSplit.length > 2) return;
          return aSplit[0] === bSplit[0] && aSplit[1] === bSplit[1];
        });
        if (b) minimalPairs.push({ a, b });
      }
      this.crunching = false;
      minimalPairs = minimalPairs.sort(
        (a, b) =>
          b.a.chosenPornunciation.length - a.a.chosenPornunciation.length
      );
      return (this.minimalPairs = minimalPairs);
    },
  },
};
</script>

<style lang="scss" scoped>
</style>