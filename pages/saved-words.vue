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
          <h3 class="text-center">{{ $t("Saved Words") }}</h3>
          <p class="text-center mb-5">
            {{
              $t(
                "These words are stored in your browser's local storage, which persists unless you clear your browsing data."
              )
            }}
          </p>
          <div class="my-words-tools mt-2 mb-2 text-right">
            <div class="export-wrapper text-left mt-4" v-if="showExport">
              <p v-html="$t('copyPasteCSV')" />
              <b-form-group :label="$t('Include:')">
                <b-form-checkbox-group
                  v-model="selectedCsvOptions"
                  :options="csvOptions"
                  @click="updateCSVText()"
                ></b-form-checkbox-group>
              </b-form-group>
              <textarea
                id="export-textarea"
                class="mt-2 mb-2 form-control"
                cols="30"
                rows="10"
                v-model="csvText"
              ></textarea>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-12">
          <p
            v-if="loaded && sW.length <= 0"
            class="alert alert-warning no-saved-words"
          >
            You don't have any words saved yet. Save words by clicking on the
            <i class="glyphicon glyphicon-star-empty"></i>
            icon next to it.
          </p>
          <div>
            <b-button
              class="upload-list"
              variant="primary"
              v-on:click="showExportClick"
              v-if="this.sW.length > 0"
            >
              <i class="fa fa-download mr-1"></i>
              {{ $t("Export CSV") }}
            </b-button>
            <b-button
              class="remove-all"
              variant="danger"
              v-on:click="removeAllClick"
              v-if="this.sW.length > 0"
            >
              <i class="glyphicon glyphicon-trash"></i>
              {{ $t("Clear") }}
            </b-button>
            <router-link
              v-if="sW.length > 0"
              class="btn btn-gray"
              :to="`/${$l1.code}/${$l2.code}/learn-interactive/saved`"
            >
              <i class="fa fa-chalkboard"></i>
              Learn (Legacy)
            </router-link>
          </div>
          <Loader class="mt-4" />
          <WordList :words="sW" class="mt-4"></WordList>
          <div v-if="this.sW.length <= 0" class="text-center">
            (You do not have any saved words yet.)
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import WordList from "@/components/WordList.vue";

export default {
  template: "#saved-words-template",
  components: {
    WordList,
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
  data() {
    return {
      loaded: false,
      csvText: "",
      showExport: false,
      sW: [],
      selectedCsvOptions: ["en", "definitions"],
      csvOptions: [
        {
          text: this.$t(this.$store.state.settings.l2.name),
          value: this.$store.state.settings.l2.code,
        },
        { text: this.$t("Pronunciation"), value: "pronunciation" },
        { text: this.$t("Definitions"), value: "definitions" },
      ],
    };
  },
  watch: {
    async selectedCsvOptions() {
      this.csvText = await this.csv();
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
    async csv() {
      if (this.sW.length <= 0) {
        return "";
      }

      let csv = "";
      for (let word of this.sW) {
        if (this.selectedCsvOptions.includes("en")) {
          let a = word.accented;
          csv += `${a}\t`;
        }
        if (this.selectedCsvOptions.includes("pronunciation")) {
          csv += `${word.pronunciation ? word.pronunciation : ""}\t`;
        }

        if (this.selectedCsvOptions.includes("definitions")) {
          csv += `${word.definitions ? word.definitions.join(", ") : ""}\t`;
        }
        csv += "\n";
      }
      return csv;
    },
    showImportClick() {
      $(".import-wrapper").toggleClass("hidden");
    },
    async updateCSVText() {
      this.csvText = await this.csv();
    },
    showExportClick() {
      this.showExport = !this.showExport;
      this.updateCSVText();
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
