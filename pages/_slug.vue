<template>
  <div>
    <SocialHead
      :title="page.title"
      description="Discover in-depth information and insights on this topic. Perfect for those looking to deepen their understanding."
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
              <h1 class="mt-1 mb-4 text-center">{{ page.title }}</h1>
              <nuxt-content :document="page" />
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
  async asyncData({ $content, params }) {
    const page = await $content(params.slug).fetch();
    return {
      page,
    };
  },
  computed: {
    background,
  },
};
</script>

<style lang="scss" scoped>

$multiplier: 1.1067;

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

h2 {
  font-size: 1rem * $multiplier;
}

:deep(h1) {
  font-size: 1rem * $multiplier * $multiplier * $multiplier * $multiplier * $multiplier;
  margin: 2rem 0 1rem 0;
}

:deep(h2) {
  font-size: 1rem * $multiplier * $multiplier * $multiplier * $multiplier;
  margin: 2rem 0 1rem 0;
}

:deep(h3) {
  font-size: 1rem * $multiplier * $multiplier * $multiplier;
}

:deep(h4) {
  font-size: 1rem * $multiplier * $multiplier;
}

:deep(h5) {
  font-size: 1rem * $multiplier;
}

</style>
