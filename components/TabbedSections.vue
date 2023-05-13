<template>
  <div class="tabbed-sections-wrapper" :class="`skin-${$skin}`">
    <div class="section-nav-wrapper">
      <div class="section-nav">
        <div
          v-for="(section, index) in sections"
          :key="`section-nav-item-${index}`"
          :class="{
            'section-nav-item': true,
            'section-nav-item-current': currentSectionIndex === index,
            'd-none': !section.visible,
          }"
          @click="goToSection(index)"
        >
          {{ $t(section.title) }}
        </div>
      </div>
    </div>
    <div class="tabbed-sections">
      <div class="tabbed-section">
        <slot :name="sections[currentSectionIndex].name"></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    sections: Array, // of objects with proprties `title` and `visible`
  },
  data() {
    return {
      currentSectionIndex: 0,
    };
  },
  mounted() {
    const urlParams = new URLSearchParams(window.location.search);
    const tabName = urlParams.get('tab');
    const matchedSectionIndex = this.sections.findIndex(section => section.name === tabName && section.visible)
    if (matchedSectionIndex > 0) this.currentSectionIndex = matchedSectionIndex;
  },
  methods: {
    goToSection(index) {
      this.currentSectionIndex = index;
      const newQuery = Object.assign({}, this.$route.query, { tab: this.sections[this.currentSectionIndex].name });
      this.$router.push({ query: newQuery });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/variables.scss";

.tabbed-section {
  overflow: visible;
  padding: 1rem 0;
}

.tabbed-sections-wrapper {
  &.skin-dark .section-nav-wrapper {
    background: $bg-color-dark-1;
  }
  &.skin-light .section-nav-wrapper {
    background: $bg-color-light-1;
  }
}

.section-nav-wrapper {
  position: sticky;
  top: 0;
  z-index: 1;

  .section-nav {
    white-space: nowrap;
    padding: 0.5rem 0 0 0;
    text-align: center;
    overflow-x: auto;
    overflow-y: hidden;
    max-width: 100%;

    .section-nav-item {
      display: inline-block;
      padding: 0.5rem 0;
      margin: 0 0.7rem;
      cursor: pointer;
      font-weight: bold;

      &:hover,
      &.section-nav-item-current {
        background-image: linear-gradient(rgba($primary-color, 0.8), rgba($primary-color-dark, 0.8));
        background-position: 50% 100%;
        background-size: 70% 0.35rem;
        background-repeat: no-repeat;
      }
    }
  }
}
</style>