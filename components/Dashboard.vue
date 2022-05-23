<template>
  <container-query :query="query" v-model="params">
    <div class="container">
      <div class="row">
        <div
          :class="{
            'language-overview-item': true,
            'col-sm-4': params.md || params.lg || params.xl,
            'col-sm-6': params.sm,
            'col-sm-12': params.xs,
          }"
          v-for="l2Progress in sortedProgress"
          :set="(language = $languages.getSmart(l2Progress.l2Code))"
          :key="`language-overview-item-${l2Progress.l2Code}`"
        >
          <template v-if="language && language.name">
            <div class="language-flag-wrapper">
              <LanguageFlag :language="language" />
            </div>
            <LanguageProgress
              :$l1="$languages.getSmart('en')"
              :$l2="language"
            />
          </template>
        </div>
      </div>
    </div>
  </container-query>
</template>

<script>
import { ContainerQuery } from "vue-container-query";
import { mapState } from "vuex";
import Helper from "@/lib/helper";

export default {
  components: {
    ContainerQuery,
  },
  props: {},
  data() {
    return {
      params: {},
      specials: Helper.specialLanguages,
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
        .filter((item) => item && item.l2Code && item.time);
      sorted = sorted
        .sort((a, b) => b.time - a.time)
        .sort((a, b) => b.level - a.level);
      return sorted;
    },
  },
  watch: {},
  methods: {},
};
</script>

<style lang="scss" scoped>
.language-overview-item {
  display: flex;
  padding: 1rem;
  .language-flag-wrapper {
    margin-right: 1rem;
    position: relative;
    padding-top: 1.3rem;
  }
  .language-progress {
    flex: 1;
  }
  ::v-deep .hours-display {
    font-size: 1rem;
  }
  ::v-deep .bottom-labels {
    font-size: 0.8rem;
    .bottom-label-right {
      display: none;
    }
  }
}
</style>