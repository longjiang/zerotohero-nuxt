<router>
  {
    path: '/:l1/:l2/dictionary/:method?/:args?',
    props: true
  }
</router>
<template>
  <div class="main focus" :key="`entry-${entryKey}`" @keydown="keydown">
    <SocialHead :title="title" :description="description" :image="image" />
    <div class="pt-4 pb-4">
      <div class="container focus-exclude">
        <div class="row">
          <div class="col-sm-12">
            <SearchCompare
              :searchEntry="entry"
              :random="`/${$l1.code}/${$l2.code}/dictionary/${$store.state.settings.dictionaryName}/random`"
              ref="searchCompare"
              :key="`search-${args}`"
              id="search-compare-bar"
            />
          </div>
        </div>
        <h3
          class="pt-5 pb-5 text-center"
          v-if="$l2 && !entry && dictionarySize"
          style="min-height: 10rem"
        >
          For the love of {{ dictionarySize.toLocaleString("en-US") }} {{ $l2.name }} words.
        </h3>
      </div>
    </div>
    <div v-if="saved() && sW.length > 0" class="text-center">
      <Paginator
        :items="sW"
        :findCurrent="(item) => item.id === entry.id"
        :url="
          (item) =>
            `/${$l1.code}/${$l2.code}/dictionary/${$dictionaryName}/${item.id}`
        "
        title="Saved Words"
      />
    </div>
    <div class="text-center mt-3" v-if="words && words.length > 1">
      <b-dropdown size="sm" :items="words" text="Disambiguation">
        <b-dropdown-item
          v-for="w in words"
          :key="`phrase-word-disambiguation-${w.id}`"
          @click="$router.push(`/${$l1.code}/${$l2.code}/dictionary/${$dictionaryName}/${w.id}`)"
        >
          <b>{{ w.head }}</b>
          <em>{{ w.definitions[0] }}</em>
        </b-dropdown-item>
      </b-dropdown>
    </div>
    <article>
      <LazyDictionaryEntry
        v-if="entry"
        :entry="entry"
        :images="images"
        ref="dictionaryEntry"
        :class="{ 'pb-5': $l2.code !== 'zh' }"
        :key="`dictionary-entry-${entry.id}`"
      />
    </article>
  </div>
</template>

<script>
import WordPhotos from "@/lib/word-photos";
import Helper from "@/lib/helper";

export default {
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
      keysBound: false
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
    this.dictionarySize = await this.getDictionarySize()
    this.bindKeys();
  },
  destroyed() {
    this.unbindKeys();
  },
  methods: {
    async getDictionarySize() {
      let dictionary = await this.$getDictionary();
      let size = await (await dictionary).getSize();
      return size
    },
    async loadEntry() {
      let method = this.$route.params.method;
      let args = this.$route.params.args;
      if (method && args) {
        if (method === this.$store.state.settings.dictionaryName) {
          if (args !== "random") {
            let dictionary = await this.$getDictionary();
            this.entry = await dictionary.get(args);
            this.images = await WordPhotos.getGoogleImages({
              term: this.entry.bare,
              lang: this.$l2.code,
            });
          }
        } else if (method === "hsk") {
          this.entry = await (await this.$getDictionary()).getByHSKId(args);
        }
      }
      if (this.entry) {
        this.words = await (await this.$getDictionary()).lookupMultiple(this.entry.head, true);
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
        this.keysBound = true // bind only once!
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
        if (e.code == 'Home') {
          document
            .getElementById("main")
            .scrollIntoView({ behavior: "smooth" });
          // this.$refs.searchCompare.focusOnSearch()
          e.preventDefault();
          return false;
        }
        if (e.code == 'End') {
          document
            .getElementById("search-subs")
            .scrollIntoView({ behavior: "smooth" });
          e.preventDefault();
          return false;
        }
        if (e.code == 'KeyN') {
          if (this.$refs.dictionaryEntry.$refs.entryHeader.nextPath) {
            this.$router.push(
              this.$refs.dictionaryEntry.$refs.entryHeader.nextPath
            );
          }
          e.preventDefault();
          return false;
        }
        if (e.code == 'KeyP') {
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

<style>
</style>
