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
import { unique, logError } from "@/lib/utils";

export default {
  computed: {
  },
  data() {
    return {
      videos: undefined,
    };
  },
  async mounted() {
    try {
      let res = await this.$directus.get(
        `items/unavailable_videos?fields=youtube_id,l2,created_on&sort=-created_on&timestamp=${Date.now()}`
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
      let reportedLanguages = unique(reports.map((r) => r.l2));
      let dbTablesOfReportedLanguages = unique(
        reportedLanguages.map((l) => this.$directus.youtubeVideosTableName(l))
      );
      let videos = [];

      for (let table of dbTablesOfReportedLanguages) {
        let url = `${table}?filter[youtube_id][in]=${reportedYouTubeIds}&fields=id,youtube_id,title,tv_show,talk,l2`;
        try {
          let res = await this.$directus.get(url);
          if (res && res.data) videos = videos.concat(res.data.data);
        } catch (err) {
          logError(err);
        }
      }
      return videos;
    },
  },
};
</script>

<style>
</style>