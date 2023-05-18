<template>
  <drop
    @drop="handleDrop"
    :class="[
      {
        'play-button-wrapper': true,
        'youtube-video-card-wrapper': true,
        [`skin-${$skin}`]: true,
        over,
        media: true,
        nosubs:
          !generated &&
          checkSubs &&
          !video.checkingSubs &&
          !video.hasSubs &&
          !video.id,
        drop: checkSubs && !video.checkingSubs,
      },
    ]"
    @dragover="over = true"
    @dragleave="over = false"
    :key="`video-${video.youtube_id}`"
  >
    <div
      v-if="
        !generated &&
        checkSubs &&
        !video.checkingSubs &&
        !video.hasSubs &&
        !video.id
      "
      class="no-subs-badge"
    >
      <span v-if="!over">
        <i class="fa fa-times"></i>
        {{ $t('NO SUBS') }}
      </span>
    </div>
    <div
      :class="{
        'youtube-video-card': true,
        'youtube-video-card-grid': view === 'grid',
        'youtube-video-card-list': view === 'list',
      }"
    >
      <router-link
        :to="to"
        class="youtube-thumbnail-wrapper aspect-wrapper d-block"
      >
        <button class="btn btn-unstyled play-button" v-if="showPlayButton">
          <i class="fa fa-play"></i>
        </button>
        <client-only>
          <b-progress
            class="youtube-video-card-progress"
            v-if="progress"
            :value="progress"
            :max="1"
          ></b-progress>
        </client-only>
        <img
          class="youtube-thumbnail aspect"
          ref="thumbnail"
          @load="thumbnailLoaded"
          @error="thumbnailError"
          :src="thumbnail"
        />
        <div class="duration" v-if="video.duration">
          {{ parseDuration(video.duration) }}
        </div>
      </router-link>
      <div class="media-body">
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
        <MediaItemStats :item="video" :showDate="showDate" style="font-size: 0.8em; margin-top: 0.25rem; opacity: 0.8" />
        <client-only>
          <div
            class="youtube-video-card-badges"
            v-if="view === 'grid' && (showBadges || $adminMode)"
          >
            <div
              v-if="video.hasSubs || video.id"
              class="youtube-video-card-badge"
            >
              {{ $t(videoL2 ? videoL2.name : $l2.name) }} CC
              <span v-if="video.l2Locale">({{ video.l2Locale }})</span>
              <span v-if="subsFile">
                - {{ subsFile.name.replace(/[_.]/g, " ") }}
              </span>
            </div>
            <div
              v-if="showLanguage && language"
              class="youtube-video-card-badge"
            >
              {{ $t(language.name) }} ({{ language.code }})
            </div>
            <div
              v-if="
                checkSubs && !video.checkingSubs && !video.hasSubs && !video.id
              "
              class="youtube-video-card-badge"
            >
              <span v-if="!over">No {{ $l2.name }} CC</span>
              <span v-else>Drop SRT to Add Subs</span>
            </div>
            <div
              v-if="checkSaved && video.id"
              class="youtube-video-card-badge bg-success text-white ml-0"
            >
              <i class="fa fa-check mr-2"></i>
              Added
            </div>
            <b-button
              v-if="checkSaved && !video.id && (video.hasSubs || generated)"
              class="btn btn-small"
              @click="getSubsAndSave(video)"
            >
              <i class="fas fa-plus mr-2"></i>
              Add
            </b-button>
            <router-link
              :class="{
                'youtube-video-card-badge ml-0': true,
                'text-white bg-success': showSaved,
                'text-success border-dashed border-success': !showSaved,
              }"
              v-if="video.tv_show"
              :to="{
                name: 'show',
                params: { type: 'tv-show', id: String(video.tv_show.id) },
              }"
            >
              <i class="fa fa-tv mr-2" />
              {{ video.tv_show.title }}
              <i
                class="fas fa-times-circle ml-1"
                v-if="$adminMode"
                @click.stop.prevent="unassignShow('tv_show')"
              />
            </router-link>
            <router-link
              :class="{
                'youtube-video-card-badge ml-0': true,
                'text-white bg-success border-0': showSaved,
                'bg-none text-success border-dashed': !showSaved,
              }"
              v-if="video.talk"
              :to="{
                name: 'show',
                params: { type: 'talk', id: String(video.talk.id) },
              }"
            >
              <i class="fas fa-graduation-cap mr-2"></i>
              {{ video.talk.title }}
              <i
                class="fas fa-times-circle ml-1"
                v-if="$adminMode"
                @click.stop.prevent="unassignShow('talk')"
              />
            </router-link>
            <div
              v-if="video.id && video.topic && topics"
              class="youtube-video-card-badge"
            >
              {{ topics[video.topic] }}
            </div>
            <div
              v-if="video.id && video.level"
              class="youtube-video-card-badge"
            >
              {{ level(video.level, $l2).name }}
            </div>
            <b-button
              v-if="showAdmin && $adminMode && video.id"
              class="youtube-video-card-badge border-0"
              @click="remove()"
            >
              <i class="fa fa-trash"></i>
            </b-button>
          </div>
          <div>
            <AssignShow
              @assignShow="saveShow"
              @newShow="newShow"
              v-if="
                showAdmin &&
                $adminMode &&
                video.id &&
                !video.tv_show &&
                !video.talk
              "
              :defaultYoutubeId="video.youtube_id"
              :defaultTitle="video.title"
              type="tv-shows"
            />
            <AssignShow
              @assignShow="saveShow"
              @newShow="newShow"
              v-if="
                showAdmin &&
                $adminMode &&
                video.id &&
                !video.tv_show &&
                !video.talk
              "
              :defaultYoutubeId="video.youtube_id"
              :defaultTitle="video.title"
              type="talks"
            />
            <div
              v-if="
                $adminMode &&
                video.subs_l1 &&
                video.subs_l1.length > 0 &&
                showSubsEditing
              "
            >
              <div
                v-for="index in Math.min(20, video.subs_l1.length)"
                :key="`l1-subs-${index}`"
              >
                <b>{{ video.l1Locale }}</b>
                <span
                  @click="matchSubsAndUpdate(index - 1)"
                  :class="{
                    btn: true,
                    'btn-small': true,
                    'text-danger':
                      video.subs_l2 &&
                      video.subs_l2.length > 0 &&
                      video.subs_l1[index - 1] &&
                      video.subs_l1[index - 1].starttime !==
                        video.subs_l2[0].starttime,
                  }"
                >
                  {{ video.subs_l1[index - 1].starttime }}
                </span>
                {{ video.subs_l1[index - 1].line }}
              </div>
            </div>
            <div
              v-if="
                $adminMode &&
                video.subs_l2 &&
                video.subs_l2.length > 0 &&
                showSubsEditing
              "
            >
              <b>{{ video.l2Locale || $l2.code }}</b>
              <input
                type="text"
                v-model="firstLineTime"
                :lazy="true"
                :style="`width: ${String(firstLineTime).length + 1}em`"
                class="ml-1 mr-1 btn btn-small"
              />
              {{ video.subs_l2[0].line }}
            </div>
          </div>
          <slot name="footer" :video="video"></slot>
        </client-only>
      </div>
    </div>
  </drop>
</template>

<script>
import DateHelper from "@/lib/date-helper";
import YouTube from "@/lib/youtube";
import Vue from "vue";
import assParser from "ass-parser";
import languageEncoding from "detect-file-encoding-and-language";
import { Drag, Drop } from "vue-drag-drop";
import { parseSync } from "subtitle";
import { mapState } from "vuex";
import {
  parseDuration,
  timeout,
  logError,
  level,
  TOPICS,
} from "@/lib/utils";

export default {
  components: {
    Drag,
    Drop,
  },
  props: {
    l1: undefined,
    l2: undefined,
    delay: 0,
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
    showPlayButton: {
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
  },
  data() {
    return {
      over: false,
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
    ...mapState("history", ["history"]),
    ...mapState("settings", ["l2Settings"]),
    language() {
      let language = this.$languages.l1s.find((l1) => l1.id === this.video.l2);
      return language;
    },
    videoL2() {
      if (this.video.l2) return this.$languages.getById(this.video.l2);
    },
    to() {
      let to = {
        name: "video-view",
        params: {
          type: "youtube",
          youtube_id: this.video.youtube_id,
          directus_id: this.video.id,
          l1: this.l1 ? this.l1.code : this.$l1 ? this.$l1.code : "en",
          l2: this.l2
            ? this.l2.code
            : this.videoL2
            ? this.videoL2.code
            : this.$l2.code,
        },
        query: {},
      };

      if (this.video.lesson) {
        to.params.lesson = "lesson";
      }
      if (this.video.starttime) {
        to.query.t = this.video.starttime;
      } else if (this.showProgress && this.historyItem) {
        to.query.t = this.historyItem.video.starttime;
      }
      return to;
    },
    historyId() {
      return `${this.$l2.code}-video-${this.video.youtube_id}`;
    },
    historyItem() {
      if (this.history)
        return this.history.find((i) => i.id === this.historyId);
    },
    progress() {
      if (this.showProgress && this.historyItem) {
        return this.historyItem.video.progress;
      }
    },
    thumbnail() {
      return (
        this.video.thumbnail ||
        `https://img.youtube.com/vi/${this.video.youtube_id}/hqdefault.jpg`
      );
    },
    topics() {
      return TOPICS;
    },
  },
  async mounted() {
    if (this.checkSubs) {
      await this.checkSubsFunc(this.video);
    }
    if (this.video.id && this.showSubsEditing) {
      await this.addSubsL1(this.video);
    }
    // if (!this.$store.state.history.historyLoaded) {
    //   this.$store.dispatch("history/load");
    // }
  },
  watch: {
    firstLineTime(newTime, oldTime) {
      this.shiftSubs();
      if (oldTime !== undefined) {
        this.updateSubs();
      }
    },
    "video.hasSubs"() {
      let hasSubs;
      if (!this.video.checkingSubs && !this.video.hasSubs) hasSubs = false;
      if (this.video.hasSubs) hasSubs = true;
      this.$emit("hasSubs", hasSubs);
    },
  },
  methods: {
    parseDuration(...args) {
      return parseDuration(...args);
    },
    level(...args) {
      return level(...args);
    },
    thumbnailError(e) {
      console.log("❌ ERROR", this.video.title);
    },
    async thumbnailLoaded(e) {},
    newShow(show) {
      this.saveShow(show, show.type);
      this.$emit("newShow", show);
    },
    async saveShow(show, type) {
      let s = this.video[type];
      if (!s || s.id !== show.id) {
        this.showSaved = false;
        this.$store.commit("shows/MODIFY_VIDEO", {
          video: this.video,
          key: type,
          value: show,
        }); // So we don't get a 'do not mutate outside vuex' erro=

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
    matchSubsAndUpdate(index) {
      this.firstLineTime = this.video.subs_l1[index].starttime;
      this.shiftSubs();
      this.updateSubs();
    },
    shiftSubs() {
      if (
        this.video.subs_l2 &&
        this.video.subs_l2.length > 0 &&
        this.firstLineTime !== this.video.subs_l2[0].starttime
      ) {
        let subsShift =
          Number(this.firstLineTime) - Number(this.video.subs_l2[0].starttime);
        if (subsShift !== 0) {
          for (let line of this.video.subs_l2) {
            line.starttime = Number(line.starttime) + subsShift;
          }
        }
      }
    },
    async remove() {
      if (this.video.id) {
        let deleted = await this.$directus.deleteVideo({
          l2Id: this.video.l2 ? this.video.l2.id || this.video.l2 : this.$l2.id,
          id: this.video.id,
        });
        if (deleted) {
          Vue.delete(this.video, "id");
        }
      }
      return true;
    },
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
    async importSrt(file) {
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
    handleDrop(data, event) {
      event.preventDefault();
      let file = event.dataTransfer.files[0];
      this.importSrt(file);
    },
    async addChannelID(video) {
      let channelId = await this.getChannelID(video);
      let data = await this.$directus.patchVideo({
        l2Id: this.video.l2 ? this.video.l2.id || this.video.l2 : this.$l2.id,
        id: this.video.id,
        payload: { channel_id: channelId },
      });
      if (data) {
        Vue.set(video, "channel_id", data.channel_id);
      }
    },
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
          await YouTube.addTranscriptLocalesToVideo(
            video,
            this.$l1,
            this.$l2
          );
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
          YouTube.addTranscriptLocalesToVideo(
            video,
            this.$l1,
            this.$l2
          );
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
@import "~@/assets/scss/variables.scss";
.youtube-video-card-wrapper.skin-dark {
  .youtube-thumbnail-wrapper {
    box-shadow: 0 -1px 1px #ffffff69;
  }
}
.youtube-video-card-wrapper.skin-light {
  .youtube-thumbnail-wrapper {
    box-shadow: 0 -1px 1px #00000069;
  }
}


.youtube-video-card-wrapper.skin-dark {
  .statistics {
    color: darken($text-color-on-dark, 33%);
  }
}

.youtube-video-card-wrapper.skin-light {
  .statistics {
    color: lighten($text-color-on-light, 33%);
  }
}

.youtube-video-card-wrapper {
  overflow: hidden;
  &.nosubs:not(.over) > * {
    opacity: 0.2;
  }
  &.youtube-video-card-wrapper,
  &.youtube-video-card-wrapper {
    background: none;
    overflow: visible;
    .media-body {
      padding: 1rem 0 0 0;
    }
    .youtube-thumbnail-wrapper {
      border-radius: 0.25rem;
      overflow: hidden;
      position: relative;
      .duration {
        position: absolute;
        bottom: 0.2rem;
        right: 0.2rem;
        background-color: rgba(0, 0, 0, 0.8);
        color: #fff;
        font-size: 0.8rem;
        font-weight: bold;
        padding: 0.08rem 0.3rem;
        border-radius: 0.15rem;
      }
    }
    .youtube-video-card-progress {
      top: calc(100% - 0.5rem);
      width: calc(100% - 1rem);
      left: 0.5rem;
      position: absolute;
      z-index: 9;
      background-color: hsla(0deg 0% 100% / 25%);
      -webkit-backdrop-filter: blur(5px);
      backdrop-filter: blur(5px);
    }
  }
  &.youtube-video-card-wrapper.skin-light {
    .youtube-thumbnail-wrapper {
      box-shadow: 0 5px 25px #0000002f;
    }
  }
  &.drop.over {
    border: 2px dashed #ccc;
  }
  .youtube-video-card,
  .youtube-video-card:hover {
    position: relative;
    text-decoration: none;
    .youtube-title {
      .youtube-title-text {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        font-weight: bold;
        overflow: hidden;
      }
    }
    .youtube-video-card-progress {
      height: 0.3rem;
      border-radius: 0.15rem;
      :deep(.progress-bar) {
        background-color: #fd4f1c;
      }
    }
  }

  .youtube-video-card-list {
    .youtube-thumbnail-wrapper {
      display: none !important;
    }
  }
}

.youtube-video-card-badges {
  margin-top: 0.5rem;
  .youtube-video-card-badge {
    background-color: #88888833;
    display: inline-block;
    padding: 0.3rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.8em;
    line-height: 0.9rem;
    color: #666;
  }
  padding-bottom: 0.25rem;
}

.no-subs-badge {
  opacity: 1 !important;
  background-color: rgb(140, 0, 0);
  color: white;
  position: absolute;
  z-index: 2;
  font-size: 0.9em;
  text-align: center;
  border-radius: 0 0.3rem 0.3rem 0;
  padding: 0 0.7rem;
  top: 1rem;
  left: 0.5rem;
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
