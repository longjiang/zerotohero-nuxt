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
          :url="mapTileURL[mapStyle]"
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
                variant="icon"
                skin="dark"
                class="language-marker-language-list"
                :langs="[language]"
                :singleColumn="true"
                :showFeatures="false"
                :l1="l1"
              />
              <span class="word-count" v-if="language.wiktionary">{{ $tb('{num} word(s)', {num: formatK(language.wiktionary || 0, 1, $browserLanguage) }) }}</span>
              <div
                v-if="phrases"
                :class="{
                  'text-center': true,
                }"
                class="language-marker-phrases"
              >
                <div
                  :set="
                    (filteredPhrases = uniqueByValue(
                      phrases.filter((phrase) => phrase.l2 === language),
                      'phrase'
                    ))
                  "
                  :set2="
                    (maxPhraes = Math.max(
                      Math.ceil(Math.log(language.speakers) / 9),
                      1
                    ))
                  "
                  class="language-marker-phrases-phrase"
                  :direction="language.direction === 'rtl' ? 'rtl' : 'ltr'"
                >
                  <span
                    v-for="(phrase, index) in filteredPhrases.slice(
                      0,
                      maxPhraes
                    )"
                    :key="`you-in-other-langs-${index}`"
                    class="d-inline-block link-unstyled mr-1 ml-1"
                  >
                    <span class="similar-phrase-l2">
                      {{ phrase.phrase }}
                      <span
                        v-if="
                          index <
                          Math.min(filteredPhrases.length - 1, maxPhraes - 1)
                        "
                      >
                        ,
                      </span>
                    </span>
                  </span>
                  <span v-if="filteredPhrases.length > maxPhraes">...</span>
                </div>
                <span class="language-marker-phrases-language">
                  {{ $tb(language.name) }}
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
        :title="$tb('Which one?')"
        modal-class="safe-padding-top mt-4"
      >
        <div class="phrase-picker-modal">
          <template v-for="(phrase, index) of modalPhrases">
            <router-link
              :to="
                phrase.bookId === 'wiktionary'
                  ? `/${getL1Code(phrase.l2)}/${phrase.l2.code}/phrase/search/${encodeURIComponent(
                      phrase.phrase
                    )}/dict`
                  : `/${getL1Code(phrase.l2)}/${phrase.l2.code}/phrasebook/${phrase.bookId}/${
                      phrase.id
                    }/${encodeURIComponent(phrase.phrase)}`
              "
              :key="`you-in-other-langs-${index}`"
              class="d-block link-unstyled text-left similar-phrase"
            >
              <span class="similar-phrase-l2">{{ phrase.phrase }}</span>
              <Speak :text="phrase.phrase" :l2="phrase.l2" />
              <span class="similar-phrase-language">
                "{{ $tb(phrase.en) }}" ({{ $tb(phrase.l2.name) }})
              </span>
            </router-link>
          </template>
        </div>
      </b-modal>
    </client-only>
  </div>
</template>

<script>
import axios from "axios";
import { SERVER } from "../lib/utils";
import Papa from "papaparse";
import "leaflet/dist/leaflet.css";
import { LANGS_WITH_CONTENT, uniqueByValue, formatK } from "../lib/utils";
import LanguageMapper from "@/lib/language-mapper"; // Import the new class

/**
 * @component
 * This component creates an interactive language map using Leaflet
 */
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
    l1: {
      default: 'en'
    }
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
    mapStyle: 'street',
    mapTileURL: {
      street: 'http://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
      satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    },
    languageMapper: null, // New property to hold the LanguageMapper instance
  }),
  created() {
    this.languageMapper = new LanguageMapper({
      minZoom: 3,
      maxZoom: 9,
    });
  },
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
    formatK,
    uniqueByValue,
    initLangs() {
      if (this.phrases) {
        let languages = this.phrases.map((p) => p.l2).filter(l2 => l2);
        languages = uniqueByValue(languages, "id");
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
        languages = this.languageMapper.filterLanguages(
          languages,
          (l) => this.hasDictionary(this.english, l),
          (l) => this.hasYouTube(this.english, l)
        );
        this.languages = languages;
      }
    },
    isDescendant() {
      return this.$languages.isDescendant(...arguments);
    },
    getL1Code(l2) {
      let l2Settings = this.$store.getters["settings/l2Settings"](l2.code);
      if (l2Settings?.l1) {
        return l2Settings.l1;
      }
      return this.$browserLanguage;
    },
    to(l2) {
      let l1Code = this.getL1Code(l2);
      let name = "l1-l2-language-info";
      return {
        name,
        params: { l1: l1Code, l2: l2.code },
      };
    },
    goTo(l2) {
      this.$router.push(this.to(l2));
    },
    openPhrases(l2) {
      let filteredPhrases = this.phrases.filter((phrase) => phrase.l2 === l2);
      if (filteredPhrases && filteredPhrases.length === 1) {
        let phrase = filteredPhrases[0];
        let path =
          phrase.bookId === "wiktionary"
            ? `/${this.getL1Code(phrase.l2)}/${phrase.l2.code}/phrase/search/${encodeURIComponent(
                phrase.phrase
              )}/dict`
            : `/${this.getL1Code(phrase.l2)}/${phrase.l2.code}/phrasebook/${phrase.bookId}/${
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
      if (typeof window !== "undefined" && "URLSearchParams" in window) {
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
    },
    updateBounds(bounds) {
      const boundsObj = {
        northEast: bounds._northEast,
        southWest: bounds._southWest,
      };
      this.filteredLanguages = this.languageMapper.filterLanguagesByBounds(this.languages, boundsObj);
      this.filterLanguages();
    },
    filterLanguages() {
      this.filteredLanguages = this.languageMapper.filterOverlappingLanguages(this.filteredLanguages, this.currentZoom);
    },
    diameter(language) {
      return this.languageMapper.calculateMarkerDiameter(language, this.currentZoom);
    },
    updateZoom(zoom) {
      this.currentZoom = zoom;
    },
    hasDictionary(l1, l2) {
      console.log('language map', {l1, l2})
      return (
        this.$languages.hasFeature(l1, l2, "dictionary") || l2.code === "en"
      );
    },
    hasYouTube(l1, l2) {
      return this.$languages.hasYouTube(l1, l2) || l2.code === "en";
    },
    async loadCountries() {
      let res = await axios.get(`${SERVER}data/countries/countries.csv`);
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
      let zoomLevel = this.languageMapper.calculateLanguageZoomLevel(lang);
      this.map.flyTo([lang.lat, lang.long], zoomLevel, {
        animation: true,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../assets/scss/variables.scss";
.language-map {
  width: 100%;
  height: 100%;
  .language-marker {
    width: 10rem;
    margin-left: -5rem;
    text-shadow: 0 1px 10px rgba(0, 0, 0, 1);
    font-size: 1.2em;
    line-height: 1;
    padding: 0.3rem 0.6rem;
    border-radius: 0.3rem;
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
      opacity: 0.7;
      position: absolute;
      z-index: -1;
      border-radius: 100%;
      pointer-events: none;
      &.language-marker-size-family-atla1278 {
        background-color: #fd4f1c;
      }
      &.language-marker-size-family-aust1307 {
        background-color: #6a3669;
      }
      &.language-marker-size-family-indo1319 {
        background-color: #1b3e76;
      }
      &.language-marker-size-family-sino1245 {
        background-color: #bb1718;
      }
      &.language-marker-size-family-afro1255 {
        background-color: #f8b51e;
      }
      &.language-marker-size-family-nucl1709 {
        background-color: #0076ba;
      }
      &.language-marker-size-family-turk1311 {
        background-color: #005f58;
      }
      &.language-marker-size-family-drav1251 {
        background-color: $primary-color;
      }
      &.language-marker-size-family-aust1305 {
        background-color: #5b0516;
      }
      &.language-marker-size-family-taik1256 {
        background-color: #b1c751;
      }
    }
    :deep(.language-list-item) {
      a {
        pointer-events: none;
      }
    }
    &.language-marker-current {
      .language-marker-size {
        background-color: #fd4f1c88;
      }
      :deep(.language-list-item) {
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
      :deep(.language-list-item) {
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
      color: $primary-color;
      font-size: 1.5em;
      font-style: italic;
    }
  }
}

.word-count {
  font-size: 0.8em;
  opacity: 0.5;
}
</style>