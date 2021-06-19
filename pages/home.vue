<router>
  {
    path: '/:l1/:l2',
    meta: {
      title: 'Zero to Hero',
      metaTags: [
        {
          name: 'description',
          content: 'Learn from Zero and progress to Fluency.'
        }
      ]
    }
  }
</router>
<template>
  <div class="main">
    <div class="container pt-5 pb-5">
      <div class="row">
        <div class="col-sm-12"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
  },
  created() {
    if (
      this.$l1 &&
      this.$route.params.l1 === this.$l1.code &&
      this.$l2 &&
      this.$route.params.l2 === this.$l2.code
    ) {
      if (this.$hasFeature("courses")) {
        this.$router.push({ name: "courses" });
      } else if (this.$hasFeature("youtube")) {
        let name = "youtube-browse";
        if (this.hasTalks()) name = "talks";
        if (this.hasTVShows()) name = "tv-shows";
        this.$router.push({ name });
      } else if (
        this.$hasFeature("dictionary") ||
        this.$hasFeature("transliteration")
      ) {
        this.$router.push({ name: "reader" });
      } else {
        this.$router.push({ name: "learning-path" });
      }
    }
  },
  methods: {
    hasTalks() {
      return (
        this.$store.state.shows.talks &&
        this.$store.state.shows.talks[this.$l2.code]
      );
    },
    hasTVShows() {
      return (
        this.$store.state.shows.tvShows &&
        this.$store.state.shows.tvShows[this.$l2.code]
      );
    },
  },
};
</script>

<style>
</style>
