<template>
  <div class="triage">
    <div class="container">
      <div class="row">
        <div class="col-sm-12">
          <div class="mb-2">Which language would you like to learn?</div>
          <b-form-select :options="l2Options" v-model="l2"></b-form-select>
        </div>
      </div>
      <div class="row mt-3" v-if="l2 && l1Options.length > 1">
        <div class="col-sm-12">
          <div class="mb-2">
            What is your mother tongue (first/native language)?
          </div>
          <b-form-select :options="l1Options" v-model="l1"></b-form-select>
        </div>
      </div>
      <div class="row mt-3" v-if="l1 && l2">
        <div class="col-sm-12 text-center">
          <router-link
            class="btn btn-success"
            :to="{
              name: 'learning-path',
              params: { l1: l1.code, l2: l2.code },
            }"
          >
            Start Learning <i class="fa-solid fa-chevron-right"></i>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return { l1: undefined, l2: undefined };
  },
  mounted() {},
  computed: {
    l2Options() {
      let options = this.$languages.l1s
        .map((language) => {
          return {
            value: language,
            text: language.name,
          };
        })
        .sort((a, b) => a.text.localeCompare(b.text));
      return options;
    },
    l1Options() {
      let l2 = this.l2;
      let supportedL1s = this.$languages.l1s.filter(
        (language) => language.dictionaries?.[l2["iso639-3"]]
      );
      let options = supportedL1s.map((language) => {
        return {
          value: language,
          text: language.name,
        };
      });
      if (options.length === 1) this.l1 = options[0].value // If only one l1 is possible, use that
      else this.l1 = undefined
      return options;
    },
  },
};
</script>

<style>
</style>