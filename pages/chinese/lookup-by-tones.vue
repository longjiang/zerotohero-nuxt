<router>
  {
    path: '/:l1/:l2/lookup-by-tones',
    props: true
  }
</router>
<template>
  <div class="main">
    <div class="container pt-3 pb-5">
      <div class="row">
        <div class="col-sm-12">
          <h3 class="mb-5 text-center">{{ $t("Mandarin Words by Tones") }}</h3>
          <p class="text-center mb-3">
            {{
              $t(
                'Enter a Mandarin tone pattern (e.g. enter "12" to find "zhōngguó):'
              )
            }}
          </p>
          <div style="max-width: 20rem; margin: 0 auto">
            <b-input-group>
              <b-form-input
                v-model.lazy="tonePattern"
                type="text"
                placeholder="e.g., '32'"
              ></b-form-input>
              <b-input-group-append>
                <b-button
                  variant="primary"
                  @click="findWordsByTones"
                  :disabled="!tonePattern"
                >
                  {{ $t("Find Words") }}
                </b-button>
              </b-input-group-append>
            </b-input-group>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-12 mt-5 mb-5">
          <div class="text-center mt-5 mb-5" v-if="crunching">
            <Loader :sticky="true" message="Searching for words..." />
          </div>
          <p
            v-if="wordsByTones && wordsByTones.length > 0"
            class="text-center"
          >
            <strong>{{
              $t("{num} words found:", { num: wordsByTones.length })
            }}</strong>
          </p>
          <table
            class="table table-responsive mt-3"
            v-if="wordsByTones && wordsByTones.length > 0"
          >
            <tbody>
              <tr
                v-for="(result, index) in filteredRows"
                :key="`search-results-row-${index}`"
                style="position: relative"
              >
                <td>
                  <WordList :maxDefinitions="3" :words="[result]" />
                </td>
                <td>
                  <router-link
                    :to="{
                      name: 'details',
                      params: {
                        method: $store.state.settings.dictionaryName,
                        args: `${result.id}`,
                      },
                    }"
                    class="btn btn-medium btn-success mt-2"
                    style="font-size: 0.7em; width: 1.5rem"
                  >
                    <i class="fa fa-book" />
                  </router-link>
                </td>
                <td>
                  <b-button
                    class="mt-2"
                    size="medium"
                    style="font-size: 0.7em; width: 1.5rem"
                    @click="onCopyClick(result.simplified)"
                  >
                    <i class="fa fa-copy" />
                  </b-button>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-observe-visibility="infiniteScroll">
            <div
              class="mt-3 mb-3 text-center"
              v-if="wordsByTones && numRowsVisible < wordsByTones.length"
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
      tonePattern: "",
      crunching: false,
      wordsByTones: undefined,
      numRowsVisible: 10,
      perPage: 10,
    };
  },
  mounted() {
    if (this.tonePattern) this.findWordsByTones();
  },
  computed: {
    filteredRows() {
      return this.wordsByTones.slice(0, this.numRowsVisible);
    },
  },
  methods: {
    onCopyClick(text) {
      navigator.clipboard.writeText(text).then(
        () => {
          this.$toast.success(this.$t("Copied!"), {
            duration: 2000,
          });
        },
        (err) => {
          this.$toast.error(this.$t("Copy failed!"), {
            duration: 2000,
          });
        }
      );
    },
    infiniteScroll(isVisible) {
      if (isVisible) {
        this.numRowsVisible = this.numRowsVisible + this.perPage;
      }
    },
    async findWordsByTones() {
      this.crunching = true;
      let dictionary = await this.$getDictionary();
      let words = await dictionary.lookupByTones(this.tonePattern);
      words = words.sort((a, b) => {
        let aLevel = (!a.level || a.level === 'outside') ? 7 : Number(a.level);
        let bLevel = (!b.level || b.level === 'outside') ? 7 : Number(b.level);
        console.log(aLevel, bLevel, aLevel - bLevel);
        return aLevel - bLevel
      });
      this.crunching = false;
      return (this.wordsByTones = words);
    },
  },
};
</script>

<style lang="scss" scoped></style>
