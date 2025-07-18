<template>
  <span>
    <slot></slot>
    <router-link
      v-if="href && !href.endsWith('undefined')"
      :to="youtubeRoute || {
        name: 'l1-l2-reader',
        params: { method: 'html-url', arg: absoluteURL(alt, href) },
      }"
      :title="title"
      class="btn btn-reader-link"
    >
      <i class="fa fa-link"></i>
    </router-link>
  </span>
</template>

<script>
import { absoluteURL } from "../lib/utils/url";

export default {
  props: {
    href: {
      type: String,
    },
    title: {
      type: String,
    },
    alt: {
      // the base url
      type: String,
      default: "",
    },
  },
  data() {
    return {
      hover: false,
    };
  },
  mounted() {},
  computed: {
    youtubeRoute() {
      try {
        const url = new URL(this.href, this.alt || window.location.origin);
        if (url.hostname.includes("youtube.com") || url.hostname.includes("youtu.be")) {
          let videoId = url.searchParams.get("v");
          if (!videoId && url.hostname.includes("youtu.be")) {
            videoId = url.pathname.slice(1);
          }
          if (videoId) {
            return {
              name: 'l1-l2-video-view-type',
              params: {
                type: 'youtube',
                youtube_id: videoId,
              },
            };
          }
        }
      } catch (e) {}
      return null;
    },
  },
  methods: {
    absoluteURL(...args) {
      return absoluteURL(...args);
    },
  },
};
</script>

<style lang="scss" scoped>
.btn-reader-link {
  background: none;
  color: #28a746ce;
  padding: 0;
  height: 1rem;
  line-height: 1rem;
  font-size: 0.6rem;
}
</style>