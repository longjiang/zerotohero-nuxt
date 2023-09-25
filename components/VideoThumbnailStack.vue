<template>
  <div class="video-thumbnail-stack" @mouseenter="startCycling" @mouseleave="stopCycling">
    <div
      :class="{
        'tv-show-card': true,
        [`skin-${$skin}`]: true,
      }"
    >
      <router-link
        class="youtube-thumbnail-wrapper aspect-wrapper d-block"
        :to="to"
      >
        <img
          :src="currentThumbnail"
          class="youtube-thumbnail aspect"
        />
      </router-link>
      <div class="tv-show-card-title">
        <router-link :to="to" class="link-unstyled">
          <h6 class="mb-0">
            {{ title }}
            <slot name="afterTitle"></slot>
          </h6>
        </router-link>
        <slot name="belowTitle"></slot>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    to: {
      type: [Object, String],
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    count: {
      type: Number,
    },
    description: {
      type: String,
    },
    videos: {
      type: Array,
    },
  },
  data() {
    return {
      currentThumbnail: this.thumbnail, // For cycling thumbnails upon hover
      interval: null,
    };
  },
  methods: {
    cycleThumbnails() {
      // Cycle through the thumbnails upon hover, every 300ms
      const thumbnails = this.videos.map((video) => `https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`);
      const index = thumbnails.indexOf(this.currentThumbnail);
      const nextIndex = index === thumbnails.length - 1 ? 0 : index + 1;
      this.currentThumbnail = thumbnails[nextIndex];
    },
    startCycling() {
      this.cycleThumbnails();
      this.interval = setInterval(this.cycleThumbnails, 300);
    },
    stopCycling() {
      clearInterval(this.interval);
    },
  },
};
</script>
<style lang="scss" scoped>
.youtube-thumbnail-wrapper {
  position: relative;
  z-index: 2;
  margin-bottom: 0.5rem;
  .youtube-thumbnail {
    box-shadow: 3px 3px 6px #000c;
  }
  &::before,
  &::after {
    content: "";
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 0.25rem;
    background: #b3b0b0; // Change it to the desired color or add a background image
    // Dark shadow for a stacking effect
    box-shadow: 3px 3px 6px #000c;
  }

  &::before {
    bottom: -3px;
    right: -3px;
    z-index: -1;
  }

  &::after {
    bottom: -6px;
    right: -6px;
    z-index: -2;
  }
}

.video-thumbnail-stack {
  position: relative;
}


:deep(.media-body) {
  font-size: 0.9em;
}
.tv-show-card {
  position: relative;
  height: 100%;
  margin-bottom: 1rem;

  &.tv-show-card-hidden {
    opacity: 0.3;
  }

  .youtube-thumbnail {
    border-radius: 0.25rem;
  }

  .tv-show-card-title {
    padding-top: 0.5rem;

    a {
      z-index: 1;
      width: 100%;
    }
  }
}
</style>