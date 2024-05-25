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
              callback: (isVisible, entry) => onVisibilityChange(isVisible, entry, like),
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
import debounce from "lodash/debounce";

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
      visibleVideoIds: new Set(),
    };
  },
  computed: {
    likedVideos() {
      return this.$store.getters["userLikes/likedVideos"](this.$l2.id).sort((a, b) => b.id - a.id);
    },
  },
  methods: {
    onVisibilityChange(isVisible, entry, like) {
      if (isVisible) {
        this.visibleVideoIds.add(like.video_id);
      } else {
        this.visibleVideoIds.delete(like.video_id);
      }
      this.debouncedFetchVideoDetails();
    },
    fetchVideoDetails() {
      if (this.visibleVideoIds.size > 0) {
        this.$store.dispatch("userLikes/fetchMultipleVideoDetails", {
          l2Id: this.$l2.id,
          videoIds: Array.from(this.visibleVideoIds),
        });
      }
    },
    debouncedFetchVideoDetails: debounce(function() {
      this.fetchVideoDetails();
    }, 300),
  },
};
</script>
