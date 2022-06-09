<router>
  {
    path: '/:l1/:l2/jw-video-search',
    props: true
  }
</router>
<template>
  <div class="main container mx-auto mt-10">
    <div id="jw-study-aid-search-wrapper">
      <div class="jw-study-aid-search-controls">
        <input
          type="text"
          class="jw-study-aid-search-controls-field"
          v-model="keyword"
          @compositionend.prevent.stop="() => false"
          @keyup.enter="search"
          placeholder="Search"
        />
        <button class="jw-study-aid-search-controls-button" @click="search">
          Search
        </button>
      </div>
      <div class="jw-study-aid-search-videos">
        <div v-for="video in videos" :key="video.vid">
          <JWVideoCard
            vid="result.vid"
            :start="Number(result.items[0].start)"
            :keyword="keyword"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import config from "@/lib/Config.js";
import $ from "jquery";
import axios from 'axios'
import { VIDEO_TERM_SEARCH_BASE } from "@/lib/jw/Wol"

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
  data() {
    return {
      keyword: "",
      videos: [],
    };
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

    async search() {
      let url = VIDEO_TERM_SEARCH_BASE;
      let params = { q: this.keyword };
      let res = await axios.get(url, { params });
      if (res) {
        this.videos = res.data;
      }
    },
  },
};

// let videoResultsWrapper = $(jwsearch.element).find(
//   ".jw-study-aid-search-videos"
// )[0];
// $(videoResultsWrapper).html("");
// for (let result of results) {
//   let videoSnippet = Video.getVideoSnippet(
//     result.vid,
//     Number(result.items[0].start),
//     this.keyword,
//     jwsearch
//   );
//   $(videoResultsWrapper).append(videoSnippet.element);
// }
</script>

<style>
</style>
