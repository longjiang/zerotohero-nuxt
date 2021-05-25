<router>
  {
    path: '/:l1/:l2/phrase/search/:term?',
    props: true
  }
</router>
<template>
  <div class="phrase">
    <SocialHead :title="title" :description="description" :image="image" />
    <div class="container main mt-5 mb-5">
      <div class="row">
        <div class="col-sm-12">
          <h2 class="text-center mb-3">Lookup phrases not in the dictionary</h2>
          <p class="text-center mb-5">
            and see how they are used in real contexts.
          </p>
          <div class="search-compare-wrapper">
            <SearchCompare
              placeholder="Enter a word or phrase"
              type="generic"
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
          <div class="text-center mt-5 mb-3">
            <EntryExternal :term="term" />
          </div>
          <div class="focus">
            <WebImages
              v-if="term"
              :text="term"
              limit="10"
              class="mt-5"
              :key="`${term}-images`"
            />
            <Collocations
              v-if="term"
              :text="term"
              class="mt-5"
              :key="`${term}-col`"
            />
          </div>
          <div
            class="widget mt-5"
            id="search-subs"
            v-if="term"
            :key="`subs-search-${term}`"
          >
            <div class="widget-title">“{{ term }}” in TV Shows</div>
            <div class="widget-body">
              <SearchSubsComp
                v-if="term && delayed"
                ref="searchSubs"
                level="outside"
                :key="`${term}-search-subs`"
                :terms="[term]"
              />
            </div>
          </div>
          <div :key="term" class="focus">
            <Concordance
              v-if="term"
              :text="term"
              class="mt-5"
              :key="`${term}-concordance`"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Concordance from "@/components/Concordance";
import Collocations from "@/components/Collocations";
import SearchCompare from "@/components/SearchCompare";
import WebImages from "@/components/WebImages";
import SearchSubsComp from "@/components/SearchSubsComp";
import WordPhotos from "@/lib/word-photos";

export default {
  components: {
    SearchCompare,
    Collocations,
    WebImages,
    Concordance,
    SearchSubsComp,
  },
  props: {
    method: {
      type: String,
    },
    term: "",
    compareTerm: "",
  },
  data() {
    return {
      images: [],
      delayed: {
        default: false,
      },
    };
  },
  async fetch() {
    if (this.term)
      this.images = await WordPhotos.getGoogleImages({
        term: this.term,
        lang: this.$l2.code,
      });
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
      if (this.term) {
        return `Learn the ${this.$l2 ? this.$l2.name : ""} Phrase “${
          this.term
        }” | ${this.$l2 ? this.$l2.name : ""} Zero to Hero Dictionary`;
      }
      return `Lookup ${this.$l2 ? this.$l2.name : ""} Phrases | ${
        this.$l2 ? this.$l2.name : ""
      } Zero to Hero`;
    },
    description() {
      if (this.term) {
        return `See how “${this.term}” is used in TV shows, how it forms collocations, and other examples.`;
      }
      return `Look up ${this.$l2 ? this.$l2.name : ""} phrases. See how ${
        this.$l2 ? this.$l2.name : ""
      } words are used in TV shows, how they form collocations, and other examples.`;
    },
    image() {
      if (this.images.length > 0) {
        return this.images[0].src;
      } else {
        return "/img/zth-share-image.jpg";
      }
    },
  },
  methods: {
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
      }
    },
  },
  activated() {
    this.bindKeys();
  },
  deactivated() {
    this.unbindKeys();
  },
};
</script>

<style></style>
