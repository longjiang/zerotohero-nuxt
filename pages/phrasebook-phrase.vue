<router>
  {
    path: '/:l1/:l2/phrasebook/:bookId/:phraseId/:phrase?',
    props: true
  }
</router>
<template>
  <div class="container main mt-5 mb-5">
    <div class="row">
      <div class="col-sm-12">
        <Paginator
          class="text-center mb-4"
          v-if="phrasebook && phraseId"
          :items="phrasebook.phrases"
          :findCurrent="findCurrent"
          :url="url"
          :home="`/${$l1.code}/${$l2.code}/phrasebook/${phrasebook.id}`"
          :title="phrasebook.title"
        />
        <p class="text-center">
          <span v-if="phraseObj && phraseObj.pronunciation" class="mr-1">
            {{ phraseObj.pronunciation }}
          </span>
          <Speak
            :text="phraseObj.phrase"
            v-if="phraseObj && phraseObj.phrase"
          />
        </p>
        <h2 class="text-center">
          <Annotate
            :class="{
              'mb-4 d-inline-block': true,
              'pr-3': $l2.direction === 'rtl',
              'pl-3': $l2.direction !== 'rtl',
            }"
            :data-level="
              phraseObj && phraseObj.level ? phraseObj.level : 'outside'
            "
            :phonetics="false"
            :buttons="true"
            v-if="phraseObj && phraseObj.phrase"
          >
            <span>{{ phraseObj.phrase }}</span>
          </Annotate>
        </h2>
        <p class="text-center" v-if="phraseObj && phraseObj[$l1.code]">
          {{ phraseObj[$l1.code] }}
        </p>
        <PhraseComp
          v-if="phraseObj && phraseObj.phrase"
          :term="phraseObj.phrase"
        />
        <div
          v-if="phrasebook && phrasebook.description"
          v-html="phrasebook.description"
          class="mt-5 pt-5 text-center"
        />
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Config from "@/lib/config";
import Papa from "papaparse";

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
    findCurrent(phraseObj) {
      return phraseObj.id === Number(this.phraseId);
    },
    url(phraseObj) {
      return `/${this.$l1.code}/${this.$l2.code}/phrasebook/${this.phrasebook.id}/${phraseObj.id}/${phraseObj.phrase}`;
    },
  },
};
</script>

<style></style>
