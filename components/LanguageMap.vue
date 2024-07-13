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
        <LanguageMapMarker
          v-for="(language, index) in filteredLanguages"
          :key="`language-marker-${index}`"
          :language="language"
          :current-lang="currentLang"
          :l1="l1"
          :show-phrases="!!phrases"
          :phrases="phrases"
          :diameter="diameter(language)"
          @marker-click="handleMarkerClick"
          @is-descendant="isDescendant"
        />
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
              :to="getPhraseLink(phrase)"
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
import { SERVER } from "@/lib/utils";
import Papa from "papaparse";
import "leaflet/dist/leaflet.css";
import { LANGS_WITH_CONTENT, uniqueByValue, formatK } from "@/lib/utils";
import LanguageMapper from "@/lib/language-mapper";
import LanguageMapMarker from "@/components/LanguageMapMarker.vue";

/**
 * @component
 * @description A component that renders an interactive map of languages using Leaflet
 */
export default {
  components: {
    LanguageMapMarker,
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
    "l-control-scale": async () => {
      if (process.client) {
        let { LControlScale } = await import("vue2-leaflet");
        return LControlScale;
      }
    },
  },
  props: {
    /**
     * @type {Array}
     * @description Array of language objects to be displayed on the map
     */
    langs: {
      type: Array,
    },
    /**
     * @type {Array}
     * @description Array of phrase objects associated with languages
     */
    phrases: {
      type: Array,
    },
    /**
     * @type {string}
     * @description Default language code
     */
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
    /**
     * @type {LanguageMapper}
     * @description Instance of LanguageMapper class for handling language data
     */
    languageMapper: null,
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
    /**
     * @returns {Object} English language object
     */
    english() {
      return this.$languages.l1s.find((language) => language.code === "en");
    },
    /**
     * @returns {Object} Arabic language object
     */
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
    /**
     * @description Initializes the languages to be displayed on the map
     */
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
    /**
     * @description Checks if one language is a descendant of another
     * @returns {boolean}
     */
    isDescendant() {
      return this.$languages.isDescendant(...arguments);
    },
    /**
     * @description Gets the L1 code for a given L2 language
     * @param {Object} l2 - L2 language object
     * @returns {string} L1 language code
     */
    getL1Code(l2) {
      let l2Settings = this.$store.getters["settings/l2Settings"](l2.code);
      if (l2Settings?.l1) {
        return l2Settings.l1;
      }
      return this.$browserLanguage;
    },
    /**
     * @description Generates a route object for a given language
     * @param {Object} l2 - L2 language object
     * @returns {Object} Route object
     */
    to(l2) {
      let l1Code = this.getL1Code(l2);
      let name = "l1-l2-language-info";
      return {
        name,
        params: { l1: l1Code, l2: l2.code },
      };
    },
    /**
     * @description Navigates to a language page
     * @param {Object} l2 - L2 language object
     */
    goTo(l2) {
      this.$router.push(this.to(l2));
    },
    /**
     * @description Opens phrases for a given language
     * @param {Object} l2 - L2 language object
     */
    openPhrases(l2) {
      let filteredPhrases = this.phrases.filter((phrase) => phrase.l2 === l2);
      if (filteredPhrases && filteredPhrases.length === 1) {
        let phrase = filteredPhrases[0];
        let path = this.getPhraseLink(phrase);
        this.$router.push(path);
      } else {
        this.modalPhrases = filteredPhrases;
        this.$refs["phrase-picker-modal"].show();
      }
    },
    /**
     * @description Initializes the map when it's ready
     * @param {Object} mapObj - Leaflet map object
     */
    ready(mapObj) {
      this.map = mapObj;
      let bounds = mapObj.getBounds();
      this.updateBounds(bounds);
      this.$emit("ready");
    },
    /**
     * @description Updates the URL when the map center changes
     * @param {Object} center - New map center coordinates
     */
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
    /**
     * @description Updates the displayed languages when map bounds change
     * @param {Object} bounds - New map bounds
     */
    updateBounds(bounds) {
      const boundsObj = {
        northEast: bounds._northEast,
        southWest: bounds._southWest,
      };
      this.filteredLanguages = this.languageMapper.filterLanguagesByBounds(this.languages, boundsObj);
      this.filterLanguages();
    },
    /**
     * @description Filters languages to prevent overlapping
     */
    filterLanguages() {
      this.filteredLanguages = this.languageMapper.filterOverlappingLanguages(this.filteredLanguages, this.currentZoom);
    },
    /**
     * @description Calculates the diameter of a language marker
     * @param {Object} language - Language object
     * @returns {number} Marker diameter
     */
    diameter(language) {
      return this.languageMapper.calculateMarkerDiameter(language, this.currentZoom);
    },
    /**
     * @description Updates the current zoom level
     * @param {number} zoom - New zoom level
     */
    updateZoom(zoom) {
      this.currentZoom = zoom;
    },
    /**
     * @description Checks if a dictionary feature exists for given languages
     * @param {Object} l1 - L1 language object
     * @param {Object} l2 - L2 language object
     * @returns {boolean}
     */
    hasDictionary(l1, l2) {
      console.log('language map', {l1, l2})
      return (
        this.$languages.hasFeature(l1, l2, "dictionary") || l2.code === "en"
      );
    },
    /**
     * @description Checks if YouTube feature exists for given languages
     * @param {Object} l1 - L1 language object
     * @param {Object} l2 - L2 language object
     * @returns {boolean}
     */
    hasYouTube(l1, l2) {
      return this.$languages.hasYouTube(l1, l2) || l2.code === "en";
    },
    /**
     * @description Loads country data from CSV
     * @returns {Promise<Array>} Array of country objects
     */
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
    /**
     * @description Moves the map view to a specific language
     * @param {Object} lang - Language object
     */
    goToLang(lang) {
      this.currentLang = lang;
      let zoomLevel = this.languageMapper.calculateLanguageZoomLevel(lang);
      this.map.flyTo([lang.lat, lang.long], zoomLevel, {
        animation: true,
      });
    },
    /**
     * @description Handles clicks on language markers
     * @param {Object} language - Clicked language object
     */
    handleMarkerClick(language) {
      if (!this.phrases) {
        this.goTo(language);
      } else {
        this.openPhrases(language);
      }
    },
    /**
     * @description Generates a link for a phrase
     * @param {Object} phrase - Phrase object
     * @returns {string} URL for the phrase
     */
    getPhraseLink(phrase) {
      return phrase.bookId === "wiktionary"
        ? `/${this.getL1Code(phrase.l2)}/${phrase.l2.code}/phrase/search/${encodeURIComponent(phrase.phrase)}/dict`
        : `/${this.getL1Code(phrase.l2)}/${phrase.l2.code}/phrasebook/${phrase.bookId}/${phrase.id}/${encodeURIComponent(phrase.phrase)}`;
    },
  },
};
</script>


<style lang="scss" scoped>
@import "../assets/scss/variables.scss";

.language-map {
  width: 100%;
  height: 100%;
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
</style>