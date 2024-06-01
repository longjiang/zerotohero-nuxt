<template>
  <span>
    <b-button
      @click="showModal"
      variant="unstyled"
      style="
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
      <div v-if="allSearchTerms.length > 1">
        <p>{{ $t('Include results containing:') }}</p>
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
      </div>
      <div v-if="allExcludeTerms.length > 0">
        <p>{{ $t('Exclude results containing:') }}</p>
        <b-form-checkbox-group id="search-terms-checkbox-group" v-model="selectedExcludeTerms">
          <b-form-checkbox
            v-for="term in limitedExcludeTerms"
            :key="`term-${term}`"
            :value="term"
            class="d-block mb-1"
          >
            {{ term }}
          </b-form-checkbox>
        </b-form-checkbox-group>
        <hr />
      </div>
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
  computed: {
    limitedExcludeTerms() {
      // Sort by length, shortest first
      let limitedExcludeTerms = this.allExcludeTerms.sort((a, b) => a.length - b.length);
      return limitedExcludeTerms.slice(0, 100); // Don't render too many or else the rendering gets too slow
    }
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