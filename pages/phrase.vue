<router>
  {
    path: '/:l1/:l2/phrase/search/:term?',
    props: true
  }
</router>
<template>
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
        <PhraseComp v-if="term" :term="term" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
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
  computed: {
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
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
