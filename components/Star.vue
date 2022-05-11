<template>
  <client-only>
    <div class="toggle-saved-word focus-exclude">
      <button
        class="star remove-word"
        v-if="saved()"
        v-on:click="removeWordClick"
        title='Remove from "Saved Words"'
      >
        <!-- <i class="fas fa-bookmark"></i> -->
        <i class="fas fa-star"></i>
      </button>
      <button
        class="star add-word"
        v-if="!saved()"
        v-on:click="saveWordClick"
        title='Add to "Saved Words"'
      >
        <i class="far fa-star"></i>
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
  },
  data() {
    return {
      id: Helper.uniqueId(),
      Helper,
    };
  },
  computed: {
    ...mapState("savedWords", ["savedWords"]),
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
    saved() {
      let saved = false;
      if (this.word) {
        saved = this.$store.getters["savedWords/has"]({
          id: this.word.id,
          l2: this.$l2.code,
        });
      } else {
        saved = this.$store.getters["savedWords/has"]({
          text: this.text.toLowerCase(),
          l2: this.$l2.code,
        });
      }
      this.word.saved = saved;
      return saved;
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
<style scoped>
.toggle-saved-word {
  display: inline-block;
  position: relative;
  padding: 0;
  margin: 0;
  background: none;
  border: none;
}

.star {
  background: none;
  border: none;
  color: #f8b61e;
  padding: 0;
  font-size: 1em;
}
</style>
