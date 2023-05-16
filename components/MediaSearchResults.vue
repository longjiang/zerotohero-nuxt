<template>
  <div class="media-search-results">
    <div class="row">
      <div class="col-sm-12">
        <client-only>
          <div v-if="showSearchBar">
            <div
              class="d-flex mt-4 mb-3"
              v-if="(videos && videos.length > 0) || keyword"
            >
              <SimpleSearch
                placeholder="Search"
                ref="searchLibrary"
                class="mr-1"
                style="flex: 1"
                :skin="skin"
                :action="
                  (url) => {
                    this.$router.push({
                      path: `/${$l1.code}/${
                        $l2.code
                      }/youtube/browse/${topic}/${level}/0/${encodeURIComponent(
                        url
                      )}`,
                    });
                  }
                "
              />
              <b-form-select
                v-model="topicData"
                :options="topics"
                class="select-ghost-dark"
                style="width: 7rem"
              >
                Category
              </b-form-select>
            </div>
            <router-link
              :to="{
                name: 'youtube-browse',
                params: {
                  topic,
                  level,
                  start: 0,
                  keyword: undefined,
                },
              }"
              v-if="keyword"
              class="ml-2 btn btn-small btn-ghost-dark"
            >
              Clear Search
            </router-link>
          </div>
        </client-only>
      </div>
      <div class="col-sm-12">
        <template v-if="videos && videos.length > 0">
          <LazyYouTubeVideoList
            ref="youtubeVideoList"
            :skin="skin"
            :videos="videos"
            :defaultShowTitle="keyword"
            :checkSubs="false"
            :checkSaved="false"
            :showProgress="true"
            :showPlayButton="false"
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
        <div v-observe-visibility="visibilityChanged"></div>
        </div>
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
    category: {
      default: "all",
    },
    topic: {
      default: "all",
    },
    level: {
      default: "all",
    },
    keyword: {
      default: "",
    },
    start: {
      default: 0,
    },
    includeTVShows: {
      default: true
    },
    includeTalks: {
      default: true
    },
    kidsOnly: {
      type: Boolean,
      default: false,
    },
    excludeKids: {
      type: Boolean,
      default: false,
    },
    showLatestIfKeywordMissing: {
      default: false,
    },
    showNoVideosMessage: {
      default: false,
    },
    showSearchBar: {
      default: false,
    },
    sort: {
      default: 'views' // or 'recommended', 'date', 'title'
    },
    perPage: {
      default: 96
    },
    infiniteScroll: {
      default: true
    },
    skin: {
      default: null
    }
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
      showDiscover: false,
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
    async includeTVShows() {
      this.videos = await this.getVideos(this.start);
    },
    async includeTalks() {
      this.videos = await this.getVideos(this.start);
    },
    async sort() {
      this.videos = await this.getVideos(this.start);
    },
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
  updated() {
    if (this.keyword && this.$refs.searchLibrary) {
      this.$refs.searchLibrary.text = this.keyword;
    }
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
        this.moreVideos = this.moreVideos + this.perPage;
        this.loading = true;
        let newVideos = await this.getVideos(
          Number(this.start) + this.moreVideos
        );
        this.videos = this.videos.concat(newVideos);
        if (newVideos.length < this.perPage) this.noMoreVideos = true;
        this.loading = false;
      }
    },
    async getVideos(start) {
      if (!this.keyword && !this.showLatestIfKeywordMissing) return [];
      this.noMoreVideos = false;
      let filters = [];
      if (!this.includeTVShows) {
        filters.push("filter[tv_show][null]=1");
      }
      if (!this.includeTalks) {
        filters.push("filter[talk][null]=1");
      }
      if (this.topic !== "all") {
        filters.push("filter[topic][eq]=" + this.topic);
      }
      if (this.category !== "all") {
        filters.push("filter[category][eq]=" + this.category);
      }
      if (this.level !== "all") {
        filters.push("filter[level][eq]=" + this.level);
      }
      if (this.keyword !== "") {
        const words = this.keyword.split(' ');

        let titleKeywords = [];

        for (const word of words) {
          if (word.startsWith("channel:")) {
            filters.push(
              "filter[channel_id][eq]=" +
                encodeURIComponent(word.replace("channel:", ""))
            );
          } else if (word.startsWith("locale:")) {
            filters.push(
              "filter[locale][contains]=" +
                encodeURIComponent(word.replace("locale:", ""))
            );
          } else {
            titleKeywords.push(word);
          }
        }

        if (titleKeywords.length > 0) {
          filters.push(
            "filter[title][contains]=" + encodeURIComponent(titleKeywords.join(' '))
          );
        }
      }
      if (this.kidsOnly) {
        filters.push('filter[made_for_kids][eq]=1')
      }
      if (this.excludeKids) {
        filters.push('filter[made_for_kids][eq]=0')
        filters.push('filter[tags][ncontains]=kids')
      }
      let limit = this.perPage;
      filters = filters.join("&");
      let fields = "fields=id,l2,title,youtube_id,tv_show.*,talk.*,date";
      if (LANGS_WITH_CONTENT.includes(this.$l2.code))
        fields =
          fields +
          ",views,tags,category,locale,duration,made_for_kids,views,likes,comments";
      let timestamp = `timestamp=${this.$adminMode ? Date.now() : 0}`;
      let offset = `offset=${start}`;
      let limitStr = `limit=${limit}`;
      let sortOpts = {
        id: '-id',
        date: '-date',
        views: '-views',
        title: 'title',
        recommended: '-views'
      }
      let sort = `sort=${sortOpts[this.sort]}`
      let query = [filters, limitStr, fields, offset, sort, timestamp]
        .filter((f) => f !== "")
        .join("&");
      let videos = await this.$directus.getVideos({ l2Id: this.$l2.id, query });
      if (this.sort === 'recommended' && this.preferredCategories?.length > 0) {
        let recommendedVideos = await this.$directus.getVideos({ l2Id: this.$l2.id, query: query + `&filter[category][in]=${this.preferredCategories.join(',')}` });
        videos = videos.concat(recommendedVideos)
      }
      if (videos && this.$adminMode) {
        videos = await this.$directus.checkShows(videos, this.$l2.id);
        for (let video of videos) {
          try {
            if (video.subs_l2)
              video.subs_l2 = this.$subs.parseSavedSubs(video.subs_l2);
          } catch (err) {}
        }
      }
      videos = videos
          .sort((x, y) => {
            x = this.preferredCategories.includes(String(x.category));
            y = this.preferredCategories.includes(String(y.category));
            return x === y ? 0 : x ? -1 : 1;
          });
      return videos;
    },
    async getChannels() {
      let response = await this.$directus.get(
        `items/youtube_channels?filter[language][eq]=${this.$l2.id}&fields=*,avatar.*`
      );
      if (response.data && response.data.length > 0) {
        let channels = response.data.data.map((channel) => {
          return {
            id: channel.channel_id,
            avatar:
              channel.avatar && channel.avatar !== null
                ? channel.avatar.data.full_url
                : undefined,
            title: channel.name,
            description: channel.description,
          };
        });
        return uniqueByValue(channels, "youtube_id");
      }
    },
    route() {
      let canonical = `/${this.$l1.code}/${this.$l2.code}/youtube/browse/${this.topic}/${this.level}/${this.start}`;
      if (!this.$router.currentRoute.path.startsWith(canonical)) {
        this.$router.push({ path: canonical });
      } else {
        this.$fetch();
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
  border: 2px dashed rgba(136, 136, 136, 0.5);
  color: rgba(255, 255, 255, 0.767);
  border-radius: 0.25rem;
  padding: 2rem;
}
</style>