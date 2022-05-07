<router>
  {
    path: '/:l1/:l2/all-media',
    props: true,
    meta: {
      skin: 'dark'
    }
  }
</router>
<template>
  <div class="main-dark pb-5">
    <div class="container">
      <SocialHead :title="`Learn ${$l2.name} with Videos | ${$l2.name} Zero to Hero`"
        :description="`Learn ${$l2.name} with Videos`" :image="'/img/tv-shows.jpg'" />
      <div class="row">
        <div class="col-sm-12">
          <!-- <Sale class="mt-5 mb-5" v-if="$l2.code === 'zh'" /> -->
          <div v-if="tvShows && tvShows.length > 0">
            <h3 class="text-center mt-5 mb-4">
              TV Shows
            </h3>
            <ShowList :shows="random(tvShows, 3)" type="tvShows" :key="`tv-shows`" />
            <b-button variant="ghost-dark d-block w-100">More TV Shows <i class="fas fa-chevron-right ml-1"
                style="opacity: 0.5"></i></b-button>
          </div>
          <div v-if="talks && talks.length > 0">
            <h3 class="text-center mt-5 mb-4">
              YouTube Channels
            </h3>
            <ShowList :shows="random(talks, 3)" type="talks" :key="`tv-shows`" />
            <b-button variant="ghost-dark d-block w-100">More YouTube Channels <i class="fas fa-chevron-right ml-1"
                style="opacity: 0.5"></i></b-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Helper from '@/lib/helper'

export default {
  data() {
    return {
      tvShows: undefined,
      talks: undefined
    };
  },
  async fetch() {
    this.tvShows = this.$store.state.shows['tvShows'][this.$l2.code]
    this.talks = this.$store.state.shows['talks'][this.$l2.code]
  },
  async mounted() {
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type.startsWith("shows")) {
        this.loadShows();
      }
    });
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
    loadShows() {
      this.tvShows = this.$store.state.shows['tvShows'][this.$l2.code]
      this.talks = this.$store.state.shows['talks'][this.$l2.code]
    },
    random(array, max) {
      let shuffled = Helper.shuffle(array)
      return shuffled.slice(0, max)
    }
  },
};
</script>

<style lang="scss" scoped>
.zerotohero-wide {
  .shows {
    padding-left: 2rem;
    padding-right: 2rem;
  }
}

@media (max-width: 576px) {
  .show-list-wrapper {
    max-width: 423px;
    margin: 0 auto;
  }
}

::v-deep .synced-transcript {
  height: 5rem;
  overflow: hidden;
}
</style>