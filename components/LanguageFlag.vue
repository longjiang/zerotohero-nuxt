<template>
  <div>
    <img
      v-if="countryCode(language)"
      :src="`/vendor/flag-svgs/${countryCode(language)}.svg`"
      class="flag-icon"
    />
    <div v-else class="no-flag-placeholder" ></div>
  </div>
</template>
<script>
export default {
  props: {
    language: {
      type: Object,
      required: true,
    },
  },
  methods: {
    countryCode(l2) {
      let countryCode = this.$languages.countryCode(l2);
      return countryCode;
    },
  },
};
</script>
<style lang="scss" scoped>
.flag-icon {
  width: 2rem;
  display: block;
  margin: 0 auto 0.5rem auto;
}
.no-flag-placeholder {
  height: 1.6rem;
  width: 2rem;
  background-color: #ddd;
  border-radius: 0.3rem;
}
</style>