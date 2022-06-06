<router>
  {
    path: '/:l1/:l2/youtube/view/:youtube_id?/:lesson?',
    props: true,
    meta: {
      skin: 'dark',
      collapseNav: true
    },
  }
</router>
<template>
  <div>
    <YouTubeViewComp :youtube_id="youtube_id" :lesson="lesson" :starttime="starttime" />
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
  data() {
    return {
      starttime: 0
    }
  },
  mounted() {
    this.starttime = this.$route.query.t ? Number(this.$route.query.t) : 0;
  }
};
</script>

<style>
</style>