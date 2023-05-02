<template>
  <Widget id="entry-morphology">
    <template #title>{{
      $t("Word forms of “{word}”", { word: word.head })
    }}</template>
    <template #body>
      <div class="row">
        <div
          :class="{ 'loader text-center mt-4': true, 'd-none': !checking }"
          style="flex: 1"
        >
          <Loader :sticky="true" message="Searching for word forms..." />
        </div>
        <div
          v-if="!checking && (isEmpty(tables) || tables.length === 0)"
          class="pl-4 pr-4 text-center"
        >
          {{
            $t("The word “{word}” seems to only take on one form.", {
              word: word.head,
            })
          }}
        </div>
        <div
          class="col-sm-12 form-table"
          v-for="(table, tableName) in tables"
          :key="`form-table-${tableName}`"
        >
          <h6 class="mt-2">
            {{
              tableName === "verbs"
                ? ucFirst(table.find((field) => field.field === "aspect").form)
                : ""
            }}
            {{ ucFirst(tableName) }}
            {{
              tableName === "adjectives"
                ? parseInt(
                    table.find((field) => field.field === "incomparable").form
                  ) === 0
                  ? " (Comprable)"
                  : " (Incomprable)"
                : ""
            }}
          </h6>
          <hr class="mt-0 mb-1" />
          <div class="form-table-content mb-2">
            <table class="w-100">
              <tbody>
                <tr
                  v-for="(row, rowIndex) in table
                    .filter(
                      (row) =>
                        row.field !== 'aspect' && row.field !== 'incomparable'
                    )
                    .sort((a, b) => a.field.localeCompare(b.field))"
                  :key="`form-table-row-${rowIndex}`"
                  style="border-bottom: 1px solid #eee; vertical-align: top"
                >
                  <td :class="{ 'pr-1 pt-1 pb-1': row.field }">
                    {{ row.field }}
                  </td>
                  <td class="pt-1 pb-1">
                    <b :data-level="word.level || 'outside'">
                      {{ row.form || "n/a"
                      }}{{
                        row.field && row.field.startsWith("imperative")
                          ? "!"
                          : ""
                      }}
                    </b>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>
  </Widget>
</template>

<script>
import { isEmpty, ucFirst, groupArrayBy } from "@/lib/utils";

export default {
  props: {
    word: {
      type: Object,
    },
  },
  data() {
    return {
      tables: [],
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
    isEmpty(...args) {
      return isEmpty(...args);
    },
    ucFirst(...args) {
      return ucFirst(...args);
    },
    async getTables() {
      // https://www.consolelog.io/group-by-in-javascript/
      this.checking = true;
      let dictionary = await this.$getDictionary();
      let forms = await dictionary.inflect(this.word.head);
      forms = forms.filter((form) => form.table !== "head");
      this.tables = groupArrayBy(forms, "table");
      this.checking = false;
    },
  },
};
</script>
<style scoped>
@media screen and (min-width: 768px) {
  .form-table-content {
    columns: 1;
    column-gap: 2rem;
  }
}
@media screen and (min-width: 992px) {
  .form-table-content {
    columns: 2;
    column-gap: 2rem;
  }
}
@media screen and (min-width: 1200px) {
  .form-table-content {
    columns: 3;
    column-gap: 2rem;
  }
}
</style>
