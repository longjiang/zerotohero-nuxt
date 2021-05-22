<template>
  <div class="search-wrapper">
    <div class="input-group" v-cloak>
      <input
        @keyup.enter="go"
        @focus="active = true; $event.target.select()"
        @blur="cancel"
        v-model="text"
        type="text"
        class="form-control lookup"
        ref="lookup"
        :placeholder="placeholder || $t('Look up words here...')"
      />
      <router-link
        v-if="random"
        class="btn btn-secondary btn-random ml-2"
        :to="`/${$l1.code}/${$l2.code}/dictionary/${$store.state.settings.dictionaryName}/random`"
      >
        <i class="fas fa-random mr-1"></i>
        <span>{{ $t('Random') }}</span>
      </router-link>
      <div v-if="button" class="input-group-append">
        <button
          class="btn btn-primary lookup-button"
          v-on:click="go"
          type="button"
          title="Search"
        >
          <i class="fas fa-search"></i>
        </button>
      </div>
    </div>
    <div class="suggestions" :key="suggestionsKey" v-cloak v-if="active && text && text.length > 0">
      <router-link class="suggestion" v-for="(suggestion, index) in suggestions" :key="`search-suggestion-${index}-${suggestion.bare}`" :to="hrefFunc(suggestion)">
        <span v-if="suggestion">
          <span
            class="suggestion-word font-weight-bold mr-1"
            :data-level="suggestion.level || 'outside'"
          >{{ suggestion.bare }}</span>
          <span class="mr-1" v-if="suggestion.match">
            {{ suggestion.match.field }} of
            <b>{{ suggestion.bare }}</b>
          </span>
          <span
            class="suggestion-l1"
            v-if="suggestion.definitions"
            v-html="Helper.highlight(suggestion.definitions.join(', '), text)"
          ></span>
        </span>
      </router-link>
      <router-link class="suggestion" v-if="suggestions.length === 0 && type === 'dictionary'" :to="`/${$l1.code}/${$l2.code}/phrase/search/${text}`">
        <span class="suggestion-not-found">
          <b>&ldquo;{{ text }}&rdquo;</b> is not in {{ $store.state.settings.dictionaryName }}, press Return to look it up as a Phrase.
        </span>
      </router-link>
      <div class="suggestion" v-if="suggestions.length === 0 && type === 'generic'">
        <span class="suggestion-not-found">
          Search for
          <b>“{{ text }}”</b>...
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { setTimeout } from 'timers'
import Helper from '@/lib/helper'

export default {
  props: {
    term: {
      default: '',
    },
    defaultURL: {
      type: Function,
      default: () => {},
    },
    type: {
      default: 'dictionary', // can also be 'generic'
    },
    button: {
      default: true,
    },
    entry: {
      default: undefined,
    },
    suggestionsFunc: {
      type: Function,
      default: undefined,
    },
    hrefFunc: {
      type: Function,
      default: function (entry) {
        if (entry) {
          return `/${this.$l1.code}/${this.$l2.code}/dictionary/${this.$store.state.settings.dictionaryName}/${entry.id}`
        }
      },
    },
    placeholder: {
      type: String,
    },
    random: {
      default: false,
    },
  },
  data() {
    return {
      Helper,
      suggestions: [],
      dEntry: this.entry,
      text: this.entry ? this.entry.bare : this.term,
      active: false,
      suggestionsKey: 0,
    }
  },
  watch: {
    $route() {
      this.active = false
    },
    entry() {
      if (this.entry) {
        this.dEntry = this.entry
        this.text = this.dEntry.bare
      }
    },
    async text() {
      if (this.type === 'dictionary') {
        this.suggestions = []
        this.suggestions = this.suggestions.concat(
          await (await this.$dictionary).lookupByDef(this.text, 10)
        )
        this.suggestions = this.suggestions.concat(
          await (await this.$dictionary).lookupFuzzy(this.text, 10)
        )
        this.suggestions = this.suggestions
          .sort((a, b) => b.bare.length - a.bare.length)
          .sort((a, b) => (a.bare.startsWith(this.text) ? -1 : 0))
      } else if (this.suggestionsFunc) {
        this.suggestions = this.suggestionsFunc(this.text)
      }
    },
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
    $dictionary() {
      return this.$getDictionary()
    }
  },
  methods: {
    focusOnInput() {
      this.$refs.lookup.focus()
    },
    go() {
      const url =
        $('.suggestion:first-child').attr('href') || this.defaultURL(this.text)
      if (url) {
        this.suggestions = []
        this.$router.push({ path: url })
      }
    },
    cancel() {
      setTimeout(() => {
        if (this.suggestions[0]) this.dEntry = this.suggestions[0]
        this.active = false
      }, 300) // Set time out, otherwise before click event is fired the suggestions are already gone!
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.suggestions {
  position: absolute;
  z-index: 4;
  border-radius: 0.3rem;
  overflow: hidden;
  border: 1px solid #ccc;
  width: 100%;
  top: 2.9rem;
}

.suggestion,
a.suggestion {
  display: block;
  background: white;
  padding: 0.3rem 1rem;
  border: 1px solid #f3f3f3;
  color: #7b7b7b;
  text-decoration: none;
  display: flex;
  align-items: top;
  padding: 0.5rem 1rem;
}

.suggestion:hover,
.suggestion:first-child:not(:hover) {
  background: #ececec;
}

.suggestion-l1 {
  font-style: italic;
  color: #777;
}

.search-wrapper {
  position: relative;
}

.suggestion-word {
  font-size: 1.5em;
  line-height: 1;
}

.suggestion-l1 >>> .highlight {
  font-weight: bold;
}
</style>
