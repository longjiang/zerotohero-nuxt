<template>
  <div id="entry-morphology" class="widget">
    <div class="widget-title">Word forms of “{{ word.bare }}”</div>
    <div class="widget-body jumbotron-fluid p-4">
      <div class="row">
        <div
          v-if="Helper.isEmpty(tables) || tables.length === 0"
          class="pl-4 pr-4 text-center"
        >
          The word “{{ word.bare }}” seems to only take on one form.
        </div>
        <div
          class="col-sm-12 form-table"
          v-for="(table, tableName) in tables"
        >
          <h6>
            {{
              tableName === 'verbs'
                ? Helper.ucFirst(
                    table.find(field => field.field === 'aspect').form
                  )
                : ''
            }}
            {{ Helper.ucFirst(tableName) }}
            {{
              tableName === 'adjectives'
                ? parseInt(
                    table.find(field => field.field === 'incomparable').form
                  ) === 0
                  ? ' (Comprable)'
                  : ' (Incomprable)'
                : ''
            }}
          </h6>
          <hr class="mt-0 mb-3" />
          <table>
            <tbody>
              <tr
                v-for="row in table"
                v-if="row.field !== 'aspect' && row.field !== 'incomparable'"
              >
                <td>
                  {{ row.field }}
                </td>
                <td  class="pl-3">
                  <b :data-level="word.level || 'outside'"
                    >{{ row.form || 'n/a'
                    }}{{
                      row.field && row.field.startsWith('imperative') ? '!' : ''
                    }}</b
                  >
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Helper from '@/lib/helper'

export default {
  props: {
    word: {
      type: Object
    }
  },
  data() {
    return {
      Helper,
      tables: []
    }
  },
  methods: {
    async getTables() {
      // https://www.consolelog.io/group-by-in-javascript/
      let forms = await (await this.$getDictionary()).wordForms(this.word)
      forms = forms.filter(form => form.table !== 'head')
      for (let form of forms) {
        form.form = await (await this.$getDictionary()).accent(form.form)
        form.field = await (await this.$getDictionary()).stylize(form.field)
        form.table = await (await this.$getDictionary()).stylize(form.table)
      }
      this.tables = Helper.groupArrayBy(forms, 'table')
    }
  },
  mounted() {
    this.getTables()
  },
  watch: {
    word() {
      this.getTables()
    }
  }
}
</script>
<style scoped>
@media screen and (min-width: 768px) {
  .form-table {
    columns: 2; column-gap: 2rem;
  }
}
</style>