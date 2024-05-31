<template>
  <Widget class="widget" :key="'collocations-' + collocationsKey">
    <template #title>
      {{ $t('Collocations with “{term}” and “{compareTerm}”',  {term, compareTerm}) }}
    </template>
    <template #body>
      <div class="text-center p-5" v-if="updating">
        <Loader :sticky="true" message="Loading collocations..." />
      </div>
      <div
        class="row"
        v-for="(description, name) in filteredColDesc"
        :key="`collocation-${name}-${term}-${compareTerm}`"
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
        v-if="
          !updating &&
          (!aSketch || !aSketch.Gramrels || aSketch.Gramrels.length === 0) &&
          (!bSketch || !bSketch.Gramrels || bSketch.Gramrels.length === 0)
        "
      >
        {{
          $t(
            "Sorry, we could not find any collocations with “{term}” in this corpus.",
            { term: `${term}”, “${compareTerm}` }
          )
        }}
        <i18n path="You can set a different corpus in {0}.">
          <router-link :to="{ name: 'settings' }">
            {{ $t("Settings") }}
          </router-link>
        </i18n>
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
import SketchEngine from "../lib/sketch-engine";
import { uniqueByValue } from "../lib/utils/array";

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
      colDesc: {},
      collocationsKey: 0,
      updating: false,
    };
  },
  computed: {
    corpname() {
      return this.$l2Settings?.corpname
    },
    filteredColDesc() {
      return Object.entries(this.colDesc).filter(([name, description]) => {
        const aSketchValid = this.aSketch && this.aSketch.Gramrels && this.getGramrelsByName(this.aSketch.Gramrels, name) && this.getGramrelsByName(this.aSketch.Gramrels, name).Words.length > 0;
        const bSketchValid = this.bSketch && this.bSketch.Gramrels && this.getGramrelsByName(this.bSketch.Gramrels, name) && this.getGramrelsByName(this.bSketch.Gramrels, name).Words.length > 0;
        return aSketchValid || bSketchValid;
      }).reduce((acc, [name, description]) => ({ ...acc, [name]: description }), {});
    },
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
    // Check if this.colDesc is empty
    if (!Object.keys(this.colDesc).length) {
      this.update();
    }
  },
  methods: {
    async update() {
      this.updating = true;

      try {
        const [aSketch, bSketch] = await Promise.all([
          SketchEngine.wsketch({
            term: this.term,
            l2: this.$l2,
            corpname: this.corpname,
          }),
          SketchEngine.wsketch({
            term: this.compareTerm,
            l2: this.$l2,
            corpname: this.corpname,
          }),
        ]);

        this.aSketch = aSketch;
        this.bSketch = bSketch;

        if (this.aSketch && this.bSketch) {
          const combinedGramrels = [...(this.aSketch.Gramrels || []), ...(this.bSketch.Gramrels || [])];
          const uniqueGramrels = uniqueByValue(combinedGramrels, "name");

          this.colDesc = uniqueGramrels.reduce((colDesc, g) => {
            colDesc[g.name] = g.name.replace("%w", "{word}");
            return colDesc;
          }, {});

          this.collocationsKey += 1;
        }
      } catch (error) {
        console.error(error);
      } finally {
        this.updating = false;
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
