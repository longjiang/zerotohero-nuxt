<router>
  {
    path: '/:l1/:l2/phrase-survey/:start?',
    props: true
  }
</router>
<template>
  <div class="main container mt-5">
    <div class="row">
      <div :class="{ 'col-sm-12 mb-5': true }">
        <h4 class="text-center mb-5">Phrase Survey</h4>
        <div class="text-center mb-4">
          Get phrases from up to {{ perPage }} episodes from:
          <b-form-select
            v-model="showSelect"
            :options="showOptions"
            style="display: inline-block; width: 20rem; margin-left: 1rem;"
          ></b-form-select>
        </div>
        <div class="text-center mb-4">
          <b-button variant="primary" @click="getPhrases">Get Phrases</b-button>
        </div>
        <div
          :class="{
            'loader text-center mb-4': true,
            'd-none': !gettingPhrases,
          }"
          style="flex: 1"
        >
          <div class="heartbeat-loader"></div>
        </div>
        <div
          :class="{
            'text-center': true,
            'd-none': !videos || videos.length > 0,
          }"
        >
          No more videos to survey.
        </div>
        <template v-if="lines && lines.length > 0">
          <b-table
            small
            striped
            hover
            :items="lines.slice(0, numRowsVisible)"
            :fields="fields"
            responsive
          ></b-table>
        </template>
        <div v-observe-visibility="visibilityChanged"></div>
        <div class="mt-4 text-center">
          <router-link
            v-if="start > 9"
            :to="`/${$l1.code}/${$l2.code}/db-upgrade/${
              Number(start) - perPage
            }`"
            class="btn btn-default"
          >
            <i class="fa fa-chevron-left"></i>
          </router-link>
          <span class="ml-3 mr-3">Page {{ start / perPage + 1 }}</span>
          <router-link
            v-if="videos && videos.length > 0"
            :to="`/${$l1.code}/${$l2.code}/db-upgrade/${
              Number(start) + perPage
            }`"
            class="btn btn-default"
          >
            <i class="fa fa-chevron-right"></i>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Config from "@/lib/config";
import axios from "axios";
import YouTube from "@/lib/youtube";
import Helper from "@/lib/helper";

export default {
  props: {
    start: {
      default: 0,
    },
  },
  data() {
    return {
      videos: undefined,
      lines: undefined,
      perPage: 100,
      punctuations: "。！？；：!?;:",
      fields: ["line", "count", "actions"],
      numRowsVisible: 20,
      showSelect: "all",
      shows: undefined,
      gettingPhrases: false
    };
  },
  mounted() {
    this.loadShows();
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type.startsWith("shows")) {
        this.loadShows();
      }
    });
    console.log(`All done. Displaying table...`);
  },
  beforeDestroy() {
    // you may call unsubscribe to stop the subscription
    this.unsubscribe();
  },
  methods: {
    loadShows() {
      this.shows = this.$store.state.shows.tvShows[this.$l2.code]
        ? this.$store.state.shows.tvShows[this.$l2.code]
        : undefined;
    },
    async getPhrases() {
      this.gettingPhrases = true
      this.videos = await this.getVideos(this.showSelect);
      this.lines = this.crunchPhrases(this.videos);
      this.gettingPhrases = false
    },
    visibilityChanged(isVisible) {
      if (isVisible) {
        this.numRowsVisible = this.numRowsVisible + 100;
      }
    },
    crunchPhrases(videos) {
      console.log(`Collecting lines...`);
      let lines = videos.reduce(
        (allLines, video) =>
          allLines.concat(video.subs_l2.map((line) => line.line)),
        []
      );
      console.log(`Splitting and joining ${lines.length} lines...`);
      lines = lines
        .join("\n")
        .replace(new RegExp(`[${this.punctuations}]`), "\n")
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && line !== "")
        .map((line) => {
          return { line: line };
        });
      console.log(`Turned into ${lines.length} lines.`);
      lines = this.sortLines(lines);
      console.log(`Applying "unique" to all ${lines.length} lines...`);
      lines = Helper.uniqueByValue(lines, "line");
      return lines;
    },
    async getVideos(show) {
      console.log(`Getting ${this.perPage} videos...`);
      let limit = this.perPage;
      let showFilter = show === 'all' ? '&filter[tv_show][nnull]=1' : `&filter[tv_show][eq]=${show}`
      let response = await axios.get(
        `${Config.wiki}items/youtube_videos?sort=-id&limit=${limit}&offset=${this.start}&filter[l2][eq]=${this.$l2.id}${showFilter}&fields=*,tv_show.*`
      );
      let videos = response.data.data || [];
      for (let video of videos) {
        video.subs_l2 = YouTube.parseSavedSubs(video.subs_l2);
      }
      return videos;
    },

    sortLines(lines) {
      console.log(
        `Counting each of the ${lines.length} lines for occurences...`
      );
      // Extremely slow!!!
      for (let line of lines) {
        line.count = lines.filter((l) => l.line === line.line).length;
      }
      console.log(`Sorting ${lines.length} lines by count...`);
      let sortedLines = lines.sort((a, b) => b.count - a.count);
      return sortedLines;
    },
  },
  computed: {
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
    $adminMode() {
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
    },
    showOptions() {
      if (this.shows) {
        let options = [
          {
            value: "all",
            text: "All TV Shows",
          },
          ...this.shows.map((s) => {
            return {
              value: s.id,
              text: s.title,
            };
          }),
        ];
        return options;
      }
    },
  },
};
</script>
