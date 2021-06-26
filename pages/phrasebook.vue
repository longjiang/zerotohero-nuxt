<router>
  {
    path: '/:l1/:l2/phrasebook/:bookId',
    props: true
  }
</router>
<template>
  <div class="container main mt-5 mb-5">
    <div class="row">
      <div class="col-sm-12" v-if="phrasebook">
        <h4 class="text-center">{{ phrasebook.title }}</h4>
        <div v-html="phrasebook.description" class="mt-5 mb-5 text-center" />
      </div>
    </div>
    <div class="row" v-if="phrasebook">
      <router-link
        v-for="(phraseObj, phraseIndex) in phrasebook.phrases"
        :key="`phrasebook-phrase-${phraseIndex}`"
        class="link-unstyled col-sm-12 col-md-6 col-lg-4"
        :to="`/${$l1.code}/${$l2.code}/phrasebook/${phrasebook.id}/${phraseObj.id}/${phraseObj.phrase}`"
      >
        <div
          :class="{
            'rounded p-4 mt-3 mb-3 shadow': true,
            'text-right': $l2.direction === 'rtl',
          }"
        >
          <p>
            <span v-if="phraseObj && phraseObj.pronunciation">
              {{ phraseObj.pronunciation }}
            </span>
          </p>
          <h4
            class="mb-3"
            :data-level="
              phraseObj && phraseObj.level ? phraseObj.level : 'outside'
            "
          >
            {{ phraseObj.phrase }}
          </h4>
          <p class="mb-0" v-if="phraseObj && phraseObj[$l1.code]">
            {{ phraseObj[$l1.code] }}
          </p>
        </div>
      </router-link>
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
  },
  data() {
    return {
      phrasebook: undefined,
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
  methods: {},
};
</script>

<style></style>
