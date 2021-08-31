<router>
  {
    path: '/:l1/:l2',
  }
</router>
<template>
  <div class="home">
    <SocialHead
      :title="`${$l2.name} Zero to Hero`"
      :description="`Learn ${$l2.name} language from zero to fluency with ${
        ['zh', 'en'].includes($l2.code) ? 'online courses and ' : ''
      } comprehensible input.`"
      :image="image"
    />
    <div class="container pt-5 pb-5">
      <div class="row">
        <div class="col-sm-12">
          <div class="p-1">
            <h3 class="home-intro-text font-weight-normal">
              {{
                $t("For the love of the {l2} language.", { l2: $t($l2.name) })
              }}
            </h3>
          </div>
          <!-- <Sale class="mt-4 mb-4" v-if="$l2.code === 'zh'" /> -->
          <client-only>
            <div :class="{ 'pl-1 pr-1 pb-2': true, 'd-none': !hasDashboard }">
              <div class="home-card">
                <h4 class="text-center mb-4">Continue where you left off</h4>
                <LazyDashboard
                  :l2="$l2"
                  @hasDashboard="hasDashboardUpdate"
                  skin="dark"
                />
              </div>
            </div>
          </client-only>
          <div :class="{ 'pl-1 pr-1 pb-2': true }">
            <div class="home-card text-white">
              <LazyLanguageInfoBox :lang="$l2" />
            </div>
          </div>
          <client-only>
            <Nav :l1="$l1" :l2="$l2" variant="page" />
          </client-only>
          <div :class="{ 'pl-1 pr-1 pb-2': true }" v-if="$l2.han">
            <div class="home-card">
              <h4 class="text-center mb-4">Dialects of Chinese</h4>
              <Dialects skin="dark" />
            </div>
          </div>
          <div :class="{ 'pl-1 pr-1 pb-2': true }" v-if="$l2.han">
            <div class="home-card">
              <h4 class="text-center">56 Ethnic Groups of China</h4>
              <p class="text-center mb-4">(2010 Numbers)</p>
              <FiftySixEthnic skin="dark" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Helper from "@/lib/helper";
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
      return Helper.background(this.$l2);
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
.zerotohero-wide {
  .home {
    padding-left: 2rem;
    padding-right: 2rem;
  }
}
.home-card {
  border-radius: 0.5rem;
  background-color: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.226);
  border-top: 1px solid rgba(255, 255, 255, 0.5);
  border-bottom: 1px solid rgba(0, 0, 0, 0.5);
  color: rgba(255, 255, 255, 0.8);
}
@media (max-width: 540px) {
  .home-card {
    padding: 2rem 1rem;
    ::v-deep .history-item-column.col-12 {
      padding-left: 0.5rem;
      padding-right: 0.5rem;
    }
  }
}
.home-intro-text {
  font-family: pacifico;
  font-size: 2.5em;
  text-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  color: white;
  padding: 0 2rem 2rem 2rem;
  text-align: center;
}
</style>
