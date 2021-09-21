<template>
  <container-query :query="query" v-model="params">
    <div class="similar-phrases">
      <b-button
        @click="getSimilarPhrases"
        v-if="!autoLoad && showButton"
        size="sm"
        variant="primary"
      >
        {{ $t("Compare Languages") }}
      </b-button>
      <div
        :class="{
          'similar-phrases-list': true,
          'col-sm-12': true,
          'similar-phrases-list-1-col': params.xs,
          'similar-phrases-list-2-cols': params.sm,
          'similar-phrases-list-3-cols': params.md,
          'similar-phrases-list-4-cols': params.lg || params.xl,
        }"
      >
        <div
          v-if="translation && youInOtherLangs.length > 0"
          :class="{
            'text-left': true,
          }"
        >
          <h5>
            <em>{{ translation }}</em>
          </h5>
          <router-link
            v-for="(phrase, index) of youInOtherLangs"
            :to="`/en/${phrase.l2.code}/phrasebook/${phrase.bookId}/${
              phrase.id
            }/${encodeURIComponent(phrase.phrase)}`"
            :key="`you-in-other-langs-${index}`"
            class="d-block link-unstyled text-left"
          >
            <span class="similar-phrase-l2">{{ phrase.phrase }}</span>
            <Speak :text="phrase.phrase" :l2="phrase.l2" />
            <span class="similar-phrase-language">
              <em>{{ phrase.en }}</em>
              in {{ phrase.l2.name }}
            </span>
          </router-link>
        </div>
        <div v-if="vousInOtherLangs.length > 0" class="text-left">
          <h5 class="mt-3">
            <em>{{ phrase }}</em>
          </h5>
          <router-link
            v-for="(phrase, index) of vousInOtherLangs"
            :key="`vous-in-other-langs-${index}`"
            class="d-block link-unstyled text-left"
            :to="`/en/${phrase.l2.code}/phrasebook/${phrase.bookId}/${
              phrase.id
            }/${encodeURIComponent(phrase.phrase)}`"
          >
            <span class="similar-phrase-l2">{{ phrase.phrase }}</span>
            <Speak :text="phrase.phrase" :l2="phrase.l2" />
            <span class="similar-phrase-language">
              <em>{{ phrase.en }}</em>
              in {{ phrase.l2.name }}
            </span>
          </router-link>
        </div>
        <router-link
          v-if="youInOtherLangs.length > 0 || vousInOtherLangs.length > 0"
          class="mt-3 btn btn-primary btn-sm"
          :to="{ name: 'compare-languages', params: { phraseObj, phraseStr } }"
        >
          <i class="fa fa-globe-asia mr-2"></i>
          See them on a Map
        </router-link>
      </div>
      <Loader
        :sticky="true"
        message="Looking for similar phrases in other languages"
        v-if="updating"
      />
      <div
        v-if="
          !showButton &&
          !updating &&
          vousInOtherLangs.length === 0 &&
          youInOtherLangs.length === 0
        "
      >
        No similar phrases found in other languages.
      </div>
    </div>
  </container-query>
</template>

<script>
import Config from "@/lib/config";
import Helper from "@/lib/helper";
import { ContainerQuery } from "vue-container-query";
export default {
  components: {
    ContainerQuery,
  },
  props: {
    phraseObj: {
      type: Object,
    },
    phraseStr: {
      type: String,
    },
    autoLoad: {
      default: false,
    },
    wiktionary: {
      default: true,
    },
  },
  data() {
    return {
      phrase: this.phraseObj ? this.phraseObj.phrase : this.phraseStr,
      translation: this.phraseObj ? this.phraseObj["en"] : undefined,
      allPhrases: [],
      youInOtherLangs: [],
      vousInOtherLangs: [],
      params: {},
      query: {
        xs: {
          minWidth: 0,
          maxWidth: 423,
        },
        sm: {
          minWidth: 423,
          maxWidth: 720,
        },
        md: {
          minWidth: 720,
          maxWidth: 960,
        },
        lg: {
          minWidth: 960,
          maxWidth: 1140,
        },
        xl: {
          minWidth: 1140,
        },
      },
      updating: false,
      loaded: false,
      showButton: true,
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
    $adminMode() {
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
    },
  },
  mounted() {
    if (this.autoLoad) this.getSimilarPhrases();
  },
  methods: {
    async getSimilarPhrases() {
      this.updating = true;
      this.showButton = false;
      let phrasebooks = [];
      if (this.translation) {
        let youInOtherLangs = await this.getYouInOtherLangs(this.translation);
        phrasebooks = phrasebooks.concat(youInOtherLangs);
      }
      if (this.phrase) {
        let vousInOtherLangs = await this.getVousInOtherLangs(this.phrase);
        phrasebooks = phrasebooks.concat(vousInOtherLangs);
      }
      let phrases = this.extractAllPhrases(phrasebooks);
      if (this.wiktionary) {
        let phrasesFromWiktionary = await this.getPhrasesFromWiktionary();
        phrases = phrases.concat(phrasesFromWiktionary);
      }
      this.allPhrases = phrases;
      this.separatePhrases(this.allPhrases);
      this.updating = false;
    },
    async getVousFromWiktionary() {
      let url = `${
        Config.wiki
      }items/wiktionary?filter[word][eq]=${encodeURIComponent(
        this.phrase
      )}&timestamp=${this.$adminMode ? Date.now() : 0}`;
      try {
        let res = await axios.get(url);
        if (res && res.data) {
          console.log(res.data.data);
        }
      } catch (err) {}
    },
    async getYousFromWiktionary(popularLanguagesOnly = false) {
      let popularLanguageFilter =
        "&filter[l2][in]=1824,3479,5980,2645,5644,1943,5332,1540,1916,7731,1167,3481,346,1838,4677,2780,6115,5326,4744,1800,2107,2239,2482,2343,6116,5589,5592,5613,5624,804,4489,4733,4813,1317,1482,1696,821,915,1012,1222,1401,4307,5576,2133,7218,2132,1827,3179,2213,7271,387,4053,6858,3601,3648,3801,6560,6615,2197,2201,2528,2532,2536,2638,2895,6281,6417,2504,2069,2831,7512,1425,4659,5956,6325,6338,6564,1218,2129,2894,1554,2369,2373,6311,1900,5361,5375,7802,1464,2351,4791,272,2601,1417,6112,1855,1857,1860,1864,504";
      let url = `${
        Config.wiki
      }items/wiktionary?filter[definitions][rlike]=${encodeURIComponent(
        this.translation + "%"
      )}${popularLanguagesOnly ? popularLanguageFilter : ""}&limit=500`;
      try {
        let res = await axios.get(url);
        if (res && res.data) {
          let words = res.data.data.map((w) => {
            let l2 = this.$languages.getById(w.l2);
            return {
              l2,
              id: w.id,
              word: w.word,
              definitions: w.definitions
                .split("|")
                .map((d) => d.replace(/\(.*\)/g, "").trim()),
            };
          });
          words = words.filter((w) => {
            w.en = w.definitions.find((d) => d === this.translation);
            return w.en;
          });
          let phrases = words.map((w) => {
            return {
              l2: w.l2,
              id: w.id,
              phrase: w.word,
              en: w.en,
              bookId: "wiktionary",
            };
          });
          return phrases;
        }
      } catch (err) {}
      return [];
    },
    async getPhrasesFromWiktionary() {
      let phrases = [];
      let yousFromWiktionary = await this.getYousFromWiktionary(true);
      if (yousFromWiktionary.length < 50) {
        yousFromWiktionary = yousFromWiktionary.concat(
          await this.getYousFromWiktionary(false)
        );
        yousFromWiktionary = Helper.uniqueByValue(yousFromWiktionary, "id");
      }
      phrases = phrases.concat(yousFromWiktionary);
      return phrases;
    },
    async getPhrasebooksThatContain(term) {
      if (term) {
        // [contains] filter seems to be case INSENSITIVE
        let url = `${
          Config.wiki
        }items/phrasebook?sort=title&filter[phrases][contains]=${encodeURIComponent(
          term
        )}&fields=*,tv_show.*&limit=500&timestamp=${
          this.$adminMode ? Date.now() : 0
        }`;
        let res = await axios.get(url);
        if (res && res.data) {
          return res.data.data;
        }
      }
      return [];
    },
    async getYouInOtherLangs(term) {
      if (term) {
        let phrasebooks = await this.getPhrasebooksThatContain(term + "\r");
        return phrasebooks;
      }
      return [];
    },
    async getVousInOtherLangs(term) {
      if (term) {
        let phrasebooks = await this.getPhrasebooksThatContain("\n" + term);
        return phrasebooks;
      }
      return [];
    },
    extractAllPhrases(phrasebooks) {
      let l1Code = "en";
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
            (phrase.phrase || "").toUpperCase() ===
              (this.phrase || "").toUpperCase() ||
            (phrase[l1Code] || "").toUpperCase() ===
              (this.translation || "").toUpperCase()
          ) {
            phrase.l2 = l2;
            phrases.push(phrase);
          }
        }
      }
      phrases = Helper.uniqueByValues(phrases, ["phrase", "en", "l2"]);
      return phrases;
    },
    separatePhrases(phrases) {
      if (this.translation) {
        this.youInOtherLangs = phrases
          .filter(
            (p) =>
              (p["en"] || "").toUpperCase() ===
              (this.translation || "").toUpperCase()
          )
          .sort((a, b) => a.phrase.localeCompare(b.phrase));
      }
      this.vousInOtherLangs = phrases.filter(
        (p) =>
          (p.phrase || "").toUpperCase() ===
            (this.phrase || "").toUpperCase() &&
          (typeof this.$l2 === "undefined" ||
            p.l2.code !== this.$l2.code ||
            p["en"] !== this.translation)
      );
      this.$emit("youInOtherLangs", this.youInOtherLangs);
      this.$emit("vousInOtherLangs", this.vousInOtherLangs);
    },
  },
};
</script>

<style lang="scss" scoped>
.similar-phrase-l2 {
  font-weight: bold;
  color: #c59f94;
}
.similar-phrases-list {
  &.similar-phrases-list-1-col {
    column-count: 1;
  }
  &.similar-phrases-list-2-cols {
    column-count: 2;
  }
  &.similar-phrases-list-3-cols {
    column-count: 3;
  }
  &.similar-phrases-list-4-cols {
    column-count: 4;
  }
}
</style>