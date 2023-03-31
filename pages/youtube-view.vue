<router>
  {
    path: '/:l1/:l2/youtube/view/:youtube_id?/:lesson?',
    props: true,
    meta: {
      skin: 'dark',
      // collapseNav: true
    },
  }
</router>
<template>
  <div class="youtube-view-page">
    <VideoViewComp :youtube_id="youtube_id" :lesson="lesson" />
  </div>
</template>

<script>
export default {
  props: {
    youtube_id: {
      type: String,
      required: true,
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