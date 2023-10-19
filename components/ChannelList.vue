<template>
  <container-query :query="query" v-model="params">
    <div class="youtube-channel-list">
      <client-only>
        <!-- Similar admin tools can be added here if necessary -->

        <div v-if="channels && channels.length" class="row">
          <div
            v-for="(channel, channelIndex) in displayedChannels"
            :key="channel.channel_id"
            class="mb-4"
            :class="colClasses"
          >
            <ChannelCard v-bind="channel" />
          </div>
        </div>
        <b-button variant="outline-success" @click="showAllChannels = !showAllChannels" class="w-100">
          {{ $t(!showAllChannels ? 'Show More Top Channels' : 'Collapse') }}
          <i class="fa fa-chevron-down" :class="{ 'fa-chevron-up': showAllChannels }"></i>
        </b-button>
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
    channels: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      showAllChannels: false,
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
    colClasses() {
      let classes = { "pb-3": true };
      classes = {
        ...classes,
        "col-compact": this.params.xs,
        "col-12": this.params.xs || this.params.sm,
        "col-6": this.params.md,
        "col-4": this.params.lg || this.params.xl,
      };
      return classes;
    },
    displayedChannels() {
      if (this.showAllChannels) return this.channels;
      return this.channels.slice(0, 6); // Displaying only 3 rows of channels
    },
  },
};
</script>

<style scoped>
.youtube-channel-list {
  /* Add any styles specific to this component here */
}
</style>
