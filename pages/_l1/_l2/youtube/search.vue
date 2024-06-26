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
        {{ $t("Search {l2} Content", { l2: $t($l2.name) }) }}
      </h4>
      <SimpleSearch
        :placeholder="
          $t(
            'Enter {l2} keywords to search, or a YouTube ID or URL to import',
            {
              l2: $t($l2.name),
            }
          )
        "
        :skin="$skin"
        :action="
          (url) => {
            let path = `/${$l1.code}/${
              $l2.code
            }/youtube/search/${encodeURIComponent(url)}/0`;
            if (this.$router.currentRoute.path === path) this.searchResultKey++;
            else this.$router.push({ path: path });
          }
        "
        ref="search"
        :button="false"
      />
      <client-only>
        <b-form-group class="mt-3" v-if="$adminMode">
          <!-- <b-form-radio
            v-model="captions"
            class="d-inline-block mr-3"
            value="captions"
          >
            With Captions
          </b-form-radio> -->
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
        {{ $t("Popular search terms in {l2}:", { l2: $t($l2.name) }) }}
        <span v-for="topic in popularTopics" class="mr-2" :key="topic['en']">
          <!-- We must use path routing here rather than name routing, otherwise the page props won't update -->
          <router-link
            :key="`topic-${topic['en']}`"
            :to="`/${$l1.code}/${
              $l2.code
            }/youtube/search/${encodeURIComponent(topic[$l2.code] || topic['en'])}/0`"
            >{{ topic[$l2.code] || topic["en"] }}</router-link
          >
          <small
            v-if="topic[$l2.code] && topic[$l2.code] !== topic[$l1.code]" class="text-muted"
            >'{{ topic[$l1.code] }}'</small
          >
        </span>
      </div>
      <div v-if="term">
        <div class="d-block text-right mt-3">
          <router-link
            router-link
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
        <MediaSearchResults :params="{ 'filter[title][contains]': term }" class="mt-4" />
        <YouTubeSearchResults
          :term="term"
          :start="start"
          :captions="captions"
          :key="searchResultKey"
          :long="long"
          :infinite="true"
          :showProgress="false"
          :skin="$skin"
          ref="youtubeSearchResults"
          :cloakVideosWithoutSubs="!$adminMode"
        />
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
        <!-- <h4 class="mt-5 text-center">
          You can help to expand this {{ $l2.name }} video library!
        </h4> -->
        <!-- <LazyHowToContribute /> -->
        <LazyIdenticalLanguages class="mb-4" routeName="youtube-browse" />
      </div>
    </div>
  </div>
</template>

<script>
import SimpleSearch from "@/components/SimpleSearch";
import YouTubeSearchResults from "@/components/YouTubeSearchResults";
import YouTube from "../../../../lib/youtube";
import { mapState } from "vuex";
import popularTopicsCSV from "@/static/data/languages/popular-topics.csv.txt";
import Papa from "papaparse";

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
    };
  },
  computed: {
    ...mapState("stats", ["stats"]),
  },
  mounted() {
    this.popularTopics = this.loadCSVString(popularTopicsCSV);
    this.updateSearchText();
    this.detectYouTubeEntitiesAndRedirect();
    this.long = this.$route.query.long === "true" ? true : false;
    this.captions = this.$route.query.captions || "all";
  },
  methods: {
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

<style></style>
