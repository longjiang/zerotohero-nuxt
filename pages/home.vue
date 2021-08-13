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
  <div class="pl-4 pr-4 home">
    <div class="container pt-5 pb-5 pl-4 pr-4">
      <div class="row">
        <div class="col-sm-12">
          <div class="p-1">
            <h3 class="home-intro-text font-weight-normal">
              {{
                $t("For the love of the {l2} language.", { l2: $t($l2.name) })
              }}
            </h3>
          </div>
          <client-only>
            <div :class="{ 'pl-1 pr-1 pb-2': true, 'd-none': !hasDashboard }">
              <div class="home-card">
                <h3 class="text-center">Continue where you left off</h3>
                <LazyDashboard :l2="$l2" @hasDashboard="hasDashboardUpdate" />
              </div>
            </div>
          </client-only>

          <Nav :l1="$l1" :l2="$l2" variant="page" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      hasDashboard: false,
    };
  },
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
          title: "TV Shows",
          icon: "fas fa-tv",
          name: "tv-shows",
        },
      ];
    },
  },
  methods: {
    hasDashboardUpdate(hasDashboard) {
      this.hasDashboard = hasDashboard;
    },
    redirectToCourses() {
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
    hasTalks() {
      return (
        typeof this.$store.state.shows.talks !== "undefined" &&
        this.$store.state.shows.talks[this.$l2.code]
      );
    },
    hasTVShows() {
      return (
        typeof this.$store.state.shows.tvShows !== "undefined" &&
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
.home-intro-text {
  font-family: pacifico;
  font-size: 2.5em;
  text-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  color: white;
  padding: 0 2rem 2rem 2rem;
  text-align: center;
}
</style>
