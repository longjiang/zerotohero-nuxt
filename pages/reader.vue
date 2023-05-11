<router>
  {
    path: '/:l1/:l2/reader/:method?/:arg?',
    props: true,
    meta: {
      title: 'Reader | Language Player',
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
      :title="`${$l2.name} ${$t('Text Reader (Annotator)')} | Language Player`"
      :description="`${$t(
        'Read {l2} text with phonetic annotation dictionary lookup. Save new words for review.',
        { l2: $l2.name }
      )}`"
    />
    <div class="container">
      <div class="row">
        <div class="col-sm-12">
          <div class="reader-header-message" v-if="!$auth.loggedIn">
            <h3 class="text-center mt-4 mb-3">
              {{ $t("{l2} Text Reader (Annotator)", { l2: $t($l2.name) }) }}
            </h3>
            <i18n
              path="This tool will annotate {l2} text with {transliteration} and a popup dictionary."
              class="text-center mb-4"
            >
              <template #l2>{{ $t($l2.name) }}</template>
              <template #transliteration>
                <span v-if="$hasFeature('transliteration')">
                  {{
                    {
                      zh: $t("pinyin annotation"),
                      ja: $t("furigana (Japanese syllabary) annotation"),
                      ko: $t("Hanja byeonggi (Chinese character annotation)"),
                      vi: $t("Hán tự (Chinese character) annotation"),
                    }[$l2.code] || $t("phonetic transcription")
                  }}
                </span>
              </template>
            </i18n>
          </div>
          <client-only>
            <router-link
              v-if="shared"
              class="text-success mb-2"
              :to="{ name: 'my-text' }"
            >
              <i class="fa fa-chevron-left"></i>
              {{ $t("My Texts") }}
            </router-link>
            <h4 class="mt-3 mb-3" v-if="shared">{{ shared.title }}</h4>
          </client-only>
          <div v-if="loading" class="text-center pt-5 pb-5">
            <Loader :sticky="true" :message="$t('Loading your text...')" />
          </div>
          <ReaderComp
            v-if="!loading"
            :initialText="text"
            :initialTranslation="translation"
            ref="reader"
            :page="page"
            :baseUrl="baseUrl"
            :showLoading="false"
            @readerTextChanged="readerTextChanged"
            @readerTranslationChanged="readerTranslationChanged"
            @previousPage="onPreviousPage"
            @nextPage="onNextPage"
            @goToPage="goToPage"
          />
          <client-only>
            <div class="text-center mt-4" v-if="canShare">
              <b-button @click="upload" variant="success" size="sm">
                <i class="fas fa-paper-plane"></i>
                {{ $t("Share Annotated Text") }}
              </b-button>
            </div>
            <div
              v-if="shared || sharing || !canShare"
              class="share-banner alert mt-4"
            >
              <div v-if="!sharing">
                <div class="strong mb-2">
                  <i class="fas fa-paper-plane"></i>
                  {{ $t("Shareable via link:") }}
                </div>
                <div :class="`share-banner-url border-gray rounded p-2`">
                  <span>{{ shareURL }}</span>
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
                {{ $t("Creating a shareable URL...") }}
              </div>
            </div>
          </client-only>
        </div>
      </div>
      <h5 class="mt-5">
        {{ $t("More about this {l2} Reader", { l2: $t($l2.name) }) }}
      </h5>
      <ul>
        <li>
          {{
            $t(
              "This is a {l2} text reading tool (a.k.a annotator, tokenizer, lemmatizer)",
              { l2: $t($l2.name) }
            )
          }}
        </li>
        <li>{{ $t("Tap on any word for a popup dictionary.") }}</li>
        <li>
          {{
            $t('Tap on the three dots "..." next to each line for translation.')
          }}
        </li>
        <li>
          <i18n path="You can customize the output in {settings}.">
            <template #settings>
              <router-link to="settings">{{ $t("Settings") }}</router-link>
            </template>
          </i18n>
        </li>
        <li>
          <i18n path="{markdown} and {html} are also supported.">
            <template #markdown>
              <code>Markdown</code>
            </template>
            <template #html>
              <code>HTML</code>
            </template>
          </i18n>
        </li>
        <li v-if="dictionaryCredit" v-html="$t(dictionaryCredit)"></li>
      </ul>
      <div class="row mt-3">
        <div class="col-sm-12">
          <h5 class="mb-3">{{ $t("Not sure what to read?") }}</h5>
          <ul>
            <li>
              {{
                $t("Look for {l2} music lyrics on Google.", {
                  l2: $t($l2.name),
                })
              }}
            </li>
            <li
              v-html="
                $t(
                  'Read various {l2} documents directly on the “Books” page.',
                  { l2: $t($l2.name) }
                )
              "
            />
          </ul>
        </div>
      </div>
      <h5 class="mt-2">{{ $t("Keywords for search engines") }}</h5>
      <ul>
        <li>{{ $t("Online {l2} lemmatizer", { l2: $t($l2.name) }) }}</li>
        <li>{{ $t("Online {l2} annotator", { l2: $t($l2.name) }) }}</li>
        <li>{{ $t("Online {l2} reader", { l2: $t($l2.name) }) }}</li>
        <li>{{ $t("Online {l2} tokenizer", { l2: $t($l2.name) }) }}</li>
        <li>{{ $t("Online {l2} NLP tool", { l2: $t($l2.name) }) }}</li>
      </ul>
    </div>
    <div class="container">
      <div class="row">
        <div class="col-sm-12 text-center"></div>
      </div>
    </div>
  </div>
</template>

<script>
import ReaderComp from "@/components/ReaderComp";
import { logError, proxy } from "@/lib/utils";
import SAMPLE_TEXT from "@/lib/utils/sample-text";
import { markdownToTxt } from "markdown-to-txt";
import { NodeHtmlMarkdown, NodeHtmlMarkdownOptions } from "node-html-markdown";
import { parse } from "node-html-parser";
import { baseUrl } from "@/lib/utils/url";

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
      baseUrl: "",
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
        let res = await this.$directus.get(`items/text/${id}`);
        if (res && res.data && res.data.data) {
          text = res.data.data.text;
          translation = res.data.data.translation;
          this.shared = res.data.data;
        }
      } catch (err) {
        logError(err);
      }
    } else if (method === "html-url") {
      this.baseUrl = baseUrl(this.arg);
      try {
        let html = await proxy(arg);
        let dom = parse(html);
        let body = dom.querySelector("body");
        let article = dom.querySelector("article");
        let wikipediaContent = dom.querySelector("#mw-content-text");
        dom = wikipediaContent || article || body || dom;
        html = dom.toString();
        text = NodeHtmlMarkdown.translate(html) || "";
      } catch (err) {
        logError(err);
      }
    } else if (method === "md-url") {
      try {
        let md = await proxy(arg);
        text = md || "";
      } catch (err) {
        logError(err);
      }
    } else if (["md", "html", "txt"].includes(method)) {
      text = arg.replace(/\n+/g, "\n\n");
    } else {
      let r = this.get(); // from localStorage
      text = r.text;
      translation = r.translation;
      if (!text || text.length === "") {
        if (SAMPLE_TEXT[this.$l2.code]) {
          text = SAMPLE_TEXT[this.$l2.code];
        }
      }
    }
    this.text = text;
    this.translation = translation;
    this.loading = false;
  },
  computed: {
    shareURL() {
      if (typeof location !== "undefined")
        return location.href?.replace(
          location.protocol + "//" + location.host,
          "https://languageplayer.io"
        );
    },
    title() {
      let lines = this.text.trim().split(/\n+/) || [""];
      return markdownToTxt(lines[0]);
    },
    /**
     * Whether or not to show a "share this" button
     */
    canShare() {
      if (this.shared) return false; // already shared, url visible
      if (!this.text) return false; // nothing to share
      if (this.method && this.method !== "share") return false; // already shareable
      return true;
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
        let res = await this.$directus.post(`items/text`, {
          title: this.title,
          text: this.text,
          translation: this.translation,
          l2: this.$l2.id,
        });
        if (res && res.data && res.data.data.id) {
          let shared = res.data.data;
          this.shared = shared;
          this.$router.push({
            name: "reader",
            params: { method: "shared", arg: shared.id },
          });
        }
        this.sharing = false;
      } catch (err) {
        logError(err);
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
    goToPage(page) {
      let to = {
        name: "reader",
        params: {
          method: this.method,
          arg: this.arg,
        },
        query: {
          p: page,
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
@import "~@/assets/scss/variables.scss";
.zerotohero-light {
  .share-banner {
    background-color: rgba($primary-color, 0.5);
    color: #107525;
    .share-banner-url {
      background-color: rgba(255, 255, 255, 0.5);
    }
  }
}
.zerotohero-dark {
  .share-banner {
    // dark green background
    background-color: rgba($primary-color, 0.2);
    color: #ccc;
    .share-banner-url {
      background-color: rgba(0, 0, 0, 0.5);
      color: #ccc;
    }
  }
}
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

.share-banner {
  .share-banner-url {
    span {
      width: calc(100% - 2rem);
      white-space: nowrap;
      display: block;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }
}
</style>
