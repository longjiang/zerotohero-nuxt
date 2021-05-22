<template>
  <div class="widget">
    <div class="widget-title">
      {{ $t("Collocations with “{text}”", { text: term }) }}
    </div>
    <div class="widget-body jumbotron-fluid p-4">
      <div class="row">
        <div class="col-sm-12" v-if="sC.length > 0">
          <ul class="list-unstyled mb-4 saved-collocations">
            <li
              v-for="collocation of sC"
              :key="`collocation-${collocation.term}-${collocation.line}`"
              class="mb-2 text-center"
            >
              <SmallStar
                :item="collocation"
                :saved="(collocation) => collocation.saved"
                :save="saveLine"
                :remove="removeSavedLine"
                style="overflow: hidden; margin-right: 1rem; float: right"
              />
              <Annotate tag="span" :checkSaved="false">
                <span
                  v-html="
                    Helper.highlight(
                      collocation.line,
                      word ? word.bare : text,
                      level
                    )
                  "
                  style="font-size: 1.5em"
                />
              </Annotate>
            </li>
          </ul>
          <button
            class="btn-medium btn-secondary text-white mb-5 d-block"
            :data-bg-level="collapsed ? level : false"
            @click="collapsed = !collapsed"
            v-if="sC.length > 0 && sketch && sketch.Gramrels"
            style="margin: 0 auto; transform: translateX(-1.8rem)"
          >
            <span v-if="collapsed">More Collocations</span>

            <span v-else>Hide Other Collocations</span>
          </button>
        </div>
        <div
          class="col-sm-6 col-md-4 col-lg-3"
          v-for="(description, name) in colDesc"
          v-if="
            !collapsed &&
            sketch &&
            sketch.Gramrels &&
            getGramrelsByName(sketch.Gramrels, name)
          "
        >
          <Collocation
            v-if="sketch && sketch.Gramrels"
            class="mb-4"
            :word="word"
            :text="text"
            :level="level"
            :title="colDesc[name]"
            :type="name"
            :id="`collocation-${name}`"
            :collocation="getGramrelsByName(sketch.Gramrels, name)"
          ></Collocation>
        </div>
      </div>
      <div
        v-if="sketch !== undefined && (sketch === false || !sketch.Gramrels)"
      >
        Sorry, we could not find any “{{ term }}” collocations in this corpus
        (dataset). You can set a different corpus in
        <a :href="`/${$l1.code}/${$l2.code}/settings`">Settings</a>
        .
      </div>
      <div class="mt-2">
        {{ $t("Collocations provided by") }}
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
      </div>
    </div>
  </div>
</template>

<script>
import SketchEngine from "@/lib/sketch-engine";
import Helper from "@/lib/helper";
import { mapState } from "vuex";

export default {
  props: {
    word: {
      type: Object,
    },
    text: {
      type: String,
    },
    level: {
      default: "outside",
    },
  },
  data() {
    return {
      colDesc: undefined,
      sketch: undefined,
      collapsed: false,
      updating: false,
      SketchEngine,
      Helper,
    };
  },
  methods: {
    saveLine(collocation) {
      this.$store.dispatch("savedCollocations/add", {
        term: this.term,
        line: collocation.line,
        l2: this.$l2.code,
      });
      collocation.saved = true;
    },
    removeSavedLine(collocation) {
      this.$store.dispatch("savedCollocations/remove", {
        term: this.term,
        line: collocation.line,
        l2: this.$l2.code,
      });
      collocation.saved = false;
    },
    async update() {
      this.updating = true;
      this.colDesc = undefined;
      this.sketch = undefined;
      if (this.sC && this.sC.length > 0) {
        this.collapsed = true;
        this.$emit("collocationsReady");
      }
      this.sketch = await SketchEngine.wsketch({
        term: this.term,
        l2: this.$l2,
      });
      this.colDesc = await SketchEngine.collocationDescription({
        l2: this.$l2,
      });
      if (this.sketch && this.sketch.Gramrels) {
        this.$emit("collocationsReady");
      }
      this.updating = false;
    },
    getGramrelsByName(gramrels, name) {
      return gramrels.find(
        (gram) => gram.name === name && gram.Words && gram.Words.length > 0
      );
    },
  },
  computed: {
    ...mapState("savedCollocations", ["savedCollocations"]),
    sC() {
      return (this.savedCollocations[this.$l2.code] || [])
        .filter((collocation) => collocation.term === this.term)
        .map((collocation) => {
          collocation.saved = true;
          return collocation;
        });
    },
    term() {
      return this.word ? this.word.bare : this.text;
    },
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
    $dictionary() {
      return this.$getDictionary()
    },
    $dictionaryName() {
      return this.$store.state.settings.dictionaryName
    },
    $hanzi() {
      return this.$getHanzi()
    }
  },
  mounted() {
    if (!this.updating) {
      this.update();
    }
  },
  watch: {
    word() {
      if (!this.updating) {
        this.update();
      }
    },
    text() {
      if (this.colDesc) {
        this.update();
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.saved-collocations {
  li {
    border-radius: 0.2rem;
    padding-top: 0.5rem;
    &:hover {
      background: white;
      z-index: 5;
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
      transform: scale(1.05);
      transition: 200ms all ease;
    }
  }
}
</style>