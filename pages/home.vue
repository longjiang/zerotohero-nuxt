<router>
  {
    path: '/:l1/:l2',
  }
</router>
<template>
  <div class="pl-4 pr-4 home">
    <SocialHead
      :title="`${$l2.name} Zero to Hero`"
      :description="`Learn ${$l2.name} language from zero to fluency with ${
        ['zh', 'en'].includes($l2.code) ? 'online courses and ' : ''
      } comprehensible input.`"
      :image="image"
    />
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
          <Sale class="mt-4 mb-4" v-if="$l2.code === 'zh'" />
          <client-only>
            <div :class="{ 'pl-1 pr-1 pb-2': true, 'd-none': !hasDashboard }">
              <div class="home-card">
                <h4 class="text-center mb-4">Continue where you left off</h4>
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
    image() {
      if (!this.$l2) return "/img/background-branch.jpg";
      else if (["zh", "lzh"].includes(this.$l2.code))
        return `/img/backgrounds/bg-${this.$l2.code}-${Math.ceil(
          Math.random() * 10
        )}.jpg`;
      else if (['gan',
        'hak',
        'hsn',
        'nan',
        'wuu',
        'zha'].includes(this.$l2.code))
        return `/img/backgrounds/bg-zh-${Math.ceil(
          Math.random() * 10
        )}.jpg`;
      else return `https://source.unsplash.com/1600x900/?${this.$l2.name}`;
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
