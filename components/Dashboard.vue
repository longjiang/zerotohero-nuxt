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
          :set="(language = $languages.getSmart(l2Progress.l2Code))"
          :key="`language-overview-item-${l2Progress.l2Code}`"
        >
          <router-link
            class="language-overview-item"
            v-if="language && language.name"
            :to="to(language)"
          >
            <div class="language-flag-wrapper">
              <LanguageFlag :language="language" :autocycle="true" />
              <span class="language-name">{{ language.name }}</span>
            </div>
            <LanguageProgress
              :$l1="$languages.getSmart(getL1Code(language))"
              :$l2="language"
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
          let l2Progress = Object.assign({ l2Code }, this.progress[l2Code]);
          return l2Progress;
        })
        .filter((item) => item && item.l2Code && item.time !== undefined);
      sorted = sorted
        .sort((a, b) => b.time - a.time)
        .sort((a, b) => b.level - a.level);
      return sorted;
    },
  },
  methods: {
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
      color: #444;
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