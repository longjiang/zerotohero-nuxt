<router>
  {
    path: '/:l1/:l2/youtube/browse/:topic?/:level?/:start?/:keyword?',
    props: true,
    meta: {
      title: 'Study YouTube Subtitles | Zero to Hero',
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
  <div class="youtube-browse container mt-5 mb-5 main">
    <div class="row mt-5">
      <div class="col-sm-12">
        <h3 class="mb-5 text-center">YouTube Video Library</h3>
      </div>
      <div class="col-sm-12 col-md-8 col-lg-9 pr-4 mb-5">
        <b-button
          v-if="$settings.adminMode"
          class="btn btn-small bg-danger text-white mt-2 ml-2"
          @click="removeAll()"
        >
          <i class="fas fa-trash mr-2"></i>
          Remove All
        </b-button>
        <template v-if="videos && videos.length > 0">
          <YouTubeVideoList
            :videos="videos"
            :checkSubs="false"
            ref="youtubeVideoList"
            :checkSaved="false"
          />
        </template>
        <div class="mt-4 text-center">
          <router-link
            v-if="start > 9"
            :to="`/${$l1.code}/${$l2.code}/youtube/browse/${topic}/${level}/${
              Number(start) - 10
            }${keyword ? '/' + keyword : ''}`"
            class="btn btn-default mr-2"
          >
            Previous
          </router-link>
          <router-link
            :to="`/${$l1.code}/${$l2.code}/youtube/browse/${topic}/${level}/${
              Number(start) + 10
            }${keyword ? '/' + keyword : ''}`"
            class="btn btn-default"
          >
            Next
          </router-link>
        </div>
      </div>
      <div class="col-sm-12 col-md-4 col-lg-3">
        <SimpleSearch
          class="mb-3"
          :placeholder="keyword ? keyword : 'Keyword...'"
          buttonText="Search"
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
        <div class="list-group">
          <router-link
            :class="{
              'link-unstyled': true,
              'list-group-item': true,
              'list-group-item-action': topic === 'all',
              active: topic === 'all',
            }"
            :to="`/${$l1.code}/${$l2.code}/youtube/browse/all/${level}`"
          >
            All
          </router-link>
          <router-link
            v-for="(topicName, topicValue) in topics"
            :class="{
              'link-unstyled': true,
              'list-group-item': true,
              'list-group-item-action': topicValue === topic,
              active: topicValue === topic,
            }"
            :to="`/${$l1.code}/${$l2.code}/youtube/browse/${topicValue}/all`"
          >
            {{ topicName }}
          </router-link>
        </div>
        <h6 class="mt-4 mb-4 text-center">Filter by Level</h6>
        <div class="list-group">
          <a
            :class="{
              'link-unstyled': true,
              'list-group-item': true,
              'list-group-item-action': level === 'all',
              active: level === 'all',
            }"
            :href="`/${$l1.code}/${$l2.code}/youtube/browse/${topic}/all`"
          >
            All
          </a>
          <a
            v-for="(levelName, levelValue) in levels"
            :class="{
              'link-unstyled': true,
              'list-group-item': true,
              'list-group-item-action': levelValue === level,
              active: levelValue === level,
            }"
            :href="`/${$l1.code}/${$l2.code}/youtube/browse/all/${levelValue}`"
          >
            {{ levelName }}
          </a>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-sm-12">
        <hr />
        <h3 class="mt-5 mb-5 text-center">Search for More Videos on YouTube</h3>
        <SimpleSearch
          class="mb-3"
          :placeholder="
            $t('Search the entire YouTube for {l2} videos with CC', {
              l2: $l2.name,
            })
          "
          buttonText="Search"
          :action="
            (url) => {
              this.$router.push({
                path: `/${$l1.code}/${
                  $l2.code
                }/youtube/search/${encodeURIComponent(url)}`,
              });
            }
          "
          ref="search"
        />
      </div>
    </div>
  </div>
</template>

<script>
import YouTubeNav from "@/components/YouTubeNav";
import YouTubeVideoList from "@/components/YouTubeVideoList";
import YouTubeChannelCard from "@/components/YouTubeChannelCard";
import SimpleSearch from "@/components/SimpleSearch";
import Config from "@/lib/config";
import Helper from "@/lib/helper";
import YouTube from "@/lib/youtube";
import axios from "axios";

export default {
  components: {
    YouTubeNav,
    YouTubeVideoList,
    YouTubeChannelCard,
    SimpleSearch,
  },
  props: {
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
  },
  data() {
    return {
      channels: [],
      videos: [],
      levels: Helper.levels(this.$l2),
      topics: Helper.topics,
    };
  },
  async fetch() {
    this.videos = await this.getVideos();
    this.channels = await this.getChannels();
  },
  methods: {
    removeAll() {
      this.$refs.youtubeVideoList.removeAll();
    },
    async getVideos() {
      let filters = "";
      if (this.topic !== "all") {
        filters += "&filter[topic][eq]=" + this.topic;
      }
      if (this.level !== "all") {
        filters += "&filter[level][eq]=" + this.level;
      }
      if (this.keyword !== "") {
        filters += "&filter[title][contains]=" + this.keyword + "&sort=title";
      }
      let response = await axios.get(
        `${Config.wiki}items/youtube_videos?sort=-id&filter[l2][eq]=${
          this.$l2.id
        }${filters}&limit=10&offset=${this.start}&timestamp=${
          this.$settings.adminMode ? Date.now() : 0
        }`
      );
      let videos = response.data.data || [];
      if (videos && this.$settings.adminMode) {
        videos = await YouTube.checkShows(videos, this.$l2.id);
      }
      videos = Helper.uniqueByValue(videos, "youtube_id");
      return videos
    },
    async getChannels() {
      let response = await axios.get(
        `${Config.wiki}items/youtube_channels?filter[language][eq]=${this.$l2.id}&fields=*,avatar.*`
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
        return Helper.uniqueByValue(channels, "youtube_id");
      }
    },
    route() {
      let canonical = `/${this.$l1.code}/${this.$l2.code}/youtube/browse/${this.topic}/${this.level}/${this.start}`;
      if (this.keyword) {
        canonical = canonical + "/" + this.keyword;
      }
      if (this.$router.currentRoute.path !== canonical) {
        this.$router.push({ path: canonical });
      } else {
        this.$fetch();
      }
    },
  },
  created() {
    this.route();
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
  },
  watch: {
    $route() {
      if (this.$route.name === "youtube-browse") {
        this.route();
      }
    },
  },
};
</script>
