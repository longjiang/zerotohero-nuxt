<!-- /components/YouTubeVideoCard/index.vue -->
<template>
  <SubtitleDropZone
    :video="video"
    :checkSubs="checkSubs"
    :generated="generated"
    :over.sync="over"
    @drop-file="importSrt"
  >
    <div
      :class="{
        'youtube-video-card': true,
        'youtube-video-card-grid': view === 'grid',
        'youtube-video-card-list': view === 'list',
      }"
      v-observe-visibility="{
        callback: visibilityChanged,
        once: true,
      }"
    >
      <!-- Thumbnail -->
      <YouTubeThumbnail
        :video="video"
        :to="to"
        :progress="progress"
        :view="view"
        @thumbnailLoaded="thumbnailLoaded"
        @thumbnailError="thumbnailError"
      />

      <!-- Media body -->
      <div class="media-body">
        <div class="youtube-title-row">
          <div class="youtube-title">
            <span
              contenteditable="true"
              :class="{
                'd-none': !$adminMode || view === 'list',
              }"
              @blur="saveTitle"
            >
              {{ video.title }}
            </span>
            <router-link
              :class="{
                'youtube-title-text': true,
                'link-unstyled': true,
                'd-none': $adminMode && view !== 'list',
              }"
              :to="to"
            >
              {{ video.title }}
            </router-link>
          </div>

          <b-button
            class="youtube-video-card-badge border-0 p-0"
            size="sm"
            variant="no-bg"
            @click.stop="showActionsModal"
            :title="$t('Actions')"
          >
            <i class="fa-solid fa-ellipsis-v"></i>
          </b-button>
        </div>

        <b-modal
          :id="actionsModalId"
          :title="$t('Actions')"
          centered
          hide-footer
          size="sm"
        >
          <b-button
            v-if="channelPreferenceStatus !== 'not_interested'"
            @click.stop="subscribeToChannel"
            class="d-block w-100 text-left"
            variant="light"
          >
            <i class="fa-solid fa-bell mr-2"></i>
            {{ subscribeLabel }}
          </b-button>
          <b-button
            v-if="channelPreferenceStatus === 'not_interested'"
            @click.stop="markChannelNotInterested"
            class="d-block w-100 text-left"
            variant="light"
          >
            <i class="fa-solid fa-ban mr-2"></i>
            {{ notInterestedLabel }}
          </b-button>
          <b-button
            v-else-if="channelPreferenceStatus !== 'subscribed'"
            @click.stop="markChannelNotInterested"
            class="d-block w-100 text-left"
            variant="light"
          >
            <i class="fa-solid fa-ban mr-2"></i>
            {{ notInterestedLabel }}
          </b-button>
          <b-button @click.stop="openAddToPlaylist" class="d-block w-100 text-left" variant="light">
            <i class="fa-solid fa-list-music mr-2"></i>
            {{ $t("Add to Playlist") }}
          </b-button>
          <b-button @click.stop="removeVideo" class="d-block w-100 text-left" variant="light" v-if="$adminMode && video.id">
            <i class="fa-solid fa-trash mr-2"></i>
            {{ $t("Remove") }}
          </b-button>
          <b-button @click.stop="editTitle" class="d-block w-100 text-left" variant="light" v-if="$adminMode && video.id">
            <i class="fa-solid fa-edit mr-2"></i>
            {{ $t("Edit title") }}
          </b-button>
        </b-modal>

        <AddToPlaylist ref="addToPlaylist" :video="video" />

        <MediaItemStats
          :item="video"
          :showDate="showDate"
          :showLevel="false"
          style="font-size: 0.8em; margin-top: 0.25rem; opacity: 0.8"
        />

        <client-only>
          <!-- Badges and admin actions -->
          <VideoBadges
            :video="video"
            :checkSubs="checkSubs"
            :checkSaved="checkSaved"
            :generated="generated"
            :showAdmin="showAdmin"
            :adminMode="$adminMode"
            :view="view"
            :showLanguage="showLanguage"
            :language="language"
            :subsFile="subsFile"
            :showSaved="showSaved"
            :showBadges="showBadges"
            :over="over"
            @add-video="getSubsAndSave"
            @remove-video="remove"
            @assign-show="saveShow"
            @new-show="newShow"
          />

          <!-- Subtitle editor -->
          <SubtitleEditor
            v-if="$adminMode && video.id && showSubsEditing"
            :video="video"
            :showSubsEditing="showSubsEditing"
            :adminMode="$adminMode"
            v-model="firstLineTime"
            @update-subs="updateSubs"
          />

          <!-- Footer slot -->
          <slot name="footer" :video="video" />
        </client-only>
      </div>
    </div>
  </SubtitleDropZone>
</template>

<script>
import DateHelper from "@/lib/date-helper";
import YouTube from "@/lib/youtube";
import Vue from "vue";
import assParser from "ass-parser";
import languageEncoding from "detect-file-encoding-and-language";
import { parseSync } from "subtitle";
import { mapState, mapActions } from "vuex";
import {
  parseDuration,
  convertDurationToSeconds,
  levelByDifficulty,
  timeout,
  logError,
  level,
  TOPICS,
} from "@/lib/utils";

// Child components
import SubtitleDropZone from "./SubtitleDropZone.vue";
import YouTubeThumbnail from "./YouTubeThumbnail.vue";
import VideoBadges from "./VideoBadges.vue";
import SubtitleEditor from "./SubtitleEditor.vue";
import MediaItemStats from "@/components/MediaItemStats.vue"; // already existing
import AddToPlaylist from "@/components/AddToPlaylist.vue";

export default {
  components: {
    SubtitleDropZone,
    YouTubeThumbnail,
    VideoBadges,
    SubtitleEditor,
    MediaItemStats,
    AddToPlaylist,
  },
  props: {
    l1: undefined,
    l2: undefined,
    delay: 0,
    sort: {
      type: String, // One of 'title', '-date', '-views', '-likes', '-comments'
    },
    checkSaved: {
      default: false,
    },
    generated: {
      default: false,
    },
    showAdmin: {
      default: true,
    },
    checkSubs: {
      default: false,
    },
    showLanguage: {
      default: false,
    },
    showSubsEditing: {
      default: false,
    },
    showBadges: {
      default: false,
    },
    showDate: {
      default: false,
    },
    showProgress: {
      default: false,
    },
    skin: {
      default: null,
    },
    view: {
      type: String,
      default: "grid", // or 'list'
    },
    video: {
      type: Object,
    },
    playlistId: {
      type: [String, Number],
    },
  },
  data() {
    return {
      over: false,
      unavailable: false,
      firstLineTime:
        this.video.subs_l2 && this.video.subs_l2[0]
          ? this.video.subs_l2[0].starttime
          : undefined,
      subsUpdated: false,
      assignShow: false,
      subsFile: false,
      showSaved: true,
    };
  },
  computed: {
    ...mapState("watchHistory", ["watchHistory"]),
    ...mapState("settings", ["l2Settings"]),
    ...mapState("channelPreferences", ["subscribedChannels", "notInterestedChannels"]),
    language() {
      let language = this.$languages.l1s.find((l1) => l1.id === this.video.l2);
      return language;
    },
    videoL2() {
      if (this.video.l2) return this.$languages.getById(this.video.l2);
    },
    to() {
      let to = {
        name: "l1-l2-video-view-type",
        params: {
          type: "youtube",
          l1: this.l1 ? this.l1.code : this.$l1 ? this.$l1.code : "en",
          l2: this.l2
            ? this.l2.code
            : this.videoL2
            ? this.videoL2.code
            : this.$l2.code,
        },
        query: {
          sort: this.sort,
          v: this.video.youtube_id,
          id: this.video.id,
        },
      };

      if (this.video.lesson) {
        to.params.lesson = "lesson";
      }
      if (this.video.starttime) {
        to.query.t = this.video.starttime;
      } else if (this.showProgress && this.historyItem && this.historyItem.last_position) {
        to.query.t = this.historyItem.last_position;
      }
      if (this.playlistId) {
        to.query.p = this.playlistId;
      }
      return to;
    },
    historyItem() {
      if (this.watchHistory)
        return this.watchHistory.find((i) => i.id === this.video.id);
    },
    progress() {
      if (this.showProgress && this.historyItem) {
        return this.historyItem.last_position / convertDurationToSeconds(this.video.duration);
      }
      return null;
    },
    topics() {
      return TOPICS;
    },
    actionsModalId() {
      return `youtube-video-actions-${(this.video && this.video.id) || (this.video && this.video.youtube_id) || this._uid}`;
    },
    channelId() {
      return this.video?.channel_id || this.video?.channel?.id;
    },
    channelPreferenceStatus() {
      if (this.subscribedChannels.includes(this.channelId)) return "subscribed";
      if (this.notInterestedChannels.includes(this.channelId)) return "not_interested";
      return null;
    },
    subscribeLabel() {
      return this.channelPreferenceStatus === "subscribed" ? this.$t("Unsubscribe") : this.$t("Subscribe to this Channel");
    },
    notInterestedLabel() {
      return this.channelPreferenceStatus === "not_interested" ? this.$t("Undo Not Interested") : this.$t("Not Interested in this Channel");
    },
  },
  async mounted() {
    if (this.checkSubs) {
      await this.checkSubsFunc(this.video);
    }
    if (this.video.id && this.showSubsEditing) {
      await this.addSubsL1(this.video);
    }
  },
  watch: {
    "video.hasSubs"() {
      let hasSubs;
      if (!this.video.checkingSubs && !this.video.hasSubs) hasSubs = false;
      if (this.video.hasSubs) hasSubs = true;
      this.$emit("hasSubs", hasSubs);
    },
  },
  methods: {
    ...mapActions("channelPreferences", ["saveChannelPreference"]),

    // ----- helpers -----
    parseDuration,
    levelByDifficulty,
    level,

    // ----- thumbnail events -----
    thumbnailError(e) {
      console.log("❌ ERROR", this.video.title);
    },
    thumbnailLoaded(e) {},

    // ----- visibility -----
    async visibilityChanged(visible) {
      if (visible && !this.$adminMode) {
        let unavailable = await YouTube.videoUnavailable(this.video.youtube_id)
        if (unavailable) {
          this.unavailable = true
          this.$emit('unavailable', this.video)
        }
      }
    },

    // ----- drop / import srt -----
    async importSrt(file) {
      if (!file) return;
      let extension = file.name.split(".").pop().toLowerCase();
      try {
        let reader = new FileReader();
        let encoding = "UTF-8";
        let fileInfo = await languageEncoding(file);
        if (fileInfo) encoding = fileInfo.encoding;
        reader.readAsText(file, encoding);
        reader.onload = (event) => {
          let str = event.target.result;
          let subs_l2;
          if (extension === "srt") {
            subs_l2 = parseSync(str).map((cue) => {
              return {
                starttime: cue.data.start / 1000,
                duration: (cue.data.end - cue.data.start) / 1000,
                line: cue.data.text,
              };
            });
          }
          if (extension === "ass") {
            let data = assParser(str);
            let events = data.find((section) => section.section === "Events");
            if (events) {
              subs_l2 = events.body
                .filter(
                  (item) =>
                    item.key === "Dialogue" &&
                    !item.value.Style.includes("CN") &&
                    !item.value.Style.includes("STAFF")
                )
                .map((cue) => {
                  return {
                    starttime: DateHelper.parseHMSTime(cue.value.Start),
                    line: cue.value.Text.replace(/{.*}/g, ""),
                  };
                });
            }
          }
          if (subs_l2) {
            subs_l2 = subs_l2.sort((a, b) => a.starttime - b.starttime);
            this.firstLineTime = subs_l2[0].starttime;
            this.subsFile = file;
            Vue.set(this.video, "subs_l2", subs_l2);
            Vue.set(this.video, "hasSubs", true);
            this.$emit("hasSubs", true);
          }
        };
      } catch (err) {}
    },

    // ----- title editing -----
    showActionsModal() {
      this.$bvModal.show(this.actionsModalId);
    },
    openAddToPlaylist() {
      this.$bvModal.hide(this.actionsModalId);
      this.$nextTick(() => {
        if (this.$refs.addToPlaylist && this.$refs.addToPlaylist.open) {
          this.$refs.addToPlaylist.open();
        }
      });
    },
    async subscribeToChannel() {
      this.$bvModal.hide(this.actionsModalId);
      if (!this.channelId) return;

      const status = this.channelPreferenceStatus === "subscribed" ? "neutral" : "subscribed";
      await this.saveChannelPreference({
        channelId: this.channelId,
        l2: this.l2 || this.videoL2 || this.$l2,
        status,
      });
    },
    async markChannelNotInterested() {
      this.$bvModal.hide(this.actionsModalId);
      if (!this.channelId) return;

      const status = this.channelPreferenceStatus === "not_interested" ? "neutral" : "not_interested";
      await this.saveChannelPreference({
        channelId: this.channelId,
        l2: this.l2 || this.videoL2 || this.$l2,
        status,
      });
    },
    async editTitle() {
      this.$bvModal.hide(this.actionsModalId);
      let newTitle = prompt(this.$t("Enter new title"), this.video.title);
      if (newTitle && this.video.title !== newTitle) {
        let data = await this.$directus.patchVideo({
          l2Id: this.video.l2 ? this.video.l2.id || this.video.l2 : this.$l2.id,
          id: this.video.id,
          payload: { title: newTitle },
        });
        if (data) {
          this.video.title = newTitle;
          this.titleUpdated = true;
        }
      }
    },
    async saveTitle(e) {
      let newTitle = e.target.innerText;
      if (this.video.title !== newTitle) {
        let data = await this.$directus.patchVideo({
          l2Id: this.video.l2 ? this.video.l2.id || this.video.l2 : this.$l2.id,
          id: this.video.id,
          payload: { title: newTitle },
        });
        if (data) {
          this.titleUpdated = true;
        }
      }
    },

    // ----- show assignment -----
    newShow(show) {
      this.saveShow(show, show.type);
      this.$emit("newShow", show);
    },
    async saveShow(show, type) {
      let s = this.video[type];
      if (!s || s.id !== show.id) {
        this.showSaved = false;
        this.$store.commit("shows/MODIFY_ITEM", {
          item: this.video,
          key: type,
          value: show,
        });

        if (this.video.id) {
          let payload = {};
          payload[type] = show.id;
          let data = await this.$directus.patchVideo({
            l2Id: this.video.l2
              ? this.video.l2.id || this.video.l2
              : this.$l2.id,
            id: this.video.id,
            query: `fields=id`,
            payload,
          });
          if (data) {
            this.showSaved = true;
          }
        }
      }
      return true;
    },
    async unassignShow(type) {
      let payload = {};
      payload[type] = null;
      let data = await this.$directus.patchVideo({
        l2Id: this.video.l2 ? this.video.l2.id || this.video.l2 : this.$l2.id,
        id: this.video.id,
        payload,
      });
      if (data) {
        Vue.delete(this.video, type);
      }
    },

    // ----- remove -----
    async removeVideo() {
      this.$bvModal.hide(this.actionsModalId);
      if (confirm(this.$t("Are you sure you want to remove this video?"))) {
        await this.remove();
      }
    },
    async remove() {
      if (this.video.id) {
        let deleted = await this.$directus.deleteVideo({
          l2Id: this.video.l2 ? this.video.l2.id || this.video.l2 : this.$l2.id,
          id: this.video.id,
        });
        if (deleted) {
          this.$store.commit("shows/MODIFY_ITEM", {
            item: this.video,
            key: "id",
            value: null,
          });
        }
      }
      return true;
    },

    // ----- subtitle update (backend) -----
    async updateSubs() {
      let data = await this.$directus.patchVideo({
        l2Id: this.video.l2 ? this.video.l2.id || this.video.l2 : this.$l2.id,
        id: this.video.id,
        query: `fields=id`,
        payload: { subs_l2: this.$subs.unparseSubs(this.video.subs_l2) },
      });
      if (data) {
        this.subsUpdated = true;
      }
    },

    // ----- get subs and save (Add button) -----
    async getSubsAndSave(video = this.video) {
      if (this.checkSaved && !video.id && (video.hasSubs || this.generated)) {
        if (
          (!video.subs_l2 || !video.subs_l2[0]) &&
          (video.l2Locale || this.generated)
        ) {
          video.subs_l2 = await YouTube.getTranscript(
            video.youtube_id,
            video.l2Locale || this.$l2.code,
            video.l2Name,
            this.$adminMode,
            this.generated
          );
        }
        if (video.subs_l2 && video.subs_l2[0]) {
          this.firstLineTime = video.subs_l2[0].starttime;
          if (!video.channel_id) await this.getChannelID(video);
          await this.save(video);
        }
      }
      return true;
    },

    async getChannelID(video) {
      let details = await YouTube.videoByApi(video.youtube_id);
      video.channel_id = details.channel.id;
      return details.channel.id;
    },

    async save(video, limit = false, tries = 0) {
      try {
        let id = await this.$directus.postVideo(video, this.$l2, limit, tries);
        if (id) {
          Vue.set(video, "id", id);
          this.showSaved = true;
        }
        return true;
      } catch (err) {
        logError(err);
      }
    },

    // ----- check subs -----
    async checkSubsFunc(video) {
      Vue.set(video, "checkingSubs", true);
      if (this.generated) {
        Vue.set(video, "hasSubs", true);
        Vue.set(video, "checkingSubs", false);
        this.$emit("hasSubs", true);
      } else {
        await timeout(this.delay);
        if (video.subs_l2 && video.subs_l2.length > 0) {
          Vue.set(video, "hasSubs", true);
          Vue.set(video, "checkingSubs", false);
          this.$emit("hasSubs", true);
        } else {
          await YouTube.addTranscriptLocalesToVideo(video, this.$l1, this.$l2);
          this.$emit("hasSubs", video.hasSubs);
          if (this.checkSaved && this.showSubsEditing) {
            this.addSubsL1(video);
          }
          Vue.set(video, "checkingSubs", false);
        }
      }
      return video;
    },

    async addSubsL1(video) {
      if (video) {
        if (!video.l1Locale) {
          YouTube.addTranscriptLocalesToVideo(video, this.$l1, this.$l2);
        }
        let subs_l1 = await YouTube.getTranscript(
          video.youtube_id,
          video.l1Locale,
          video.l2Name
        );
        video.subs_l1 = subs_l1.filter((line) => !/^[♫♪()]/.test(line.line));
        return video;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../assets/scss/variables.scss";

// Styles for the card container and media-body (moved from original)
.youtube-video-card-wrapper.skin-light {
  .youtube-thumbnail-wrapper {
    box-shadow: 0 5px 25px #0000002f;
  }
}

.youtube-video-card,
.youtube-video-card:hover {
  position: relative;
  text-decoration: none;
  .youtube-title-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.5rem;
  }
  .youtube-title {
    flex: 1;
    min-width: 0;
    .youtube-title-text {
      display: -webkit-box;
      line-clamp: 2;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      font-weight: bold;
      overflow: hidden;
    }
  }
  .youtube-video-card-badge {
    flex-shrink: 0;
    color: inherit;
    opacity: 0.8;
    &:hover {
      opacity: 1;
    }
  }
}

.youtube-video-card-list {
  .youtube-thumbnail-wrapper {
    display: none !important;
  }
}

.youtube-video-card-wrapper {
  .media-body {
    padding: 1rem 0 0 0;
  }
}

.statistics {
  font-size: 0.8em;
  margin-top: 0.25rem;
}

.statistics-item + .statistics-item::before {
  content: "·";
  margin-left: 0.15rem;
}
</style>