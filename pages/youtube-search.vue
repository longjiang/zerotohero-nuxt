<router>
  {
    path: '/:l1/:l2/youtube/search/:term?/:start?',
    props: true,
    meta: {
      title: 'YouTube Reader | Zero to Hero',
      metaTags: [
        {
          name: 'description',
          content: 'Watch YouTube videos and study the subtitles.'
        }
      ]
    }
  }
</router>
<template>
  <div class="container pt-5 pb-5 main youtube-search">
    <h1 class="text-center mb-5">Study YouTube Subtitles</h1>
    <SimpleSearch
      :placeholder="$t('Enter a search term in {l2}...', { l2: $l2.name })"
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
    />
    <b-form-group class="mt-3">
      <b-form-radio
        v-model="captions"
        class="d-inline-block mr-3"
        value="captions"
      >
        With Captions
      </b-form-radio>
      <b-form-radio
        v-model="captions"
        class="d-inline-block mr-3"
        value="nocaptions"
      >
        No Captions
      </b-form-radio>
      <b-form-radio v-model="captions" class="d-inline-block" value="all">
        All
      </b-form-radio>
    </b-form-group>
    <YouTubeSearchResults
      :term="term"
      :start="start"
      :captions="captions"
      class="mt-5"
      :key="searchResultKey"
      ref="youtubeSearchResults"
    />
  </div>
</template>

<script>
import SimpleSearch from "@/components/SimpleSearch";
import YouTubeSearchResults from "@/components/YouTubeSearchResults";

export default {
  components: {
    SimpleSearch,
    YouTubeSearchResults,
  },
  data() {
    return {
      captions: "all",
      searchResultKey: 0,
      checkSaved: false,
    };
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
  },
  props: {
    term: {
      type: String,
    },
    start: {
      default: 0,
    },
  },
  watch: {
    term() {
      this.updateSearchText();
    },
  },
  mounted() {
    this.updateSearchText();
  },
  methods: {
    async updateSearchText() {
      if (this.term) {
        let url = decodeURIComponent(this.term);
        this.$refs.search.text = url;
      }
    },
    addAll() {
      this.$refs.youtubeSearchResults.addAll();
    },
  },
};
</script>

<style>
</style>
