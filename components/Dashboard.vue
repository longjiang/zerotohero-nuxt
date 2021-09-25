<template>
  <container-query :query="query" v-model="params">
    <div class="container">
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
              :to="`/${savedWordsLang.l2.code === 'lzh' ? 'zh' : 'en'}/${
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
              saved word{{ savedWordsLang.words.length > 1 ? "s" : "" }}

              in
              <strong>{{ savedWordsLang.l2.name }}</strong>
            </router-link>
            <router-link
              v-for="(savedPhrasesLang, index) in savedPhrasesSorted"
              :to="`/${savedPhrasesLang.l2.code === 'lzh' ? 'zh' : 'en'}/${
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
              saved phrase{{ savedPhrasesLang.phrases.length > 1 ? "s" : "" }}

              in
              <strong>{{ savedPhrasesLang.l2.name }}</strong>
            </router-link>
          </div>
        </div>
        <div class="col-12 text-center mt-4">
          <button
            :class="`btn btn-ghost-dark btn-sm ml-1 ${
              skin === 'light' ? 'text-secondary' : ''
            }`"
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
            :class="`btn btn-ghost-dark btn-sm ml-1 ${
              skin === 'light' ? 'text-secondary' : ''
            }`"
            @click="importButtonClick()"
          >
            <i class="fa fa-upload mr-1"></i>
            Import
          </button>
          <div v-if="showExportButtons" class="mt-2">
            <a
              :href="wordsCSVHref"
              :download="`saved-words${
                l2 ? '-' + l2.code : ''
              }-${hostname}.csv`"
              v-if="
                savedWordsSorted && savedWordsSorted.length > 0 && wordsCSVHref
              "
              class="mr-2"
            >
              <i class="fa fa-file mr-1"></i>
              Saved Words
            </a>
            <a
              :href="
                savedPhrasesSorted &&
                savedPhrasesSorted.length > 0 &&
                phrasesCSVHref
              "
              :download="`saved-phrases${
                l2 ? '-' + l2.code : ''
              }-${hostname}.csv`"
              v-if="phrasesCSVHref"
            >
              <i class="fa fa-file mr-1"></i>
              Saved Phrases
            </a>
          </div>
        </div>
      </div>
      <div class="history-items row" v-if="itemsFiltered.length > 0">
        <div
          v-for="(item, itemIndex) of itemsFiltered.slice(0, 12)"
          :key="`history-item-${itemIndex}`"
          :class="{
            'pb-4 history-item-column': true,
            'col-12': params.xs,
            'col-6': params.sm,
            'col-4': params.md,
            'col-3': params.lg,
          }"
          :set="(itemL1 = $languages.getSmart(item.l1))"
          :set2="(itemL2 = $languages.getSmart(item.l2))"
        >
          <div class="history-item-language-badge" v-if="itemL1 && itemL2">
            {{ itemL2.name }}
          </div>
          <YouTubeVideoCard
            v-if="itemL1 && itemL2 && item.type === 'video'"
            skin="card"
            :video="Object.assign({}, item.video)"
            :l1="itemL1"
            :l2="itemL2"
            :showProgress="true"
            :showPlayButton="true"
            :showAdmin="false"
          />
          <PhrasebookCard
            v-if="itemL1 && itemL2 && item.type === 'phrasebook'"
            skin="light"
            size="lg"
            :l1="itemL1"
            :l2="itemL2"
            :phrasebook="Object.assign({}, item.phrasebook)"
            :showAdmin="false"
          />
          <button
            class="
              btn btn-small
              bg-white
              text-secondary
              ml-0
              history-item-remove-btn
            "
            @click.stop.prevent="$store.dispatch('history/remove', item)"
          >
            <i class="fa fa-times"></i>
          </button>
        </div>
      </div>
      <div class="row">
        <div
          class="col-12 text-center mb-2"
          v-if="videosFiltered && videosFiltered.length > 0"
        >
          <button
            :class="`btn btn-ghost-dark btn-sm ml-0 ${
              skin === 'light' ? 'text-secondary' : ''
            }`"
            @click.stop.prevent="$store.dispatch('history/removeAll')"
          >
            Clear History
          </button>
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
  data() {
    return {
      params: {},
      showExportButtons: false,
      phrasesCSVHref: undefined,
      wordsCSVHref: undefined,
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
  props: {
    l2: undefined,
    skin: {
      default: "light",
    },
  },
  mounted() {
    this.emitHasDashboard();
    if (!this.$store.state.history.historyLoaded) {
      this.$store.commit("history/LOAD_HISTORY");
    }
  },
  computed: {
    ...mapState("history", ["history"]),
    ...mapState("savedWords", ["savedWords"]),
    ...mapState("savedPhrases", ["savedPhrases"]),
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
    itemsFiltered() {
      if (typeof this.history !== "undefined") {
        return this.history.filter((i) => {
          if (this.l2 && i.l2 !== this.l2.code) return false;
          if (i.type === "video") return typeof i.video !== "undefined";
          if (i.type === "phrasebook")
            return (
              typeof i.phrasebook !== "undefined" && i.phrasebook.id !== "saved"
            );
        });
      }
    },
    videosFiltered() {
      if (typeof this.history !== "undefined") {
        return this.history.filter((i) => {
          if (this.l2 && i.l2 !== this.l2.code) return false;
          return i.type === "video" && i.video;
        });
      }
    },
    phrasebooksFiltered() {
      if (typeof this.history !== "undefined") {
        return this.history.filter((i) => {
          if (this.l2 && i.l2 !== this.l2.code) return false;
          return i.type === "phrasebook" && i.phrasebook;
        });
      }
    },
  },
  watch: {
    history() {
      this.emitHasDashboard();
    },
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
    importButtonClick() {
      this.$refs["upload"].click();
    },
    importCSV(event) {
      let files = event.target.files;
      for (let file of files) {
        let reader = new FileReader();
        reader.readAsText(file);
        reader.onload = (event) => {
          let text = event.target.result;
          let parsed = Papa.parse(text, { header: true });
          let rows = parsed.data;
          if (rows && rows[0] && rows[0].id) {
            this.importSavedWords(rows);
          } else if (rows && rows[0] && rows[0].phrase) {
            this.importSavedPhrases(rows);
          }
        };
      }
    },
    importSavedWords(rows) {
      this.$store.dispatch("savedWords/importWords", rows);
    },
    importSavedPhrases(rows) {
      this.$store.dispatch("savedPhrases/importPhrases", rows);
    },
    genCSV() {
      let words = [];
      if (this.savedWordsSorted) {
        for (let savedWordsLang of this.savedWordsSorted) {
          let ws = savedWordsLang.words.map((w) => {
            let op = Object.assign({}, w);
            if (!this.l2) op.l2 = savedWordsLang.l2.code;
            return op;
          });
          words = words.concat(ws);
        }
      }
      let wordsCSV = Papa.unparse(words);
      this.wordsCSVHref = Helper.makeTextFile(wordsCSV);
      let phrases = [];
      if (this.savedPhrasesSorted) {
        for (let savedPhrasesLang of this.savedPhrasesSorted) {
          let ps = savedPhrasesLang.phrases.map((w) => {
            let op = Object.assign({}, w);
            if (!this.l2) op.l2 = savedPhrasesLang.l2.code;
            return op;
          });
          phrases = phrases.concat(ps);
        }
      }
      let phrasesCSV = Papa.unparse(phrases);
      this.phrasesCSVHref = Helper.makeTextFile(phrasesCSV);
    },
    emitHasDashboard() {
      let hasDashboard = false;
      if (this.savedWordsSorted && this.savedWordsSorted.length > 0)
        hasDashboard = true;
      if (this.savedPhrasesSorted && this.savedPhrasesSorted.length > 0)
        hasDashboard = true;
      if (this.itemsFiltered && this.itemsFiltered.length > 0)
        hasDashboard = true;
      this.$emit("hasDashboard", hasDashboard);
    },
  },
};
</script>

<style lang="scss" scoped>
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

.history-items.row {
  perspective: 800px;
  .history-item-column {
    position: relative;
    .history-item-remove-btn {
      position: absolute;
      top: 0.25rem;
      right: 1.2rem;
      z-index: 9;
      border-radius: 0.2rem;
      background: rgba(0, 0, 0, 0.2) !important;
      color: rgba(255, 255, 255, 0.384) !important;
      backdrop-filter: blur(5px);
      -webkit-backdrop-filter: blur(5px);
      &:hover {
        color: rgba(255, 255, 255, 0.6) !important;
        background: rgba(0, 0, 0, 0.4) !important;
      }
    }
    .history-item-language-badge {
      position: absolute;
      top: 0.25rem;
      left: 1.2rem;
      z-index: 9;
      border-radius: 0.2rem;
      background: rgba(0, 0, 0, 0.2) !important;
      color: rgba(255, 255, 255, 0.5) !important;
      font-size: 0.85em;
      padding: 0.1rem 0.3rem;
      backdrop-filter: blur(5px);
      -webkit-backdrop-filter: blur(5px);
    }
  }
}

::v-deep .youtube-title,
::v-deep .phrasebook-title {
  font-size: 1rem;
  line-height: 1.33rem !important;
}

.history-item-column:hover {
  transform: scale(1.1) rotate(2deg);
  transition: 200ms all ease-in-out;
}

.dashboard-saved-words-list-item {
  padding: 0.125rem 0;
}
</style>