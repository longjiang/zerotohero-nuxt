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
        class="language-map-top-bar row"
        style="overflow: visible"
      >
        <div class="col-sm-12 d-flex" style="overflow: visible">
          <div class="mr-3 d-flex align-items-center">
            <router-link to="/" class="link-unstyled">
              <img src="/img/czh-icon.png" style="height: 1.5rem" />
            </router-link>
          </div>
          <div class="mr-1 d-flex align-items-center">L1</div>
          <b-form-select
            v-model="l1"
            :options="l1s"
            class="mr-2"
            style="display: inline-block; width: 3.7rem"
          ></b-form-select>
          <div class="mr-1 d-flex align-items-center">L2</div>
          <LanguageSwitch
            style="flex: 1; z-index: 999"
            :nav="false"
            @nav="onNav"
            :button="false"
            :showRandom="false"
            :langs="filteredLangs"
          />
        </div>
      </div>
      <div class="row">
        <div class="col-12" style="height: calc(100vh - 54px); padding: 0">
          <div class="loader-wrapper" v-if="loadingMap">
            <Loader
              :sticky="true"
              message="Loading map, and plotting thousands of languages..."
            />
          </div>
          <client-only v-if="filteredLangsWithGeo">
            <LanguageMap
              style="height: 100%"
              ref="languageMap"
              :langs="filteredLangsWithGeo"
              @ready="onReady"
              :key="`language-map-${languagesKey}`"
              :l1="l1"
            />
          </client-only>
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
      l1: "en",
      l1s: [
        {
          value: "en",
          text: "English",
        },
        {
          value: "zh",
          text: "中文",
        },
      ],
      loadingMap: true,
      filteredLangsWithGeo: undefined,
      filteredLangs: undefined,
      languagesKey: 0,
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
    l1Lang() {
      return this.$languages.l1s.find((language) => language.code === this.l1);
    },
  },
  async mounted() {
    await Helper.timeout(100);
    this.updateLanguages();
  },
  watch: {
    l1() {
      this.updateLanguages();
    },
  },
  methods: {
    onReady() {
      this.loadingMap = false;
    },
    updateLanguages() {
      this.filteredLangs = this.getFilteredLangs();
      this.filteredLangsWithGeo = this.getFilteredLangsWithGeo();
      this.languagesKey++;
    },
    getFilteredLangs() {
      let languages = this.$languages.l1s;
      languages = languages.filter((l) => {
        // if (["hbo", "enm", "arc", "grc", "sjn", "ang", "non"].includes(l["iso639-3"]))
        //   return true;
        if (l["iso639-3"] === "cmn") return false; // Mandarin overlaps Chinese, which is annoying
        if (!l["iso639-3"]) return false;
        // if (["A", "E", "H"].includes(l.type)) return false;
        if (!this.hasDictionary(this.l1Lang, l)) return false;
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
          let l1Code = this.l1;
          let path = `/${l1Code}/${l2.code}/`;
          this.$router.push(path);
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.language-map-top-bar {
  padding: calc(env(safe-area-inset-top) + 0.25rem) 0.75rem 0.25rem 0.75rem;
  background-color: rgb(29, 29, 29);
  color: white;
}
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