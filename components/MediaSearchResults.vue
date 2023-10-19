<template>
  <div class="media-search-results">
    <div class="row">
      <div class="col-sm-12">
        <div v-show="title && videos?.length">
          <h5>
            {{ $t(title) }}
            <router-link
              v-if="toMore"
              :to="toMore"
              class="show-all"
            >
              {{ $t("More") }}
              <i class="fas fa-chevron-right"></i>
            </router-link>
          </h5>
          <RecommendedMessage class="mt-2" v-if="showRecommendedMessage" />
          <hr class="my-4" />
        </div>
      </div>
      <div class="col-sm-12">
        <template v-if="videos && videos.length > 0">
          <LazyYouTubeVideoList
            ref="youtubeVideoList"
            :skin="skin"
            :videos="videos"
            :checkSubs="false"
            :checkSaved="false"
            :showProgress="true"
            :showDate="true"
          />
        </template>
        <div
          :class="{
            'loader text-center mt-5 mb-5': true,
            'd-none': videos && !loading,
          }"
          style="flex: 1"
        >
          <Loader :sticky="true" message="Loading videos in our library..." />
        </div>
        <div v-if="videos?.length > 0" v-observe-visibility="visibilityChanged"></div>
        </div>
        <div v-if="videos && videos.length === 0 && noVideosMessage" class="no-videos-message">
          {{ $t(noVideosMessage) }}
      </div>
    </div>
  </div>
</template>

<script>
import YouTubeNav from "@/components/YouTubeNav";
import YouTubeChannelCard from "@/components/YouTubeChannelCard";
import SimpleSearch from "@/components/SimpleSearch";
import { uniqueByValue, LANGS_WITH_CONTENT, TOPICS } from "@/lib/utils";
import { mapState } from "vuex";

export default {
  components: {
    YouTubeNav,
    YouTubeChannelCard,
    SimpleSearch,
  },
  props: {
    params: {
      type: Object,
      default: () => ({}),
    },
    start: {
      default: 0,
    },
    noVideosMessage: {
      default: false,
    },
    showSearchBar: {
      default: false,
    },
    showPreferredCategoriesFirst: {
      default: false
    },
    limit: {
      default: 96
    },
    infiniteScroll: {
      default: true
    },
    skin: {
      default: null
    },
    title: {
      type: String,
      default: null
    },
    showRecommendedMessage: {
      default: false
    },
    toMore: {
      type: Object,
    },
  },
  data() {
    let topics = [
      { value: "all", text: "All" },
      ...Object.entries(TOPICS).map(([value, text]) => {
        return { value, text };
      }),
    ];
    return {
      channels: [],
      videos: undefined,
      noMoreVideos: false,
      topics,
      moreVideos: 0,
      topicData: this.topic,
      loading: false,
    };
  },
  computed: {
    ...mapState("settings", ["preferredCategories"]),
  },
  async mounted() {
    this.videos = await this.getVideos(this.start);
    this.$emit("videosLoaded", this.videos);
  },
  watch: {
    topicData() {
      this.$router.push({
        name: "youtube-browse",
        params: {
          topic: this.topicData,
          level: "all",
          start: 0,
        },
      });
    },
  },
  beforeRouteEnter(to, from, next) {
    if (to.path.endsWith(`/youtube/browse`)) {
      next(`${to.path}/all/all/0`);
    }
    next();
  },

  
  methods: {
    async visibilityChanged(isVisible) {
      if (!this.infiniteScroll) return
      if (this.videos && !this.noMoreVideos && isVisible) {
        this.moreVideos = this.moreVideos + this.limit;
        this.loading = true;
        let newVideos = await this.getVideos(
          Number(this.start) + this.moreVideos
        );
        this.videos = this.videos.concat(newVideos);
        if (newVideos.length < this.limit) this.noMoreVideos = true;
        this.loading = false;
      }
    },
    async getVideos(start) {
      this.noMoreVideos = false;
      let limit = this.limit;
      let params = this.params || {}
      params = {...params, 
        'fields': 'id,l2,title,youtube_id,tv_show,talk,date,lex_div,word_freq,difficulty,views,tags,category,locale,duration,made_for_kids,views,likes,comments,type',
        'timestamp': this.$adminMode ? Date.now() : 0,
        'offset': start,
        'limit': limit,
      }
      let videos = await this.$directus.getVideos({ l2Id: this.$l2.id, params });
      videos = this.sortVideos(videos);
      if (videos && this.$adminMode) {
        videos = await this.$directus.checkShows(videos, this.$l2.id);
      }
      return videos
    },
    sortVideos(videos) {
      if (this.showPreferredCategoriesFirst) {
        videos = videos.sort((a, b) => {
          if (this.preferredCategories.includes(a.category)) {
            return -1;
          }
          if (this.preferredCategories.includes(b.category)) {
            return 1;
          }
          return 0;
        });
      }
      return videos
    },
    route() {
      let canonical = `/${this.$l1.code}/${this.$l2.code}/youtube/browse/${this.topic}/${this.level}/${this.start}`;
      if (!this.$router.currentRoute.path.startsWith(canonical)) {
        this.$router.push({ path: canonical });
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.youtube-browse-nav {
  :deep(.feature-card-name-youtube-browse) {
    display: none;
  }
}
.no-videos-message {
  color: rgba(255, 255, 255, 0.767);
  border-radius: 0.25rem;
  padding: 2rem;
  width: 100%;
  text-align: center;
}
</style>