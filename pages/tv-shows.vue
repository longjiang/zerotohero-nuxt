<router>
  {
    path: '/:l1/:l2/tv-shows',
    props: true
  }
</router>
<template>
  <div class="main container" id="main">
    <SocialHead
      v-if="shows && shows[0]"
      :title="`Learn ${$l2.name} with TV Shows | ${$l2.name} Zero to Hero`"
      :description="`Learn ${$l2.name} with TV shows.`"
      :image="`https://img.youtube.com/vi/${shows[0].youtube_id}/hqdefault.jpg`"
    />
    <div class="row">
      <div class="col-sm-12">
        <h3 class="text-center mt-5 mb-5">
          Study {{ $l2.name }} with {{ shows && shows.length ? shows.length : "" }} TV
          Shows
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
        <div class="tv-shows mb-5">
          <div
            :class="{ 'loader text-center': true, 'd-none': shows && shows.length > 1 }"
            style="flex: 1"
          >
            <div class="heartbeat-loader"></div>
          </div>
          <div
            class="tv-show media rounded shadow"
            v-for="show of shows"
            :key="`tv-show-${show.id}`"
          >
            <router-link
              class="youtube-thumbnail-wrapper aspect-wrapper d-block"
              :to="`/${$l1.code}/${
                $l2.code
              }/youtube/browse/all/all/0/${encodeURIComponent(show.title)}`"
            >
              <img
                :src="`//img.youtube.com/vi/${show.youtube_id}/hqdefault.jpg`"
                class="youtube-thumbnail aspect"
                v-lazy-load
              />
            </router-link>
            <div class="media-body">
              <router-link
                :to="`/${$l1.code}/${$l2.code}/youtube/browse/all/all/0/${show.title}`"
                class="link-unstyled"
              >
                <h6>
                  <Annotate>
                    <span>{{ show.title }}</span>
                  </Annotate>
                </h6>
                <b-button
                  v-if="$adminMode"
                  class="btn btn-small bg-danger text-white mt-2 ml-0"
                  @click.stop.prevent="remove(show)"
                >
                  <i class="fa fa-trash"></i>
                </b-button>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Config from "@/lib/config";
import Helper from "@/lib/helper";
import YouTube from "@/lib/youtube";
import axios from "axios";

export default {
  data() {
    return {
      shows: [],
      randomEpisodeYouTubeId: undefined,
    };
  },
  async mounted() {
    this.shows = this.$store.state.tvShows.shows
      ? this.$store.state.tvShows.shows[this.$l2.code]
      : undefined;
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type === "tvShows/LOAD_TV_SHOWS") {
        this.loadTVShows();
      }
    });
    this.randomEpisodeYouTubeId = await YouTube.getRandomEpisodeYouTubeId(
      this.$l2.code,
      this.$l2.id
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
    loadTVShows() {
      let shows = this.$store.state.tvShows.shows[this.$l2.code]
        ? this.$store.state.tvShows.shows[this.$l2.code]
        : undefined;
      if (shows) {
        this.shows = this.sortShows(shows);
      }
    },
    async remove(show) {
      try {
        let response = await axios.delete(
          `${Config.wiki}items/tv_shows/${show.id}`
        );
        if (response) {
          this.shows = this.shows.filter((s) => s !== show);
        }
      } catch (err) {
        // Directus bug
      }
    },
  },
};
</script>

<style scoped>
.tv-shows {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -1rem;
}
.tv-show {
  min-width: 12rem;
  max-width: calc(100% - 2rem);
  flex: 1;
  margin: 1rem;
}
@media (min-width: 768px) {
  .tv-show {
    max-width: calc(50% - 2rem);
  }
}
.tv-show-thumbnail {
  width: 100%;
  max-height: 270px;
  object-fit: cover;
}
</style>