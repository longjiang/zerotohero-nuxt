<template>
  <div>
    <div class="container">
      <div class="row">
        <div class="col-sm-12">
          <LanguageSwitch
            v-if="languages && languages.length > 0"
            class="mt-3 mb-4"
            :preferredLanguages="languages"
          />
          <LanguageList
            v-if="showLanguageList && languages && languages.length > 0"
            :langs="languages"
            :sort="true"
            :skin="skin"
          />
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
  props: {
    skin: {
      default: "light",
    },
    showLanguageList: {
      default: true
    }
  },
  data() {
    return {
      languages: undefined,
    };
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
    this.languages = this.$languages.l1s.filter((language) => language.logo);
  },
  methods: {
    language(code) {
      return this.$languages.l1s.find((language) => language.code === code);
    },
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
