<template>
  <Widget :key="'related-' + relatedKey">
    <template #title>
      <i18n path="Words related to “{0}”" tag="span">
        <span>
          <span v-if="!$l2.han">{{ entry ? entry.head : term }}</span>
          <template v-else>
            <span class="traditional">{{ entry ? entry.traditional : term  }}</span>
            <span class="simplified">{{ entry ? entry.simplified : term  }}</span>
          </template>
        </span>
      </i18n>
    </template>
    <template #body>
      <div
        :class="{ 'loader text-center pb-5 pt-3': true, 'd-none': !checking }"
        style="flex: 1"
      >
        <Loader :sticky="true" message="Looking up the thesaurus..." />
      </div>
      <WordList
        v-if="words && words.length > 0"
        :words="words"
        :class="{
          'related': true,
        }"
        :showSpeak="false"
        :compareWith="entry"
        collapse="10"
      />
      <div v-if="words && words.length === 0">
        {{
          $t(
            "Sorry, we could not find any words related to “{term}” in this corpus.",
            { term: entry ? entry.head : term }
          )
        }}
        <i18n path="You can set a different corpus in {0}.">
          <router-link :to="{ name: 'l1-l2-settings' }">
            {{ $t("Settings") }}
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
        </i18n> | 
        <span v-if="$l2Settings?.corpname">
          {{ $t("Corpus") }}:
          <code>{{ $l2Settings?.corpname.replace("preloaded/", "") }}</code>
        </span>
      </div>
    </template>
  </Widget>
</template>
<script>
import SketchEngine from "../lib/sketch-engine";

export default {
  props: {
    entry: Object,
    text: String,
  },
  data() {
    return {
      words: undefined,
      relatedKey: 0,
      checking: false,
    };
  },
  computed: {
    term() {
      if (!this.word) return this.text;
      // If this.$l2.code is 'zh', determine if the corpus is traditional or simplified
      const corpname = this.$l2Settings.corpname
      const isChineseTraditional = this.$l2.code === 'zh' && corpname && corpname.includes("trad");
      return isChineseTraditional ? this.word.traditional : this.word.head;
    },
  },
  async mounted() {
    this.checking = true;
    let response;
    try {
      response = await SketchEngine.thesaurus({
        l2: this.$l2,
        term: this.entry?.simplified || this.entry?.head || this.term,
        corpname: this.$l2Settings.corpname,
      });
    } catch (err) {}
    if (response && response.Words) {
      const dictionary = await this.$getDictionary();
      let w = [];
      for (let Word of response.Words) {
        let words =
          this.$l2.han && this.$l2.code !== "ja"
            ? await dictionary.lookupSimplified(Word.word)
            : [await dictionary.lookup(Word.word)];
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
