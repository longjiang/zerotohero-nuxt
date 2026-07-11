// lib/mixins/youtubeVideoListAdminMixin.js
// Admin logic extracted from YouTubeVideoList.vue
import Vue from "vue";
import {
  groupArrayBy,
  arrayChunk,
  timeout,
  unique,
  uniqueByValue,
  normalizeStylizedNumbersInText,
} from "../utils";
import YouTube from "../youtube";
import sha256 from "js-sha256";

export default {
  props: {
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
    showAdminToolsInAdminMode: {
      default: true,
    },
    hideVideosWithoutSubsProp: {
      default: false,
    },
    cloakVideosWithoutSubs: {
      default: false,
    },
    initialSort: {
      type: String, // One of 'title', '-date', '-views', '-likes', '-comments'
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
      cachedVideoMetaFromYouTube: [],
      sort: this.initialSort,
      sortOptions: [
        { value: "title", text: "Title" },
        { value: "-date", text: "Date" },
        { value: "-views", text: "Views" },
        { value: "-likes", text: "Likes" },
        { value: "-comments", text: "Comments" },
      ],
    };
  },

  computed: {
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
        if (!newValue) return;
        oldValue = oldValue || [];
        const changed =
          sha256(newValue.map((video) => video.youtube_id).join(",")) !==
          sha256(oldValue.map((video) => video.youtube_id).join(","));
        if (changed) {
          if (this.checkSubs) this.checkInfo();
        }
      },
      immediate: false,
    },
  },

  mounted() {
    if (this.checkSubs) this.checkInfo();
  },

  methods: {
    /**
     * Use a comma-separated list of video ids as an ad hoc playlist, so when
     * the user plays the videos, the next videos in the list are automatically
     * queued up.
     */
    getAdHocPlaylistId(videoId) {
      const MAX_LENGTH = 1000;
      const videoIds = this.filteredVideos.map((v) => v.id);

      const videoIdIndex = videoIds.indexOf(videoId);
      if (videoIdIndex === -1) {
        return videoIds[0] || "";
      }

      let playlist = videoId;
      let leftIndex = videoIdIndex - 1;
      let rightIndex = videoIdIndex + 1;

      while (true) {
        const leftId = leftIndex >= 0 ? videoIds[leftIndex] : null;
        const rightId =
          rightIndex < videoIds.length ? videoIds[rightIndex] : null;

        const newLeftPlaylist = leftId ? leftId + "," + playlist : null;
        const newRightPlaylist = rightId ? playlist + "," + rightId : null;

        let direction;
        if (newLeftPlaylist && newRightPlaylist) {
          direction =
            newLeftPlaylist.length < newRightPlaylist.length ? "left" : "right";
        } else if (newLeftPlaylist) {
          direction = "left";
        } else if (newRightPlaylist) {
          direction = "right";
        } else {
          break;
        }

        if (direction === "left" && newLeftPlaylist.length <= MAX_LENGTH) {
          playlist = newLeftPlaylist;
          leftIndex--;
        } else if (
          direction === "right" &&
          newRightPlaylist.length <= MAX_LENGTH
        ) {
          playlist = newRightPlaylist;
          rightIndex++;
        } else {
          break;
        }
      }

      return playlist;
    },

    async checkInfo() {
      if (!this.videos && this.videos.length) return;
      const youtube_ids = this.videos
        .map((v) => v.youtube_id)
        .filter(
          (id) => !this.cachedVideoMetaFromYouTube.find((v) => v.id === id)
        );
      if (youtube_ids.length) {
        const videoMetaFromYouTube = await YouTube.videosByApi(youtube_ids);
        if (videoMetaFromYouTube && videoMetaFromYouTube.length)
          this.cachedVideoMetaFromYouTube = [
            ...this.cachedVideoMetaFromYouTube,
            ...videoMetaFromYouTube,
          ];
      }
      for (let video of this.videos) {
        let info = this.cachedVideoMetaFromYouTube.find(
          (v) => v.id === video.youtube_id
        );
        if (!info) continue;
        let date = info.snippet["publishedAt"] || null;
        let channelId = info.snippet["channelId"] || null;
        let tags = info.snippet["tags"] ? info.snippet["tags"].join(",") : "";
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
      videos = videos.filter((v) => !v.id);
      let youtube_ids = videos
        .map((v) => v.youtube_id)
        .filter((id) => !id.includes("0x"));
      let chunks = arrayChunk(youtube_ids, 50);
      for (let youtube_ids of chunks) {
        let filter = `filter[youtube_id][in]=${youtube_ids}`;
        let fields = `fields=id,title,channel_id,youtube_id,tv_show,talk`;
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
          let numsInFileName = normalizeStylizedNumbersInText(file.name).match(
            /\d+/g
          );
          let numsInVideoTitle = normalizeStylizedNumbersInText(
            card.video.title
          ).match(/\d+/g);
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
