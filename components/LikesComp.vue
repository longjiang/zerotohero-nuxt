<template>
  <container-query :query="query" v-model="params">
  <div>
    <div class="container">
      <div class="row">
        <div class="col-sm-12 text-center mb-4">
          <h5>{{ $t('Liked Videos') }}</h5>
        </div>
      </div>
      <div class="row" v-if="likedVideos && likedVideos.length">
        <div
          v-for="like in likedVideos"
          :class="{
            'pb-4': true,
            'col-compact': params.xs,
            'col-6': params.xs || params.sm,
            'col-4': params.md,
            'col-3': params.lg || params.xl,
          }"
          :key="like.id"
          v-observe-visibility="{
            callback: (isVisible, entry) =>
              onVisibilityChange(isVisible, entry, like),
          }"
        >

          <LazyYouTubeVideoCard
            :skin="skin === 'dark' ? 'dark' : 'card'"
            :video="Object.assign({}, like.video)"
            :showProgress="true"
            :showAdmin="false"
          />
        </div>

        
      </div>
      <div class="row" v-else>
        <div class="col">
          No likes found.
        </div>
      </div>
    </div>
  </div>
  </container-query>
</template>

<script>
import { ContainerQuery } from "vue-container-query";
export default {
  props: {
    skin: {
      default: "light",
    },
  },
  components: {
    ContainerQuery,
  },
  data() {
    return {
      params: {},
      query: {
        xs: {
          minWidth: 0,
          maxWidth: 423,
        },
        sm: {
          minWidth: 423,
          maxWidth: 720,
        },
        md: {
          minWidth: 720,
          maxWidth: 960,
        },
        lg: {
          minWidth: 960,
          maxWidth: 1140,
        },
        xl: {
          minWidth: 1140,
        },
      },
    };
  },
  computed: {
    likedVideos() {
      return this.$store.getters["userLikes/likedVideos"](this.$l2.id);
    },
  },
  async mounted() {
    // await this.fetchLikes();
  },
  methods: {
    onVisibilityChange(isVisible, entry, like) {
      if (isVisible) {
        console.log(`Visible. Fetching video details for ${like.video_id}`);
        this.$store.dispatch("userLikes/fetchVideoDetails", {
          l2Id: this.$l2.id,
          videoId: like.video_id,
        });
      } else {
        console.log("not visible");
      }
    },
  },
};
</script>
