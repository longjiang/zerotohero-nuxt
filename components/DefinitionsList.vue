<template>
  <div class="definitions-list" style="max-width: 50rem; margin: 0 auto">
    <template v-if="augmentedDefinitions.length > 0">
      <ul class="definitions mb-2 list-unstyled">
        <li
          v-for="(definition, index) in augmentedDefinitions"
          :key="`definition-${index}`"
          class="definition-list-item"
        >
          <v-runtime-template :template="`<span>${definition.html}</span>`" /><span v-if="index < augmentedDefinitions.length - 1">; </span>
        </li>
      </ul>
    </template>
    <template v-else>
      <div class="l1">{{ nodef }}</div>
    </template>
  </div>
</template>

<script>
import VRuntimeTemplate from "v-runtime-template";
export default {
  components: {
    VRuntimeTemplate
  },
  props: {
    definitions: Array,
    nodef: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      augmentedDefinitions: [],
    };
  },
  async mounted() {
    let augmentedDefinitions = [];
    for (let definition of this.definitions) {
      if (typeof definition === "string") definition = { text: definition };
      definition.html = await this.definitionHtml(definition.text);
      augmentedDefinitions.push(definition);
    }
    console.log(augmentedDefinitions);
    this.augmentedDefinitions = augmentedDefinitions;
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
    $dictionaryName() {
      return this.$store.state.settings.dictionaryName;
    },
  },
  methods: {
    async getWord(term) {
      let words = await (
        await this.$getDictionary()
      ).lookupMultiple(term, true);
      if (words && words.length > 0) {
        return words[0];
      }
    },
    async definitionHtml(text) {
      let m = text.match(/(.* of )([^\s]+)(.*)/);
      if (m) {
        let stringBefore = m[1];
        let lemma = m[2].replace(/\u200e/g, ""); // Left-to-Right Mark
        let stringAfter = m[3];
        let lemmaWord = await this.getWord(lemma);
        if (lemmaWord) {
          return `${stringBefore}<router-link to="/${this.$l1.code}/${this.$l2.code}/dictionary/${this.$dictionaryName}/${lemmaWord.id}">${lemma}</router-link>${stringAfter}`;
        } else {
          return text;
        }
      } else {
        return text;
      }
    },
  },
};
</script>

<style lang="scss">
.definition-list-item {
  display: inline;
  font-size: 1.1rem;
  font-style: italic;
}
</style>
