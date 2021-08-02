<router>
  {
    path: '/:l1/:l2/live-tv',
    props: true
  }
</router>
<template>
  <div class="container main mt-5 mb-5">
    <LiveVideo v-if="currentChannel" :url="currentChannel.url" :key="`live-video-${currentChannel.tvgID}`"/>
    <div class="pt-2 pb-2" v-if="channels">
      <b-button
        variant="gray"
        size="sm"
        :class="{'channel-button': true, 'channel-button-current': currentChannel === channel}"
        v-for="channel in channels"
        :key="`channel-button-${channel.tvgID}`"
        @click="setChannel(channel)"
      >
        <img v-if="channel.logo" :src="channel.logo" :alt="channel.name" />
        <span v-else>{{ channel.name }}</span>
      </b-button>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Config from "@/lib/config";
import Papa from "papaparse";
import Helper from "@/lib/helper";

export default {
  data() {
    return {
      channels: undefined,
      currentChannel: undefined
    };
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
  async fetch() {
    let res = await axios.get(
      `${Config.server}data/live-tv-channels/${this.$l2["iso639-3"]}.csv.txt`
    );
    if (res && res.data) {
      let channels = Papa.parse(res.data, { header: true }).data;
      channels = Helper.uniqueByValue(channels, "tvgID");
      channels = channels.sort((a, b) => a.name.localeCompare(b.name, this.$l2.code));
      channels = channels.sort((a, b) =>
        a.logo === b.logo ? 0 : a.logo ? -1 : 1
      );
      this.channels = channels;
      if (channels[0]) this.currentChannel = channels[0]
    }
  },
  methods: {
    setChannel(channel) {
      this.currentChannel = channel
    }
  }
};
</script>

<style lang="scss" scoped>
.channel-button {
  &.channel-button-current {
    background-color: red;
  }
  img {
    height: 2rem;
    object-fit: contain;
  }
  margin-bottom: 0.5rem;
  margin-right: 0.5rem;
}
</style>