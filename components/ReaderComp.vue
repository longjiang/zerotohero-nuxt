<template>
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
        v-if="text.length > 0 && !loading"
        id="reader-annotated"
        :class="{ focus: true }"
        :style="`font-size: ${fontSize}rem; margin-bottom: 2rem;`"
      >
        <div
          v-if="text.length > 0 && !fullscreen"
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
        <hr class="hide-for-present mt-0 mb-4" />
        <template
          v-for="(line, index) of marked
            .trim()
            .replace(/<(div|p|li|h1|h2|h3|h4|h5|h6)/g, '\n<$1')
            .split('\n')"
        >
          <Annotate
            v-if="line.trim().length > 0"
            class="mb-3"
            tag="div"
            :key="`reader-${readerKey}-${index}`"
            :buttons="true"
          >
            <span v-html="line.trim()" />
          </Annotate>
        </template>
      </div>
      <div class="reader-editor">
        <div>
          <textarea
            id="reader-textarea"
            class="form-control"
            cols="30"
            rows="5"
            :placeholder="$t('Paste {l2} text here', { l2: $l2.name })"
            v-model="text"
            :dir="$l2.direction === 'rtl' ? 'rtl' : 'ltr'"
          ></textarea>
        </div>
        <div class="mt-1">
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
          <button @click="bigger" class="reader-button">
            <span style="font-size: 1.25rem">A</span>
          </button>
          <button @click="smaller" class="reader-button">
            <small>A</small>
          </button>
          <button
            @click="toggleTranslation()"
            :class="{
              'reader-button': true,
              'reader-button-active': showTranslate,
            }"
          >
            <i class="fa fa-language"></i>
          </button>
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
</template>
<script>
import Marked from "marked";
export default {
  data() {
    return {
      text: "",
      annotated: false,
      readerKey: 0, // used to force re-render this component
      fontSize: this.iconMode ? 2 : 1.333,
      fullscreen: false,
      showTranslate: false,
      loading: true,
    };
  },
  props: {
    iconMode: {
      default: false,
    },
  },
  computed: {
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
        Marked(this.text.replace(/^ {4,}/gm, "")) || this.text // 4 spaces in a row would emit <code>!
      );
    },
  },
  async mounted() {
    await this.$getDictionary();
    this.loading = false;
  },
  watch: {
    text() {
      this.$emit("readerTextChanged", this.text);
      this.readerKey++;
    },
  },
  methods: {
    toggleTranslation() {
      this.showTranslate = !this.showTranslate;
      this.translationSrc = this.$languages.translationURL(
        this.text,
        this.$l1,
        this.$l2
      );
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
    smaller() {
      this.fontSize = this.fontSize * 0.8;
    },
    bigger() {
      this.fontSize = this.fontSize * 1.25;
    },
    reset() {
      this.fontSize = 1;
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
  padding: 1rem 1rem 0 1rem;
  border-radius: 0.25rem;
  box-shadow: 0px 3px 10px #191c553b;
  border: 1px solid #d7d7d8;
}

#reader-annotated >>> del .word-block .word-block-simplified::after {
  content: " \2717";
  color: red !important;
}

.show-pinyin #reader-annotated {
  line-height: 2.5;
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
  margin: 0 0.25rem 0 0;
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
    height: calc(100vh - 15vh - 4.5rem);
    overflow: scroll;
  }
}
</style>
