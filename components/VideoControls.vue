<template>
  <div
    :class="{
      'video-controls': true,
      [`skin-${$skin}`]: true,
    }"
    v-if="video"
  >
    <div class="video-controls-progress d-flex">
      <div class="video-controls-time mr-2 ml-2">
        {{ currentTime ? toHHMMSS(currentTime) : "--:--" }}
      </div>
      <client-only>
        <vue-slider
          v-model="progressPercentage"
          class="video-controls-progress d-block w-100 flex-1"
          step="0.1"
          tooltip="none"
          @change="onSeek"
          @focus="pause"
          @mousedown="pause"
          @mouseup="play"
          @touchstart.passive="pause"
          @touchend="play"
        ></vue-slider>
      </client-only>
      <div class="video-controls-time ml-2 mr-2">
        {{ duration ? toHHMMSS(duration) : "--:--" }}
      </div>
    </div>
    <div class="video-controls-buttons">
      <SimpleButton
        v-if="showInfoButton"
        :iconClass="`fa-regular ${
          show ? 'fa-rectangle-history' : 'fa-solid  fa-circle-info'
        }`"
        :title="
          $t(show ? 'Episodes' : 'More Info') + ' (' + (show ? 'E' : 'I') + ')'
        "
        @click="showInfoModal"
        v-show="size !== 'mini'"
      />
      <SimpleButton
        v-if="showOpenButton"
        iconClass="fa-solid fa-rotate-left"
        :title="$t('Rewind') + ' (R)'"
        @click="rewind()"
        v-show="size !== 'mini'"
      />
      <SimpleButton
        v-if="!showOpenButton"
        :iconClass="`fa-${liked ? 'solid' : 'regular'} fa-heart`"
        :title="$t('Like') + ' (L)'"
        :class="{ 'text-danger': liked }"
        :pending="likePending"
        @click="toggleLike()"
        v-show="size !== 'mini'"
      />
      <SimpleButton
        v-if="episodes"
        iconClass="fas fa-step-backward"
        :title="$t('Previous Video') + ' (⇧ + ←)'"
        @click="previous()"
        :disabled="!previousEpisode"
      />
      <SimpleButton
        v-if="showOpenButton"
        iconClass="fa-solid fa-angles-left"
        :title="$t('Shift Subs Back 1s')"
        skin="light"
        @click="shiftSubs(-1)"
      />
      <SimpleButton
        :iconClass="`fas fa-arrow-${
          (forceMode || mode) === 'transcript' ? 'up' : 'left'
        }`"
        :title="$t('Previous Line') + ' (←)'"
        @click="goToPreviousLine()"
        v-show="size !== 'mini'"
      />
      <SimpleButton
        v-if="showPlayPauseButton"
        class="btn-video-controls-play play-pause"
        :iconClass="`fas fa-${paused ? 'play' : 'pause'} text-success`"
        :title="
          (paused ? $t('Play') : $t('Pause')) + ' (' + $t('SPACE BAR') + ')'
        "
        @click="togglePaused()"
      />
      <SimpleButton
        :iconClass="`fas fa-arrow-${
          (forceMode || mode) === 'transcript' ? 'down' : 'right'
        }`"
        :title="$t('Next Line') + ' (→)'"
        @click="goToNextLine()"
        v-show="size !== 'mini'"
      />
      <SimpleButton
        v-if="showOpenButton"
        iconClass="fa-solid fa-angles-right"
        :title="$t('Shift Subs Forward 1s')"
        skin="light"
        @click="shiftSubs(+1)"
      />
      <SimpleButton
        v-if="episodes"
        :disabled="!nextEpisode"
        iconClass="fas fa-step-forward"
        :title="$t('Next Video') + ' (⇧ + →)'"
        @click="next()"
      />
      <SimpleButton
        v-if="showFullscreenModeToggle"
        :iconClass="`fa-solid ${
          fullscreen
            ? 'fa-down-left-and-up-right-to-center'
            : 'fa-up-right-and-down-left-from-center'
        }`"
        :title="$t('Fullscreen') + ' (F)'"
        @click="toggleFullscreen()"
        v-show="size !== 'mini'"
      />
      <SimpleButton
        v-if="showFullscreenModeToggle"
        iconClass="fa-solid fa-cog"
        :title="$t('More Options')"
        @click="showSettingsModal"
        v-show="size !== 'mini'"
      />

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
      :title="
        video.title
      "
    >
      <div class="video-info-inner">
        <div v-if="showOpenButton">
          <SimpleButton
            iconClass="fa-solid fa-folder-open"
            :title="$t('Open Another Video...') + ' (O)'"
            :text="$t('Open Another Video...')"
            @click="open()"
            skin="light"
          />
          <div>
            <SimpleButton
              iconClass="fa-solid fa-angles-left"
              :text="$t('Shift Subs Back 1s')"
              skin="light"
              @click="shiftSubs(-1)"
            />
            <SimpleButton
              iconClass="fa-solid fa-angles-right"
              :text="$t('Shift Subs Forward 1s')"
              skin="light"
              @click="shiftSubs(+1)"
            />
          </div>
        </div>
        <ChannelCard :channel_id="video.channel_id" class="mb-2"/>
        <VideoDetails :video="video" ref="videoDetails" :showTitle="false" />
        <VideoAdmin
          :video="video"
          ref="videoAdmin1"
          style="font-size: 0.8em; line-height: 2em"
        />
        <EpisodeNav
          v-if="episodes"
          skin="light"
          v-bind="{
            video,
            episodes,
            episodeSort,
            showType,
            show,
            largeEpisodeCount,
          }"
          class="mt-3"
        />
        <div class="mt-3">
          <h6 v-if="show">
            <hr class="mb-3" />
            {{
              $t(
                playlist
                  ? $t("{num} Videos", { num: playlist.videos.length })
                  : "More Episodes"
              )
            }}
            <router-link
              v-if="playlist"
              :to="{
                name: 'playlist',
                params: {
                  id: playlist.id,
                },
              }"
              class="show-all"
            >
              {{ $t("Open Playlist") }}
              <i class="fas fa-chevron-right"></i>
            </router-link>
            <router-link
              v-else
              :to="{
                name: 'l1-l2-show',
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
          v-if="(episodes && episodes.length) || (related && related.length)"
          :videos="show ? episodes : related"
          :showDate="true"
          :initialSort="episodeSort"
          :limit="12"
          skin="light"
          class="p-2"
        />
        <client-only>
          <NavPage
            :l1="$l1"
            :l2="$l2"
            class="youtube-browse-nav mb-5 row"
            :showOnly="['Discover', 'Music', 'TV Shows', 'Movies', 'YouTube', 'Live TV', 'News', 'Kids', 'Categories', 'Open MP4...', 'Import from YouTube']"
          />
        </client-only>
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
      <Toggle v-model="transcriptMode" label="Transcript Mode">
        <i class="fas fa-align-left"></i>
      </Toggle>
      <Toggle v-model="collapsed" label="Collapse Video">
        <i class="fas fa-caret-square-up"></i>
      </Toggle>
      <Toggle v-model="autoPause" label="Auto-Pause">
        <i class="fas fa-hand"></i>
      </Toggle>
      <Toggle v-model="useSmoothScroll" label="Smooth Scrolling">
        <i class="fas fa-up-down"></i>
      </Toggle>
      <Toggle v-model="karaokeAnimation" label="Karaoke Highlighting">
        <i class="fa-sharp fa-solid fa-stars"></i>
      </Toggle>
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
          <span>{{ $t("Playback Speed: {speed}x", { speed }) }} (M)</span>
        </button>
      </div>
      <hr />
      <QuickSettings />
    </b-modal>
  </div>
</template>

<script>
import { toHHMMSS } from "../lib/date-helper";
import { shuffle, uniqueByValue } from "../lib/utils/array";
import { timeout } from "../lib/utils/timeout";

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
    mode: {
      default: "subtitles",
    },
    forceMode: {
      default: undefined,
    },
    skin: {
      default: "dark",
    },
    show: {
      type: Object,
    },
    fullscreen: {
      default: false,
    },
    showFullscreenModeToggle: {
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
    showPlayPauseButton: {
      // Whether to show a play/pause button
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
    episodeSort: {
      type: String,
      default: "title", // or '-views' or '-date'
    },
    largeEpisodeCount: {
      type: Number, // Mannually set the number of episode displayed in the episode navigator
    },
    initialTime: {
      type: Number,
      default: 0,
    },
    playlist: {
      type: Object,
    },
    size: {
      type: String,
      default: "regular", // or 'fullscreen' or 'mini'
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
      progressPercentage: 0,
      transcriptMode: false,
      karaokeAnimation: false,
      watcherActive: false,
      likePending: false,
    };
  },
  computed: {
    // assume there is a vuex store 'userLikes' with a getter liked(l2Id, videoId) that returns true if the user has liked the video
    liked() {
      return this.$store.getters["userLikes/liked"]({
        l2Id: this.$l2.id,
        videoId: this.video.id,
      });
    },
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
      this.loadSettings();
    }
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type === "settings/LOAD_JSON_FROM_LOCAL") {
        this.loadSettings();
      }
    });
    this.bindKeys();
  },
  beforeDestroy() {
    this.unbindKeys();
    this.unsubscribe();
  },
  watch: {
    liked() {
      this.likePending = false
    },
    initialTime() {
      this.currentTime = this.initialTime; // so that the progress bar updates at the start
    },
    $route() {
      this.hideInfoModal();
    },
    currentPercentage(newPercentage) {
      this.progressPercentage = newPercentage;
    },
    collapsed() {
      if (!this.watcherActive) return;
      this.$emit("updateCollapsed", this.collapsed);
    },
    transcriptMode() {
      if (!this.watcherActive) return;
      this.$emit("updateTranscriptMode", this.transcriptMode);
    },
    autoPause() {
      if (!this.watcherActive) return;
      this.$store.dispatch("settings/setGeneralSettings", {
        autoPause: this.autoPause,
      });
      this.$emit("updateAutoPause", this.autoPause);
    },
    useSmoothScroll(oldValue, newValue) {
      if (!this.watcherActive) return;
      this.$store.dispatch("settings/setGeneralSettings", {
        useSmoothScroll: this.useSmoothScroll,
      });
      this.$emit("updateSmoothScroll", this.useSmoothScroll);
    },
    karaokeAnimation(oldValue, newValue) {
      if (!this.watcherActive) return;
      this.$store.dispatch("settings/setGeneralSettings", {
        karaokeAnimation: this.karaokeAnimation,
      });
    },
  },
  methods: {
    shiftSubs(subsShift) {
      if (this.video.subs_l2 && this.video.subs_l2.length > 0) {
        for (let line of this.video.subs_l2) {
          line.starttime =  Number(line.starttime) + subsShift
        }
      }
      this.goToLine(this.currentLine);
      this.play();
    },
    toggleLike() {
      // dispatch a 'userLikes/like' action if this.liked is true
      // dispatch a 'userLikes/unlike' action if this.liked is false
      this.likePending = true
      if (this.liked) {
        this.$store.dispatch("userLikes/unlike", {
          l2Id: this.$l2.id,
          videoId: this.video.id,
        });
      } else {
        this.$store.dispatch("userLikes/like", {
          l2Id: this.$l2.id,
          videoId: this.video.id,
        });
      }
    },
    async loadSettings() {
      this.autoPause = this.$store.state.settings.autoPause;
      this.speed = this.$store.state.settings.speed || 1;
      this.useSmoothScroll = this.$store.state.settings.useSmoothScroll;
      this.transcriptMode = this.$store.state.settings.mode !== "subtitles";
      this.karaokeAnimation = this.$store.state.settings.karaokeAnimation;
      await timeout(5000);
      this.watcherActive = true;
    },
    bindKeys() {
      window.addEventListener("keydown", this.handleKeydown);
    },
    unbindKeys() {
      window.removeEventListener("keydown", this.handleKeydown);
    },
    handleKeydown(e) {
      {
        if (
          !["INPUT", "TEXTAREA"].includes(e.target.tagName.toUpperCase()) &&
          !e.metaKey &&
          !e.target.getAttribute("contenteditable")
        ) {
          if (["KeyI", "KeyE"].includes(e.code)) {
            this.showInfoModal();
            return false;
          }
          if (e.code === "KeyT") {
            this.toggleTranscriptMode();
            return false;
          }
          if (e.code === "KeyM") {
            this.toggleSpeed();
            return false;
          }
          if (e.code === "ArrowLeft" && e.shiftKey) {
            this.previous();
            return false;
          }
          if (e.code === "ArrowRight" && e.shiftKey) {
            this.next();
            return false;
          }
          if (e.code === "Space") {
            this.togglePaused();
            e.preventDefault(); // Prevent the default behavior
            return false;
          }
          if (["ArrowUp"].includes(e.code)) {
            this.goToPreviousLine();
            e.preventDefault(); // Prevent the default behavior
            return false;
          }
          if (["ArrowDown"].includes(e.code)) {
            this.goToNextLine();
            e.preventDefault(); // Prevent the default behavior
            return false;
          }
          // Option/Alt Arrow Left
          if (e.code === "ArrowLeft" && e.altKey) {
            this.rewind(2);
            return false;
          }
          // Option/Alt Arrow Right
          if (e.code === "ArrowRight" && e.altKey) {
            this.fastforward(2);
            return false;
          }
          if (["ArrowLeft"].includes(e.code) && !e.altKey) {
            this.goToPreviousLine();
            return false;
          }
          if (["ArrowRight"].includes(e.code) && !e.altKey) {
            this.goToNextLine();
            return false;
          }
          if (["KeyR"].includes(e.code)) {
            this.rewind(2);
            return false;
          }
          if (["KeyF"].includes(e.code)) {
            this.toggleFullscreen();
            return false;
          }
        }
      }
    },
    open() {
      this.$emit("open");
    },
    previous() {
      this.$emit("previous");
    },
    next() {
      this.$emit("next");
    },
    goToPreviousLine() {
      this.$emit("goToPreviousLine");
    },
    goToNextLine() {
      this.$emit("goToNextLine");
    },
    toggleFullscreen() {
      this.$emit("fullscreen", !this.fullscreen);
    },
    toHHMMSS(duration) {
      return toHHMMSS(duration);
    },
    onSeek() {
      let percentage = this.progressPercentage;
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
    togglePaused() {
      this.paused ? this.play() : this.pause();
    },
    toggleRepeatMode() {
      this.repeatMode = !this.repeatMode;
      this.$emit("updateRepeatMode", this.repeatMode);
    },
    toggleAudioMode() {
      this.audioMode = !this.audioMode;
      this.$emit("updateAudioMode", this.audioMode);
    },
    toggleTranscriptMode() {
      this.$emit("toggleTranscriptMode");
    },
    goToLine(line) {
      this.$emit("goToLine", line);
    },
    rewind(seconds) {
      // if seconds is not provided, rewind to the start
      this.$emit("rewind", seconds);
    },
    fastforward(seconds) {
      // if seconds is not provided, ignore
      if (seconds) this.$emit("fastforward", seconds);
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
@import "../assets/scss/variables.scss";
:deep(.youtube-videos) > * {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.video-with-transcript.mode-transcript:not(.size-mini) {
  &.aspect-portrait,
  &.collapsed {
    .video-controls.skin-dark {
      background: $bg-color-dark-1;
    }
    .video-controls.skin-light {
      background: white;
    }
  }
}

.video-controls.skin-light {
  .btn-video-controls {
    color: #333;
  }
  :deep(.vue-slider-rail) {
    background-color: rgba(black, 0.3);
  }
}

.video-controls.skin-dark {
  .btn-video-controls {
    color: #ccc;
  }
  .video-controls-progress {
    :deep(.vue-slider-rail) {
      background-color: rgba(black, 0.3);
    }
  }
}

.video-controls-buttons {
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  max-width: 40rem;
  margin: 0 auto;
  min-height: 3.75rem;
  .play-pause {
    font-size: 2.5em;
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
  padding: 2px 0;
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
.video-controls-progress {
  /* Change the progress color */
  :deep(.vue-slider-process) {
    background-color: $primary-color;
  }
  :deep(.vue-slider-rail) {
    height: 0.5rem;
  }
}
</style>
