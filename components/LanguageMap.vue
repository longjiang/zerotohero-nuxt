<template>
  <div class="language-map">
    <client-only>
      <l-map
        :zoom="initialZoom"
        :minZoom="3"
        :maxZoom="9"
        :center="initialCenter"
        @update:zoom="updateZoom"
        @update:bounds="updateBounds"
        @update:center="updateCenter"
        @ready="ready"
        ref="myMap"
      >
        <l-tile-layer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        ></l-tile-layer>
        <l-control-scale
          position="topright"
          :imperial="false"
          :metric="true"
        ></l-control-scale>
        <l-marker
          v-for="(language, index) in filteredLanguages"
          :lat-lng="[language.lat, language.long]"
          :key="`language-marker-${index}`"
        >
          <l-icon>
            <div :class="`language-marker-languages`">
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
import axios from "axios";
import Config from "@/lib/config";
import Papa from "papaparse";
export default {
  data: () => ({
    initialZoom: 3,
    initialCenter: [35, 105],
    languages: [],
    filteredLanguages: [],
    countries: [],
    overlapped: [],
    currentZoom: 4,
    chinaEthnicLangs: [
      "acn",
      "adi",
      "ami",
      "aou",
      "bca",
      "bfc",
      "bfs",
      "blr",
      "blt",
      "bnn",
      "bod",
      "clk",
      "cng",
      "cov",
      "cuq",
      "cuu",
      "dka",
      "dng",
      "doc",
      "dta",
      "duu",
      "evn",
      "giq",
      "gir",
      "giw",
      "gld",
      "gqu",
      "hmn",
      "hni",
      "iii",
      "jiu",
      "jiy",
      "kac",
      "kaz",
      "khb",
      "kir",
      "kkf",
      "kmc",
      "kor",
      "lay",
      "lhi",
      "lhu",
      "lic",
      "lis",
      "lkc",
      "lsh",
      "mjg",
      "mlm",
      "mmd",
      "mnc",
      "mon",
      "nru",
      "nuf",
      "nun",
      "nxq",
      "onp",
      "orh",
      "pcc",
      "pce",
      "peh",
      "pll",
      "pmi",
      "pmj",
      "prk",
      "pwn",
      "qxs",
      "raw",
      "rbb",
      "rus",
      "sce",
      "sdp",
      "sgp",
      "shx",
      "sjo",
      "slr",
      "stu",
      "swi",
      "tat",
      "tay",
      "tcl",
      "tdd",
      "tgk",
      "thi",
      "tji",
      "tjs",
      "tsj",
      "twm",
      "uig",
      "uzb",
      "vie",
      "vwa",
      "wbm",
      "yao",
      "ybe",
      "yuy",
      "zal",
      "zha",
      "zho",
    ],
    chineseDialects: [
      "cdo",
      "cjy",
      "cnp",
      "cpx",
      "csp",
      "czo",
      "hak",
      "hsn",
      "leiz1236",
      "mnp",
      "nan",
      "wuu",
      "yue",
    ],
  }),
  async created() {
    this.initialZoom = this.$route.query.z ? Number(this.$route.query.z) : 3;
    this.currentZoom = this.initialZoom
    this.initialCenter = this.$route.query.c
      ? this.$route.query.c.split(",")
      : [35, 105];
    let languages = this.$languages.l1s
      .filter((l) => {
        if (!(l.lat && l.long)) return false;
        if (l.name.includes("Sign Language")) return false;
        if (["A", "E", "H"].includes(l.type)) return false;
        if (!this.hasDictionary(this.english, l)) return false;
        return true;
      })
      .sort((x, y) => y.speakers - x.speakers);
    this.languages = languages;
  },
  computed: {
    english() {
      return this.$languages.l1s.find((language) => language.code === "en");
    },
    arabic() {
      return this.$languages.l1s.find((language) => language.code === "ar");
    },
  },
  methods: {
    ready(obj) {
      let bounds = obj.getBounds();
      this.updateBounds(bounds);
    },
    updateCenter(center) {
      console.log(center);
      if (typeof window !== "undefined") {
        window.history.replaceState(
          "",
          "",
          `?c=${Math.round(center.lat * 100) / 100},${
            Math.round(center.lng * 100) / 100
          }&z=${this.currentZoom}`
        );
      }
    },
    updateBounds(bounds) {
      this.filteredLanguages = this.languages.filter((l) => {
        return (
          l.lat < bounds._northEast.lat &&
          l.lat > bounds._southWest.lat &&
          l.long > bounds._southWest.lng &&
          l.long < bounds._northEast.lng
        );
      });
      this.filterLanguages();
    },
    filterLanguages() {
      let filteredLanguages = this.filteredLanguages;
      for (let language of this.languages) {
        let magicNumbers = {
          1: 8,
          2: 4,
          3: 2,
          4: 1,
          5: 0.5,
          6: 0.25,
          7: 0.125,
          8: 0.0625,
          9: 0.0375,
        };
        let magicScale = 2;
        if (filteredLanguages.includes(language)) {
          filteredLanguages = filteredLanguages
            .filter((l) => {
              let overlapped =
                l !== language &&
                Math.abs(l.lat - language.lat) <
                  magicNumbers[this.currentZoom] * magicScale &&
                Math.abs(l.long - language.long) <
                  magicNumbers[this.currentZoom] * magicScale * 6;
              return !overlapped;
            })
            .slice(0, 20);
        }
      }
      this.filteredLanguages = filteredLanguages;
    },
    updateZoom(zoom) {
      this.currentZoom = zoom;
    },
    hasDictionary(l1, l2) {
      return (
        this.$languages.hasFeature(l1, l2, "dictionary") || l2.code === "en"
      );
    },
    async loadCountries() {
      let res = await axios.get(`${Config.server}data/countries/countries.csv`);
      if (res && res.data) {
        let csv = res.data;
        let parsed = Papa.parse(csv, { header: true });
        if (parsed && parsed.data) {
          let countries = parsed.data.map((row) => {
            row.languages = row.languages ? row.languages.split(",") : [];
            return row;
          });
          return countries;
        }
      }
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
    &.language-marker-languages-overlap {
      background-color: red;
    }
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