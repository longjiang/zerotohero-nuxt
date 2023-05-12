<template>
  <Widget class="widget" :key="'collocations-' + collocationsKey">
    <template #title>
      {{ $t('Collocations with “{term}” and “{compareTerm}”',  {term, compareTerm}) }}
    </template>
    <template #body>
      <div
        class="row"
        v-for="(description, name) in colDesc"
        :key="`collocation-${name}-${term}-${compareTerm}`"
        v-if="
          (aSketch &&
            aSketch.Gramrels &&
            getGramrelsByName(aSketch.Gramrels, name) &&
            getGramrelsByName(aSketch.Gramrels, name).Words.length > 0) ||
          (bSketch &&
            bSketch.Gramrels &&
            getGramrelsByName(bSketch.Gramrels, name) &&
            getGramrelsByName(bSketch.Gramrels, name).Words.length > 0)
        "
      >
        <div class="col-sm-6 mb-5">
          <Collocation
            :text="term"
            :level="level"
            :title="colDesc[name]"
            :type="name"
            :key="`collocation-${compareTerm}-${name}`"
            :collocation="
              aSketch && aSketch.Gramrels
                ? getGramrelsByName(aSketch.Gramrels, name)
                : undefined
            "
          ></Collocation>
        </div>
        <div class="col-sm-6 mb-5">
          <Collocation
            :text="compareTerm"
            :level="compareLevel"
            :title="colDesc[name]"
            :type="name"
            :key="`collocation-${compareTerm}-${name}`"
            :collocation="
              bSketch && bSketch.Gramrels
                ? getGramrelsByName(bSketch.Gramrels, name)
                : undefined
            "
          ></Collocation>
        </div>
      </div>
      <div
        v-if="!aSketch || !bSketch || !aSketch.Gramrels || !bSketch.Gramrels"
      >
        Sorry, we could not find matching collocations for both words in this
        corpus (dataset). You can set a different corpus in
        <router-link :to="`/${$l1.code}/${$l2.code}/settings`">
          Settings
        </router-link>
        .
      </div>
      <div class="mt-2">
        {{ $t("Collocations provided by") }}
        <a
          target="_blank"
          :href="`https://app.sketchengine.eu/#wordsketch?corpname=${encodeURIComponent(
            corpname
          )}&tab=basic&lemma=${term}&showresults=1`"
        >
          <img
            src="/img/logo-sketch-engine.png"
            alt="Sketch Engine"
            class="ml-2 mr-2 logo-small"
          />
        </a>
        <span v-if="corpname">
          {{ $t("Corpus") }}:
          <code>{{ corpname.replace("preloaded/", "") }}</code>
        </span>
      </div>
    </template>
  </Widget>
</template>

<script>
import Collocation from "@/components/Collocation.vue";
import SketchEngine from "@/lib/sketch-engine";
import { uniqueByValue } from "@/lib/utils/array";

export default {
  props: {
    term: "",
    compareTerm: "",
    level: undefined,
    compareLevel: undefined,
  },
  components: {
    Collocation,
  },
  data() {
    return {
      aSketch: undefined,
      bSketch: undefined,
      SketchEngine,
      colDesc: undefined,
      collocationsKey: 0,
      corpname: undefined,
    };
  },
  watch: {
    term() {
      this.update();
    },
    compareTerm() {
      this.update();
    },
  },
  async mounted() {
    if (!this.colDesc) {
      this.update();
    }
    this.corpname = await SketchEngine.corpname(this.$l2);
  },
  methods: {
    async update() {
      this.aSketch = await SketchEngine.wsketch({
        term: this.term,
        l2: this.$l2,
      });
      this.bSketch = await SketchEngine.wsketch({
        term: this.compareTerm,
        l2: this.$l2,
      });
      let colDesc = {};
      if (this.aSketch && this.bSketch) {
        for (let g of uniqueByValue(
          (this.aSketch.Gramrels || []).concat(this.bSketch.Gramrels || []),
          "name"
        )) {
          colDesc[g.name] = g.name.replace("%w", "{word}");
        }
        this.colDesc = colDesc;
        this.collocationsKey += 1;
      }
    },
    getGramrelsByName(gramrels, name) {
      return gramrels.find(
        (gram) => gram.name === name && gram.Words && gram.Words.length > 0
      );
    },
  },
};
</script>
