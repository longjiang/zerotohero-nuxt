<template>
  <container-query :query="query" v-model="params">
    <div
      :class="`site-top-bar site-top-bar-${variant}`"
      @click.self="backgroundClick"
    >
      <div>
        <span
          style="
            color: #ccc;
            cursor: pointer;
            margin-right: 0.5rem;
            position: relative;
            bottom: -0.1rem;
          "
          @click="collapseClick"
          :class="{ 'd-none': variant === 'menu-bar' }"
        >
          <i class="fas fa-bars"></i>
        </span>
        <b-button
          @click="$router.back()"
          variant="unstyled"
          style="color: #ccc"
          v-if="params.lg !== false"
        >
          <i class="fas fa-chevron-left"></i>
        </b-button>
        <b-button
          @click="$router.forward()"
          variant="unstyled"
          style="color: #ccc"
          class="ml-3"
          v-if="params.lg !== false"
        >
          <i class="fas fa-chevron-right"></i>
        </b-button>
        <div
          class="d-inline-block"
          @mouseover="cycleFlags"
          @mouseleave="stopCycling"
          v-if="params.lg !== false"
        >
          <span
            :class="`text-white`"
            @click="showPlaylistModal"
            class="language-flag-and-name"
            style="cursor: pointer"
          >
            <LanguageFlag
              v-if="!(!flagCode || !$route.params.l2 || params.md === false)"
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
            <span
              :class="`${
                !$route.params.l2 || params.md === false ? 'd-none' : ''
              } ml-1`"
            >
              <i
                class="fas fa-sort-down"
                style="position: relative; bottom: 0.2rem; opacity: 0.7"
              ></i>
            </span>
          </span>
        </div>
      </div>
      <client-only>
        <AnnotationSettings v-if="$l2 && params.md" variant="toolbar" />
      </client-only>
      <template>
        <div>
          <router-link
            id="site-top-bar-saved-words"
            :to="{ name: 'youtube-search' }"
            :class="`btn top-bar-buttontop btn-unstyled link-unstyled mr-1`"
            v-if="params.xs !== false"
            title="Search Videos"
          >
            <i class="fas fa-search"></i>
          </router-link>
          <router-link
            id="site-top-bar-saved-words"
            :to="$auth.loggedIn ? { name: 'profile' } : { name: 'login' }"
            :class="`btn top-bar-button top-bar-user-button  btn-unstyled link-unstyled ml-2 ${
              badge ? '' : 'd-none'
            }`"
          >
            <i class="fas fa-user"></i>
            <span class="saved-words-count">
              {{ badge }}
            </span>
          </router-link>
        </div>
      </template>
      <b-modal
        ref="languages-modal"
        size="lg"
        centered
        hide-footer
        title="Choose a language to learn"
        body-class="languages-modal-wrapper"
        @show="onLanguagesModalShown"
      >
        <div class="languages-modal">
          <div class="mb-3">
            <router-link to="/" class="text-success">
              <i class="fas fa-chevron-left"></i>
              Back to home page
            </router-link>
          </div>
          <b-form-input
            v-model="keyword"
            @compositionend.prevent.stop="() => false"
            placeholder="Search for more languages"
            class="mb-3"
          />
          <LanguageList
            @click="hideLanguagesModal"
            :showSpeakers="false"
            :keyword="keyword"
            variant="grid"
            :showFeatures="false"
            :sort="true"
            :showFlags="true"
          />
          <div class="text-center mt-1">
            <router-link class="btn btn-success d-block" to="/language-map">
              <i class="fas fa-globe-asia mr-1"></i>
              More Languages
              <i class="ml-1 fas fa-chevron-right"></i>
            </router-link>
          </div>
        </div>
      </b-modal>
    </div>
  </container-query>
</template>
<script>
import AnnotationSettings from "./AnnotationSettings.vue";
import { ContainerQuery } from "vue-container-query";

export default {
  components: { AnnotationSettings, ContainerQuery },
  data() {
    return {
      keyword: undefined,
      params: {},
      query: {
        sm: {
          minWidth: 75,
        },
        md: {
          minWidth: 150,
        },
        lg: {
          minWidth: 320,
        },
        xlg: {
          minWidth: 350,
        },
        xxlg: {
          minWidth: 370,
        },
      },
    };
  },
  props: {
    variant: {
      default: "menu-bar",
    },
    badge: {
      type: [String, Number],
    },
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
    isPWA() {
      return (
        (typeof navigator !== "undefined" && navigator.standalone) ||
        (typeof window !== "undefined" &&
          window.matchMedia("(display-mode: standalone)").matches)
      );
    },
    languageMapPath() {
      if (this.fullHistory) {
        let historyMatches = this.fullHistory.filter((path) => {
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
  },
  watch: {
    $route() {
      this.hideLanguagesModal();
    },
  },
  methods: {
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
    onLanguagesModalShown() {},
    backgroundClick() {
      if (this.variant === "menu-bar") this.scrollToTop();
    },
    collapseClick() {
      if (this.variant === "side-bar") this.toggleCollapsed();
      else this.scrollToTop();
    },
    toggleCollapsed() {
      this.$emit("toggleCollapsed");
    },
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    canShare() {
      return typeof navigator !== "undefined" && navigator.share;
    },
    share() {
      if (navigator.share) {
        navigator.share({
          url: location.href,
        });
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
.top-bar-button {
  position: relative;
  .saved-words-count {
    position: absolute;
    font-size: 0.5em;
    bottom: 18px;
    top: inherit;
    right: -5px;
  }
}
.site-top-bar {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  z-index: 4;
  line-height: 2.3;
  background-color: rgb(29, 29, 29);
  padding: calc(env(safe-area-inset-top) + 0.25rem) 0.75rem 0.25rem 0.75rem;

  a {
    color: #ccc;
    line-height: 2.3rem;

    &:hover {
      color: white;
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
    z-index: 9;
  }

  .language-flag-and-name {
    line-height: 1;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    display: inline-block;
    position: relative;
    bottom: -0.15rem;
    text-align: left;
  }
}

.top-bar-user-button {
  background: #5a5a5a;
  width: 2.3rem;
  height: 2.3rem;
  display: inline-block;
  vertical-align: middle;
  border-radius: 100%;
  font-size: 1.2rem;
  line-height: 3rem;
  position: relative;
  bottom: 0.07rem;
}
</style>