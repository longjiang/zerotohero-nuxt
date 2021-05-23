<template>
  <div class="widget" :key="'collocations-' + collocationsKey">
    <div class="widget-title">
      Collocations with “{{ term }}” and “{{ compareTerm }}”
    </div>
    <div class="jumbotron-fluid p-4">
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
        <a :href="`/${$l1.code}/${$l2.code}/settings`">Settings</a>.
      </div>
      <div class="mt-2">
        Collocations provided by
        <a
          target="_blank"
          :href="`https://app.sketchengine.eu/#wordsketch?corpname=${encodeURIComponent(
            SketchEngine.corpname
          )}&tab=basic&lemma=${term}&showresults=1`"
        >
          <img
            src="/img/logo-sketch-engine.png"
            alt="Sketch Engine"
            class="ml-2 logo-small"
          />
        </a>
        <br />
        Don't like the collocations? Choose a different corpus (dataset) in
        <a :href="`/${$l1.code}/${$l2.code}/settings`">Settings</a>.
      </div>
    </div>
  </div>
</template>

<script>
import Collocation from '@/components/Collocation.vue'
import SketchEngine from '@/lib/sketch-engine'

export default {
  props: {
    term: '',
    compareTerm: '',
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
    async update() {
      this.colDesc = await SketchEngine.collocationDescription({ l2: this.$l2 })
      this.aSketch = await SketchEngine.wsketch({
        term: this.term,
        l2: this.$l2,
      })
      this.bSketch = await SketchEngine.wsketch({
        term: this.compareTerm,
        l2: this.$l2,
      })
      this.collocationsKey += 1
    },
    getGramrelsByName(gramrels, name) {
      return gramrels.find(
        (gram) => gram.name === name && gram.Words && gram.Words.length > 0
      )
    },
  },
  watch: {
    term() {
      this.update()
    },
    compareTerm() {
      this.update()
    },
  },
  mounted() {
    if (!this.colDesc) {
      this.update()
    }
  },
}
</script>
