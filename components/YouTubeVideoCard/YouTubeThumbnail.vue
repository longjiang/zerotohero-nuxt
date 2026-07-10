<!-- /components/YouTubeVideoCard/YouTubeThumbnail.vue -->
<template>
  <div class="youtube-thumbnail-wrapper aspect-wrapper d-block">
    <router-link :to="to">
      <client-only>
        <b-progress
          class="youtube-video-card-progress"
          v-if="progress"
          :value="progress"
          :max="1"
        />
      </client-only>
      <img
        v-if="video.youtube_id"
        class="youtube-thumbnail aspect"
        ref="thumbnail"
        @load="$emit('thumbnailLoaded')"
        @error="$emit('thumbnailError')"
        :src="thumbnail"
      />
      <img
        v-else
        class="youtube-thumbnail aspect"
        ref="thumbnail"
        src="/img/placeholder-faded.png"
      />
    </router-link>

    <div class="duration" v-if="video.duration">
      {{ parseDuration(video.duration) }}
    </div>

    <div
      v-if="video.difficulty > 0 && levelByDifficulty(video.difficulty, $l2.code)"
      :data-bg-level="levelByDifficulty(video.difficulty, $l2.code)"
      class="level-tag"
    >
      {{ level(levelByDifficulty(video.difficulty, $l2.code), $l2).name }}
    </div>
  </div>
</template>

<script>
import { parseDuration, levelByDifficulty, level } from "@/lib/utils";

export default {
  components: {},
  props: {
    video: { type: Object, required: true },
    to: { type: Object, required: true },
    progress: { type: Number, default: null },
    view: { type: String, default: "grid" }, // not used directly but kept for consistency
  },
  computed: {
    thumbnail() {
      return (
        this.video.thumbnail ||
        `https://img.youtube.com/vi/${this.video.youtube_id}/hqdefault.jpg`
      );
    },
  },
  methods: {
    parseDuration,
    levelByDifficulty,
    level,
  },
};
</script>

<style lang="scss" scoped>
// Move styles for .youtube-thumbnail-wrapper, .add-to-playlist, .duration, .level-tag, .youtube-video-card-progress here
@import "../../assets/scss/variables.scss";

.youtube-thumbnail-wrapper {
  border-radius: 0.25rem;
  overflow: hidden;
  position: relative;
  // A very slight, soft drop shadow around the thumbnail wrapper
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); 

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

  .level-tag {
    position: absolute;
    top: 0.2rem;
    left: 0.2rem;
    font-size: 0.8rem;
    font-weight: bold;
    padding: 0.08rem 0.3rem;
    border-radius: 0.15rem;
    display: block;
    bottom: inherit;
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
    height: 0.3rem;
    border-radius: 0.15rem;
    :deep(.progress-bar) {
      background-color: #fd4f1c;
    }
  }
}
</style>