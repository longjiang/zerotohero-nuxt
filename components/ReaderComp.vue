<template>
  <container-query :query="query" v-model="params">
    <div>
      <button
        v-if="iconMode && !fullscreen"
        @click="toggleFullscreen"
        class="reader-icon"
      >
        <i class="fas fa-pencil-alt" />
      </button>
      <div
        :class="{ reader: true, fullscreen, [`skin-${$skin}`]: true }"
        v-else
      >
        <div class="text-center">
          <Loader class="mb-5" />
        </div>
        <div
          v-if="text && text.length > 0 && !loading"
          id="reader-annotated"
          :class="{
            focus: true,
            'reader-annotated-wide': params.lg,
            'with-translation': translation,
          }"
        >
          <LazyTextWithSpeechBar
            :html="marked"
            :translation="translation"
            :showLoading="showLoading"
            :key="marked"
            :page="page"
            :baseUrl="baseUrl"
            ref="text-with-speech-bar"
            @translation="onTranslation"
            @previousPage="$emit('previousPage')"
            @nextPage="$emit('nextPage')"
            @goToPage="goToPage"
          />
          <div
            v-if="savedWordIdsInText && savedWordIdsInText.length > 0"
            id="vocabulary-list"
            class="pb-2"
          >
            <div class="text-center mt-1" v-if="!showWords">
              <b-button
                variant="unstyled text-success strong text-decoration-underline"
                size="sm"
                @click="showWords = true"
              >
                {{
                  $t("Show Vocabulary List ({num})", {
                    num: savedWordIdsInText.length,
                  })
                }}
              </b-button>
            </div>
            <div v-if="showWords">
              <hr class="mt-0 mb-4" />
              <div style="font-size: 1rem; line-height: 1" class="mb-3">
                <div class="mt-1">
                  <small>{{
                    $t("Here are your saved that appear in this text:")
                  }}</small>
                </div>
              </div>
              <WordList :ids="savedWordIdsInText" />
            </div>
          </div>
        </div>
        <div class="reader-editor">
          <div class="mt-3 mb-3">
            <b-button
              @click="clear"
              :variant="$skin"
              class="reader-button"
            >
              <i class="fa fa-eraser mr-1" />
              {{ $t("Clear") }}
            </b-button>
            <!-- Remove Bold -->
            <b-button
              @click="removeBoldFromMarkdown"
              :variant="$skin"
              class="reader-button"
            >
              <i class="fa fa-bold mr-1" />
              {{ $t("Remove Bold") }}
            </b-button>
            <b-button
              v-if="!fullscreen"
              @click="toggleFullscreen"
              :variant="$skin"
              class="reader-button"
            >
              <i class="fa fa-up-right-and-down-left-from-center mr-1" />
              {{ $t("Fullscreen") }}
            </b-button>
            <b-button
              v-if="fullscreen"
              @click="toggleFullscreen"
              :variant="$skin"
              class="reader-button"
            >
              <i class="fa fa-down-left-and-up-right-to-center mr-1" />
              {{ $t("Close") }}
            </b-button>
            <b-button
              v-if="!addTranslation"
              @click="addTranslation = !addTranslation"
              :class="{
                'reader-button': true,
                'reader-button-active': addTranslation,
              }"
              :variant="$skin"
            >
              <i class="fas fa-keyboard mr-1"></i>
              {{ $t("Enter Translation") }}
            </b-button>
          </div>
          <div class="d-flex">
            <textarea
              id="reader-textarea"
              class="reader-textarea form-control"
              cols="30"
              rows="5"
              :placeholder="$t('Paste {l2} text here', { l2: $l2.name })"
              v-model="text"
              :dir="$l2.direction === 'rtl' ? 'rtl' : 'ltr'"
            ></textarea>
            <textarea
              v-if="addTranslation"
              class="reader-textarea form-control ml-1 flex-1"
              cols="30"
              rows="5"
              v-model="translation"
              id="translation-textarea"
              :placeholder="$t('Paste translation text here', { l2: $l2.name })"
              :dir="$l2.direction === 'rtl' ? 'rtl' : 'ltr'"
            ></textarea>
          </div>

          <TranslatorLinks v-bind="{ text }" class="mt-2" v-if="text.length < 3400" />
          <small v-else class="d-block mt-2 text-secondary">{{ $t("Text too long for translate links to work.") }}</small>
        </div>
        <iframe
          v-if="showTranslate"
          :src="translationSrc"
          id="translation-iframe"
          class="mt-2 mb-2"
        ></iframe>
      </div>
    </div>
  </container-query>
</template>
<script>
import Marked from "marked";
import { ContainerQuery } from "vue-container-query";
import { unique, timeout } from "../lib/utils";
import { mapState } from "vuex";

export default {
  components: {
    ContainerQuery,
  },
  data() {
    return {
      text: this.initialText,
      textThrottled: "",
      translation: this.initialTranslation,
      annotated: false,
      readerKey: 0, // used to force re-render this component
      showTranslate: false,
      addTranslation: this.translation && this.translation !== "",
      loading: true,
      typing: undefined,
      showWords: false,
      params: {},
      query: {
        lg: {
          minWidth: 600,
        },
      },
    };
  },
  props: {
    baseUrl: {
      type: String,
      default: "",
    },
    iconMode: {
      default: false,
    },
    page: {
      type: Number,
      default: 1,
    },
    initialText: {
      type: String,
      default: "",
    },
    initialTranslation: {
      type: String,
      default: "",
    },
    showLoading: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapState("settings", ["fullscreen"]),
    savedWordIdsInText() {
      if (!this.text) return;
      if (this.savedWords) {
        let savedWords = this.savedWords[this.$l2.code];
        let foundWordIds = [];
        if (savedWords) {
          for (let word of savedWords) {
            for (let form of word.forms || []) {
              if (this.text.includes(form) && form !== "a")
                foundWordIds.push(word.id);
            }
          }
        }
        foundWordIds = unique(foundWordIds);
        return foundWordIds;
      }
    },
    translationSrc() {
      return this.translationUrl(this.$l1.code, this.$l2.code, this.text);
    },
    marked() {
      let text = this.textThrottled || this.text;
      let augmentedText = text;
      if(!augmentedText.includes('|')) augmentedText = augmentedText.replace(/([^\n])\n([^\n])/g, "$1\n\n$2");
      Marked.setOptions({
        breaks: true,
        gfm: true,
      });
      let marked = Marked(augmentedText) || text;
      return marked;
    },
    externalTranslateUrl() {
      if (!this.text) return;
      let text = this.text.trim();
      let url = this.$languages.translationURL(text, this.$l1, this.$l2);
      return url;
    },
  },
  async mounted() {
    await this.$getDictionary();
    this.loading = false;
  },
  watch: {
    async text() {
      let typing = this.text;
      await timeout(1000);
      if (typing === this.text) {
        this.textThrottled = this.text;
        this.$emit("readerTextChanged", this.text);
      }
    },
    async translation() {
      let typing = this.translation;
      await timeout(1000);
      if (typing === this.translation) {
        this.$emit("readerTranslationChanged", this.translation);
      }
      if (this.translation && this.translation !== "")
        this.addTranslation = true;
      else this.addTranslation = false;
    },
  },
  methods: {
    goToPage(page) {
      this.$emit("goToPage", page);
    },
    onEditorChange() {
      this.text = this.$refs.editor.invoke("getMarkdown");
    },
    onTranslation(translation) {
      this.translation = translation;
    },
    translatorURL(translator) {
      return translator.url(this.text, this.$l1.code, this.$l2.code);
    },
    toggleTranslation() {
      this.showTranslate = !this.showTranslate;
    },
    translationUrl(l1Code, l2Code, text) {
      let langs = {
        en: {
          zh: (text) =>
            `https://www.bing.com/translator/?from=zh&to=en&text=${text}`,
        },
        // yandex, papago, baidu all refuse iframes
      };
      if (langs[l1Code] && langs[l1Code][l2Code]) {
        return langs[l1Code][l2Code](text);
      } else {
        return `https://www.bing.com/translator/?from=auto&to=${l1Code}&text=${text}`;
      }
    },
    toggleFullscreen() {
      this.$store.dispatch("settings/setFullscreen", !this.fullscreen);
    },
    toggleButtons() {
      this.buttons = !this.buttons;
    },
    show() {
      const marked = Marked(this.text) || this.text;
      if (marked) {
        $("#reader-annotated").html(marked);
      }
    },
    removeBoldFromMarkdown() {
      this.text = this.text.replace(/(\*\*|\\\*\\\*|__)(.*?)\1/g, "$2");
    },
    clear() {
      this.text = "";
      this.translation = "";
      this.addTranslation = false;
      // Scroll to top
      window.scrollTo(0, 0);
      // Go to the first page
      this.$emit("goToPage", 1);
      // Show a toast
      this.$toast.success(this.$t("Text cleared!"), {
        position: "top-center",
        duration: 1000,
      });
    },
  },
};
</script>
<style lang="scss" scoped>

.reader.skin-dark {
  .reader-textarea {
    background: #333;
    color: #eee;
    border-color: #555;
  }
}

.reader-annotated-wide.with-translation {
  .line {
    display: flex;
    align-items: flex-start;
    .annotated-line {
      width: 61.8%;
    }
    .translation-line {
      width: 38.2%;
      margin-left: 1rem;
    }
  }
}

.reader-icon {
  border: none;
  background: white;
  color: #666;
  box-shadow: 5px 5px 20px rgba(0, 0, 0, 0.5);
  width: 2rem;
  height: 2rem;
  position: fixed;
  bottom: 1rem;
  left: 1rem;
  border-radius: 100%;
  opacity: 0.2;
  z-index: 10;
  padding: 0;

  &:hover {
    opacity: 1;
  }
}

.zerotohero-wide {
  .reader-icon {
    left: calc(416px + 1rem);
  }
}


#reader-annotated :deep(del) .word-block {
  color: red !important;
}

#reader-annotated {
  border-radius: 0.25rem;
}

#reader-annotated {
  padding-bottom: 0;
}

#reader-annotated :deep(del) .word-block .word-block-simplified::after {
  content: " \2717";
  color: red !important;
}

#translation-iframe {
  width: 100%;
  border: 1px solid #eee;
  height: calc(100vh - 14rem);
  border-radius: 0.5rem;
  background: #ccc;
}

.reader-button {
  border: none;
  &:not(:hover) {
    background: none;
  }
  display: inline-block;
  margin: 0;
  border-radius: 0.2rem;
  overflow: hidden;
  line-height: 1em;
  text-align: center;
  padding: 0.5rem;
}

.reader-button-active {
  background: #666;
  color: white;
}

// Dark mode
.reader.skin-dark.fullscreen {
  background: #1a1a1c;
}

.reader.fullscreen {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  min-height: 100vh;
  z-index: 10;
  overflow: auto;
  margin-top: 0 !important;
  padding: 1rem;
  background-color: white;

  .reader-editor {
    position: fixed;
    bottom: 1rem;
    width: calc(100vw - 2rem);
  }

  #reader-annotated,
  #translation-iframe {
    position: fixed;
    width: calc(100vw - 2rem);
    height: calc(100vh - 15vh - 7rem);
    padding-bottom: 10rem;
    overflow: auto;
  }
}
</style>
