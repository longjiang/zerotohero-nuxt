<template>
  <div
    :class="{
      'video-controls': true,
      'video-controls-dark': skin === 'dark',
      'video-controls-light': skin === 'light',
    }"
    v-if="video"
  >
    <div class="video-controls-progress d-flex">
      <div class="video-controls-time mr-2 ml-2">
        {{ currentTime ? toHHMMSS(currentTime) : "--:--" }}
      </div>
      <input
        type="range"
        class="d-block w-100 flex-1"
        step="0.1"
        @change="onSeek"
        @focus="pause"
        @mousedown="pause"
        @mouseup="play"
        @touchstart="pause"
        @touchend="play"
        :value="currentPercentage"
      />
      <div class="video-controls-time ml-2 mr-2">
        {{ duration ? toHHMMSS(duration) : "--:--" }}
      </div>
    </div>
    <div class="video-controls-buttons">
      <button
        v-if="showInfoButton"
        :class="{
          'btn-video-controls btn-video-controls-info text-center': true,
        }"
        @click="showInfoModal"
        :title="$t('More Info')"
      >
        <i class="fa-regular fa-rectangle-history" v-if="show"></i>
        <i class="fa-solid fa-circle-info" v-else></i>
      </button>
      <button
        v-if="showOpenButton"
        :class="{
          'btn-video-controls btn-video-controls-open text-center': true,
        }"
        @click="$emit('open')"
        :title="$t('Open Another Video...')"
      >
        <i class="fa-solid fa-folder-open"></i>
      </button>
      <button
        :class="{
          'btn-video-controls btn-video-controls-rewind text-center': true,
        }"
        @click="rewind"
        :title="$t('Rewind to Beginning')"
      >
        <i class="fas fa-undo"></i>
      </button>
      <button
        v-if="episodes"
        :disabled="!previousEpisode"
        class="btn-video-controls btn-video-controls-previous text-center"
        @click="$emit('previous')"
        :title="$t('Previous Video')"
      >
        <i class="fas fa-step-backward"></i>
      </button>
      <button
        class="btn-video-controls btn-video-controls-previous-line text-center"
        @click="$emit('goToPreviousLine')"
        :title="$t('Previous Line')"
      >
        <i v-if="layout === 'horizontal'" class="fas fa-arrow-up"></i>
        <i v-else class="fas fa-chevron-left"></i>
      </button>
      <button
        :class="{
          'btn-video-controls btn-video-controls-play play-pause text-center': true,
        }"
        @click="paused ? play() : pause()"
        :title="paused ? $t('Play') : $t('Pause')"
      >
        <i v-if="paused" class="fas fa-play"></i>
        <i v-else class="fas fa-pause"></i>
      </button>
      <button
        class="btn-video-controls btn-video-controls-next-line text-center"
        @click="$emit('goToNextLine')"
        :title="$t('Next Line')"
      >
        <i v-if="layout === 'horizontal'" class="fas fa-arrow-down"></i>
        <i v-else class="fas fa-chevron-right"></i>
      </button>
      <button
        v-if="episodes"
        :disabled="!nextEpisode"
        class="btn-video-controls btn-video-controls-next text-center"
        @click="$emit('next')"
        :title="$t('Next Video')"
      >
        <i class="fas fa-step-forward"></i>
      </button>
      <button
        v-if="showFullscreenToggle"
        :class="{
          'btn-video-controls btn-video-controls-fullscreen text-center': true,
          'btn-video-controls-active': layout === 'horizontal',
        }"
        @click="toggleFullscreenMode"
        :title="layout === $t('Show Transcript & Quizzes')"
      >
        <i class="fa-solid fa-align-left"></i>
      </button>
      <button
        :class="{
          'btn-video-controls btn-video-controls-fullscreen text-center': true,
        }"
        @click="showSettingsModal"
        :title="$t('More Options')"
      >
        <i class="fa-solid fa-cog"></i>
      </button>

      <div
        v-if="video && showLineList"
        :class="{ 'video-view-line-list': true, 'd-none': !showList }"
      >
        <b-input-group class="video-view-line-list-filter-wrapper">
          <b-form-input
            v-model.lazy="filterList"
            placeholder="Filter"
          ></b-form-input>
          <b-input-group-append>
            <b-input-group-text
              v-if="!filterList"
              class="btn btn-video-controls-active"
            >
              <i class="fas fa-filter"></i>
            </b-input-group-text>
            <b-input-group-text
              v-if="filterList"
              class="btn btn-video-controls-active"
              @click="filterList = ''"
            >
              <i class="fas fa-times"></i>
            </b-input-group-text>
          </b-input-group-append>
        </b-input-group>
        <div
          v-for="(line, index) in sortedLines"
          :class="{
            'video-view-line-list-item': true,
            active: currentLine === line,
          }"
          :key="`video-line-list-${index}`"
          @click="
            goToLine(line);
            showList = !showList;
          "
        >
          {{ line.line }}
        </div>
      </div>
    </div>
    <b-modal
      ref="info-modal"
      centered
      hide-footer
      modal-class="safe-padding-top mt-4"
      size="md"
      :title="show ? show.title : $t('Video Information')"
    >
      <div class="video-info-inner">
        <h6>{{ video.title }}</h6>
        <VideoAdmin
          :video="video"
          ref="videoAdmin1"
          style="font-size: 0.8em; line-height: 2em"
        />
        <div class="mt-3">
          <h6 v-if="show">
            <hr class="mb-3" />
            {{ $t("More Episodes") }}
            <router-link
              :to="{
                name: 'show',
                params: {
                  type: showType === 'tv_show' ? 'tv-show' : 'talk',
                  id: show.id,
                },
              }"
              class="show-all"
            >
              {{ $t("All") }}
              {{
                largeEpisodeCount > episodes.length
                  ? largeEpisodeCount
                  : episodes.length
              }}
              <i class="fas fa-chevron-right"></i>
            </router-link>
          </h6>
          <h6 v-else-if="related.length > 0">
            <hr />
            {{ $t("Related") }}
          </h6>
        </div>
        <YouTubeVideoList
          :videos="show ? episodes : related.slice(0, 24)"
          :showDate="true"
          skin="light"
          class="p-2"
        />
        <EpisodeNav
          skin="light"
          :video="video"
          :episodes="episodes"
          :showType="showType"
          :show="show"
          :largeEpisodeCount="largeEpisodeCount"
          class="mt-3"
        />
      </div>
    </b-modal>
    <b-modal
      ref="settings-modal"
      centered
      hide-footer
      :title="$t('Video Options')"
      body-class="settings-modal-wrapper"
      modal-class="safe-padding-top mt-4"
      size="sm"
    >
      <div>
        <button
          :class="{
            'btn btn-unstyled text-center d-block p-0': true,
            'text-success': collapsed,
          }"
          @click="toggleCollapsed"
          :title="$t('Collapse Video')"
        >
          <span class="settings-icon">
            <i class="fas fa-caret-square-up" v-if="!collapsed"></i>
            <i class="fas fa-caret-square-down" v-if="collapsed"></i>
          </span>
          <span>{{ $t("Collapse Video") }}</span>
        </button>
      </div>
      <div>
        <button
          :class="{
            'btn btn-unstyled text-center d-block p-0': true,
            'text-success': speed !== 1,
          }"
          @click="toggleSpeed"
          title="Change Playback Speed"
        >
          <span class="settings-icon">
            <i class="fas fa-tachometer-alt"></i>
          </span>
          <span>{{ $t("{speed}x Speed", { speed }) }}</span>
        </button>
      </div>
      <div>
        <button
          :class="{
            'btn btn-unstyled text-center d-block p-0': true,
            'text-success': autoPause,
          }"
          @click="toggleAutoPause"
          title="Toggle Auto-Pause"
        >
          <span class="settings-icon"><i class="fas fa-hand"></i></span>
          <span>{{ $t("Auto-Pause") }}</span>
        </button>
      </div>
      <div>
        <button
          :class="{
            'btn btn-unstyled text-center d-block p-0': true,
            'text-success': useSmoothScroll,
          }"
          @click="toggleSmoothScrolling"
          title="Toggle Smooth Scrolling"
        >
          <span class="settings-icon"><i class="fas fa-up-down"></i></span>
          <span>{{ $t("Smooth Scrolling") }}</span>
        </button>
      </div>
      <hr />
      <QuickSettings />
    </b-modal>
  </div>
</template>

<script>
import { toHHMMSS } from "@/lib/date-helper";
import { shuffle, safeShuffle, uniqueByValue } from "@/lib/utils/array";

export default {
  props: {
    video: {
      default: undefined,
    },
    duration: {
      type: Number,
    },
    paused: {
      default: true,
    },
    layout: {
      default: "horizontal",
    },
    skin: {
      default: "dark",
    },
    show: {
      type: Object,
    },
    showFullscreenToggle: {
      default: true,
    },
    showLineList: {
      default: true,
    },
    showCollapse: {
      default: true,
    },
    showInfoButton: {
      // Whether to show an "i" button that toggles the video information display modal
      type: Boolean,
      default: true,
    },
    showOpenButton: {
      type: Boolean,
      default: true,
    },
    showType: {
      type: String,
    },
    episodes: {
      type: Array,
    },
    largeEpisodeCount: {
      type: Number, // Mannually set the number of episode displayed in the episode navigator
    },
    initialTime: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      showList: false,
      repeatMode: false,
      speed: 1,
      autoPause: false,
      useSmoothScroll: false,
      filterList: "",
      speaking: false,
      audioMode: false,
      sortedLines: undefined,
      collapsed: false,
      currentLine: undefined,
      currentTime: this.initialTime,
    };
  },
  computed: {
    episodeIndex() {
      if (this.episodes) {
        return this.episodes.findIndex(
          (e) => e.youtube_id === this.video.youtube_id
        );
      }
    },
    previousEpisode() {
      if (this.episodes && this.episodeIndex > -1) {
        return this.episodes[this.episodeIndex - 1];
      }
    },
    nextEpisode() {
      if (this.episodes && this.episodeIndex > -1) {
        return this.episodes[this.episodeIndex + 1];
      }
    },
    currentPercentage() {
      return this.duration ? (this.currentTime / this.duration) * 100 : 0;
    },
    related() {
      let related = [];
      if (this.episodes && this.episodes.length > 0 && this.episodeIndex >= 0) {
        let watchedYouTubeIds = this.$store.state.history.history.map(
          (h) => h.video?.youtube_id
        );
        let popularEpisodes = this.episodes
          .slice()
          .filter((e) => !watchedYouTubeIds.includes(e.youtube_id))
          .sort((a, b) => b.views - a.views);
        related = [
          ...shuffle([
            ...this.episodes.slice(
              this.episodeIndex + 2,
              this.episodeIndex + 16
            ),
            ...shuffle(popularEpisodes.slice(0, 16)),
          ]),
        ];
        let nextEpisode = this.episodes[this.episodeIndex + 1];
        if (nextEpisode) related = [nextEpisode, ...related];
      }
      return uniqueByValue(related, "youtube_id");
    },
  },
  mounted() {
    if (this.showLineList) {
      this.sortedLines = this.getSortedLines();
    }
    if (typeof this.$store.state.settings !== "undefined") {
      this.autoPause = this.$store.state.settings.autoPause;
      this.speed = this.$store.state.settings.speed || 1;
      this.useSmoothScroll = this.$store.state.settings.useSmoothScroll;
    }
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type === "settings/LOAD_SETTINGS") {
        this.autoPause = this.$store.state.settings.autoPause;
        this.speed = this.$store.state.settings.speed || 1;
        this.useSmoothScroll = this.$store.state.settings.useSmoothScroll;
      }
    });
  },
  watch: {
    initialTime() {
      this.currentTime = this.initialTime; // so that the progress bar updates at the start
    },
    $route() {
      this.hideInfoModal();
    },
  },
  methods: {
    toHHMMSS(duration) {
      return toHHMMSS(duration);
    },
    onSeek(event) {
      let percentage = event.target.value;
      let time = percentage * 0.01 * this.duration;
      this.$emit("seek", time);
    },
    pause() {
      this.$emit("pause");
    },
    play() {
      this.$emit("play");
    },
    showInfoModal() {
      this.$refs["info-modal"].show();
    },
    hideInfoModal() {
      this.$refs["info-modal"].hide();
    },
    showSettingsModal() {
      this.$refs["settings-modal"].show();
    },
    toggleSpeed() {
      let speeds = [1, 0.75, 0.5];
      let index = speeds.findIndex((s) => s === this.speed);
      if (index > -1) {
        index = index + 1;
        if (index === speeds.length) index = 0;
      }
      this.speed = speeds[index];
      this.$store.dispatch("settings/setGeneralSettings", {
        speed: this.speed,
      });
      this.$emit("updateSpeed", this.speed);
    },
    toggleRepeatMode() {
      this.repeatMode = !this.repeatMode;
      this.$emit("updateRepeatMode", this.repeatMode);
    },
    toggleAutoPause() {
      this.autoPause = !this.autoPause;
      this.$store.dispatch("settings/setGeneralSettings", {
        autoPause: this.autoPause,
      });
      this.$emit("updateAutoPause", this.autoPause);
    },
    toggleSmoothScrolling() {
      this.useSmoothScroll = !this.useSmoothScroll;
      this.$store.dispatch("settings/setGeneralSettings", {
        useSmoothScroll: this.useSmoothScroll,
      });
      this.$emit("updateSmoothScroll", this.useSmoothScroll);
    },
    toggleSmoothScroll() {
      this.useSmoothScroll = !this.useSmoothScroll;
      this.$store.dispatch("settings/setGeneralSettings", {
        useSmoothScroll: this.useSmoothScroll,
      });
      this.$emit("updateUseSmoothScroll", this.useSmoothScroll);
    },
    toggleAudioMode() {
      this.audioMode = !this.audioMode;
      this.$emit("updateAudioMode", this.audioMode);
    },
    toggleCollapsed() {
      this.collapsed = !this.collapsed;
      this.$emit("updateCollapsed", this.collapsed);
    },
    toggleFullscreenMode() {
      this.$emit("toggleFullscreenMode");
    },
    goToLine(line) {
      this.$emit("goToLine", line);
    },
    rewind() {
      this.$emit("rewind");
    },
    getSortedLines() {
      if (this.video && this.video.subs_l2) {
        console.log(
          `YouTube View: Sorting ${this.video.subs_l2.length} lines...`
        );
        let lines = this.video.subs_l2.map((line) => line);
        let sortedLines = lines.sort((a, b) =>
          a.line.localeCompare(b.line, this.$l2.locales[0])
        );
        let foldedLines = [];
        if (sortedLines.length > 0) {
          let lastSeen = sortedLines[0];
          lastSeen.count = 0;
          for (let line of sortedLines) {
            if (line.line === lastSeen.line) {
              lastSeen.count++;
            } else {
              foldedLines.push(lastSeen);
              lastSeen = line;
              lastSeen.count = 1;
            }
          }
        }
        foldedLines = foldedLines
          .sort((a, b) => a.line.length - b.line.length)
          .sort((a, b) => b.count - a.count);
        console.log(`YouTube View: Lines sorted.`);
        return foldedLines;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/variables.scss";
:deep(.youtube-videos) > * {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.video-with-transcript-horizontal-portrait .video-controls {
  background: black;
}

.video-controls-light .btn-video-controls {
  color: #242424;
}

.video-controls-dark .btn-video-controls {
  color: #ffffff;
}

.video-controls-buttons {
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  max-width: 40rem;
  margin: 0 auto;

  .btn-video-controls {
    border: none;
    padding: 0 0.5rem;
    background: none;
    margin: 0 0.2rem;

    &:disabled {
      color: #cccccc44;
    }

    &.btn-video-controls-active {
      color: $primary-color;
    }

    &.play-pause {
      font-size: 2.5em;
    }
  }
}

.video-view-line-list {
  overflow: auto;
  border-radius: 0.3rem;
  background: white;
  color: #666;
  text-align: left;
  z-index: 10;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.4);
  position: fixed;
  top: 0;
  left: calc(50% - 9rem);
  max-width: calc(100vw - 50% + 9rem - 1rem);
  max-height: calc(100vh - 100vw * 9 / 16 - 2rem);
}

@media screen and (orientation: landscape) {
  .video-view-line-list {
    max-height: calc(100vh - 50vw * 9 / 16 - 2rem);
  }
}

.video-view-line-list .video-view-line-list-item {
  padding: 0.2rem 0.7rem;
}

.video-view-line-list-item {
  cursor: pointer;
}

.video-view-line-list-item.active {
  background-color: #eee;
}

.video-view-line-list-filter-wrapper {
  padding: 0.25rem;
  background: white;
  width: calc(100% - 0.5rem);
  position: sticky;
  top: 0;
}

.video-controls-time {
  white-space: nowrap;
  font-size: 0.8em;
}

.settings-icon {
  width: 2rem;
  text-align: center;
  display: inline-block;
}

.show-all {
  font-size: 1rem;
  margin-left: 0.5rem;
  display: inline-block;
  color: $primary-color;
}

hr {
  margin: 0.5rem 0;
}
</style>