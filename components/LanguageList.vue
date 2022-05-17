<template>
  <container-query :query="query" v-model="params">
    <div>
      <ul v-if="languages && languages.length > 0" :class="classes">
        <LanguageListItem
          v-for="(language, index) in languages"
          :key="`lang-${language.code}-${index}`"
          :showFlags="showFlags"
          :showFeatures="showFeatures"
          :variant="variant"
          :showSpeakers="showSpeakers"
          :language="language"
        />
      </ul>
    </div>
  </container-query>
</template>

<script>
import Helper from "@/lib/helper";
import { ContainerQuery } from "vue-container-query";


export default {
  components: {
    ContainerQuery
  },
  props: {
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
    l1: {
      default: "en",
    },
    showFlags: {
      default: false,
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
        "language-list-1-col": this.params.xs,
        "language-list-2-cols": this.params.sm || this.params.md,
        "language-list-3-cols": this.params.lg,
        "language-list-4-cols": this.params.xl,
      };
      classes[`language-list-${this.skin}`] = true;
      classes[`language-list-${this.variant}`] = true;
      return classes;
    },
    languages() {
      let languages;
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
      } else if (this.langs) {
        languages = this.langs.filter((l) => l);
      }
      if (!languages && this.codes && this.$languages) {
        languages = this.codes
          .map((c) => this.$languages.getSmart(c))
          .filter((l) => l);
      }
      if (this.sort && languages) {
        languages = Helper.uniqueByValue(languages, "iso639-3").sort((a, b) =>
          this.languageName(a).localeCompare(this.languageName(b), "en")
        );
      }
      languages = languages.filter((l) => !this.hide.includes(l.code));
      return languages;
    },
  },
  methods: {
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
a:hover,
a:active {
  text-decoration: none;
}

.flag-icon {
  margin-bottom: 0.15rem;
}

.language-list {
  list-style: none;
  padding: 0;
  column-gap: 2rem;
  margin-bottom: 0;
  .language-list-item {
    .language-list-item-speakers {
      font-size: 0.8em;
      white-space: nowrap;
      margin-left: 0.25rem;
    }
  }

  &.language-list-light {
    .language-list-item {
      a {
        color: hsla(14deg 98% 10% / 80%);
      }
      .feature-icon {
        color: hsla(14deg 98% 10% / 60%);
      }
      .language-list-item-speakers {
        color: hsla(14deg 98% 10% / 40%);
      }
    }
  }
  &.language-list-dark {
    .language-list-item {
      a {
        color: rgba(255, 255, 255, 0.8);
      }
      .feature-icon {
        color: rgba(255, 255, 255, 0.6);
      }
      .language-list-item-speakers {
        color: rgba(255, 255, 255, 0.4);
      }
    }
  }
  &.language-list-icon {
    .language-list-item {
      display: table;
      width: 100%;
      .language-list-item-name {
        display: table-header-group;
      }
      .language-list-item-features {
        display: table-footer-group;
        line-height: 0.8;
        .feature-icon {
          font-size: 0.8em;
          &.transparent {
            display: none;
          }
        }
        .language-list-item-speakers {
          margin: 0;
        }
      }
    }
  }
}

.language-list:not(.language-list-single-column) {
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