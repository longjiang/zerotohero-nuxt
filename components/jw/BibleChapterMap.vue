<template>
  <div class="bible-chapter-map-container">
    <div :id="`bible-chapter-map-${id}`" class="bible-chapter-map">
      <BibleMap
        v-if="chapter && places"
        :placesProp="places"
        ref="biblemap"
        @mapLoaded="mapLoaded"
      />
    </div>
  </div>
</template>

<script>
import Map from "@/lib/Map";
import $ from "jquery";

export default {
  props: ["id", "chapter"],
  data() {
    return {
      places: undefined,
    };
  },
  async mounted() {
    let { places } = await this.findPlaceNames();
    if (places.length > 0) {
      this.places = places;
    }
  },
  methods: {
    mapLoaded() {
      let biblemap = this.$refs.biblemap;
      let chapter = this.chapter;
      for (let plotmark of biblemap.plotmarks) {
        plotmark.on("click", function () {
          $(mediaBar.mapElem).addClass("collapsed");
          $(chapter.resultElem)
            .find(".bible-place")
            .each(function () {
              if ($(this).text() === plotmark.data.name) {
                var vid = $(this).parents(".v").first().attr("id");
                var verseNum = BibleChapter.parseVerseId(vid).verseNum;
                chapter.highlightVerse(verseNum);
                chapter.scrollVerseIntoView(verseNum);
              }
            });
        });
      }
      $(chapter.resultElem)
        .find(".bible-place")
        .click(function (event) {
          event.stopPropagation();
          $(mediaBar.mapElem).removeClass("collapsed");
          var placeName = $(this).text();
          for (var plotmark of biblemap.plotmarks) {
            if (plotmark.data.name === placeName) {
              var group = new L.FeatureGroup([plotmark]);
              biblemap.map.fitBounds(group.getBounds());
              biblemap.map.setZoom(10);
            }
          }
        });
    },

    async findPlaceNames() {
      let chapter = this.chapter;
      let results = await Map.getPlacesCSV();

      // Find those already in the list
      let places = chapter.places;
      let placeNames = chapter.placeNames;

      if (places.length === 0) {
        for (var placeName of placeNames) {
          for (let item of results.data) {
            if (item["#ESV"] !== "") {
              var regexp = "\\b(" + item["#ESV"] + ")\\b";
              if (placeName.match(new RegExp(regexp, "g"))) {
                var place = Map.createPlace(item);
                place.verse = 1;
                if (place.lon !== "" && place.lat !== "") {
                  places.push(place);
                }
              }
            }
          }
        }
      }

      if (placeNames.length === 0) {
        // Find all the location names in the text that we have geolocation info
        var $vs = $(chapter.resultElem).find(".v");
        results.data.sort(function (a, b) {
          return b["#ESV"].length - a["#ESV"].length;
        });
        $vs.each(function () {
          var vid = $(this).attr("id");
          var verseNum = chapter.parseVerseId(vid).verseNum;
          for (let item of results.data) {
            var bannedNames = ["", "On"];
            if (bannedNames.indexOf(item["#ESV"]) === -1) {
              var regexp = "\\b(" + item["#ESV"] + ")\\b";
              var html = $(this).html();
              var newHtml = html.replace(
                new RegExp(regexp, "g"),
                '<strong class="bible-place">$1</strong>'
              );
              if (html !== newHtml && placeNames.indexOf(item["#ESV"]) === -1) {
                placeNames.push(item["#ESV"]);
                var place = Map.createPlace(item);
                if (place) {
                  place.verse = verseNum;
                  if (place.lon !== "" && place.lat !== "") {
                    places.push(place);
                    $(this).html(newHtml);
                  }
                }
              }
            }
          }
        });
      }
      return { places, placeNames };
    },
  },
};
</script>

<style>
.bible-chapter-map {
  height: 19rem;
}

.bible-chapter-timeline-container.collapsed,
.bible-chapter-map-container.collapsed {
  display: none;
}

.bible-chapter-map-container,
.bible-chapter-timeline-container {
  padding: 0 0.5rem 0.5rem 0.5rem;
  background: #444444;
  display: block;
  position: relative;
}
</style>