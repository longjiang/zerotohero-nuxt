<template>
  <div class="loader-bg">
    <SocialHead
      title="Discover TV Shows Across Languages | Language Player"
      description="Watch TV shows across languages at random and be surprised!"
    />
    <div class="container">
      <div class="row">
        <div
          class="col-12 loader-wrapper"
        >
          <LazyDiscoverPlayer
            routeType="tv-shows"
            :shows="[]"
            style="flex: 1"
            :l1="$l1"
            :l2="$l2"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { randomInt, unique} from "../lib/utils";

export default {
  props: {
    type: {
      default: "tv-shows", // or 'talks'
    },
    l1: {
      type: String,
    },
    l2: {
      type: String,
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
  },
  methods: {
    async getLastShowId() {
      let key = this.type.replace("-", "_");
      let res = await this.$directus.get(
        `items/${key}?sort=-id&limit=1`
      );
      if (res && res.data && res.data.data && res.data.data[0]) {
        return res.data.data[0].id;
      }
    },
    generateRandomIds(max, count = 500) {
      let randIds = [];
      for (let i = 0; i < count; i++) {
        randIds.push(randomInt(max));
      }
      return unique(randIds);
    },
    async loadRandomShowsMatchingIds(ids, adminMode) {
      let response = await this.$directus.get(
        `items/tv_shows?filter${
          adminMode ? "" : "&filter[hidden][empty]=true"
        }&filter[id][in]=${ids.join(
          ","
        )}&timestamp=${
          adminMode ? Date.now() : 0
        }`
      );
      if (response && response.data) {
        return response.data.data;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.loader-wrapper {
  padding-top: 3rem;
  color: white;
}

.loader-bg {
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
}
</style>