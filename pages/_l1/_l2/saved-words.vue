<template>
  <div class="main pb-4" v-cloak>
    <div class="container">
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
          <!-- <div
            class="hide-defs pb-3 pt-3 text-center"
            v-if="sWLoaded && sW.length > 0"
          >
            <LazyHideDefs
              @hideWord="hideWord = arguments[0]"
              @hideDefinitions="hideDefinitions = arguments[0]"
              @hidePhonetics="hidePhonetics = arguments[0]"
            />
          </div> -->
          <div class="d-flex my-5 justify-content-between align-items-center" v-if="sWLoaded && sW.length > 0">
            <MakeAStory :words="sW.map((s) => s.word).slice(0, 6)" />
            <b-button
              :variant="$skin"
              @click="showActionMenu()"
            >
              {{ $t("Actions") }}<i class="fa fa-chevron-down ml-1"></i>
            </b-button>

          </div>
          <div
            v-for="(group, index) in groups"
            :key="`group-${index}`"
          >
            <div v-if="group.date === '0'" class="small mb-3 mt-3">
              {{ $t("Earlier") }}
            </div>
            <h5 v-else class="mt-5 mb-2">
                {{ $d(new Date(group.date + "T00:00:00"), "short", $l1.code) }} 
                <span class="badge badge-danger" style="position: relative; bottom: 0.1rem">
                {{ group.sW.length }}
                </span>
            </h5>
            <hr class="mt-1" />
            <WordList
              :words="group.sW.map((s) => Object.assign(s.word, {saved: {context: s.context, date: s.date, forms: s.forms, id: s.id}}))"
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
    ref="import-modal"
    centered
    hide-footer
    :title="$t('Import')"
    body-class="import-modal-modal"
    modal-class="safe-padding-top mt-4"
  >
    <b-form-textarea
      id="word-input"
      v-model="inputWords"
      :placeholder="$t('Enter words separated by commas or new lines')"
      rows="3"
      max-rows="6"
    >
    </b-form-textarea>

    <b-button
      variant="primary"
      class="mt-3"
      @click="importWords"
    >
      {{ $t('Import') }}
    </b-button>
  </b-modal>
    <b-modal
      ref="actions-modal"
      centered
      size="sm"
      hide-footer
      :title="$t('Actions')"
      body-class="actions-modal-modal"
      modal-class="safe-padding-top mt-4"
    >
      <b-button @click.stop="importButtonClick()" class="d-block w-100 text-left" variant="light">
        <i class="fa fa-file-import mr-2"></i>
        
        {{ $t("Import") }}
      </b-button>
      <a
        class="d-block w-100 text-left btn btn-light"
        :href="csvHref"
        :download="`${$l2.name
          .toLowerCase()
          .replace(/ /g, '-')}-saved-words.csv`"
        variant="primary"
        size="sm"
        v-if="sW.length > 0"
      >
        <i class="fa fa-file-export mr-2"></i>
        {{ $t("Export to CSV") }}
      </a>
      <b-button
        class="d-block w-100 text-left btn btn-light"
        v-on:click="removeAllClick"
        v-if="this.sW.length > 0"
      >
        <i class="fas fa-times mr-2"></i>
        {{ $t("Remove All") }}
      </b-button>
    </b-modal>
  </div>
</template>

<script>
import { groupArrayBy, makeTextFile, formatPronunciation, l2LevelNameByLevel } from "../../../lib/utils";
import Papa from "papaparse";

// ───────── ヘルパ関数群 ─────────
function buildAnkiBack({ head, chatGPTPrompt, lpURL, pronunciation, definitions, level, l2Code = "en" }) {
  const base = [head, pronunciation, definitions.join("; ")].join(" ");
  let back = "";
  back += `${base}`;
  if (level) {
    back += ` (${level})`;
  }
  back += `<br><br>`;
  back += `<a href="${lpURL}" target="_blank">Language Player</a>・<a href="https://chat.openai.com/?q=${encodeURIComponent(chatGPTPrompt)}" target="_blank">ChatGPT</a>`;
  back += `<br><br>`;
  back += `<image src="https://pythonvps.zerotohero.ca/img/${head}/1/${l2Code}" style="height: 100px"> `;
  back += `<image src="https://pythonvps.zerotohero.ca/img/${head}/2"${l2Code} style="height: 100px"> `;
  back += `<image src="https://pythonvps.zerotohero.ca/img/${head}/3/${l2Code}" style="height: 100px"> `;
  back += `<image src="https://pythonvps.zerotohero.ca/img/${head}/4/${l2Code}" style="height: 100px"> `;
  return back;
}

function buildAnkiFront({
  contextForm,
  contextText,
  head,
  youtubeID,
  startTime,
}) {
  // ① 表示語のハイライト
  let front = contextForm && contextText
    ? contextText.replace(contextForm, `<b>${contextForm}</b>`)
    : head;

  // ② 必要なら YouTube 埋め込みを付与
  if (youtubeID && startTime) {
    const t = Math.floor(startTime) - 1;
    front += `<br><br><iframe width="320" height="180" src="https://www.youtube.com/embed/${youtubeID}?start=${t}" frameborder="0"></iframe>`;
  }
  return front;
}

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
      inputWords: '',
      sW: [],
    };
  },
  computed: {
    savedWords() {
      if (
        this.$store.state.savedWords.savedWords &&
        this.$store.state.savedWords.savedWords[this.$l2.code]
      ) {
        return this.$store.state.savedWords.savedWords[this.$l2.code];
      } else {
        return [];
      }
    },
    groups() {
      let userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      let savedWords = this.sW.map((savedWord) => {
        let r = Object.assign({}, savedWord);
        if (savedWord.date) {
          let date = new Date(Number(savedWord.date));
          // ユーザのタイムゾーンでのローカル時間を取得
          let localDate = new Date(date.toLocaleString("en-US", { timeZone: userTimeZone }));
          
          // 年、月、日を取得し、ISO形式の文字列に整形
          let year = localDate.getFullYear();
          let month = String(localDate.getMonth() + 1).padStart(2, '0');
          let day = String(localDate.getDate()).padStart(2, '0');

          r.date = `${year}-${month}-${day}`;
        } else {
          r.date = 0;
        }
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

    // ───────── Vue メソッド ─────────
    csv() {
      let csvWords = this.sW.map(savedWord => {
        const word = savedWord.word;
        // 基本フィールド
        const mapped = { id: word.id, head: word.head, ...word };

        mapped.l2 = this.$l2.code;
        mapped.definitions = word.definitions;
        mapped.date = savedWord.date;

        mapped.pronunciation = formatPronunciation({
          word,
          langCode: this.$l2.code,
          hasFeature: f => this.$hasFeature(f),
        });

        mapped.contextForm       = savedWord.context?.form;
        mapped.contextStartTime  = savedWord.context?.starttime;
        mapped.contextText       = savedWord.context?.text;
        mapped.contextYouTubeID  = savedWord.context?.youtube_id;

        const level = l2LevelNameByLevel(this.$l2, word.level);

        // ── Anki 用フィールドをヘルパで生成 ──
        mapped.ankiBack = buildAnkiBack({
          head: word.head,
          chatGPTPrompt: `Explain in ${this.$l1.name}, the meaning and pronunciation of the ${this.$l2.name} (${this.$l2.code}) word ‘${mapped.contextForm}’ in ‘${mapped.contextText}’. Rephrase it in various ways with ${this.$l2.name} synonyms (with pronunciations), give additional examples, and provide mnemonic tips.`,
          lpURL: `https://languageplayer.io/${this.$l1.code}/${this.$l2.code}/dictionary/${this.$dictionaryName}/${word.id}`,
          pronunciation: mapped.pronunciation,
          definitions: mapped.definitions,
          level,
          l2Code: this.$l2.code,
        });

        mapped.ankiFront = buildAnkiFront({
          contextForm: mapped.contextForm,
          contextText: mapped.contextText,
          head: word.head,
          youtubeID: mapped.contextYouTubeID,
          startTime: mapped.contextStartTime,
        });

        if (word.simplified || word.kana || word.hangul) delete mapped.head;

        // 不要キーの削除（従前と同じ）
        [
          "cjk","search","newHSKMatches","saved","phrase","username","created",
          "audio","c","e","f","i","k","l","wiktionary"
        ].forEach(k => delete mapped[k]);

        return mapped;
      });

      // 日付を ISO（yyyy-mm-dd）化
      csvWords = csvWords.map(w => {
        w.date = new Date(Number(w.date)).toISOString().split("T")[0];
        return w;
      });

      // 列順指定
      const firstRowKeys = Object.keys(csvWords[0] || {});
      const columns = ["ankiFront", "ankiBack", "date"].concat(
        firstRowKeys.filter(k => !["ankiFront", "ankiBack", "date"].includes(k))
      );

      // CSV 化
      let csv = Papa.unparse(csvWords, { columns });
      csv = csv.replace(/v-lazy-load data-src=/g, "src=");

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
    showActionMenu() {
      this.$refs["actions-modal"].show();
    },
    importButtonClick() {
      this.$refs["import-modal"].show();
    },
    async importWords() {
      // Split words by comma or new line
      const words = this.inputWords.split(/[\n,]+/).map(word => word.trim());

      // Log array of words
      this.$router.push({ name: "l1-l2-learn", params: { method: 'adhoc', argsProp: words.join(',') } });
      this.$refs["import-modal"].hide();
    },
    updateLoaded(loaded) {
      this.dictionaryLoaded = loaded;
    },
    async updateWords() {
      let sW = [];
      const dictionary = await this.$getDictionary();
      if (this.savedWords) {
        let savedWords = this.savedWords;
        if (savedWords && savedWords.length > 0) {
          for (let savedWord of savedWords) {
            let word = await dictionary.get(savedWord.id, savedWord.forms[0]);
            if (!word) {
              word = await dictionary.lookup(savedWord.forms[0]);
            }
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
        this.$t("Are you sure you want to remove all your saved words?")
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
@import "../../../assets/scss/variables.scss";

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
  top: 0;
}
</style>
