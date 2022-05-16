<template>
  <client-only>
    <div class="toggle-saved-word focus-exclude">
      <i class="fas fa-star star-animation animate"></i>
      <button
        class="btn btn-unstyled not-saved btn-toggle-saved-word add-word"
        v-if="!saved"
        v-on:click="saveWordClick"
        title='Add to "Saved Words"'
      >
        <i class="far fa-star"></i>
        Save Word
      </button>
      <button
        class="btn btn-unstyled saved btn-toggle-saved-word remove-word"
        v-if="saved && !removeSymbol"
        v-on:click="removeWordClick"
        title='Remove from "Saved Words"'
      >
        <!-- <i class="fas fa-bookmark"></i> -->
        <i class="fas fa-check"></i>
        Saved
        <i class="fas fa-times-circle ml-1"></i>
      </button>
      <button
        v-if="removeSymbol"
        class="btn btn-unstyled text-secondary p-0 pb-1"
      >
        <i class="fas fa-times-circle"></i>
      </button>
    </div>
  </client-only>
</template>

<script>
import Helper from "@/lib/helper";
import { mapState } from "vuex";

export default {
  props: {
    word: {
      type: Object,
    },
    text: {
      type: String,
    },
    removeSymbol: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      id: Helper.uniqueId(),
      Helper,
    };
  },
  sa() {
    this.animate
  },
  computed: {
    ...mapState("savedWords", ["savedWords"]),
    saved() {
      let saved = false;
      if (this.word) {
        saved = this.$store.getters["savedWords/has"]({
          id: this.word.id,
          l2: this.$l2.code,
        });
        this.word.saved = saved;
      } else if (this.text) {
        saved = this.$store.getters["savedWords/has"]({
          text: this.text.toLowerCase(),
          l2: this.$l2.code,
        });
      }
      return saved;
    },
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
    $dictionary() {
      return this.$getDictionary();
    },
    $dictionaryName() {
      return this.$store.state.settings.dictionaryName;
    },
    $hanzi() {
      return this.$getHanzi();
    },
  },
  methods: {
    async allForms() {
      let wordForms =
        (await (await this.$getDictionary()).wordForms(this.word)) || [];
      wordForms = wordForms.filter((form) => form !== "");
      wordForms = [this.word.head].concat(
        wordForms.map((form) => form.form.replace(/'/g, ""))
      );
      if (this.text) {
        wordForms.push(this.text);
      }
      wordForms = Helper.unique(wordForms).filter(
        (form) => form && form !== "" && form !== "-"
      );
      return wordForms;
    },
    async saveWordClick() {
      let wordForms = this.word
        ? await this.allForms()
        : [this.text.toLowerCase()];
      this.$store.dispatch("savedWords/add", {
        word: this.word,
        wordForms: wordForms,
        l2: this.$l2.code,
      });
      this.word.saved = true;
    },
    removeWordClick() {
      this.$store.dispatch("savedWords/remove", {
        word: this.word,
        l2: this.$l2.code,
      });
      this.word.saved = false;
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.star-animation {
  color: #f8b61e;
  position: absolute;
  &.animate {
    position: fixed;
    top: 0;
    right: 0;
    z-index: 99;
    opacity: 0;
  }
}

.toggle-saved-word {
  display: inline-block;
}

.btn-toggle-saved-word {
  position: relative;
  bottom: 0.2em;
  padding: 0.05rem 0.4rem;
  font-size: 0.8em;
  &.not-saved {
    color: #f8b61e;
    border: 2px solid #f8b61e99;
  }
  &.saved {
    background: #f8b61e;
    color: white;
  }
}
</style>
