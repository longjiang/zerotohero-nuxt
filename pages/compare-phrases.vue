<router>
  {
    path: '/:l1/:l2/phrase/compare/:term/:compareTerm',
    props: true,
    meta: {
      title: 'Compare Two Phrases | Zero to Hero',
      metaTags: [
        {
          name: 'description',
          content: 'See how two phrases are different.'
        }
      ]
    }
  }
</router>
<template>
  <div class="phrase">
    <div class="container main mt-5 mb-5">
      <div class="row">
        <div class="col-sm-12">
          <h2 class="text-center mb-3">Lookup phrases not in the dictionary</h2>
          <p class="text-center mb-5">
            and see how they are used in real contexts.
          </p>
          <div class="search-compare-wrapper">
            <SearchCompare
              placeholder="Enter a word or phrase"
              type="generic"
              :term="term"
              :compare="true"
              :compareTerm="compareTerm"
              :random="false"
              :key="`${term}-${compareTerm}-search`"
              style="width: 100%"
              :urlFunc="
                (text) => `/${$l1.code}/${$l2.code}/phrase/${compareTerm ? 'compare' : 'search'}/${text}/${compareTerm ? compareTerm : '' }`
              "
              :compareUrlFunc="
                (text) => `/${$l1.code}/${$l2.code}/phrase/compare/${term}/${text}`
              "
            />
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-md-6">
            <WebImages
              v-if="term"
              :text="term"
              limit="10"
              class="mt-5"
              :key="`${term}-images`"
            />
        </div>
        <div class="col-md-6">
            <WebImages
              v-if="compareTerm"
              :text="compareTerm"
              limit="10"
              class="mt-5"
              :key="`${compareTerm}-images`"
            />
        </div>
      </div>
      <div class="row">
        <div class="col-sm-12">
          <div class="focus">
            <CompareCollocations
              v-if="term && compareTerm"
              :term="term"
              :compareTerm="compareTerm"
              class="mt-5"
              :key="`${term}-${compareTerm}-col`"
            />
          </div>
          <div
            class="widget mt-5"
            id="search-subs"
            v-if="term && compareTerm && delayed"
            :key="`subs-search-${term}`"
          >
            <div class="widget-title">“{{ term }}” in TV Shows</div>
            <div class="widget-body">
              <CompareSearchSubs
                ref="searchSubs"
                level="outside"
                :key="`${term}-${compareTerm}-compare-search-subs`"
                :termsA="[term]"
                :termsB="[compareTerm]"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-md-6">
          <Concordance
            v-if="term"
            :text="term"
            class="mt-5"
            :key="`${term}-concordance`"
          />
        </div>
        <div class="col-md-6">
          <Concordance
            v-if="compareTerm"
            :text="compareTerm"
            class="mt-5"
            :key="`${compareTerm}-concordance`"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Concordance from '@/components/Concordance'
import CompareCollocations from '@/components/CompareCollocations'
import SearchCompare from '@/components/SearchCompare'
import WebImages from '@/components/WebImages'
import CompareSearchSubs from '@/components/CompareSearchSubs'

export default {
  components: {
    SearchCompare,
    CompareCollocations,
    WebImages,
    Concordance,
    CompareSearchSubs,
  },
  props: {
    method: {
      type: String,
    },
    term: '',
    compareTerm: '',
  },
  data() {
    return {
      delayed: {
        default: false,
      },
    }
  },
  watch: {
    $route() {
      this.route()
    },
  },
  methods: {
    route() {
      this.delayed = false
      setTimeout(() => {
        this.delayed = true
      }, 1000)
    },

    bindKeys() {
      window.addEventListener('keydown', this.keydown)
    },
    unbindKeys() {
      window.removeEventListener('keydown', this.keydown)
    },

    keydown(e) {
      if (!['INPUT', 'TEXTAREA'].includes(e.target.tagName.toUpperCase()) && !e.metaKey) {
        // home
        if (e.keyCode == 36) {
          document
            .getElementById('main')
            .scrollIntoView({ behavior: 'smooth' })
          // this.$refs.searchCompare.focusOnSearch()
          e.preventDefault()
          return false
        }
        // end
        if (e.keyCode == 35) {
          document
            .getElementById('search-subs')
            .scrollIntoView({ behavior: 'smooth' })
          e.preventDefault()
          return false
        }
      }
    },
  },
  activated() {
    this.bindKeys()
  },
  deactivated() {
    this.unbindKeys()
  },
  mounted() {
    this.route()
  },
}
</script>

<style></style>
