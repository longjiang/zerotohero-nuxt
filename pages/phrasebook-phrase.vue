<router>
  {
    path: '/:l1/:l2/phrasebook/:bookId/:phraseId/:phrase?',
    props: true
  }
</router>
<template>
  <div>
    <div class="container mt-4">
      <div class="row">
        <div class="col-sm-12">
          <div class="text-center">
            <Paginator
              class="mb-4"
              v-if="phrasebook && phraseId"
              :items="phrasebook.phrases"
              :findCurrent="findCurrent"
              :url="url"
              :home="`/${$l1.code}/${$l2.code}/phrasebook/${phrasebook.id}`"
              :title="phrasebook.title"
            />
          </div>
          <div>
            <div class="text-center">
              <span v-if="phraseObj && phraseObj.pronunciation" class="mr-1">
                {{ phraseObj.pronunciation }}
              </span>
              <Speak
                :text="phraseObj.phrase"
                v-if="phraseObj && phraseObj.phrase"
              />
            </div>
            <h2 class="text-center mb-0">
              <div class="d-inline-block">
                <Annotate
                  :class="{
                    'pr-3': $l2.direction === 'rtl',
                    'pl-3': $l2.direction !== 'rtl',
                  }"
                  :data-level="
                    phraseObj && phraseObj.level ? phraseObj.level : 'outside'
                  "
                  :phonetics="!phraseObj.pronunciation"
                  :buttons="true"
                  v-if="phraseObj && phraseObj.phrase"
                  @textChanged="textChanged"
                >
                  <span>{{ phraseObj.phrase }}</span>
                </Annotate>
              </div>
            </h2>
            <p class="text-center mt-0" v-if="phraseObj && phraseObj[$l1.code]">
              {{ phraseObj[$l1.code] }}
            </p>
          </div>
        </div>
      </div>
    </div>
    <div>
      <div class="text-center mt-1" v-if="words && words.length > 0">
        <i class="fa fa-arrow-down" style="font-size: 2em; color: #ccc"></i>
      </div>
      <div class="text-center mt-3" v-if="words && words.length > 1">
        <b-dropdown size="sm" :items="words" text="Disambiguation">
          <b-dropdown-item
            v-for="w in words"
            :key="`phrase-word-disambiguation-${w.id}`"
            @click="word = w"
          >
            <b>{{ w.head }}</b>
            <em>{{ w.definitions[0] }}</em>
          </b-dropdown-item>
        </b-dropdown>
      </div>

      <DictionaryEntry v-if="word" :entry="word" />
      <PhraseComp
        v-else-if="phraseObj && phraseObj.phrase"
        :term="phraseObj.phrase.toLowerCase()"
        class="mt-3 mb-5"
      />
    </div>
  </div>
</template>

<script>
import Helper from "@/lib/helper";

export default {
  props: {
    bookId: {
      type: String,
    },
    phraseId: {
      type: String,
    },
    phrase: {
      type: String,
    },
  },
  data() {
    return {
      phrasebook: undefined,
      phraseObj: undefined,
      words: undefined,
      word: undefined,
    };
  },
  async fetch() {
    this.getPhrasebookFromStore();
  },
  mounted() {
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type.startsWith("phrasebooks")) {
        
        this.getPhrasebookFromStore();
      }
    });
  },
  beforeDestroy() {
    // you may call unsubscribe to stop the subscription
    this.unsubscribe();
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
    async getPhrasebookFromStore() {
      let phrasebooks =
        this.$store.state.phrasebooks.phrasebooks[this.$l2.code];
      if (!phrasebooks) return;
      let phrasebook = phrasebooks.find((pb) => pb.id === Number(this.bookId));
      if (!phrasebook) return;

      this.phrasebook = phrasebook;
      let phrase = this.phrasebook.phrases.find(
        (p) => p.id === Number(this.phraseId)
      );
      phrase.phrase = this.stripPunctuations(phrase.phrase);
      this.phraseObj = phrase;
      if (
        process.server &&
        Helper.dictionaryTooLargeAndWillCauseServerCrash(this.$l2["iso639-3"])
      )
        return;
      else await this.matchPhraseToDictionaryEntries();
    },
    async matchPhraseToDictionaryEntries() {
      this.words = await (
        await this.$getDictionary()
      ).lookupMultiple(this.phraseObj.phrase, true);
      if (this.words && this.words.length > 0) {
        for (let word of this.words) {
          if (!word.pronunciation)
            word.pronunciation = this.phraseObj.pronunciation;
        }
        this.word = this.words[0];
      }
    },
    stripPunctuations(text) {
      text = text.replace(/[.!?。！？…؟\*]/g, "").trim();
      text = text.replace(/\/[^\s]+/, "").trim();
      text = text.replace(/[（(].*[)）]/g, "").trim();
      return text;
    },
    findCurrent(phraseObj) {
      return phraseObj.id === Number(this.phraseId);
    },
    url(phraseObj) {
      return `/${this.$l1.code}/${this.$l2.code}/phrasebook/${
        this.phrasebook.id
      }/${phraseObj.id}/${encodeURIComponent(phraseObj.phrase)}`;
    },
    textChanged(newText) {
      this.phraseObj.phrase = newText;
    },
  },
};
</script>

<style></style>
