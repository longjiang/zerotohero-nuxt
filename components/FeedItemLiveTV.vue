<template>
  <div :class="`feed-item feed-item-video feed-item-${skin}`">
    <div class="top-part pt-4 pr-4 pl-4 pb-2">
      <div class="show-type-wrapper small text-success">
        <span class="show-type-icon">
          <i class="fas fa-satellite-dish"></i>
        </span>
        <span class="show-type ml-1">{{ $t('Live TV') }}</span>
      </div>
      <router-link :to="to" class="text-white">
        <h5 class="show-title mt-1">
          {{ channel.name }}
        </h5>
      </router-link>
    </div>
    <div class="youtube-thumb">
      <router-link :to="to" class="aspect-wrapper play-button-wrapper d-block" style="background: black">
        <div class="btn btn-unstyled play-button">
          <i class="fa fa-play"></i>
        </div>
        <img :src="channel.logo" alt="" class="aspect channel-logo" />
      </router-link>
    </div>
    <div class="bottom-part pt-3 pr-4 pl-4 pb-4">
      <div class="text-success">
        <span class="mr-2">#{{ channel.category.toLowerCase().split(',').join('&nbsp;&nbsp;#') }}</span>
        <span>#{{ channel.countries.toLowerCase().split(',').join('&nbsp;&nbsp;#') }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import DateHelper from "@/lib/date-helper";

export default {
  props: {
    l1: undefined,
    l2: undefined,
    showLanguage: {
      default: false,
    },
    showProgress: {
      default: false,
    },
    skin: {
      default: "light", // or 'dark'
    },
    channel: {
      type: Object,
    },
  },
  data() {
    return {};
  },
  computed: {
    to() {
      let to = {
        name: "live-tv",
        query: {
          tvgID: this.channel.tvgID,
        },
      };
      return to;
    },
    $adminMode() {
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
    },
  },
  async mounted() {},
  watch: {},
  methods: {
    formatDate(date) {
      return DateHelper.formatDate(date);
    },
  },
};
</script>

<style lang="scss" scoped>
.channel-logo {
  max-width: 100%;
  max-height: 100%;
}
</style>
