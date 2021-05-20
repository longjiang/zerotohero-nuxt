<template>
  <div class="search-compare-wrapper" v-if="!loading">
    <Search ref="search" :defaultURL="urlFunc" :hrefFunc="compareEntry ? compareHrefFuncFirst : undefined" :random="random" :type="type" :entry="searchEntry" :term="term" :placeholder="$t('Look up words here...')"></Search>
    <Search
      :class="{ 'ml-2': true, hidden: !showCompare }"
      :entry="compareEntry"
      :term="compareTerm"
      ref="compare"
      :type="type"
      placeholder="Compare with..."
      :defaultURL="compareUrlFunc"
      :hrefFunc="compareHrefFunc"
    ></Search>
    <button class="btn btn-compare ml-2" @click="compareClick">
      <span v-if="showCompare"><i class="fas fa-times"></i></span
      ><span v-if="!showCompare"
        ><i class="fas fa-adjust"></i>
        <span class="compare-btn-text ml-1">Compare</span></span
      >
    </button>
  </div>
</template>

<script>
import Helper from '@/lib/helper'
import Search from '@/components/Search'

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
    term: '',
    compareTerm: '',
    random: {
      default: false
    },
    compare: {
      default: false
    },
    urlFunc: {
      type: Function
    },
    compareUrlFunc: {
      type: Function,
    },
    type: {
      default: 'dictionary', // can also be 'generic'
    }
  },
  components: {
    Search
  },
  data() {
    return {
      Helper,
      Search,
      loading: this.type !== 'generic',
      showCompare: this.compare
    }
  },
  async mounted() {
    await this.$dictionary
    this.loading = false
  },
  methods: {
    compareHrefFunc(compareEntry) {
      const entry = this.$refs.search.entry || this.entry
      return `/${this.$l1.code}/${this.$l2.code}/compare/${this.$dictionaryName}/${entry.id},${compareEntry.id}`
    },
    compareHrefFuncFirst(entry) {
      return `/${this.$l1.code}/${this.$l2.code}/compare/${this.$dictionaryName}/${entry.id},${this.compareEntry.id}`
    },
    focusOnSearch() {
      console.log('focus on seach')
      this.$refs.search.focusOnInput()
    },
    compareClick() {
      this.showCompare = this.showCompare ? false : true
    }
  }
}
</script>

<style>

.search-compare-wrapper {
  display: flex;
  position: relative;
  max-width: 50rem;
  margin: 0 auto;
}

.search-compare-wrapper .search-wrapper {
  flex: 1;
}

.search-compare-wrapper .input-group > * {
  height: 2.3rem;
}

.btn-random {
  position: absolute;
  right: 3rem;
  font-size: 0.8rem;
  line-height: 0.8rem;
  height: 1.7rem !important;
  top: 0.3rem;
  background: #cacaca;
  border: none;
}

@media (max-width: 480px) {
  .compare-btn-text {
    display: none;
  }
}


@media (max-width: 768px) {
  .btn-random span {
    display: none;
  }
}

.btn-compare {
  color: #fd4f1c;
}

.btn-compare:hover {
  color: white;
  background: #fd4f1c;
}</style>
