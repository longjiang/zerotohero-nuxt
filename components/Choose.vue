<template>
  <div>
    <div class="container">
      <div class="row">
        <div class="col-sm-12">
          <LanguageSwitch
            v-if="languages.length > 0"
            class="mt-3 mb-4"
            :preferredLanguages="languages"
          />
          <LanguageList :langs="languages" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LanguageLogo from "@/components/LanguageLogo";
import LanguageSwitch from "@/components/LanguageSwitch";

export default {
  components: {
    LanguageLogo,
    LanguageSwitch,
  },
  data() {
    return {
      languages: [],
      dictionaryCredit: "",
    };
  },
  methods: {
    language(code) {
      return this.$languages.l1s.find((language) => language.code === code);
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

    english() {
      return this.$languages.l1s.find((language) => language.code === "en");
    },
  },
  async mounted() {
    let dictionary = await this.$getDictionary();
    if (dictionary) {
      this.dictionaryCredit = await dictionary.credit();
    }
    this.languages = this.$languages.l1s
      .filter(
        (language) => ["A", "C", "L", "E", "H"].includes(language.type) // Only living, extinct or historical languages (exclusing special codes 'S' and macro languages 'M')
      )
      .filter((language) => this.$languages.hasYouTube(this.english, language))
      .filter((language) => language.code !== "fil")
      // .filter((language) =>
      //   this.hasFeature(this.english, language, "dictionary")
      // )
      .sort((a, b) => {
        if (a.name < b.name) {
          return -1;
        }
        if (a.name > b.name) {
          return 1;
        }
        return 0;
      });
  },
};
</script>

<style scoped>
.transparent {
  opacity: 0;
}

.logo-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.logo-grid > * {
  width: 13rem;
}

.bg-dark .text-dark {
  color: white !important;
}

.language-icons {
  background: url("/img/background-stars-2.jpg");
  background-repeat: no-repeat;
  background-size: cover;
}

@media (min-width: 576px) {
  .language-icons {
    border-radius: 0.5rem;
    margin: 0;
  }
}
</style>
