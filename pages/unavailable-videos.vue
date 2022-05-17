<router>
  {
    path: '/:l1/:l2/unavailable-videos'
  }
</router>
<template>
  <div class="main">
    <div class="container pt-5 mb-5">
      <div class="row">
        <div class="col-sm-12">
          <h3>Unavailable Videos</h3>
          <YouTubeVideoList :videos="videos" />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Helper from "@/lib/helper";
import Config from "@/lib/config";

export default {
  computed: {
    $l1() {
      return this.$store.state.settings.l1;
    },
    $l2() {
      return this.$store.state.settings.l2;
    },
  },
  data() {
    return {
      videos: [],
    };
  },
  async mounted() {
    let res = await axios.get(`${Config.wiki}items/unavailable_videos`);
    if (res) {
      let videos = res.data.data;
      this.videos = videos;
    }
  },
  methods: {},
};
</script>

<style>
</style>