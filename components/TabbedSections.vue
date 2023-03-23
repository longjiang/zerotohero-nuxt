<template>
  <div class="dictionary-entry">
    <div class="section-nav-wrapper">
      <div class="section-nav">
        <div
          v-for="(section, index) in sections"
          :key="`section-nav-item-${index}`"
          :class="{
            'section-nav-item': true,
            'section-nav-item-current': currentSection === index,
            'd-none': !section.visible,
          }"
          @click="goToSection(index)"
        >
          {{ $t(section.title) }}
        </div>
      </div>
    </div>
    <div class="dictionary-entry-sections">
      <div class="dictionary-entry-section">
        <slot :name="sections[currentSection].name"></slot>
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
      currentSection: 0,
    };
  },
  methods: {
    goToSection(index) {
      this.currentSection = index;
    },
  },
};
</script>

<style lang="scss" scoped>
.dictionary-entry-section {
  overflow: visible;
  padding: 1rem 0;
}

.section-nav-wrapper {
  position: sticky;
  top: 0;
  z-index: 1;
  background: white;

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
        background-image: linear-gradient(#28a745cc, #28a745cc);
        background-position: 50% 100%;
        background-size: 70% 0.35rem;
        background-repeat: no-repeat;
      }
    }
  }
}
</style>