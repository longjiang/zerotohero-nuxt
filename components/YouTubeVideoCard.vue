<template>
  <drop
    @drop="handleDrop"
    :class="[
      `youtube-video-card-wrapper-${skin} play-button-wrapper`,
      {
        over: over,
        'youtube-video-card-wrapper': true,
        media: true,
        nosubs: checkSubs && !video.checkingSubs && !video.hasSubs && !video.id,
        drop: checkSubs && !video.checkingSubs,
      },
    ]"
    @dragover="over = true"
    @dragleave="over = false"
    :key="`video-${video.youtube_id}`"
  >
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
            v-if="progress && skin !== 'card'"
            :value="progress"
            :max="1"
          ></b-progress>
        </client-only>
        <img
          :src="thumbnail"
          class="youtube-thumbnail aspect"
          ref="thumbnail"
          @load="thumbnailLoaded"
          @error="thumbnailError"
        />
      </router-link>
      <div class="media-body">
        <div
          class="small mb-2"
          style="color: #aaa"
          v-if="video.date && view !== 'list' && (showDate || $adminMode)"
        >
          {{ formatDate(video.date) }}
        </div>
        <div class="youtube-title">
          <span
            contenteditable="true"
            :class="{ 'd-none': !$adminMode || view === 'list' }"
            @blur="saveTitle"
          >
            {{ video.title }}
          </span>
          <router-link
            :class="{
              'link-unstyled': true,
              'd-none': $adminMode || view === 'list',
            }"
            :to="`/${$l1.code}/${$l2.code}/youtube/view/${video.youtube_id}/${
              video.lesson ? 'lesson' : ''
            }`"
          >
            {{ video.title }}
          </router-link>
        </div>
        <client-only>
          <div
            class="youtube-video-card-badges"
            v-if="view !== 'list' && (showBadges || $adminMode)"
          >
            <div
              v-if="video.hasSubs || video.id"
              class="youtube-video-card-badge"
            >
              {{ $l2.name }} CC
              <span v-if="video.l2Locale">({{ video.l2Locale }})</span>
              <span v-if="subsFile">
                - {{ subsFile.name.replace(/[_.]/g, " ") }}
              </span>
            </div>
            <span
              class="youtube-video-card-badge"
              v-if="$adminMode && video.youtube_id.includes('0x')"
            >
              ID含`0x`，或许无法添加
            </span>
            <div
              v-if="
                !video.checkingSubs &&
                !video.hasSubs &&
                !video.id
              "
              class="btn btn-small mt-2 ml-0"
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
              v-if="checkSaved && !video.id && video.hasSubs"
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
                @click="unassignShow('talk')"
              />
            </router-link>
            <div
              v-if="video.id && video.topic"
              class="youtube-video-card-badge"
            >
              {{ Helper.topics[video.topic] }}
            </div>
            <div
              v-if="video.id && video.level"
              class="youtube-video-card-badge"
            >
              {{ Helper.level(video.level, $l2) }}
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
        </client-only>
        <client-only>
          <b-progress
            class="youtube-video-card-progress"
            v-if="progress && skin === 'card'"
            :value="progress"
            :max="1"
          ></b-progress>
        </client-only>
      </div>
    </div>
  </drop>
</template>

<script>
import Helper from "@/lib/helper";
import DateHelper from "@/lib/date-helper";
import Config from "@/lib/config";
import YouTube from "@/lib/youtube";
import Vue from "vue";
import assParser from "ass-parser";
import languageEncoding from "detect-file-encoding-and-language";
import { Drag, Drop } from "vue-drag-drop";
import { parseSync } from "subtitle";
import { mapState } from "vuex";

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
    video: {
      type: Object,
    },
    showAdmin: {
      default: true,
    },
    checkSubs: {
      default: false,
    },
    showSubsEditing: {
      default: false,
    },
    view: {
      type: String,
      default: "grid",
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
  },
  data() {
    return {
      Helper,
      Config,
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
    to() {
      let to = {
        name: "youtube-view",
        params: { youtube_id: this.video.youtube_id },
        query: {},
      };
      if (this.video.lesson) {
        to.params.lesson = "lesson";
      }
      if (typeof this.l1 !== "undefined") {
        to.params.l1 = this.l1.code;
      }
      if (typeof this.l2 !== "undefined") {
        to.params.l2 = this.l2.code;
      }
      if (this.video.starttime) {
        to.query.t = this.video.starttime;
      } else if (this.showProgress && this.historyItem) {
        to.query.t = this.historyItem.video.starttime;
      }
      return to;
    },
    $l1() {
      if (typeof this.l1 !== "undefined") {
        return this.l1;
      } else if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
      else return this.$languages.getSmart("en");
    },
    $l2() {
      if (typeof this.l2 !== "undefined") {
        return this.l2;
      } else if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
    $adminMode() {
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
    },
    ...mapState("history", ["history"]),
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
        `//img.youtube.com/vi/${this.video.youtube_id}/hqdefault.jpg`
      );
    },
  },
  async mounted() {
    if (this.checkSubs) {
      await Helper.timeout(this.delay);
      await this.checkSubsFunc(this.video);
    }
    if (this.video.id && this.showSubsEditing) {
      await this.addSubsL1(this.video);
    }
    if (!this.$store.state.history.historyLoaded) {
      this.$store.commit("history/LOAD_HISTORY");
    }
    if (
      typeof window !== "undefined" &&
      window.location.href.startsWith("http://localhost")
    ) {
      try {
        await axios.get(this.thumbnail);
      } catch (e) {
        Vue.set(this.video, "unavailable", true);
        this.$emit("unavailable", this.video.youtube_id);
      }
    }
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
    thumbnailError(e) {
      console.log("❌ ERROR", this.video.title);
    },
    async thumbnailLoaded(e) {},
    formatDate(date) {
      return DateHelper.formatDate(date);
    },
    newShow(show) {
      this.saveShow(show, show.type);
      this.$emit("newShow", show);
    },
    async saveShow(show, type) {
      let s = this.video[type];
      if (!s || s.id !== show.id) {
        this.showSaved = false;
        Vue.set(this.video, type, show);
        if (this.video.id) {
          let data = {};
          data[type] = show.id;
          let response = await axios.patch(
            `${Config.wiki}items/youtube_videos/${this.video.id}?fields=${type}.*`, // type is 'tv_show' or 'talk'
            data
          );
          response = response.data;
          if (response && response.data) {
            this.showSaved = true;
          }
        }
      }
      return true;
    },
    async unassignShow(type) {
      let data = {};
      data[type] = null;
      let response = await axios.patch(
        `${Config.wiki}items/youtube_videos/${this.video.id}`,
        data
      );
      if (response && response.data) {
        Vue.delete(this.video, type);
      }
    },
    async saveTitle(e) {
      let newTitle = e.target.innerText;
      if (this.video.title !== newTitle) {
        try {
          let response = await axios.patch(
            `${Config.wiki}items/youtube_videos/${this.video.id}`,
            { title: newTitle },
            { contentType: "application/json" }
          );
          response = response.data;
          if (response && response.data) {
            this.titleUpdated = true;
          }
        } catch (err) {
          // Direcuts bug
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
        try {
          let response = await axios.delete(
            `${Config.wiki}items/youtube_videos/${this.video.id}`
          );
          if (response) {
            Vue.delete(this.video, "id");
          }
        } catch (err) {
          // Directus bug
        }
      }
      return true;
    },
    async updateSubs() {
      let response = await axios.patch(
        `${Config.wiki}items/youtube_videos/${this.video.id}`,
        { subs_l2: YouTube.unparseSubs(this.video.subs_l2) }
      );
      response = response.data;
      if (response && response.data) {
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
      let response = await axios.patch(
        `${Config.wiki}items/youtube_videos/${video.id}`,
        { channel_id: channelId }
      );
      if (response && response.data) {
        Vue.set(video, "channel_id", response.data.channel_id);
      }
    },
    async getSubsAndSave(video = this.video) {
      if (this.checkSaved && !video.id && video.hasSubs) {
        if (!video.subs_l2 && video.l2Locale) {
          video.subs_l2 = await YouTube.getTranscript(
            video.youtube_id,
            video.l2Locale,
            video.l2Name
          );
        }
        if (video.subs_l2[0]) {
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
    async save(video, limit = false) {
      try {
        let lines = video.subs_l2;
        if (limit) lines = lines.slice(0, limit);
        let csv = YouTube.unparseSubs(lines, this.$l2.code);
        let data = {
          youtube_id: video.youtube_id,
          title: video.title,
          l2: this.$l2.id,
          subs_l2: csv,
          channel_id: video.channel_id,
          date: DateHelper.unparseDate(video.date),
        };
        if (this.video.tv_show) data.tv_show = this.video.tv_show.id;
        if (this.video.talk) data.talk = this.video.talk.id;
        let response = await axios.post(
          `${Config.wiki}items/youtube_videos?fields=id,tv_show.*,talk.*`,
          data
        );
        response = response.data;
        if (response && response.data) {
          Vue.set(video, "id", response.data.id);
          this.showSaved = true;
          return true;
        }
      } catch (err) {
        if (!limit) limit = video.subs_l2.length;
        if (limit > 0) {
          return this.save(video, limit - 100);
        }
      }
    },
    async checkSubsFunc(video) {
      Vue.set(video, "checkingSubs", true);
      if (video.subs_l2 && video.subs_l2.length > 0) {
        Vue.set(video, "hasSubs", true);
        Vue.set(video, "checkingSubs", false);
        this.$emit("hasSubs", true);
      } else {
        video = await YouTube.getYouTubeSubsList(video, this.$l1, this.$l2);
        this.$emit("hasSubs", video.hasSubs);
        if (this.checkSaved && this.showSubsEditing) {
          video = this.addSubsL1(video);
        }
        Vue.set(video, "checkingSubs", false);
      }
      return video;
    },
    async addSubsL1(video) {
      if (video) {
        if (!video.l1Locale) {
          video = await YouTube.getYouTubeSubsList(video, this.$l1, this.$l2);
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
.youtube-video-card-wrapper {
  overflow: hidden;
  &.nosubs:not(.over) {
    opacity: 0.2;
  }
  &.youtube-video-card-wrapper-dark,
  &.youtube-video-card-wrapper-light {
    background: none;
    overflow: visible;
    .media-body {
      padding: 1rem 0 0 0;
    }
    .youtube-thumbnail-wrapper {
      border-radius: 0.25rem;
      overflow: hidden;
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
  &.youtube-video-card-wrapper-light {
    .youtube-thumbnail-wrapper {
      box-shadow: 0 5px 25px #0000002f;
    }
  }
  &.youtube-video-card-wrapper-dark {
    &:hover {
      transform: scale(110%);
      transition: 200ms ease-in-out;
    }
    .youtube-thumbnail-wrapper {
      box-shadow: 0 5px 25px #fd89662f;
    }
    .media-body {
      color: hsla(0deg 0% 100% / 75%);
    }
  }
  &.youtube-video-card-wrapper-card {
    border-radius: 0.25rem;
    box-shadow: 0 5px 25px rgba(0, 0, 0, 0.2);
    height: 100%;
    .youtube-video-card {
      display: flex;
      flex-direction: column;
      position: relative;
      height: 100%;
      .media-body {
        background: white;
        padding-bottom: 2rem;
        flex: 1;
        .youtube-video-card-progress {
          bottom: 0.5rem;
          left: 0.5rem;
          width: calc(100% - 1rem);
          position: absolute;
          background-color: hsla(0deg 0% 50% / 30%);
        }
      }
    }
  }
  &.drop.over {
    border: 2px dashed #ccc;
  }
  .youtube-video-card,
  .youtube-video-card:hover {
    position: relative;
    color: #666;
    text-decoration: none;
    .youtube-title {
      font-weight: bold;
    }
    .youtube-video-card-progress {
      height: 0.3rem;
      border-radius: 0.15rem;
      ::v-deep .progress-bar {
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
.main-dark {
  .youtube-video-card-badge {
    color: #ffffff88;
    &.bg-success {
      background-color: rgba(0, 128, 0, 0.562) !important;
    }
    &.text-white {
      color: #ffffffaa !important;
    }
  }
}
</style>
