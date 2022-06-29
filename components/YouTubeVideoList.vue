<template>
  <container-query :query="query" v-model="params">
    <div
      :class="{
        'youtube-video-list': true,
        'cloak-videos-without-subs': cloakVideosWithoutSubs,
      }"
    >
      <client-only>
        <div
          v-if="$adminMode && showAdminToolsInAdminMode"
          class="mb-4 youtube-video-list-admin-bar rounded p-3 w-100"
        >
          <div>
            <b-button
              class="mt-1 mb-1"
              v-if="!checkSavedData"
              size="sm"
              @click="checkSavedData = true"
            >
              <i class="fas fa-question mr-2"></i>
              Check Saved
            </b-button>
            <b-button
              class="mt-1 mb-1"
              v-if="checkSavedData && checkSavedDone"
              size="sm"
              @click="checkSavedData = false"
            >
              <i class="fas fa-question mr-2"></i>
              Uncheck Saved
            </b-button>
            <b-button
              class="mt-1 mb-1"
              variant="secondary"
              v-if="
                checkSavedData &&
                checkSavedDone &&
                (generated ? shownVideos.length : videosWithSubs.length) -
                  savedVideos.length >
                  0
              "
              size="sm"
              @click="addAll()"
            >
              <i class="fas fa-plus mr-2"></i>
              Add All
              {{
                (generated ? shownVideos.length : videosWithSubs.length) -
                savedVideos.length
              }}
            </b-button>
            <b-button size="sm" @click="surveyChannels">
              Survey Channels
            </b-button>
            <b-button
              v-if="checkSavedData && checkSavedDone"
              class="mt-1 mb-1"
              @click="removeAll()"
              size="sm"
            >
              <i class="fas fa-trash mr-2"></i>
              Remove All
            </b-button>
            <br />
          </div>
          <div v-if="checkSavedData && checkSavedDone">
            <AssignShow
              size="sm"
              @assignShow="assignShowToAll"
              :defaultSelection="defaultShowTitle"
              type="tv-shows"
            />
            <AssignShow
              size="sm"
              @assignShow="assignShowToAll"
              :defaultSelection="defaultShowTitle"
              type="talks"
            />
            <drop
              @drop="handleDrop"
              :class="{
                'subs-drop text-secondary rounded d-inline-block text-center mt-1': true,
                over: over,
                drop: true,
              }"
              :key="`drop-${_uid}`"
              @dragover="over = true"
              @dragleave="over = false"
              style="font-size: 0.9em"
            >
              Drop SRT files here to bulk add subs ...
            </drop>
          </div>
          <div class="mt-1">
            {{ filteredVideos.length }} videos
            <span v-if="checkSubs">, {{ shownVideos.length }} checked</span>
            <span v-if="checkSubs">
              , {{ videosWithSubs.length }} have subs
            </span>
            <span v-if="checkSavedData">, {{ savedVideos.length }} added</span>
          </div>
          <div class="mt-1" style="font-size: 0.9em">
            <b-form-checkbox
              class="mr-1 d-inline-block"
              v-model="hideVideosWithoutSubs"
            >
              Hide Videos without Subs
            </b-form-checkbox>
            <b-form-checkbox
              class="mr-1 d-inline-block"
              v-model="hideVideosInShows"
            >
              Hide Videos in Shows
            </b-form-checkbox>
            <b-form-checkbox
              class="mr-1 d-inline-block"
              v-model="showSubsEditing"
            >
              Show Subs Editing
            </b-form-checkbox>
            <b-form-checkbox class="mr-1 d-inline-block" v-model="generated">
              Use Auto-Generated Subs
            </b-form-checkbox>
            <!-- <a
              class="link-unstyled"
              @click="removeAllUnavailable()"
              v-if="isLocalHost()"
            >
              Remove unavailable videos
            </a> -->
          </div>
          <div class="mt-1">
            <b-form-input
              type="text"
              v-model="keyword"
              :lazy="true"
              placeholder="Filter"
              size="sm"
            />
          </div>
          <div v-if="channels">
            <h6 class="mt-2">Channels with the most videos below:</h6>
            <div
              v-for="(channel, index) in channels"
              :key="`video-list-unique-by-channel-${index}`"
            >
              {{ channel.videos.length }} Videos:
              <router-link
                :to="{
                  name: 'youtube-view',
                  params: { youtube_id: channel.videos[0].youtube_id },
                }"
              >
                {{
                  channel.videos[0].title
                    ? channel.videos[0].title.slice(0, 30)
                    : "(Untitled)"
                }}
              </router-link>
            </div>
          </div>
        </div>
      </client-only>
      <div class="youtube-videos row">
        <div
          v-for="(video, videoIndex) in shownVideos"
          :class="colClasses(video, videoIndex)"
          :key="`youtube-video-wrapper-${video.youtube_id}-${videoIndex}`"
        >
          <LazyFeedItem
            v-if="view === 'feed'"
            :video="video"
            :skin="skin"
          />
          <LazyYouTubeVideoCard
            v-else
            ref="youTubeVideoCard"
            @newShow="newShow"
            @hasSubs="onHasSubs"
            :video="video"
            :generated="generated"
            :checkSubs="checkSubsData"
            :checkSaved="checkSavedData"
            :view="view"
            :skin="skin"
            :showSubsEditing="showSubsEditing"
            :showBadges="showBadges"
            :showDate="showDate"
            :showProgress="showProgress"
            :showPlayButton="showPlayButton"
            :showLanguage="multilingual"
          />
        </div>
      </div>
    </div>
  </container-query>
</template>

<script>
import Vue from "vue";

import { parseSavedSubs } from '@/lib/directus'
import Helper from "@/lib/helper";
import Config from "@/lib/config";
import { Drag, Drop } from "vue-drag-drop";
import { ContainerQuery } from "vue-container-query";

export default {
  components: {
    ContainerQuery,
    Drag,
    Drop,
  },
  props: {
    videos: {
      type: Array,
    },
    defaultShowTitle: {
      type: String,
    },
    checkSaved: {
      type: Boolean,
      default: false,
    },
    checkSubs: {
      type: Boolean,
      default: false,
    },
    view: {
      type: String,
      default: "grid",
    },
    singleColumn: {
      type: Boolean,
      default: false,
    },
    showBadges: {
      default: false,
    },
    showDate: {
      default: false,
    },
    skin: {
      default: "card", // or 'dark'
    },
    showProgress: {
      default: false,
    },
    showPlayButton: {
      default: false,
    },
    showAdminToolsInAdminMode: {
      default: true,
    },
    hideVideosWithoutSubsProp: {
      default: false,
    },
    cloakVideosWithoutSubs: {
      default: false,
    },
    multilingual: {
      default: false,
    },
  },

  data() {
    return {
      channels: undefined,
      checkSavedData: this.checkSaved,
      checkSavedDone: false,
      checkSubsData: this.checkSubs,
      generated: false,
      hideVideosInShows: false,
      hideVideosWithoutSubs: this.hideVideosWithoutSubsProp,
      keyword: undefined,
      over: false,
      showChannels: false,
      showSubsEditing: false,
      subsChecked: 3,
      unavailableYouTubeIds: [],
      videosInfoKey: 0,
      params: {},
      query: {
        xs: {
          minWidth: 0,
          maxWidth: 423,
        },
        sm: {
          minWidth: 423,
          maxWidth: 720,
        },
        md: {
          minWidth: 720,
          maxWidth: 960,
        },
        lg: {
          minWidth: 960,
          maxWidth: 1140,
        },
        xl: {
          minWidth: 1140,
        },
      },
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
    filteredVideos() {
      let keyword = this.keyword ? this.keyword.toLowerCase() : undefined;
      let filteredVideos = this.videos.filter((video) => {
        if (this.hideVideosWithoutSubs && !video.hasSubs) return false;
        if (
          this.hideVideosInShows &&
          video.id &&
          ((video.tv_show && video.tv_show.id) || (video.talk && video.talk.id))
        )
          return false;
        if (keyword && !video.title.toLowerCase().includes(keyword))
          return false;
        return true;
      });
      return filteredVideos;
    },
    shownVideos() {
      return this.checkSubs
        ? this.filteredVideos.slice(0, this.subsChecked)
        : this.filteredVideos;
    },
    videosWithSubs() {
      return this.checkSubs
        ? this.filteredVideos
            .slice(0, this.subsChecked)
            .filter((v) => v.hasSubs)
        : this.filteredVideos.filter((v) => v.hasSubs);
    },
    savedVideos() {
      return this.checkSubs
        ? this.filteredVideos.slice(0, this.subsChecked).filter((v) => v.id)
        : this.filteredVideos.filter((v) => v.id);
    },
  },
  watch: {
    async checkSavedData() {
      if (this.checkSavedData) {
        await this.checkSavedFunc(this.filteredVideos);
        this.checkSavedDone = true;
      } else {
        for (let video of this.filteredVideos) {
          delete video.tv_show;
          delete video.talk;
          Vue.delete(video, "id");
        }
        this.checkSavedDone = false;
      }
    },
  },
  methods: {
    colClasses(video, videoIndex) {
      let classes = { "pb-3": true, "col-no-subs": !video.hasSubs };
      if (this.view == "list" || this.singleColumn) {
        classes["col-sm-12"] = true;
      } else if (this.view === "grid") {
        classes = Object.assign(
          {
            "col-compact": this.params.xs,
            "col-6": this.params.xs || this.params.sm,
            "col-4": this.params.md,
            "col-3": this.params.lg || this.params.xl,
          },
          classes
        );
      } else if (this.view === "feed") {
        classes = Object.assign(
          {
            "col-12": this.params.xs || this.params.sm || this.params.md,
            "col-6": this.params.lg || this.params.xl,
          },
          classes
        );
      }
      return classes
    },
    onHasSubs(hasSubs) {
      this.subsChecked++;
    },
    isLocalHost() {
      return (
        typeof window !== "undefined" &&
        window.location.href.startsWith("http://localhost")
      );
    },
    surveyChannels() {
      let groups = Helper.groupArrayBy(this.videos, "channel_id");
      let channels = [];
      for (let channel_id in groups) {
        channels.push({
          channel_id,
          videos: groups[channel_id],
        });
      }
      channels = channels.sort((a, b) => b.videos.length - a.videos.length);
      this.channels = channels;
    },
    async checkSavedFunc(videos) {
      videos = videos.filter((v) => !v.id); // Only check those that are not saved
      let youtube_ids = videos
        .map((v) => v.youtube_id)
        .filter((id) => !id.includes("0x"));
      let chunks = Helper.arrayChunk(youtube_ids, 100);
      for (let youtube_ids of chunks) {
        let response = await this.$authios.get(
          `${Config.youtubeVideosTableName(
            this.$l2.id
          )}?filter[youtube_id][in]=${youtube_ids}&fields=id,title,channel_id,youtube_id,tv_show.*,talk.*${
            this.showSubsEditing ? ",subs_l2" : ""
          }&filter[l2][eq]=${this.$l2.id}&timestamp=${
            this.$adminMode ? Date.now() : 0
          }`
        );
        if (response.data && response.data.data && response.data.data[0]) {
          let savedVideos = response.data.data;
          for (let video of videos) {
            let savedVideo = savedVideos.find(
              (v) => v.youtube_id === video.youtube_id
            );
            if (savedVideo) {
              video.tv_show = savedVideo.tv_show;
              video.talk = savedVideo.talk;
              if (savedVideo.subs_l2) {
                let subs_l2 = parseSavedSubs(savedVideo.subs_l2);
                if (subs_l2[0]) {
                  video.subs_l2 = subs_l2;
                  this.firstLineTime = video.subs_l2[0].starttime;
                }
              }
              Vue.set(video, "id", savedVideo.id);
            }
          }
        }
      }
    },
    newShow(show) {
      this.$emit("newShow", show);
    },
    async batch(action, delay = 0) {
      let indices = Object.keys(this.$refs.youTubeVideoCard);
      let chunks = Helper.arrayChunk(indices, 3);
      for (let chunk of chunks) {
        let promises = [];
        for (let videoIndex of chunk) {
          promises.push(action(videoIndex));
        }
        await Helper.timeout(delay);
        await Promise.all(promises);
      }
    },
    async addAll() {
      this.batch((videoIndex) => {
        if (this.$refs.youTubeVideoCard[videoIndex])
          this.$refs.youTubeVideoCard[videoIndex].getSubsAndSave();
      }, 1000);
    },
    async assignShowToAll(show, type) {
      // type: 'tv_show' or 'talk'
      this.batch((videoIndex) => {
        if (this.$refs.youTubeVideoCard[videoIndex])
          this.$refs.youTubeVideoCard[videoIndex].saveShow(show, type);
      }, 1);
    },
    async removeAll() {
      for (let videoIndex in this.$refs.youTubeVideoCard) {
        await this.$refs.youTubeVideoCard[videoIndex].remove();
      }
    },
    async removeAllUnavailable() {
      this.unavailableYouTubeIds = Helper.unique(this.unavailableYouTubeIds);
      for (let videoIndex in this.$refs.youTubeVideoCard) {
        let videoCard = this.$refs.youTubeVideoCard[videoIndex];
        if (this.unavailableYouTubeIds.includes(videoCard.video.youtube_id)) {
          await videoCard.remove();
        }
      }
    },
    handleDrop(data, event) {
      event.preventDefault();
      let files = event.dataTransfer.files;
      this.importSrtToAll(files);
    },
    importSrtToAll(files) {
      for (let file of files) {
        for (let videoIndex in this.$refs.youTubeVideoCard) {
          let card = this.$refs.youTubeVideoCard[videoIndex];
          let numsInFileName = file.name.match(/\d+/g);
          let numsInVideoTitle = card.video.title.match(/\d+/g);
          let found = false;
          if (numsInFileName && numsInVideoTitle) {
            for (let n of numsInFileName) {
              for (let m of numsInVideoTitle) {
                if (Number(n) === Number(m)) {
                  found = true;
                }
              }
            }
            if (found !== false) {
              card.importSrt(file);
            }
          }
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.col-compact {
  padding: 0.5rem;
  ::v-deep .media-body {
    font-size: 0.9em;
  }
}
.youtube-video-list-admin-bar {
  background: rgb(205, 207, 212);
}

.main-dark {
  .youtube-video-list-admin-bar {
    background-color: #88888822;
  }
  .youtube-title {
    color: white;
  }
}

.subs-drop {
  border: 1px #666 dashed;
  padding: 0.2rem 0.6rem;
}

.cloak-videos-without-subs {
  .col-no-subs {
    display: none;
  }
}
</style>
