<template>
  <div v-if="video" class="quick-access-buttons">
    <!-- <button
      v-if="showLineList"
      :class="{
        'quick-access-button   text-center': true,
        'quick-access-button-active': showList,
      }"
      @click="showList = !showList"
    >
      <i class="fas fa-align-left"></i>
    </button> -->
    <button
      v-if="showCollapse"
      :class="{
        'quick-access-button quick-access-button-collapse text-center': true,
      }"
      @click="toggleCollapsed"
    >
      <i class="fas fa-caret-square-up" v-if="!collapsed"></i>
      <i class="fas fa-caret-square-down" v-if="collapsed"></i>
    </button>
    <button
      :class="{
        'quick-access-button quick-access-button-rewind text-center': true,
      }"
      @click="rewind"
    >
      <i class="fas fa-undo"></i>
    </button>
    <button
      v-if="episodes"
      :disabled="!previousEpisode"
      class="quick-access-button quick-access-button-previous text-center"
      @click="$emit('previous')"
    >
      <i class="fas fa-step-backward"></i>
    </button>
    <button
      class="quick-access-button quick-access-button-previous-line text-center"
      @click="$emit('goToPreviousLine')"
    >
      <i v-if="layout === 'horizontal'" class="fas fa-arrow-up"></i>
      <i v-else class="fas fa-chevron-left"></i>
    </button>
    <button
      :class="{
        'quick-access-button quick-access-button-play play-pause text-center': true,
      }"
      @click="togglePaused"
    >
      <i v-if="paused && !speaking" class="fas fa-play"></i>
      <i v-if="!paused || speaking" class="fas fa-pause"></i>
    </button>
    <button
      class="quick-access-button quick-access-button-next-line text-center"
      @click="$emit('goToNextLine')"
    >
      <i v-if="layout === 'horizontal'" class="fas fa-arrow-down"></i>
      <i v-else class="fas fa-chevron-right"></i>
    </button>
    <button
      v-if="episodes"
      :disabled="!nextEpisode"
      class="quick-access-button quick-access-button-next text-center"
      @click="$emit('next')"
    >
      <i class="fas fa-step-forward"></i>
    </button>
    <!-- <button
      :class="{
        'quick-access-button   text-center': true,
        'quick-access-button-active': repeatMode,
      }"
      @click="toggleRepeatMode"
    >
      <i class="fas fa-sync-alt"></i>
    </button>
    <button
      :class="{
        'quick-access-button   text-center': true,
        'quick-access-button-active': audioMode,
      }"
      @click="toggleAudioMode"
    >
      <i class="fas fa-headphones"></i>
    </button> -->
    <button
      :class="{
        'quick-access-button  quick-access-button-speed text-center': true,
        'quick-access-button-active': speed !== 1,
      }"
      @click="toggleSpeed"
    >
      <i v-if="speed === 1" class="fas fa-tachometer-alt"></i>
      <span v-else>{{ speed }}x</span>
    </button>
    <button
      v-if="showFullscreenToggle"
      :class="{
        'quick-access-button quick-access-button-fullscreen text-center': true,
        'quick-access-button-active': layout === 'vertical',
      }"
      @click="toggleFullscreenMode"
    >
      <i class="fas fa-expand"></i>
    </button>

    <div
      v-if="video && showLineList"
      :class="{ 'youtube-view-line-list': true, 'd-none': !showList }"
    >
      <b-input-group class="youtube-view-line-list-filter-wrapper">
        <b-form-input
          v-model.lazy="filterList"
          placeholder="Filter"
        ></b-form-input>
        <b-input-group-append>
          <b-input-group-text
            v-if="!filterList"
            class="btn quick-access-button-active"
          >
            <i class="fas fa-filter"></i>
          </b-input-group-text>
          <b-input-group-text
            v-if="filterList"
            class="btn quick-access-button-active"
            @click="filterList = ''"
          >
            <i class="fas fa-times"></i>
          </b-input-group-text>
        </b-input-group-append>
      </b-input-group>
      <div
        v-for="(line, index) in sortedLines"
        :class="{
          'youtube-view-line-list-item': true,
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
</template>

<script>
export default {
  props: {
    video: {
      default: undefined,
    },
    paused: {
      default: true,
    },
    layout: {
      default: "horizontal",
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
    episodes: {
      type: Array,
    },
  },
  data() {
    return {
      showList: false,
      repeatMode: false,
      speed: 1,
      filterList: "",
      speaking: false,
      audioMode: false,
      sortedLines: undefined,
      collapsed: false,
      currentLine: undefined,
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
    episodeIndex() {
      return this.episodes.findIndex(
        (e) => e.youtube_id === this.video.youtube_id
      );
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
  },
  mounted() {
    if (this.showLineList) {
      this.sortedLines = this.getSortedLines();
    }
  },
  methods: {
    togglePaused() {
      this.$emit("togglePaused");
    },
    toggleSpeed() {
      let speeds = [1, 0.75, 0.5];
      let index = speeds.findIndex((s) => s === this.speed);
      if (index > -1) {
        index = index + 1;
        if (index === speeds.length) index = 0;
      }
      this.speed = speeds[index];
      this.$emit("updateSpeed", this.speed);
    },
    toggleRepeatMode() {
      this.repeatMode = !this.repeatMode;
      this.$emit("updateRepeatMode", this.repeatMode);
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

.quick-access-buttons {
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(black 0%, black 66%, transparent 100%);
}

.quick-access-button {
  border: none;
  padding: 0.5rem;
  background: none;
  color: #ccc;
  margin: 0 0.2rem;
  &:disabled {
    color: #cccccc44;
  }
}

.quick-access-button-active {
  color: #fd4f1c;
}

.quick-access-button.play-pause {
  font-size: 1.5em;
}

@media (orientation: landscape) {
  .youtube-view-wrapper.fullscreen .quick-access-buttons {
    bottom: 0.8rem;
  }
}

.youtube-view-line-list {
  overflow: scroll;
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
  .youtube-view-line-list {
    max-height: calc(100vh - 50vw * 9 / 16 - 2rem);
  }
}

.youtube-view-line-list .youtube-view-line-list-item {
  padding: 0.2rem 0.7rem;
}

.youtube-view-line-list-item {
  cursor: pointer;
}

.youtube-view-line-list-item.active {
  background-color: #eee;
}

.youtube-view-line-list-filter-wrapper {
  padding: 0.25rem;
  background: white;
  width: calc(100% - 0.5rem);
  position: sticky;
  top: 0;
}
</style>