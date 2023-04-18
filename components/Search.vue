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
        v-model="text"
        type="text"
        class="form-control lookup"
        ref="lookup"
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
      <router-link
        class="suggestion"
        v-if="
          lookingUp === false &&
          suggestions.filter((s) => s.head && s.head.toLowerCase() === text.trim().toLowerCase()).length === 0 &&
          type === 'dictionary'
        "
        :to="`/${$l1.code}/${$l2.code}/phrase/search/${text.trim()}`"
      >
        <span class="suggestion-not-found">
          <i18n path="Look up “{0}” as a phrase">
            <b data-level="outside">{{ text }}</b>
          </i18n>
        </span>
      </router-link>
      <a
        class="suggestion"
        v-for="(suggestion, index) in suggestions.filter(
          (suggestion) => suggestion
        )"
        :key="`search-suggestion-${index}-${suggestion ? suggestion.head : ''}`"
        :href="hrefFunc(suggestion)"
        @click.stop.prevent="go(hrefFunc(suggestion), suggestion)"
      >
        <span v-if="suggestion">
          <span
            class="suggestion-word font-weight-bold mr-1"
            :data-level="suggestion.level || 'outside'"
          >
            {{ suggestion.head }}
          </span>
          <span class="mr-1" v-if="suggestion.match">
            {{ suggestion.match.field }} of
            <b>{{ suggestion.head }}</b>
          </span>
          <span
            class="suggestion-l1"
            v-if="suggestion.definitions"
            v-html="highlight(suggestion.definitions.slice(0,3).join(', '), text)"
          ></span>
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
</template>

<script>
import { setTimeout } from "timers";
import Helper from "@/lib/helper";

export default {
  props: {
    term: {
      default: "",
    },
    defaultURL: {
      type: Function,
      default: () => {},
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
          const queryString = this.$route.fullPath.split('?')[1];
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
      lookingUp: false
    };
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
      this.lookingUp = true
      if (this.type === "dictionary") {
        let def = await (
          await this.$getDictionary()
        ).lookupByDef(this.text, 10);
        let fuzzy = await (
          await this.$getDictionary()
        ).lookupFuzzy(this.text.trim(), 10, true);
        this.suggestions = fuzzy
          .concat(def)
          .sort((a, b) =>
            typeof b.score !== undefined ? b.score - a.score : 0
          );
      } else if (this.suggestionsFunc) {
        this.suggestions = this.suggestionsFunc(this.text);
      }
      this.lookingUp = false
    },
  },
  methods: {
    highlight(...args) {
      return Helper.highlight(...args)
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
          await Helper.timeout(500);
          this.preventEnter = false;
        }
      } else {
        this.act();
        this.preventEnter = true
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
  max-height: calc(100vh - 5rem)
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

.suggestion-l1 :deep(.highlight) {
  font-weight: bold;
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
