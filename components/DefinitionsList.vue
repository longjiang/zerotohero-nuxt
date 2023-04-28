<template>
  <div class="definitions-list" style="max-width: 50rem; margin: 0 auto">
    <template v-if="augmentedDefinitions.length > 0">
      <ol
        :class="{
          'definitions mb-2': true,
          single: singleColumn,
          'definitions-many':
            alwaysShowAsList || augmentedDefinitions.length > 3,
        }"
      >
        <li
          v-for="(definition, index) in augmentedDefinitions"
          :key="`definition-${index}`"
          class="definition-list-item"
        >
          <span
            class="word-type mt-3"
            v-if="showPOS && index === 0 && entry && entry.pos"
          >
            {{
              entry.gender
                ? { m: "masculine", f: "feminine", n: "neuter" }[entry.gender]
                : ""
            }}
            {{ entry.pos }}
            {{
              entry.heads && entry.heads[0] && entry.heads[0][1]
                ? entry.heads[0][1]
                : ""
            }}:
          </span>
          <v-runtime-template :template="`<span>${definition.html}</span>`" />
          <span
            v-if="
              !alwaysShowAsList &&
              augmentedDefinitions.length < 4 &&
              index < augmentedDefinitions.length - 1
            "
          >
            ;
          </span>
        </li>
      </ol>
    </template>
    <template v-else>
      <div class="l1">{{ nodef }}</div>
    </template>
  </div>
</template>

<script>
import VRuntimeTemplate from "v-runtime-template";
import Helper from "@/lib/helper";

export default {
  components: {
    VRuntimeTemplate,
  },
  props: {
    entry: Object,
    definitions: Array,
    singleColumn: false,
    showPOS: true,
    alwaysShowAsList: false,
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
    let augmentedDefinitions = this.definitions;
    // augmentedDefinitions = this.parseCircleNumbersInDefinitions(augmentedDefinitions)
    augmentedDefinitions = await Promise.all(
      Helper.unique(augmentedDefinitions).map(async (definition) => {
        if (typeof definition === "string") definition = { text: definition };
        definition.html = await this.definitionHtml(definition.text);
        return definition;
      })
    );
    this.augmentedDefinitions = augmentedDefinitions;
  },
  methods: {
    async getWord(term) {
      const dictionary = await this.$getDictionary();
      let words = dictionary.lookupMultiple(term, true);
      if (words && words.length > 0) {
        return words[0];
      }
    },
    async definitionHtml(text) {
      let lemma, stringBefore, stringAfter;
      if (this.$dictionaryName === "hsk-cedict") {
        let m = text.match(/(.*?)([^\s]+?)\|([^\s]+?)\[(.+?)\](.*?)/);
        if (!m) m = text.match(/(.*?)([^\s]+?)\[(.+?)\](.*?)/);
        if (m) {
          stringBefore = m[1];
          lemma = m[2].replace(/\u200e/g, ""); // Left-to-Right Mark
          stringAfter = m[m.length - 1];
        }
      } else {
        if (this.$l2.code !== "en") {
          let m = text.match(/(.* of )([^\s]+)(.*)/);
          if (m) {
            stringBefore = m[1];
            lemma = m[2].replace(/\u200e/g, ""); // Left-to-Right Mark
            stringAfter = m[3];
          }
        }
      }
      if (lemma) {
        let lemmaWord = await this.getWord(lemma);
        if (lemmaWord) {
          return `${stringBefore}<router-link data-level="${
            lemmaWord.level || "outside"
          }" to="/${this.$l1.code}/${this.$l2.code}/dictionary/${
            this.$dictionaryName
          }/${lemmaWord.id}">${lemma}</router-link>${stringAfter}`;
        }
      }
      return text;
    },
  },
};
</script>

<style lang="scss">
.definitions {
  padding-left: 0;
  list-style: none;

  .definition-list-item {
    display: inline;
  }
  &.definitions-many {
    list-style: decimal;
    .definition-list-item {
      text-align: left;
      display: list-item;
      .definition-list-item-separator {
        display: none;
      }
    }
  }
}
@media (min-width: 768px) {
  .definitions-many {
    text-align: left;
    display: inline-block;
    &:not(.single) {
      columns: 2;
      column-gap: 3rem;
    }
  }
}
</style>
