<template>
  <article :class="`updown article media skin-${$skin}`">
    <img
      v-if="article.thumbnail && article.thumbnail.startsWith('http')"
      :src="article.thumbnail"
      class="mr-2"
    />
    <div class="media-body">
      <client-only>
        <h5 class="article-title">
          <Annotate :buttons="true">
            <span>{{ article.title }}</span>
          </Annotate>
        </h5>
        <div class="article-body">
          <Annotate :buttons="true"><div v-html="article.body" /></Annotate>
        </div>
      </client-only>
      <a
        v-if="edit"
        :href="`${DIRECTUS_ADMIN_URL}collections/articles/${article.id}`"
        class="btn btn-default"
        target="_blank"
      >
        Edit
      </a>
    </div>
  </article>
</template>

<script>
import Helper from "@/lib/helper";

const DIRECTUS_ADMIN_URL = 'https://directusvps.zerotohero.ca/admin/#/'

export default {
  props: ["article", "edit", "social"],
  data() {
    return {
      DIRECTUS_ADMIN_URL
    };
  },
  methods: {
    unescape(escapedHTML) {
      return Helper.unescape(escapedHTML);
    },
    stripTags(html) {
      return Helper.stripTags(html);
    },
  },
};
</script>

<style>
</style>
