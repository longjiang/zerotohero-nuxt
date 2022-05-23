<template>
  <container-query :query="query" v-model="params">
    <div class="container">
      <div class="row">
        <div
          :class="{
            'language-overview-item': true,
            'col-sm-4': params.md || params.lg || params.xl,
            'col-sm-6': params.sm,
            'col-sm-12': params.xs,
          }"
          v-for="(languageProgress, l2Code) in progress"
          :set="(language = $languages.getSmart(l2Code))"
          :key="`language-overview-item-${l2Code}`"
        >
          <template v-if="language && language.name">
            <div class="language-flag-wrapper">
              <LanguageFlag :language="language" />
            </div>
            <LanguageProgress
              :$l1="$languages.getSmart('en')"
              :$l2="language"
            />
          </template>
        </div>
      </div>
      <div
        class="row dashboard-saved-words"
        v-if="
          (savedWordsSorted && savedWordsSorted.length > 0) ||
          (savedPhrasesSorted && savedPhrasesSorted.length > 0)
        "
      >
        <div class="col-12">
          <div
            :class="{
              'text-center': l2,
              'dashboard-saved-words-list': !l2,
            }"
          >
            <router-link
              v-for="(savedWordsLang, index) in savedWordsSorted"
              :to="`/${languageL1(savedWordsLang.l2)}/${
                savedWordsLang.l2.code
              }/saved-words`"
              class="link-unstyled d-block dashboard-saved-words-list-item"
              :key="`dashboard-saved-words-${index}`"
            >
              <i
                class="fa fa-star"
                style="opacity: 0.5; width: 1.2rem; text-align: center"
              ></i>
              <span
                style="
                  min-width: 1.7rem;
                  display: inline-block;
                  text-align: center;
                "
              >
                {{ savedWordsLang.words.length }}
              </span>
              word{{ savedWordsLang.words.length > 1 ? "s" : "" }}

              in
              <img
                v-if="showFlags && countryCode(savedWordsLang.l2)"
                :src="`/vendor/flag-svgs/${countryCode(savedWordsLang.l2)}.svg`"
                class="flag-icon mr-1"
              />
              <strong>{{ languageName(savedWordsLang.l2) }}</strong>
            </router-link>
            <router-link
              v-for="(savedPhrasesLang, index) in savedPhrasesSorted"
              :to="`/${languageL1(savedPhrasesLang.l2)}/${
                savedPhrasesLang.l2.code
              }/saved-phrases`"
              class="link-unstyled d-block dashboard-saved-words-list-item"
              :key="`dashboard-saved-phrases-${index}`"
            >
              <i
                class="fa fa-bookmark"
                style="opacity: 0.5; width: 1.2rem; text-align: center"
              ></i>
              <span
                style="
                  min-width: 1.7rem;
                  display: inline-block;
                  text-align: center;
                "
              >
                {{ savedPhrasesLang.phrases.length }}
              </span>
              phrase{{ savedPhrasesLang.phrases.length > 1 ? "s" : "" }}

              in
              <img
                v-if="showFlags && countryCode(savedPhrasesLang.l2)"
                :src="`/vendor/flag-svgs/${countryCode(
                  savedPhrasesLang.l2
                )}.svg`"
                class="flag-icon mr-1"
              />
              <strong>{{ savedPhrasesLang.l2.name }}</strong>
            </router-link>
          </div>
        </div>
      </div>
      <div class="row mt-4">
        <div class="col-12">
          <div class="text-center">
            <button
              :class="`btn btn-ghost-dark btn-small ${
                skin === 'light' ? 'text-secondary' : ''
              }`"
              v-if="
                (savedWordsSorted && savedWordsSorted.length > 0) ||
                (savedPhrasesSorted && savedPhrasesSorted.length > 0)
              "
              @click="showExportButtons = !showExportButtons"
            >
              <i class="fa fa-download mr-1"></i>
              Export
            </button>
            <input
              id="fileUpload"
              ref="upload"
              type="file"
              hidden
              @change="importCSV"
            />
            <button
              :class="`btn btn-ghost-dark btn-small ${
                skin === 'light' ? 'text-secondary' : ''
              }`"
              @click="importButtonClick()"
            >
              <i class="fa fa-upload mr-1"></i>
              Import
            </button>
            <button
              :class="`btn btn-ghost-dark btn-small ${
                skin === 'light' ? 'text-secondary' : ''
              }`"
              v-if="
                (savedWordsSorted && savedWordsSorted.length > 0) ||
                (savedPhrasesSorted && savedPhrasesSorted.length > 0)
              "
              @click="deleteAllSavedWordsAndPhrases()"
            >
              <i class="fa fa-trash mr-1"></i>
              Delete All
            </button>
            <div v-if="showExportButtons" class="mt-3">
              <span class="mr-2">Exported and ready to download:</span>
              <a
                :href="wordsCSVHref"
                :download="`saved-words${
                  l2 ? '-' + l2.code : ''
                }-${hostname}.csv`"
                v-if="
                  savedWordsSorted &&
                  savedWordsSorted.length > 0 &&
                  wordsCSVHref
                "
                class="mr-2"
              >
                <i class="fa fa-download mr-1"></i>
                <u>Saved Words</u>
              </a>
              <a
                v-if="
                  savedPhrasesSorted &&
                  savedPhrasesSorted.length > 0 &&
                  phrasesCSVHref
                "
                :download="`saved-phrases${
                  l2 ? '-' + l2.code : ''
                }-${hostname}.csv`"
                :href="phrasesCSVHref"
              >
                <i class="fa fa-download mr-1"></i>
                <u>Saved Phrases</u>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </container-query>
</template>

<script>
import { ContainerQuery } from "vue-container-query";
import { mapState } from "vuex";
import Helper from "@/lib/helper";

export default {
  components: {
    ContainerQuery,
  },
  props: {
    l2: undefined,
    skin: {
      default: "light",
    },
    showFlags: {
      default: false,
    },
  },
  data() {
    return {
      params: {},
      showExportButtons: false,
      phrasesCSVHref: undefined,
      wordsCSVHref: undefined,
      specials: Helper.specialLanguages,
      query: {
        xs: {
          minWidth: 0,
          maxWidth: 423,
        },
        sm: {
          minWidth: 423,
          maxWidth: 720,
        },
        md: {
          minWidth: 720,
          maxWidth: 960,
        },
        lg: {
          minWidth: 960,
          maxWidth: 1140,
        },
        xl: {
          minWidth: 1140,
        },
      },
    };
  },
  mounted() {
    this.emitHasDashboard();
    if (!this.$store.state.history.historyLoaded) {
      this.$store.dispatch("history/load");
    }
  },
  computed: {
    ...mapState("savedWords", ["savedWords"]),
    ...mapState("savedPhrases", ["savedPhrases"]),
    ...mapState("progress", ["progress"]),
    hostname() {
      if (window) return window.location.hostname;
      else return "";
    },
    savedWordsSorted() {
      let savedWordsSorted = [];
      for (let l2 in this.savedWords) {
        let lang = this.$languages.getSmart(l2);
        if (lang) {
          savedWordsSorted.push({
            l2: lang,
            words: this.savedWords[l2],
          });
        }
      }
      savedWordsSorted = savedWordsSorted
        .sort((a, b) => b.words.length - a.words.length)
        .filter((s) => s.l2 && s.words.length > 0);
      if (this.l2)
        savedWordsSorted = savedWordsSorted.filter(
          (s) => s.l2.code === this.l2.code
        );
      return savedWordsSorted;
    },
    savedPhrasesSorted() {
      let savedPhrasesSorted = [];
      for (let l2 in this.savedPhrases) {
        savedPhrasesSorted.push({
          l2: this.$languages.getSmart(l2),
          phrases: this.savedPhrases[l2],
        });
      }
      savedPhrasesSorted = savedPhrasesSorted
        .sort((a, b) => b.phrases.length - a.phrases.length)
        .filter((s) => s.l2 && s.phrases.length > 0);
      if (this.l2)
        savedPhrasesSorted = savedPhrasesSorted.filter(
          (s) => s.l2.code === this.l2.code
        );
      return savedPhrasesSorted;
    },
  },
  watch: {
    savedWords() {
      this.emitHasDashboard();
    },
    showExportButtons() {
      if (this.showExportButtons) {
        this.genCSV();
      }
    },
  },
  methods: {
    countryCode(l2) {
      return this.$languages.countryCode(l2);
    },
    deleteAllSavedWordsAndPhrases() {
      if (
        this.savedWordsSorted &&
        this.savedWordsSorted.length > 0 &&
        confirm(
          `Are you sure you want to delete all saved WORDS for all ${this.savedWordsSorted.length} languages?`
        )
      ) {
        this.$store.dispatch("savedWords/removeAll");
      }
      if (
        this.savedPhrasesSorted &&
        this.savedPhrasesSorted.length > 0 &&
        confirm(
          `Are you sure you want to delete all saved PHRASES for all ${this.savedPhrasesSorted.length} languages?`
        )
      ) {
        this.$store.dispatch("savedPhrases/removeAll");
      }
    },
    importButtonClick() {
      this.$refs["upload"].click();
    },
    importCSV(event) {
      let files = event.target.files;
      for (let file of files) {
        let reader = new FileReader();
        reader.readAsText(file);
        reader.onload = (event) => {
          let csv = event.target.result;
          let parsed = Papa.parse(csv, { header: true });
          let rows = parsed.data;
          if (rows && rows[0] && rows[0].id) {
            this.importSavedWords(csv);
          } else if (rows && rows[0] && rows[0].phrase) {
            this.importSavedPhrases(rows);
          }
        };
      }
    },
    importSavedWords(csv) {
      this.$store.dispatch("savedWords/importWords", csv);
    },
    importSavedPhrases(rows) {
      this.$store.dispatch("savedPhrases/importPhrases", rows);
    },
    genCSV() {
      let words = [];
      if (this.savedWordsSorted) {
        for (let savedWordsLang of this.savedWordsSorted) {
          let wordsInLang = savedWordsLang.words.map((w) => {
            let word = Object.assign({}, w);
            if (!this.l2) word.l2 = savedWordsLang.l2.code;
            else word.l2 = this.l2.code;
            return word;
          });
          words = words.concat(wordsInLang);
        }
      }
      let wordsCSV = Papa.unparse(words);
      this.wordsCSVHref = Helper.makeTextFile(wordsCSV);
      let phrases = [];
      if (this.savedPhrasesSorted) {
        for (let savedPhrasesLang of this.savedPhrasesSorted) {
          let phrasesInLang = savedPhrasesLang.phrases.map((w) => {
            let phrase = Object.assign({}, w);
            if (!this.l2) phrase.l2 = savedPhrasesLang.l2.code;
            else phrase.l2 = this.l2.code;
            return phrase;
          });
          phrases = phrases.concat(phrasesInLang);
        }
      }
      let phrasesCSV = Papa.unparse(phrases);
      this.phrasesCSVHref = Helper.makeTextFile(phrasesCSV);
    },
    emitHasDashboard() {
      let dashboardItems = [];
      if (this.savedWordsSorted && this.savedWordsSorted.length > 0)
        dashboardItems.push("words");
      if (this.savedPhrasesSorted && this.savedPhrasesSorted.length > 0)
        dashboardItems.push("phrases");
      this.$emit(
        "hasDashboard",
        dashboardItems.length === 0 ? false : dashboardItems
      );
    },
    languageL1(language) {
      let l1 = "en";
      let special = this.specials[language.code];
      if (special) l1 = special.l1;
      return l1;
    },
    languageName(language) {
      let name = language.name.replace(/ \(.*\)/gi, "");
      let special = this.specials[language.code];
      if (special) name = special.name;
      return name;
    },
  },
};
</script>

<style lang="scss" scoped>
.language-overview-item {
  display: flex;
  padding: 1rem;
  .language-flag-wrapper {
    margin-right: 1rem;
    position: relative;
    padding-top: 1.3rem;
  }
  .language-progress {
    flex: 1;
  }
  ::v-deep .hours-display {
    font-size: 1rem;
  }
  ::v-deep .bottom-labels {
    font-size: 0.8rem;
    .bottom-label-right {
      display: none;
    }
  }
}

@media (min-width: 768px) {
  .dashboard-saved-words-list {
    column-count: 2;
  }
}

@media (min-width: 992px) {
  .dashboard-saved-words-list {
    column-count: 3;
  }
}

.dashboard-saved-words + .history-items {
  margin-top: 2rem;
}

.history-item-column:hover {
  transform: scale(1.1) rotate(2deg);
  transition: 200ms all ease-in-out;
}

.dashboard-saved-words-list-item {
  padding: 0.125rem 0;
}
</style>