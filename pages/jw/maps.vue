<router>
  {
    path: '/:l1/:l2/maps/',
    props: true
  }
</router>
<template>
  <div class="container main mt-10">
    <div class="jw-study-aid-search-controls">
      <input
        type="text"
        class="jw-study-aid-search-controls-field"
        @keyup="searchKeyUp"
      />
      <button class="jw-study-aid-search-controls-button">Filter</button>
    </div>
    <br />
    <BibleMap @mapLoaded="mapLoaded" ref="biblemap" />
    <JWArticle />
  </div>
</template>

<script>
export default {
  data() {
    return {
      article: undefined,
      articleElem: undefined,
    }
  },
  computed: {
  },
  methods: {
    searchKeyUp(node) {
      let search = $(node).val();
      this.filter(search);
    },
    filter(search) {
      for (let plotmark of this.plotmarks) {
        plotmark.remove();
        if (plotmark.data.name.match(new RegExp(search, "gi"))) {
          this.map.addLayer(plotmark);
        }
      }
    },
    mapLoaded() {
      let biblemap = this.$refs.biblemap
      for (let plotmark of biblemap.plotmarks) {
        plotmark.on("click", function () {
          let loader = $(
            '<span class="throbber-loader">Loading&#8230;</span>'
          )[0];
          $(biblemap.articleElem).html(
            "<p>Looking up " + plotmark.data.name + "</p>"
          );
          $(biblemap.articleElem).append(loader);
          biblemap.showInsightArticle(plotmark.data.name);
        });
      }
    }
  }
}
</script>

<style>
</style>