<template>
  <p class="recommended-message">
    {{ $t("Recommendation based on your") }}
    <router-link
      :to="{
        name: LANGS_WITH_LEVELS.includes(this.$l2.code)
          ? 'set-language-level'
          : 'set-content-preferences',
      }"
    >
      <u>{{ $t("content preferences") }}</u>
    </router-link>
  </p>
</template>

<script>
import { LANGS_WITH_LEVELS } from "@/lib/utils";
export default {
  data() {
    return {
      LANGS_WITH_LEVELS,
    }
  },
  computed: {

    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
    $adminMode() {
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
    },
  }
};
</script>

<style>
.recommended-message {
  font-weight: normal;
  font-size: 0.75rem;
}
</style>