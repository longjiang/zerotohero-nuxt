<template>
  <div>
    <div
      v-for="(level, index) in levels"
      :key="`level-btn-level-${index}`"
      class="col-6 col-md-4 col-lg-3 category-btn-wrapper"
    >
      <b-button
        :data-bg-level="level.level"
        style="border: none; background: linear-gradient(#00000077, #00000077)"
        variant="unstyled category-btn"
        @click="setLevel(level.numeric)"
      >
        {{ level.category }} ({{
          level.name.replace("CEFR ", "").replace("Pre", "Pre-")
        }})
      </b-button>
    </div>
  </div>
</template>

<script>
import { languageLevels, LANGS_WITH_LEVELS } from "@/lib/utils";
export default {
  computed: {
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
    levels() {
      let langLevels = languageLevels(this.$l2);
      return [1, 2, 3, 4, 5, 6, 7].map((l) => langLevels[l]);
    },
  },
  methods: {
    setLevel(level) {
      this.$store.dispatch("progress/setLevel", {
        l2: this.$l2,
        level,
      });
    },
  },
};
</script>

<style>
</style>