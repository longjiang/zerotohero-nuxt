<template>
  <container-query :query="query" v-model="params">
    <div
      :class="`site-top-bar site-top-bar-${variant}`"
      @click.self="backgroundClick"
    >
      <template>
        <div class="text-center">
          <span
            style="
              line-height: 2.3rem;
              color: #ccc;
              cursor: pointer;
              margin-right: 0.5rem;
            "
            @click="collapseClick"
          >
            <i class="fas fa-bars"></i>
          </span>
          <router-link to="/" class="link-unstyled">
            <img
              :class="`site-top-bar-logo ${
                params.sm === false ? 'd-none' : ''
              }`"
              src="/img/czh-icon.png"
              style="height: 1.5rem; margin-right: 0.25rem"
              data-not-lazy
            />
            <b :class="`text-white ${params.xlg === false ? 'd-none' : ''}`">
              zerotohero.ca
            </b>
          </router-link>
          <router-link
            :class="`text-white ${
              !$route.params.l2 || params.sm === false ? 'd-none' : ''
            }`"
            :to="{ name: 'home' }"
            class="link-unstyled language-flag-and-name"
          >
            <i
              class="fas fa-chevron-right"
              style="
                opacity: 0.5;
                font-size: 0.7em;
                margin-left: 0.15rem;
                margin-right: 0.15rem;
              "
            ></i>
            <span style="font-weight: bold; color: white">{{
              $route.params.l2
            }}</span>
            <span :class="`flagIcon ${!flagIcon ? 'd-none' : ''}`">{{
              flagIcon
            }}</span>
          </router-link>
        </div>
        <div>
          <client-only
            ><AnnotationSettings
              v-if="$l2 && params.lg"
              variant="toolbar"
              style="position: relative; bottom: -0.1rem"
          /></client-only>
          <router-link
            :to="languageMapPath"
            :class="`btn top-bar-button btn-unstyled link-unstyled ${
              params.md === false ? 'd-none' : ''
            }`"
          >
            <i class="fas fa-globe-asia"></i>
          </router-link>
          <button
            :class="`btn top-bar-button btn-unstyled ${
              isPWA && canShare() && params.lg ? '' : 'd-none'
            }`"
            @click="share"
            style="color: #ccc"
          >
            <i class="fa fa-share"></i>
          </button>
          <button
            :class="`btn top-bar-button btn-unstyled ${
              isPWA && params.lg ? '' : 'd-none'
            }`"
            @click="reload"
            style="color: #ccc"
          >
            <i class="fas fa-sync-alt"></i>
          </button>
          <LoginButton
            :class="`${$l2 && params.lg ? 'd-inline-block' : 'd-none'}`"
            :icon="true"
            :text="false"
            style="color: #ddd"
          />
        </div>
      </template>
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
      },
    };
  },
  props: {
    variant: {
      default: "menu-bar",
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
    flagIcon() {
      return this.$languages.flagIcon(this.$l2);
    },
  },
  methods: {
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
.site-top-bar {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  z-index: 4;
  background-color: rgb(29, 29, 29);
  padding: 0.25rem 0.75rem;

  a {
    color: #ccc;
    line-height: 2.3rem;

    &:hover {
      color: white;
    }
  }

  .btn {
    padding: 0 0 0 0.5rem;
  }

  &.site-top-bar-menu-bar {
    width: 100vw;
    position: sticky;
    top: 0;
    z-index: 3;
  }

  .language-flag-and-name {
    line-height: 1;
    text-overflow: ellipsis;
    max-width: 4.5rem;
    overflow: hidden;
    white-space: nowrap;
    display: inline-block;
    position: relative;
    bottom: -0.15rem;
    text-align: left;
  }
}
</style>