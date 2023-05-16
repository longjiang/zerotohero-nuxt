<router>
  {
    path: '/:l1/:l2/phrase/search/:term?/:dict?',
    props: true
  }
</router>
<template>
  <container-query :query="query" v-model="params">
    <div
      :class="{
        'phrase focus': true,
        'phrase-wide': wide,
      }"
    >
      <SocialHead
        v-if="term === ''"
        :title="`Look up ${this.$l2 ? this.$l2.name : ''}
      Phrases | Language Player`"
        :description="`Look up ${this.$l2 ? this.$l2.name : ''} phrases and see
      how they are used in TV shows.`"
      />
      <client-only>
        <div class="phrase-search-bar">
          <div class="container">
            <div class="row">
              <div class="col-sm-12">
                <div class="search-compare-wrapper">
                  <LazySearchCompare
                    placeholder="Enter a word or phrase"
                    type="dictionary"
                    :term="term"
                    :compareTerm="compareTerm"
                    :random="false"
                    :key="`${term}-${compareTerm}-search`"
                    style="width: 100%"
                    :urlFunc="
                      (text) => `/${$l1.code}/${$l2.code}/phrase/search/${text}`
                    "
                    :compareUrlFunc="
                      (text) =>
                        `/${$l1.code}/${$l2.code}/phrase/compare/${term}/${text}`
                    "
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </client-only>
      <div
        :class="{
          'content-panes-wrapepr focus-exclude': true,
          container: !wide,
        }"
      >
        <div :class="{ row: !wide, 'content-panes': wide }" v-if="term">
          <div
            :class="{
              'content-pane-left': wide,
              'col-sm-12': !wide,
              'text-center mb-4': true,
            }"
          >
            <PhraseHeader v-if="term" :term="term" :class="{ 'mt-4': !wide }" />
            <hr v-if="word" />
            <div class="text-center mt-3 mb-3" v-if="words && words.length > 1">
              <b-dropdown
                size="sm"
                :items="words"
                :text="$t('Disambiguation')"
                menu-class="disambiguation-dropdown"
                variant="gray"
              >
                <b-dropdown-item
                  v-for="w in words"
                  :key="`phrase-word-disambiguation-${w.id}`"
                  @click="changeWordTo(w)"
                >
                  <b>{{ w.head }}</b>
                  <b v-if="w.pronunciation || w.kana">
                    ({{ w.pronunciation || w.kana }})
                  </b>
                  <em>{{ w.definitions[0] }}</em>
                </b-dropdown-item>
              </b-dropdown>
            </div>
            <div class="text-center">
              <Loader class="pt-5 pb-5" />
            </div>
            <div
              v-if="word"
              class="text-center"
              :key="`word-heading-${word.id}`"
            >
              <LazyEntryHeader :entry="word" />
              <DefinitionsList
                v-if="word.definitions"
                class="mt-3"
                :definitions="word.definitions"
              ></DefinitionsList>
              <EntryExternal
                :term="word.head"
                :traditional="word.traditional"
                :level="word.level"
                :sticky="false"
                class="mt-4 mb-4 text-center"
                style="margin-bottom: 0"
              />
              <EntryCourseAd
                v-if="$l2.code === 'zh'"
                variant="compact"
                class="focus-exclude mt-4 mb-5"
                :entry="word"
              ></EntryCourseAd>
            </div>
          </div>
          <div
            :class="{
              'col-sm-12': !wide,
              'content-pane-right pl-3 pr-3': wide,
            }"
          >
            <template v-if="dictionaryMatchCompleted">
              <LazyDictionaryEntry
                v-if="word"
                :entry="word"
                :key="`dictionary-entry-${word.id}`"
                ref="dictionaryEntry"
              />
              <LazyPhraseComp
                v-else-if="term"
                :term="term"
              />
              <div class="mt-3" v-if="term && similarPhraseTranslation">
                <SimilarPhrases
                  :phrase="word ? word.head : term"
                  :translation="similarPhraseTranslation"
                  :wiktionary="true"
                  class="text-center"
                />
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </container-query>
</template>

<script>
import { ContainerQuery } from "vue-container-query";
import { dictionaryTooLargeAndWillCauseServerCrash } from "@/lib/utils";

export default {
  components: {
    ContainerQuery,
  },
  props: {
    term: "",
    compareTerm: "",
    dict: {
      type: String,
      default: undefined, // or 'dict'
    },
  },
  data() {
    return {
      params: {},
      words: [],
      word: undefined,
      dictionaryMatchCompleted: false,
      query: {
        wide: {
          minWidth: 768,
        },
      },
    };
  },
  computed: {
    wide() {
      return this.params.wide && ["lg", "xl", "xxl"].includes(this.$mq);
    },
    similarPhraseTranslation() {
      if (!this.word) return;
      let en;
      if (this.$l2.code === "en") en = this.word.head;
      else if (this.word.definitions && this.word.definitions[0]) {
        en = this.word.definitions[0].split(", ")[0];
      }
      en = en.replace(/\(.*\)/g, "").trim();
      return en;
    },
  },
  activated() {
    this.bindKeys();
  },
  deactivated() {
    this.unbindKeys();
  },
  async mounted() {
    if (this.dict === "dict") {
      if (
        process.server &&
        dictionaryTooLargeAndWillCauseServerCrash(this.$l2["iso639-3"])
      )
        return;
      else await this.matchPhraseToDictionaryEntries();
    } else this.dictionaryMatchCompleted = true;
  },
  methods: {
    bindKeys() {
      window.addEventListener("keydown", this.keydown);
    },
    unbindKeys() {
      window.removeEventListener("keydown", this.keydown);
    },
    async matchPhraseToDictionaryEntries() {
      let dictionary = await this.$getDictionary();
      if (dictionary) {
        this.words = await dictionary.lookupMultiple(this.term, true);
        if (this.words && this.words.length > 0) {
          this.word = this.words[0];
        }
      }
      this.dictionaryMatchCompleted = true;
    },
    keydown(e) {
      if (
        !["INPUT", "TEXTAREA"].includes(e.target.tagName.toUpperCase()) &&
        !e.metaKey
      ) {
        // home
        if (e.keyCode == 36) {
          document
            .getElementById("main")
            .scrollIntoView({ behavior: "smooth" });
          // this.$refs.searchCompare.focusOnSearch()
          e.preventDefault();
          return false;
        }
        // end
        if (e.keyCode == 35) {
          document
            .getElementById("search-subs")
            .scrollIntoView({ behavior: "smooth" });
          e.preventDefault();
          return false;
        }
      }
    },
  },
};
</script>


<style lang="scss" scoped>
.phrase-wide {
  .phrase-search-bar {
    padding: 0 1rem 1rem 1rem;
    z-index: 9;
  }

  .content-pane-left {
    overflow-y: auto;
    padding: 1rem;

    :deep(.entry-word) {
      font-size: 2rem;
    }

    :deep(.entry-cjk) {
      font-size: 1.2rem;
    }

    :deep(.definitions-many) {
      columns: 1;
      margin-top: 1rem;
    }

    :deep(.disambiguation-dropdown) {
      overflow: hidden;
    }
  }

  .content-pane-right {
    padding: 1rem;
  }

  .for-the-love-of {
    padding-top: 15rem;
  }
}

:deep(.disambiguation-dropdown) {
  margin-left: -3.5rem;
  width: 15rem;

  .dropdown-item {
    white-space: normal;
    padding: 0.2rem 1rem;
  }
}

.for-the-love-of {
  padding: 10rem 3rem;

  h3 {
    transform: scale(1.3);
  }

  h3,
  h3 * {
    font-family: pacifico !important;
  }
}
</style>

