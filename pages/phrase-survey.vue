<router>
  {
    path: '/:l1/:l2/phrase-survey/:start?',
    props: true
  }
</router>
<template>
  <div class="main">
    <div class="container pt-5">
      <div class="row">
        <div :class="{ 'col-sm-12 mb-5': true }">
          <h4 class="text-center mb-5">Phrase Survey</h4>
          <div class="text-center mb-4">
            Get phrases from up to {{ perPage }} episodes from:
            <b-form-select
              v-model="showSelect"
              :options="showOptions"
              style="display: inline-block; width: 20rem; margin-left: 1rem"
            ></b-form-select>
          </div>
          <div class="text-center mb-4">
            <b-button variant="primary" @click="getPhrases">
              Get Phrases
            </b-button>
          </div>
          <div class="text-center pt-2 pb-2" v-if="videos">{{ videos.length }} videos surveyed</div>
          <div
            :class="{
              'loader text-center mb-4': true,
              'd-none': !gettingPhrases,
            }"
            style="flex: 1"
          >
            <Loader :sticky="true" message="Getting phrases..." />
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
            >
              <template #cell(line)="data">
                <div>
                  {{ data.item.phrase }}
                </div>
                <div v-if="expand[data.index]" class="mt-2 mb-2 ml-2">
                  <div v-for="phrase of data.item.instances">
                    <router-link
                      :to="`/${$l1.code}/${$l2.code}/youtube/view/${phrase.youtube_id}/?t=${phrase.starttime}`"
                      class="link-unstyled d-flex mt-1 mb-1"
                      target="_blank"
                    >
                      <img
                        :src="`//img.youtube.com/vi/${phrase.youtube_id}/hqdefault.jpg`"
                        :alt="phrase.title"
                        class="video-thumb"
                        v-lazy-load
                      />
                      <div style="flex: 1">
                        <span
                          v-html="highlight(phrase.line, data.item.phrase)"
                        />
                      </div>
                    </router-link>
                  </div>
                </div>
              </template>
              <template #cell(count)="data">
                {{ data.item.instances.length }}
              </template>
              <template #cell(actions)="data">
                <b-button
                  size="sm"
                  variant="success"
                  @click="toggle(data.index)"
                >
                  <span v-if="expand[data.index]">Collapse</span>
                  <span v-if="!expand[data.index]">Expand</span>
                </b-button>
              </template>
            </b-table>
          </template>
          <div v-observe-visibility="visibilityChanged"></div>
          <div class="mt-4 text-center">
            <router-link
              v-if="start > 9"
              :to="`/${$l1.code}/${$l2.code}/phrase-survey/${
                Number(start) - perPage
              }`"
              class="btn btn-default"
            >
              <i class="fa fa-chevron-left"></i>
            </router-link>
            <span class="ml-3 mr-3">Page {{ start / perPage + 1 }}</span>
            <router-link
              v-if="videos && videos.length > 0"
              :to="`/${$l1.code}/${$l2.code}/phrase-survey/${
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
  </div>
</template>

<script>
import Config from "@/lib/config";
import axios from "axios";
import YouTube from "@/lib/youtube";
import Helper from "@/lib/helper";
import Vue from "vue";
import he from "he";

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
      maxVideos: 2000, // False = infinite number of videos
      perPage: 2000,
      chunkSize: 200, // Number of videos stored in each localStorage item in getAllLinesFromLocalStorage
      punctuations: undefined,
      fields: ["line", "count", "actions"],
      numRowsVisible: 20,
      showSelect: "all-tv-shows",
      shows: undefined,
      gettingPhrases: false,
      expand: {},
    };
  },
  mounted() {
    this.loadShows();
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type.startsWith("shows")) {
        this.loadShows();
      }
    });
    this.punctuations = Helper.characterClass("PunctuationNoApostropheNoHyphen");
    console.log(`All done. Displaying table...`);
  },
  beforeDestroy() {
    // you may call unsubscribe to stop the subscription
    this.unsubscribe();
  },
  methods: {
    highlight() {
      return Helper.highlight(...arguments);
    },
    toggle(index) {
      Vue.set(this.expand, index, this.expand[index] ? false : true);
    },
    loadShows() {
      this.shows = this.$store.state.shows.tvShows[this.$l2.code]
        ? this.$store.state.shows.tvShows[this.$l2.code]
        : undefined;
    },
    async getPhrases() {
      this.gettingPhrases = true;
      this.videos = await this.getAllVideos();
      console.log(`Got ${this.videos.length} videos in total.`);
      this.lines = this.crunchPhrases(this.videos);
      this.gettingPhrases = false;
    },
    visibilityChanged(isVisible) {
      if (isVisible) {
        this.numRowsVisible = this.numRowsVisible + 100;
      }
    },
    async getAllVideos() {
      let start = this.start;
      let videos = await this.getVideos(this.showSelect, start, this.perPage);
      let allVideos = [];
      let page = 0;
      while (
        videos.length > 0 &&
        (!this.maxVideos || allVideos.length < this.maxVideos)
      ) {
        allVideos = allVideos.concat(videos);
        page++;
        videos = await this.getVideos(
          this.showSelect,
          start + this.perPage * page,
          this.perPage
        );
      }
      return allVideos;
    },
    crunchPhrases(videos) {
      console.log(`Collecting lines...`);
      let phrases = [];
      for (let video of videos) {
        for (let line of video.subs_l2) {
          let regex = new RegExp(`[${this.punctuations}]+`, "g");
          let segs = he
            .decode(line.line)
            .split(regex)
            .map((seg) => seg.trim())
            .filter((seg) => seg !== "");

          for (let seg of segs) {
            let phrase = {
              phrase: seg.trim(),
              youtube_id: video.youtube_id,
              title: video.title,
              tv_show: video.tv_show,
              talk: video.talk,
              line: line.line,
              starttime: line.starttime,
            };
            phrases.push(phrase);
          }
        }
      }
      let foldedPhrases = this.sortPhrases(phrases);
      return foldedPhrases;
    },

    sortPhrases(phrases) {
      let sortedPhrases = phrases.sort((a, b) =>
        a.phrase.localeCompare(b.phrase, this.$l2.code)
      );
      let groups = [];
      if (sortedPhrases.length > 0) {
        let group = {
          phrase: sortedPhrases[0].phrase,
          instances: [sortedPhrases[0]],
        };
        for (let phrase of sortedPhrases) {
          if (phrase.phrase.toUpperCase() === group.phrase.toUpperCase()) {
            group.instances.push(phrase);
          } else {
            groups.push(group);
            // Start a new group
            group = {
              phrase: phrase.phrase,
              instances: [phrase],
            };
          }
        }
      }
      groups = groups
        .sort((a, b) => a.phrase.length - b.phrase.length)
        .sort((a, b) => b.instances.length - a.instances.length);
      return groups;
    },
    async getVideos(show, start, limit) {
      console.log(`Getting ${limit} videos...`);
      let showFilter;
      if (show === "all-tv-shows") {
        showFilter = "&filter[tv_show][nnull]=1";
      } else if (show === "all-talks") {
        showFilter = "&filter[talk][nnull]=1";
      } else if (show === "all-videos") {
        showFilter = "";
      } else {
        showFilter = `&filter[tv_show][eq]=${show}`;
      }
      let response = await axios.get(
        `${Config.wiki}items/youtube_videos?sort=-id&limit=${limit}&offset=${start}&filter[l2][eq]=${this.$l2.id}${showFilter}&fields=*,tv_show.*,talk.*`
      );
      let videos = response.data.data || [];
      if (["all-tv-shows", "all-videos"].includes(show)) {
        videos = videos.filter(
          (v) => !v.tv_show || v.tv_show.title !== "Music"
        );
      }
      console.log(`Got ${videos.length} videos.`);
      for (let video of videos) {
        video.subs_l2 = YouTube.parseSavedSubs(video.subs_l2);
      }
      return videos;
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
            value: "all-tv-shows",
            text: "All TV Shows",
          },
          ...this.shows.map((s) => {
            return {
              value: s.id,
              text: s.title,
            };
          }),
          {
            value: "all-talks",
            text: "All Talks",
          },
          {
            value: "all-videos",
            text: "All Videos",
          },
        ];
        return options;
      }
    },
  },
};
</script>
<style scoped>
.video-thumb {
  width: calc(0.2rem * 16);
  height: calc(0.2rem * 9);
  object-fit: cover;
  margin-right: 1rem;
}
</style>