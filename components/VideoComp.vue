<template>
  <div class="video-wrapper play-button-wrapper">
    <button
      class="btn btn-unstyled play-button"
      v-if="!active"
      @click="active = true"
    >
      <i class="fa fa-play"></i>
    </button>
    <img
      v-if="!active"
      :src="thumbnail"
      class="video-screen"
      @click="active = true"
    />
    <client-only>
      <video :poster="thumbnail" controls v-if="active" autoplay="true">
        <source :src="url" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </client-only>
  </div>
</template>

<script>
export default {
  props: {
    url: {
      type: String,
    },
    thumbnail: {
      type: String,
    },
  },
  data() {
    return {
      active: false,
    };
  },
};
</script>

<style scoped>
.video-wrapper {
  width: 100%;
  position: relative;
}
.video-wrapper .video-screen {
  width: 100%;
}
.video-wrapper video {
  width: 100%;
  display: block;
}
</style>