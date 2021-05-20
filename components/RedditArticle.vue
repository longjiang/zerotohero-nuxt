<template>
  <div class="col-sm-12" v-if="article">
    <RedditArticleCard :article="article" />
    <div>
      <div class="mt-5 mb-5 p-5 text-center shadow">
        <p>
          To participate, go to reddit.com/<a
            :href="
              `https://www.reddit.com/${
                article.subreddit_name_prefixed
              }/comments/cpdv8t`
            "
            ><b>{{ article.subreddit_name_prefixed }}</b></a
          >
          directly.
        </p>
        <a
          :href="`https://www.reddit.com/r/ChineseLanguage/comments/cpdv8t`"
          class="btn btn-danger"
          >Go to r/ChineseLanguage</a
        >
      </div>

      <div v-for="comment in comments">
        <h6>{{ comment.author }}</h6>
        <Annotate :showTranslate="true">
          <div v-html="Helper.unescape(comment.body_html)"></div>
        </Annotate>
        <hr />
      </div>
    </div>
  </div>
</template>

<script>
import $ from 'jquery'
import Config from '@/lib/config'
import Helper from '@/lib/helper'
import RedditArticleCard from '@/components/RedditArticleCard'

export default {
  props: ['articleId'],
  components: {
    RedditArticleCard
  },
  data() {
    return {
      comments: [],
      article: undefined,
      Config,
      Helper
    }
  },
  methods: {},
  created() {
    let cacheLife = 3600 // clear cache every hour
    $.getJSON(
      `${
        Config.jsonProxy
      }?cache_life=${cacheLife}&url=https://www.reddit.com/comments/${
        this.articleId
      }/.json`,
      response => {
        let article = response.data[0].data.children[0].data
        this.article = article
        let comments = response.data[1].data.children.map(item => item.data)
        this.comments = comments
      }
    )
  }
}
</script>

<style scoped></style>
