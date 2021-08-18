<router>
  {
    path: '/:l1/:l2/grammar/view/:id',
    props: true
  }
</router>
<template>
  <div class="main">
    <div class="container pt-4" id="main">
      <SocialHead
        v-if="grammar && images && images[0]"
        :title="`Chinese Grammar Pattern “${grammar.structure}” (HSK${grammar.code}) | ${$l2.name} Zero to Hero`"
        :description="`Example: ${grammar.example} ${grammar.exampleTranslation}`"
        :image="images[0].src"
      />
      <div class="row">
        <div class="col-sm-12" v-if="grammar">
          <h6 class="mb-2 text-center">
            <button class="btn btn-small mr-1" v-if="id > 1" @click="prevClick">
              <i class="fa fa-caret-left" />
            </button>
            Grammar HSK{{ grammar.code }}
            <button class="btn btn-small" @click="nextClick">
              <i class="fa fa-caret-right" />
            </button>
          </h6>

          <LazyGrammarPoint :grammar="grammar" :key="id" class="mb-5" />

          <div
            class="widget widget-dark mt-5 mb-5"
            id="search-subs"
            v-if="
              grammar.pattern &&
              (!entry || grammar.pattern !== entry.simplified)
            "
            :key="`subs-search-${grammar.pattern}`"
          >
            <div class="widget-title">“{{ grammar.pattern }}” in TV Shows</div>
            <div class="widget-body">
              <LazySearchSubsComp
                v-if="grammar.pattern"
                ref="searchSubs"
                skin="dark"
                :level="grammar.level"
                :terms="[grammar.pattern]"
              />
            </div>
          </div>

          <div class="text-left mt-5" v-if="drills && drills.length > 0">
            <hr />
            <h4 class="text-center">Practice Drills</h4>
            <LazyDrill
              v-for="drill in drills"
              :drill="drill"
              :key="`drill-${grammar.id}-${drill.id}`"
            />
          </div>
          <div v-if="entry">
            <hr />
            <LazyDictionaryEntry
              :entry="entry"
              :showSearchSubs="
                !(
                  grammar.pattern &&
                  (!entry || grammar.pattern !== entry.simplified)
                )
              "
              :showImages="false"
              ref="dictionaryEntry"
              :key="`dictionary-entry-${entry.id}`"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Grammar from "@/lib/grammar";
import Config from "@/lib/config";
import Helper from "@/lib/helper";
import WordPhotos from "@/lib/word-photos";
import axios from "axios";

export default {
  props: {
    id: {
      type: String,
    },
  },
  data() {
    return {
      grammar: undefined,
      drills: [],
      entry: false,
      images: [],
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
    term() {
      return this.grammar
        ? this.grammar.structure.replace(/…….*/, "").replace(Helper.nonCjk, "")
        : false;
    },
  },
  async fetch() {
    this.grammar = await this.loadGrammar();
    this.drills = await this.getDrill(this.grammar.id);
    this.images = await WordPhotos.getGoogleImages({
      term: this.term,
      lang: this.$l2.code,
    });
    this.entry = await this.loadEntry();
  },
  methods: {
    async getDrill(grammarID) {
      let response = await axios.get(
        `${Config.wiki}items/drills?filter[grammar_id][eq]=${grammarID}&fields=*,file.*`
      );
      response = response.data;
      if (response && response.data && response.data[0]) {
        return response.data;
      }
    },
    async loadGrammar() {
      this.drills = [];

      let grammar = await this.$getGrammar();
      return grammar._grammarData.find((row) => row.id === this.id);
    },
    async loadEntry() {
      let entry = await (await this.$getDictionary()).lookup(this.term);
      entry =
        entry ||
        (await (
          await this.$getDictionary()
        ).lookup(this.grammar.pattern.replace(/\*.*/, "")));
      return entry;
    },
    prevClick() {
      this.$router.push({
        path:
          `/${this.$l1.code}/${this.$l2.code}/grammar/view/` +
          Math.max(0, parseInt(this.id) - 1),
      });
    },
    nextClick() {
      this.$router.push({
        path:
          `/${this.$l1.code}/${this.$l2.code}/grammar/view/` +
          Math.min(Grammar._grammarData.length - 1, parseInt(this.id) + 1),
      });
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
          this.nextClick();
          document
            .getElementById("main")
            .scrollIntoView({ behavior: "smooth" });
          e.preventDefault();
          return false;
        }
        // p = 80
        if (e.keyCode == 80) {
          this.prevClick();
          document
            .getElementById("main")
            .scrollIntoView({ behavior: "smooth" });
          e.preventDefault();
          return false;
        }
      }
    },
    bindKeys() {
      document.addEventListener("keydown", this.keydown);
    },
    unbindKeys() {
      document.removeEventListener("keydown", this.keydown);
    },
  },
  mounted() {
    this.bindKeys();
    this.loadGrammar();
  },
  unmounted() {
    this.unbindKeys();
  },
  activated() {
    this.bindKeys();
  },
  deactivated() {
    this.unbindKeys();
  },
  watch: {
    id() {
      this.loadGrammar();
    },
  },
};
</script>

<style></style>
