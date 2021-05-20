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
          class="col-sm-12 col-md-6 col-lg-4 mb-4"
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
                <td>
                  <b :data-level="word.level || 'outside'" class="ml-2"
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
      Array.prototype.groupBy = function(prop) {
        return this.reduce(function(groups, item) {
          const val = item[prop]
          groups[val] = groups[val] || []
          groups[val].push(item)
          return groups
        }, {})
      }
      let forms = await (await this.$dictionary).wordForms(this.word)
      for (let form of forms) {
        form.form = await (await this.$dictionary).accent(form.form)
        form.field = await (await this.$dictionary).stylize(form.field)
        form.table = await (await this.$dictionary).stylize(form.table)
      }
      this.tables = forms.groupBy('table')
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
