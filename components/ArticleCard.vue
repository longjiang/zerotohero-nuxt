<template>
  <article class="updown article media">
    <img
      v-if="article.thumbnail && article.thumbnail.startsWith('http')"
      :src="article.thumbnail"
      class="mr-2"
    />
    <div class="media-body">
      <Annotate tag="h5" class="article-title" :showTranslate="true">
        <span>{{ article.title }}</span>
      </Annotate>
      <Annotate tag="div" class="article-body" :showTranslate="true">
        <div v-html="article.body" />
      </Annotate>
      <a
        v-if="edit"
        :href="`${Config.wikiAdmin}collections/articles/${article.id}`"
        class="btn btn-default"
        target="_blank"
      >
        Edit
      </a>
    </div>
  </article>
</template>

<script>
import Config from "@/lib/config";
import Helper from '@/lib/helper'

export default {
  props: ["article", "edit", "social"],
  data() {
    return {
      Config,
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
  },
  methods: {
    unescape(escapedHTML) {
      return Helper.unescape(escapedHTML)
    },
    stripTags(html) {
      return Helper.stripTags(html)
    }
  },
};
</script>

<style>
</style>
