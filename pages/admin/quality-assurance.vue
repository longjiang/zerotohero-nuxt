<router>
  {
    path: '/:l1/:l2/admin/quality-assurance',
    props: true
  }
</router>
<template>
  <div class="main">
    <div class="container pt-5">
      <div class="row">
        <div :class="{ 'col-sm-12 mb-5': true }">
          <h1>Quality Assurance Checklist</h1>
          <h2>General Routes</h2>
          <ul>
            <li v-for="route in generalRoutes" :key="route">
              <nuxt-link :to="route">{{ route }}</nuxt-link>
            </li>
          </ul>
          <h2>Language Specific Routes</h2>
          <ul>
            <li v-for="route in languageSpecificRoutes" :key="route">
              <nuxt-link :to="route">{{ route }}</nuxt-link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      generalRoutes: [
        "/compare-languages",
        "/dashboard",
        "/forgot-password",
        "/go-pro",
        "/go-pro-success",
        "/language-icons",
        "/language-map",
        "/login",
        "/logout",
        "/password-reset",
        "/phonological-features",
        "/register",
        "/stats",
        "/translators",
      ],
      languageSpecificRoutes: [
        "/zh/ko/explore-media",
        "/zh/ja/youtube/browse",
        "/zh/ja/tv-shows",
        "/zh/ja/set-content-preferences",
        "/zh/ja/profile",
        "/zh/ja/phrasebooks",
        "/zh/ja/my-text",
        "/zh/ja/learning-path",
        "/zh/ja/explore-media",
        "/zh/ja/dictionary",
        "/zh/ja/contact-us",
        "/zh/fr/set-language-level",
        "/zh/fr/set-content-preferences",
        "/zh/fr/explore-media",
        "/zh/en/youtube/search",
        "/zh/en/youtube/browse",
        "/zh/en/video-view/youtube",
        "/zh/en/tv-shows",
        "/zh/en/show/tv-show",
        "/zh/en/settings",
        "/zh/en/set-language-level",
        "/zh/en/set-content-preferences",
        "/zh/en/saved-words",
        "/zh/en/resource/list",
        "/zh/en/profile",
        "/zh/en/phrasebooks",
        "/zh/en/phrasebook/478",
        "/zh/en/online-courses",
        "/zh/en/my-text",
        "/zh/en/learning-path",
        "/zh/en/explore-media",
        "/zh/en/epub",
        "/zh/en/dictionary",
        "/zh/en/contact-us",
        "/zh/en/bookshelf",
        "/zh/en/books",
        "/zh/de/set-language-level",
        "/zh/de/set-content-preferences",
        "/zh/de/explore-media",
        "/en/zh/youtube/view",
        "/en/zh/youtube/search",
        "/en/zh/youtube/history",
        "/en/zh/youtube/browse",
        "/en/zh/video-view/youtube",
        "/en/zh/tv-shows/all",
        "/en/zh/tv-shows",
        "/en/zh/show/tv-show",
        "/en/zh/settings",
        "/en/zh/set-language-level",
        "/en/zh/set-content-preferences",
        "/en/zh/saved-words",
        "/en/zh/resource/list",
        "/en/zh/reader",
        "/en/zh/profile",
        "/en/zh/phrasebooks",
        "/en/zh/phrasebook/452",
        "/en/zh/online-courses",
        "/en/zh/my-text",
        "/en/zh/lesson-videos/5",
        "/en/zh/learning-path",
        "/en/zh/learn/hsk",
        "/en/zh/grammar",
        "/en/zh/explore/levels",
        "/en/zh/explore-media",
        "/en/zh/epub",
        "/en/zh/dictionary",
        "/en/zh/contact-us",
        "/en/zh/books",
        "/en/ru/explore-media",
        "/en/ko/explore-media",
        "/en/ja/tv-shows",
        "/en/ja/set-content-preferences",
        "/en/ja/profile",
        "/en/ja/my-text",
        "/en/ja/explore-media",
        "/en/ja/dictionary",
        "/en/hi/explore-media",
        "/en/fr/explore-media",
        "/en/es/explore-media",
        "/en/en/tv-shows",
        "/en/en/set-language-level",
        "/en/en/set-content-preferences",
        "/en/en/my-text",
        "/en/en/explore-media",
        "/en/en/dictionary",
        "/en/de/explore-media",
      ],
    };
  },
};
</script>
