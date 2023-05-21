<router>
  {
    path: '/popular',
    meta: {
      title: 'What's Popular | Language Player',
      metaTags: [
        {
          name: 'description',
          content: 'See what's popular on Language Player.'
        }
      ]
    }
  }
</router>
<template>
  <div class="main">
    <div class="container pt-3 pb-5">
      <SocialHead :title="$t('What\'s Popular') + ' | Language Player'" />
      <div class="row">
        <div class="col-12">
          <h4>Popular Language Pairs</h4>
          <PopularLanguagePairs />
          <h4>Popular Features</h4>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      pairs: [],
    };
  },
  async mounted() {
  },
};
</script>

<style scoped>
/* Add any styles you need for the table here. */
h4 {
  margin-bottom: 1rem;
}
</style>
