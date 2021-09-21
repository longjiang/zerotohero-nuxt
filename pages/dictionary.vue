<router>
  {
    path: '/:l1/:l2/dictionary/:method?/:args?',
    props: true
  }
</router>
<template>
  <container-query :query="query" v-model="params">
    <div
      :class="{
        'dictionary focus': true,
        'bg-white': !wide,
        'dictionary-wide': wide,
      }"
      :key="`entry-${entryKey}`"
      @keydown="keydown"
    >
      <SocialHead :title="title" :description="description" :image="image" />
      <client-only>
        <div class="dictionary-search-bar">
          <div :class="{ 'container pt-2 pb-5': !wide }">
            <div :class="{ row: !wide }">
              <div :class="{ 'col-sm-12': !wide }">
                <SearchCompare
                  :searchEntry="entry"
                  :random="`/${$l1.code}/${$l2.code}/dictionary/${$store.state.settings.dictionaryName}/random`"
                  ref="searchCompare"
                  :key="`search-${args}`"
                  id="search-compare-bar"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="bg-white">
          <div class="container" v-if="!entry">
            <div class="row">
              <div class="col-sm-12 bg-white">
                <div class="for-the-love-of">
                  <h3 class="text-center font-weight-normal">
                    <span v-if="!dictionarySize">
                      {{
                        $t("For the love of {l2} words.", { l2: $t($l2.name) })
                      }}
                    </span>
                    <span v-else>
                      {{
                        $t("For the love of {count} {l2} words.", {
                          count: $n(dictionarySize),
                          l2: $t($l2.name),
                        })
                      }}
                    </span>
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </client-only>
      <div :class="{ 'focus-exclude': true, container: !wide }">
        <div :class="{ row: !wide, 'content-panes': wide }" v-if="entry">
          <div :class="{ 'content-pane-left': wide, 'col-sm-12': !wide }">
            <client-only>
              <div v-if="saved() && sW.length > 0" class="text-center mb-4">
                <router-link
                  class="link-unstyled mb-2 d-block"
                  :to="`/${$l1.code}/${$l2.code}/saved-words`"
                >
                  <h5>Saved {{ $l2.name }} Words</h5>
                </router-link>
                <Paginator
                  :items="sW"
                  :findCurrent="(item) => item.id === entry.id"
                  :url="
                    (item) =>
                      `/${$l1.code}/${$l2.code}/dictionary/${$dictionaryName}/${item.id}`
                  "
                />
              </div>
            </client-only>
            <div v-if="entry" class="text-center">
              <div class="text-center mb-4" v-if="words && words.length > 1">
                <b-dropdown
                  size="sm"
                  variant="gray"
                  :items="words"
                  text="Disambiguation"
                >
                  <b-dropdown-item
                    v-for="w in words"
                    :key="`phrase-word-disambiguation-${w.id}`"
                    @click="
                      $router.push(
                        `/${$l1.code}/${$l2.code}/dictionary/${$dictionaryName}/${w.id}`
                      )
                    "
                  >
                    <b>{{ w.head }}</b>
                    <em>{{ w.definitions[0] }}</em>
                  </b-dropdown-item>
                </b-dropdown>
              </div>
              <LazyEntryHeader :entry="entry" />
              <DefinitionsList
                :key="`def-list-${entry.id}`"
                v-if="entry.definitions"
                class="mt-3"
                :definitions="entry.definitions"
              ></DefinitionsList>
              <EntryCourseAd
                v-if="$l2.code === 'zh'"
                variant="compact"
                class="focus-exclude mt-4 mb-5"
                :entry="entry"
              ></EntryCourseAd>
              <EntryExternal
                :term="entry.head"
                :traditional="entry.traditional"
                :level="entry.level"
                :sticky="false"
                class="mt-4 mb-4 text-center"
                style="margin-bottom: 0"
              />
              <SimilarPhrases
                :phraseObj="{ phrase: entry.head, en: $l2.code === 'en' ? entry.head : entry.definitions[0] }"
                class="text-center"
              />
            </div>
          </div>

          <div
            :class="{
              'col-sm-12': !wide,
              'content-pane-right pl-3 pr-3': wide,
            }"
            style="position: relative; overflow: hidden"
          >
            <LazyDictionaryEntry
              v-if="entry"
              :entry="entry"
              :images="images"
              ref="dictionaryEntry"
              :class="{ 'pb-5': $l2.code !== 'zh' }"
              :key="`dictionary-entry-${entry.id}`"
              :showHeader="false"
              :showDefinitions="false"
              :showExample="false"
              :showExternal="false"
            />
          </div>
        </div>
      </div>
    </div>
  </container-query>
</template>

<script>
import WordPhotos from "@/lib/word-photos";
import Helper from "@/lib/helper";
import { ContainerQuery } from "vue-container-query";

export default {
  components: {
    ContainerQuery,
  },
  props: {
    method: {
      type: String,
    },
    args: {
      type: String,
    },
  },
  data() {
    return {
      entry: undefined,
      words: undefined,
      images: [],
      entryKey: 0,
      paginatorKey: 0,
      sW: [],
      dictionarySize: undefined,
      keysBound: false,
      params: {},
      query: {
        wide: {
          minWidth: 768,
        },
      },
    };
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
    $dictionaryName() {
      return this.$store.state.settings.dictionaryName;
    },
    title() {
      if (this.entry) {
        return `${this.entry.bare} ${
          this.entry.pronunciation ? "(" + this.entry.pronunciation + ")" : ""
        } ${
          this.entry.definitions
            ? this.entry.definitions.slice(0, 2).join("; ")
            : ""
        } | ${this.$l2 ? this.$l2.name : ""} Zero to Hero Dictionary`;
      }
      return `${this.$l2 ? this.$l2.name : ""} Dictionary | ${
        this.$l2 ? this.$l2.name : ""
      } Zero to Hero`;
    },
    description() {
      if (this.entry) {
        return `"${this.entry.bare}" means ${
          this.entry.definitions ? this.entry.definitions.join("; ") : "..."
        } Watch examples of this from TV shows.`;
      }
      return `Look up ${this.$l2 ? this.$l2.name : ""} words. See how ${
        this.$l2 ? this.$l2.name : ""
      } words are used in TV shows, how they form collocations, and avoid common mistakes.`;
    },
    image() {
      if (this.images.length > 0) {
        return this.images[0].src;
      } else {
        return "/img/zth-share-image.jpg";
      }
    },
    wide() {
      return this.params.wide && ["lg", "xl", "xxl"].includes(this.$mq);
    },
  },
  async fetch() {
    if (Helper.dictionaryTooLargeAndWillCauseServerCrash(this.$l2["iso639-3"]))
      return;
    else {
      await this.loadEntry();
    }
  },
  async created() {
    if (Helper.dictionaryTooLargeAndWillCauseServerCrash(this.$l2["iso639-3"]))
      this.loadEntry();
    this.dictionarySize = await this.getDictionarySize();
    this.bindKeys();
  },
  destroyed() {
    this.unbindKeys();
  },
  methods: {
    async getDictionarySize() {
      let dictionary = await this.$getDictionary();
      let size = await (await dictionary).getSize();
      return size;
    },
    async loadEntry() {
      let method = this.$route.params.method;
      let args = this.$route.params.args;
      if (method && args) {
        if (method === this.$store.state.settings.dictionaryName) {
          if (args !== "random") {
            let dictionary = await this.$getDictionary();
            this.entry = await dictionary.get(args);
            if (process.server) {
              this.images = await WordPhotos.getGoogleImages({
                term: this.entry.bare,
                lang: this.$l2.code,
              });
            }
          }
        } else if (method === "hsk") {
          this.entry = await (await this.$getDictionary()).getByHSKId(args);
        }
      }
      if (this.entry) {
        this.words = await (
          await this.$getDictionary()
        ).lookupMultiple(this.entry.head, true);
      }
    },
    async updateWords() {
      let sW = [];
      if (
        this.$store.state.savedWords.savedWords &&
        this.$store.state.savedWords.savedWords[this.$l2.code]
      ) {
        for (let savedWord of this.$store.state.savedWords.savedWords[
          this.$l2.code
        ]) {
          let word = await (await this.$getDictionary()).get(savedWord.id);
          if (word) {
            sW.push(word);
          }
        }
      }
      this.sW = sW;
    },
    saved() {
      return (
        this.entry &&
        this.entry.bare &&
        this.$store.getters["savedWords/has"]({
          text: this.entry.bare.toLowerCase(),
          l2: this.$l2.code,
        })
      );
    },
    async random() {
      let randomEntry = await (await this.$getDictionary()).random();
      let randomId = randomEntry.id;
      this.$router.push({
        path: `/${this.$l1.code}/${this.$l2.code}/dictionary/${this.$store.state.settings.dictionaryName}/${randomId}`,
      });
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
        if (e.code == "Home") {
          document
            .getElementById("main")
            .scrollIntoView({ behavior: "smooth" });
          // this.$refs.searchCompare.focusOnSearch()
          e.preventDefault();
          return false;
        }
        if (e.code == "End") {
          document
            .getElementById("search-subs")
            .scrollIntoView({ behavior: "smooth" });
          e.preventDefault();
          return false;
        }
        if (e.code == "KeyN") {
          if (this.$refs.dictionaryEntry.$refs.entryHeader.nextPath) {
            this.$router.push(
              this.$refs.dictionaryEntry.$refs.entryHeader.nextPath
            );
          }
          e.preventDefault();
          return false;
        }
        if (e.code == "KeyP") {
          if (this.$refs.dictionaryEntry.$refs.entryHeader.prevPath) {
            this.$router.push(
              this.$refs.dictionaryEntry.$refs.entryHeader.prevPath
            );
          }
          e.preventDefault();
          return false;
        }
        // escape = 27
        if (e.code == "KeyS") {
          let hit = this.$refs.dictionaryEntry.$refs.searchSubs.currentHit;
          if (hit.saved) {
            console.log(
              "Dictionary: Key S - removing hit",
              this.$refs.dictionaryEntry.$refs.searchSubs.terms,
              hit
            );
            this.$refs.dictionaryEntry.$refs.searchSubs.removeSavedHit(hit);
          } else {
            console.log(
              "Dictionary: Key S - saving hit",
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
  watch: {
    "$route.params.args"() {
      if (
        this.$route.name === "dictionary" &&
        this.$route.params.args === "random"
      ) {
        this.random();
      }
    },
  },
  mounted() {
    if (
      this.$route.name === "dictionary" &&
      this.$route.params.args === "random"
    ) {
      this.random();
    }
    if (this.sW.length === 0) this.updateWords();
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type.startsWith("savedWords")) {
        this.updateWords();
      }
      if (mutation.type === "savedWords/REMOVE_SAVED_WORD") {
        if (mutation.payload.word.id === this.entry.id) {
          let currentIndex = this.sW.findIndex(
            (item) => item.id === this.entry.id
          );
          let nextSavedWord = this.sW[currentIndex + 1];
          if (nextSavedWord) {
            this.$router.push({
              name: `dictionary`,
              params: { method: this.method, args: nextSavedWord.id },
            });
          } else if (this.sW.length > 0) {
            this.$router.push({
              name: `dictionary`,
              params: { method: this.method, args: this.sW[0].id },
            });
          }
        }
      }
    });
  },
  beforeDestroy() {
    // you may call unsubscribe to stop the subscription
    this.unsubscribe();
  },
};
</script>

<style lang="scss" scoped>
.dictionary-wide {
  .dictionary-search-bar {
    padding: 1rem;
    background: hsl(0deg 0% 0% / 23%);
    position: fixed;
    top: 0;
    left: 26rem;
    width: calc(100vw - 26rem);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    z-index: 9;
  }
  .content-pane-left {
    overflow-y: scroll;
    padding: 1rem;
    padding-top: 6rem;
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
  .content-pane-right {
    padding: 1rem;
    padding-top: 4rem;
  }

  .for-the-love-of {
    padding-top: 15rem;
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
