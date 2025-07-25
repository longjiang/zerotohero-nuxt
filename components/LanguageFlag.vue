<template>
  <div
    :class="['flag-icon-wrapper', { cycle }]"
    @mouseover="autocycle ? cycleFlags() : undefined"
    @mouseleave="autocycle ? stopCycling() : undefined"
  >
    <!-- 国名ツールチップ -->
    <div v-if="country" class="country-name">
      {{ $tb(country.name) }}
    </div>

    <!-- 国旗 SVG -->
    <img
      v-if="country"
      :alt="`Flag of ${country.name}`"
      :title="`Flag of ${country.name} (${country.alpha2Code})`"
      :src="`/vendor/flag-svgs/${country.alpha2Code}.svg`"
      class="flag-icon"
    />

    <!-- 国旗を持たない言語用プレースホルダー -->
    <div
      v-else
      class="no-flag-placeholder"
      :title="`${$tb(language.name)} — no national flag`"
    >
      <span>{{ language.code.toUpperCase() }}</span>
    </div>
  </div>
</template>

<script>
import { timeout } from "../lib/utils";

export default {
  props: {
    language: { type: Object, required: true },
    autocycle: { type: Boolean, default: false },
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
    this.resolveCountry();
  },
  watch: {
    language: {
      handler() {
        this.resolveCountry();
      },
      immediate: false,
    },
  },
  methods: {
    /* 言語に対応する「代表国」を算定 */
    resolveCountry() {
      this.countries = this.language.country || [];
      const alpha2 = this.$languages.countryCode(this.language);
      this.country = this.typicalCountry =
        this.$languages.countries.find((c) => c.alpha2Code === alpha2) ||
        undefined;
    },

    /* 国旗巡回表示（自動モード／ホバー） */
    async cycleFlags() {
      if (this.cycle || this.countries.length < 2) return;
      this.cycle = true;
      for (let i = 0; i < Number.MAX_SAFE_INTEGER; i++) {
        if (!this.cycle) break;
        this.country = this.countries[i % this.countries.length];
        await timeout(500);
      }
    },

    /* 巡回停止して代表国へ戻す */
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
  position: relative;
}
.flag-icon {
  width: 2rem;
  height: 1.4rem;
  border-radius: 0.2rem;
  object-fit: cover;
}

/* 国旗非対応言語のプレースホルダー */
.no-flag-placeholder {
  width: 2rem;
  height: 1.4rem;
  border-radius: 0.2rem;
  background: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.55em;
  color: #555;
  user-select: none;
}

.country-name {
  position: absolute;
  top: -22.5%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.55em;
  color: #888;
  white-space: nowrap;
  visibility: hidden;
}

/* ホバー時・自動巡回時に国名表示 */
.flag-icon-wrapper:hover .country-name,
.flag-icon-wrapper.cycle .country-name {
  visibility: visible;
}
</style>