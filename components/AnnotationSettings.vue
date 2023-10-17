<template>
  <div class="annotation-settings">
    <div class="mt-3">
      <b-form-checkbox class="my-1" v-model="localL2Settings.showDefinition" @change="updateL2Settings" switch>
        {{ $t("Show definition above words") }}
      </b-form-checkbox>
      <b-form-checkbox class="my-1" v-model="localL2Settings.disableAnnotation" @change="updateL2Settings" switch>
        {{ $t("Disable popup dictionary") }}
      </b-form-checkbox>
      <b-form-checkbox class="my-1" v-model="localL2Settings.useSerif" @change="updateL2Settings" switch>
        <template v-if="localL2Settings.useSerif">{{ $t('Use Serif') }}</template>
        <template v-else>{{ $t('Use Sans-Serif') }}</template>
      </b-form-checkbox>
    </div>
  </div>
</template>

<script>
import settingsMixin from '@/lib/mixins/settings-mixin'

export default {
  mixins: [ settingsMixin ],
};
</script>
<style lang="scss" scoped>
@import "~@/assets/scss/variables.scss";

.translated-line {
  color: #aaa;
  font-style: italic;
  font-size: 0.8em;
}

.translated-line {
  display: none;
}

.show-translation .translated-line {
  display: inherit;
}

.annotation-setting-toggle {
  margin: 0 0.2rem;
  cursor: pointer;
}

.annotation-setting-toggle-active {
  color: $primary-color;
}

.annotation-setting-icon {
  width: 2rem;
  text-align: center;
  display: inline-block;
}

hr {
  margin: 0.5rem 0;
}
</style>
