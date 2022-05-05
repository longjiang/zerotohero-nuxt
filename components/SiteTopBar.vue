<template>
  <div :class="`site-top-bar site-top-bar-${variant}`">
    <template v-if="variant === 'menu-bar'">
      <div class="text-center">
        <router-link to="/" class="link-unstyled">
          zerotohero.ca<sup>🇨🇦</sup>
        </router-link>
      </div>
      <div>
        <AnnotationSettings variant="toolbar" style="position: relative; bottom: -0.1rem;"/>
        <router-link :to="languageMapPath" class="btn top-bar-button btn-unstyled link-unstyled">
          <i class="fas fa-globe-asia"></i>
        </router-link>
        <button :class="[
          'btn top-bar-button btn-unstyled',
          { 'd-none': !isPWA || !canShare() },
        ]" @click="share" style="color: #ccc">
          <i class="fa fa-share"></i>
        </button>
        <button :class="['btn top-bar-button btn-unstyled', { 'd-none': !isPWA }]" @click="reload" style="color: #ccc">
          <i class="fas fa-sync-alt"></i>
        </button>
        <LoginButton class="d-inline-block ml-1" :icon="true" :text="false" style="color: #ddd" />
      </div>
    </template>

    <template v-if="variant === 'side-bar'">
      <router-link to="/" class="link-unstyled">
        zerotohero.ca<sup>🇨🇦</sup>
      </router-link>
      <router-link :to="languageMapPath" class="link-unstyled">
        <i class="fas fa-globe-asia"></i>
      </router-link>
    </template>
  </div>
</template>
<script>
import AnnotationSettings from "./AnnotationSettings.vue";


export default {
    props: {
        variant: {
            default: "menu-bar"
        }
    },
    computed: {
        isPWA() {
            return ((typeof navigator !== "undefined" && navigator.standalone) ||
                (typeof window !== "undefined" &&
                    window.matchMedia("(display-mode: standalone)").matches));
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
                if (path)
                    return path;
            }
            return "/language-map";
        },
    },
    methods: {
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
    components: { AnnotationSettings }
}
</script>
<style lang="scss" scoped>
.site-top-bar {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  z-index: 2;
  background-color: rgb(29, 29, 29);
  position: absolute;
  padding: 0.25rem 1rem;

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

  &.site-top-bar-side-bar {
    margin-left: -1rem;
    padding-left: 1.5rem;
    margin-top: -2.6rem;
    background-color: rgba(29, 29, 29, 0.5);
  }
}
</style>