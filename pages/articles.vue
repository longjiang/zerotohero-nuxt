<template>
  <div>
    <h1>Articles</h1>
    <ul>
      <li v-for="article in articles" :key="article.slug">
        <nuxt-link :to="'/' + article.slug">{{ article.title }}</nuxt-link>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  async asyncData({ $content }) {
    const articles = await $content().sortBy('createdAt', 'desc').fetch()
    return { articles }
  }
}
</script>
