<router>
  {
    path: '/:l1/:l2/search',
    props: true
  }
</router>
<template>
  <div class="container mx-auto mt-10">
    <div id="jw-study-aid-search-wrapper">
      <div class="jw-study-aid-search-controls">
        <input
          type="text"
          class="jw-study-aid-search-controls-field"
          value=""
          placeholder=""
        />
        <button class="jw-study-aid-search-controls-button">Search</button>
      </div>
      <ul class="jw-study-aid-search-videos"></ul>
    </div>
  </div>
</template>

<script>
import config from "@/lib/Config.js";
import $ from "jquery";

export default {
  computed: {
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
  },
  methods: {
    constructor(id) {
      this.id = id;
      this.vueId = id + "-vue";
      this.registerEvent("domConstructed");
      this.constructDom();
      let jwsearch = this;
      this.on("domConstructed", function () {
        jwsearch.activateUI();
        jwsearch.processHash();
      });
    },

    constructDom() {
      let jwsearch = this;
      this.element = $("#" + this.id)[0];
      $(this.element).load(
        config.templatesUrl + "search.html",
        function (html) {
          $(jwsearch.element)
            .find(".jw-study-aid-search-vue")
            .attr("id", jwsearch.vueId);
          jwsearch.dispatchEvent("domConstructed");
        }
      );
    },

    activateUI() {
      let jwsearch = this;
      $(".jw-study-aid-search-controls-field").change(function () {
        window.location.hash = "#q=" + $(this).val();
        jwsearch.processHash();
      });
    },

    processHash() {
      var jwsearch = this;
      var hash = Helper.parseHash();
      if (hash !== undefined && hash.q !== undefined) {
        let term = decodeURI(hash.q);
        $(".jw-study-aid-search-controls-field").val(term);
        jwsearch.search(decodeURI(term));
      }
    },

    searchVideos(q = undefined) {
      let jwsearch = this;
      let url =
        config.VIDEO_TERM_SEARCH_BASE +
        $.param({
          q: `${q}`,
        });
      $.getJSON({
        url: url,
        success: function (results) {
          let videoResultsWrapper = $(jwsearch.element).find(
            ".jw-study-aid-search-videos"
          )[0];
          $(videoResultsWrapper).html("");
          for (let result of results) {
            let videoSnippet = Video.getVideoSnippet(
              result.vid,
              Number(result.items[0].start),
              q,
              jwsearch
            );
            $(videoResultsWrapper).append(videoSnippet.element);
          }
        },
      });
    },

    search(q) {
      var jwsearch = this;
      jwsearch.searchVideos(q);
    },
  },
};
</script>

<style>
</style>