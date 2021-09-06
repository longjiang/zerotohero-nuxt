<template>
  <container-query :query="query" v-model="params">
    <div class="similar-phrases">
      <b-button
        @click="getSimilarPhrases"
        v-if="!autoLoad && showButton"
        size="sm"
        variant="gray"
      >
        Compare Languages
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
      this.allPhrases = this.extractAllPhrases(phrasebooks);
      this.separatePhrases(this.allPhrases);
      this.updating = false;
    },
    async getYouInOtherLangs(term) {
      if (term) {
        let url = `${
          Config.wiki
        }items/phrasebook?sort=title&filter[phrases][contains]=${encodeURIComponent(
          term + "\r"
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
    async getVousInOtherLangs(term) {
      let url = `${
        Config.wiki
      }items/phrasebook?sort=title&filter[phrases][contains]=${encodeURIComponent(
        "\n" + term
      )}&fields=*,tv_show.*&limit=500&timestamp=${
        this.$adminMode ? Date.now() : 0
      }`;
      let res = await axios.get(url);
      if (res && res.data) {
        return res.data.data;
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
            phrase.phrase === this.phrase ||
            phrase[l1Code] === this.translation
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