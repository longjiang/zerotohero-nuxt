<router>
  {
    path: '/:l1/:l2/video-view/:type/:youtube_id?/:lesson?',
    props: true,
    meta: {
      skin: 'dark',
      // collapseNav: true
    },
  }
</router>
<template>
  <div class="video-view-page">
    <VideoViewComp v-bind="{ type, youtube_id, lesson }" />
  </div>
</template>

<script>
export default {
  props: {
    type: {
      type: String, // One of 'youtube' and 'bring-your-own'
    },
    youtube_id: {
      type: String,
      required: false,
    },
    lesson: {
      type: String, // If the video is a "lesson video" (with lesson vocab highlighted), set this to "lesson"
      required: false,
    },
  },
};
</script>

<style>
</style>