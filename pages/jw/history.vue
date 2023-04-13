<router>
  {
    path: '/:l1/:l2/history/:yyyy?',
    props: true
  }
</router>

<template>
  <div class="container main mt-10">
    <div id="jw-study-aid-history">
      <div id="jw-study-aid-timeline-nav">
        <router-link
          :to="{ name: 'history', params: { yyyy: prevYear } }"
          class="jw-study-aid-year-previous-btn"
        >
          <i class="octicon octicon-chevron-left"></i>
        </router-link>
        <input
          type="text"
          class="jw-study-aid-year-field"
          v-model.lazy="year"
        />
        <router-link
          class="jw-study-aid-year-next-btn"
          :to="{ name: 'history', params: { yyyy: nextYear } }"
        >
          <i class="octicon octicon-chevron-right"></i>
        </router-link>
      </div>
      <HistoryYear :yyyy="yyyy" />
      <!--<TimeLine /> -->
    </div>
  </div>
</template>

<script>
export default {
  props: {
    yyyy: "29",
  },
  data() {
    return {
      year: undefined,
      wikipediaArticleSnippets: 0,
      wolArticleSnippets: 0,
    };
  },
  watch: {
    year() {
      $router.push({ name: "history", params: { yyyy: this.year } });
    },
  },
  computed: {
    prevYear() {
      let yyyy = Number(this.yyyy) - 1;
      return yyyy === 0 ? yyyy - 1 : yyyy;
    },
    nextYear() {
      let yyyy = Number(this.yyyy) + 1;
      return yyyy === 0 ? yyyy + 1 : yyyy;
    },
  },
  async mounted() {},
  methods: {},
};
</script>

<style>
#jw-study-aid-timeline-nav {
  display: flex;
  margin-bottom: 2rem;
}
</style>