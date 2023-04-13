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
};
</script>

<style>
.recommended-message {
  font-weight: normal;
  font-size: 0.75rem;
}
</style>