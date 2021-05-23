<router>
  {
    path: '/:l1/:l2/grammar/view/:id',
    props: true,
    meta: {
      title: 'Grammar Note | Zero to Hero',
      metaTags: [
        {
          name: 'description',
          content: 'Check out this grammar point.'
        }
      ]
    }
  }
</router>
<template>
  <div class="container mt-5 mb-5 pt-4 main" id="main">
    <div class="row">
      <div class="col-sm-12" v-if="grammar">
        <h6 class="mb-2 text-center">
          <button class="btn btn-small mr-1" v-if="id > 1" @click="prevClick">
            <i class="fa fa-caret-left" />
          </button>Grammar HSK{{ grammar.code }}
          <button class="btn btn-small" @click="nextClick">
            <i class="fa fa-caret-right" />
          </button>
        </h6>

        <GrammarPoint :grammar="grammar" :key="id" class="mb-5" />

        <div
          class="widget mt-5 mb-5"
          id="search-subs"
          v-if="grammar.pattern && delayed && (!entry || grammar.pattern !== entry.simplified)"
          :key="`subs-search-${grammar.pattern}`"
        >
          <div class="widget-title">“{{ grammar.pattern }}” in TV Shows</div>
          <div class="widget-body">
            <SearchSubsComp
              v-if="grammar.pattern"
              ref="searchSubs"
              :level="grammar.level"
              :terms="[grammar.pattern]"
            />
          </div>
        </div>
        <div v-if="entry">
          <hr />
          <DictionaryEntry
            v
            :entry="entry"
            :showSearchSubs="!(grammar.pattern && delayed && (!entry || grammar.pattern !== entry.simplified))"
            :showImages="false"
            ref="dictionaryEntry"
            :key="`dictionary-entry-${entry.id}`"
          />
        </div>

        <div class="text-left mt-5" v-if="drills && drills.length > 0">
          <hr />
          <h4 class="text-center">Practice Drills</h4>
          <Drill
            v-for="drill in drills"
            :drill="drill"
            :key="`drill-${grammar.id}-${drill.id}`"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import GrammarPoint from '@/components/GrammarPoint'
import Grammar from '@/lib/grammar'
import Drill from '@/components/Drill'
import SearchSubsComp from '@/components/SearchSubsComp'
import DictionaryEntry from '@/components/DictionaryEntry'
import Config from '@/lib/config'
import Helper from '@/lib/helper'

export default {
  components: {
    DictionaryEntry,
    GrammarPoint,
    Drill,
    SearchSubsComp,
  },
  props: {
    id: {
      type: String,
    },
  },
  data() {
    return {
      grammar: undefined,
      drills: [],
      delayed: false,
      entry: false,
    }
  },
  methods: {
    async getDrill(grammarID) {
      let response = await $.getJSON(
        `${Config.wiki}items/drills?filter[grammar_id][eq]=${grammarID}&fields=*,file.*`
      )
      if (response && response.data && response.data[0]) {
        this.drills = response.data
      }
    },
    async loadGrammar() {
      this.drills = []
      let grammar = (await this.$grammar)._grammarData.find(
        (row) => row.id === this.id
      )
      if (!this.grammar || grammar.pattern !== this.grammar.pattern)
        this.delayed = false
      this.grammar = grammar
      let entry = await (await this.$getDictionary()).lookup(
        this.grammar.structure.replace(/…….*/, '').replace(Helper.nonCjk, '')
      )
      this.entry =
        entry || (await (await this.$getDictionary()).lookup(this.grammar.pattern.replace(/\*.*/, '')))
      this.getDrill(this.grammar.id)
      setTimeout(() => {
        if (this.id === this.grammar.id) this.delayed = true
      }, 1000)
    },
    prevClick() {
      this.$router.push({
        path:
          `/${this.$l1.code}/${this.$l2.code}/grammar/view/` +
          Math.max(0, parseInt(this.id) - 1),
      })
    },
    nextClick() {
      this.$router.push({
        path:
          `/${this.$l1.code}/${this.$l2.code}/grammar/view/` +
          Math.min(Grammar._grammarData.length - 1, parseInt(this.id) + 1),
      })
    },
    keydown(e) {
      if (!['INPUT', 'TEXTAREA'].includes(e.target.tagName.toUpperCase()) && !e.metaKey) {
        // home
        if (e.keyCode == 36) {
          document.getElementById('main').scrollIntoView({ behavior: 'smooth' })
          console.log(
            document
              .getElementById('main')
              .scrollIntoView({ behavior: 'smooth' })
          )
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
        // n = 78
        if (e.keyCode == 78) {
          this.nextClick()
          document.getElementById('main').scrollIntoView({ behavior: 'smooth' })
          e.preventDefault()
          return false
        }
        // p = 80
        if (e.keyCode == 80) {
          this.prevClick()
          document.getElementById('main').scrollIntoView({ behavior: 'smooth' })
          e.preventDefault()
          return false
        }
      }
    },
    bindKeys() {
      document.addEventListener('keydown', this.keydown)
    },
    unbindKeys() {
      document.removeEventListener('keydown', this.keydown)
    },
  },
  mounted() {
    this.bindKeys()
    this.loadGrammar()
  },
  unmounted() {
    this.unbindKeys()
  },
  activated() {
    this.bindKeys()
  },
  deactivated() {
    this.unbindKeys()
  },
  watch: {
    id() {
      this.loadGrammar()
    },
  },
}
</script>

<style></style>
