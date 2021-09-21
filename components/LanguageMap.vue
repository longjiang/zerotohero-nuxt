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
          @click="!phrases ? goTo(language) : openPhrases(language)"
        >
          <l-icon>
            <div
              :class="{
                'language-marker': true,
                'language-marker-current': language === currentLang,
                'language-marker-current-child': isDescendant(
                  language,
                  currentLang
                ),
              }"
            >
              <div
                :class="`language-marker-size language-marker-size-family-${language.glottologFamilyId}`"
                :style="`width: ${diameter(language)}px; height: ${diameter(
                  language
                )}px; left: calc(50% - ${diameter(
                  language
                )}px / 2); top: calc(50% - ${diameter(language)}px / 2);`"
              ></div>
              <LanguageList
                v-if="!phrases"
                :langs="[language]"
                :singleColumn="true"
                variant="icon"
                skin="dark"
                class="language-marker-language-list"
              />
              <div
                v-if="phrases"
                :class="{
                  'text-center': true,
                }"
                class="language-marker-phrases"
              >
                <div
                  :set="
                    (filteredPhrases = phrases.filter(
                      (phrase) => phrase.l2 === language
                    ))
                  "
                >
                  <span
                    v-for="(phrase, index) in filteredPhrases"
                    :key="`you-in-other-langs-${index}`"
                    class="
                      language-marker-phrases-phrase
                      d-inline-block
                      link-unstyled
                      mr-1
                      ml-1
                    "
                  >
                    <span class="similar-phrase-l2">
                      {{ phrase.phrase }}
                      <template v-if="index < filteredPhrases.length - 1">
                        ,
                      </template>
                    </span>
                  </span>
                </div>
                <span class="language-marker-phrases-language">
                  {{ language.name }}
                </span>
              </div>
            </div>
          </l-icon>
        </l-marker>
      </l-map>
      <b-modal
        ref="phrase-picker-modal"
        centered
        hide-footer
        title="Which one?"
      >
        <div class="phrase-picker-modal">
          <router-link
            v-for="(phrase, index) of modalPhrases"
            :to="`/en/${phrase.l2.code}/phrasebook/${phrase.bookId}/${
              phrase.id
            }/${encodeURIComponent(phrase.phrase)}`"
            :key="`you-in-other-langs-${index}`"
            class="d-block link-unstyled text-left similar-phrase"
          >
            <span class="similar-phrase-l2">{{ phrase.phrase }}</span>
            <Speak :text="phrase.phrase" :l2="phrase.l2" />
            <span class="similar-phrase-language">
              <em>{{ phrase.en }}</em>
              in {{ phrase.l2.name }}
            </span>
          </router-link>
        </div>
      </b-modal>
    </client-only>
  </div>
</template>

<script>
import axios from "axios";
import Config from "@/lib/config";
import Papa from "papaparse";
import Helper from "@/lib/helper";
import "leaflet/dist/leaflet.css";

export default {
  components: {
    "l-map": async () => {
      if (process.client) {
        let { LMap } = await import("vue2-leaflet");
        return LMap;
      }
    },
    "l-tile-layer": async () => {
      if (process.client) {
        let { LTileLayer } = await import("vue2-leaflet");
        return LTileLayer;
      }
    },
    "l-marker": async () => {
      if (process.client) {
        let { LMarker } = await import("vue2-leaflet");
        return LMarker;
      }
    },
    "l-icon": async () => {
      if (process.client) {
        let { LIcon } = await import("vue2-leaflet");
        return LIcon;
      }
    },
    "l-control-scale": async () => {
      if (process.client) {
        let { LControlScale } = await import("vue2-leaflet");
        return LControlScale;
      }
    },
  },
  props: {
    langs: {
      type: Array,
    },
    phrases: {
      type: Array,
    },
  },
  data: () => ({
    initialZoom: 3,
    initialCenter: [35, 105],
    languages: [],
    filteredLanguages: [],
    modalPhrases: [],
    countries: [],
    overlapped: [],
    currentZoom: 4,
    map: undefined,
    currentLang: undefined,
  }),
  async mounted() {
    this.initialZoom = this.$route.query.z ? Number(this.$route.query.z) : 3;
    this.currentZoom = this.initialZoom;
    this.initialCenter = this.$route.query.c
      ? this.$route.query.c.split(",")
      : [35, 105];
    this.initLangs();
  },
  computed: {
    english() {
      return this.$languages.l1s.find((language) => language.code === "en");
    },
    arabic() {
      return this.$languages.l1s.find((language) => language.code === "ar");
    },
  },
  watch: {
    phrases() {
      this.initLangs();
    },
  },
  methods: {
    initLangs() {
      if (this.phrases) {
        let languages = this.phrases.map((p) => p.l2);
        languages = Helper.uniqueByValue(languages, "id");
        languages = languages.sort((a, b) => b.speakers - a.speakers);
        this.languages = languages;
        if (this.map) {
          let bounds = this.map.getBounds();
          this.updateBounds(bounds);
        }
      } else if (this.langs) {
        this.languages = this.langs;
      } else {
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
        this.languages = languages;
      }
    },
    isDescendant() {
      return this.$languages.isDescendant(...arguments);
    },
    goTo(l2) {
      let l1Code = "en";
      if (["hak", "nan", "lzh", "ltc", "och", "en"].includes(l2.code))
        l1Code = "zh";
      this.$router.push(`/${l1Code}/${l2.code}/`);
    },
    openPhrases(l2) {
      let filteredPhrases = this.phrases.filter((phrase) => phrase.l2 === l2);
      if (filteredPhrases && filteredPhrases.length === 1) {
        let phrase = filteredPhrases[0];
        let path = `/en/${phrase.l2.code}/phrasebook/${phrase.bookId}/${
          phrase.id
        }/${encodeURIComponent(phrase.phrase)}`;
        this.$router.push(path);
      } else {
        this.modalPhrases = filteredPhrases;
        this.$refs["phrase-picker-modal"].show();
      }
    },
    ready(mapObj) {
      this.map = mapObj;
      let bounds = mapObj.getBounds();
      this.updateBounds(bounds);
      this.$emit("ready");
    },
    updateCenter(center) {
      if (typeof window !== "undefined") {
        if ("URLSearchParams" in window) {
          var searchParams = new URLSearchParams(window.location.search);
          searchParams.set(
            "c",
            `${Math.round(center.lat * 100) / 100},${
              Math.round(center.lng * 100) / 100
            }`
          );
          searchParams.set("z", this.currentZoom);
          window.history.replaceState("", "", `?${searchParams.toString()}`);
          this.$nuxt.$emit(
            "history",
            window.location.pathname + window.location.search
          );
        }
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
    diameter(language) {
      return (
        ((Math.sqrt(language.speakers / Math.PI) / Math.pow(10, 3)) *
          Math.pow(this.currentZoom, 3 - this.currentZoom * 0.14)) /
        2.5
      );
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
                  magicNumbers[this.currentZoom] * magicScale * 3;
              return !overlapped;
            })
            .slice(0, 50);
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
    hasYouTube(l1, l2) {
      return this.$languages.hasYouTube(l1, l2) || l2.code === "en";
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
    goToLang(lang) {
      this.currentLang = lang;
      let x = lang.speakers ? Math.max(Math.log10(lang.speakers), 0) : 0;
      let minZoom = 6;
      let maxZoom = 11;
      let zoomLevel = maxZoom - ((maxZoom - minZoom) / 9) * x;
      this.map.flyTo([lang.lat, lang.long], zoomLevel, {
        animation: true,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.language-map {
  width: 100%;
  height: 40rem;
  max-height: 100vh;
  .language-marker {
    width: 10rem;
    margin-left: -5rem;
    text-shadow: 0 1px 10px rgba(0, 0, 0, 1);
    font-size: 1.2em;
    // background-color: #00000088;
    padding: 0.3rem 0.6rem;
    border-radius: 0.3rem;
    // border: 1px solid #88888888;
    margin-top: -100%;
    text-align: center;
    position: relative;
    .language-marker-language-list {
      text-transform: uppercase;
      font-weight: bold;
    }
    .language-marker-phrases {
      .language-marker-phrases-language {
        color: #ddd;
        display: inline-block;
      }
      .language-marker-phrases-phrase {
        color: white;
        font-size: 1.2em;
        font-weight: bold;
        font-style: italic;
      }
    }
    .language-marker-size {
      background-color: #000000;
      opacity: 0.5;
      position: absolute;
      z-index: -1;
      border-radius: 100%;
      pointer-events: none;
      &.language-marker-size-family-atla1278 {
        // Atlantic-Congo
        background-color: #03cea4;
      }

      &.language-marker-size-family-aust1307 {
        // Austronesian
        background-color: #8c2d7e;
      }

      &.language-marker-size-family-indo1319 {
        // Indo-European
        background-color: #004cc5;
      }

      &.language-marker-size-family-sino1245 {
        // Sino-Tibetan
        background-color: #ff0000;
      }

      &.language-marker-size-family-afro1255 {
        // Afro-Asiatic
        background-color: #eac435;
      }

      &.language-marker-size-family-nucl1709 {
        // Nuclear Trans New Guinea 
        background-color: #77c96d;
      }

      &.language-marker-size-family-turk1311 {
        // Turkic
        background-color: #1c949d;
      }

      &.language-marker-size-family-drav1251 {
        // Dravidian
        background-color: #60438a;
      }

      &.language-marker-size-family-aust1305 {
        // Austroasiatic
        background-color: #b81772;
      }

      &.language-marker-size-family-taik1256 {
        // Tai-Kadai
        background-color: #b1c751;
      }
    }
    ::v-deep .language-list-item {
      a {
        pointer-events: none;
      }
    }
    &.language-marker-current {
      .language-marker-size {
        background-color: #fd4f1c88;
      }
      ::v-deep .language-list-item {
        a {
          color: white;
        }
        .feature-icon {
          color: white;
        }
      }
    }
    &.language-marker-current-child {
      .language-marker-size {
        background-color: #fd4f1c88;
      }
      ::v-deep .language-list-item {
        a {
          color: white;
        }
        .feature-icon {
          color: white;
        }
      }
    }
  }
}
.phrase-picker-modal {
  .similar-phrase {
    .similar-phrase-l2 {
      font-weight: bold;
      color: #c59f94;
      font-size: 1.5em;
      font-style: italic;
    }
  }
}
</style>