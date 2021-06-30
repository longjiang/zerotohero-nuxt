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
            <b-dropdown
              v-if="words && words.length > 1"
              size="sm"
              :items="words"
              text="Disambiguation"
            >
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
          <div v-if="!word">
            <p class="text-center">
              <span v-if="phraseObj && phraseObj.pronunciation" class="mr-1">
                {{ phraseObj.pronunciation }}
              </span>
              <Speak
                :text="phraseObj.phrase"
                v-if="phraseObj && phraseObj.phrase"
              />
            </p>
            <h2 class="text-center mb-4">
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
          <DictionaryEntry v-if="word" :entry="word" :showImages="false" />
          <PhraseComp
            v-else-if="phraseObj && phraseObj.phrase"
            :term="phraseObj.phrase"
            class="mt-3"
          />
          <div
            v-if="phrasebook && phrasebook.description"
            v-html="phrasebook.description"
            class="mt-5 pt-5 text-center"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Config from "@/lib/config";
import Papa from "papaparse";
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
    let res = await axios.get(`${Config.wiki}items/phrasebook/${this.bookId}`);
    if (res && res.data) {
      let phrasebook = res.data.data;
      phrasebook.phrases = Papa.parse(phrasebook.phrases, {
        header: true,
      }).data.map((p, id) => {
        p.id = id;
        return p;
      });
      this.phrasebook = phrasebook;
      this.phraseObj = this.phrasebook.phrases.find(
        (p) => p.id === Number(this.phraseId)
      );
      if (
        process.server &&
        Helper.dictionaryTooLargeAndWillCauseServerCrash(this.$l2["iso639-3"])
      )
        return;
      else await this.matchPhraseToDictionaryEntries();
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
    async matchPhraseToDictionaryEntries() {
      this.words = await (
        await this.$getDictionary()
      ).lookupMultiple(this.phraseObj.phrase);
      if (this.words && this.words.length > 0) {
        for (let word of this.words) {
          if (!word.pronunciation)
            word.pronunciation = this.phraseObj.pronunciation;
        }
        this.word = this.words[0];
      }
    },
    findCurrent(phraseObj) {
      return phraseObj.id === Number(this.phraseId);
    },
    url(phraseObj) {
      return `/${this.$l1.code}/${this.$l2.code}/phrasebook/${this.phrasebook.id}/${phraseObj.id}/${phraseObj.phrase}`;
    },
    textChanged(newText) {
      this.phraseObj.phrase = newText;
    },
  },
};
</script>

<style></style>
