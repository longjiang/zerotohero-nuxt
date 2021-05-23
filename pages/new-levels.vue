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
        <div>
          <h3 class="mt-5 mb-5 text-center">
            New HSK 3.0 Word List (9 Levels)
          </h3>
          <div class="text-center">
            <Loader class="mt-5" />
          </div>
          <div
            class="d-flex"
            style="margin: 0 auto 3rem auto"
            v-if="newHSK && newHSK.length > 0"
            v-cloak
          >
            <div class="input-group" style="flex: 1">
              <input
                v-model.lazy="search"
                type="text"
                class="form-control lookup"
                placeholder="Filter by keywords"
              />
              <div class="input-group-append">
                <button class="btn btn-danger lookup-button" type="button">
                  <i class="glyphicon glyphicon-filter"></i> Filter
                </button>
              </div>
            </div>
            <a
              href="https://server.chinesezerotohero.com/data/hsk-cedict/new_hsk.csv.txt"
              class="ml-2 btn btn-primary"
              download
              ><i class="fa fa-download mr-1" />Download CSV</a
            >
          </div>
          <table class="table" v-if="newHSK.length > 0">
            <thead>
              <tr>
                <th>级</th>
                <th>#</th>
                <th style="min-width: 6em">词头</th>
                <th style="min-width: 6em">拼音</th>
                <th>英语释义 (<a href="https://cc-cedict.org/">CC-CEDICT</a>)</th>
                <th>POS</th>
                <th>Example</th>
                <th>Alternative</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="word in newHSK"
                :class="{
                  'new-levels-table-row': true,
                  hidden: !(
                    !search ||
                    word.num.includes(search) ||
                    word.simplified.includes(search) ||
                    word.definitions.includes(search)
                  ),
                }"
              >
                <td>{{ word.level }}</td>
                <td>{{ word.num }}</td>
                <td>
                  <Annotate :sticky="true" :phonetics="false"
                    ><span>{{ word.simplified }}</span></Annotate
                  >
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
export default {
  components: {},
  data() {
    return {
      newHSK: [],
      search: '',
    }
  },
  async mounted() {
    let newHSK = await (await this.$getDictionary()).getNewHSK()
    this.newHSK = newHSK
  },
  methods: {},
}
</script>
<style>
</style>
