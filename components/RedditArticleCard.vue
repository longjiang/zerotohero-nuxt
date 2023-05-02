<template>
  <article :class="`updown article skin-${$skin}`">
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
import { unescape, stripTags } from "@/lib/utils";

export default {
  props: ["article"],
  data() {
    return {};
  },
  methods: {
    unescape(escapedHTML) {
      return unescape(escapedHTML);
    },
    stripTags(html) {
      return stripTags(html);
    },
  },
  created() {},
};
</script>

<style lang="scss" scoped>
.updown {
  display: flex;
}

.updown-head {
  flex: 0;
  text-align: center;
  padding: 1rem;
  background: #ff370011;
}

.updown-body {
  flex: 1;
}

.media-body {
  background: #ffffff11;
}
</style>
