<router>
  {
    path: '/:l1/:l2/explore/new-levels-graphic',
    meta: {
      title: 'Words in the New HSK 3.0 Visualized | Zero to Hero',
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
          <h2 class="mb-4">Words by the new HSK 3.0 (2021-2025?) levels</h2>
          <Loader class="mt-5" />
          <span v-for="level in ['1', '2', '3', '4', '5', '6']" style="display: inline-block; overflow: hidden; line-height: 30px; margin-right: 15px; font-weight: bold">
            <div :data-bg-level="level" class="word-square" style="margin-right: 5px">

            </div>
            <span>Current HSK {{ level }}</span>
          </span>
          <div>
            <div v-for="level in ['1', '2', '3', '4', '5', '6', '7-9']">
              <h4 style="clear: both; padding-top: 2rem">New HSK Level {{ level }}</h4>
              <div
                v-for="word in newHSK.filter((word) => word.level == level).sort( (a, b) => a.simplified.length - b.simplified.length).sort( (a, b) => {
                  let ahsk = a.hsk === 'outside' ? 7 : a.hsk ? a.hsk : 7
                  let bhsk = b.hsk === 'outside' ? 7 : b.hsk ? b.hsk : 7
                  return ahsk - bhsk
                })"
                :data-bg-level="word.hsk ? word.hsk : 'outside'" 
                class="word-square"
              >
                {{ word.simplified }}
              </div>
            </div>
          </div>
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
    }
  },
  async mounted() {
    let newHSK = await (await this.$dictionary).getNewHSK()
    newHSK = newHSK
    for (let word of newHSK) {
      let w = await (await this.$dictionary).lookup(word.simplified)
      if (w) {
        word.hsk = w.hsk
        word.pinyin = w.pinyin
        word.definitions = w.definitions
          .filter((def) => !def.startsWith('CL'))
          .join('; ')
      }
    }
    this.newHSK = newHSK
  },
  methods: {},
}
</script>
<style>
</style>
