<template>
  <div>
    <img
      v-if="currentCountryCode"
      :src="`/vendor/flag-svgs/${currentCountryCode}.svg`"
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
      currentCountryCode: this.countryCode(this.language)
    }
  },
  mounted() {
    this.loop()
  },
  methods: {
    countryCode(l2) {
      let countryCode = this.$languages.countryCode(l2);
      return countryCode;
    },
    async loop() {
      let countryCodes = this.language.country.map(c => c.alpha2Code)
      let index = 0
      while(index < countryCodes.length) {
        let code = countryCodes[index];
        this.currentCountryCode = code;
        await Helper.timeout(3000);
        index++
        if (index === countryCodes.length) index = 0;
      }
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