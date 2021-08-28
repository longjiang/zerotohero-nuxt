<router>
  {
    path: '/language-icons',
    props: true,
    meta: {
      layout: 'full'
    }
  }
</router>
<template>
  <div class="main" style="min-height: 100vh">
    <SocialHead
      title="Icons of World Languages | Zero to Hero Languages"
      description="Tap on any language label to learn the language! Live TV channels, TV shows with subtitles, music with lyrics, phrasebooks with video examples... everything that can help you to learn a language “by osmosis.”"
    />
    <div class="container">
      <div class="row">
        <div class="col-sm-12 pt-5 pb-5 text-center">
          <h3>Face of the Language</h3>
          <p>{{ filteredLangs.length }} languages are listed.</p>
        </div>
      </div>
      <div class="row">
        <div
          class="col-sm-4 col-md-3 col-lg-3 lang-item-column text-left p-4"
          v-for="lang in filteredLangs"
          :key="`lang-${lang.id}`"
        >
          <div class="lang-item">
            <router-link :to="`/en/${lang.code}/`">
              <img
                :src="`/img/logo-square/${lang.code}.jpeg`"
                class="lang-item-logo"
              />
            </router-link>
            <div class="lang-item-description mt-2">
              <span v-if="lang.logoDesc">
                {{ lang.logoDesc.replace(/ /g, " ") }}, a user of
                <router-link
                  :to="`/en/${lang.code}/`"
                  class="link-unstyled font-weight-bold"
                >
                  {{ lang.name }} ({{ lang.code }})
                </router-link>
                .
              </span>
              <span v-else>
                A user of
                <router-link
                  :to="`/en/${lang.code}/`"
                  class="link-unstyled font-weight-bold"
                >
                  {{ lang.name }} ({{ lang.code }})
                </router-link>
                .
              </span>
              <a
                v-if="wikipedia(lang)"
                :href="wikipedia(lang)"
                target="_blank"
                class="lang-item-code link-unstyled"
              >
                <i class="fab fa-wikipedia-w"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data: () => ({
    googleImagesURLs: {},
  }),
  computed: {
    english() {
      return this.$languages.l1s.find((language) => language.code === "en");
    },
    filteredLangs() {
      let languages = this.$languages.l1s;
      languages = languages
        .filter((l) => {
          if (l.logo && l.logo !== "") return true;
        })
        .sort((a, b) => a.name.localeCompare(b.name));
      return languages;
    },
  },
  methods: {
    googleImagesURL(l2) {
      return `https://www.google.com/searchbyimage?q=${l2.name}+language&image_url=https://www.zerotohero.ca/img/logo-square/${l2.code}.jpeg`;
    },
    wikipedia(l2) {
      if (l2.logoDesc && l2.logoDesc.includes("(")) {
        let term = l2.logoDesc.replace(/,.*/, "").replace(/ \(.*\)/, "");
        return `https://en.wikipedia.org/wiki/${term.replace(/\s/g, "_")}`;
      }
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
      if (l2) this.$refs.languageMap.goToLang(l2);
    },
  },
};
</script>

<style lang="scss" scoped>
.lang-item {
  height: 100%;
  .lang-item-logo {
    width: 5rem;
    height: 5rem;
    object-fit: cover;
    border-radius: 100%;
  }
  ::v-deep .lang-item-code {
    display: inline-block;
    background-color: rgb(241, 241, 241);
    color: rgb(143, 143, 143);
    padding: 0 0.4rem;
    border-radius: 0.25rem;
    font-size: 0.8em;
    bottom: 0.1rem;
    position: relative;
  }
}
</style>