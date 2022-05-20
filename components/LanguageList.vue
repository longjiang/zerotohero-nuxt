<template>
  <container-query :query="query" v-model="params">
    <div>
      <div v-if="languages && languages.length > 0" :class="classes">
        <div class="container" v-if="variant === 'grid'">
          <div class="row">
            <div
              v-for="(language, index) in languages"
              :key="`lang-${language.code}-${index}`"
              :class="`${
                params.xs
                  ? 'col-4'
                  : params.sm
                  ? 'col-3'
                  : params.md
                  ? 'col-3'
                  : params.lg
                  ? 'col-2'
                  : 'col-2'
              } mb-1 p-1 language-list-column`"
            >
              <LanguageListItem
                :showFlags="showFlags"
                :showFeatures="showFeatures"
                :variant="variant"
                :showSpeakers="showSpeakers"
                :language="language"
                :showCode="showCode"
              />
            </div>
          </div>
        </div>
        <div v-else>
          <LanguageListItem
            v-for="(language, index) in languages"
            :key="`lang-${language.code}-${index}`"
            :showFlags="showFlags"
            :showFeatures="showFeatures"
            :variant="variant"
            :showSpeakers="showSpeakers"
            :language="language"
            :showCode="showCode"
          />
        </div>
      </div>
    </div>
  </container-query>
</template>

<script>
import Helper from "@/lib/helper";
import { ContainerQuery } from "vue-container-query";

export default {
  components: {
    ContainerQuery,
  },
  props: {
    l1: {
      default: "en",
    },
    showFlags: {
      default: false,
    },
    showFeatures: {
      default: true,
    },
    langs: {
      default: undefined,
    },
    codes: {
      default: undefined,
    },
    sort: {
      default: false,
    },
    keyword: {
      type: String,
    },
    singleColumn: {
      default: false,
    },
    showSpeakers: {
      type: Boolean,
      default: true,
    },
    showCode: {
      default: false,
    },
    skin: {
      default: "light",
    },
    variant: {
      type: String,
      default: "list", // or 'icon', 'grid'
    },
  },
  data() {
    return {
      specials: Helper.specialLanguages,
      hide: ["cmn"],
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
    classes() {
      let classes = {
        "language-list": true,
        "language-list-single-column": this.singleColumn || this.keyword,
        "language-list-1-col": this.variant === "list" && this.params.xs,
        "language-list-2-cols":
          this.variant === "list" && (this.params.sm || this.params.md),
        "language-list-3-cols": this.variant === "list" && this.params.lg,
        "language-list-4-cols": this.variant === "list" && this.params.xl,
      };
      classes[`language-list-${this.skin}`] = true;
      classes[`language-list-${this.variant}`] = true;
      return classes;
    },
    languages() {
      let languages = [];
      languages = this.langs
        ? this.langs
        : this.codes
        ? this.mapCodes(this.codes)
        : this.$languages.l1s;

      if (this.keyword && this.keyword !== "") {
        let keyword = this.keyword.toLowerCase();
        languages = this.$languages.l1s.filter(
          (l) =>
            l.name.toLowerCase().includes(keyword) ||
            (l.otherNames
              ? l.otherNames.join(" ").toLowerCase().includes(keyword)
              : false) ||
            l["iso639-3"].includes(keyword) ||
            l["iso639-1"].includes(keyword)
        );
      }
      languages = languages.filter((l) => l && !this.hide.includes(l.code));
      if (this.sort && languages) {
        languages = Helper.uniqueByValue(languages, "iso639-3").sort((a, b) =>
          this.languageName(a).localeCompare(this.languageName(b), "en")
        );
      }
      return languages;
    },
  },
  methods: {
    mapCodes(codes) {
      return codes.map((c) => this.$languages.getSmart(c)).filter((l) => l);
    },
    languageName(language) {
      let name = language.name.replace(/ \(.*\)/gi, "");
      let special = this.specials[language.code];
      if (special) name = special.name;
      return name;
    },
  },
};
</script>

<style lang="scss" scoped>
.language-list {
  list-style: none;
  padding: 0;
  column-gap: 2rem;
  margin-bottom: 0;
}

.language-list.language-list-list:not(.language-list-single-column) {
  &.language-list-1-col {
    column-count: 1;
  }
  &.language-list-2-cols {
    column-count: 2;
  }
  &.language-list-3-cols {
    column-count: 3;
  }
  &.language-list-4-cols {
    column-count: 4;
  }
}
</style>