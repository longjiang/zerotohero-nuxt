<template>
  <container-query :query="query" v-model="params">
    <div
      :class="[
        'site-top-bar',
        wide ? 'site-top-bar-wide' : 'site-top-bar-not-wide',
        `site-top-bar-${skin}`,
      ]"
    >
      <div class="site-top-bar-left">
        <b-button
          @click="$router.back()"
          variant="unstyled"
          v-show="$route.path !== '/'"
        >
          <i class="fas fa-arrow-left"></i>
          {{ $tb("Back") }}
        </b-button>
      </div>
      <div class="site-top-bar-center">
        <span
          :class="{
            'logo flex-1 text-center': true,
          }"
          v-show="!wide && $route.path !== '/'"
        >
          <router-link
            :to="
              $auth.loggedIn
                ? $route.path === '/dashboard'
                  ? '/'
                  : '/dashboard'
                : '/'
            "
            class="btn btn-unstyled"
            title="Dashboard"
          >
            <img
              src="/img/logo-play-circle-light.png"
              alt=""
              class="logo"
              data-not-lazy
            />
            <span>Language Player</span>
          </router-link>
        </span>
      </div>
      <div class="site-top-bar-right">
        <client-only>
          <span v-show="!$route.params.l1 && !$route.params.l2">
            <!-- <router-link to="/go-pro" v-show="!pro" class="mr-2">
              🚀 {{ $tb("Go Pro") }}
            </router-link> -->
            <router-link
              v-if="$auth && $auth.loggedIn && $auth.user && $auth.user.first_name"
              to="/logout"
              class="mr-1"
            >
              {{ $tb("Logout") }}
            </router-link>
            <router-link v-else to="/login" class="mr-1">
              {{ $tb("Login") }}
            </router-link>
          </span>
        </client-only>
        <router-link
          v-show="$route.params.l1 && $route.params.l2"
          :to="{ name: 'youtube-search' }"
          :class="`btn top-bar-buttontop btn-unstyled link-unstyled mr-1`"
          title="Search Videos"
        >
          <i class="fas fa-search"></i>
        </router-link>
        <b-button
          :class="`top-bar-buttontop ml-2 mr-1`"
          variant="unstyled"
          :title="$tb('Quick Settings')"
          @click="showSettingsModal"
        >
          <i class="fas fa-cog"></i>
        </b-button>
        <b-button
          :class="`top-bar-buttontop ml-2`"
          variant="unstyled"
          :title="$tb('Share')"
          v-show="canShare"
          @click="share"
        >
          <i class="fas fa-share"></i>
        </b-button>
        <div
          class="d-inline-block"
          @mouseover="cycleFlags"
          @mouseleave="stopCycling"
          v-if="$route.params.l2 && $l2"
        >
          <span
            @click="showPlaylistModal"
            class="language-flag-and-name"
            style="cursor: pointer"
          >
            <LanguageFlag
              v-if="$l2 && flagCode"
              ref="flag"
              :key="`top-bar-flag-${$l2.code}`"
              :autocycle="false"
              :language="$l2"
              class="ml-2 site-top-bar-language-flag"
            />
            <span
              :class="`${
                !$route.params.l2 ? 'd-none' : ''
              } ml-1 language-flag-triangle`"
            >
              <i class="fas fa-sort-down"></i>
            </span>
          </span>
        </div>
      </div>
      <b-modal
        ref="settings-modal"
        size="sm"
        centered
        hide-footer
        :title="$tb('Quick Settings')"
        modal-class="safe-padding-top mt-4"
        body-class="settings-modal-wrapper"
      >
        <div class="settings-modal">
          <QuickSettings />
        </div>
      </b-modal>
      <b-modal
        ref="languages-modal"
        size="xl"
        centered
        hide-footer
        :title="$t('Switch languages')"
        modal-class="safe-padding-top mt-4"
        body-class="languages-modal-wrapper"
      >
        <div class="languages-modal">
          <div class="mb-3">
            <router-link to="/dashboard" class="text-success">
              <i class="fas fa-chevron-left"></i>
              {{ $t("Back to Dashboard") }}
            </router-link>
          </div>
          <LazyDashboard class="mb-5" v-show="hasDashboard" />
          <div class="pb-5">
            <h5 class="text-center mb-2">
              {{ $t("Learn another language") }}
            </h5>
            <Triage />
          </div>
        </div>
      </b-modal>
    </div>
  </container-query>
</template>
<script>
import { ContainerQuery, mapState, Capacitor, Share } from "@/imports";

export default {
  components: { ContainerQuery },
  data() {
    return {
      keyword: undefined,
      params: {},
      query: {
        xs: {
          minWidth: 0,
          maxWidth: 423,
        },
        sm: {
          minWidth: 423,
          maxWidth: 720,
        },
        md: {
          minWidth: 720,
          maxWidth: 960,
        },
        lg: {
          minWidth: 960,
          maxWidth: 1140,
        },
        xl: {
          minWidth: 1140,
        },
      },
    };
  },
  props: {
    wide: {
      // Whether or not the bar is displayed on a wide layout
      type: Boolean,
      default: false,
    },
    badge: {
      type: [String, Number],
    },
    skin: {
      default: "dark", // or "light"
    },
  },
  computed: {
    ...mapState("fullHistory", ["fullHistory"]),
    isPWA() {
      return (
        (typeof navigator !== "undefined" && navigator.standalone) ||
        (typeof window !== "undefined" &&
          window.matchMedia("(display-mode: standalone)").matches)
      );
    },
    flagCode() {
      if (this.$l2) return this.$languages.countryCode(this.$l2);
    },
    canShare() {
      return typeof navigator !== "undefined" && navigator.share;
    },
    native() {
      return Capacitor.isNativePlatform();
    },
    pro() {
      return this.forcePro || this.$store.state.subscriptions.active;
    },
  },
  watch: {
    $route() {
      this.hideLanguagesModal();
      this.hideSettingsModal();
    },
  },
  methods: {
    hasDashboard() {
      return (
        this.$auth.loggedIn &&
        this.$auth.user?.first_name &&
        this.$store.state.progress.progress &&
        Object.keys(this.$store.state.progress.progress).length > 0
      );
    },
    cycleFlags() {
      if (this.$refs.flag) this.$refs.flag.cycleFlags();
    },
    stopCycling() {
      if (this.$refs.flag) this.$refs.flag.stopCycling();
    },
    showPlaylistModal() {
      this.$refs["languages-modal"].show();
    },
    hideLanguagesModal() {
      this.$refs["languages-modal"].hide();
    },
    showSettingsModal() {
      this.$refs["settings-modal"].show();
    },
    hideSettingsModal() {
      this.$refs["settings-modal"].hide();
    },
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    async share() {
      if (document && document.location) {
        let canonicalURL = (document.location + "").replace(
          document.location.origin,
          "https://languageplayer.io"
        );
        if (this.native) {
          await Share.share({
            url: canonicalURL,
            dialogTitle: this.$tb("Share"),
          });
        } else if (this.canShare) {
          navigator.share({
            url: canonicalURL,
          });
        }
      }
    },
    reload() {
      location.reload();
    },
  },
};
</script>
<style lang="scss" scoped>
@import "@/components/SiteTopBar/styles.scss";
</style>
