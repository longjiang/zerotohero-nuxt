<template>
  <div>
    <SocialHead
      title="Articles | Language Player"
      description="Explore our collection of articles to enhance your language learning journey. From tips and tricks to deep dives into linguistic nuances."
    />
    <div
      class="zerotohero-background"
      :style="`background-image: url(${background})`"
    />
    <div class="gradient-backdrop"></div>
    <div class="gradient-backdrop-2"></div>
    <div
      class="container-fluid safe-padding-bottom mt-5"
    >
      <div class="container">
        <div class="row index-section">
          <div class="col-md-12">
            <div :class="`home-card skin-${$skin} p-4`">
              <h2 class="mt-1 mb-4 text-center">{{ $tb("Articles on Languages") }}</h2>
              <ul class="article-list">
                <li v-for="article in articles" :key="article.slug">
                  <nuxt-link :to="'/' + article.slug">
                    {{ article.title }} <i class="fas fa-chevron-right"></i>
                  </nuxt-link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- [More sections if needed, similar to your homepage] -->
      </div>
    </div>
  </div>
</template>

<script>
import { background } from "@/lib/utils/background";
export default {
  async asyncData({ $content }) {
    const articles = await $content().sortBy("createdAt", "desc").fetch();
    return { articles };
  },
  computed: {
    background,
  },
};
</script>

<style lang="scss" scoped>

.article-list {
  list-style: none;
  padding: 0;

  li {
    margin-bottom: 1rem;
    font-size: 1.2rem;
  }

  a {
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
}

</style>
