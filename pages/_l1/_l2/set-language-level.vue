<template>
  <div class="container">
    <div class="row">
      <div class="col-12">
        <p class="text-center mb-4">
          {{ $t('What’s your level of {l2}?', {l2: $t($l2.name)}) }}
        </p>
        <LanguageLevel />
        <div class="text-right" v-if="languageLevel">
          <router-link
            class="btn btn-primary pl-5 pr-5 mt-4"
            :to="{ name: 'l1-l2-set-content-preferences' }"
          >
            {{ $t('Continue') }}
            <i class="fa fa-chevron-right"></i>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState("progress", ["progress"]),
    languageLevel() {
      if (
        this.progress &&
        this.progress[this.$l2.code] &&
        this.progress[this.$l2.code].level
      )
        return this.progress[this.$l2.code].level;
    },
  },
};
</script>

<style>
</style>