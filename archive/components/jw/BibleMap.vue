<template>
  <div class="bible-map">
    <client-only>
      <l-map
        :zoom="initialZoom"
        :minZoom="3"
        :maxZoom="9"
        :center="initialCenter"
        @update:zoom="updateZoom"
        @ready="mapLoaded"
        ref="map"
      >
        <l-tile-layer :url="mapTileURL[mapStyle]"></l-tile-layer>
        <l-control-scale
          position="topright"
          :imperial="false"
          :metric="true"
        ></l-control-scale>
        <l-marker
          v-for="(place, index) in places"
          :lat-lng="[Number(place.lat), Number(place.lon)]"
          :key="`place-marker-${index}`"
        >
          <l-icon>
            <div
              :class="{
                'place-marker jw-study-aid-place-icon': true,
                'jw-study-aid-place-icon-region': place.type === 'region',
              }"
            >
              <span class="label-inner" v-if="place.type === 'region'">
                {{ place.name }}
              </span>
              <span class="label-inner" v-else>
                <i class="octicon octicon-primitive-dot"></i>
                {{ place.name }}
              </span>
            </div>
          </l-icon>
        </l-marker>
      </l-map>
    </client-only>
  </div>
</template>

<script>
import Map from "@/lib/jw/Map";
import $ from "jquery";
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
  data() {
    return {
      map: undefined,
      plotmarks: [],
      mapId: "bible-map",
      places: [],
      initialZoom: 3,
      initialCenter: [35, 105],
      currentZoom: 4,
      mapStyle: "satellite",
      mapTileURL: {
        street: "http://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        satellite:
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      },
    };
  },
  props: {
    placesProp: undefined,
  },
  async mounted() {
    this.places = this.placesProp || (await this.getPlaces());
  },
  methods: {
    mapLoaded() {
      this.centerMapToPlotmarks();
      this.$emit("mapLoaded");
    },
    updateZoom(zoom) {
      this.currentZoom = zoom;
    },
    centerMapToPlotmarks() {
      let map = this.$refs.map;
      console.log(map);
      if (map) {
        let latLongs = this.places.map((p) => [p.lat, p.lon]);
        map.fitBounds(latLongs);
      }
    },
    async getPlaces() {
      let places = [];
      let results = await Map.getPlacesCSV();
      for (let item of results.data) {
        let place = Map.createPlace(item);
        if (place !== undefined) {
          places.push(place);
        }
      }
      return places;
    },

    showInsightArticle(name) {
      let maps = this;
      this.wol.getInsightArticle(name, function (html, url) {
        maps.showArticle(html, url);
      });
    },

    addImageAtBottom(imgElem) {
      this.articleElem.append(imgElem);
    },

    addImageSrcAtBottom(src) {
      var image = $("<img />")[0];
      $(image).attr("src", src);
      this.addImageAtBottom(image);
    },

    showArticle(html, url) {
      let maps = this;
      maps.article = new Article({
        url: url,
        processFootnotesToggle: true,
        onArticleLoaded: function () {
          $(maps.articleElem).html("");
          $(maps.articleElem).append(maps.article.element);
          let pageNums = Article.getPageNumsFromHtml(html);
          let englishSym = maps.wol.getEnglishSymbolFromHtml(html);
          for (let pageNum of pageNums) {
            maps.addImageSrcAtBottom(
              maps.wol.getInsightPages(englishSym, pageNum)
            );
          }
        },
        onScriptureLoaded: function () {
          // var articleQuestionSource = new ArticleQuestionSource(maps.article)
          // var quiz = new Quiz(articleQuestionSource)
        },
        pointForm: true,
      });
    },
  },
};
</script>

<style>
.bible-map {
  height: 100%;
  width: 100%;
}

.jw-study-aid-place-icon-region {
  text-align: center;
  font-size: 1.75em;
  font-weight: bold;
  color: #444;
  text-transform: uppercase;
  position: relative;
}

.jw-study-aid-place-icon-region .label-inner {
  display: block;
  position: relative;
  bottom: 0.7em;
  left: 0.7em;
}


</style>