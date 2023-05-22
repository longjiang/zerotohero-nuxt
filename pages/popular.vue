<router>
  {
    path: '/popular',
    meta: {
      title: 'What\'s Popular | Language Player',
      metaTags: [
        {
          name: 'description',
          content: 'See what\'s popular on Language Player.'
        }
      ]
    }
  }
</router>
<template>
  <div class="main">
    <div class="container pt-3 pb-5">
      <SocialHead :title="$t('What\'s Popular') + ' | Language Player'" />
      <h3>What's Popular on Language Player</h3>
      <p class="mt-3">
        Start Date: <date-picker
        v-model="startDate"
        format="YYYY-MM-DD"
      ></date-picker>
      </p>
      <div class="row">
        <div class="col-12">
          <h4 class="mt-5">Popular Language Pairs</h4>
          <PopularLanguagePairs :startDate="formatDate(startDate)" :key="`popular-language-pairs-${formatDate(startDate)}`"/>
          <h4 class="mt-5">Popular Features</h4>
          <PopularFeatures  :startDate="formatDate(startDate)" :key="`popular-features-${formatDate(startDate)}`" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DatePicker from "vue2-datepicker";
import 'vue2-datepicker/index.css';

export default {
  components: {
    DatePicker,
  },
  data() {
    return {
      pairs: [],
      startDate: undefined,
    };
  },
  async mounted() {
  },
  methods: {
    formatDate(date) {
      return date ? date.toISOString().split('T')[0] : undefined;
    }
  }
};
</script>

<style scoped>
/* Add any styles you need for the table here. */
h4 {
  margin-bottom: 1rem;
}
</style>
