<template>
  <div class="search-compare-wrapper">
    <div
      :class="{ 'loader text-center': true, 'd-none': !loading }"
      style="flex: 1"
    >
      <Loader />
    </div>
    <Search
      ref="search"
      :defaultURL="urlFunc"
      :hrefFunc="compareEntry ? compareHrefFuncFirst : undefined"
      :random="random"
      :type="type"
      :entry="searchEntry"
      :term="term"
      :placeholder="$t('Search')"
      v-if="!loading"
    ></Search>
    <Search
      :class="{ 'ml-2': true, hidden: !showCompare }"
      :entry="compareEntry"
      :term="compareTerm"
      ref="compare"
      :type="type"
      :placeholder="$t('Compare with')"
      :defaultURL="compareUrlFunc"
      :hrefFunc="compareHrefFunc"
      v-if="!loading"
    ></Search>
    <button
      class="btn btn-primary ml-2"
      @click="compareClick"
      v-if="!loading"
      style="height: 37px"
    >
      <span v-if="showCompare"><i class="fas fa-times"></i></span>
      <span v-if="!showCompare">
        <i class="fas fa-adjust"></i>
        <span class="compare-btn-text ml-1">{{ $t('Compare') }}</span>
      </span>
    </button>
  </div>
</template>

<script>
import Search from "@/components/Search";

export default {
  props: {
    searchEntry: {
      type: Object,
      default: undefined,
    },
    compareEntry: {
      type: Object,
      default: undefined,
    },
    term: "",
    compareTerm: "",
    random: {
      default: false,
    },
    compare: {
      default: false,
    },
    urlFunc: {
      type: Function,
    },
    type: {
      default: "dictionary", // can also be 'generic'
    },
  },
  components: {
    Search,
  },
  data() {
    return {
      loading: this.type !== "generic",
      showCompare: this.compare,
    };
  },
  async mounted() {
    await this.$getDictionary();
    this.loading = false;
  },
  methods: {
    /**
     * Where the user goes when they click on 'Look up this up as a phrase' in the Compare search field
     * @param {String} compareTerm
     * @returns {String}
     */
    compareUrlFunc(compareTerm) {
      // In this scenario, the second search field is a phrase (not a dictionary entry)
      // If the first search field is a phrase
      if (!this.searchEntry) return `/${this.$l1.code}/${this.$l2.code}/phrase/compare/${this.term}/${compareTerm}`;
      // If the first search field is a dictionary entry
      if (this.searchEntry) return `/${this.$l1.code}/${this.$l2.code}/phrase/compare/${this.searchEntry.head}/${compareTerm}`;
    },
    /**
     * Function to generate the href for the compare search when the user clicks on a dictionary entry suggestion (compareEntry)
     * @param {Object} compareEntry
     * @returns {String}
     */
    compareHrefFunc(compareEntry) {
      const entry = this.$refs.search.entry || this.entry;
      // If the first search field is a dictionary entry
      if (entry && compareEntry) {
        return `/${this.$l1.code}/${this.$l2.code}/compare/${this.$store.state.settings.dictionaryName}/${entry.id},${compareEntry.id}`;
      }
      // If the first search field is a phrase
      return `/${this.$l1.code}/${this.$l2.code}/phrase/compare/${this.term}/${compareEntry.head}`;
    },
    compareHrefFuncFirst(entry) {
      if (!entry) return;
      return `/${this.$l1.code}/${this.$l2.code}/compare/${this.$store.state.settings.dictionaryName}/${entry.id},${this.compareEntry.id}`;
    },
    focusOnSearch() {
      this.$refs.search.focusOnInput();
    },
    compareClick() {
      this.showCompare = this.showCompare ? false : true;
    },
  },
};
</script>

<style>
.search-compare-wrapper {
  display: flex;
  position: relative;
  width: 100%;
  max-width: 50rem;
  margin: 0 auto;
}

.search-compare-wrapper .search-wrapper {
  flex: 1;
}

.search-compare-wrapper .input-group > * {
  height: 2.3rem;
}

@media (max-width: 480px) {
  .compare-btn-text {
    display: none;
  }
}
</style>
