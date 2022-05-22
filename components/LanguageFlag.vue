<template>
  <div
    :class="`flag-icon-wrapper ${cycle ? 'cycle' : ''}`"
    @mouseover="autocycle ? cycleFlags() : undefined"
    @mouseleave="autocycle ? stopCycling() : undefined"
  >
    <div class="country-name" v-if="country">{{ country.name }}</div>
    <img
      v-if="country"
      :alt="`Flag of ${country.name}`"
      :title="`Flag of ${country.name} (${country.alpha2Code})`"
      :src="`/vendor/flag-svgs/${country.alpha2Code}.svg`"
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
    autocycle: false,
  },
  data() {
    return {
      cycle: false,
      country: undefined,
      countries: [],
      typicalCountry: undefined,
    };
  },
  mounted() {
    // Find the 'prototypical country code' to show initially, most of the time
    this.countries = this.language.country;
    let typicalCountryCode = this.$languages.countryCode(this.language);
    this.country = this.typicalCountry = this.$languages.countries.find(
      (c) => c.alpha2Code === typicalCountryCode
    );
    // if (this.autocycle) this.cycleFlags();
  },
  methods: {
    async cycleFlags() {
      if (this.cycle) return; // Already cycling
      if (this.countries.length < 2) return;
      this.cycle = true;
      for (let i = 0; i < 999999; i++) {
        if (!this.cycle) break;
        this.country = this.countries[i % this.countries.length];
        await Helper.timeout(500);
      }
    },
    stopCycling() {
      this.cycle = false;
      this.country = this.typicalCountry;
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

.flag-icon-wrapper {
}

.flag-icon-wrapper:hover,
.cycle {
  .country-name {
    visibility: inherit;
  }
}

.country-name {
  position: absolute;
  color: #888;
  top: -0.8em;
  left: 50%;
  font-weight: normal;
  font-size: 0.6em;
  visibility: hidden;
  white-space: nowrap;
  transform: translate(-50%, -50%);
}
</style>