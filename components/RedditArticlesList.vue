<template>
  <ul class="articles list-unstyled">
    <li v-for="article in articles" class="article-list-item collapsed">
      <a
        class="link-unstyled"
        :href="
          `/${$l1.code}/${$l2.code}/articles/reddit/view/${article.id},${encodeURIComponent(
            article.title
          )}`
        "
      >
        <RedditArticleCard :article="article" />
      </a>
    </li>
  </ul>
</template>

<script>
import $ from 'jquery'
import Config from '@/lib/config'
import Helper from '@/lib/helper'
import RedditArticleCard from '@/components/RedditArticleCard'

export default {
  components: {
    RedditArticleCard
  },
  props: {
    path: {
      type: String
    },
    edit: {
      default: false
    }
  },
  created() {
    let cacheLife = 3600 // clear cache every hour
    $.getJSON(
      `${Config.jsonProxy}?cache_life=${cacheLife}&url=https://www.reddit.com/${
        this.path
      }.json`,
      response => {
        this.articles = response.data.data.children.map(item => item.data)
      }
    )
  },
  data() {
    return {
      Config,
      Helper,
      articles: []
    }
  }
}
</script>

<style scoped></style>
