<template>
  <container-query :query="query" v-model="params">
    <div
      :class="`site-top-bar site-top-bar-${
        wide ? 'wide' : 'not-wide'
      } site-top-bar-${skin}`"
    >
      <div class="site-top-bar-left">
        <b-button
          @click="$router.back()"
          variant="unstyled"
          v-if="$route.path !== '/'"
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
          v-if="!wide && $route.path !== '/'"
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
          <span v-if="!$route.params.l1 && !$route.params.l2">
            <router-link to="/go-pro" v-if="!pro" class="mr-2">
              🚀 {{ $tb("Go Pro") }}
            </router-link>
            <span
              to="/profile"
              class="mr-1"
              v-if="
                $auth && $auth.loggedIn && $auth.user && $auth.user.first_name
              "
            >
              <router-link to="/logout">{{ $tb("Logout") }}</router-link>
            </span>
            <span v-else>
              <router-link to="/login">{{ $tb("Login") }}</router-link>
            </span>
          </span>
        </client-only>
        <router-link
          v-if="$route.params.l1 && $route.params.l2"
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
          v-if="canShare"
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
              style="
                transform: scale(0.7);
                margin-right: -0.5rem;
                margin-bottom: -0.3rem;
              "
              :key="`top-bar-flag-${$l2.code}`"
              :autocycle="false"
              :language="$l2"
              class="ml-2"
            />
            <span :class="`${!$route.params.l2 ? 'd-none' : ''} ml-1`">
              <i
                class="fas fa-sort-down"
                style="position: relative; bottom: 0.2rem; opacity: 0.7"
              ></i>
            </span>
          </span>
        </div>
      </div>
      <b-modal
        ref="settings-modal"
        size="sm"
        centered
        hide-footer
        :title="$t('Quick Settings')"
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
        @show="onLanguagesModalShown"
      >
        <div class="languages-modal">
          <div class="mb-3">
            <router-link to="/dashboard" class="text-success">
              <i class="fas fa-chevron-left"></i>
              {{ $t("Back to Dashboard") }}
            </router-link>
          </div>
          <LazyDashboard class="mb-5" v-if="hasDashboard" />
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
import { ContainerQuery } from "vue-container-query";
import { mapState } from "vuex";
import { Capacitor } from "@capacitor/core";
import { Share } from "@capacitor/share";

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
    languageMapPath() {
      if (this.fullHistory) {
        let historyMatches = this.fullHistory
          .map((h) => h.path)
          .filter((path) => {
            if (path) {
              let r = this.$router.resolve(path);
              return r && r.route && ["language-map"].includes(r.route.name);
            }
          });
        let path = historyMatches.pop();
        if (path) return path;
      }
      return "/language-map";
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
    onLanguagesModalShown() {},
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
.flag-icon {
  position: relative;
  bottom: 0.1rem;
}
.site-top-bar {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  z-index: 20;
  line-height: 2.3;
  position: sticky;
  top: 0;
  padding: calc(env(safe-area-inset-top) + 0.25rem) 0.75rem 0.25rem 0.75rem;
  color: #777;
  font-size: 0.875rem;
  .btn,
  a {
    line-height: 2.3rem;
  }
  &.site-top-bar-light {
    background-color: white;
    .btn,
    a {
      color: #000000aa;
      &:hover {
        color: black;
      }
    }
  }
  &.site-top-bar-dark {
    background-color: black;
    .btn,
    a {
      color: #ffffffaa;
      &:hover {
        color: white;
      }
    }
  }
  .btn {
    margin: 0 0 0 0.3rem;
    padding: 0;
  }

  &.site-top-bar-menu-bar {
    width: 100vw;
    position: sticky;
    top: 0;
    z-index: 99;
  }

  .language-flag-and-name {
    line-height: 1;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: inline-block;
    position: relative;
    text-align: left;
  }
}

.zerotohero-wide {
  .site-top-bar {
    left: 13rem;
  }
  &.zerotohero-wide-collapsed {
    .site-top-bar {
      left: 5rem;
      width: calc(100% - 5rem);
    }
  }
  &:not(.zerotohero-with-nav) {
    .site-top-bar {
      left: 0;
      width: 100%;
    }
  }
}

.logo {
  height: 1.3rem;
  border-radius: 100%;
  &.logo-absolute-centered {
    position: absolute;
    left: calc(50% - 4.5rem);
    top: calc(0.25rem + env(safe-area-inset-top));
  }
  span {
    font-size: 0.9rem !important;
  }
}
</style>
