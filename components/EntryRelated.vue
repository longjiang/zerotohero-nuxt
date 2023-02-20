<template>
  <div :key="'related-' + relatedKey" class="widget">
    <div class="widget-title">
      <i18n path="Words related to “{0}”" tag="span">
        <span>
          <span v-if="!$l2.han || $l2.code === 'ja'">{{ entry.head }}</span>
          <span class="traditional">{{ entry.traditional }}</span>
          <span class="simplified">{{ entry.simplified }}</span>
        </span>
      </i18n>
    </div>
    <div class="jumbotron-fluid widget-body p-4">
      <div
        :class="{ 'loader text-center pb-5 pt-3': true, 'd-none': !checking }"
        style="flex: 1"
      >
        <Loader :sticky="true" message="Looking up the thesaurus..." />
      </div>
      <WordList
        v-if="words && words.length > 0"
        :words="words"
        class="related"
        :compareWith="entry"
        collapse="10"
      />
      <div v-if="words && words.length === 0">
        {{ $t('Sorry, we could not find any words related to “{term}” in this corpus.', { term: entry.head } ) }}
        <i18n path="You can set a different corpus in {0}.">
          <router-link :to="{name: 'settings'}">
            {{ $t('Settings') }}
          </router-link>
        </i18n>
      </div>
      <hr v-if="words && words.length === 0" />
      <div class="mt-4">
        <i18n path="Related words provided by {0}" tag="span">
          <a href="https://www.sketchengine.eu/" target="_blank">
            <img
              src="/img/logo-sketch-engine.png"
              alt="Sketch Engine"
              class="ml-2 logo-small"
            />
          </a>
        </i18n>
      </div>
    </div>
  </div>
</template>
<script>
import SketchEngine from "@/lib/sketch-engine";

export default {
  props: ["entry"],
  data() {
    return {
      words: undefined,
      relatedKey: 0,
      checking: false,
    };
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
  async mounted() {
    this.checking = true;
    let response;
    try {
      response = await SketchEngine.thesaurus({
        l2: this.$l2,
        term: this.entry.simplified || this.entry.head,
      });
    } catch (err) {}
    if (response && response.Words) {
      let w = [];
      for (let Word of response.Words) {
        let words =
          this.$l2.han && this.$l2.code !== "ja"
            ? await (await this.$getDictionary()).lookupSimplified(Word.word)
            : [await (await this.$getDictionary()).lookup(Word.word)];
        if (words.length > 0 && words[0]) {
          let word = words[0];
          word.saved = this.$store.getters["savedWords/has"]({
            id: word.id,
            l2: this.$l2.code,
          });
          w.push(word);
        }
      }
      this.words = w.sort((a, b) =>
        a.saved === b.saved ? 0 : a.saved ? -1 : 1
      );
      if (this.words.length > 0) {
        this.$emit("relatedReady");
      }
    } else {
      this.words = [];
    }
    this.checking = false;
  },
};
</script>

<style>
.related {
  list-style: none;
  padding: 0;
  columns: 2;
}

.related .saved-words.collapsed li {
  display: block;
}

.related .saved-words.collapsed li:nth-child(n + 11) {
  display: none;
}

@media (max-width: 768px) {
  .related {
    column-count: 1;
  }
}

.related.collapsed li:nth-child(n + 13) {
  display: none;
}
</style>
