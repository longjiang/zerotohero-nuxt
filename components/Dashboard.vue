<template>
  <container-query :query="query" v-model="params">
    <div class="container">
      <div class="row">
        <div
          :class="{
            'col-sm-4': params.md || params.lg || params.xl,
            'col-sm-6': params.sm,
            'col-sm-12': params.xs,
          }"
          v-for="l2Progress in sortedProgress"
          :key="`language-overview-item-${l2Progress.language.code}`"
        > 
          <router-link
            class="language-overview-item"
            v-if="l2Progress.language && l2Progress.language.name"
            :to="to(l2Progress.language)"
          >
            <div class="language-flag-wrapper">
              <LanguageFlag :language="l2Progress.language" :autocycle="true" />
              <span class="language-name">{{ translate(l2Progress.language.name, browserLanguage) }}</span>
            </div>
            <LanguageProgress
              :l1="$languages.getSmart(getL1Code(l2Progress.language))"
              :l2="l2Progress.language"
            />
          </router-link>
        </div>
      </div>
    </div>
  </container-query>
</template>

<script>
import { ContainerQuery } from "vue-container-query";
import { mapState } from "vuex";
import SPECIAL_LANGUAGES from "@/lib/utils/special-languages";
import { LANGS_WITH_CONTENT } from "@/lib/utils/servers";

export default {
  components: {
    ContainerQuery,
  },
  props: {},
  data() {
    return {
      params: {},
      specials: SPECIAL_LANGUAGES,
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
    ...mapState("progress", ["progress"]),
    sortedProgress() {
      let sorted = Object.keys(this.progress)
        .map((l2Code) => {
          let language = this.$languages.getSmart(l2Code)
          let l2Progress = Object.assign({ language }, this.progress[l2Code]);
          return l2Progress;
        })
        .filter((item) => item && item.language && item.language.code && item.language.name && item.time !== undefined);
      sorted = sorted
        .sort((a, b) => b.time - a.time)
        .sort((a, b) => b.level - a.level);
      return sorted;
    },
    browserLanguage() {
      if (process.browser) {
        let code = navigator.language.replace(/-.*/, "");
        return code;
      }
      return "en";
    },
  },
  methods: {
    translate(text, code) {
      if (this.$languages) return this.$languages.translate(text, code);
      else return text;
    },
    getL1Code(l2) {
      let l2Settings = this.$store.getters["settings/l2Settings"](l2.code);
      if (l2Settings?.l1) {
        return l2Settings.l1;
      }
      return "en";
    },
    to(language) {
      let name = LANGS_WITH_CONTENT.includes(language.code)
        ? "explore-media"
        : "language-info";
      return {
        name,
        params: { l1: this.getL1Code(language), l2: language.code },
      };
    },
  },
};
</script>

<style lang="scss" scoped>

.zerotohero-light {
  .language-name {
      color: #444;
  }
}

.zerotohero-dark {
  .language-name {
      color: white;
  }
}


.language-overview-item {
  display: flex;
  padding: 1rem 0;
  color: #666;
  text-decoration: none;
  .language-flag-wrapper {
    margin-right: 1rem;
    position: relative;
    text-align: center;
    width: 3.5rem;
    padding-top: 0.5rem;
    :deep(.flag-icon-wrapper) {
      transform: scale(1.5);
      .country-name {
        font-size: 0.5em;
        top: calc(50% - 2.5em);
      }
    }
    .language-name {
      display: block;
      font-size: 0.8em;
      font-weight: bold;
      position: relative;
      top: 0.85rem;
    }
  }
  .language-progress {
    flex: 1;
  }
  :deep(.hours-display) {
    font-size: 1rem;
  }
  :deep(.bottom-labels) {
    font-size: 0.8rem;
    .bottom-label-right {
      display: none;
    }
  }
}
</style>