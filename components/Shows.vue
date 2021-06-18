<template>
  <div class="main container" id="main">
    <SocialHead
      v-if="shows && shows[0]"
      :title="`Learn ${$l2.name} with ${routeType === 'tv-shows' ? 'TV Shows' : 'Talks' } | ${$l2.name} Zero to Hero`"
      :description="`Learn ${$l2.name} with ${routeType === 'tv-shows' ? 'TV Shows' : 'Talks' }.`"
      :image="`https://img.youtube.com/vi/${shows[0].youtube_id}/hqdefault.jpg`"
    />
    <div class="row">
      <div class="col-sm-12">
        <h3 class="text-center mt-5 mb-5">
          Study {{ $l2.name }} with {{ shows && shows.length ? shows.length : "" }} {{ routeType === 'tv-shows' ? 'TV Shows' : 'Talks' }}
        </h3>
        <SimpleSearch
          class="mb-5"
          placeholder="Search"
          ref="searchLibrary"
          :random="`/${$l1.code}/${$l2.code}/youtube/view/${randomEpisodeYouTubeId}`"
          :action="
            (url) => {
              this.$router.push({
                path: `/${$l1.code}/${
                  $l2.code
                }/youtube/browse/all/all/0/${encodeURIComponent(url)}`,
              });
            }
          "
        />
        <div class="mb-5">
          <ShowList :shows="shows" :type="type" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Helper from "@/lib/helper";
import YouTube from "@/lib/youtube";

export default {
  props: {
    routeType: String
  },
  data() {
    return {
      type: this.routeType === 'tv-shows' ? 'tvShows' : 'talks',
      shows: [],
      randomEpisodeYouTubeId: undefined,
    };
  },
  async mounted() {
    this.shows = this.$store.state.shows[this.type]
      ? this.$store.state.shows[this.type][this.$l2.code]
      : undefined;
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type.startsWith("shows")) {
        this.loadShows();
      }
    });
    this.randomEpisodeYouTubeId = await YouTube.getRandomEpisodeYouTubeId(
      this.$l2.id,
      'tv_show'
    );
  },
  beforeDestroy() {
    // you may call unsubscribe to stop the subscription
    this.unsubscribe();
  },
  computed: {
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
    $adminMode() {
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
    },
  },
  methods: {
    sortShows(shows) {
      shows =
        shows.sort((x, y) => x.title.localeCompare(y.title, this.$l2.code)) ||
        [];
      return Helper.uniqueByValue(shows, "youtube_id");
    },
    loadShows() {
      let shows = this.$store.state.shows[this.type][this.$l2.code]
        ? this.$store.state.shows[this.type][this.$l2.code]
        : undefined;
      if (shows) {
        this.shows = this.sortShows(shows);
      }
    },
  },
};
</script>

<style scoped>
</style>