<router>
  {
    path: '/:l1/:l2/saved-words',
    meta: {
      title: 'Saved Words | Zero to Hero',
      metaTags: [
        {
          name: 'description',
          content: 'Study, manage, import, export the words you saved.'
        }
      ]
    }
  }
</router>
<template>
  <div class="main pt-5 pb-4" v-cloak>
    <div class="container">
      <div class="row">
        <div class="col-sm-12">
          <h3 class="text-center">Saved {{ $l2.name }} Words</h3>
          <p class="text-center mb-5">
            {{
              $t(
                "These words are stored in your browser's local storage, which persists unless you clear your browsing data."
              )
            }}
          </p>
          <div class="text-center">
            <Loader class="mt-4" @loaded="updateLoaded" />
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-12">
          <p
            v-if="dictionaryLoaded && sWLoaded && sW.length <= 0"
            class="alert alert-warning no-saved-words text-center p-5"
          >
            You don't have any words saved yet. Save words by tapping on the
            <i class="far fa-star"></i>
            icon next to it.
          </p>
          <div>
            <a
              class="download-csv btn btn-primary btn-sm"
              :href="csvHref"
              :download="`${$l2.name
                .toLowerCase()
                .replace(/ /g, '-')}-saved-words.csv`"
              variant="primary"
              size="sm"
              v-if="this.sW.length > 0"
            >
              <i class="fa fa-download mr-1"></i>
              {{ $t("Export CSV") }}
            </a>
            <b-button
              class="remove-all"
              variant="danger"
              size="sm"
              v-on:click="removeAllClick"
              v-if="this.sW.length > 0"
            >
              <i class="glyphicon glyphicon-trash"></i>
              {{ $t("Clear") }}
            </b-button>
            <router-link
              v-if="sW.length > 0"
              class="btn btn-gray btn-sm"
              :to="`/${$l1.code}/${$l2.code}/learn-interactive/saved`"
            >
              <i class="fa fa-chalkboard"></i>
              Learn (Legacy)
            </router-link>
          </div>
          <div
            class="pt-3 pb-3 bg-white"
            style="position: sticky; top: 0; z-index: 9"
          >
            <b-form-checkbox v-model="hideDefinitions">
              Hide definitions
            </b-form-checkbox>
          </div>
          <WordList
            :words="sW"
            :hideDefinitions="hideDefinitions"
          ></WordList>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import WordList from "@/components/WordList.vue";
import Helper from "@/lib/helper";
import Papa from "papaparse";

export default {
  template: "#saved-words-template",
  components: {
    WordList,
  },
  data() {
    return {
      hideDefinitions: false,
      dictionaryLoaded: false,
      sWLoaded: false,
      showExport: false,
      sW: [],
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
    csvHref() {
      return Helper.makeTextFile(this.csv);
    },
    $dictionaryName() {
      return this.$store.state.settings.dictionaryName;
    },
    csv() {
      let csvWords = this.sW.map((word) => {
        let mapped = { id: word.id, head: word.head };
        mapped = Object.assign(mapped, word);
        mapped.definitions = word.definitions.join("; ");
        if (word.simplified || word.kana || word.hangul) delete mapped.head;
        delete mapped.cjk;
        delete mapped.search;
        delete mapped.newHSKMatches;
        delete mapped.saved;
        delete mapped.phrase;
        delete mapped.bare;
        delete mapped.username;
        delete mapped.created;
        delete mapped.audio;
        delete mapped.c;
        delete mapped.e;
        delete mapped.f;
        delete mapped.i;
        delete mapped.k;
        delete mapped.l;
        if (this.$dictionaryName !== "openrussian") delete mapped.accented;
        delete mapped.wiktionary;
        return mapped;
      });
      let csv = Papa.unparse(csvWords);
      return csv;
    },
  },
  mounted() {
    this.updateWords();
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type.startsWith("savedWords")) {
        this.updateWords();
      }
    });
  },
  beforeDestroy() {
    // you may call unsubscribe to stop the subscription
    this.unsubscribe();
  },
  methods: {
    updateLoaded(loaded) {
      this.dictionaryLoaded = loaded;
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
      this.sW = sW.sort((a, b) => a.head.localeCompare(b.head));
      this.sWLoaded = true;
    },
    showImportClick() {
      $(".import-wrapper").toggleClass("hidden");
    },
    removeAllClick() {
      const confirmed = confirm(
        "Are you sure you want to remove all your saved words?"
      );
      if (confirmed) {
        this.$store.dispatch("savedWords/removeAll", {
          l2: this.$l2.code,
        });
        $(".export-wrapper").toggleClass("hidden", true);
      }
    },
  },
};
</script>
