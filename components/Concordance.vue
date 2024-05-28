<template>
  <Widget :key="'concordance-' + concordanceKey">
    <template #title>
      {{ $t("Sentences with “{text}”", { text: term }) }}
    </template>
    <template #body>
      <div class="widget-body jumbotron-fluid p-4">
        <div class="text-center p-5" v-if="updating">
          <Loader :sticky="true" message="Loading sentences..." />
        </div>
        <div v-if="examples && examples.length > 0">
          <ul
            v-if="examples"
            class="collapsed list-unstyled"
            data-collapse-target
          >
            <li
              v-for="(example, index) in examples
                .filter((example) => example.sentences.length > 0)
                .sort((a, b) => a.sentences[0].length - b.sentences[0].length)"
              :key="`example-item-${index}`"
            >
              <Annotate
                tag="div"
                class="pt-2 pb-2"
                :showTranslate="true"
                :checkSaved="false"
                :buttons="true"
              >
                <span
                  v-html="
                    highlightMultiple(
                      example.sentences[0],
                      words,
                      level || 'outside'
                    )
                  "
                />
              </Annotate>
              <div v-if="example.l1">{{ example.l1 }}</div>
              <div v-if="example.ref" class="concordance-ref">
                {{ example.ref }}
              </div>
              <hr />
            </li>
          </ul>
          <ShowMoreButton
            :length="filteredExamples.length"
            :min="7"
            :data-bg-level="level"
          />
        </div>
        <div v-if="!updating && (!examples || examples.length === 0)">
          {{
            $t(
              "Sorry, we could not find any sentences with “{term}” in this corpus.",
              { term }
            )
          }}
          <i18n path="You can set a different corpus in {0}.">
            <router-link :to="{ name: 'settings' }">
              {{ $t("Settings") }}
            </router-link>
          </i18n>
        </div>
        <hr v-if="examples && examples.length === 0" />
        <div class="mt-4">
          {{ $t("Sentences provided by") }}
          <a
            :href="`https://app.sketchengine.eu/#concordance?corpname=${encodeURIComponent(
              $l2Settings.corpname
            )}&tab=basic&keyword=${term}&structs=s%2Cg&refs=%3Ddoc.website&showresults=1&operations=%5B%7B%22name%22%3A%22iquery%22%2C%22arg%22%3A%22${term}%22%2C%22active%22%3Atrue%2C%22query%22%3A%7B%22queryselector%22%3A%22iqueryrow%22%2C%22iquery%22%3A%22${term}%22%7D%2C%22id%22%3A3859%7D%5D`"
            target="_blank"
          >
            <img
              src="/img/logo-sketch-engine.png"
              alt="Sketch Engine"
              class="ml-2 logo-small"
            />
          </a>
          <span v-if="$l2Settings?.corpname">
            {{ $t("Corpus") }}:
            <code>{{ $l2Settings?.corpname.replace("preloaded/", "") }}</code>
          </span>
        </div>
        <hr />
        <div>
          {{ $t("Search for more sentences at") }}
          <a
            :href="`https://tatoeba.org/eng/sentences/search?from=${$l2['iso639-3']}&to=${$l1['iso639-3']}&query=${term}`"
            target="_blank"
          >
            Tatoeba
          </a>
        </div>
      </div>
    </template>
  </Widget>
</template>

<script>
import SketchEngine from "@/lib/sketch-engine";
import { highlightMultiple } from "@/lib/utils";

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
    searchAsPhrase: {
      default: false,
    },
  },
  data() {
    return {
      examples: undefined,
      concordanceKey: 0,
      words: [],
      SketchEngine,
      updating: false,
    };
  },
  computed: {
    term() {
      if (!this.word) return this.text;
      // If this.$l2.code is 'zh', determine if the corpus is traditional or simplified
      const corpname = this.$l2Settings.corpname
      const isChineseTraditional = this.$l2.code === 'zh' && corpname && corpname.includes("trad");
      return isChineseTraditional ? this.word.traditional : this.word.head;
    },
    filteredExamples() {
      return this.examples.filter(
        (example) => example.sentences.length > 0
      );
    },
  },
  watch: {
    word() {
      this.update();
    },
  },
  methods: {
    highlightMultiple(...args) {
      return highlightMultiple(...args);
    },
    async update() {
      // Reset examples
      this.examples = undefined;

      // Get dictionary
      let dictionary = await this.$getDictionary();

      // Get word forms if a word is available
      let forms = this.word ? await this.getWordForms(dictionary) : [];

      // Set words
      this.words = [this.term, ...forms];

      // Get examples
      let examples = await this.getExamples();

      // If no examples, stop updating and return
      if (!examples) {
        this.updating = false;
        return false;
      }

      // Process examples
      for (let example of examples) {
        example.sentences = this.$l2.code === "zh" ? this.processChineseExample(example) : [example.l2];
      }

      // Set examples and stop updating
      this.examples = examples;

      // Emit event if examples are available
      if (this.examples && this.examples.length > 0) {
        this.$emit("concordanceReady");
      }

      // Increment key
      this.concordanceKey += 1;
    },

    async getWordForms(dictionary) {
      let forms = await dictionary.inflect(this.word.head);
      return forms.map((form) => form.form.replace(/'/g, ""));
    },

    async getExamples() {
      // Start updating
      this.updating = true;
      try {
        const result = await SketchEngine.concordance({
          term: this.term,
          searchAsPhrase: this.searchAsPhrase,
          l1: this.$l1,
          l2: this.$l2,
          corpname: this.$l2Settings.corpname,
        });
        return result;
      } catch (error) {
        console.error("An error occurred while fetching the concordance:", error);
        throw error; // re-throw the error if you want to handle it further up the call stack
      } finally {
        this.updating = false;
      }
    },

    processChineseExample(example) {
      let t = example.l2.replace(/([。！？：]+”?)/g, "$1!!!DELIMITER!!!");
      let sentences = t.split("!!!DELIMITER!!!");
      let processedSentences = [];

      for (let sentence of sentences) {
        let found = this.words.some((word) =>
          new RegExp(word.replace(/\*/g, "[^，。！？,!.?]+?")).test(sentence)
        );

        if (found) {
          if (this.$l2.continua) sentence = sentence.replace(/ /g, "");
          processedSentences.push(sentence);
        }
      }

      return processedSentences;
    }
  },
  async mounted() {
    this.update();
  },
};
</script>
<style scoped>
.concordance-ref {
  color: #ccc;
  font-size: 0.8em;
}
</style>