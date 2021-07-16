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
      @click="speed = speed === 1 ? 0.75 : speed === 0.75 ? 0.5 : 1"
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
      @click="$refs.youtube.$refs.transcript.goToPreviousLine()"
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
      @click="$refs.youtube.$refs.transcript.goToNextLine()"
    >
      <i class="fas fa-arrow-down"></i>
    </button>
    <button
      :class="{
        'quick-access-button shadow btn-secondary d-inline-block text-center': true,
        'btn-primary': repeatMode,
      }"
      @click="repeatMode = !repeatMode"
    >
      <i class="fas fa-undo"></i>
    </button>
    <button
      :class="{
        'quick-access-button shadow btn-secondary d-inline-block text-center': true,
        'btn-primary': audioMode,
      }"
      @click="audioMode = !audioMode"
    >
      <i class="fas fa-headphones"></i>
    </button>
    <button
      :class="{
        'quick-access-button shadow btn-secondary d-inline-block text-center': true,
        'btn-primary': layout === 'vertical',
      }"
      @click="layout = layout === 'horizontal' ? 'vertical' : 'horizontal'"
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
    }
  },
  data() {
    return {
      showList: false,
      layout: "horizontal",
      repeatMode: false,
      speed: 1,
    }
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
  }
};
</script>

<style>
</style>