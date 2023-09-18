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
              size="small"
              @click="checkSavedData = true"
            >
              <i class="fas fa-question mr-2"></i>
              Check Saved
            </b-button>
            <b-button
              class="mt-1 mb-1"
              v-if="checkSavedData && checkSavedDone"
              size="small"
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
                (generated ? filteredVideos.length : videosWithSubs.length) -
                  savedVideos.length >
                  0
              "
              size="small"
              @click="addAll()"
            >
              <i class="fas fa-plus mr-2"></i>
              Add All
              {{
                (generated ? filteredVideos.length : videosWithSubs.length) -
                savedVideos.length
              }}
            </b-button>
            <b-button size="small" @click="surveyChannels">
              Survey Channels
            </b-button>
            <b-button
              v-if="checkSavedData && checkSavedDone"
              class="mt-1 mb-1"
              @click="removeAll()"
              size="small"
            >
              <i class="fas fa-trash mr-2"></i>
              Remove All
            </b-button>
            <br />
          </div>
          <div v-if="checkSavedData && checkSavedDone">
            <AssignShow
              size="small"
              @assignShow="assignShowToAll"
              :defaultSelection="defaultShowTitle"
              type="tv-shows"
            />
            <AssignShow
              size="small"
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
            <span v-if="checkSubs">, {{ filteredVideos.length }} checked</span>
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
              size="small"
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
                  name: 'video-view',
                  params: {
                    type: 'youtube',
                    youtube_id: channel.videos[0].youtube_id,
                  },
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

      <draggable
        @end="$emit('end', $event)"
        class="youtube-videos row"
        v-if="videos"
        :disabled="!dragEnabled"
      >
        <div
          v-for="(video, videoIndex) in filteredVideos"
          :class="colClasses(video, videoIndex)"
          :key="`youtube-video-wrapper-${video.youtube_id}-${videoIndex}`"
        >
          <LazyFeedItem v-if="view === 'feed'" :video="video" :skin="$skin" />
          <LazyYouTubeVideoCard
            v-else
            ref="youTubeVideoCard"
            :class="{ 'checking-subs': checkSubs && subsChecked < videoIndex }"
            @newShow="newShow"
            @hasSubs="onHasSubs"
            @unavailable="unavailableVideos.push(video)"
            :skin="$skin"
            :video="video"
            :generated="generated"
            :checkSubs="checkSubsData"
            :checkSaved="checkSavedData"
            :view="view"
            :showSubsEditing="showSubsEditing"
            :showBadges="showBadges"
            :showDate="showDate"
            :showProgress="showProgress"
            :showPlayButton="showPlayButton"
            :showLanguage="multilingual"
            :playlist="playlist"
          >
            <template v-slot:footer>
              <slot name="footer" :video="video"></slot>
            </template>
          </LazyYouTubeVideoCard>
        </div>
      </draggable>
    </div>
  </container-query>
</template>

<script>
import Vue from "vue";
import {
  groupArrayBy,
  arrayChunk,
  timeout,
  unique,
  uniqueByValue,
  normalizeStylizedNumbersInText
} from "@/lib/utils";
import { Drag, Drop } from "vue-drag-drop";
import { ContainerQuery } from "vue-container-query";
import draggable from "vuedraggable";
import YouTube from "@/lib/youtube";
import sha256 from "js-sha256";

export default {
  components: {
    draggable,
    ContainerQuery,
    Drag,
    Drop,
  },
  props: {
    dragEnabled: {
      default: false,
    },
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
      default: null,
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
    playlist: {
      type: Object,
    },
  },

  data() {
    return {
      unavailableVideos: [],
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
      cachedVideoMetaFromYouTube: [],
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
    filteredVideos() {
      let keyword = this.keyword ? this.keyword.toLowerCase() : undefined;
      let filteredVideos = this.videos.filter((video) => {
        if (this.unavailableVideos.includes(video)) return false;
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
      if (!this.$adminMode)
        filteredVideos = uniqueByValue(filteredVideos, "youtube_id");
      return filteredVideos;
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
    videos: {
      handler(newValue, oldValue) {
        const changed =
          sha256(newValue.map((video) => video.youtube_id).join(",")) !==
          sha256(oldValue.map((video) => video.youtube_id).join(","));
        if (changed) {
          if (this.checkSubs) this.checkInfo();
        }
      },
      immediate: false, // This makes the watcher "lazy"
    },
  },
  mounted() {
    if (this.checkSubs) this.checkInfo();
  },
  methods: {
    async checkInfo() {
      if (!this.videos?.length) return;
      // Only get the ones that are not already in the cache
      const youtube_ids = this.videos
        .map((v) => v.youtube_id)
        .filter((id) => !this.cachedVideoMetaFromYouTube.find(v => v.id === id));
      if (youtube_ids.length) {
        const videoMetaFromYouTube = await YouTube.videosByApi(youtube_ids);
        if (videoMetaFromYouTube?.length)
          this.cachedVideoMetaFromYouTube = [
            ...this.cachedVideoMetaFromYouTube,
            ...videoMetaFromYouTube,
          ];
      }
      // Add info to videos
      for (let video of this.videos) {
        let info = this.cachedVideoMetaFromYouTube.find(
          (v) => v.id === video.youtube_id
        );
        if (!info) continue;
        let date = info.snippet["publishedAt"] || null;
        let channelId = info.snippet["channelId"] || null;
        let tags = info.snippet["tags"] ? info.snippet["tags"].join(',') : "";
        let category = info.snippet["categoryId"] || null;
        let locale = info.snippet["defaultAudioLanguage"] || null;
        let duration = info.contentDetails["duration"] || null;
        let made_for_kids = info.status["madeForKids"] || false;
        let views = info.statistics["viewCount"] || 0;
        let likes = info.statistics["likeCount"] || 0;
        let comments = info.statistics["commentCount"] || 0;

        let updates = {
          date,
          channel_id: channelId,
          tags,
          category,
          locale,
          duration,
          made_for_kids: made_for_kids ? 1 : 0,
          views,
          likes,
          comments,
          title: info.snippet.title,
        };
        for (let key in updates) {
          if (key === "data") continue;
          if (video[key] !== updates[key]) {
            Vue.set(video, key, updates[key]);
          }
        }
      }
    },
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
      return classes;
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
      let groups = groupArrayBy(this.videos, "channel_id");
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
      let chunks = arrayChunk(youtube_ids, 50);
      for (let youtube_ids of chunks) {
        let filter = `filter[youtube_id][in]=${youtube_ids}`;
        let fields = `fields=id,title,channel_id,youtube_id,tv_show.*,talk.*`;
        if (this.showSubsEditing) fields += ",subs_l2";
        let timestamp = `timestamp=${this.$adminMode ? Date.now() : 0}`;
        let query = [filter, fields, timestamp].join("&");
        let savedVideos = await this.$directus.getVideos({
          l2Id: this.$l2.id,
          query,
        });

        for (let video of videos) {
          let savedVideo = savedVideos.find(
            (v) => v.youtube_id === video.youtube_id
          );
          if (!savedVideo) continue;
          video.tv_show = savedVideo.tv_show;
          video.talk = savedVideo.talk;
          if (savedVideo.subs_l2) {
            let subs_l2 = this.$subs.parseSavedSubs(savedVideo.subs_l2);
            if (subs_l2[0]) {
              video.subs_l2 = subs_l2;
              this.firstLineTime = video.subs_l2[0].starttime;
            }
          }
          Vue.set(video, "id", savedVideo.id);
        }
      }
    },
    newShow(show) {
      this.$emit("newShow", show);
    },
    async batch(action, delay = 0) {
      let indices = Object.keys(this.$refs.youTubeVideoCard);
      let chunks = arrayChunk(indices, 3);
      for (let chunk of chunks) {
        let promises = [];
        for (let videoIndex of chunk) {
          promises.push(action(videoIndex));
        }
        await timeout(delay);
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
      this.unavailableYouTubeIds = unique(this.unavailableYouTubeIds);
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
          let numsInFileName = normalizeStylizedNumbersInText(file.name).match(/\d+/g);
          let numsInVideoTitle = normalizeStylizedNumbersInText(card.video.title).match(/\d+/g);
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
.youtube-video-list-admin-bar {
  background: rgb(205, 207, 212);
}

.skin-dark {
  .youtube-video-list-admin-bar {
    background-color: #88888822;
  }
}

.skin-light {
  .youtube-video-list-admin-bar {
    background-color: #88888822;
  }
}

.col-compact {
  padding: 0.5rem;
  :deep(.media-body) {
    font-size: 0.9em;
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

.checking-subs {
  opacity: 0.2;
}
</style>
