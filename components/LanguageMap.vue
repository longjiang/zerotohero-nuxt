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
        <l-tile-layer :url="mapTileURL[mapStyle]"></l-tile-layer>
        <l-control-scale position="topright" :imperial="false" :metric="true"></l-control-scale>
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
        <div class="slider-control">
          <label for="magicScaleSlider">Adjust Marker Spacing:</label>
          <input
            id="magicScaleSlider"
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            v-model.number="magicScale"
          />
          <span>{{ magicScale.toFixed(1) }}</span>
        </div>
      </l-map>
      <b-modal ref="phrase-picker-modal" centered hide-footer :title="$tb('Which one?')" modal-class="safe-padding-top mt-4">
        <div class="phrase-picker-modal">
          <template v-for="(phrase, index) of modalPhrases">
            <router-link :to="getPhraseLink(phrase)" :key="`you-in-other-langs-${index}`" class="d-block link-unstyled text-left similar-phrase">
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
    magicScale: 2.2, // Initialize magicScale as a number
    languageMapper: null,
  }),
  created() {
    this.languageMapper = new LanguageMapper({
      minZoom: 3,
      maxZoom: 9,
    });
    this.magicScale = this.languageMapper.magicScale;
  },
  async mounted() {
    this.initialZoom = this.$route.query.z ? Number(this.$route.query.z) : 3;
    this.currentZoom = this.initialZoom;
    this.initialCenter = this.$route.query.c
      ? this.$route.query.c.split(",")
      : [35, 105];
    this.initLangs();
  },
  watch: {
    phrases() {
      this.initLangs();
    },
    magicScale(newScale) {
      this.languageMapper.setMagicScale(newScale);
      this.filterLanguages(); // Re-filter languages when magicScale changes
    },
  },
  methods: {
    formatK,
    uniqueByValue,
    updateMagicScale(event) {
      const scale = parseFloat(event.target.value);
      this.languageMapper.setMagicScale(scale);
      this.filterLanguages(); // Re-filter languages based on new magicScale
    },
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
        let path = this.getPhraseLink(phrase);
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
          `${Math.round(center.lat * 100) / 100},${Math.round(center.lng * 100) / 100}`
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
    handleMarkerClick(language) {
      if (!this.phrases) {
        this.goTo(language);
      } else {
        this.openPhrases(language);
      }
    },
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
.slider-control {
  position: absolute;
  bottom: 50px;
  left: 10px;
  background: white;
  padding: 10px;
  border-radius: 5px;
  z-index: 1000;
}
</style>
