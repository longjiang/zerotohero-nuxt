<template>
  <div class="search-wrapper">
    <div class="input-group" v-cloak>
      <input
        @compositionend.prevent.stop="compositionEnd"
        @keyup.enter="enterKeyUp"
        @focus="
          active = true;
          $event.target.select();
        "
        @blur="cancel"
        @input="onInput"
        type="text"
        class="form-control lookup"
        ref="lookup"
        v-model="text"
        :placeholder="placeholder || $t('Search')"
      />
      <a
        v-if="random"
        class="btn btn-secondary btn-random bg-secondary ml-2"
        :href="random"
        @click.stop.prevent="go(random)"
      >
        <i class="fas fa-random mr-1"></i>
        <span>{{ $t("Random") }}</span>
      </a>
      <div v-if="button" class="input-group-append">
        <button
          class="btn btn-primary lookup-button"
          @click="go(hrefFunc(suggestions[0]), suggestions[0])"
          type="button"
          title="Search"
        >
          <i class="fas fa-search"></i>
        </button>
      </div>
    </div>
    <div
      class="suggestions"
      :key="suggestionsKey"
      v-cloak
      v-if="active && text && text.length > 0"
    >
      <div
        class="d-flex align-items-center justify-content-center suggestion"
        v-if="lookingUp"
      >
        <Loader :sticky="true" message="Looking up the dictionary..." />
      </div>
      <div v-else>
        <router-link
          class="suggestion"
          v-if="
            lookingUp === false &&
            suggestions.filter(
              (s) =>
                s.head && s.head.toLowerCase() === text.trim().toLowerCase()
            ).length === 0 &&
            type === 'dictionary'
          "
          :to="dictionaryLookUpAsPhraseRoute"
        >
          <span class="suggestion-not-found">
            <i18n path="Look up “{0}” as a phrase">
              <b data-level="outside" :lang="$l2.code">{{ text }}</b>
            </i18n>
          </span>
        </router-link>
        <a
          class="suggestion skin-light"
          v-for="(suggestion, index) in suggestions.filter(
            (suggestion) => suggestion
          )"
          :key="`search-suggestion-${index}-${
            suggestion ? suggestion.head : ''
          }`"
          :href="hrefFunc(suggestion)"
          @click.stop.prevent="go(hrefFunc(suggestion), suggestion)"
        >
          <span v-if="suggestion">
            <span
              class="suggestion-word font-weight-bold mr-1"
              :data-level="suggestion.level || 'outside'"
              :lang="$l2?.code"
            >
              {{ suggestion.head }}
            </span>
            <span class="suggestion-alternate" v-if="getAlternate(suggestion)"
              >[{{ getAlternate(suggestion) }}]</span
            >
            <span class="suggestion-pronunciation" v-if="suggestion.pronunciation">{{ suggestion.pronunciation.split(',')[0] }}</span>
            <DefinitionsList
              v-if="suggestion.definitions"
              class="suggestion-l1"
              :definitions="suggestion.definitions"
              :translated="true"
              :singleColumn="true"
              :neverShowAsList="true"
            />
          </span>
        </a>
        <div
          class="suggestion"
          v-if="suggestions.length === 0 && type === 'generic'"
        >
          <i18n path="Search for {0} ..." class="suggestion-not-found">
            <b>“{{ text }}”</b>
          </i18n>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { setTimeout } from "timers";
import { highlight, timeout } from "../lib/utils";
import { debounce } from "lodash";

export default {
  props: {
    term: {
      default: "",
    },
    defaultURL: {
      type: Function,
      default: () => null,
    },
    type: {
      default: "dictionary", // can also be 'generic'
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
    nav: {
      default: true,
    },
    hrefFunc: {
      type: Function,
      default: function (entry) {
        if (entry) {
          const queryString = this.$route.fullPath.split("?")[1];
          const baseHref = `/${this.$l1.code}/${this.$l2.code}/dictionary/${this.$store.state.settings.dictionaryName}/${entry.id}`;
          return queryString ? `${baseHref}?${queryString}` : baseHref;
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
      suggestions: [],
      dEntry: this.entry,
      text: this.entry ? this.entry.head : this.term,
      active: false,
      preventEnter: false,
      suggestionsKey: 0,
      lookingUp: false,
    };
  },
  computed: {
    dictionaryLookUpAsPhraseRoute() {
      // First try to get the route from the defaultURL function
      let route = this.defaultURL(this.text)
      // If route is not null, return it
      if (route) return route
      // If route is null, the defaultURL function has not been set
      else return { name: 'l1-l2-phrase-search-term', params: {term: this.text.trim() }};
    },
  },
  watch: {
    $route() {
      this.active = false;
    },
    entry() {
      if (this.entry) {
        this.dEntry = this.entry;
        this.text = this.dEntry.head;
      }
    },
    async text() {
      if (!this.nav && this.text !== "") {
        this.active = true;
      }
      this.lookingUp = true;
      if (this.type === "dictionary") {
        const dictionary = await this.$getDictionary();
        let suggest = await dictionary.lookupBySearch(this.text.trim(), 100);
        let def = await dictionary.lookupByDef(this.text, 100);
        // Multiply the score of each def element by 0.8
        def = def.map((s) => {
          s.score *= 0.8;
          return s;
        });
        // Merge and sort by score
        this.suggestions = [...suggest, ...def]
          .sort((a, b) => a.head.length - b.head.length)
          .sort((a, b) => b.frequency - a.frequency)
          .sort((a, b) => b.score - a.score)
          .slice(0, 10);
      } else if (this.suggestionsFunc) {
        this.suggestions = this.suggestionsFunc(this.text);
      }
      this.lookingUp = false;
    },
  },
  methods: {
    highlight,
    onInput(event) {
      this.debouncedInput(event.target.value);
    },
    debouncedInput: debounce(function (value) {
      this.text = value;
    }, 600), // 300ms delay. Adjust as needed.
    getAlternate(word) {
      let alternate = word.hanja || word.kana || word.traditional;
      if (alternate && alternate !== word.head) return alternate;
    },
    focusOnInput() {
      this.$refs.lookup.focus();
    },
    compositionEnd() {
      this.preventEnter = true;
    },
    async enterKeyUp() {
      if (this.$l2 && ["ko", "ja"].includes(this.$l2.code)) {
        // Wait for composition to finish
        if (!this.preventEnter) this.act();
        else {
          await timeout(500);
          this.preventEnter = false;
        }
      } else {
        this.act();
        this.preventEnter = true;
      }
    },
    act() {
      if (
        this.suggestions.filter((s) => s.score === 1).length === 0 &&
        this.type === "dictionary"
      ) {
        this.$router.push(
          `/${this.$l1.code}/${this.$l2.code}/phrase/search/${this.text}`
        );
      } else {
        this.go(this.hrefFunc(this.suggestions[0]), this.suggestions[0]);
      }
    },
    go(url, suggestion = undefined) {
      this.$emit("nav", url, suggestion);
      if (this.nav && url) {
        this.$router.push({ path: url });
      }
      this.active = false;
      return false;
    },
    cancel() {
      setTimeout(() => {
        if (this.suggestions[0]) this.dEntry = this.suggestions[0];
        this.active = false;
      }, 300); // Set time out, otherwise before click event is fired the suggestions are already gone!
    },
  },
};
</script>

<style lang="scss" scoped>
.suggestions {
  position: absolute;
  z-index: 9;
  border-radius: 0.3rem;
  overflow: auto;
  border: 1px solid #ccc;
  width: 100%;
  top: 2.9rem;
  max-height: calc(100vh - 5rem);
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
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.suggestion:hover,
.suggestion:first-child:not(:hover) {
  background: #ececec;
}

.suggestion-l1 {
  display: inline;
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

.suggestion-l1 :deep(.highlight) {
  display: inline;
  font-weight: bold;
}

.suggestion-pronunciation {
  font-size: 1rem;
  color: #779bb5;
  font-family: AndikaW, Andika, Arial, sans-serif;
}


.btn-random {
  position: absolute;
  right: 3rem;
  font-size: 0.8rem;
  line-height: 0.8rem;
  height: 1.7rem !important;
  top: 0.3rem;
  border: none;
}

@media (max-width: 768px) {
  .btn-random span {
    display: none;
  }
}
</style>
