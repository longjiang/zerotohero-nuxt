<router>
  {
    name: 'dashboard',
    path: '/dashboard',
    meta: {
      layout: 'full',
      skin: 'dark'
    }
  }
</router>
<template>
  <div>
    <client-only>
      <SiteTopBar skin="dark" />
      <SocialHead
        title="Language Player | Master any language by comprehensible input."
        description="We provide TV shows with subtitles, music with lyrics, live TV channels, phrasebooks with video examples... everything that can help you to learn a language “by osmosis.” Our company, Zero to Hero Education, is also known for our “Chinese Zero to Hero” and “English Zero to Hero” online language courses."
      />
      <div
        class="zerotohero-background"
        :style="`background-image: url(${background})`"
      />
      <div class="gradient-backdrop"></div>
      <div class="gradient-backdrop-2"></div>
      <div
        class="container-fluid safe-padding-top safe-padding-bottom"
        style="overflow: hidden; position: relative"
      >
        <div class="container pb-5">
          <div class="row">
            <div class="col-sm-12">
              <div class="mt-5 text-center mb-5" v-if="!loaded">
                <p>App is asleep due to inactivity.</p>
                <router-link
                  :to="{ path: lastFullHistoryPath || '/' }"
                  class="btn btn-success"
                >
                  Reactivate
                </router-link>
              </div>
            </div>
          </div>
          <div :class="{ 'row mb-5': true }" v-if="hasDashboard">
            <div class="col-sm-12">
              <div class="home-card p-2 pt-4 pb-4 bg-white">
                <h5 class="text-center mt-2 mb-1">
                  {{ $auth.user.first_name
                  }}{{ translate("’s Language Dashboard", browserLanguage) }}
                </h5>
                <LazyDashboard ref="dashboard" />
              </div>
            </div>
          </div>
          <div class="row mt-5">
            <div class="col-sm-12">
              <div class="home-card p-2 pt-4 pb-4 bg-white">
                <h5 class="text-center mb-2" v-if="hasDashboard">
                  Learn another language
                </h5>
                <h5 class="text-center mb-2" v-else-if="$auth.user">
                  Welcome, {{ $auth.user.first_name }}.
                </h5>
                <Triage />
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
import { background } from '@/lib/utils/background'

export default {
  data() {
    return {
      loaded: false,
    };
  },
  computed: {
    ...mapState("fullHistory", ["fullHistory"]),
    background() {
      return background()
    },
    hasDashboard() {
      return (
        this.$auth.loggedIn &&
        this.$auth.user?.first_name &&
        this.$store.state.progress.progress &&
        Object.keys(this.$store.state.progress.progress).length > 0
      );
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
    browserLanguage() {
      if (process.browser) {
        let code = navigator.language.replace(/-.*/, "");
        if (
          this.langsWithEnDict &&
          this.langsWithEnDict.find((l) => l.code === code)
        )
          return code;
      }
      return "en";
    },
  },
  mounted() {
    this.loaded = true;
  },
  methods: {
    translate(text, code) {
      if (this.$languages) return this.$languages.translate(text, code);
      else return text;
    },
  },
};
</script>
