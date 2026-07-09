<!-- /components/YouTubeVideoCard/SubtitleDropZone.vue -->
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
    <!-- No subs badge -->
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
        {{ $t("NO SUBS") }}
      </span>
    </div>

    <!-- Slot for the actual card content -->
    <slot />
  </drop>
</template>

<script>
import { Drop } from "vue-drag-drop";

export default {
  components: { Drop },
  props: {
    video: { type: Object, required: true },
    checkSubs: { type: Boolean, default: false },
    generated: { type: Boolean, default: false },
    // .sync for over
    over: { type: Boolean, default: false },
  },
  methods: {
    handleDrop(data, event) {
      event.preventDefault();
      const file = event.dataTransfer.files[0];
      this.$emit("drop-file", file);
    },
  },
};
</script>

<style lang="scss" scoped>
// Move the .youtube-video-card-wrapper and .no-subs-badge styles here
// (copy from original <style> that belongs to this wrapper)
@import "../../assets/scss/variables.scss";

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
  }
  &.drop.over {
    border: 2px dashed #ccc;
  }
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
</style>