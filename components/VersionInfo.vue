<template>
  <div class="version-info" :class="`skin-${$skin}`">
    <span class="branch mr-1">{{ gitBranch }}</span> <span class="tag mr-1">v{{ gitTag }}</span> <span class="commit-version">{{ gitCommitVersion ? gitCommitVersion.slice(0, 10) : '' }}</span>
  </div>
</template>

<script>
export default {
  computed: {
    gitCommitVersion() {
      return process.env.GIT_COMMIT;
    },
    gitBranch() {
      return process.env.GIT_BRANCH;
    },
    gitTag() {
      return process.env.GIT_TAG;
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