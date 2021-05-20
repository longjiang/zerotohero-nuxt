<router>
  {
    path: '/:l1/:l2/endings',
    meta: {
      title: 'Lookup Case Endings | Zero to Hero',
      metaTags: [
        {
          name: 'description',
          content: 'Figure out the dictionary form and case by looking up the ending.'
        }
      ]
    }
  }
</router>
<template>
  <div>
    <div class="container main mt-5 mb-5">
      <div class="row">
        <div class="col-sm-12">
          <h3>Lookup Russian Case Ending</h3>
          <hr class="mb-3" />
          <p>
            This tool allows you to identify a case-gender-number combinations
            of a preposition-adjective-noun phrase.
          </p>
          <p>
            For example, if you came across the phrase
            <b>"в ослепительных снах"</b>, you wonder what case this is:
          </p>
          <ol>
            <li>
              Lookup "в " (with a space) in the first ("prepositions") column
            </li>
            <li>Look up "ых" in the second column</li>
            <li>Lookup "нах" in the third column</li>
            <li>
              Now we can find the common case across the three columns. From the
              second column, we can see that the ending "ах" can only be
              prepositional plural. As for the gender, it can be any.
            </li>
          </ol>
          <hr />
        </div>
      </div>
      <div class="row">
        <div class="col-md-4" role="form">
          <p>Lookup prepositions</p>
          <div class="input-group mb-3">
            <input
              type="text"
              id="search-field-3"
              class="form-control"
              v-model="preposition"
              placeholder="в"
            />
            <div class="input-group-append">
              <button id="lookup-3" class="btn btn-success" type="button">
                <i class="fas fa-search" />
              </button>
            </div>
          </div>
          <div v-if="preposition" class="results-3">
            <p class="result-heading-3">
              Prepositions matching
              <b>"{{ preposition }}"</b>:
            </p>
            <ul class="result-list-3">
              <li
                class="result-item"
                v-for="(message, index) in prepositionMessages"
                v-html="message"
                :key="`mp-${mKey + index}`"
              ></li>
            </ul>
          </div>
        </div>
        <div class="col-md-4" role="form">
          <p>Lookup noun/adj ending</p>
          <EndingLookup v-if="files" :files="files" />
        </div>
        <div class="col-md-4" role="form">
          <p>Lookup noun/adj ending</p>
          <EndingLookup v-if="files" :files="files" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import EndingLookup from '@/components/EndingLookup'

export default {
  components: {
    EndingLookup
  },
  mounted() {
    loadAllCsvsThen(files => {
      this.files = files
    })
  },
  data() {
    return {
      files: undefined,
      mKey: 0,
      preposition: ''
    }
  },
  computed: {
    prepositionMessages() {
      // return [this.ending2]
      return lookupPrepositions(this.preposition, this.files)
    }
  }
}
</script>
