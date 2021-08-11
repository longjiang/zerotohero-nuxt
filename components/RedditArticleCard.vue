<template>
  <article class="updown article">
    <div class="updown-head">
      <i class="fa fa-arrow-up" />
      <div>{{ article.ups }}</div>
      <i class="fa fa-arrow-down" />
    </div>
    <div class="updown-body media">
      <img
        v-if="article.post_hint === 'image'"
        :src="article.url"
        class="img-fluid"
      />
      <video
        v-if="article.post_hint === 'hosted:video'"
        :src="article.media.reddit_video.fallback_url"
        class="img-fluid"
        :autoplay="article.media.reddit_video.is_gif"
        :loop="article.media.reddit_video.is_gif"
        preload="auto"
      ></video>
      <div class="media-body">
        <Annotate tag="h4" class="article-title" :buttons="true">
          <h4>{{ article.title }}</h4>
        </Annotate>
        <div
          v-if="article.media && article.media.oembed"
          v-html="unescape(article.media.oembed.html)"
        ></div>
        <client-only>
          <Annotate tag="div" class="article-body" :buttons="true">
            <div v-html="unescape(article.selftext_html)" />
          </Annotate>
        </client-only>
      </div>
    </div>
  </article>
</template>

<script>
import Helper from "@/lib/helper";

export default {
  props: ["article"],
  data() {
    return {};
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
  },
  methods: {
    unescape(escapedHTML) {
      return Helper.unescape(escapedHTML);
    },
    stripTags(html) {
      return Helper.stripTags(html);
    },
  },
  created() {},
};
</script>

<style>
.updown {
  display: flex;
}

.updown-head {
  flex: 0;
  text-align: center;
  padding: 1rem;
  background: #fff0ec;
}

.updown-body {
  flex: 1;
}
</style>
