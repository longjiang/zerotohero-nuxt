<template>
  <div class="changelog">
    <vue-markdown :source="changelogContent" />
  </div>
</template>

<script>
import VueMarkdown from "vue-markdown";
import changelogContent from "@/CHANGELOG.md";

export default {
  components: {
    VueMarkdown,
  },
  data() {
    return {
      changelogContent,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/variables.scss";
.changelog {
  :deep(*) {
    h3 {
      font-size: 1rem;
    }
    h2 {
      font-size: calc(1rem * 1.25);
      margin-bottom: 1rem;
      padding-top: 1rem;
      margin-top: 1rem;
    }
    h1 {
      font-size: calc(1rem * 1.25 * 1.25);
    }
    h3, ul {
      margin-left: 1rem;
    }
  }
}
</style>
