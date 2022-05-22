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
          <h3 class="text-center mb-4">Unavailable Videos</h3>
          <div class="mt-5 mb-5 text-center" v-if="!videos"><Loader :sticky="true" message="Resolving videos" /></div>
          <YouTubeVideoList
            v-if="videos"
            :videos="videos"
            :multilingual="true"
            :checkSubs="false"
          />
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
      videos: undefined,
    };
  },
  async mounted() {
    try {
      let res = await this.$authios.get(
        `${Config.wiki}items/unavailable_videos?fields=youtube_id,l2,created_on&sort=-created_on&timestamp=${Date.now()}`
      );
      if (res) {
        let reports = res.data.data;
        let videos = await this.resolveReports(reports);
        this.videos = videos;
      }
    } catch (err) {}
  },
  methods: {
    async resolveReports(reports) {
      let reportedYouTubeIds = reports.map((r) => r.youtube_id);
      let reportedLanguages = Helper.unique(reports.map((r) => r.l2));
      let dbTablesOfReportedLanguages = Helper.unique(
        reportedLanguages.map((l) => Config.youtubeVideosTableName(l))
      );
      let videos = [];

      for (let table of dbTablesOfReportedLanguages) {
        let url = `${table}?filter[youtube_id][in]=${reportedYouTubeIds}&fields=id,youtube_id,title,tv_show,talk,l2`;
        try {
          let res = await this.$authios.get(url);
          if (res && res.data) videos = videos.concat(res.data.data);
        } catch (err) {
          console.log(err);
        }
      }
      return videos;
    },
  },
};
</script>

<style>
</style>