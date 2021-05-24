<router>
  {
    path: '/:l1/:l2/explore/new-levels',
    meta: {
      title: 'Words in the New HSK 3.0 | Zero to Hero',
      metaTags: [
        {
          name: 'description',
          content: 'List words in the New HSK 3.0 (starting 2021–2025?) levels.'
        }
      ]
    }
  }
</router>
<template>
  <div class="container main mt-4 mb-4" v-cloak>
    <div class="row">
      <div class="col-sm-12">
        <div style="overflow: inherit">
          <h3 class="mt-5 mb-3 text-center">
            New HSK 3.0 Word List (9 Levels)
          </h3>
          <div class="text-center">
            <Loader class="mt-5" />
          </div>
          <div class="text-center mb-5">
            <a
              href="https://server.chinesezerotohero.com/data/hsk-cedict/new_hsk.csv.txt"
              download
            >
              <i class="fa fa-download mr-1" />
              Download CSV
            </a>
          </div>
          <div
            class="d-flex"
            :style="`
              margin: 0 auto 3rem auto;
              position: sticky;
              top: 0;
              background: white;
              padding: 1rem 0;
              z-index: 9;
            `"
            v-if="newHSK && newHSK.length > 0"
            v-cloak
          >
            <div class="input-group" style="flex: 1">
              <input
                v-model="search"
                type="text"
                class="form-control lookup"
                placeholder="Filter by keywords"
              />
              <div class="input-group-append">
                <button class="btn btn-danger lookup-button" type="button">
                  <i class="glyphicon glyphicon-filter"></i>
                  Filter
                </button>
              </div>
            </div>
            <b-form-select
              style="width: 7rem"
              v-model="level"
              :text="level ? levels[level] : 'Level'"
              class="ml-1"
              placeholder="HSK"
            >
              <b-form-select-option
                :key="`new-level-dropdown-item-all`"
                text="HSK"
                :value="false"
                selected
              >
                All Levels
              </b-form-select-option>
              <b-form-select-option
                v-for="(title, slug) in levels"
                :key="`new-level-dropdown-item-${slug}`"
                :value="slug"
              >
                {{ title }}
              </b-form-select-option>
            </b-form-select>
            <b-form-input
              v-model="start"
              placeholder="Start Row"
              class="ml-1"
              style="max-width: 7rem; margin-left: 0.5rem"
            ></b-form-input>
          </div>
          <table class="table" v-if="newHSK.length > 0">
            <thead>
              <tr>
                <th>级</th>
                <th>#</th>
                <th style="min-width: 6em">词头</th>
                <th style="min-width: 6em">拼音</th>
                <th>
                  英语释义 (
                  <a href="https://cc-cedict.org/">CC-CEDICT</a>
                  )
                </th>
                <th>POS</th>
                <th>Example</th>
                <th>Alternative</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(word, index) in rows.slice(0, numRowsVisible)"
                :key="`new-hsk-row-${word.level}-${word.num}`"
                class="new-levels-table-row"
                v-observe-visibility="
                  index === numRowsVisible - 1 ? visibilityChanged : false
                "
              >
                <td style="min-width: 3rem">{{ word.level }}</td>
                <td>{{ word.num }}</td>
                <td>
                  <Annotate :sticky="true" :phonetics="false">
                    <span>{{ word.simplified }}</span>
                  </Annotate>
                </td>
                <td>{{ word.pinyin }}</td>
                <td>{{ word.definitions }}</td>
                <td>{{ word.pos }}</td>
                <td>{{ word.example }}</td>
                <td>{{ word.alternative }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Helper from "@/lib/helper";
export default {
  components: {},
  data() {
    return {
      newHSK: [],
      rows: [],
      numRowsVisible: 10,
      start: undefined,
      search: "",
      level: false,
    };
  },
  async fetch() {
    let newHSK = await (await this.$getDictionary()).getNewHSK();
    this.newHSK = newHSK;
    this.rows = this.newHSK;
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
    levels() {
      return {
        1: "HSK 1",
        2: "HSK 2",
        3: "HSK 3",
        4: "HSK 4",
        5: "HSK 5",
        6: "HSK 6",
        "7-9": "HSK 7-9",
      };
    },
  },
  watch: {
    search() {
      this.applyFilters();
    },
    start() {
      this.applyFilters();
    },
    level() {
      this.applyFilters();
    },
  },
  methods: {
    visibilityChanged(isVisible) {
      if (isVisible) {
        this.numRowsVisible = this.numRowsVisible + 10;
      }
    },
    applyFilters() {
      this.rows = this.newHSK.filter(
        (word) =>
          (!this.search ||
            word.num.includes(this.search) ||
            word.simplified.includes(this.search) ||
            word.definitions.includes(this.search)) &&
          (!this.start || Number(word.num) > this.start) &&
          (!this.level || word.level === this.level)
      );
    },
  },
};
</script>
<style>
</style>
