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
            v-for="like in likedVideos.slice(0, visible)"
            :class="{
              'pb-4': true,
              'col-compact': params.xs,
              'col-6': params.xs || params.sm,
              'col-4': params.md,
              'col-3': params.lg || params.xl,
            }"
            :key="like.id"
          >
            <LazyYouTubeVideoCard
              :skin="skin === 'dark' ? 'dark' : 'card'"
              :video="Object.assign({}, like)"
              :showProgress="true"
              :showAdmin="false"
            />
          </div>
          <!-- Add an infinite scroll component here -->
          <div class="w-100 text-center py-5" v-if="!limit && likedVideos?.length > visible" v-observe-visibility="visibilityChanged">
            <div class="col-sm-12">
              <Loader
                  key="rec-loader"
                  :sticky="true"
                  :message="
                    $t('Loading...')
                  "
                />
            </div>
          </div>
        </div>
        <div class="row" v-else>
          <div class="col">
            {{ $t('No liked videos.') }}
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
    limit: {
      type: Number,
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
      visible: 50,
    };
  },
  computed: {
    likedVideos() {
      return this.$store.getters["userLikes/likedVideos"](this.$l2.id).sort((a, b) => b.created_on - a.created_on);
    },
  },
  methods: {
    visibilityChanged() {
      this.visible = this.visible + 50;
    },
  },
};
</script>
