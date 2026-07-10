<!-- /pages/_l1/_l2/youtube/search.vue -->
<template>
  <div class="main">
    <div class="container pt-5 pb-5 youtube-search">
      <div style="font-size: 1.5rem; color: white; text-align: center">
        <img
          src="/img/logo-play-circle-light.png"
          style="height: 4rem; margin-bottom: 1rem"
          data-not-lazy
        />
      </div>
      <h4 class="mt-3 mb-5 text-center">
        <!-- Dynamic header text based on the searched field type -->
        {{ $t("Search {l2} Content", { l2: $t($l2.name) }) }}
      </h4>
      <SimpleSearch
        :placeholder="
          $t(
            'Enter {l2} keywords to search, or a YouTube ID or URL to import',
            {
              l2: $t($l2.name),
              field: $t(searchField)
            }
          )
        "
        :skin="$skin"
        :action="
          (url) => {
            let path = `/${$l1.code}/${
              $l2.code
            }/youtube/search/${encodeURIComponent(url)}/0`;
            
            // Retain the existing query parameter (e.g., ?field=tag) when submitting a new term
            if (this.$router.currentRoute.path === path) {
              this.searchResultKey++;
            } else {
              this.$router.push({ path: path, query: this.$route.query });
            }
          }
        "
        ref="search"
        :button="false"
      />
      <client-only>
        <b-form-group class="mt-3" v-if="$adminMode">
          <b-form-radio
            v-model="captions"
            class="d-inline-block mr-3"
            value="all"
          >
            Yes captions
          </b-form-radio>
          <b-form-radio
            v-model="captions"
            class="d-inline-block mr-3"
            value="nocaptions"
          >
            No captions, more results
          </b-form-radio>
          <b-form-checkbox v-model="long" class="d-inline-block mr-3">
            Only long videos (20m+)
          </b-form-checkbox>
          <b-button
            v-if="$adminMode"
            class="btn-small btn-primary ml-3"
            @click="forceRefresh"
          >
            <i class="fa fa-sync-alt mr-1"></i>
            Force Refresh
          </b-button>
          <b-button
            v-if="!moreLoaded && $adminMode"
            class="btn-small btn-secondary ml-1"
            @click="loadMore"
          >
            <i class="fa fa-cloud mr-1"></i>
            Load {{ maxPages }} pages
          </b-button>
        </b-form-group>
      </client-only>
      
      <div v-if="!term" class="mt-3">
        <div v-if="tags && tags.length > 0" class="mt-4 video-tags-block">
          <div class="mb-2 text-muted" style="font-size: 0.9rem;">
            <i class="fa fa-tags mr-1"></i> {{ $t("Tags") }}
          </div>
          <div class="d-flex flex-wrap gap-2">
            <!-- Appended query object explicitly to Tag items so clicking one forces a tag search context -->
            <router-link
              v-for="item in tags"
              :key="`tag-${item.tag}`"
              :to="{
                path: `/${$l1.code}/${$l2.code}/youtube/search/${encodeURIComponent(item.tag)}/0`,
                query: { field: 'tags' }
              }"
              class="mr-2 video-tag-item"
            >
              #{{ item.tag }} 
              <span class="text-muted ml-1" style="font-size: 0.9rem;">({{ formatK(item.video_count, 1, $l1.code ) }})</span>
            </router-link>
          </div>
        </div>
      </div>
      
      <div v-if="term">
        <div class="d-block text-right mt-3">
          <router-link
            :to="{ name: 'l1-l2-phrase-search-term', params: { term } }"
            style="color: #999"
          >
            <i class="fa fa-search mr-2"></i>
            {{ $t('Search for "{term}" in video subtitles', { term }) }}
            <i class="fa fa-chevron-right ml-2"></i>
          </router-link>
        </div>
        <Shows
          class="mt-5"
          routeType="tv-shows"
          :showFilter="false"
          :showHero="false"
          :initialKeyword="term"
        />
        <Shows
          routeType="talks"
          :showFilter="false"
          :showHero="false"
          :initialKeyword="term"
        />
        
        <!-- Updated parameter bindings using computed filters -->
        <MediaSearchResults :params="mediaSearchParams" class="mt-4" />
      </div>
      
      <div v-if="term && term !== ''">
        <client-only>
          <NavPage
            :l1="$l1"
            :l2="$l2"
            class="youtube-browse-nav mt-5"
            :showOnly="['Listening']"
          />
        </client-only>
        <LazyIdenticalLanguages routeName="youtube-search" class="mt-5" />
        <LazyIdenticalLanguages class="mb-4" routeName="youtube-browse" />
      </div>
    </div>
  </div>
</template>

<script>
import SimpleSearch from "@/components/SimpleSearch";
import YouTubeSearchResults from "@/components/YouTubeSearchResults";
import YouTube from "../../../../lib/youtube";
import { PYTHON_SERVER, formatK } from "../../../../lib/utils";
import { mapState } from "vuex";
import popularTopicsCSV from "@/static/data/languages/popular-topics.csv.txt";
import Papa from "papaparse";
import axios from "axios";

export default {
  components: {
    SimpleSearch,
    YouTubeSearchResults,
  },
  props: {
    term: {
      type: String,
    },
    start: {
      default: 0,
    },
  },
  data() {
    return {
      captions: "all",
      searchResultKey: 0,
      checkSaved: false,
      long: false,
      maxPages: 30,
      moreLoaded: false,
      popularTopics: [],
      tags: [],
    };
  },
  computed: {
    ...mapState("stats", ["stats"]),
    // Evaluates which target property to read from query params
    searchField() {
      return this.$route.query.field || "title";
    },
    // Dynamically structures the filter keys passed into the results component
    mediaSearchParams() {
      const filterKey = `filter[${this.searchField}][contains]`;
      return {
        [filterKey]: this.term
      };
    }
  },
  mounted() {
    this.popularTopics = this.loadCSVString(popularTopicsCSV);
    this.updateSearchText();
    this.detectYouTubeEntitiesAndRedirect();
    this.long = this.$route.query.long === "true" ? true : false;
    this.captions = this.$route.query.captions || "all";
    this.fetchVideoTags();
  },
  methods: {
    formatK,
    async fetchVideoTags() {
      try {
        let url = `${PYTHON_SERVER}video-tags?l2=${this.$l2.code}`;
        const response = await axios.get(url);
        if (response.data) {
          this.tags = response.data;
        }
      } catch (error) {
        console.error("Failed to load video tags from server:", error);
      }
    },
    detectYouTubeEntitiesAndRedirect() {
      if (!this.term) return;
      let { youtube_id, playlist_id } = YouTube.detectYouTubeEntity(this.term);
      if (playlist_id) {
        this.$toast.success(this.$t("Redirecting to playlist..."), {
          duration: 1000,
        });
        this.$router.replace({
          name: "l1-l2-youtube-playlist",
          params: { playlist_id },
        });
      } else if (youtube_id) {
        this.$toast.success(this.$t("Redirecting to video..."), {
          duration: 1000,
        });
        this.$router.replace({
          name: "l1-l2-video-view-type",
          params: { type: "youtube" },
          query: { v: youtube_id },
        });
      }
    },
    async updateSearchText() {
      if (this.term) {
        let url = decodeURIComponent(this.term);
        this.$refs.search.text = url;
      }
    },
    loadCSVString(csv, header = true) {
      if (typeof Papa !== "undefined") {
        let r = Papa.parse(csv, {
          header: header,
          delimiter: ",",
        });
        return r.data;
      }
    },
    addAll() {
      this.$refs.youtubeSearchResults.addAll();
    },
    forceRefresh() {
      this.$refs.youtubeSearchResults.forceRefresh();
    },
    async loadMore() {
      this.moreLoaded = true;
      let hasMore;
      for (let i = 0; i < this.maxPages; i++) {
        hasMore = await this.$refs.youtubeSearchResults.loadMore();
        if (!hasMore) break;
      }
    },
  },
};
</script>