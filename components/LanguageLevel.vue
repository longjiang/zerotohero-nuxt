<template>
  <div>
    <div class="container">
      <div class="row">
        <div
          v-for="(level, index) in levels"
          :key="`level-btn-level-${index}`"
          class="col-12 level-btn-wrapper"
        >
          <b-button
            :class="{
              'level-btn': true,
              'level-btn-selected':
                languageLevel && languageLevel == level.numeric,
              'level-btn-faded':
                languageLevel && languageLevel != level.numeric,
            }"
            @click="setLevel(level.numeric)"
          >
            {{ $t(level.category) }} ({{
              level.name.replace("CEFR ", "").replace("Pre", $t("Pre-"))
            }})
            <div :data-bg-level="level.level" class="level-btn-bar" :style="`width: ${100 * Math.pow(0.5, 7 - level.numeric)}%`"></div>
          </b-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { languageLevels, LANGS_WITH_LEVELS } from "@/lib/utils";
export default {
  computed: {
    ...mapState("progress", ["progress"]),
    levels() {
      let langLevels = languageLevels(this.$l2);
      return [1, 2, 3, 4, 5, 6, 7].map((l) => langLevels[l]);
    },
    languageLevel() {
      if (
        this.progress &&
        this.progress[this.$l2.code] &&
        this.progress[this.$l2.code].level
      )
        return this.progress[this.$l2.code].level;
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

<style lang="scss" scoped>
.level-btn-wrapper {
  padding: 0.25rem;
}

.level-btn {
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-size: 0.8rem;
  width: 100%;
  height: 100%;
  display: block;
  text-align: left;
  text-shadow: 0 0 6px #000000;
  position: relative;
  border: none;
  background: linear-gradient(#00000077, #00000077);
  opacity: 0.99;
  cursor: pointer;
  &.level-btn-selected {
    border: 2px solid white;
    background: none;
  }
  &.level-btn-faded {
    opacity: 0.5;
  }
  .level-btn-bar {
    height: 100%;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;
  }
  input {
    position: absolute;
    top: 1rem;
    left: 1rem;
  }
}

@media screen and (min-width: 480px) {
  .level-btn {
    font-size: 1rem;
    padding: 1rem;
  }
}
</style>