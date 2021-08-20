<template>
  <div>
    <div v-if="youInOtherLangs">
      <h5>Say “{{ phraseObj[$l1.code] }}” in other languages</h5>
      <router-link
        v-for="(phrase, index) of youInOtherLangs"
        :to="`/${$l1.code}/${phrase.l2.code}/phrasebook/${phrase.bookId}/${
          phrase.id
        }/${encodeURIComponent(phrase.phrase)}`"
        :key="`you-in-other-langs-${index}`"
        class="d-block link-unstyled text-left"
      >
        <span class="similar-phrase-l2">{{ phrase.phrase }}</span>
        <span class="similar-phrase-language">— {{ phrase.l2.name }}</span>
      </router-link>
    </div>
    <div v-if="vousInOtherLangs">
      <h5 class="mt-3"><em>{{ phraseObj.phrase }}</em> in other languages</h5>
      <router-link
        v-for="(phrase, index) of vousInOtherLangs"
        :key="`vous-in-other-langs-${index}`"
        class="d-block link-unstyled text-left"
        :to="`/${$l1.code}/${phrase.l2.code}/phrasebook/${phrase.bookId}/${
          phrase.id
        }/${encodeURIComponent(phrase.phrase)}`"
      >
        <em class="similar-phrase-l2">{{ phrase.phrase }}</em>
        <span class="similar-phrase-language"> – “{{ phrase[$l1.code] }}” in {{ phrase.l2.name }}</span>
      </router-link>
    </div>
  </div>
</template>

<script>
import Config from "@/lib/config";
import Helper from "@/lib/helper";
export default {
  props: {
    phraseObj: {
      type: Object,
    },
  },
  data: () => ({
    allPhrases: undefined,
    youInOtherLangs: undefined,
    vousInOtherLangs: undefined,
    youInSameLang: undefined,
  }),
  computed: {
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
    $adminMode() {
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
    },
  },
  mounted() {
    this.getSimilarPhrases();
  },
  methods: {
    async f() {
      let l1Code = this.$l1.code;
      let url = `${
        Config.wiki
      }items/phrasebook?sort=title&filter[phrases][contains]=${encodeURIComponent(
        this.phraseObj[l1Code] + "\r"
      )}&fields=*,tv_show.*&limit=500&timestamp=${
        this.$adminMode ? Date.now() : 0
      }`;
      let res = await axios.get(url);
      if (res && res.data) {
        return res.data.data;
      }
      return [];
    },
    async g() {
      let url = `${
        Config.wiki
      }items/phrasebook?sort=title&filter[phrases][contains]=${encodeURIComponent(
        "\n" + this.phraseObj.phrase
      )}&fields=*,tv_show.*&limit=500&timestamp=${
        this.$adminMode ? Date.now() : 0
      }`;
      let res = await axios.get(url);
      if (res && res.data) {
        return res.data.data;
      }
      return [];
    },
    h(phrasebooks) {
      let l1Code = this.$l1.code;
      phrasebooks = Helper.uniqueByValue(phrasebooks, "id");
      let phrases = [];
      for (let phrasebook of phrasebooks) {
        let l2 = this.$languages.getById(phrasebook.l2.id);
        phrasebook.phrases = Papa.parse(phrasebook.phrases, {
          header: true,
        }).data.map((p, id) => {
          p.id = id;
          p.bookId = phrasebook.id;
          return p;
        });
        for (let phrase of phrasebook.phrases) {
          if (
            phrase.phrase === this.phraseObj.phrase ||
            phrase[l1Code] === this.phraseObj[l1Code]
          ) {
            phrase.l2 = l2;
            phrases.push(phrase);
          }
        }
      }
      phrases = Helper.uniqueByValues(phrases, ["phrase", this.$l1.code, "l2"]);
      return phrases;
    },
    separatePhrases(phrases) {
      let l1Code = this.$l1.code;
      this.youInOtherLangs = phrases
        .filter((p) => p[l1Code] === this.phraseObj[l1Code])
        .sort((a, b) => a.phrase.localeCompare(b.phrase));
      this.vousInOtherLangs = phrases.filter(
        (p) => p.phrase === this.phraseObj.phrase
      );
    },
    async getSimilarPhrases() {
      let phrasebooks = [].concat(await this.f()).concat(await this.g());
      this.allPhrases = this.h(phrasebooks);
      this.separatePhrases(this.allPhrases);
    },
  },
};
</script>

<style lang="scss" scoped>
.similar-phrase-l2 {
  font-weight: bold;
  color: #c59f94;
}
.similar-phrase-language {
}
</style>