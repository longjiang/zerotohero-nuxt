<template>
  <container-query :query="query" v-model="params">
    <div class="youtube-channel-list">
      <client-only>
        <!-- Similar admin tools can be added here if necessary -->

        <div v-if="channels && channels.length" class="row" v-infinite-scroll="loadMore" infinite-scroll-distance="10">
          <div
            v-for="(channel) in channelsToShow"
            :key="channel.channel_id"
            :class="colClasses"
          >
            <ChannelCard v-bind="channel" />
          </div>
        </div>
        <router-link :to="{name: 'youtube-channels'}" v-if="collapse" class="btn btn-outline-success w-100">
          {{ $t('See All Channels') }}
          <i class="fa fa-chevron-right"></i>
        </router-link>
        <div v-observe-visibility="visibilityChanged" class="text-center" v-if="!collapse && channelsToShow.length < channels.length" >
          <Loader
            :sticky="true"
            :message="
              $t('Loading more channels...')
            "
            class="text-white"
          />
        </div>
      </client-only>
    </div>
  </container-query>
</template>

<script>
import ChannelCard from "./ChannelCard.vue";
import { ContainerQuery } from "vue-container-query";

export default {
  components: {
    ChannelCard,
    ContainerQuery,
  },
  props: {
    collapse: {
      type: Boolean,
      default: true,
    },
    channels: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      showAllChannels: false,
      limit: 0,           // For inifinite scroll
      channelsToShow: [], // For inifinite scroll
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
  mounted() {
    this.loadMore();
  },
  computed: {
    colClasses() {
      let classes = { };
      classes = {
        ...classes,
        "col-12": this.params.xs,
        "col-6": this.params.sm,
        "col-4": this.params.md,
        "col-3": this.params.lg || this.params.xl,
      };
      return classes;
    },
  },
  methods: {
    visibilityChanged(visible) {
      if (visible) {
        this.loadMore();
      }
    },
    loadMore() {
      const newLimit = this.params.xs ? 3 : this.params.sm ? 6 : 12;
      this.limit += newLimit;
      const sortedChannels = this.channels.sort((a, b) => b.video_count - a.video_count);
      this.channelsToShow = sortedChannels.slice(0, this.limit);
    }
  }
};
</script>

<style scoped>
.youtube-channel-list {
  /* Add any styles specific to this component here */
}
</style>
