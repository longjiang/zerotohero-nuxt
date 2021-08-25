<template>
  <div class="language-map">
    <client-only>
      <l-map :zoom="4" :minZoom="3" :maxZoom="9" :center="[35, 105]">
        <l-tile-layer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        ></l-tile-layer>
        <l-marker
          v-for="(language, index) in languages"
          :lat-lng="[language.lat, language.long]"
          :key="`language-marker-${index}`"
          class="language-marker"
        >
          <l-icon class-name="language-marker-icon">
            <div class="language-marker-languages">
              <LanguageList
                :langs="[language]"
                skin="dark"
                :singleColumn="true"
              />
            </div>
          </l-icon>
        </l-marker>
      </l-map>
    </client-only>
  </div>
</template>

<script>
export default {
  data: () => ({
    languages: [],
  }),
  created() {
    this.languages = this.$languages.l1s.filter((l) => {
      if (!(l.lat && l.long)) return false;
      if (l["iso639-1"]) return true;
    });
  },
  computed: {
    english() {
      return this.$languages.l1s.find((language) => language.code === "en");
    },
  },
  methods: {
    hasDictionary(l1, l2) {
      return (
        this.$languages.hasFeature(l1, l2, "dictionary") || l2.code === "en"
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.language-map {
  width: 100%;
  height: 40rem;
  max-height: 100vh;
  .language-marker-languages {
    width: 12rem;
    margin-left: -6rem;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
    font-size: 1.2em;
    text-transform: uppercase;
    font-weight: bold;
    background-color: #00000088;
    padding: 0.3rem 0.6rem;
    border-radius: 0.3rem;
    border: 1px solid #88888888;
    margin-top: -100%;
    text-align: center;
    ::v-deep .language-list.language-list-dark .language-list-item {
      a {
        color: white;
      }
      .feature-icon {
        color: white;
        &.transparent {
          display: none;
        }
      }
    }
  }
}
</style>