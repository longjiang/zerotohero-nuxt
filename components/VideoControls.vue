<template>
  <div v-if="video" class="quick-access-buttons">
    <button
      :class="{
        'quick-access-button shadow btn-secondary d-inline-block text-center': true,
        'btn-primary': showList,
      }"
      @click="showList = !showList"
    >
      <i class="fas fa-align-left"></i>
    </button>
    <button
      :class="{
        'quick-access-button shadow btn-secondary d-inline-block text-center': true,
        'btn-primary': speed !== 1,
      }"
      @click="toggleSpeed"
    >
      <i v-if="speed === 1" class="fas fa-tachometer-alt"></i>
      <span v-else style="font-size: 0.6em; display: block; line-height: 2.5em">
        {{ speed }}x
      </span>
    </button>
    <button
      class="
        quick-access-button
        shadow
        btn-secondary
        d-inline-block
        text-center
      "
      @click="$emit('goToPreviousLine')"
    >
      <i class="fas fa-arrow-up"></i>
    </button>
    <button
      :class="{
        'quick-access-button play-pause shadow d-inline-block text-center btn-primary': true,
      }"
      @click="togglePaused"
    >
      <i v-if="paused && !speaking" class="fas fa-play"></i>
      <i v-if="!paused || speaking" class="fas fa-pause"></i>
    </button>
    <button
      class="
        quick-access-button
        shadow
        btn-secondary
        d-inline-block
        text-center
      "
      @click="$emit('goToNextLine')"
    >
      <i class="fas fa-arrow-down"></i>
    </button>
    <button
      :class="{
        'quick-access-button shadow btn-secondary d-inline-block text-center': true,
        'btn-primary': repeatMode,
      }"
      @click="toggleRepeatMode"
    >
      <i class="fas fa-undo"></i>
    </button>
    <button
      :class="{
        'quick-access-button shadow btn-secondary d-inline-block text-center': true,
        'btn-primary': audioMode,
      }"
      @click="toggleAudioMode"
    >
      <i class="fas fa-headphones"></i>
    </button>
    <button
      v-if="showFullscreenToggle"
      :class="{
        'quick-access-button shadow btn-secondary d-inline-block text-center': true,
        'btn-primary': layout === 'vertical',
      }"
      @click="toggleFullscreenMode"
    >
      <i class="fas fa-expand"></i>
    </button>

    <div
      v-if="video"
      :class="{ 'youtube-view-line-list': true, 'd-none': !showList }"
    >
      <b-input-group class="youtube-view-line-list-filter-wrapper">
        <b-form-input
          v-model.lazy="filterList"
          placeholder="Filter"
        ></b-form-input>
        <b-input-group-append>
          <b-input-group-text v-if="!filterList" class="btn btn-primary">
            <i class="fas fa-filter"></i>
          </b-input-group-text>
          <b-input-group-text
            v-if="filterList"
            class="btn btn-primary"
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
          active:
            $refs.youtube &&
            $refs.youtube.$refs.transcript &&
            $refs.youtube.$refs.transcript.currentLine === line,
        }"
        :key="`video-line-list-${index}`"
        @click="
          $refs.youtube.goToLine(line);
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
      default: true
    },
    layout: {
      default: 'horizontal'
    },
    showFullscreenToggle: {
      default: true
    }
  },
  data() {
    return {
      showList: false,
      repeatMode: false,
      speed: 1,
      filterList: "",
      speaking: false,
      audioMode: false,
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

    sortedLines() {
      if (this.video && this.video.subs_l2) {
        console.log(
          `YouTube View: Sorting ${this.video.subs_l2.length} lines...`
        );
        let lines = this.video.subs_l2.map((line) => line);
        let sortedLines = lines.sort((a, b) =>
          a.line.localeCompare(b.line, this.$l2.code)
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
  methods: {
    togglePaused() {
      this.$emit('togglePaused')
    },
    toggleSpeed() {
      this.speed = this.speed === 1 ? 0.75 : this.speed === 0.75 ? 0.5 : 1
      this.$emit('updateSpeed', this.speed)
    },
    toggleRepeatMode() {
      this.repeatMode = !this.repeatMode
      this.$emit('updateRepeatMode', this.repeatMode)
    },
    toggleAudioMode() {
      this.audioMode = !this.audioMode
      this.$emit('updateAudioMode', this.audioMode)
    },
    toggleFullscreenMode() {
      this.$emit('toggleFullscreenMode')
    }
  }
};
</script>

<style>
.quick-access-buttons {
  position: sticky;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  background: black;
  padding: 0.5rem;
}

.quick-access-button.play-pause {
  width: 3.7rem;
  height: 3.7rem;
}

.quick-access-button {
  border-radius: 100%;
  width: 2.5rem;
  height: 2.5rem;
  line-height: 2.5rem;
  border: none;
  cursor: pointer;
  text-align: center;
  margin: 0 0.2rem;
  padding: 0;
}

@media (orientation: landscape) {
  .youtube-view-wrapper.fullscreen .quick-access-buttons {
    bottom: 0.8rem;
  }
}

.youtube-view-line-list {
  position: fixed;
  width: 20rem;
  max-height: calc(100vh - 15rem);
  overflow: scroll;
  border-radius: 0.3rem;
  background: white;
  z-index: 10;
  left: calc(50vw - 10rem);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.4);
  bottom: 6rem;
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