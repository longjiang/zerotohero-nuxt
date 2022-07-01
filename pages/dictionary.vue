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
        'dictionary-wide': wide,
      }"
      :key="`entry-${entryKey}`"
      @keydown="keydown"
    >
      <SocialHead :title="title" :description="description" :image="image" />
      <client-only>
        <div :class="{ 'dictionary-search-bar': args }">
          <div :class="{ 'container pt-2': !wide }">
            <div :class="{ row: !wide }">
              <div :class="{ 'col-sm-12': !wide }">
                <div
                  style="font-size: 1.5rem; color: white; text-align: center"
                  v-if="!args"
                >
                  <img
                    src="/img/logo-play-circle-light.png"
                    style="height: 4rem; margin-bottom: 1rem; margin-top: 3rem"
                    data-not-lazy
                  />
                </div>
                <h5 class="text-center pb-4" v-if="!args">
                  Zero to Hero
                  <LanguageFlag
                    :language="$l2"
                    style="position: relative; bottom: 0.2rem; margin: 0 0.3rem"
                    :autocycle="true"
                  />
                  {{ $l2.name }} Dictionary
                </h5>
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
        <div class="bg-white" style="opacity: 0.8">
          <div class="container" v-if="!entry">
            <div class="row">
              <div class="col-sm-12 bg-white">
                <!-- <Sale style="border-radius: 1rem !important" class="pb-5 pl-5 pr-5" v-if="$l2.code === 'zh'" /> -->
                <div style="max-width: 50rem; margin: 0 auto" class="mt-5">
                  <ul class="list-unstyled">
                    <li class="mt-2">
                      🔍 You can do power search for patterns with
                      <b>wild cards</b>
                      🃏
                    </li>
                    <li class="mt-2">
                      ☝️ Use
                      <code>_</code>
                      underscore to match one character
                    </li>
                    <li class="mt-2">
                      ☝️ Use
                      <code>*</code>
                      asterisk to match one or more characters
                    </li>
                    <li class="mt-2" v-if="dictionarySize">
                      📖 This {{ $l2.name }} dictionary has
                      <b>{{ $n(dictionarySize) }} words</b>
                    </li>
                  </ul>

                  <FeedbackPrompt
                    class="mt-5"
                    :skin="$route.meta ? $route.meta.skin : 'light'"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </client-only>
      <div :class="{ 'focus-exclude dictionary-main': true, container: !wide }">
        <div :class="{ row: !wide, 'content-panes': wide }" v-if="entry">
          <div :class="{ 'content-pane-left': wide, 'col-sm-12': !wide }">
            <LazyHideDefs
              class="mt-2 mb-3 text-center"
              @hideWord="hideWord = arguments[0]"
              @hideDefinitions="hideDefinitions = arguments[0]"
              @hidePhonetics="hidePhonetics = arguments[0]"
            />
            <client-only>
              <div class="text-center mb-3">
                <Star :word="entry" class="ml-1 mr-1" />
                <Paginator
                  class="d-inline-block ml-1 mr-1"
                  v-if="saved() && sW.length > 0"
                  :items="sW"
                  :home="{ name: 'saved-words' }"
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
                  variant="primary"
                  :items="words"
                  text="Disambiguation"
                  menu-class="disambiguation-dropdown"
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
              <LazyEntryHeader
                :entry="entry"
                :hidePhonetics="hidePhonetics"
                :hideWord="hideWord"
              />
              <DefinitionsList
                v-if="entry.definitions"
                :entry="entry"
                :key="`def-list-${entry.id}`"
                :definitions="entry.definitions"
                :class="{ 'mt-3': true, transparent: hideDefinitions }"
              ></DefinitionsList>
              <EntryCourseAd
                v-if="$l2.code === 'zh' && wide"
                variant="compact"
                class="focus-exclude mt-4 mb-5"
                :entry="entry"
              ></EntryCourseAd>
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
              :key="`dictionary-entry-${entry.id}`"
              :showHeader="false"
              :showDefinitions="false"
              :showExample="false"
              :showExternal="false"
            />
            <EntryExternal
              :term="entry.head"
              :traditional="entry.traditional"
              :level="entry.level"
              :sticky="false"
              class="mb-4 text-center"
              style="margin-bottom: 0"
            />
            <SimilarPhrases
              v-if="entry.definitions && entry.definitions.length > 0"
              :phrase="entry.head"
              :translation="similarPhraseTranslation"
              :hideDefinitions="hideDefinitions"
              class="text-center mb-5"
            />
            <!-- <Sale class="mb-5" style="border-radius: 1rem !important" v-if="$l2.code === 'zh'" /> -->
            <EntryCourseAd
              v-if="$l2.code === 'zh'"
              :entry="entry"
              class="focus-exclude mb-2"
              style="margin-top: 10rem"
              :key="`${entry.id}-course-ad`"
            />
            <FeedbackPrompt
              class="mb-5"
              :skin="$route.meta ? $route.meta.skin : 'light'"
            />
          </div>
        </div>
      </div>
    </div>
  </container-query>
</template>

<script>
import WordPhotos from "@/lib/word-photos";
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
      hideDefinitions: false,
      hidePhonetics: false,
      hideWord: false,
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
    similarPhraseTranslation() {
      let en;
      if (this.$l2.code === "en") en = this.entry.head;
      else if (this.entry.definitions && this.entry.definitions[0]) {
        en = this.entry.definitions[0].split(", ")[0];
      }
      if (en) en = en.replace(/\(.*\)/g, "").trim();
      return en;
    },
    title() {
      if (this.entry) {
        return `${this.entry.head} ${
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
        return `"${this.entry.head}" means ${
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
  async mounted() {
    // Begin tasks previously run on server
    this.loadEntry();
    this.dictionarySize = await this.getDictionarySize();
    this.bindKeys();
    // End tasks previously run on server
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
    if (this.unsubscribe) this.unsubscribe();
  },
  destroyed() {
    this.unbindKeys();
  },
  methods: {
    async getDictionarySize() {
      let dictionary = await this.$getDictionary();
      if (dictionary) {
        let size = await dictionary.getSize();
        return size;
      }
    },
    async loadEntry() {
      let method = this.$route.params.method;
      let args = this.$route.params.args;
      if (method && args) {
        if (method === this.$store.state.settings.dictionaryName) {
          if (args !== "random") {
            let dictionary = await this.$getDictionary();
            if (dictionary) {
              this.entry = await dictionary.get(args);
              if (process.server) {
                this.images = await WordPhotos.getGoogleImages({
                  term: this.entry.head,
                  lang: this.$l2.code,
                });
              }
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
        let savedWords = this.$store.state.savedWords.savedWords[this.$l2.code];
        let currentSavedWord = savedWords.find(w => w.id === this.entry.id)        
        savedWords = savedWords.filter(w => this.dateStr(w.date) === this.dateStr(currentSavedWord.date))
        for (let savedWord of savedWords) {
          let word = await (await this.$getDictionary()).get(savedWord.id);
          if (word) {
            sW.push(word);
          }
        }
      }
      this.sW = sW
      // .sort((a, b) => a.head.localeCompare(b.head));
    },
    dateStr(date) {
      return date ? new Date(Number(date)).toISOString().replace(/T.*/, "") : 0
    },
    saved() {
      return (
        this.entry &&
        this.entry.head &&
        this.$store.getters["savedWords/has"]({
          id: this.entry.id,
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
};
</script>

<style lang="scss" scoped>
.dictionary {
  min-height: 100vh;
  background: white;
}

.zerotohero-wide-collapsed .dictionary-wide .dictionary-search-bar {
  left: 9rem;
  width: calc(100vw - 9rem);
}

.dictionary-main {
  min-height: calc(100vh - 40rem);
  background: white;
}

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
    padding-top: 5.2rem;

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
      overflow: hidden;
    }
  }

  .content-pane-right {
    padding: 1rem;
    padding-top: 4.5rem;
  }
}

::v-deep .disambiguation-dropdown {
  margin-left: -3.5rem;
  width: 15rem;

  .dropdown-item {
    white-space: normal;
    padding: 0.2rem 1rem;
  }
}
</style>
