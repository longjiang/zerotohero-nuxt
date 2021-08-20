<template>
  <div>
    <div v-if="phrases">
      <h5>“{{ phraseObj[$l1.code] }}” in other languages</h5>
      <div
        v-for="(phrase, index) of phrases"
        :key="`similar-pharse-${index}`"
        class="text-left"
      >
        <span class="similar-phrase-l2">{{ phrase.phrase }}</span>
        <span class="similar-phrase-language">— {{ phrase.l2.name }}</span>
      </div>
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
    phrases: undefined,
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
    async getSimilarPhrases() {
      let phrasebooks = [];
      let l1Code = this.$l1.code;
      let url = `${
        Config.wiki
      }items/phrasebook?sort=title&filter[phrases][contains]=${encodeURIComponent(
        "," + this.phraseObj[l1Code] + "\r"
      )}&fields=*,tv_show.*&limit=500&timestamp=${
        this.$adminMode ? Date.now() : 0
      }`;
      let res = await axios.get(url);
      if (res && res.data) {
        phrasebooks = phrasebooks.concat(res.data.data);
      }
      url = `${
        Config.wiki
      }items/phrasebook?sort=title&filter[phrases][contains]=${encodeURIComponent(
        "\n" + this.phraseObj.phrase + ","
      )}&fields=*,tv_show.*&limit=500&timestamp=${
        this.$adminMode ? Date.now() : 0
      }`;
      res = await axios.get(url);
      if (res && res.data) {
        phrasebooks = phrasebooks.concat(res.data.data);
      }
      phrasebooks = Helper.uniqueByValue(phrasebooks, "id");
      let phrases = [];
      for (let phrasebook of phrasebooks) {
        let l2 = this.$languages.getById(phrasebook.l2.id);
        phrasebook.phrases = Papa.parse(phrasebook.phrases, {
          header: true,
        }).data.map((p, id) => {
          p.id = id;
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
      this.phrases = phrases
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