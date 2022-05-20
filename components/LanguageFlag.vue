<template>
  <div
    class="flag-icon-wrapper"

    @mouseleave="autocycle ? stopCycling() : undefined"
  >
    <img
      v-if="countryCode"
      :src="`/vendor/flag-svgs/${countryCode}.svg`"
      class="flag-icon"
    />
    <div v-else class="no-flag-placeholder"></div>
  </div>
</template>
<script>
import Helper from "@/lib/helper";
export default {
  props: {
    language: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      cycle: false,
      countryCode: undefined,
      countryCodes: [],
      typicalCountryCode: undefined,
      autocycle: true,
    };
  },
  mounted() {
    // Find the 'prototypical country code' to show initially, most of the time
    this.countryCodes = this.language.country.map((c) => c.alpha2Code);
    this.countryCode = this.typicalCountryCode = this.$languages.countryCode(
      this.language
    );
    // if (this.autocycle) this.cycleFlags();
  },
  methods: {
    async cycleFlags() {
      if (this.cycle) return // Already cycling
      if (this.countryCodes.length < 2) return;
      this.cycle = true;
      for (let i = 0; i < 999999; i++) {
        if (!this.cycle) break;
        this.countryCode = this.countryCodes[i % this.countryCodes.length];
        await Helper.timeout(500);
      }
    },
    stopCycling() {
      this.cycle = false;
      this.countryCode = this.typicalCountryCode;
    },
  },
};
</script>
<style lang="scss" scoped>
.flag-icon-wrapper {
  display: inline-block;
}
.flag-icon {
  width: 2rem;
  height: 1.6rem;
  border-radius: 0.3rem;
}
.no-flag-placeholder {
  height: 1.6rem;
  width: 2rem;
  background-color: #ddd;
  border-radius: 0.3rem;
}
</style>