<template>
  <div class="version-info" :class="`skin-${$skin}`">
    <span class="branch mr-1" v-if="gitBranch">{{ gitBranch }}</span> <span class="tag mr-1" v-if="gitTag">v{{ gitTag }}</span> <span class="commit-version"><i class="fa-solid fa-code-commit"></i> {{ gitCommitVersion ? gitCommitVersion.slice(0, 10) : '' }}</span>
  </div>
</template>

<script>
export default {
  computed: {
    gitCommitVersion() {
      return process.env.COMMIT_REF;
    },
    gitBranch() {
      return process.env.BRANCH;
    },
    gitTag() {
      return process.env.TAG;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/variables.scss";

.version-info {
  opacity: 0.66;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
  max-width: 100%; // Adjust this value to control the maximum width of the commit version
  .branch {
    background-color: $text-color-on-dark;
    color: $text-color-on-light;
    padding: 0 0.15rem;
    border-radius: 0.15rem;
  }
  .commit-version {
  }
}
</style>