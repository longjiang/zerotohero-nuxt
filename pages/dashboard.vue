<router>
  {
    name: 'dashboard',
    path: '/dashboard',
  }
</router>
<template>
  <div>
    <client-only>
      <SocialHead
        title="Language Player | Master any language by comprehensible input."
        description="We provide TV shows with subtitles, music with lyrics, live TV channels, phrasebooks with video examples... everything that can help you to learn a language “by osmosis.” Our company, Zero to Hero Education, is also known for our “Chinese Zero to Hero” and “English Zero to Hero” online language courses."
      />
      <div
        class="container-fluid safe-padding-top safe-padding-bottom pt-2"
        style="overflow: hidden; position: relative"
      >
        <div class="container pb-5">
          <div
            :class="{ 'row mb-5': true }"
            v-show="!this.progressLoaded || hasDashboard"
          >
            <div class="col-sm-12">
              <div :class="`home-card skin-${$skin} p-2 pt-4 pb-4`">
                <h5 class="text-center mt-2 mb-1" v-if="$auth.user?.first_name">
                  {{ $auth.user.first_name }}{{ $tb("’s Language Dashboard") }}
                </h5>
                <div v-if="!loggedIn" class="text-center mt-4 mb-4">
                  <p>{{ $tb('To track your learning progress, please login.') }}</p>
                  <router-link :to="{ name: 'login' }" class="btn btn-success">
                    {{ $tb("Login") }}
                    <i class="fas fa-chevron-right"></i>
                  </router-link>
                </div>
                <div v-else-if="!progressLoaded" class="text-center mt-4 mb-4">
                  <Loader
                    :sticky="true"
                    :message="$tb('Loading your learning progress...')"
                  />
                </div>
                <LazyDashboard ref="dashboard" />
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-sm-12">
              <div class="home-card p-2 pt-4 pb-4">
                <h5 class="text-center mb-2" v-show="hasDashboard">
                  {{ $tb("Learn another language") }}
                </h5>
                <Triage />
              </div>
            </div>
          </div>
          <div class="row mt-5">
            <div class="col-sm-12">
              <div class="home-card p-2 pt-4 pb-4">
                <h5 class="text-center mb-3">
                  {{ $tb("Tools for linguists") }}
                </h5>
                <div class="row pl-3 pr-3">
                  <div
                    class="col-sm-12 col-md-4 mt-1 mb-1"
                    v-for="link in linguisticsTools"
                    :key="`linguistics-tools-link-${link.name}`"
                  >
                    <router-link :to="link" class="text-contrast"
                      ><i
                        :class="link.icon"
                        style="width: 2em; text-align: center"
                      ></i>
                      {{ $tb(link.title) }}</router-link
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </client-only>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { background } from "@/lib/utils/background";

export default {
  data() {
    return {
      linguisticsTools: [
        {
          name: "ling-language-map",
          title: `Map of Languages`,
          icon: "fas fa-globe-asia",
          show: true,
        },
        {
          name: "ling-language-icons",
          title: "Face of the Language",
          icon: "fas fa-user",
          show: true,
        },
        {
          name: "ling-phonological-features",
          title: "Phonological Features",
          icon: "fas fa-lips",
          show: true,
        },
        {
          name: "ling-compare-languages",
          title: "Compare Languages",
          icon: "fa-solid fa-arrow-right-arrow-left",
          show: true,
        },
        {
          name: "ling-translators",
          title: "Web Translators",
          icon: "fas fa-language",
          show: true,
        },
        {
          name: "stats",
          title: "Language Player Stats",
          icon: "fas fa-chart-simple",
          show: true,
        },
      ],
    };
  },
  computed: {
    ...mapState("fullHistory", ["fullHistory"]),
    ...mapState("progress", ["progressLoaded", "progress"]),
    background() {
      return background();
    },
    loggedIn() {
      if (this.$auth?.loggedIn && this.$auth.user?.first_name) return true
      else return false
    },
    hasDashboard() {
      let hasDashboard =
        this.$auth.loggedIn &&
        this.$auth.user?.first_name &&
        this.progress &&
        Object.keys(this.progress).length > 0;
      return hasDashboard;
    },
    lastFullHistoryPath() {
      if (this.fullHistory) {
        let lastFullHistoryItem = this.fullHistory[this.fullHistory.length - 1];
        if (lastFullHistoryItem && lastFullHistoryItem.path) {
          return lastFullHistoryItem.path;
        }
      }
    },
    langsWithEnDict() {
      if (this.$languages) {
        let langsWithEnDict = this.$languages.l1s.filter(
          (l) => l.dictionaries && l.dictionaries.eng
        );
        return langsWithEnDict;
      }
    },
    lastL1L2() {
      // Find last l2 from full history
      if (this.fullHistory) {
        let lastL1;
        let lastL2;
        this.fullHistory.find((item) => {
          // Resolve item.path
          const route = this.$router.resolve(item.path);
          // Find the l2 param
          const l1 = route.route?.params?.l1;
          const l2 = route.route?.params?.l2;
          if (l1 && l2) {
            lastL1 = l1;
            lastL2 = l2;
            return true;
          }
        });
        if (lastL1 && lastL2) {
          return { l1: lastL1, l2: lastL2 };
        }
      }
    },
  },
  mounted() {},
  watch: {
    fullHistory() {
      // When fullHistory is loaded, redirect to last l2 if on landing page
      const isLandingPage = window?.history?.length < 3;
      if (isLandingPage) this.redirectLastL2()
    },
  },
  methods: {
    redirectLastL2() {
      if (this.lastL1L2) {
        const { l1, l2 } = this.lastL1L2;
        console.log({ l1, l2 });
        this.$router.push({ name: "explore-media", params: { l1, l2 } });
      }
    },
  },
};
</script>