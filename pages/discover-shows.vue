<router>
  {
    path: '/discover-shows/:type?',
    props: true,
    meta: {
      layout: 'full'
    }
  }
</router>
<template>
  <div>
    <SocialHead
      title="Discover TV Shows Across Languages | PanLingo"
      description="Watch TV shows across languages at random and be surprised!"
    />
    <div class="container-fluid">
      <div
        class="row bg-dark text-white pt-2 pb-2 text-left"
        style="overflow: visible; height: 54px"
      >
        <div class="col-sm-12 d-flex" style="overflow: visible">
          <div class="mr-3 d-flex align-items-center" >
            <router-link to="/" class="link-unstyled">
              <i class="fa fa-chevron-left mr-2"></i>Home
            </router-link>
          </div>
        </div>
      </div>
      <div class="row">
        <div
          class="col-12 loader-wrapper"
          style="height: calc(100vh - 54px); padding: 0"
        >
          <LazyDiscoverPlayer
            v-if="randomShows"
            routeType="tv-shows"
            :shows="randomShows"
            style="flex: 1"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Config from "@/lib/config";
import Helper from "@/lib/helper";
export default {
  props: {
    type: {
      default: "tv-shows", // or 'talks'
    },
  },
  data() {
    return {
      lastShowId: undefined,
      limit: 500,
      randomShows: undefined,
    };
  },
  computed: {
    english() {
      return this.$languages.l1s.find((language) => language.code === "en");
    },
    $adminMode() {
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
    },
  },
  async mounted() {
    let lastShowId = await this.getLastShowId();
    this.lastShowId = lastShowId;
    let randomIds = this.generateRandomIds(lastShowId, 100);
    let randomShows = await this.loadRandomShowsMatchingIds(randomIds, this.adminMode);
    this.randomShows = randomShows
  },
  methods: {
    async getLastShowId() {
      let key = this.type.replace("-", "_");
      let res = await axios.get(
        `${Config.wiki}items/${key}?filter[title][nin]=Movies,Music,News&sort=-id&limit=1`
      );
      if (res && res.data && res.data.data && res.data.data[0]) {
        return res.data.data[0].id
      }
    },
    generateRandomIds(max, count = 500) {
      let randIds = [];
      for (let i = 0; i < count; i++) {
        randIds.push(Helper.randomInt(max));
      }
      return Helper.unique(randIds);
    },
    async loadRandomShowsMatchingIds(ids, adminMode) {
      let response = await axios.get(
        `${Config.wiki}items/tv_shows?filter${
          adminMode ? "" : "&filter[hidden][empty]=true"
        }&filter[id][in]=${ids.join(
          ","
        )}&filter[title][nin]=Movies,Music,News&timestamp=${
          adminMode ? Date.now() : 0
        }`
      );
      if (response && response.data) {
        return response.data.data
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.loader-wrapper {
  background: rgba(0, 0, 0, 0.66);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  color: white;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>