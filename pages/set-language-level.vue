<router>
  {
    path: '/:l1/:l2/set-language-level',
    props: true,
    meta: {
      skin: 'dark'
    }
  }
</router>
<template>
  <div class="container">
    <div class="row">
      <div class="col-12">
        <p class="text-center mb-4 text-white">
          {{ $t(`What’s your level of ${$l2.name}?`) }}
        </p>
        <LanguageLevel />
        <div class="text-right" v-if="languageLevel">
          <router-link
            class="btn btn-success pl-5 pr-5 mt-4"
            :to="{ name: 'set-content-preferences' }"
          >
            Continue
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
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
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
};
</script>

<style>
</style>