<template>
  <div>
    <div class="container">
      <div class="row">
        <div class="col-sm-12">
          <ul v-if="languages && languages.length > 0" class="language-list">
            <li
              v-for="language in languages"
              :key="`lang-${language.code}`"
              class="language-list-item"
              :set="(base = `/en/${language.code}`)"
            >
              <router-link :to="`${base}/bible`">
                {{ language.name }}
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
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
    hasFeature(l1, l2, feature) {
      return this.$languages
        .getFeatures(
          {
            l1,
            l2,
          },
          process.browser
        )
        .includes(feature);
    },
  },
  computed: {
    english() {
      return this.$languages.l1s.find((language) => language.code === "en");
    },
  },
  async mounted() {
    this.languages = this.$languages.l1s
      .filter((language) => language.wol)
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

.language-list {
  color: #666;
  list-style: none;
  padding: 0;
  column-gap: 2rem;
}

@media (min-width: 576px) {
  .language-list {
    column-count: 1;
  }
}

@media (min-width: 768px) {
  .language-list {
    column-count: 2;
  }
}

@media (min-width: 992px) {
  .language-list {
    column-count: 3;
  }
}

@media (min-width: 1200px) {
  .language-list {
    column-count: 4;
  }
}

.language-list-item a {
  color: #666;
}
.language-list-item .feature-icon {
  color: #ccc;
}

.bg-dark .language-list-item a {
  color: #b9aba6;
}
.bg-dark .language-list-item .feature-icon {
  color: #726661;
}
</style>
