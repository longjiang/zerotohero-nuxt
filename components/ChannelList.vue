<template>
  <container-query :query="query" v-model="params">
    <div class="youtube-channel-list">
      <client-only>
        <!-- Similar admin tools can be added here if necessary -->

        <div v-if="channels && channels.length" class="row">
          <div
            v-for="(channel) in displayedChannels"
            :key="channel.channel_id"
            :class="colClasses"
          >
            <ChannelCard v-bind="channel" />
          </div>
        </div>
        <b-button v-if="collapse" variant="outline-success" @click="showAllChannels = !showAllChannels" class="w-100">
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
    displayedChannels() {
      if (this.showAllChannels || !this.collapse) return this.channels;
      const limit = this.params.xs ? 3 : this.params.sm ? 6 : 12;
      return this.channels.slice(0, limit); // Displaying only 3 rows of channels
    },
  },
};
</script>

<style scoped>
.youtube-channel-list {
  /* Add any styles specific to this component here */
}
</style>
