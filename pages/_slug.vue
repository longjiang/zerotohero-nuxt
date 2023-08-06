<template>
  <article>
    <h1>{{ page.title }}</h1>
    <nuxt-content :document="page" />
  </article>
</template>

<script>
export default {
  async asyncData({ $content, params }) {
    const page = await $content(params.slug || "index").fetch();

    return {
      page,
    };
  },
};
</script>
