<router>
  {
    path: '/:l1/:l2/dictionary/:method?/:args?',
    props: true
  }
</router>
<template>
  <div class="main focus" :key="`entry-${entryKey}`">
    <div class="jumbotron jumbotron-fluid bg-white pt-4 pb-0 mb-4">
      <div class="container focus-exclude">
        <div class="row">
          <div class="col-sm-12">
            <div class="text-center">
              <Loader ref="loader" class="mb-5" />
            </div>
            <SearchCompare
              :searchEntry="entry"
              :random="true"
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
      <SocialHead :title="title" :description="description" :image="image" />
      <DictionaryEntry
        v-if="entry"
        :entry="entry"
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
      entryKey: 0,
      paginatorKey: 0,
    };
  },
  head() {
    return {
      title: this.title,
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: this.description
        }
      ]
    }
  },
  methods: {
    async updateWords() {
      this.sW = [];
      this.savedTexts = [];
      if (this.$root.savedWords && this.$root.savedWords[this.$l2.code]) {
        for (let savedWord of this.$root.savedWords[this.$l2.code]) {
          let word = await (await this.$dictionary).get(savedWord.id);
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
    async show(entry) {
      this.entry = entry
    },
    async route() {
      if (this.method && this.args) {
        if (this.method === this.$dictionaryName) {
          if (this.args === "random") {
            this.random();
          } else {
            let entry = await (await this.$dictionary).get(this.args);
            this.show(entry);
          }
        } else if (this.method === "hsk") {
          let entry = await (await this.$dictionary).getByHSKId(this.args);
          this.show(entry);
        }
      }
    },
    async random() {
      let randomId = (await (await this.$dictionary).random()).id;
      this.$router.push({
        path: `/${this.$l1.code}/${this.$l2.code}/dictionary/${this.$dictionaryName}/${randomId}`,
      });
    },

    bindKeys() {
      window.addEventListener("keydown", this.keydown);
    },
    unbindKeys() {
      window.removeEventListener("keydown", this.keydown);
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
        // n = 78
        if (e.keyCode == 78) {
          this.$refs.dictionaryEntry.$refs.entryHeader.nextWord();
          document
            .getElementById("main")
            .scrollIntoView({ behavior: "smooth" });
          e.preventDefault();
          return false;
        }
        // p = 80
        if (e.keyCode == 80) {
          this.$refs.dictionaryEntry.$refs.entryHeader.prevWord();
          document
            .getElementById("main")
            .scrollIntoView({ behavior: "smooth" });
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
  computed: {
    title() {
      if (this.entry) {
        return `${this.entry.bare} ${
          this.entry.pronunciation ? "(" + this.entry.pronunciation + ")" : ""
        } | ${this.$l2 ? this.$l2.name : ""} Zero to Hero Dictionary`;
      }
      return `Dictionary | ${this.$l2 ? this.$l2.name : ""} Zero to Hero`;
    },
    description() {
      if (this.entry) {
        return `"${this.entry.bare}" means ${this.entry.definitions.join(
          "; "
        )}`;
      }
      return `Look up  ${this.$l2 ? this.$l2.name : ""} words.`;
    },
    image() {
      if (this.entry) {
        if (this.$refs.dictionaryEntry && this.$refs.dictionaryEntry.webImage) {
          return this.$refs.dictionaryEntry.webImage
        }
        return this.$languages.logo(this.$l2.code);
      }
      return "/img/icon-z2h.jpeg";
    },
  },
  watch: {
    $route() {
      if (this.$route.name === "dictionary") {
        this.route();
      }
    },
  },
  activated() {
    this.bindKeys();
  },
  deactivated() {
    this.unbindKeys();
  },
  mounted() {
    if (this.$route.name === "dictionary") {
      this.route();
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
