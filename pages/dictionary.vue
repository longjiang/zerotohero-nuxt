<router>
  {
    path: '/:l1/:l2/dictionary/:method?/:args?',
    props: true
  }
</router>
<template>
  <div class="main focus" :key="`entry-${entryKey}`" @keydown="keydown">
    <SocialHead :title="title" :description="description" :image="image" />
    <div class="jumbotron jumbotron-fluid bg-white pt-4 pb-0 mb-4">
      <div class="container focus-exclude">
        <div class="row">
          <div class="col-sm-12">
            <div class="text-center">
              <Loader ref="loader" class="mb-5" />
            </div>
            <SearchCompare
              :searchEntry="entry"
              :random="`/${$l1.code}/${$l2.code}/dictionary/${$store.state.settings.dictionaryName}/random`"
              ref="searchCompare"
              :key="`search-${args}`"
              id="search-compare-bar"
            />
          </div>
        </div>
        <h2
          class="mt-5 mb-5 text-center"
          v-if="$l2 && !entry"
          style="min-height: 10rem"
        >
          {{ $t("For the love of {l2} words.", { l2: $t($l2.name) }) }}
        </h2>
      </div>
    </div>
    <div
      v-if="saved()"
      class="jumbotron jumbotron-fluid pt-3 pb-3 bg-secondary"
    >
      <div class="container focus-exclude text-center text-light">
        <Paginator
          :key="`paginator-${args}-${paginatorKey}`"
          :items="sW"
          :findCurrent="(item) => item.id === entry.id"
          :url="
            (item) =>
              `/${$l1.code}/${$l2.code}/dictionary/${$dictionaryName}/${item.id}`
          "
          title="Saved Words"
        />
      </div>
    </div>
    <article>
      <DictionaryEntry
        v-if="entry"
        :entry="entry"
        :images="images"
        ref="dictionaryEntry"
        :key="`dictionary-entry-${entry.id}`"
      />
    </article>
  </div>
</template>

<script>
import SearchCompare from "@/components/SearchCompare.vue";
import Paginator from "@/components/Paginator";
import DictionaryEntry from "@/components/DictionaryEntry";
import WordPhotos from "@/lib/word-photos";

export default {
  components: {
    SearchCompare,
    DictionaryEntry,
    Paginator,
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
      images: [],
      entryKey: 0,
      paginatorKey: 0,
    };
  },
  async fetch() {
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
    title() {
      if (this.entry) {
        return `${this.entry.bare} ${
          this.entry.pronunciation ? "(" + this.entry.pronunciation + ")" : ""
        } ${ this.entry.definitions ? this.entry.definitions.slice(0, 2).join('; ') : ''} | ${this.$l2 ? this.$l2.name : ""} Zero to Hero Dictionary`;
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
  created() {
    this.bindKeys();
  },
  destroyed() {
    this.unbindKeys();
  },
  methods: {
    async updateWords() {
      this.sW = [];
      this.savedTexts = [];
      if (this.$root.savedWords && this.$root.savedWords[this.$l2.code]) {
        for (let savedWord of this.$root.savedWords[this.$l2.code]) {
          let word = await (await this.$getDictionary()).get(savedWord.id);
          if (word) {
            this.sW.push(word);
          }
        }
      }
      this.paginatorKey++;
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
      if (typeof window !== "undefined")
        window.addEventListener("keydown", this.keydown);
    },
    unbindKeys() {
      if (typeof window !== "undefined")
        window.removeEventListener("keydown", this.keydown);
    },

    keydown(e) {
      if (
        !["INPUT", "TEXTAREA"].includes(e.target.tagName.toUpperCase()) &&
        !e.metaKey && !e.repeat
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
        // n = 78
        if (e.keyCode == 78) {
          if (this.$refs.dictionaryEntry.$refs.entryHeader.nextPath) {
            this.$router.push(
              this.$refs.dictionaryEntry.$refs.entryHeader.nextPath
            );
          }
          e.preventDefault();
          return false;
        }
        // p = 80
        if (e.keyCode == 80) {
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
              "key s - removing hit",
              this.$refs.dictionaryEntry.$refs.searchSubs.terms,
              hit
            );
            this.$refs.dictionaryEntry.$refs.searchSubs.removeSavedHit(hit);
          } else {
            console.log(
              "key s - saving hit",
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
        console.log("args random");
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
    if (this.$route.name === "dictionary") {
      this.updateWords();
      this.unsubscribe = this.$store.subscribe((mutation, state) => {
        if (mutation.type.startsWith("savedWords")) {
          this.updateWords();
        }
      });
    }
  },
  beforeDestroy() {
    // you may call unsubscribe to stop the subscription
    this.unsubscribe();
  },
};
</script>

<style>
</style>
