<router>
  {
    path: '/:l1/:l2/saved-words',
    meta: {
      title: 'Saved Words | Zero to Hero',
      metaTags: [
        {
          name: 'description',
          content: 'Study, manage, import, export the words you saved.'
        }
      ]
    }
  }
</router>
<template>
  <div class="main container mt-4 mb-4" v-cloak>
    <div class="row">
      <div class="col-sm-12">
        <h4>{{ $t('My Words') }}</h4>
        <p>
          {{ $t("These words are stored in your browser's local storage, which persists unless you clear your browsing data.") }}
        </p>
        <hr />
        <div class="my-words-tools mt-2 mb-2 text-right">
          <button
            class="upload-list btn btn-primary"
            v-on:click="showExportClick"
            :disabled="this.sW.length <= 0"
          >
            <i class="glyphicon glyphicon-cloud-download"></i> {{ $t('Export CSV') }}
          </button>&nbsp;
          <button
            class="remove-all btn btn-danger"
            v-on:click="removeAllClick"
            :disabled="this.sW.length <= 0"
          >
            <i class="glyphicon glyphicon-trash"></i>
            {{ $t('Clear') }}
          </button>
          <div class="export-wrapper text-left mt-4" v-if="showExport">
            <p v-html="$t('copyPasteCSV')" />
            <b-form-group :label="$t('Include:')">
              <b-form-checkbox-group v-model="selectedCsvOptions" :options="csvOptions" @click="updateCSVText()"></b-form-checkbox-group>
            </b-form-group>
            <textarea
              id="export-textarea"
              class="mt-2 mb-2 form-control"
              cols="30"
              rows="10"
              v-model="csvText"
            ></textarea>
          </div>
        </div>
      </div>
    </div>
    <!-- .row -->
    <div class="row">
      <div class="col-sm-12">
        <p v-if="loaded && sW.length <= 0" class="alert alert-warning no-saved-words">
          You don't have any words saved yet. Save words by clicking on the
          <i
            class="glyphicon glyphicon-star-empty"
          ></i> icon next to it.
        </p>
        <div>
          <Loader />
          <WordList :words="sW"></WordList>
          <a
            v-if="sW.length > 0"
            class="btn btn-warning mt-4 mb-5"
            :href="`/${$l1.code}/${$l2.code}/learn/saved`"
          >
            <i class="fa fa-chalkboard"></i> Learn These Words
          </a>
        </div>
      </div>
    </div>
    <!-- .row -->
  </div>
  <!-- .container -->
</template>

<script>
import WordList from '@/components/WordList.vue'

export default {
  template: '#saved-words-template',
  components: {
    WordList
  },
  data() {
    return {
      loaded: false,
      csvText: '',
      showExport: false,
      sW: [],
      selectedCsvOptions: ['en', 'definitions'],
      csvOptions: [
        { text: this.$t(this.$l2.name), value: this.$l2.code },
        { text: this.$t('Pronunciation'), value: 'pronunciation' },
        { text: this.$t('Definitions'), value: 'definitions' }
      ]
    }
  },
  watch: {
    async selectedCsvOptions() {
      this.csvText = await this.csv()
    }
  },
  mounted() {
    this.updateWords()
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type.startsWith("savedWords")){
        this.updateWords()
      }
    })
  },
  beforeDestroy() {
    // you may call unsubscribe to stop the subscription
    this.unsubscribe()
  },
  methods: {
    async updateWords() {
      this.sW = []
      if(this.$root.savedWords && this.$root.savedWords[this.$l2.code]) {
        for (let savedWord of this.$root.savedWords[this.$l2.code]) {
          let word = await (await this.$getDictionary()).get(savedWord.id)
          if (word) {
            this.sW.push(word)
          }
        }
      }
    },
    async csv() {
      if (this.sW.length <= 0) {
        return ''
      }

      let csv = ''
      for (let word of this.sW) {
        if (this.selectedCsvOptions.includes('en')) {
          let a = word.accented
          csv += `${a}\t`
        }
        if (this.selectedCsvOptions.includes('pronunciation')) {
          csv += `${word.pronunciation ? word.pronunciation : ''}\t`
        }

        if (this.selectedCsvOptions.includes('definitions')) {
          csv += `${word.definitions ? word.definitions.join(', ') : ''}\t`
        }
        csv += '\n'
      }
      return csv
    },
    showImportClick() {
      $('.import-wrapper').toggleClass('hidden')
    },
    async updateCSVText() {
      this.csvText = await this.csv()
    },
    showExportClick() {
      this.showExport = !this.showExport
      this.updateCSVText()
    },
    removeAllClick() {
      const confirmed = confirm(
        'Are you sure you want to remove all your saved words?'
      )
      if (confirmed) {
        this.$store.dispatch('savedWords/removeAll', {
          l2: this.$l2.code
        })
        $('.export-wrapper').toggleClass('hidden', true)
      }
    }
  }
}
</script>
