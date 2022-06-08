<template>
  <container-query :query="query" v-model="params">
    <div>
      <button
        v-if="iconMode && !fullscreen"
        @click="fullscreen = !fullscreen"
        class="reader-icon"
      >
        <i class="fas fa-pencil-alt" />
      </button>
      <div :class="{ reader: true, fullscreen }" v-else>
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
          <div
            v-if="text && text.length > 0 && !fullscreen"
            style="font-size: 1rem; line-height: 1"
            class="mb-3"
          >
            <strong>
              <i class="fas fa-check text-success mr-1" />
              Converted
            </strong>
            <div class="mt-1">
              <small>
                Tap on any word for a popup dictionary. Tap on the three dots
                "..." next to each line for translation. You can customize the
                output in
                <router-link to="settings">Settings</router-link>
                .
              </small>
            </div>
          </div>
          <LazyTextWithSpeechBar
            :html="marked"
            :translation="translation"
            :key="marked"
            :page="page"
            ref="text-with-speech-bar"
            @translation="onTranslation"
            @previousPage="$emit('previousPage')"
            @nextPage="$emit('nextPage')"
          />
          <div
            v-if="savedWordIdsInText && savedWordIdsInText.length > 0"
            id="vocabulary-list"
            class="pb-4"
          >
            <hr class="mb-4" />
            <div
              style="font-size: 1rem; line-height: 1"
              class="mb-3 text-center"
            >
              <strong>Vocabulary List</strong>
              <div class="mt-1">
                <small>
                  Here are the words you saved that appear in this text:
                </small>
              </div>
              <div class="mt-3">
                <b-button variant="success" v-if="!showWords" size="sm" @click="showWords = true">
                  Show {{ savedWordIdsInText.length }} Words
                </b-button>
              </div>
            </div>
            <div v-if="showWords">
              <WordList :ids="savedWordIdsInText" :star="false" />
            </div>
          </div>
        </div>
        <div class="reader-editor">
          <div class="mt-3 mb-3">
            <button
              v-if="!fullscreen"
              @click="toggleFullscreen"
              class="reader-button"
            >
              <i class="fa fa-expand" />
            </button>
            <button
              v-if="fullscreen"
              @click="toggleFullscreen"
              class="reader-button"
            >
              <i class="fa fa-times" />
            </button>
            <button
              @click="upload"
              :class="{
                'reader-button': true,
              }"
              style="font-size: 0.9em"
              v-if="!shared"
            >
              <i class="fas fa-share"></i>
              Share
            </button>
            <button
              v-if="!addTranslation"
              @click="addTranslation = !addTranslation"
              :class="{
                'reader-button': true,
                'reader-button-active': addTranslation,
              }"
              style="font-size: 0.9em"
            >
              <i class="fas fa-keyboard"></i>
              Enter Translation
            </button>
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
          <div class="d-flex">
            <textarea
              id="reader-textarea"
              class="form-control"
              cols="30"
              rows="5"
              :placeholder="$t('Paste {l2} text here', { l2: $l2.name })"
              v-model="text"
              :dir="$l2.direction === 'rtl' ? 'rtl' : 'ltr'"
            ></textarea>
            <textarea
              v-if="addTranslation"
              id="translation-textarea"
              class="form-control ml-1"
              cols="30"
              rows="5"
              :placeholder="$t('Paste translation text here', { l2: $l2.name })"
              v-model="translation"
              :dir="$l2.direction === 'rtl' ? 'rtl' : 'ltr'"
            ></textarea>
          </div>
          <div class="mt-2 p-1">
            <span
              v-for="translator of translators"
              :key="`trans-${translator.id}`"
            >
              <a
                :href="translator.url"
                target="_blank"
                style="
                  font-size: 0.9em;
                  white-space: nowrap;
                  display: inline-block;
                  color: black;
                "
                :class="{
                  'mr-3': true,
                }"
              >
                {{ translator.name }}
                <i class="fas fa-angle-right"></i>
              </a>
            </span>
          </div>
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
import Helper from "@/lib/helper";
import { ContainerQuery } from "vue-container-query";
import { mapState } from "vuex";
import Config from "@/lib/config";

export default {
  components: {
    ContainerQuery,
  },
  data() {
    return {
      text: "",
      textThrottled: "",
      shared: undefined, // The object corresponding to the text object shared (uploaded) to the server: {id: 1, text: '...', translation: '...'}
      sharing: false,
      translation: "",
      annotated: false,
      readerKey: 0, // used to force re-render this component
      fullscreen: false,
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
    iconMode: {
      default: false,
    },
    page: {
      type: Number,
      default: 1,
    },
  },
  computed: {
    ...mapState("savedWords", ["savedWords"]),
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
        foundWordIds = Helper.unique(foundWordIds);
        return foundWordIds;
      }
    },
    shareURL() {
      if (this.shared)
        return `${window.location.protocol}//${window.location.hostname}/${this.$l1.code}/${this.$l2.code}/reader/shared/${this.shared.id}`;
    },
    translationSrc() {
      return this.translationUrl(this.$l1.code, this.$l2.code, this.text);
    },
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
    marked() {
      return (
        Marked(this.textThrottled.replace(/^ {4,}/gm, "")) || this.textThrottled // 4 spaces in a row would emit <code>!
      );
    },
    translators() {
      let translators = this.$languages.getTranslator(this.$l1, this.$l2) || [];
      let mappedTranslators = [];
      for (let t of translators.translators) {
        if (typeof t.url === "function") {
          // Wait until the function is available
          mappedTranslators.push({
            name: t.name,
            id: t.id,
            url: t.url(this.text, this.$l1.code, this.$l2.code),
          });
        }
      }
      return mappedTranslators;
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
      await Helper.timeout(1000);
      if (typing === this.text) {
        this.textThrottled = this.text;
        if (this.shared && this.text !== this.shared.text)
          this.shared = undefined; // Unset link to the shared text on the server
        this.$emit("readerTextChanged", this.text);
      }
    },
    async translation() {
      let typing = this.translation;
      await Helper.timeout(1000);
      if (typing === this.translation) {
        this.$emit("readerTranslationChanged", this.translation);
        if (this.shared && this.translation !== this.shared.translation)
          this.shared = undefined; // Unset link to the shared text on the server
      }
      if (this.translation && this.translation !== "")
        this.addTranslation = true;
      else this.addTranslation = false;
    },
  },
  methods: {
    onTranslation(translation) {
      this.translation = translation;
    },
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
          text: this.text,
          translation: this.translation,
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
      this.fullscreen = !this.fullscreen;
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
  },
};
</script>
<style lang="scss" scoped>
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

#reader-annotated >>> del .word-block {
  color: red !important;
}

#reader-annotated {
  background: white;
  padding: 1.5rem;
  border-radius: 0.25rem;
  box-shadow: 0px 3px 10px #191c553b;
  border: 1px solid #d7d7d8;
}

#reader-annotated {
  padding-bottom: 0;
}

#reader-annotated >>> del .word-block .word-block-simplified::after {
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
  background: none;
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

.reader.fullscreen {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  background: white;
  z-index: 10;
  overflow: scroll;
  margin-top: 0 !important;
  padding: 1rem;

  .reader-editor {
    position: fixed;
    bottom: 1rem;
    width: calc(100vw - 2rem);

    #reader-textarea {
      max-height: 15vh;
    }
  }

  #reader-annotated,
  #translation-iframe {
    position: fixed;
    width: calc(100vw - 2rem);
    height: calc(100vh - 15vh - 5.5rem);
    overflow: scroll;
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
</style>
