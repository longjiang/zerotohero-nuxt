<template>
  <div class="language-map">
    <client-only>
      <l-map :zoom="4" :minZoom="5" :maxZoom="7" :center="[35, 105]">
        <l-tile-layer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        ></l-tile-layer>
        <l-marker
          v-for="(country, index) in countries"
          :lat-lng="[country.lat, country.long]"
          :key="`country-marker-${index}`"
          class="country-marker"
        >
          <l-icon class-name="country-marker-icon">
            <div class="country-marker-languages">
              <LanguageList
                :langs="country.languages.slice(0, 1)"
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
import axios from "axios";
import Config from "@/lib/config";
import Papa from "papaparse";
export default {
  data: () => ({
    countries: [],
  }),
  async created() {
    let res = await axios.get(`${Config.server}data/countries/countries.csv`);
    if (res && res.data) {
      let csv = res.data;
      let parsed = Papa.parse(csv, { header: true });
      if (parsed && parsed.data) {
        let countries = parsed.data.map((row) => {
          row.languages = row.languages ? row.languages.split(",") : [];
          if (row.languages.length > 1)
            row.languages = row.languages.filter((l) => l !== "en");
          if (row.languages.length > 1 && row.code !== "FR")
            row.languages = row.languages.filter((l) => l !== "fr");
          if (row.languages.length > 1 && row.code !== "ES")
            row.languages = row.languages.filter((l) => l !== "es");
          if (row.languages.length > 1)
            row.languages = row.languages.filter((l) => l !== "ar");
          if (row.languages.length > 1 && row.code !== "RU")
            row.languages = row.languages.filter((l) => l !== "ru");
          if (row.languages.length > 1 && row.code !== "DE")
            row.languages = row.languages.filter((l) => l !== "de");
          row.languages = row.languages.map((code) =>
            this.$languages.getSmart(code)
          );
          return row;
        });
        this.countries = countries;
      }
    }
  },
};
</script>

<style lang="scss" scoped>
.language-map {
  width: 100%;
  height: 40rem;
  max-height: 100vh;
  .country-marker-languages {
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