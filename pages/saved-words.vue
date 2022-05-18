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
  <div class="main pb-4" v-cloak>
    <div class="container">
      <div class="row">
        <div class="col-sm-12">
          <p
            v-if="dictionaryLoaded && sWLoaded && sW.length <= 0"
            class="alert alert-warning no-saved-words text-center mt-5 p-5"
          >
            You don't have any words saved yet. Save words by tapping on the
            <i class="far fa-star"></i>
            icon next to it.
          </p>
          <div v-if="dictionaryLoaded" class="text-center alert-success p-3 pb-4 rounded mt-4">
            <p>To sync words across devices, please login.</p>
            <router-link :to="{name: 'login'}" class="btn btn-success">Login <i class="fas fa-chevron-right"></i></router-link>
          </div>
          <div v-if="dictionaryLoaded && !sWLoaded" class="text-center">
            <Loader
              :sticky="true"
              message="Loading words saved in your browser..."
            />
          </div>
          <div
            class="pb-3 pt-3 bg-white text-center"
            style="position: sticky; top: 2.9rem; z-index: 2"
            v-if="sWLoaded && sW.length > 0"
          >
            <LazyHideDefs
              @hideWord="hideWord = arguments[0]"
              @hideDefinitions="hideDefinitions = arguments[0]"
              @hidePhonetics="hidePhonetics = arguments[0]"
            />
          </div>
          <div
            v-for="(group, index) in groups"
            :key="`group-${index}`"
            class="small mb-3"
            style="color: #ccc"
          >
            <div v-if="group.date === '0'">Earlier</div>
            <div v-else>
              {{
                new Date(group.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              }}
            </div>
            <hr class="mt-1" />
            <WordList
              :words="group.sW.map((s) => s.word)"
              :hideDefinitions="hideDefinitions"
              :hidePhonetics="hidePhonetics"
              :hideWord="hideWord"
              skin="light"
              class="mt-3"
            ></WordList>
          </div>
          <div class="text-center mt-5" v-if="$dictionaryName && sW && sW[0]">
            <router-link
              :to="{
                name: 'dictionary',
                params: { method: $dictionaryName, args: sW[0].id },
              }"
              class="btn btn-success"
            >
              Review All {{ sWLoaded ? sW.length : "" }} Words
              <i class="fas fa-chevron-right ml-1"></i>
            </router-link>
          </div>
        </div>
      </div>
      <div class="row mt-4 text-center">
        <div class="col-sm-12">
          <div class="text-center">
            <Loader class="mt-4" @loaded="updateLoaded" />
          </div>

          <div>
            <a
              class="download-csv btn btn-success btn-small"
              :href="csvHref"
              :download="`${$l2.name
                .toLowerCase()
                .replace(/ /g, '-')}-saved-words.csv`"
              variant="primary"
              size="sm"
              v-if="sW.length > 0"
            >
              <i class="fa fa-download mr-1"></i>
              {{ $t("Export CSV") }}
            </a>
            <b-button
              class="remove-all btn-small"
              variant="danger"
              size="sm"
              v-on:click="removeAllClick"
              v-if="this.sW.length > 0"
            >
              <i class="fas fa-times mr-1"></i>
              {{ $t("Remove All") }}
            </b-button>
            <router-link
              v-if="sW.length > 0"
              class="btn btn-small"
              :to="`/${$l1.code}/${$l2.code}/learn-interactive/saved`"
            >
              <i class="fa fa-chalkboard"></i>
              Learn (Legacy)
            </router-link>
          </div>
          <p class="mt-3 mb-3 text-left">
            <b>How are my words saved?</b>
            Your words are stored in your browser's "local storage", so even if
            you refresh your browser, the words are still there.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Helper from "@/lib/helper";
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
      sW: [],
    };
  },
  computed: {
    groups() {
      let savedWords = this.sW.map((savedWord) => {
        let r = Object.assign({}, savedWord);
        r.date = savedWord.date
          ? new Date(Number(savedWord.date)).toISOString().replace(/T.*/, "")
          : 0;
        return r;
      });
      let groups = Helper.groupArrayBy(savedWords, "date");
      groups = Object.keys(groups).map((date) => {
        return {
          date,
          sW: groups[date],
        };
      });
      if (this.sWLoaded)
        return groups.sort((a, b) => b.date.localeCompare(a.date));
    },
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
      let csvWords = this.sW.map((savedWord) => {
        let word = savedWord.word;
        let mapped = { id: word.id, head: word.head };
        mapped = Object.assign(mapped, word);
        mapped.definitions = word.definitions.join("; ");
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
            let r = Object.assign({}, savedWord);
            r.word = word;
            sW.push(r);
          }
        }
      }
      this.sW = sW;
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
