<router>
  {
    path: '/:l1/:l2/minimal-pairs',
    props: true
  }
</router>
<template>
  <div class="main">
    <div class="container pt-3 pb-5">
      <div class="row">
        <div class="col-sm-12">
          <h3 class="mb-5 text-center">
            {{ $t("{l2} Minimal Pairs", { l2: $t($l2.name) }) }}
          </h3>
          <p class="text-center mb-3">
            {{ $t("Enter two distinct phonetic segments:") }}
          </p>
          <div style="max-width: 20rem; margin: 0 auto">
            <b-input-group>
              <b-form-input
                v-model.lazy="a"
                type="text"
                placeholder="a"
                style="max-width: 5rem"
              ></b-form-input>
              <b-form-input
                v-model.lazy="b"
                type="text"
                placeholder="b"
                style="max-width: 5rem"
              ></b-form-input>
              <b-input-group-append>
                <b-button
                  variant="primary"
                  @click="findAndSetMinimalPairs"
                  :disabled="!(a && b)"
                >
                  {{ $t("Find Minimal Pairs") }}
                </b-button>
              </b-input-group-append>
            </b-input-group>
          </div>
          <div
            v-if="defaults[$l2.code] && defaults[$l2.code].length > 1"
            class="mt-4 text-center"
          >
            <p class="mb-3">{{ $t("Or use a preset:") }}</p>
            <b-form-select
              v-model="presetSelect"
              :options="presetOptions"
              style="max-width: 15rem"
            ></b-form-select>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-12 mt-5 mb-5">
          <div class="text-center mt-5 mb-5" v-if="crunching">
            <Loader :sticky="true" message="Looking for minimal pairs..." />
          </div>
          <template v-else>
            <p
              v-if="minimalPairs && minimalPairs.length > 0"
              class="text-center"
            >
              <strong>{{
                $t("{num} pairs found:", { num: minimalPairs.length })
              }}</strong>
            </p>
            <table
              class="table table-responsive mt-3"
              v-if="minimalPairs && minimalPairs.length > 0"
            >
              <tbody>
                <tr
                  v-for="row in filteredRows"
                  :key="`minimal-pairs-row-${row.a.w.id}-${row.b.w.id}`"
                  style="position: relative"
                >
                  <td style="width: 50%" class="pl-0">
                    <WordList
                      :maxDefinitions="1"
                      :words="[row.a.w]"
                      :star="false"
                      :showSpeak="false"
                    />
                  </td>
                  <td class="pl-0 pr-0">
                    <router-link
                      :to="{
                        name: 'compare',
                        params: {
                          method: $store.state.settings.dictionaryName,
                          args: `${row.a.w.id},${row.b.w.id}`,
                        },
                      }"
                      class="btn btn-medium play-button btn-primary"
                    >
                      <i class="fa fa-adjust" />
                    </router-link>
                  </td>
                  <td style="width: 50%" class="pr-0">
                    <WordList
                      :maxDefinitions="1"
                      :words="[row.b.w]"
                      :star="false"
                      :showSpeak="false"
                    />
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
          </template>
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
        ko: [
          ["사", "싸"],
          ["바", "파"], // ba vs. pa
          ["고", "코"], // go vs. ko
          ["또", "도"], // tto vs. do
          ["말", "몰"], // mal vs. mol
          ["집", "찍"], // jip vs. jjik
          ["벗", "번"], // beot vs. beon
          ["국", "궁"], // guk vs. gung
          ["달", "탈"], // dal vs. tal
          ["빛", "핏"], // bit vs. pit
        ],
        zh: [
          ["uāng", "uáng"],
          ["uāng", "uǎng"],
          ["uāng", "uàng"],
          ["ā", "a"],
          ["ā", "á"],
          ["á", "a"],
          ["ǎ", "a"],
          ["à", "a"],
          ["uáng", "uǎng"],
          ["uáng", "uàng"],
          ["uǎng", "uàng"],
          ["ēn", "ěn"],
        ],
        vi: [
          ["əŋ˧˧", "əŋ˨˩"],
          ["əŋ˧˧", "əŋ˨˩˦"],
          ["əŋ˧˧", "əŋ˦˥"],
          ["əŋ˧˧", "əŋ˨˩˨"],
          ["əŋ˨˩", "əŋ˨˩˦"],
          ["əŋ˨˩", "əŋ˦˥"],
          ["əŋ˨˩", "əŋ˨˩˨"],
          ["əŋ˨˩˦", "əŋ˦˥"],
          ["əŋ˨˩˦", "əŋ˨˩˨"],
          ["əŋ˦˥", "əŋ˨˩˨"],
        ],
        ja: [
          ["た", "だ"],
          ["た", "った"],
          ["かん", "がん"],
          ["きょ", "ぎょ"],
          ["く", "ぐ"],
          ["とう", "どう"],
          ["し", "じ"], // shi vs ji
          ["す", "ず"], // su vs zu
        ],
        ru: [
          ["ш", "щ"],
          ["б", "п"], // b vs p
          ["г", "к"], // g vs k
        ],
        en: [
          ["iːt", "ɪt"],
          ["æt", "aɪt"],
          ["fɹ", "θɹ"],
          ["tɹ", "θɹ"],
          ["sɪ", "θɪ"],
          ["sæ", "θæ"],
          ["i", "ji"],
          ["bæt", "bɑt"], // bat vs. bot
          ["sɪk", "sɪɡ"], // sick vs. sig
        ],
        fr: [
          ["ɑ̃", "œ̃"],
          ["ɛ", "ɛ̃"], // e vs en
          ["ɔ", "ɔ̃"], // o vs on
        ],
        es: [
          ["ɾ", "r"], // flapped vs trilled
          ["a", "o"],
          ["e", "i"], // e vs i
        ],
        de: [
          ["ʏ", "yː"],
          ["ɛ", "æ"], // e vs ae
          ["ɔ", "o"], // o vs closed o
        ],
      },

      crunching: false,
      minimalPairs: undefined,
      numRowsVisible: 10,
      perPage: 10,
      presetSelect: 0,
    };
  },
  mounted() {
    if (this.defaults[this.$l2.code]) {
      this.a = this.defaults[this.$l2.code][0][0];
      this.b = this.defaults[this.$l2.code][0][1];
    }
    if (this.a && this.b) this.findAndSetMinimalPairs();
  },
  computed: {
    filteredRows() {
      return this.minimalPairs.slice(0, this.numRowsVisible);
    },
    presetOptions() {
      if (this.defaults[this.$l2.code]) {
        let options = [];
        options = options.concat(
          this.defaults[this.$l2.code].map((pair, index) => {
            return {
              value: index,
              text: `${index + 1}. ${pair[0]} vs ${pair[1]}`,
            };
          })
        );
        return options;
      }
    },
  },
  watch: {
    presetSelect() {
      let selected = this.defaults[this.$l2.code][this.presetSelect];
      this.a = selected[0];
      this.b = selected[1];
      this.findAndSetMinimalPairs();
    },
  },
  methods: {
    infiniteScroll(isVisible) {
      if (isVisible) {
        this.numRowsVisible = this.numRowsVisible + this.perPage;
      }
    },
    getPronunciationKey() {
      let pronunciationKey = "pronunciation";
      if (["ko", "ru", "it"].includes(this.$l2.code)) pronunciationKey = "head";
      if (this.$l2.code === "ja") pronunciationKey = "kana";
      return pronunciationKey;
    },
    async findAndSetMinimalPairs() {
      this.crunching = true;
      const dictionary = await this.$getDictionary();
      this.minimalPairs = await dictionary.findMinimalPairsByPhoneme(
        this.a,
        this.b,
        this.getPronunciationKey()
      );
      this.crunching = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.play-button {
  font-size: 0.7em;
  width: 2rem;
}
</style>
