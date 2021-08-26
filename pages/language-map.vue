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
          <LanguageMap
            style="height: 100%"
            ref="languageMap"
            :langs="filteredLangs"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    english() {
      return this.$languages.l1s.find((language) => language.code === "en");
    },
    filteredLangs() {
      let languages = this.$languages.l1s;
      languages = languages
        .filter((l) => {
          if (!(l.lat && l.long)) return false;
          if (l.name.includes("Sign Language")) return false;
          if (["A", "E", "H"].includes(l.type)) return false;
          if (
            !this.hasDictionary(this.english, l) &&
            !this.hasYouTube(this.english, l)
          )
            return false;
          return true;
        })
        .sort((x, y) => y.speakers - x.speakers);
      return languages;
    },
  },
  methods: {
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
      if (l2) this.$refs.languageMap.goToLang(l2);
    },
  },
};
</script>

<style lang="scss" scoped>
</style>