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
    <div class="container pb-5 pl-4 pr-4">
      <div class="row">
        <div class="col-sm-12 text-center">
          <h3>{{$t('For the love of the {l2} language.', { l2: $t($l2.name) })}}</h3>
        </div>
        <Nav :l1="$l1" :l2="$l2" variant="page" />
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
    features() {
      return [
        {
          title: 'TV Shows',
          icon: 'fas fa-tv',
          name: 'tv-shows'
        }
      ]
    }
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
      }
    }
  },
  methods: {
    hasTalks() {
      return (
        typeof this.$store.state.shows.talks !== 'undefined' &&
        this.$store.state.shows.talks[this.$l2.code]
      );
    },
    hasTVShows() {
      return (
        typeof this.$store.state.shows.tvShows !== 'undefined'  &&
        this.$store.state.shows.tvShows[this.$l2.code]
      );
    },
    f() {
      if (this.$hasFeature("youtube")) {
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
    },
  },
};
</script>

<style lang="scss" scoped>
</style>
