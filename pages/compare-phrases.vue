<router>
  {
    path: '/:l1/:l2/phrase/compare/:term/:compareTerm',
    props: true,
  }
</router>
<template>
  <div class="phrase main">
    <SocialHead :title="title" :description="description" :image="image" />
    <div class="container main pt-5 mb-5">
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
              :preloaded="aImages"
            />
        </div>
        <div class="col-md-6">
            <WebImages
              v-if="compareTerm"
              :text="compareTerm"
              limit="10"
              class="mt-5"
              :key="`${compareTerm}-images`"
              :preloaded="bImages"
            />
        </div>
      </div>
      <div class="row">
        <div class="col-sm-12">
          <div
            class="widget mt-5"
            id="search-subs"
            v-if="term && compareTerm"
            :key="`compare-subs-search-${term}-${compareTerm}`"
          >
            <div class="widget-title">“{{ term }}” in TV Shows</div>
            <div class="widget-body">
              <LazyCompareSearchSubs
                ref="searchSubs"
                level="outside"
                :key="`${term}-${compareTerm}-compare-search-subs`"
                :termsA="[term]"
                :termsB="[compareTerm]"
              />
            </div>
          </div>
          <div class="focus">
            <CompareCollocations
              v-if="term && compareTerm"
              :term="term"
              :compareTerm="compareTerm"
              class="mt-5"
              :key="`${term}-${compareTerm}-col`"
            />
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
import WordPhotos from '@/lib/word-photos'

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
      aImages: [],
      bImages: []
    }
  },
  async fetch() {
    this.aImages = await WordPhotos.getGoogleImages({
      term: this.term,
      lang: this.$l2.code,
    });
    this.bImages = await WordPhotos.getGoogleImages({
      term: this.compareTerm,
      lang: this.$l2.code,
    });

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
    title() {
      if (this.term && this.compareTerm) {
        return `“${this.term}” vs “${this.compareTerm}” - ${
          this.$l2 ? this.$l2.name : ""
        } Phrases Compared | ${this.$l2 ? this.$l2.name : ""} Zero to Hero`;
      }
      return `${this.$l2 ? this.$l2.name : ""} Phrases Compared | ${
        this.$l2 ? this.$l2.name : ""
      } Zero to Hero`;
    },
    description() {
      if (this.a && this.b) {
        return `See how the two ${this.$l2 ? this.$l2.name : ""} phrases “${
          this.term
        }” and “${
          this.compareTerm
        }” are used differently in common collocations and on TV shows.`;
      }
      return `Compare two  ${
        this.$l2 ? this.$l2.name : ""
      } phrases and see how they are used differently in common collocations and on TV shows.`;
    },
    image() {
      if (this.aImages.length > 0 || this.bImages.length > 0) {
        return this.bImages.length > 0 ? this.bImages[0].src : this.aImages[0].src;
      } else {
        return "/img/zth-share-image.jpg";
      }
    },
  },
  methods: {

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
}
</script>

<style></style>
