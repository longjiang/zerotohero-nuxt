<router>
  {
    path: '/:l1/:l2/live-tv',
    props: true
  }
</router>
<template>
  <div class="container main mt-4 mb-5">
    <div class="row">
      <div class="col-sm-12 mb-4">
        <h4 class="text-center">Learn {{ $l2.name }} with Live TV</h4>
        <div v-if="channels" class="text-center">{{ channels.length }} Channel(s)</div>
      </div>
    </div>
    <div class="row">
      <div class="col-lg-8 live-video-column">
        <div class="live-tv-wrapper">
          <LiveVideo
            v-if="currentChannel"
            :url="currentChannel.url"
            :key="`live-video-${currentChannel.tvgID}`"
            ref="liveVideo"
          />
          <div v-if="currentChannel" class="pt-2 pb-2">
            <b>Channel:</b> {{ currentChannel.name }}
          </div>
        </div>
      </div>
      <div class="col-lg-4">
        <div class="pt-2 pb-2" v-if="channels">
          <b-button
            variant="gray"
            size="sm"
            :class="{
              'channel-button': true,
              'channel-button-current': currentChannel === channel,
            }"
            v-for="channel in channels"
            :key="`channel-button-${channel.tvgID}`"
            :data-tvg-id="channel.tvgID"
            @click="setChannel(channel)"
          >
            <img v-if="channel.logo" :src="channel.logo" :alt="channel.name" />
            <span>{{ channel.name }}</span>
          </b-button>
        </div>
      </div>
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
      currentChannel: undefined,
      bannedChannels: {
        'zh': ['CGTNZhongGuo.cn', 'CGTNDocumentaryZhongGuo.cn', 'CGTN.cn', 'JinRiELuoSi.cn', 'XinTangRenMeiXiPinDao.cn', 'YaTaiTai.cn']
      }
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
      channels = channels.filter(c => c.url)
      if (this.$l2.code in this.bannedChannels) {
        channels = channels.filter(c => !this.bannedChannels[this.$l2.code].includes(c.tvgID))
      }
      channels = channels.sort((a, b) =>
        a.name.localeCompare(b.name, this.$l2.code)
      );
      channels = channels.sort((a, b) =>
        a.logo === b.logo ? 0 : a.logo ? -1 : 1
      );
      this.channels = channels;
      if (channels[0]) this.currentChannel = channels[0];
    }
  },
  methods: {
    setChannel(channel) {
      this.currentChannel = channel;
    },
  },
};
</script>

<style lang="scss" scoped>
.live-video-column {
  position: sticky;
  top: 0;
  z-index: 1;
  background: white;
  .live-tv-wrapper {
    position: sticky;
    top: 0;
    z-index: 1;
    background: white;
  }
}
.channel-button {
  &.channel-button-current {
    background-color: #fd4f1c;
    color: white;
  }
  img {
    height: 2rem;
    width: 4rem;
    object-fit: contain;
    margin-right: 0.5rem;
  }
  width: 100%;
  text-align: left;
  margin-bottom: 0.5rem;
  margin-right: 0.5rem;
  padding-left: 0.2;
}
@media (min-width: 768px) and (max-width: 992px) {
  .channel-button {
    width: calc(50% - 0.25rem),
  }
  .channel-button:nth-child(even) {
    margin-right: 0;
  }
  
}
</style>