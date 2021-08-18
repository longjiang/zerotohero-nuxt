<template>
  <container-query :query="query" v-model="params">
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
                class="mb-2 p-2"
                style="display: flex"
              >
                <WebImages
                  :text="collocation.line"
                  limit="2"
                  style="flex: 1; margin-right: 2rem"
                />
                <Annotate
                  tag="div"
                  :checkSaved="false"
                  :buttons="true"
                  style="flex: 1"
                >
                  <span
                    v-html="
                      highlight(
                        collocation.line,
                        word ? word.bare : text,
                        level
                      )
                    "
                    style="font-size: 1.2em"
                  />
                </Annotate>
                <SmallStar
                  :item="collocation"
                  :saved="(collocation) => collocation.saved"
                  :save="saveLine"
                  :remove="removeSavedLine"
                  style="
                    overflow: hidden;
                    margin-left: 0.5rem;
                    margin-right: 1rem;
                    float: right;
                  "
                />
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
        </div>
        <div class="row" v-if="sketch && sketch.Gramrels">
          <div
            v-for="(description, index) in colDescArray"
            :class="{
              'col-12': params.xs,
              'col-6': params.sm,
              'col-4': params.md,
              'col-3': params.lg,
            }"
            :key="`collocations-${index}`"
          >
            <Collocation
              class="mb-4"
              :word="word"
              :text="text"
              :level="level"
              :title="description.title"
              :type="description.name"
              :id="`collocation-${description.name}`"
              :collocation="description.gramrel"
            ></Collocation>
          </div>
        </div>
        <div
          v-if="
            !updating &&
            (!sketch || !sketch.Gramrels || sketch.Gramrels.length === 0)
          "
        >
          Sorry, we could not find any “{{ term }}” collocations in this corpus
          (dataset). You can set a different corpus in
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
            Corpus:
            <code>{{ corpname.replace("preloaded/", "") }}</code>
          </span>
        </div>
      </div>
    </div>
  </container-query>
</template>

<script>
import SketchEngine from "@/lib/sketch-engine";
import Helper from "@/lib/helper";
import { mapState } from "vuex";
import { ContainerQuery } from "vue-container-query";

export default {
  components: {
    ContainerQuery,
  },
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
      corpname: undefined,
      collapsed: false,
      updating: false,
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
    };
  },
  computed: {
    ...mapState("savedCollocations", ["savedCollocations"]),
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
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
    $dictionary() {
      return this.$getDictionary();
    },
    $dictionaryName() {
      return this.$store.state.settings.dictionaryName;
    },
    $hanzi() {
      return this.$getHanzi();
    },
    colDescArray() {
      let colDescArray = [];
      for (let name in this.colDesc) {
        let title = this.colDesc[name];
        let description = {
          title,
          name,
          gramrel: this.getGramrelsByName(this.sketch.Gramrels, name),
        };
        colDescArray.push(description);
      }
      colDescArray = colDescArray.filter((d) => d.gramrel);
      return colDescArray;
    },
  },
  async mounted() {
    if (!this.updating) {
      this.update();
    }
    this.corpname = await SketchEngine.corpname(this.$l2);
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

  methods: {
    highlight() {
      return Helper.highlight(...arguments);
    },
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

      let sketch = await SketchEngine.wsketch({
        term: this.term,
        l2: this.$l2,
      });

      if (sketch && sketch.Gramrels && sketch.Gramrels.length > 0) {
        let colDesc = {};
        for (let g of sketch.Gramrels) {
          colDesc[g.name] = g.name.replace("%w", "{word}");
        }
        this.sketch = sketch;
        this.colDesc = colDesc;
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
};
</script>
<style scoped>
.saved-collocations >>> .image-wall {
  flex-wrap: nowrap;
  max-width: 100%;
  overflow: hidden;
}
.saved-collocations >>> .image-wall-image {
  height: 4rem;
  max-width: 8rem;
}

.saved-collocations li {
  border-radius: 0.2rem;
  padding-top: 0.5rem;
}

.saved-collocations li:hover {
  background: white;
  z-index: 5;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
  transform: scale(1.05);
  transition: 200ms all ease;
}
</style>