<router>
  {
    path: '/:l1/:l2/phrase/search/:term?',
    props: true
  }
</router>
<template>
  <container-query :query="query" v-model="params">
    <div
      :class="{
        'phrase focus': true,
        'bg-white': !wide,
        'phrase-wide': wide,
      }"
    >
      <SocialHead
        v-if="term === ''"
        :title="`Look up ${this.$l2 ? this.$l2.name : ''}
      Phrases | ${this.$l2 ? this.$l2.name : ''} Zero to Hero`"
        :description="`Look up ${this.$l2 ? this.$l2.name : ''} phrases and see
      how they are used in TV shows.`"
      />
      <client-only>
        <div class="phrase-search-bar">
          <div class="container pt-2">
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
      <div class="for-the-love-of-wrapper bg-white">
        <div class="container" v-if="!term">
          <div class="row">
            <div class="col-sm-12 bg-white">
              <div class="for-the-love-of">
                <h3 class="text-center font-weight-normal">
                  For the love of
                  {{ $l2.name }} phrases.
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
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
              'text-center': true,
            }"
          >
            <PhraseHeader v-if="term" :term="term" :class="{ 'mt-4': !wide }" />
            <div class="mt-3">
              <SimilarPhrases
                v-if="term"
                :phrase="term"
                class="text-center"
              />
            </div>
          </div>
          <div
            :class="{
              'col-sm-12': !wide,
              'content-pane-right pl-3 pr-3': wide,
            }"
          >
            <LazyPhraseComp
              v-if="term"
              :term="term"
              class="mt-4"
              :showHeader="false"
            />
          </div>
        </div>
      </div>
    </div>
  </container-query>
</template>

<script>
import { ContainerQuery } from "vue-container-query";

export default {
  components: {
    ContainerQuery,
  },
  props: {
    term: "",
    compareTerm: "",
  },
  data() {
    return {
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
    wide() {
      return this.params.wide && ["lg", "xl", "xxl"].includes(this.$mq);
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


<style lang="scss" scoped>
.phrase-wide {
  .phrase-search-bar {
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

