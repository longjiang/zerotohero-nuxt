<template>
  <div id="entry-morphology" class="widget">
    <div class="widget-title">Word forms of “{{ word.bare }}”</div>
    <div class="widget-body jumbotron-fluid p-4">
      <div class="row">
        <div
          :class="{ 'loader text-center mt-4': true, 'd-none': !checking }"
          style="flex: 1"
        >
          <Loader :sticky="true" message="Searching for word forms..." />
        </div>
        <div
          v-if="!checking && (Helper.isEmpty(tables) || tables.length === 0)"
          class="pl-4 pr-4 text-center"
        >
          The word “{{ word.bare }}” seems to only take on one form.
        </div>
        <div
          class="col-sm-12 form-table"
          v-for="(table, tableName) in tables"
          :key="`form-table-${tableName}`"
        >
          <h6 class="mt-2">
            {{
              tableName === "verbs"
                ? Helper.ucFirst(
                    table.find((field) => field.field === "aspect").form
                  )
                : ""
            }}
            {{ Helper.ucFirst(tableName) }}
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
                    <Annotate :buttons="false" :disableAnnotation="$l2.code === 'ko'">
                      <b :data-level="word.level || 'outside'">
                        {{ row.form || "n/a"
                        }}{{
                          row.field && row.field.startsWith("imperative")
                            ? "!"
                            : ""
                        }}
                      </b>
                    </Annotate>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Helper from "@/lib/helper";

export default {
  props: {
    word: {
      type: Object,
    },
  },
  data() {
    return {
      Helper,
      tables: [],
      checking: true,
    };
  },
  methods: {
    async getTables() {
      // https://www.consolelog.io/group-by-in-javascript/
      this.checking = true;
      let forms = await (await this.$getDictionary()).wordForms(this.word);
      forms = forms.filter((form) => form.table !== "head");
      for (let form of forms) {
        form.form = await (await this.$getDictionary()).accent(form.form);
        form.field = await (await this.$getDictionary()).stylize(form.field);
        form.table = await (await this.$getDictionary()).stylize(form.table);
      }
      this.tables = Helper.groupArrayBy(forms, "table");
      this.checking = false;
    },
  },
  mounted() {
    this.getTables();
  },
  watch: {
    word() {
      this.getTables();
    },
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