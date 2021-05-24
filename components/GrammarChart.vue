<template>
  <div>
    <SocialHead
      v-if="grammar"
      :title="`HSK 1-9 Chinese Grammar Cheatsheet  | ${$l2.name} Zero to Hero`"
      :description="`${grammar
        .slice(0, 10)
        .map((g) => g.structure + ' (' + g.english + ')')
        .join(' | ')}`"
    />
    <div class="text-center">
      <Loader class="mb-5" />
    </div>
    <div
      class="d-flex"
      style="margin: 0 auto 3rem auto"
      v-if="grammar && grammar.length > 0"
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
      <a
        href="https://server.chinesezerotohero.com/data/zh-grammar/zh-grammar.csv.txt"
        class="ml-2 btn btn-primary"
        download="Chinese Zero to Hero Grammar Chart.csv"
      >
        <i class="fa fa-download mr-1" />
        Download CSV
      </a>
    </div>
    <div class="tabs text-center">
      <button @click="level = undefined" class="tab text-light bg-dark">
        All 🤦
      </button>
      <button
        v-for="n in 6"
        class="tab text-dark"
        :data-bg-level="n"
        @click="level = n"
      >
        HSK {{ n }}
      </button>
      <button class="tab text-dark" data-bg-level="7-9" @click="level = '7-9'">
        新 HSK 7-9
      </button>
      <div
        style="height: 0.5rem"
        :data-bg-level="level"
        :class="{ 'bg-dark': level ? false : true }"
      ></div>
    </div>
    <table
      v-if="grammar && grammar.length > 0"
      class="table table-responsive grammar-table"
    >
      <thead>
        <tr>
          <th class="text-center">Lesson</th>
          <th>Structure</th>
          <th>English</th>
          <th style="min-width: 20rem">Example</th>
          <th>Example Translation</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in grammar"
          :class="{
            'grammar-table-row': true,
            hidden: !(
              (!search ||
                row.structure.includes(search) ||
                row.english.includes(search)) &&
              (level === undefined || row.book === String(level))
            ),
          }"
          @click="grammarRowClick(row)"
        >
          <td class="text-center align-middle">
            <span>
              <a
                v-if="row.url !== ''"
                :href="`${row.url}`"
                class="btn btn-secondary"
                style="white-space: nowrap"
              >
                <i class="glyphicon glyphicon-facetime-video"></i>
                {{ row.code }}
              </a>
              <span v-else>{{ row.code }}</span>
            </span>
          </td>
          <td class="align-middle">
            <Annotate>
              <span
                v-html="highlightMultiple(row.structure, row.words, row.book)"
              />
            </Annotate>
          </td>
          <td class="align-middle">
            <span>{{ row.english }}</span>
          </td>
          <td class="align-middle">
            <Annotate>
              <span
                v-html="highlightMultiple(row.example, row.words, row.book)"
              />
            </Annotate>
          </td>
          <td class="align-middle">
            <span>{{ row.exampleTranslation }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import Helper from "@/lib/helper";
export default {
  data() {
    return {
      search: "",
      level: undefined,
      grammar: [],
    };
  },
  async fetch() {
    let grammar = await this.$getGrammar();
    this.grammar = grammar._grammarData;
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
  methods: {
    highlightMultiple(a, b) {
      return Helper.highlightMultiple(a, b);
    },
    grammarRowClick(row) {
      this.$router.push({
        path: `/${this.$l1.code}/${this.$l2.code}/grammar/view/${row.id}`,
      });
    },
  },
};
</script>

<style lang="scss">
.grammar-table {
  color: #666;

  .grammar-table-row:hover {
    background-color: #f1f1f1;
    cursor: pointer;
  }
}

.grammar-table [data-level] {
  font-weight: bold;
}
</style>
