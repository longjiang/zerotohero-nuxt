<router>
  {
    path: '/:l1/:l2/show/:type/:id',
    props: true,
    meta: {
      skin: 'dark'
    }
  }
</router>
<template>
  <div class="main main-dark">
    <div class="youtube-browse container pt-5 pb-5">
      <SocialHead
        v-if="show"
        :title="`Learn ${$l2.name} with the ${
          this.type === 'tv-show' ? 'TV show' : 'talk series'
        } “${show.title}” | ${$l2.name} Zero to Hero`"
        :description="`Watch the full episode and study the ${
          $l2.code === 'zh' ? 'Pinyin' : $l2.name
        } subtitles.`"
        :image="`https://img.youtube.com/vi/${show.youtube_id}/hqdefault.jpg`"
      />
      <div class="row">
        <div class="col-sm-12 mb-4 text-center">
          <h3 v-if="show">
            <Annotate :phonetics="false" :buttons="true" v-if="!$adminMode">
              <span>{{ show.title }}</span>
            </Annotate>
            <span v-else contenteditable="true" @blur="saveTitle">
              {{ show.title }}
            </span>
            <i
              class="fas fa-check-circle text-success ml-2"
              v-if="titleUpdated"
            ></i>
          </h3>
          <p v-if="count" style="opacity: 0.6">
            {{ count }} Episodes
            <span v-if="$adminMode">
              · Cover youtube_id:
              <span contenteditable="true" @blur="saveCover">
                {{ show.youtube_id }}
              </span>
              <i
                class="fas fa-check-circle text-success ml-2"
                v-if="coverUpdated"
              ></i>
            </span>
          </p>
        </div>
        <div class="col-sm-12" v-if="show && ['Music', 'News', 'Movies'].includes(show.title)">
          <div
            class="widget widget-dark mb-5"
            style="max-width: 70vh; margin: 0 auto"
          >
            <div class="widget-title">
              Discover {{ $l2.name }}
              {{ show.title }}
            </div>
            <div class="text-center pt-5 pb-5" v-if="!randomEpisode">
              <Loader :sticky="true" message="Getting recommendations..." />
            </div>
            <LazyYouTubeVideo
              v-if="randomEpisode"
              initialLayout="vertical"
              :youtube="randomEpisode.youtube_id"
              :ref="`youtube`"
              :autoload="true"
              :autoplay="true"
              :startAtRandomTime="true"
              @currentTime="updateCurrentTime"
            />
            <div class="text-center pt-3 pb-3" v-if="randomEpisode">
              <router-link
                :to="{
                  name: 'youtube-view',
                  params: {
                    youtube_id: randomEpisode.youtube_id,
                  },
                  query: {
                    t: currentTime,
                  },
                }"
                class="btn btn-ghost-dark-no-bg"
              >
                <i class="fas fa-align-left mr-1"></i>
                Transcript
              </router-link>
              <b-button
                variant="ghost-dark-no-bg"
                @click="loadRandomEpisode"
              >
                <i class="fas fa-step-forward mr-1"></i>
                Another One
              </b-button>
              <b-button variant="ghost-dark-no-bg" v-if="$adminMode" @click="removeEpisode(randomEpisode)">
                <i class="fas fa-trash"></i>
              </b-button>
            </div>
          </div>
        </div>

        <div class="col-sm-12 mb-5">
          <div class="youtube-video-list-wrapper">
            <div class="d-flex mb-5">
              <b-input-group class="flex-1 input-group-ghost-dark">
                <b-form-input
                  v-model="keyword"
                  :lazy="true"
                  @compositionend.prevent.stop="() => false"
                  placeholder="Filter by video title..."
                  class="input-ghost-dark"
                />
                <b-input-group-append>
                  <b-button variant="ghost-dark">
                    <i class="fas fa-filter"></i>
                  </b-button>
                </b-input-group-append>
              </b-input-group>
              <b-button-group>
                <b-button
                  :variant="
                    view === 'grid' ? 'ghost-dark' : 'ghost-dark-outline'
                  "
                  class="ml-2"
                  @click="view = 'grid'"
                >
                  <i class="fas fa-th"></i>
                </b-button>
                <b-button
                  :variant="
                    view === 'list' ? 'ghost-dark' : 'ghost-dark-outline'
                  "
                  @click="view = 'list'"
                  style="border-left: none"
                >
                  <i class="fas fa-list"></i>
                </b-button>
              </b-button-group>
            </div>
            <div
              :class="{
                'loader text-center mb-4': true,
                'd-none': videos,
              }"
              style="flex: 1"
            >
              <Loader :sticky="true" message="Loading videos..." />
            </div>
            <div
              :class="{
                'text-center': true,
                'd-none': !videos || videos.length > 0,
              }"
            >
              No more videos.
            </div>
            <template v-if="videos && videos.length > 0">
              <YouTubeVideoList
                ref="youtubeVideoList"
                skin="dark"
                :videos="videos"
                :checkSubs="false"
                :checkSaved="false"
                :key="`videos-filtered-${this.keyword}`"
                :view="view"
                :showBadges="false"
                :showDate="showDate"
                :showProgress="true"
                :showPlayButton="true"
              />
              <div v-observe-visibility="visibilityChanged"></div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Config from "@/lib/config";
import Helper from "@/lib/helper";
import axios from "axios";
import YouTube from "@/lib/youtube";
import { tify, sify } from "chinese-conv";

export default {
  props: {
    id: String,
    type: String,
  },
  data() {
    return {
      collection: this.type === "tv-show" ? "tv_show" : "talk",
      moreVideos: 0,
      show: undefined,
      videos: undefined,
      perPage: 96,
      count: undefined,
      keyword: "",
      view: "grid",
      titleUpdated: false,
      coverUpdated: false,
      randomEpisode: undefined,
      currentTime: 0,
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
    showDate() {
      return this.type === "talk";
    },
  },
  watch: {
    async keyword() {
      let keywords = [this.keyword];
      if (this.$l2.han) {
        keywords.push(tify(this.keyword));
        keywords.push(sify(this.keyword));
      }
      keywords = Helper.unique(keywords);
      let videos = [];

      for (let keyword of keywords) {
        videos = videos.concat(
          await this.getVideos({
            keyword,
          })
        );
      }
      this.videos = videos;
    },
  },
  async fetch() {
    if (this.id) {
      this.show = await this.getShow(this.id, this.collection);
      if (this.show) {
        this.videos = await this.getVideos({
          limit: this.perPage,
          offset: this.moreVideos,
        });
      }
      await this.loadRandomEpisode();
    }
  },
  methods: {
    async removeEpisode(randomEpisode) {
      let response = await axios.delete(`${Config.wiki}items/youtube_videos/${randomEpisode.id}`)
      if (response) {
        this.loadRandomEpisode()
      }
    },
    updateCurrentTime(currentTime) {
      if (typeof window !== "undefined") {
        this.currentTime = currentTime;
      }
    },
    async loadRandomEpisode() {
      this.randomEpisode = await this.getRandomEpisode();
    },
    async getRandomEpisode() {
      let videos = this.videos;
      let randomVideo = videos[Math.floor(Math.random() * videos.length)];
      let videoUrl = `${Config.wiki}items/youtube_videos/${randomVideo.id}?fields=youtube_id,id`;
      let res = await axios.get(videoUrl);
      if (res && res.data.data) {
        let video = res.data.data;
        video.subs_l2 = YouTube.parseSavedSubs(video.subs_l2);
        return video;
      }
    },
    async saveTitle(e) {
      let newTitle = e.target.innerText;
      if (this.show.title !== newTitle) {
        try {
          let response = await axios.patch(
            `${Config.wiki}items/${this.collection}s/${this.show.id}`,
            { title: newTitle },
            { contentType: "application/json" }
          );
          response = response.data;
          if (response && response.data) {
            this.show.title = newTitle;
            this.titleUpdated = true;
            await Helper.timeout(3000);
            this.titleUpdated = false;
          }
        } catch (err) {
          // Direcuts bug
        }
      }
    },
    async saveCover(e) {
      let newCover = e.target.innerText;
      if (this.show.title !== newCover) {
        try {
          let response = await axios.patch(
            `${Config.wiki}items/${this.collection}s/${this.show.id}`,
            { youtube_id: newCover },
            { contentType: "application/json" }
          );
          response = response.data;
          if (response && response.data) {
            this.show.youtube_id = newCover;
            this.coverUpdated = true;
            await Helper.timeout(3000);
            this.coverUpdated = false;
          }
        } catch (err) {
          // Direcuts bug
        }
      }
    },
    async visibilityChanged(isVisible) {
      if (this.videos && isVisible && !this.keyword) {
        this.moreVideos = 1 + this.moreVideos + this.perPage;
        let newVideos = await this.getVideos({
          limit: this.perPage,
          offset: this.moreVideos,
        });
        this.videos = this.videos.concat(newVideos);
      }
    },
    async getShow(id, collection) {
      let response = await axios.get(
        `${Config.wiki}items/${collection}s/${id}`
      );
      if (response && response.data) {
        return response.data.data;
      }
    },
    async getVideos({ keyword, limit = 500, offset = 0 } = {}) {
      let sort = this.show.title === "News" ? "-date" : "title";
      let keywordFilter = keyword ? `&filter[title][contains]=${keyword}` : "";
      let response = await axios.get(
        `${Config.wiki}items/youtube_videos?filter[l2][eq]=${
          this.$l2.id
        }&filter[${this.collection}][eq]=${
          this.show.id
        }${keywordFilter}&fields=channel_id,id,lesson,level,title,topic,youtube_id,date,tv_show.*,talk.*&sort=${sort}&limit=${limit}&offset=${offset}&timestamp=${
          this.$adminMode ? Date.now() : 0
        }&meta=filter_count`
      );
      let videos = response.data.data || [];
      this.count = response.data.meta.filter_count;
      videos = Helper.uniqueByValue(videos, "youtube_id");
      if (this.show.title !== "News") {
        videos =
          videos.sort((x, y) =>
            (x.title || "").localeCompare(y.title, this.$l2.code, { numeric: true })
          ) || [];
      } else {
        videos =
          videos.sort((y, x) =>
            x.date
              ? x.date.localeCompare(y.date, this.$l2.code, { numeric: true })
              : -1
          ) || [];
      }
      return videos;
    },
  },
};
</script>

<style lang="scss" scoped>
@media (max-width: 576px) {
  .youtube-video-list-wrapper {
    max-width: 423px;
    margin: 0 auto;
  }
}
::v-deep .synced-transcript {
  height: 5rem;
  overflow: hidden;
}
</style>