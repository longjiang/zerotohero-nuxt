<router>
  {
    path: '/language-map',
    props: true,
    meta: {
      layout: 'full'
    }
  }
</router>
<template>
  <div>
    <SocialHead
      title="Map of World Languages | Zero to Hero Languages"
      description="Tap on any language label to learn the language! Live TV channels, TV shows with subtitles, music with lyrics, phrasebooks with video examples... everything that can help you to learn a language “by osmosis.”"
      image="/img/thumbnail-language-map.jpg"
    />
    <div class="container-fluid">
      <div
        class="row bg-dark text-white pt-2 pb-2 text-left"
        style="overflow: visible"
      >
        <div class="col-sm-12 d-flex" style="overflow: visible">
          <div class="mr-3 d-flex align-items-center">
            <router-link to="/" class="link-unstyled">
              <i class="fa fa-chevron-left mr-2"></i>
              Home
            </router-link>
          </div>
          <LanguageSwitch
            style="flex: 1; z-index: 999"
            :nav="false"
            @nav="onNav"
            :langs="filteredLangs"
          />
        </div>
      </div>
      <div class="row">
        <div class="col-12" style="height: calc(100vh - 54px); padding: 0">
          <div class="loader-wrapper" v-if="loadingMap">
            <Loader :sticky="true" message="Loading map, and plotting thousands of languages..." />
          </div>
          <client-only v-if="filteredLangsWithGeo">
            <LanguageMap
              style="height: 100%"
              ref="languageMap"
              :langs="filteredLangsWithGeo"
              @ready="onReady"
            />
          </client-only>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Helper from '@/lib/helper'
export default {
  data() {
    return {
      loadingMap: true,
      filteredLangsWithGeo: undefined,
      filteredLangs: undefined
    };
  },
  /**
   * Include the LanguageMap this way to avoid nuxt complaining 'window is not defined'
   * https://stackoverflow.com/questions/59347414/why-is-my-client-only-component-in-nuxt-complaining-that-window-is-not-define
   */
  components: {
    LanguageMap: () => {
      if (process.client) {
        return import("../components/LanguageMap.vue");
      }
    },
  },
  computed: {
    english() {
      return this.$languages.l1s.find((language) => language.code === "en");
    },
  },
  async mounted() {
    await Helper.timeout(100)
    this.filteredLangs = this.getFilteredLangs()
    this.filteredLangsWithGeo = this.getFilteredLangsWithGeo()
  },
  methods: {
    onReady() {
      this.loadingMap = false;
    },
    getFilteredLangs() {
      let languages = this.$languages.l1s;
      languages = languages.filter((l) => {
        if (["hbo", "enm", "arc", "grc", "sjn"].includes(l["iso639-3"]))
          return true;
        if (l["iso639-3"] === 'cmn') return false; // Mandarin overlaps Chinese, which is annoying
        if (l.name.includes("Sign Language")) return false;
        if (
          this.hasDictionary(this.english, l) ||
          this.hasYouTube(this.english, l)
        )
          return true;
        if (!l["iso639-3"]) return false;
        // if (["A", "E", "H"].includes(l.type)) return false;
        return true;
      });
      return languages;
    },
    getFilteredLangsWithGeo() {
      let languages = this.filteredLangs;
      languages = languages
        .filter((l) => {
          if (l.lat && l.long) return true;
        })
        .sort((a, b) => b.speakers - a.speakers);
      return languages;
    },
    hasDictionary(l1, l2) {
      return (
        this.$languages.hasFeature(l1, l2, "dictionary") || l2.code === "en"
      );
    },
    hasYouTube(l1, l2) {
      return this.$languages.hasYouTube(l1, l2) || l2.code === "en";
    },
    onNav(url, suggestion = undefined) {
      let l2;
      if (suggestion) {
        l2 = suggestion.l2;
      } else if (url) {
        let code = url.split("/")[2];
        l2 = this.$languages.getSmart(code);
      }
      if (l2) {
        if (l2.lat && l2.long) this.$refs.languageMap.goToLang(l2);
        else {
          let l1Code = "en";
          if (l2.code === "lzh") l1Code = "zh";
          let path = `/${l1Code}/${l2.code}/`;
          this.$router.push(path);
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.loader-wrapper {
  background: rgba(0, 0, 0, 0.66);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  color: white;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>