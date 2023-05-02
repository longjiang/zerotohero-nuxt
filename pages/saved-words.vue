<router>
  {
    path: '/:l1/:l2/saved-words',
    meta: {
      title: 'Saved Words | Language Player',
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
  <div class="main pb-4" v-cloak>
    <div class="container">
      <div class="row text-center" v-if="sW.length > 0">
        <div class="col-sm-12">
          <div>
            <input
              id="fileUpload"
              ref="upload"
              type="file"
              hidden
              @change="importCSV"
            />
            <button
              class="btn btn-sm text-secondary"
              @click="importButtonClick()"
            >
              <i class="fa fa-upload mr-1"></i>
              {{ $t("Import") }} (CSV)
            </button>
            <button
              class="btn btn-sm text-secondary"
              @click="exportButtonClick()"
            >
              <i class="fa fa-download mr-1"></i>
              {{ $t("Export") }}
            </button>
            <button
              class="remove-all text-danger btn btn-sm"
              v-on:click="removeAllClick"
              v-if="this.sW.length > 0"
            >
              <i class="fas fa-times mr-1"></i>
              {{ $t("Remove All") }}
            </button>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-12">
          <div
            v-if="dictionaryLoaded && !$auth.loggedIn"
            class="text-center alert-success p-3 pb-4 rounded mb-4"
          >
            <p>{{ $t("To sync words across devices, please login.") }}</p>
            <router-link :to="{ name: 'login' }" class="btn btn-success">
              {{ $t("Login") }}
              <i class="fas fa-chevron-right"></i>
            </router-link>
          </div>
          <p
            v-if="dictionaryLoaded && sWLoaded && sW.length <= 0"
            class="no-saved-words text-center p-5"
          >
            {{
              $t(
                'You don’t have any words saved yet. Save words by tapping on the "⭐️ SAVE" button next to it.'
              )
            }}
          </p>
          <div class="text-center">
            <Loader class="mt-4" @loaded="updateLoaded" />
          </div>
          <div v-if="dictionaryLoaded && !sWLoaded" class="text-center mt-4">
            <Loader :sticky="true" :message="$t('Loading saved words...')" />
          </div>
          <div
            class="hide-defs pb-3 pt-3 text-center"
            v-if="sWLoaded && sW.length > 0"
          >
            <LazyHideDefs
              @hideWord="hideWord = arguments[0]"
              @hideDefinitions="hideDefinitions = arguments[0]"
              @hidePhonetics="hidePhonetics = arguments[0]"
            />
          </div>
          <div class="text-center" v-if="sWLoaded && sW.length > 0">
            <MakeAStory :words="sW.map((s) => s.word).slice(0, 6)" />
          </div>
          <div
            v-for="(group, index) in groups"
            :key="`group-${index}`"
            style="color: #ccc"
          >
            <div v-if="group.date === '0'" class="small mb-3 mt-3">
              {{ $t("Earlier") }}
            </div>
            <div v-else class="small mt-3 mb-3">
              {{ $d(new Date(group.date), "short", $l1.code) }}
            </div>
            <hr class="mt-1" />
            <WordList
              :words="group.sW.map((s) => s.word)"
              :hideDefinitions="hideDefinitions"
              :hidePhonetics="hidePhonetics"
              :hideWord="hideWord"
              class="mt-3"
            ></WordList>
          </div>
        </div>
      </div>
    </div>
    <b-modal
      ref="export-modal"
      centered
      hide-footer
      :title="$t('Export')"
      body-class="export-modal-modal"
      modal-class="safe-padding-top mt-4"
    >
      <a
        class="download-csv btn btn-sm text-secondary"
        :href="csvHref"
        :download="`${$l2.name
          .toLowerCase()
          .replace(/ /g, '-')}-saved-words.csv`"
        variant="primary"
        size="sm"
        v-if="sW.length > 0"
      >
        <i class="fa fa-file mr-1"></i>
        {{ $t("Export to CSV") }}
      </a>
    </b-modal>
  </div>
</template>

<script>
import { groupArrayBy, makeTextFile } from "@/lib/utils";
import Papa from "papaparse";

export default {
  data() {
    return {
      hideWord: false,
      hideDefinitions: false,
      hidePhonetics: false,
      dictionaryLoaded: false,
      sWLoaded: false,
      showExport: false,
      showLegacy: false,
      sW: [],
    };
  },
  computed: {
    savedWords() {
      if (
        this.$store.state.savedWords.savedWords &&
        this.$store.state.savedWords.savedWords[this.$l2.code]
      ) {
        return this.$store.state.savedWords.savedWords;
      } else {
        return [];
      }
    },
    groups() {
      let savedWords = this.sW.map((savedWord) => {
        let r = Object.assign({}, savedWord);
        r.date = savedWord.date
          ? new Date(Number(savedWord.date)).toISOString().replace(/T.*/, "")
          : 0;
        return r;
      });
      let groups = groupArrayBy(savedWords, "date");
      groups = Object.keys(groups).map((date) => {
        return {
          date,
          sW: groups[date],
        };
      });
      if (this.sWLoaded)
        return groups.sort((a, b) => b.date.localeCompare(a.date));
    },
    csvHref() {
      return makeTextFile(this.csv);
    },
    $dictionaryName() {
      return this.$store.state.settings.dictionaryName;
    },
    csv() {
      let csvWords = this.sW.map((savedWord) => {
        let word = savedWord.word;
        let mapped = { id: word.id, head: word.head };
        mapped = Object.assign(mapped, word);
        mapped.l2 = this.$l2.code;
        mapped.definitions = word.definitions.join("; ");
        mapped.date = savedWord.date;
        if (word.simplified || word.kana || word.hangul) delete mapped.head;
        delete mapped.cjk;
        delete mapped.search;
        delete mapped.newHSKMatches;
        delete mapped.saved;
        delete mapped.phrase;
        delete mapped.username;
        delete mapped.created;
        delete mapped.audio;
        delete mapped.c;
        delete mapped.e;
        delete mapped.f;
        delete mapped.i;
        delete mapped.k;
        delete mapped.l;
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
    exportButtonClick() {
      this.$refs["export-modal"].show();
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
          }
        };
      }
    },
    importSavedWords(csv) {
      this.$store.dispatch("savedWords/importWords", csv);
    },
    updateLoaded(loaded) {
      this.dictionaryLoaded = loaded;
    },
    async updateWords() {
      let sW = [];
      const dictionary = await this.$getDictionary();
      if (this.savedWords) {
        let savedWords = this.$store.state.savedWords.savedWords[this.$l2.code];
        if (savedWords && savedWords.length > 0) {
          for (let savedWord of savedWords) {
            let word = await dictionary.get(savedWord.id, savedWord.forms[0]);
            if (word) {
              let r = Object.assign({}, savedWord);
              r.word = word;
              sW.push(r);
            }
          }
        }
      }
      this.sW = sW.sort((a, b) => b.date - a.date);
      this.sWLoaded = true;
    },
    removeAllClick() {
      const confirmed = confirm(
        "Are you sure you want to remove all your saved words?"
      );
      if (confirmed) {
        this.$store.dispatch("savedWords/removeAll", {
          l2: this.$l2.code,
        });
      }
    },
  },
};
</script>
<style lang="scss" scoped>
@import "@/assets/scss/variables.scss";

.zerotohero-dark {
  .hide-defs {
    background: $bg-color-dark-1;
  }
}
.zerotohero-light {
  .hide-defs {
    background: #fff;
  }
}
.hide-defs {
  position: sticky;
  z-index: 2;
  top: calc(env(safe-area-inset-top) + 5rem);
}
</style>
