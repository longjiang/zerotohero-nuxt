<template>
  <Widget id="entry-morphology">
    <template #title>{{ $t("Word forms of “{word}”", { word: word.head }) }}</template>
    <template #body>
      <div class="row">
        <div v-if="checking" class="loader text-center mt-4" style="flex: 1">
          <Loader :sticky="true" message="Searching for word forms..." />
        </div>
        <div v-if="!checking && (isEmpty(tables) || tables.length === 0)" class="empty-state text-center">
          {{ $t("The word “{word}” seems to only take on one form.", { word: word.head }) }}
        </div>
        <div v-for="(table, tableName) in tables" :key="`form-table-${tableName}`" class="col-12 form-table">
          <div class="header-banner rounded mt-2" :data-bg-level="word.level || 'outside'">
            <h5 class="header-title">{{ formatTableName(tableName, table) }}</h5>
          </div>
          <hr class="mt-0 mb-1" />
          <table class="table w-100">
            <tbody>
              <tr v-for="(row, rowIndex) in filteredAndSortedTableRows(table)" :key="`form-table-row-${rowIndex}`">
                <td class="field-name">{{ row.field }}</td>
                <td class="field-value" :data-level="word.level || 'outside'"><strong>{{ row.form || "n/a" }}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </Widget>
</template>

<script>
import { isEmpty, ucFirst, groupArrayBy } from "../lib/utils";

export default {
  props: {
    word: {
      type: Object,
    },
  },
  data() {
    return {
      tables: {},
      checking: true,
    };
  },
  watch: {
    word() {
      this.getTables();
    },
  },
  mounted() {
    this.getTables();
  },
  methods: {
    isEmpty,
    ucFirst,
    formatTableName(tableName, table) {
      if (tableName === "verbs") {
        return `${ucFirst(table.find(field => field.field === "aspect").form)} ${ucFirst(tableName)}`;
      }
      if (tableName === "adjectives") {
        return `${ucFirst(tableName)}${parseInt(table.find(field => field.field === "incomparable").form) === 0 ? " (Comparable)" : " (Incomparable)"}`;
      }
      return ucFirst(tableName);
    },
    filteredAndSortedTableRows(table) {
      return table
        .filter(row => row.field !== 'aspect' && row.field !== 'incomparable')
        .sort((a, b) => a.field.localeCompare(b.field));
    },
    async getTables() {
      this.checking = true;
      let dictionary = await this.$getDictionary();
      let forms = await dictionary.inflect(this.word.head);
      forms = forms.filter(form => form.table !== "head");
      this.tables = groupArrayBy(forms, "table");
      this.checking = false;
    },
  },
};
</script>

<style scoped>
.header-banner {
  color: white;
  text-align: center;
  padding: 0.3rem 0;
}
.header-title {
  margin: 0;
  font-size: 1.2em;
}
.form-table h6 {
  font-weight: bold;
}
.loader {
  display: flex;
  justify-content: center;
  align-items: center;
}
.empty-state {
  padding: 20px;
  font-size: 1em;
}
.table {
  margin-bottom: 0;
}
.field-name, .field-value {
  padding: 0.5rem;
}
.field-name {
  width: 50%;
  text-align: left;
  border: none;
}
.field-value {
  width: 50%;
  text-align: left;
  border: none;
}
</style>
