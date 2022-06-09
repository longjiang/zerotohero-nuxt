<template>
  <div class="jw-study-aid-bible-map" :id="mapId"></div>
</template>

<script>
import Map from '@/lib/jw/Map'
import $ from "jquery";

export default {
  data() {
    return {
      map: undefined,
      plotmarks: [],
      mapId: "bible-map",
      places: [],
    };
  },
  props: {
    placesProp: undefined
  },
  async mounted() {
    this.places = this.placesProp || await this.getPlaces();
    this.drawMap(this.mapId);
  },
  methods: {
    drawMap(id) {
      // Create a div with Leaflet map
      this.map = new L.Map(id);

      var EsriWorldImagery = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
          maxZoom: 17, // Higher the number, closer you can zoom in
        }
      );

      this.map.addLayer(EsriWorldImagery);

      // Plot the locations on the leaflet map
      var plotmarks = [];
      for (let place of this.places) {
        var plotmark = this.plotOnMap(place, this.map);
        plotmarks.push(plotmark);
      }
      var group = new L.FeatureGroup(plotmarks);
      this.map.fitBounds(group.getBounds());
      if (this.map.getZoom() > 10) {
        this.map.setZoom(10);
      }
      this.plotmarks = plotmarks;
      this.$emit('mapLoaded')
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

    plotOnMap(place, map) {
      var plotll = new L.LatLng(place.lat, place.lon);

      var myIcon = L.divIcon({
        className: "jw-study-aid-place-icon",
        iconSize: new L.Point(800, 16),
        html:
          '<span class="label-inner"><i class="octicon octicon-primitive-dot"></i> ' +
          place.name +
          "</span>", // (' + place.verse + ')
      });
      if (place.type === "region") {
        myIcon = L.divIcon({
          className: "jw-study-aid-place-icon-region",
          iconSize: new L.Point(800, 16),
          html: '<span class="label-inner">' + place.name + "</span>", // (' + place.verse + ')
        });
      }
      var plotmark = new L.Marker(plotll, { icon: myIcon }); //
      plotmark.data = place;
      map.addLayer(plotmark);
      return plotmark;
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
.jw-study-aid-bible-map {
  height: 20rem;
}
</style>