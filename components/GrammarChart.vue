<template>
  <div>
    <SocialHead
      v-if="grammar"
      :title="`${$l2.name} Grammar Cheatsheet | Language Player`"
      :description="`${grammar
        .slice(0, 10)
        .map((g) => g.structure + ' (' + g.english + ')')
        .join(' | ')}`"
    />
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
            {{ $t('Filter') }}
          </button>
        </div>
      </div>
      <a
        :href="csvSource"
        class="ml-2 btn btn-primary"
        :download="`Language Player ${$l2.name} Grammar Chart.csv`"
      >
        <i class="fa fa-download mr-1" />
        Download CSV
      </a>
    </div>
    <div class="tabs text-center">
      <span class="mr-2">{{ l2LevelKey.toUpperCase() }}</span>
      <button
        v-for="(l, n) in filteredLevels"
        class="tab text-dark"
        :data-bg-level="n"
        @click="level = n"
        :key="`grammar-tab-level-${n}`"
      >
        {{ l[l2LevelKey] || l.cefr }}
      </button>
      <button @click="level = undefined" class="tab text-light bg-dark">
        All
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
          v-for="row in grammarFiltered"
          :key="`grammar-row-${row.id}`"
          :class="{
            'grammar-table-row': true,
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
import { unique } from "@/lib/utils/array";
import { LEVELS, l2LevelKey } from "@/lib/utils/language-levels";
export default {
  data() {
    return {
      search: "",
      level: undefined,
      grammar: [],
      csvSource: undefined,
      LEVELS,
    };
  },
  async fetch() {
    let grammar = await this.$getGrammar();
    this.grammar = grammar._grammarData;
    this.csvSource = await grammar.getCSVSource(this.$l2["iso639-3"]);
    this.level = this.availableLevels[0];
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
    availableLevels() {
      return unique(this.grammar.map((r) => r.level));
    },
    l2LevelKey() {
      return l2LevelKey(this.$l2.code)
    },
    grammarFiltered() {
      return this.grammar.filter((row) => {
        if (this.search) {
          if (
            !row.structure.includes(this.search) &&
            !row.english.includes(this.search)
          ) {
            return false;
          }
        }
        if (this.level) {
          if (row.level !== String(this.level)) return false;
        }
        return true;
      });
    },
    filteredLevels() {
      let levels = Object.assign({}, LEVELS);
      for (let level in LEVELS) {
        if (!this.availableLevels.includes(level)) {
          delete levels[level];
        }
      }
      return levels;
    },
  },
  watch: {
    search() {
      if (this.search) this.level = undefined;
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

<style lang="scss" scoped>
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
