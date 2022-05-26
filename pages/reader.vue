<router>
  {
    path: '/:l1/:l2/reader/:method?/:arg?',
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
          <FeedbackPrompt class="mb-5" :skin="$route.meta ? $route.meta.skin : 'light'"/>
          <h3 class="text-center mb-3">{{ $l2.name }} Reader (Annotator)</h3>
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
          <ReaderComp ref="reader" @readerTextChanged="readerTextChanged" @readerTranslationChanged="readerTranslationChanged" />
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
    <!-- .container -->
    <!-- ANCHOR img/anchors/learn-this.png -->
    <div class="container-fluid learn-this-bar">
      <div class="container">
        <div class="row">
          <div class="col-sm-12 text-center"></div>
        </div>
      </div>
    </div>
    <!-- .container-fluid -->
  </div>
</template>

<script>
import ReaderComp from "@/components/ReaderComp";
import Helper from "@/lib/helper";

export default {
  template: "#reader-template",
  components: {
    ReaderComp,
  },
  data() {
    return {
      text: "",
      translation: "",
      dictionaryCredit: undefined,
    };
  },
  watch: {
    $route() {
      if (this.$route.name === "reader") {
        this.route();
      }
    },
    text() {
      this.$refs.reader.text = this.text;
    },
    translation() {
      this.$refs.reader.translation = this.translation;
    },
  },
  async mounted() {
    if (this.$route.name === "reader") {
      this.route();
    }
    let dictionary = await this.$getDictionary();
    if (dictionary) {
      this.dictionaryCredit = await dictionary.credit();
    }
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
    readerTextChanged(text) {
      this.save(text);
    },
    readerTranslationChanged(text) {
      this.saveTranslation(text);
    },
    getSaved() {
      let json = localStorage.getItem("zthReaderText");
      try {
        if (json) {
          let saved = JSON.parse(json);
          return saved;
        }
      } catch (e) {}
    },
    get() {
      let saved = this.getSaved();
      if (saved) {
        return saved[this.$l2.code];
      }
    },
    save(text) {
      let saved = this.getSaved() || {};
      saved[this.$l2.code] = text;
      localStorage.setItem("zthReaderText", JSON.stringify(saved));
    },
    getSavedTranslation() {
      let json = localStorage.getItem("zthReaderTranslation");
      try {
        if (json) {
          let saved = JSON.parse(json);
          return saved;
        }
      } catch (e) {}
    },
    getTranslation() {
      let saved = this.getSavedTranslation();
      if (saved) {
        return saved[this.$l2.code];
      }
    },
    saveTranslation(text) {
      let saved = this.getSavedTranslation() || {};
      saved[this.$l2.code] = text;
      localStorage.setItem("zthReaderTranslation", JSON.stringify(saved));
    },
    async route() {
      let method = this.$route.params.method;
      let arg = this.$route.params.arg;
      if (method) {
        if (method === "md-url" || method === "html-url") {
          Helper.proxy(arg).then((response) => {
            this.text = response || "";
          });
        }
        if (method === "md") {
          this.text = arg;
        }
        if (method === "html") {
          this.text = arg;
        }
        if (method === "txt") {
          this.text = arg.replace(/\n/g, "<br>");
        }
      } else {
        if (!this.text) {
          const text = this.get();
          const translation = this.getTranslation();
          if (text) {
            this.text = text;
            // this.show()
          } else {
            if (Helper.sampleText[this.$l2.code]) {
              this.text = Helper.sampleText[this.$l2.code]
            }
          }
          if (translation) {
            this.translation = translation;
          }
        }
      }
    },
  },
};
</script>

<style lang="scss">
</style>