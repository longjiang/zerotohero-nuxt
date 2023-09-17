<template>
  <span>
    <b-button
      @click="showModal"
      variant="unstyled"
      style="
        color: rgba(255, 255, 255, 0.77255);
        padding: 0;
        padding-bottom: 0.2em;
        font-weight: bold;
      "
    >
      <span v-if="selectedSearchTerms">“{{ selectedSearchTerms.join(', ') }}”</span>
      <i class="fa fa-caret-down"></i>
    </b-button>
    <b-modal
      ref="choose-search-terms-modal"
      centered
      hide-footer
      :title="$t('Choose Search Terms')"
      body-class="choose-search-terms-modal"
      modal-class="safe-padding-top mt-4"
      @hide="onModalHide"
    >
      <p>✅ {{ $t('Include results containing:') }}</p>
      <b-form-checkbox-group id="search-terms-checkbox-group" v-model="selectedSearchTerms">
        <b-form-checkbox
          v-for="term in allSearchTerms"
          :key="`term-${term}`"
          :value="term"
          class="d-block mb-1"
        >
          {{ term }}
        </b-form-checkbox>
      </b-form-checkbox-group>
      <hr />
      <p>❌ {{ $t('Exclude results containing:') }}</p>
      <b-form-checkbox-group id="search-terms-checkbox-group" v-model="selectedExcludeTerms">
        <b-form-checkbox
          v-for="term in allExcludeTerms"
          :key="`term-${term}`"
          :value="term"
          class="d-block mb-1"
        >
          {{ term }}
        </b-form-checkbox>
      </b-form-checkbox-group>
      <hr />
      <b-form-checkbox
        v-model="wholePhraseOnly"
        class="d-block mb-1"
      >
        {{ $t('Whole Phrase Only') }}
      </b-form-checkbox>
    </b-modal>
  </span>
</template>

<script>

export default {
  props: {
    allSearchTerms: Array,
    allExcludeTerms: Array,
    initialSelectedTerms: Array,
    initialWholePhraseOnly: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      selectedSearchTerms: this.initialSelectedTerms,
      selectedExcludeTerms: this.allExcludeTerms,
      wholePhraseOnly: this.initialWholePhraseOnly
    };
  },
  methods: {
    onModalHide() {
      this.$emit('selectedSearchTerms', this.selectedSearchTerms)
      this.$emit('selectedExcludeTerms', this.selectedExcludeTerms)
      this.$emit('wholePhraseOnly', this.wholePhraseOnly)
    },
    showModal() {
      this.$refs["choose-search-terms-modal"].show();
    },
  },
};
</script>

<style lang="scss" scoped>
</style>