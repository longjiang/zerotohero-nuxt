<router>
  {
    path: '/:l1/:l2/pinyin-list',
    meta: {
      title: 'Pinyin List | Zero to Hero',
      metaTags: [
        {
          name: 'description',
          content:
            'Get a list of pinyin transcriptions for the list of words you provide.'
        }
      ]
    }
  }
</router>
<template>
  <div>
    <div class="container main mt-4 mb-4">
      <div class="row">
        <div class="col-sm-12">
          <h4>Get pinyin for a list of words</h4>
          <p>
            Paste your list into the text box and get a table of all pinyin
            variations for each word.
          </p>
          <div v-if="csv">
            <h5 class="mt-4 mb-4">Your CSV</h5>
            <textarea
              class="mt-2 mb-2 form-control"
              style="overflow:visible"
              :rows="words.length"
              >{{ csv }}</textarea
            >
          </div>
          <textarea
            v-model="text"
            class="mt-2 mb-2 form-control"
            cols="30"
            rows="10"
            placeholder="Paste your list or Chinese words here to generate a pinyin table"
          ></textarea>
          <button class="btn btn-success btn-block" v-on:click="getPinyinClick">
            Get Pinyin
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      text: localStorage.getItem('pinyinList'),
      words: [],
      csv: '',
      ready: false
    }
  },
  beforeMount() {},
  methods: {
    getPinyinClick() {
      localStorage.setItem('pinyinList', this.text)
      this.lookup(this.text)
    },
    getCsv(words) {
      return words
        .map(candidates => {
          return candidates.map(candidate => candidate.pinyin).join('\t')
        })
        .join('\n')
    },
    lookup(text) {
      let words = text.split('\n').map(async line => {
        let seen = []
        let candidates = await (await this.$dictionary).lookupSimplified(line)
        this.words = candidates.filter(candidate => {
          const keep = !seen.includes(candidate.pinyin)
          seen.push(candidate.pinyin)
          return keep
        })
        this.csv = this.getCsv(this.words)
      })
      return words
    }
  }
}
</script>
