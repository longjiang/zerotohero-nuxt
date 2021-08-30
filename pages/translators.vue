<router>
  {
    path: '/translators',
    props: true,
    meta: {
      layout: 'full'
    }
  }
</router>
<template>
  <div class="bg-white" style="min-height: 100vh">
    <SocialHead
      title="Online Translators | Zero to Hero Languages"
      description="Check the availability of online translators for any given language."
      image="/img/thumbnail-language-icons.jpg"
    />
    <div class="container-fluid">
      <div
        class="row bg-dark text-white pt-2 pb-2 text-left"
        style="overflow: visible"
      >
        <div class="col-sm-12 d-flex" style="overflow: visible">
          <div
            class="d-flex align-items-center"
            style="width: 100%; justify-content: space-between"
          >
            <router-link to="/" class="link-unstyled d-block">
              <i class="fa fa-chevron-left mr-2"></i>
              Zero to Hero Languages
            </router-link>
            <router-link
              to="/language-map"
              class="btn btn-unstyled link-unstyled d-block"
            >
              <i class="fas fa-globe-asia"></i>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <div class="container" v-if="translators">
      <div class="row">
        <div class="col-sm-12 pt-5 pb-5 text-center">
          <h3>Online Translators</h3>
          <p>
            {{ filteredTranslators.length }} translators,
            {{ filteredLangs.length }} languages.
          </p>

          <b-input-group class="mt-5 mb-3 input-group-ghost-dark">
            <b-form-input
              v-model="keyword"
              @compositionend.prevent.stop="() => false"
              placeholder="Filter by language or country"
            />
            <b-input-group-append>
              <b-button variant="gray">
                <i class="fas fa-filter"></i>
              </b-button>
            </b-input-group-append>
          </b-input-group>
        </div>
      </div>
    </div>
    <div class="container-fluid">
      <div class="row">
        <div class="col-sm-12 pl-0 pr-0">
          <table
            class="table table-responsive"
            style="margin: 0 auto; max-width: 55rem"
          >
            <thead style="position: sticky; top: 0; background: #eee">
              <tr>
                <th>Language (Code)</th>
                <th
                  v-for="(t, i) in filteredTranslators"
                  :key="`translator-header-${i}`"
                >
                  {{ t.name.replace(" Translate", "") }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(lang, index) in filteredLangs" :key="`lang-${index}`">
                <th style="width: 19rem">
                  <LanguageList
                    :langs="[lang]"
                    :singleColumn="true"
                    :showCode="true"
                  />
                </th>
                <td
                  v-for="(t, i) in filteredTranslators"
                  :key="`translator-${index}-${i}`"
                >
                  <span v-if="t.langs && t.langs.includes(lang.code)">
                    <a
                      target="_blank"
                      style="color: rgb(177 140 129)"
                      :href="
                        t.url
                          ? t.url(
                              `I want to learn ${lang.name}.`,
                              t.code(lang),
                              t.code(english)
                            )
                          : t.home
                          ? t.home
                          : undefined
                      "
                    >
                      {{ t.name.replace(" Translate", "") }}
                    </a>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="row mt-5 mb-5">
        <div class="col-sm-12 text-center">
          <h4 class="mb-3">World Map of Languages</h4>
          <router-link to="/language-map">
            <div>
              <img
                src="/img/thumbnail-language-map.jpg"
                alt="World Language Map"
                class="rounded shadow img-fluid"
                style="max-width: 40rem"
              />
            </div>
          </router-link>
        </div>
      </div>
    </div>
    <footer class="bg-dark mt-5 p-5" style="z-index: -1">
      <div class="text-center" style="line-height: 1.2; font-size: 1.1em">
        <router-link class="link-unstyled text-white" to="/">
          <strong>ZERO TO HERO</strong>
          <span style="font-weight: 300">LANGUAGES</span>
        </router-link>
      </div>
    </footer>
  </div>
</template>

<script>
import Translators from "@/lib/translators";
import Helper from "@/lib/helper";
export default {
  data: () => ({
    googleImagesURLs: {},
    keyword: undefined,
    translators: Translators.get(),
  }),
  computed: {
    english() {
      return this.$languages.l1s.find((language) => language.code === "en");
    },
    filteredTranslators() {
      return this.translators.translators
        .filter((t) => t.id !== "panlex")
        .sort((a, b) => b.langs.length - a.langs.length);
    },
    languages() {
      let langs = [];
      for (let t of this.filteredTranslators) {
        if (typeof t.langs !== "undefined") langs = langs.concat(t.langs);
      }
      langs = Helper.unique(langs);
      let languages = [];
      for (let lang of langs) {
        let language = this.$languages.getSmart(lang);
        if (typeof language === "undefined") {
          // console.log('Undefined: ', lang)
        } else {
          languages.push(language);
        }
      }
      return languages.sort((a, b) => a.name.localeCompare(b.name));
    },
    filteredLangs() {
      let languages = this.languages;
      languages = languages.filter((l) => {
        if (this.keyword) {
          let keyword = this.keyword.toLowerCase();
          if (l["iso639-1"].includes(keyword)) return true;
          if (l["iso639-3"].includes(keyword)) return true;
          if (l["glottologId"].includes(keyword)) return true;
          if (l["glottologFamilyId"].includes(keyword)) return true;
          if (l["glottologParentId"].includes(keyword)) return true;
          if (l.name.toLowerCase().includes(keyword)) return true;
          let countries = l.country.filter((c) =>
            c.name.toLowerCase().includes(keyword)
          );
          if (countries.length > 0) return true;
          return false;
        }
        return true;
      });
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