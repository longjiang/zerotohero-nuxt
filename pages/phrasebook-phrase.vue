<router>
  {
    path: '/:l1/:l2/phrasebook/:bookId/:phraseId/:phrase?',
    props: true
  }
</router>
<template>
  <container-query :query="query" v-model="params">
    <div :class="{ 'bg-white': !wide }">
      <SocialHead :title="title" :description="description" />
      <div :class="{ container: !wide }">
        <div :class="{ row: !wide, 'content-panes': wide }">
          <div
            :class="{
              'p-4 content-pane-left': wide,
              'col-sm-12 pt-4': !wide,
            }"
          >
            <div
              class="text-center"
              v-if="phrasebook && phrasebook.phrases && phraseId && phraseObj"
            >
              <router-link class="link-unstyled mb-4 d-block" :to="homeRoute">
                <h5 class="phrasebook-title">
                  <i class="fa fa-chevron-left mr-2"></i>
                  {{ phrasebook.title }}
                </h5>
              </router-link>
              <Paginator
                class="mb-4"
                :items="phrasebook.phrases"
                :findCurrent="findCurrent"
                :url="url"
                ref="paginator"
              />
            </div>
            <div style="position: relative">
              <b-button
                variant="unstyled"
                size="md"
                class="remove-btn"
                @click="remove"
                v-if="$adminMode"
              >
                <i class="fa fa-trash ml-1"></i>
              </b-button>
              <div class="text-center" v-if="phraseObj && phraseObj.phrase">
                <Saved
                  :item="phraseItem"
                  store="savedPhrases"
                  icon="bookmark"
                  class="mr-2"
                />
                <span v-if="phraseObj && phraseObj.pronunciation" class="mr-1">
                  {{ phraseObj.pronunciation }}
                </span>
                <Speak :text="phraseObj.phrase" />
              </div>
              <h2 class="text-center mb-0 font-weight-normal">
                <div class="d-inline-block">
                  <Annotate
                    :phonetics="!phraseObj.pronunciation"
                    :buttons="false"
                    v-if="phraseObj && phraseObj.phrase"
                    @textChanged="textChanged"
                  >
                    <span>{{ phraseObj.phrase }}</span>
                  </Annotate>
                </div>
              </h2>
              <p class="text-center mt-1" v-if="phraseObj">
                {{ phraseObj[$l1.code] }}
              </p>
              <div>
                <SimilarPhrases
                  v-if="phraseObj"
                  :phraseObj="phraseObj"
                  class="text-center"
                />
              </div>
              <hr v-if="word" />
              <div
                class="text-center mt-3 mb-3"
                v-if="words && words.length > 1"
              >
                <b-dropdown
                  size="sm"
                  :items="words"
                  text="Disambiguation"
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
          </div>
          <div
            :class="{
              'content-pane-right pl-3 pr-3': wide,
              'col-sm-12 pt-4': !wide,
            }"
          >
            <div class="text-center">
              <Loader class="pt-5 pb-5" />
            </div>
            <LazyDictionaryEntry
              v-if="word && phrasebook"
              :entry="word"
              :tvShow="phrasebook.tv_show"
              :exact="phraseObj.exact || phrasebook.exact"
              :exactPhrase="phraseObj.phrase"
              :showHeader="false"
              :showDefinitions="false"
              :showExample="false"
              :showExternal="false"
              :key="`dictionary-entry-${word.id}`"
              ref="dictionaryEntry"
            />
            <LazyPhraseComp
              v-else-if="phraseObj && phraseObj.phrase && phrasebook"
              :term="phraseObj.phrase.toLowerCase()"
              :tvShow="phrasebook.tv_show"
              :exact="phraseObj.exact || phrasebook.exact"
              :showExternal="false"
              :showHeader="false"
              class="mt-4 mb-4"
              ref="phrase"
            />
          </div>
        </div>
      </div>
    </div>
  </container-query>
</template>

<script>
import Helper from "@/lib/helper";
import DateHelper from "@/lib/date-helper";
import { ContainerQuery } from "vue-container-query";
import { mapState } from "vuex";

export default {
  components: {
    ContainerQuery,
  },
  props: {
    bookId: {
      type: String,
    },
    phraseId: {
      type: String,
    },
    phrase: {
      type: String,
    },
  },
  data() {
    return {
      phrasebook: undefined,
      phraseObj: undefined,
      words: undefined,
      word: undefined,
      images: [],
      params: {},
      query: {
        wide: {
          minWidth: 991,
        },
      },
    };
  },
  computed: {
    ...mapState("savedPhrases", ["savedPhrases"]),
    homeRoute() {
      let route;
      if (this.bookId === "saved")
        route = {
          name: "saved-phrases",
        };
      else {
        route = {
          name: "phrasebook",
          params: {
            bookId: String(this.phrasebook.id),
          },
          hash: `#${Number(this.phraseId) + 1}`
        };
      }
      return route;
    },
    phraseItem() {
      if (typeof this.phraseObj !== "undefined") {
        let phraseItem = {
          l2: this.$l2.code,
          phrase: this.phraseObj.phrase,
          phrasebookId: this.phrasebook.phrasebookId,
          pronunciation: this.phraseObj.pronunciation,
          exact: this.phrasebook.exact,
          translations: {},
        };
        if (this.phraseObj[this.$l1.code])
          phraseItem.translations[this.$l1.code] =
            this.phraseObj[this.$l1.code];
        return phraseItem;
      }
    },
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
    $adminMode() {
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
    },
    title() {
      if (this.phrase) {
        return `Learn the ${this.$l2 ? this.$l2.name : ""} Phrase “${
          this.phrase
        }” | ${this.$l2 ? this.$l2.name : ""} Zero to Hero Dictionary`;
      }
      return `Lookup ${this.$l2 ? this.$l2.name : ""} Phrases | ${
        this.$l2 ? this.$l2.name : ""
      } Zero to Hero`;
    },
    description() {
      if (this.phrase) {
        return `See how “${this.phrase}” is used in TV shows, how it forms collocations, and other examples.`;
      }
      return `Look up ${this.$l2 ? this.$l2.name : ""} phrases. See how ${
        this.$l2 ? this.$l2.name : ""
      } words are used in TV shows, how they form collocations, and other examples.`;
    },
    wide() {
      return this.params.wide && ["lg", "xl", "xxl"].includes(this.$mq);
    },
  },
  mounted() {
    let phrasebook = this.getPhrasebookFromStore();
    if (phrasebook) {
      if (!phrasebook.phrases) {
        this.loadPhrases();
      } else {
        this.phrasebook = phrasebook;
        this.getPhrase();
      }
    }
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type === "savedPhrases/REMOVE_SAVED_PHRASE") {
        if (mutation.payload.phrase === this.phrase) {
          this.phraseUnsaved();
        }
      }
      if (mutation.type.startsWith("phrasebooks")) {
        if (mutation.type === "phrasebooks/LOAD_PHRASEBOOKS") {
          let phrasebook = this.getPhrasebookFromStore();
          if (phrasebook) {
            if (!phrasebook.phrases) {
              this.loadPhrases();
            } else {
              this.phrasebook = phrasebook;
              this.getPhrase();
            }
          }
        }
        if (mutation.type === "phrasebooks/LOAD_PHRASES") {
          let phrasebook = this.getPhrasebookFromStore();
          if (phrasebook && phrasebook.phrases) {
            this.phrasebook = phrasebook;
            this.getPhrase();
          }
          this.loading = false;
        }
        if (mutation.type === "phrasebooks/UPDATE_PHRASES") {
          this.getPhrase();
          let nextPhraseId = Math.min(
            this.phrasebook.phrases.length - 1,
            Number(this.phraseId)
          );
          let nextPhrase = this.phrasebook.phrases[nextPhraseId];
          let route = {
            name: "phrasebook-phrase",
            params: {
              bookId: this.bookId,
              phraseId: String(nextPhrase.id),
              phrase: nextPhrase.phrase,
            },
          };
          this.$router.push(route);
        }
      }
    });
  },
  created() {
    this.bindKeys();
  },
  destroyed() {
    this.unbindKeys();
  },
  beforeDestroy() {
    // you may call unsubscribe to stop the subscription
    this.unsubscribe();
  },
  beforeRouteUpdate(to, from, next) {
    // called when the route that renders this component is about to
    // be navigated away from.
    // has access to `this` component instance.
    this.savePhrasebookHistory(Number(to.params.phraseId));
    next();
  },
  methods: {
    remove() {
      this.$store.dispatch("phrasebooks/removePhrase", {
        phrasebook: this.phrasebook,
        phrase: this.phraseObj,
      });
    },
    loadPhrases() {
      if (this.bookId !== "saved") {
        this.loading = true;
        this.$store.dispatch("phrasebooks/loadPhrases", {
          l2: this.$l2,
          bookId: Number(this.bookId),
          adminMode: this.$adminMode,
        });
      }
    },
    changeWordTo(w) {
      this.word = w;
    },
    phraseUnsaved() {
      if (this.bookId !== "saved") return;
      let savedPhrases = this.savedPhrases[this.$l2.code];
      let nextSavedPhrase = savedPhrases[Number(this.phraseId)];
      let phraseId = this.phraseId;
      if (nextSavedPhrase) {
        let route = {
          name: "phrasebook-phrase",
          params: {
            bookId: "saved",
            phraseId,
            phrase: nextSavedPhrase.phrase,
          },
        };
        this.$router.push(route);
      } else if (savedPhrases.length > 0) {
        this.$router.push({
          name: "phrasebook-phrase",
          params: {
            bookId: "saved",
            phraseId: "0",
            phrase: savedPhrases[0].phrase,
          },
        });
      } else {
        this.$router.push({
          name: "home",
        });
      }
    },
    savePhrasebookHistory(index) {
      if (!this.phrasebook) return;
      let data = {
        type: "phrasebook",
        id: `${this.$l2.code}-phrasebook-${this.phrasebook.id}`,
        date: DateHelper.unparseDate(new Date()),
        l1: this.$l1.code,
        l2: this.$l2.code,
        phrasebook: {
          id: this.phrasebook.id,
          title: this.phrasebook.title,
          index,
          length: this.phrasebook.phrases.length,
        },
      };
      data.phrasebook.progress = data.phrasebook.index / data.phrasebook.length;
      this.$store.dispatch("history/add", data);
    },
    getPhrasebookFromStore() {
      let phrasebooks, phrasebook;
      if (this.bookId === "saved") {
        phrasebook = {
          title: `Saved ${this.$l2.name} Phrases`,
          phrases: this.savedPhrases[this.$l2.code] || [],
          l2: this.$l2,
          id: "saved",
        };
      } else {
        phrasebooks = this.$store.state.phrasebooks.phrasebooks[this.$l2.code];
        if (!phrasebooks) return;
        phrasebook = phrasebooks.find((pb) => pb.id === Number(this.bookId));
        if (!phrasebook) return;
      }
      return phrasebook;
    },
    async getPhrase() {
      let phrase = this.phrasebook.phrases.find((p, index) => {
        if (p.id === Number(this.phraseId + 1)) return true;
        if (index === Number(this.phraseId)) return true;
      });
      if (typeof phrase !== "undefined") {
        phrase.phrase = this.stripPunctuations(phrase.phrase);
        this.phraseObj = phrase;
        if (
          process.server &&
          Helper.dictionaryTooLargeAndWillCauseServerCrash(this.$l2["iso639-3"])
        )
          return;
        else await this.matchPhraseToDictionaryEntries();
      } else {
        this.$router.push({
          name: "phrase",
          params: {
            term: this.phrase,
          },
        });
      }
    },
    async matchPhraseToDictionaryEntries() {
      let dictionary = await this.$getDictionary();
      if (dictionary) {
        this.words = await dictionary.lookupMultiple(
          this.phraseObj.phrase,
          true
        );
        if (this.words && this.words.length > 0) {
          for (let word of this.words) {
            if (!word.pronunciation)
              word.pronunciation = this.phraseObj.pronunciation;
          }
          this.word = this.words[0];
        }
      }
    },
    stripPunctuations(text) {
      text = text.replace(/[.!?。！？…؟♪\*]/g, "").trim();
      text = text.replace(/\/[^\s]+/, "").trim();
      text = text.replace(/[（(].*[)）]/g, "").trim();
      return text;
    },
    findCurrent(phraseObj) {
      return (
        phraseObj.id === Number(this.phraseId) &&
        phraseObj.phrase === this.phrase
      );
    },
    url(phraseObj) {
      return `/${this.$l1.code}/${this.$l2.code}/phrasebook/${
        this.phrasebook.id
      }/${
        phraseObj.id ||
        this.phrasebook.phrases.findIndex((p) => p.phrase === phraseObj.phrase)
      }/${encodeURIComponent(phraseObj.phrase)}`;
    },
    textChanged(newText) {
      this.phraseObj.phrase = newText;
    },
    bindKeys() {
      if (typeof window !== "undefined" && !this.keysBound) {
        this.keysBound = true; // bind only once!
        window.addEventListener("keydown", this.keydown);
      }
    },
    unbindKeys() {
      if (typeof window !== "undefined")
        window.removeEventListener("keydown", this.keydown);
    },
    keydown(e) {
      if (
        !["INPUT", "TEXTAREA"].includes(e.target.tagName.toUpperCase()) &&
        !e.metaKey &&
        !e.repeat &&
        !e.target.getAttribute("contenteditable")
      ) {
        if (e.code == "KeyN") {
          if (this.$refs.paginator.nextPath) {
            this.$router.push(this.$refs.paginator.nextPath);
          }
          e.preventDefault();
          return false;
        }
        if (e.code == "KeyP") {
          if (this.$refs.paginator.previousPath) {
            this.$router.push(this.$refs.paginator.previousPath);
          }
          e.preventDefault();
          return false;
        }
        if (e.code == "KeyS") {
          let hit = this.$refs.dictionaryEntry.$refs.searchSubs.currentHit;
          if (hit.saved) {
            console.log(
              "Phrasebook Phrase: Key S - removing hit",
              this.$refs.dictionaryEntry.$refs.searchSubs.terms,
              hit
            );
            this.$refs.dictionaryEntry.$refs.searchSubs.removeSavedHit(hit);
          } else {
            console.log(
              "Phrasebook Phrase: Key S - saving hit",
              this.$refs.dictionaryEntry.$refs.searchSubs.terms,
              hit
            );
            this.$refs.dictionaryEntry.$refs.searchSubs.saveHit(hit);
          }
          e.preventDefault();
          return false;
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.zerotohero-wide {
  .content-pane-left {
    overflow-y: scroll;
    ::v-deep .entry-word {
      font-size: 2rem;
    }
    ::v-deep .entry-cjk {
      font-size: 1.2rem;
    }
    ::v-deep .definitions-many {
      columns: 1;
      margin-top: 1rem;
    }
    ::v-deep .disambiguation-dropdown {
      max-width: 12rem;
      overflow: hidden;
      left: 0;
      position: fixed;
      .dropdown-item {
        white-space: normal;
        padding: 0.2rem 1rem;
      }
    }
  }
}

.phrasebook-title {
  &:hover {
    color: #fd4f1c;
  }
}

.remove-btn {
  display: block;
  position: absolute;
  color: #999;
  left: 0;
  top: 0;
}
</style>
