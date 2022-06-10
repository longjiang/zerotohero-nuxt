<router>
  {
    path: '/:l1/:l2/reader/:method?/:arg?',
    props: true,
    meta: {
      title: 'Reader | Zero to Hero',
      metaTags: [
        {
          name: 'description',
          content:
            'Read text with annotation and save new words for review.'
        }
      ]
    }
  }
</router>
<template>
  <div class="main pt-3 pb-5">
    <SocialHead
      :title="`${$l2.name} Text Reader (Annotator) | ${$l2.name} Zero to Hero`"
      :description="`Read ${$l2.name} text with phonetic annotation dictionary lookup. Save new words for review.`"
    />
    <div class="container">
      <div class="row">
        <div class="col-sm-12">
          <div class="reader-header-message" v-if="!$auth.loggedIn">
            <h3 class="text-center mt-3 mb-3">
              {{ $l2.name }} Reader (Annotator)
            </h3>
            <p class="text-center mb-4">
              I can
              <b class="text-success">convert any {{ $l2.name }} text</b>
              into a learner-friendly format, with
              <span v-if="$hasFeature('transliteration')">
                {{
                  {
                    zh: "pinyin annotation",
                    ja: "furigana (Japanese alphabet) annotation",
                    ko: "Hanja byeonggi (Chinese character annotation)",
                    vi: "Hán tự (Chinese character) annotation",
                  }[$l2.code] || "phonetic transcription"
                }}
                and
              </span>
              a popup dictionary!
            </p>
          </div>
          <div class="text-center mb-4" v-if="!shared && text">
            <b-button @click="upload" variant="success" size="sm">
              <i class="fas fa-paper-plane"></i>
              Share Annotated Text
            </b-button>
          </div>
          <client-only>
            <div v-if="shared || sharing" class="alert alert-success mt-2">
              <div v-if="shared">
                <div class="strong mb-2">
                  <i class="fas fa-paper-plane"></i>
                  Shareable via link:
                </div>
                <div class="border-gray rounded p-2 bg-white">
                  {{ shareURL }}
                </div>
                <b-button
                  variant="unstyled"
                  @click="copyClick"
                  class="copy-btn"
                >
                  <i class="fas fa-copy"></i>
                </b-button>
              </div>
              <div v-if="sharing" class="strong">
                Creating a shareable URL...
              </div>
            </div>
          </client-only>
          <div v-if="loading" class="text-center pt-5 pb-5">
            <Loader :sticky="true" message="Loading your text..." />
          </div>
          <ReaderComp
            v-if="!loading"
            :initialText="text"
            :initialTranslation="translation"
            ref="reader"
            :page="page"
            @readerTextChanged="readerTextChanged"
            @readerTranslationChanged="readerTranslationChanged"
            @previousPage="onPreviousPage"
            @nextPage="onNextPage"
          />
        </div>
      </div>
      <h5 class="mt-5">More about this {{ $l2.name }} Reader</h5>
      <ul>
        <li>
          This is a {{ $l2.name }} text reading tool (a.k.a annotator,
          tokenizer, lemmatizer)
        </li>
        <li>Tap on any word below for a popup dictionary.</li>
        <li>Tap on the three dots "..." next to each line for translation.</li>
        <li>
          You can customize the output in
          <router-link to="settings">Settings</router-link>
          .
        </li>
        <li>
          <code>Markdown</code>
          and
          <code>HTML</code>
          are also supported.
        </li>
        <li v-if="dictionaryCredit" v-html="dictionaryCredit"></li>
      </ul>
      <div class="row mt-3">
        <div class="col-sm-12">
          <h5 class="mb-3">{{ $t("Not sure what to read?") }}</h5>
          <ul>
            <li>
              {{ $t(`Look for ${$l2.name} music lyrics on Google.`) }}
            </li>
            <li v-html="$t('libraryIntro', { l2: $l2.name })" />
          </ul>
        </div>
      </div>
      <h5 class="mt-2">Keywords for search engines</h5>
      <ul>
        <li>Online {{ $l2.name }} lemmatizer</li>
        <li>Online {{ $l2.name }} annotator</li>
        <li>Online {{ $l2.name }} reader</li>
        <li>Online {{ $l2.name }} tokenizer</li>
        <li>Online {{ $l2.name }} NLP tool</li>
      </ul>
    </div>
    <div class="container">
      <div class="row">
        <div class="col-sm-12 text-center">
          <FeedbackPrompt
            class="mt-3"
            :skin="$route.meta ? $route.meta.skin : 'light'"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ReaderComp from "@/components/ReaderComp";
import Helper from "@/lib/helper";
import Config from "@/lib/config";
import SAMPLE_TEXT from "@/lib/utils/sample-text";
import {markdownToTxt} from 'markdown-to-txt'

export default {
  template: "#reader-template",
  components: {
    ReaderComp,
  },
  props: {
    method: {
      type: String,
    },
    arg: {
      type: [String, Number],
    },
  },
  data() {
    return {
      text: "",
      loading: true,
      translation: "",
      dictionaryCredit: undefined,
      page: 1,
      shared: undefined, // The object corresponding to the text object shared (uploaded) to the server: {id: 1, text: '...', translation: '...'}
      sharing: false,
    };
  },
  watch: {
    $route() {
      if (this.$route.query && this.$route.query.p) {
        this.page = Number(this.$route.query.p);
      }
    },
    text() {
      if (this.$refs?.reader) this.$refs.reader.text = this.text;
    },
    translation() {
      if (this.$refs?.reader) this.$refs.reader.translation = this.translation;
    },
  },
  async mounted() {
    let dictionary = await this.$getDictionary();
    if (dictionary) {
      this.dictionaryCredit = await dictionary.credit();
    }
    let method = this.method;
    let arg = this.arg;
    let text;
    let translation;
    if (this.$route.query && this.$route.query.p) {
      this.page = Number(this.$route.query.p);
    }
    if (method === "shared") {
      try {
        let id = arg;
        let res = await this.$authios.get(`${Config.wiki}items/text/${id}`);
        if (res && res.data && res.data.data) {
          text = res.data.data.text;
          translation = res.data.data.translation;
          this.shared = res.data.data;
        }
      } catch (err) {
        Helper.logError(err);
      }
    } else if (method === "md-url" || method === "html-url") {
      try {
        let t = await Helper.proxy(arg);
        text = t || "";
      } catch (err) {
        Helper.logError(err);
      }
    } else if (["md", "html", "txt"].includes(method)) {
      text = arg.replace(/\n/g, "<br>");
    } else {
      let r = this.get(); // from localStorage
      text = r.text;
      translation = r.translation;
      if (!text || text.length === "") {
        if (SAMPLE_TEXT[this.$l2.code]) {
          this.text = SAMPLE_TEXT[this.$l2.code];
          this.$refs.reader.text = SAMPLE_TEXT[this.$l2.code];
        }
      }
    }
    this.text = text;
    this.translation = translation;
    this.loading = false;
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
    shareURL() {
      if (this.shared)
        return `${window.location.protocol}//${window.location.hostname}/${this.$l1.code}/${this.$l2.code}/reader/shared/${this.shared.id}`;
    },
    title() {
      let lines = this.text.trim().split(/\n+/) || ['']
      return markdownToTxt(lines[0]);
    },
  },
  methods: {
    copyClick() {
      let text = this.shareURL;
      var tempInput = document.createElement("input");
      tempInput.style = "position: absolute; left: -1000px; top: -1000px";
      tempInput.value = text;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      document.body.removeChild(tempInput);
      this.$toast.info("Copied!", { duration: 3000 });
    },
    async upload() {
      this.sharing = true;
      try {
        let res = await this.$authios.post(`${Config.wiki}items/text`, {
          title: this.title,
          text: this.text,
          translation: this.translation,
          l2: this.$l2.id,
        });
        if (res && res.data && res.data.data.id) {
          this.shared = res.data.data;
        }
        this.sharing = false;
      } catch (err) {
        Helper.logError(err);
        this.sharing = false;
      }
    },
    onPreviousPage() {
      let to = {
        name: "reader",
        params: {
          method: this.method,
          arg: this.arg,
        },
        query: {
          p: this.page ? this.page - 1 : undefined,
        },
      };
      this.$router.push(to);
    },
    onNextPage() {
      let to = {
        name: "reader",
        params: {
          method: this.method,
          arg: this.arg,
        },
        query: {
          p: this.page ? this.page + 1 : undefined,
        },
      };
      this.$router.push(to);
    },
    readerTextChanged(text) {
      this.text = text;
      if (text === "") this.page = 1;
      this.save();
    },
    readerTranslationChanged(text) {
      this.translation = text;
      this.save();
    },
    get() {
      let { savedTextByL2, savedTranslationByL2 } = this.getSaved();
      return {
        text: savedTextByL2[this.$l2.code] || "",
        translation: savedTranslationByL2[this.$l2.code] || "",
      };
    },
    save() {
      let { savedTextByL2, savedTranslationByL2 } = this.getSaved();
      savedTextByL2[this.$l2.code] = this.text;
      savedTranslationByL2[this.$l2.code] = this.translation;
      localStorage.setItem("zthReaderText", JSON.stringify(savedTextByL2));
      localStorage.setItem(
        "zthReaderTranslation",
        JSON.stringify(savedTranslationByL2)
      );
      if (
        this.shared &&
        (this.translation !== this.shared.translation ||
          this.text !== this.shared.text)
      ) {
        if (
          this.$auth.loggedIn &&
          this.shared.owner === Number(this.$auth.user.id)
        ) {
          this.$store.dispatch("savedText/update", {
            l2: this.$l2,
            item: {
              id: this.shared.id,
              title: this.title,
              text: this.text,
              translation: this.translation,
            },
          });
        } else {
          this.$router.push({ name: "reader" });
        }
      }
    },
    getSaved() {
      let tejson = localStorage.getItem("zthReaderText");
      let trjson = localStorage.getItem("zthReaderTranslation");
      let savedTextByL2 = {};
      let savedTranslationByL2 = {};
      try {
        if (tejson) {
          savedTextByL2 = JSON.parse(tejson);
        }
        if (trjson) {
          savedTranslationByL2 = JSON.parse(trjson);
        }
      } catch (e) {}
      return { savedTextByL2, savedTranslationByL2 };
    },
  },
};
</script>

<style lang="scss">
.copy-btn {
  position: absolute;
  bottom: 0.75rem;
  right: 1.1rem;
  color: #888;
  font-size: 1.2rem;
  &:hover {
    color: #444;
  }
}
</style>