// components/ChannelList.vue
<template>
  <container-query :query="query" v-model="params">
    <div class="youtube-channel-list">
      <client-only>
        <!-- Similar admin tools can be added here if necessary -->

        <div v-if="channels && channels.length" class="row">
          <div
            v-for="(channel) in channelsToShow"
            :key="channel.channel_id"
            :class="colClasses"
          >
            <ChannelCard :channel_id="channel.channel_id" />
          </div>
        </div>
        <router-link :to="{name: 'l1-l2-youtube-channels'}" v-if="collapse" class="btn btn-outline-success w-100">
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
      limit: 0,           
      channelsToShow: [], 
      params: {},
      query: {
        xs: { minWidth: 0, maxWidth: 423 },
        sm: { minWidth: 423, maxWidth: 720 },
        md: { minWidth: 720, maxWidth: 960 },
        lg: { minWidth: 960, maxWidth: 1140 },
        xl: { minWidth: 1140 },
      },
    };
  },
  mounted() {
    this.resetAndLoad();
  },
  watch: {
    // CRITICAL: Watcher ensures that typing into the string filter variable 
    // forces channelsToShow to recalculate from index 0 of the new subset array length.
    channels: {
      handler() {
        this.resetAndLoad();
      },
      deep: true
    }
  },
  computed: {
    colClasses() {
      return {
        'pb-4': true,
        "col-12": this.params.xs,
        "col-6": this.params.sm,
        "col-4": this.params.md,
        "col-3": this.params.lg || this.params.xl,
      };
    },
  },
  methods: {
    visibilityChanged(visible) {
      if (visible) {
        this.loadMore();
      }
    },
    // Extracted index pointer reset functionality out of basic lifecycle mounting routines
    resetAndLoad() {
      const initialStep = this.params.xs ? 3 : this.params.sm ? 6 : 12;
      this.limit = this.collapse ? initialStep : initialStep * 3;
      this.loadMore(true);
    },
    loadMore(isReset = false) {
      if (!isReset) {
        const newLimit = this.params.xs ? 3 : this.params.sm ? 6 : 12;
        this.limit += newLimit;
      }
      
      // Perform fallback safe array allocations checking context states
      const channelsArray = this.channels ? [...this.channels] : [];
      
      const sortedChannels = channelsArray.sort((a, b) => {
        const aValue = a.video_count * (a.subscribers > 0 ? a.subscribers : 0);
        const bValue = b.video_count * (b.subscribers > 0 ? b.subscribers : 0);
        return bValue - aValue;
      });
      
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
